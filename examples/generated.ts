export type FetcherConfig<V = any> = {
  headers?: { [key: string]: string };
  query: string;
  entityName: string;
  schemaKey: string;
  transformFetchConfig?: (config: {
    requestInit: RequestInit;
    variables: V;
    config: FetcherConfig<V>;
  }) => RequestInit;
  fragment?: string;
  [key: string]: any;
};

let API_URL = 'http://localhost:3777/graphql';

let queryFetcher = function queryFetcher<Variables, Return>(
  variables: Variables,
  config: FetcherConfig<Variables>
): Promise<Return> {
  let requestInit: RequestInit = {
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

  if (config.transformFetchConfig) {
    requestInit = config.transformFetchConfig({
      requestInit,
      variables,
      config
    });
  }

  return fetch(API_URL, requestInit).then(async response => {
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
  });
};

export type QueryFetcher = typeof queryFetcher;

export const setQueryFetcher = (fetcher: QueryFetcher) => {
  queryFetcher = fetcher;
};

export const getQueryfetcher = () => queryFetcher;

export const setApiUrl = (url: string) => {
  API_URL = url;
};

export const getApiUrl = () => API_URL;

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

export const client = {
  cities: (variables: QueryCitiesArgs, config: Partial<FetcherConfig> = {}) => {
    return queryFetcher<QueryCitiesArgs, Maybe<Query['cities']>>(variables, {
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
    return queryFetcher<QueryCreateCityArgs, Maybe<Query['createCity']>>(
      variables,
      {
        entityName: 'City',
        schemaKey: 'createCity',
        query: query.createCity(config.fragment),
        ...config
      }
    );
  }
};
