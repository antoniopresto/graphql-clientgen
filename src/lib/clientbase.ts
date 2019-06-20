type MiddlewareContext<V> = {
  requestConfig: RequestInit;
  variables: V;
  config: FetcherConfig<V>;
};

type Middleware<V = any> = (
  config: MiddlewareContext<V>
) => MiddlewareContext<V>;

export type FetcherConfig<V = any> = {
  apiURL: string;
  headers?: { [key: string]: string };
  query: string;
  entityName: string;
  schemaKey: string;
  middleware?: Middleware<V>[] | Middleware<V>;
  fragment?: string;
};

const queryFetcher = async function queryFetcher<Variables, Return>(
  variables: Variables,
  config: FetcherConfig<Variables>
): Promise<Return> {
  let requestConfig: RequestInit = {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...config.headers
    },
    body: JSON.stringify({
      query: config.query,
      variables
    })
  };

  let context: MiddlewareContext<Variables> = {
    requestConfig,
    variables,
    config
  };

  if (config.middleware) {
    context = applyMiddleware(ensureArray(config.middleware))(context);
  }

  return fetch(context.config.apiURL, context.requestConfig).then(
    async response => {
      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.startsWith('application/json')) {
        const { errors, data } = await response.json();

        if (errors) {
          throw new Error(errors.join('\n'));
        }

        return data[config.schemaKey];
      } else {
        throw new Error(await response.text());
      }
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

  exec = <V, R>(_variables: V, _config: FetcherConfig<V>) => {
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

const applyMiddleware = <V = any>(middleware: Middleware<V>[]) => {
  return (context: MiddlewareContext<V>) => {
    return compose(...middleware)(context);
  };
};

function ensureArray(el: any) {
  if (!el) return [];
  if (Array.isArray(el)) return el;
  return [el];
}
