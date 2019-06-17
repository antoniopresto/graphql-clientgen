export type FetcherConfig<V = any> = {
  headers?: { [key: string]: string };
  query: string;
  entityName: string;
  schemaKey: string;
  transformFetchConfig?: (
    config: {
      requestInit: RequestInit;
      variables: V;
      config: FetcherConfig<V>;
    }
  ) => RequestInit;
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
