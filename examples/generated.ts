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

type MiddlewareContext<V> = {
  requestConfig: RequestInit;
  variables: V;
  config: FetcherConfig<V>;
};

type FetchMiddleware<V> = (
  config: MiddlewareContext<V>
) => MiddlewareContext<V>;

export type FetcherConfig<V = any> = {
  apiURL: string;
  headers?: { [key: string]: string };
  query: string;
  entityName: string;
  schemaKey: string;
  middlewareList?: FetchMiddleware<V>[];
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

  if (config.middlewareList) {
    context = applyMiddleware(config.middlewareList)(context);
    console.log(context);
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
  middlewareList: FetchMiddleware<any>[] = [];

  exec = <V, R>(_variables: V, _config: FetcherConfig<V>) => {
    return queryFetcher<V, R>(_variables, {
      apiURL: this.apiURL,
      ..._config,
      middlewareList: [...this.middlewareList, ..._config.middlewareList]
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
function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}

const applyMiddleware = <V = any>(middlewareList: FetchMiddleware<V>[]) => {
  return (context: MiddlewareContext<V>) => {
    return compose(...middlewareList)(context);
  };
};
