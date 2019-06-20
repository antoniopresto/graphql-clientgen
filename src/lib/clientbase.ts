export enum Actions {
  init = 'init',
  complete = 'complete'
}

type MiddlewareContext<V, R = any> = {
  requestConfig: RequestInit;
  variables: V;
  config: FetcherConfig<V, R>;
  action: Actions;
  errors?: string[];
  result?: R | null;
};

type Middleware<V = any, R = any> = (
  config: MiddlewareContext<V, R>
) => MiddlewareContext<V, R>;

export type FetcherConfig<V, R> = {
  apiURL: string;
  headers?: { [key: string]: string };
  query: string;
  entityName: string;
  schemaKey: string;
  middleware?: Middleware<V, R>[] | Middleware<V, R>;
  fragment?: string;
};

const queryFetcher = async function queryFetcher<Variables, Return>(
  variables: Variables,
  config: FetcherConfig<Variables, Return>
): Promise<MiddlewareContext<Variables, Return>> {
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

  return fetch(context.config.apiURL, context.requestConfig).then(
    async response => {
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

      return middleware({
        ...context,
        errors,
        action: Actions.complete,
        result: data ? data[config.schemaKey] : null
      });
    }
  );
};

export type QueryFetcher = typeof queryFetcher;

export class GraphQLClient {
  apiURL = '/graphql';
  middleware: Middleware<any>[];

  constructor(config: {
    apiURL?: string;
    middleware?: Middleware | Middleware[];
  }) {
    this.middleware = ensureArray(config.middleware);

    if (config.apiURL) {
      this.apiURL = config.apiURL;
    }
  }

  exec = <V, R>(_variables: V, _config: FetcherConfig<V, R>) => {
    return queryFetcher<V, R>(_variables, {
      apiURL: this.apiURL,
      ..._config,
      middleware: [...this.middleware, ...ensureArray(_config.middleware)]
    });
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
  return (context: MiddlewareContext<V>) => {
    return compose(...middleware)(context);
  };
};

function ensureArray(el: any) {
  if (!el) return [];
  if (Array.isArray(el)) return el;
  return [el];
}
