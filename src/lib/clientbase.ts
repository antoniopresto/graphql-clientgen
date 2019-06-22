export enum Actions {
  init = 'init',
  complete = 'complete'
}

type Context<V, R = any> = {
  requestConfig: RequestInit;
  variables: V;
  config: FetcherConfig<V, R>;
  action: Actions;
  errors?: string[];
  result?: R | null;
};

type Middleware<V = any, R = any> = (config: Context<V, R>) => Context<V, R>;

export type FetcherConfig<V, R> = {
  url: string;
  headers?: { [key: string]: string };
  query: string;
  entityName?: string;
  schemaKey?: string;
  middleware?: Middleware<V, R>[] | Middleware<V, R>;
  fragment?: string;
};

const queryFetcher = async function queryFetcher<Variables, Return>(
  variables: Variables,
  config: FetcherConfig<Variables, Return>
): Promise<Context<Variables, Return>> {
  let requestConfig: RequestInit = {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...config.headers
    }
  };

  const middleware: Middleware<Variables, Return> = config.middleware
    ? applyMiddleware(ensureArray(config.middleware))
    : ctx => ctx;

  const context = middleware({
    requestConfig,
    variables,
    config,
    action: Actions.init
  });

  context.requestConfig.body = JSON.stringify({
    query: context.config.query,
    variables: context.variables
  });

  return fetch(context.config.url, context.requestConfig)
    .then(async response => {
      const contentType = response.headers.get('Content-Type');
      const isJSON = contentType && contentType.startsWith('application/json');

      if (!isJSON) {
        const fetchError = await response.text();

        return middleware({
          ...context,
          result: null,
          action: Actions.complete,
          errors: [fetchError]
        });
      }

      let { errors, data } = await response.json();

      if (errors && !Array.isArray(errors)) {
        errors = [errors];
      }

      return middleware({
        ...context,
        errors,
        action: Actions.complete,
        result: data ? (config.schemaKey ? data[config.schemaKey] : data) : null
      });
    })
    .catch(err => {
      return middleware({
        ...context,
        errors: [err],
        action: Actions.complete,
        result: null
      });
    });
};

export type QueryFetcher = typeof queryFetcher;

type Resolver = (r: Context<any, any>) => void;
type QueueItem = FetcherConfig<any, any> & {
  resolver: Resolver | null;
  variables: Dict;
  kind: 'mutation' | 'query';
};

export class GraphQLClient {
  private url = '/graphql';
  private middleware: Middleware<any>[];

  private queryBachTimeout!: any; //NodeJS.Timer;
  private mutationBachTimeout!: any; //NodeJS.Timer;

  private mutationQueue: QueueItem[] = [];
  private queryQueue: QueueItem[] = [];

  private queueLimit = 20;
  private timeoutLimit = 50;

  constructor(config: {
    url?: string;
    middleware?: Middleware | Middleware[];
  }) {
    this.middleware = ensureArray(config.middleware);

    if (config.url) {
      this.url = config.url;
    }
  }

  private fetchQueue = (queue: QueueItem[], kind: 'mutation' | 'query') => {
    let middleware: any[] = [];
    let headers: Dict = {};
    let finalQueryBody = '';
    let finalQueryHeader = '';
    let finalVariables: Dict = {};
    let resolverMap: { [key: string]: QueueItem } = {};

    queue.forEach((q, key) => {
      const qiKey = `${kind}_${key}`;
      let qiQuery = q.query;
      const qiHeader = getHeader(qiQuery.trim().split('\n')[0]);
      resolverMap[qiKey] = q;

      if (q.middleware) {
        middleware = middleware.concat(ensureArray(q.middleware));
      }

      if (q.headers) {
        headers = { ...headers, ...q.headers };
      }

      if (q.variables) {
        Object.keys(q.variables).forEach(k => {
          finalVariables[`${k}_${key}`] = q.variables[k];
        });
      }

      qiHeader.forEach(pair => {
        const nname = `${pair[0]}_${key}`;
        finalQueryHeader += ` ${nname}: ${pair[1]} `;

        const reg = new RegExp('\\' + pair[0], 'mg');

        qiQuery = qiQuery.replace(reg, nname);
      });

      finalQueryBody +=
        `\n ${qiKey}: ` +
        qiQuery
          .trim()
          .split('\n')
          .slice(1, -1) // remove query declaration line and closing tag
          .join('\n') +
        '\n';
    });

    const query = `${kind} (${finalQueryHeader}) {
      ${finalQueryBody}
    }`;

    queryFetcher<any, any>(finalVariables, {
      url: this.url,
      query
    }).then(ctx => {
      Object.keys(resolverMap).forEach(key => {
        const { resolver } = resolverMap[key];
        if (!resolver) return;
        resolver({ ...ctx, result: ctx.result ? ctx.result[key] : null });
      });
    });
  };

  exec = <V, R>(_variables: V, _config: FetcherConfig<V, R>) => {
    const kind = _config.query.trim().startsWith('query')
      ? 'query'
      : 'mutation';

    const queueItem: QueueItem = {
      url: this.url,
      ..._config,
      middleware: [...this.middleware, ...ensureArray(_config.middleware)],
      resolver: null,
      variables: _variables,
      kind
    };

    const promise = new Promise<Context<V, R>>(r => {
      queueItem.resolver = r;
    });

    if (kind === 'query') {
      this.queryQueue.push(queueItem);

      const fulfill = () => {
        let queue = [...this.queryQueue];
        this.queryQueue = [];
        this.fetchQueue(queue, 'query');
      };

      clearTimeout(this.queryBachTimeout);
      this.queryBachTimeout = setTimeout(fulfill, this.timeoutLimit);

      if (this.queryQueue.length >= this.queueLimit) {
        fulfill();
      }
    } else {
      this.mutationQueue.push(queueItem);

      const fulfill = () => {
        let queue = [...this.mutationQueue];
        this.mutationQueue = [];
        this.fetchQueue(queue, 'mutation');
      };

      clearTimeout(this.mutationBachTimeout);
      this.mutationBachTimeout = setTimeout(fulfill, this.timeoutLimit);

      if (this.mutationQueue.length >= this.queueLimit) {
        fulfill();
      }
    }

    return promise;
  };

  //[actions]//
}

// compose(f, g, h) is identical to doing (...args) => f(g(h(...args))).
function compose(...funcs: Middleware<any>[]) {
  if (funcs.length === 0) {
    return (arg: any) => arg;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}

const applyMiddleware = <V = any>(
  middleware: Middleware<V>[]
): Middleware<V> => {
  return (context: Context<V>) => {
    return compose(...middleware)(context);
  };
};

function ensureArray(el: any) {
  if (!el) return [];
  if (Array.isArray(el)) return el;
  return [el];
}

// => [['$varname', 'GqlInputType'], ...]
function getHeader(str: string) {
  return ((str.match(/\((.*)\)/) || [])[1] || '').split(',').map(pair =>
    pair
      .trim()
      .split(':')
      .map(e => e.trim())
  );
}

type Dict = { [key: string]: any };
