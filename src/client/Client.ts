import { GraphQLStore } from './Store';

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
  methodConfig: MethodConfig<V, R>;
  action: Actions;
  errors?: string[];
  result?: R | null;
  querySuffix?: string;
  fetchResponse?: Response;
};

export type Middleware<V = any, R = any> = (
  config: Context<V, R>
) => Promise<Context<V, R>>;

export type AfterMutate<R> = ((r: R, s: GraphQLStore) => any) | RegExp; // redo query if regex or run a callback

export type MethodConfig<V, R> = {
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
  afterMutate?: AfterMutate<R>;
  variables?: V;
};

type Resolver = (r: ReturnType<Middleware<any>>) => void;

type QueueItem = {
  resolver: Resolver | null;
  variables: Dict;
  kind: 'mutation' | 'query';
  config: MethodConfig<any, any>;
};

export type MethodsInfoDict = { [key: string]: MethodInfo };

export type GraphQLClientConfig = {
  url?: string;
  middleware?: Middleware | Middleware[];
  methods: Methods;
  methodsInfo: MethodsInfoDict;
};

export class GraphQLClient {
  url = '/graphql';
  middleware: Middleware<any>[] = [];
  methods: Methods;
  methodsInfo: MethodsInfoDict;

  private queryBachTimeout!: any; //NodeJS.Timer;
  private mutationBachTimeout!: any; //NodeJS.Timer;

  private mutationQueue: QueueItem[] = [];
  private queryQueue: QueueItem[] = [];

  private queueLimit = 20;
  private timeoutLimit = 50;

  constructor(config: GraphQLClientConfig) {
    this.methods = config.methods;
    this.methodsInfo = config.methodsInfo;

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
            methodConfig: config,
            querySuffix: key
          })
        );
      });
    });
  };

  exec = async <V, R>(
    _variables: V,
    _config: MethodConfig<V, R>
  ): Promise<Context<V, R>> => {
    const { kind } = _config;

    if (kind !== OpKind.mutation && kind !== OpKind.query) {
      throw new Error(`invalid kind of operation: ${kind}`);
    }

    const methodConfig = {
      ..._config,
      url: this.url,
      middleware: [...this.middleware, ...ensureArray(_config.middleware)]
    };

    const context = await applyMiddleware(methodConfig.middleware as [])({
      requestConfig: {},
      variables: _variables,
      methodConfig,
      action: Actions.willQueue
      // errors?: string[];
      // result?: R | null;
      // querySuffix?: string;
    });

    if (context.action === Actions.abort) {
      // applying middleware because listeners should be able
      // to listen to 'abort' action
      return applyMiddleware(methodConfig.middleware as [])(context);
    }

    let queueItem: QueueItem = {
      config: context.methodConfig,
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

  queryFetcher = async <Variables, Return>(
    variables: Variables,
    methodConfig: MethodConfig<Variables, Return>
  ): Promise<Context<Variables, Return>> => {
    let requestConfig: RequestInit = {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...methodConfig.headers
      }
    };

    const middleware: Middleware<Variables, Return> =
      typeof methodConfig.middleware === 'function'
        ? methodConfig.middleware
        : applyMiddleware(ensureArray(methodConfig.middleware));

    const context = await middleware({
      requestConfig,
      variables,
      methodConfig,
      action: Actions.initFetch,
      querySuffix: methodConfig.querySuffix
    });

    if (context.action === Actions.abort) {
      return context;
    }

    context.requestConfig.body = JSON.stringify({
      query: context.methodConfig.query,
      variables: context.variables
    });

    return fetch(context.methodConfig.url, context.requestConfig)
      .then(async response => {
        const contentType = response.headers.get('Content-Type');
        const isJSON =
          contentType && contentType.startsWith('application/json');

        if (!isJSON) {
          const fetchError = await response.text();

          return middleware({
            ...context,
            fetchResponse: response,
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
          fetchResponse: response,
          errors,
          action: Actions.completeFetch,
          result: data
            ? methodConfig.schemaKey
              ? data[methodConfig.schemaKey]
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
      resultingFragment = `${config.fragment}`;
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
  Config = Partial<MethodConfig<Variables, ReturnType | undefined | null>>
> = (
  variables: Variables,
  config: Config | undefined,
  client: GraphQLClient
) => Promise<Context<Variables, ReturnType | undefined | null>>;

export type MethodsDict = { [key: string]: Method };

export interface Methods extends MethodsDict {}

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

export type MethodFetcher<V, R> = (
  config?: Partial<MethodConfig<V, R>>
) => Promise<Context<V, R>>;

type OnStateUpdate = {
  updateSignature?: (newValue: string) => void;
  willCallMutation?: () => void;
  resolvedMutation?: (ctx: Context) => void;
};


export type FetchGraphql<V = any, R = any> = (
  methodName: string,
  hookConfig: Partial<MethodConfig<V, R>> | undefined,
  store: GraphQLStore,
  onStateUpdate: OnStateUpdate
) =>  MethodFetcher<V, R>

export const fetchGraphql = <V = any, R = any>(
  methodName: string,
  hookConfig: Partial<MethodConfig<V, R>> | undefined,
  store: GraphQLStore,
  onStateUpdate: OnStateUpdate = {}
): MethodFetcher<V, R> => {
  const method = store.client.methods[methodName];

  const defaulter = (override: typeof hookConfig = {}) => {
    const initial: any = hookConfig || {};

    return {
      ...initial,
      ...override,
      variables: override.variables
        ? override.variables
        : initial.variables || {}
    };
  };

  let requestSignatureRef = '';

  // update requestSignature when fetcher is called with new variables
  function updateSignature({
    methodName,
    variables
  }: {
    methodName: string;
    variables: Dict;
  }) {
    const newSignature = store.mountRequestSignature(methodName, variables);
    if (newSignature === requestSignatureRef) return;

    store.activeQueries.remove(requestSignatureRef);

    requestSignatureRef = newSignature;

    if (onStateUpdate.updateSignature) {
      onStateUpdate.updateSignature(newSignature);
    }
  }

  return function methodfetcher(config = hookConfig) {
    const { variables, fetchOnMount, afterMutate, ...methodConfig } = defaulter(
      config
    );

    const methodInfo = store.client.methodsInfo[methodName as keyof MethodInfo];

    if(!methodInfo) {
      throw new Error(`The method "${methodName}" does not exists`)
    }
    
    if (methodInfo.isQuery) {
      updateSignature({ methodName: methodName as string, variables });
      store.activeQueries.add(requestSignatureRef);
      return method(variables, methodConfig, store.client);
    }

    if (onStateUpdate.willCallMutation) {
      onStateUpdate.willCallMutation();
    }

    return method(variables, methodConfig, store.client).then(ctx => {
      if (!ctx.errors && afterMutate) {
        if (afterMutate instanceof RegExp) {
          store.redoQuery(afterMutate);
        } else {
          afterMutate(ctx.result, store);
        }
      }

      if (onStateUpdate.resolvedMutation) {
        onStateUpdate.resolvedMutation(ctx);
      }

      return ctx;
    });
  };
};
