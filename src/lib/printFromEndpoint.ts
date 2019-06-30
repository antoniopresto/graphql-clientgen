import got from 'got';
import { introspectionQuery } from 'graphql/utilities/introspectionQuery';
import { buildClientSchema } from 'graphql/utilities/buildClientSchema';
import { GraphQLSchema } from 'graphql';
import { printClient } from '../index';

type Options = {
  fetchOptions?: FetchOptions;
};

type Return =
  | { status: 'ok'; client: string; provider: string; store: string }
  | { status: 'err'; message: string };

export async function printFromEndpoint(
  url: string,
  options: Options = {}
): Promise<Return> {
  try {
    const schemaFetch = await getRemoteSchema(url, options.fetchOptions);
    
    if (schemaFetch.status !== 'ok') {
      return schemaFetch;
    }
    
    const { client, provider, store } = await printClient(schemaFetch.schema);
    
    return { status: 'ok', client, provider, store };
  } catch (e) {
    return { status: 'err', message: e.message };
  }
}

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: { [key: string]: string };
}

export async function getRemoteSchema(
  endpoint: string,
  options: FetchOptions = {}
): Promise<
  { status: 'ok'; schema: GraphQLSchema } | { status: 'err'; message: string }
  > {
  const body = JSON.stringify({ query: introspectionQuery });
  
  try {
    const response = await got.post(endpoint, {
      method: options.method || 'POST',
      headers: {
        ...options.headers,
        'Content-type': 'application/json',
        Accept: 'application/json'
      },
      body
    });
    
    // @ts-ignore
    const { data, errors } = JSON.parse(response.body);
    
    if (errors) {
      return { status: 'err', message: JSON.stringify(errors, null, 2) };
    }

    // note: if we convert to typedef and transform back to schema
    // the comment "/** Time represented in ISO 8601 */" is added to the
    // type Scalars['Time'] - but if simple building the schema, the
    // comment is suppressed
    
    const schema = buildClientSchema(data);
    
    return {
      status: 'ok',
      schema
    };
  } catch (err) {
    return { status: 'err', message: err.message };
  }
}
