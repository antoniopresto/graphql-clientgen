export const query = {
  PostFindMany: (config?: any) => `
        query PostFindMany($filter: Filter){
            PostFindMany(filter: $filter){
                ${parseFragmentConfig(
                  `_id
                        title
                        updatedAt
                        createdAt`,
                  config
                )}
            }
        }`,

  echo: (config?: any) => `
        query echo($text: String!){
                ${parseFragmentConfig(`echo(text: $text)`, config)}
        }`,

  PostCreateOne: (config?: any) => `
        mutation PostCreateOne($title: String!){
            PostCreateOne(title: $title){
                ${parseFragmentConfig(`recordId`, config)}
            }
        }`
};

export type Maybe<T> = T | null;

/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  JSON: any;
};

export type Filter = {
  title?: Maybe<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  PostCreateOne?: Maybe<PostCreateOnePayload>;
};

export type MutationPostCreateOneArgs = {
  title: Scalars['String'];
};

export type Post = {
  __typename?: 'Post';
  _id: Scalars['String'];
  title: Scalars['String'];
  updatedAt?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['String']>;
};

export type PostCreateOnePayload = {
  __typename?: 'PostCreateOnePayload';
  record: Post;
  recordId: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  PostFindMany?: Maybe<Array<Maybe<Post>>>;
  echo?: Maybe<Scalars['String']>;
};

export type QueryPostFindManyArgs = {
  filter?: Maybe<Filter>;
};

export type QueryEchoArgs = {
  text: Scalars['String'];
};

import { parseContextInfo, ParsedContextInfo } from './Store';

export enum OpKind {
  mutation = 'mutation',
  query = 'query'
  // subscription = 'subscription', // TODO
}

export enum Actions {
  // 1
  // when a query fetch will be queued, use to handle loading states
  // this action is called for each query that will be added to a
  // batch of queries
  willQueue = 'willQueue',

  // 2 - never called if abort is called
  // when the fetch is started can be used to update requestConfig
  // to update loading state use willQueue, because initFetch
  // will be called only one time for a batch of queries
  initFetch = 'initFetch',

  // 2 or never
  // called when one query in a batch of queries is aborted, probably because
  // the query is already cached or have one identical query in progress
  abort = 'abort',

  // 3 - never called if aborted
  // called when fetch ends - called for a batch of queries, to handle
  // each query independently, you should listen to the 'complete' action
  completeFetch = 'completeFetch',

  // 4 - never called if aborted
  // called when one query is completed (but not aborted) - with success or not
  // to handle when a query completes even if the result comes from the cache,
  // you should listen to 'abort' too
  complete = 'complete',

  // 5 - called when a query is removed from cache
  clearQuery = 'clearQuery'
}

export type Context<V = any, R = any> = {
  requestConfig: RequestInit;
  variables: V;
  fetcherConfig: FetcherConfig<V, R>;
  action: Actions;
  errors?: string[];
  result?: R | null;
  querySuffix?: string;
};

export type Middleware<V = any, R = any> = (
  config: Context<V, R>
) => Promise<Context<V, R>>;

export type FetcherConfig<V, R> = {
  url: string;
  headers?: { [key: string]: string };
  query: string;
  entityName?: string;
  schemaKey?: string;
  middleware?: Middleware<V, R>[] | Middleware<V, R>;
  fragment?: string;
  appendToFragment?: string;
  querySuffix?: string;
  cache?: boolean;
  ignoreCached?: boolean;
  redoQueriesNumber?: number;
  kind: OpKind;
};

type Resolver = (r: ReturnType<Middleware<any>>) => void;

type QueueItem = {
  resolver: Resolver | null;
  variables: Dict;
  kind: 'mutation' | 'query';
  config: FetcherConfig<any, any>;
};

export type GraphQLClientConfig = {
  url?: string;
  middleware?: Middleware | Middleware[];
};

export class GraphQLClient {
  url = '/graphql';
  middleware: Middleware<any>[] = [];

  private queryBachTimeout!: any; //NodeJS.Timer;
  private mutationBachTimeout!: any; //NodeJS.Timer;

  private mutationQueue: QueueItem[] = [];
  private queryQueue: QueueItem[] = [];

  private queueLimit = 20;
  private timeoutLimit = 50;

  constructor(config: GraphQLClientConfig) {
    // apply global client instance middleware
    if (config.middleware) {
      const _instanceMiddleware = applyMiddleware(
        ensureArray(config.middleware)
      );

      this.middleware = [
        function instanceMiddleware(ctx: Context<any, any>) {
          return _instanceMiddleware(ctx);
        }
      ];
    }

    if (config.url) {
      this.url = config.url;
    }
  }

  private fetchQueue = (queue: QueueItem[], kind: OpKind) => {
    let batchMiddleware: Middleware<any>[] = [];
    let headers: Dict = {};
    let finalQueryBody = '';
    let finalQueryHeader = '';
    let finalVariables: Dict = {};
    let resolverMap: { [key: string]: QueueItem } = {};

    queue.forEach((childQuery, childQueryIndex) => {
      const qiKey = `${kind}_${childQueryIndex}`;
      let qiQuery = childQuery.config.query;

      resolverMap[qiKey] = childQuery;

      if (childQuery.config.middleware) {
        const m = ensureArray(childQuery.config.middleware);
        batchMiddleware = batchMiddleware.concat(m);
      }

      if (childQuery.config.middleware) {
        headers = { ...headers, ...childQuery.config.headers };
      }

      if (childQuery.variables) {
        Object.keys(childQuery.variables).forEach(k => {
          finalVariables[`${k}_${childQueryIndex}`] = childQuery.variables[k];
        });
      }

      // We will pass all batched queries in the body of one main query
      // The variables of the child queries will give new names in the
      // following format: "originalName" + "_" + childQueryIndex
      const firstQueryLine = qiQuery.trim().split('\n')[0];
      const variablesMatch = firstQueryLine.match(/\((.*)\)/);
      if (variablesMatch) {
        // if this child batched query has variables
        variablesMatch[1]
          .split(',')
          .map(pair =>
            pair
              .trim()
              .split(':') // will generate '["$varName", "GQLType"]
              .map(e => e.trim())
          )
          .forEach(pair => {
            const nname = `${pair[0]}_${childQueryIndex}`;
            finalQueryHeader += ` ${nname}: ${pair[1]} `;

            // regex to replace "$varName" with "$varName" + '_' + index
            // resulting in a varName like: "$varName_0"
            const reg = new RegExp('\\' + pair[0], 'mg');

            qiQuery = qiQuery.replace(reg, nname);
          });
      }

      finalQueryBody +=
        `\n ${qiKey}: ` +
        qiQuery
          .trim()
          .split('\n')
          .slice(1, -1) // remove query declaration line and closing tag
          .join('\n') +
        '\n';
    });

    if (finalQueryHeader) {
      // if this child query has variables
      finalQueryHeader = `(${finalQueryHeader})`;
    }

    const query = `${kind} ${finalQueryHeader} {
      ${finalQueryBody}
    }`;

    this.queryFetcher<any, any>(finalVariables, {
      url: this.url,
      query,
      middleware: batchMiddleware,
      kind
    }).then(ctx => {
      Object.keys(resolverMap).forEach(key => {
        const { resolver, config, variables } = resolverMap[key];
        if (!resolver) return;
        const middleware = applyMiddleware(ensureArray(config.middleware));

        resolver(
          middleware({
            ...ctx,
            result: ctx.result ? ctx.result[key] : null,
            action: Actions.complete,
            variables,
            fetcherConfig: config,
            querySuffix: key
          })
        );
      });
    });
  };

  exec = async <V, R>(
    _variables: V,
    _config: FetcherConfig<V, R>
  ): Promise<Context<V, R>> => {
    const { kind } = _config;

    if (kind !== OpKind.mutation && kind !== OpKind.query) {
      throw new Error(`invalid kind of operation: ${kind}`);
    }

    const fetcherConfig = {
      ..._config,
      url: this.url,
      middleware: [...this.middleware, ...ensureArray(_config.middleware)]
    };

    const context = await applyMiddleware(fetcherConfig.middleware as [])({
      requestConfig: {},
      variables: _variables,
      fetcherConfig,
      action: Actions.willQueue
      // errors?: string[];
      // result?: R | null;
      // querySuffix?: string;
    });

    if (context.action === Actions.abort) {
      // applying middleware because listeners should be able
      // to listen to 'abort' action
      return applyMiddleware(fetcherConfig.middleware as [])(context);
    }

    let queueItem: QueueItem = {
      config: context.fetcherConfig,
      resolver: null,
      variables: _variables,
      kind
    };

    const promise = new Promise<Context<V, R>>(r => {
      queueItem.resolver = r;
    });

    if (kind === OpKind.query) {
      this.queryQueue.push(queueItem);

      const fulfill = () => {
        let queue = [...this.queryQueue];
        this.queryQueue = [];
        this.fetchQueue(queue, kind);
      };

      clearTimeout(this.queryBachTimeout);
      this.queryBachTimeout = setTimeout(fulfill, this.timeoutLimit);

      if (this.queryQueue.length >= this.queueLimit) {
        fulfill();
      }
    } else if (kind === OpKind.mutation) {
      this.mutationQueue.push(queueItem);

      const fulfill = () => {
        let queue = [...this.mutationQueue];
        this.mutationQueue = [];
        this.fetchQueue(queue, kind);
      };

      clearTimeout(this.mutationBachTimeout);
      this.mutationBachTimeout = setTimeout(fulfill, this.timeoutLimit);

      if (this.mutationQueue.length >= this.queueLimit) {
        fulfill();
      }
    }

    return promise;
  };

  methods: Methods = {
    PostFindMany: (variables, config) => {
      return this.exec(variables, {
        url: this.url,
        entityName: 'Post',
        schemaKey: 'PostFindMany',
        query: query.PostFindMany(config),
        kind: OpKind.query,
        ...config
      });
    },

    echo: (variables, config) => {
      return this.exec(variables, {
        url: this.url,
        entityName: 'String',
        schemaKey: 'echo',
        query: query.echo(config),
        kind: OpKind.query,
        ...config
      });
    },

    PostCreateOne: (variables, config) => {
      return this.exec(variables, {
        url: this.url,
        entityName: 'PostCreateOnePayload',
        schemaKey: 'PostCreateOne',
        query: query.PostCreateOne(config),
        kind: OpKind.mutation,
        ...config
      });
    }
  };

  methodsInfo: MethodsInfo = {
    PostFindMany: {
      type: '[Post]',
      schemaKey: 'PostFindMany',
      entityName: 'Post',
      isList: true,
      argsTSName: 'QueryPostFindManyArgs',
      returnTSName: "Query['PostFindMany']",
      isMutation: false,
      isQuery: true,
      isSubscription: false,
      field: {
        description: null,
        deprecationReason: null,
        type: '[Post]',
        args: [{ name: 'filter', description: null, type: 'Filter' }],
        name: 'PostFindMany',
        isDeprecated: false
      },
      isNonNull: false,
      kind: 'query'
    },

    echo: {
      type: 'String',
      schemaKey: 'echo',
      entityName: 'String',
      isList: false,
      argsTSName: 'QueryEchoArgs',
      returnTSName: "Query['echo']",
      isMutation: false,
      isQuery: true,
      isSubscription: false,
      field: {
        description: null,
        deprecationReason: null,
        type: 'String',
        args: [{ name: 'text', description: null, type: 'String!' }],
        name: 'echo',
        isDeprecated: false
      },
      isNonNull: false,
      kind: 'query'
    },

    PostCreateOne: {
      type: 'PostCreateOnePayload',
      schemaKey: 'PostCreateOne',
      entityName: 'PostCreateOnePayload',
      isList: false,
      argsTSName: 'MutationPostCreateOneArgs',
      returnTSName: "Mutation['PostCreateOne']",
      isMutation: true,
      isQuery: false,
      isSubscription: false,
      field: {
        description: null,
        deprecationReason: null,
        type: 'PostCreateOnePayload',
        args: [{ name: 'title', description: null, type: 'String!' }],
        name: 'PostCreateOne',
        isDeprecated: false
      },
      isNonNull: false,
      kind: 'mutation'
    }
  };

  queryFetcher = async <Variables, Return>(
    variables: Variables,
    fetcherConfig: FetcherConfig<Variables, Return>
  ): Promise<Context<Variables, Return>> => {
    let requestConfig: RequestInit = {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...fetcherConfig.headers
      }
    };

    const middleware: Middleware<Variables, Return> =
      typeof fetcherConfig.middleware === 'function'
        ? fetcherConfig.middleware
        : applyMiddleware(ensureArray(fetcherConfig.middleware));

    const context = await middleware({
      requestConfig,
      variables,
      fetcherConfig,
      action: Actions.initFetch,
      querySuffix: fetcherConfig.querySuffix
    });

    if (context.action === Actions.abort) {
      return context;
    }

    context.requestConfig.body = JSON.stringify({
      query: context.fetcherConfig.query,
      variables: context.variables
    });

    return fetch(context.fetcherConfig.url, context.requestConfig)
      .then(async response => {
        const contentType = response.headers.get('Content-Type');
        const isJSON =
          contentType && contentType.startsWith('application/json');

        if (!isJSON) {
          const fetchError = await response.text();

          return middleware({
            ...context,
            result: null,
            action: Actions.completeFetch,
            errors: [fetchError]
          });
        }

        let { errors, data } = await response.json();

        if (errors && !Array.isArray(errors)) {
          errors = [errors];
        }

        if (errors) {
          errors = errors.map((e: any) =>
            e && e.message ? e.message : JSON.stringify(e)
          );
        }

        return middleware({
          ...context,
          errors,
          action: Actions.completeFetch,
          result: data
            ? fetcherConfig.schemaKey
              ? data[fetcherConfig.schemaKey]
              : data
            : null
        });
      })
      .catch(err => {
        return middleware({
          ...context,
          errors: [err],
          action: Actions.completeFetch,
          result: null
        });
      });
  };
}

// compose(f, g, h) is identical to doing (...args) => f(g(h(...args))).
function compose(funcs: Middleware<any>[]) {
  if (!Array.isArray(funcs) || funcs.length === 0) {
    return (arg => Promise.resolve(arg)) as Middleware<any>;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce((a, b) => async context => {
    return await a(await b(context));
    // return await a(await b(cloneDeep(context)));
  });
}

export function parseFragmentConfig(fragment: string, config?: any): string {
  let resultingFragment = fragment || '';

  if (config) {
    if (config.fragment) {
      resultingFragment += `\n ${config.fragment}`;
    }

    if (config.appendToFragment) {
      resultingFragment += `\n ${config.appendToFragment}`;
    }
  }

  return resultingFragment;
}

export const applyMiddleware = <V = any>(
  middleware: Middleware<V>[]
): Middleware<V> => {
  return (context: Context<V>) => {
    return compose(middleware)(context);
  };
};

export function ensureArray(el: any) {
  if (!el) return [];
  if (Array.isArray(el)) return el;
  return [el];
}

export type Dict<T = any> = { [key: string]: T };

export type Method<
  Variables = any,
  ReturnType = any,
  Config = Partial<FetcherConfig<Variables, ReturnType | undefined | null>>
> = (
  variables: Variables,
  config?: Config
) => Promise<Context<Variables, ReturnType | undefined | null>>;

type MethodsDict = { [key: string]: Method };

export interface Methods extends MethodsDict {
  PostFindMany: Method<QueryPostFindManyArgs, Query['PostFindMany']>;

  echo: Method<QueryEchoArgs, Query['echo']>;

  PostCreateOne: Method<MutationPostCreateOneArgs, Mutation['PostCreateOne']>;
}

export type MethodsInfo = {
  [key: string]: MethodInfo;
};

export interface MethodInfo {
  type: string;
  schemaKey: keyof Methods;
  entityName: string;
  isList: boolean;
  argsTSName: string;
  returnTSName: string;
  isMutation: boolean;
  isQuery: boolean;
  isSubscription: boolean;
  field: any;
  isNonNull: boolean;
  kind: OpKind | string;
}

export interface ArgsEntity {
  name: string;
  description?: string | null;
  type: string;
  [key: string]: any;
}
