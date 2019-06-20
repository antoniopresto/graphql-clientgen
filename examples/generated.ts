export const query = {
  cities: (fragment = '') => `
        query cities($filter: CityFilterInput, $limit: Int, $skip: Int){
            cities(filter: $filter, limit: $limit, skip: $skip){
                ${fragment ||
                  `
                        code
                        name
                        population
                        countryCode
                        tz
                `}
            }
        }`,

  createCity: (fragment = '') => `
        query createCity($payload: CreateCityPayload){
            createCity(payload: $payload){
                ${fragment ||
                  `
                        code
                        name
                        population
                        countryCode
                        tz
                `}
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

export type City = {
  __typename?: 'City';
  code: Scalars['String'];
  name: Scalars['String'];
  population?: Maybe<Scalars['Int']>;
  countryCode?: Maybe<Scalars['String']>;
  tz?: Maybe<Scalars['String']>;
};

export type CityFilterInput = {
  code: Scalars['String'];
};

export type CreateCityPayload = {
  code: Scalars['String'];
  name: Scalars['String'];
  population?: Maybe<Scalars['Int']>;
  countryCode?: Maybe<Scalars['String']>;
  tz?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  cities?: Maybe<Array<Maybe<City>>>;
  createCity?: Maybe<City>;
};

export type QueryCitiesArgs = {
  filter?: Maybe<CityFilterInput>;
  limit: Scalars['Int'];
  skip?: Maybe<Scalars['Int']>;
};

export type QueryCreateCityArgs = {
  payload?: Maybe<CreateCityPayload>;
};

export enum Actions {
  init = 'init',
  complete = 'complete'
}

type MiddlewareContext<V, R = any> = {
  requestConfig: RequestInit;
  variables: V;
  config: FetcherConfig<V>;
  action: Actions;
  errors?: string[];
  result?: R | null;
};

type Middleware<V = any, R = any> = (
  config: MiddlewareContext<V, R>
) => MiddlewareContext<V, R>;

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

  exec = <V, R>(_variables: V, _config: FetcherConfig<V>) => {
    return queryFetcher<V, R>(_variables, {
      apiURL: this.apiURL,
      ..._config,
      middleware: [...this.middleware, ...ensureArray(_config.middleware)]
    });
  };

  actions = {
    cities: (
      variables: QueryCitiesArgs,
      config: Partial<FetcherConfig> = {}
    ) => {
      return this.exec<QueryCitiesArgs, Maybe<Query['cities']>>(variables, {
        apiURL: this.apiURL,
        entityName: 'City',
        schemaKey: 'cities',
        query: query.cities(config.fragment),
        ...config
      });
    },

    createCity: (
      variables: QueryCreateCityArgs,
      config: Partial<FetcherConfig> = {}
    ) => {
      return this.exec<QueryCreateCityArgs, Maybe<Query['createCity']>>(
        variables,
        {
          apiURL: this.apiURL,
          entityName: 'City',
          schemaKey: 'createCity',
          query: query.createCity(config.fragment),
          ...config
        }
      );
    }
  };
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
