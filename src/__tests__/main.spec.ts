import test from 'ava';
import { printSchema } from 'graphql';
import { printClient } from '../index';
import { schema } from './schema.spec';

test('isSameSchema', async t => {
  t.is(printSchema(schema), schemaGraphql);
});

test('isSameClient', async t => {
  t.is(clientSpec, await printClient(schema));
});

const schemaGraphql = `"""Provides default value for input field."""
directive @default(value: JSON!) on INPUT_FIELD_DEFINITION

type City {
  code: String!
  name: String!
  population: Int
  countryCode: String
  tz: String
}

input CityFilterInput {
  code: String!
}

scalar Date

"""
The \`JSON\` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).
"""
scalar JSON

type Query {
  cities(filter: CityFilterInput, limit: Int = 20, skip: Int): [City]
  currentTime: Date
}
`;

const clientSpec = `export type FetcherConfig<V = any> = {
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
        throw new Error(errors.join('\\n'));
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
////
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

export type Query = {
  __typename?: 'Query';
  cityFindMany?: Maybe<Array<Maybe<City>>>;
};

export type QueryCityFindManyArgs = {
  filter?: Maybe<CityFilterInput>;
  limit: Scalars['Int'];
  skip?: Maybe<Scalars['Int']>;
};

export type FetchConfig = any;
export const client = {
  City: {
    findMany: (
      variables: QueryCityFindManyArgs,
      config: Partial<FetcherConfig> = {}
    ) => {
      return queryFetcher<QueryCityFindManyArgs, Maybe<City[]>>(variables, {
        entityName: 'City',
        schemaKey: 'cityFindMany',
        query: query.City.findMany(config.fragment),
        ...config
      });
    }
  }
};
`
