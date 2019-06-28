import got from 'got';
import { introspectionQuery } from 'graphql/utilities/introspectionQuery';
import { buildClientSchema } from 'graphql/utilities/buildClientSchema';
import { printSchema } from 'graphql/utilities/schemaPrinter';
import { buildSchema, Source } from 'graphql';
import { printClient } from '../index';

type Options = {
  fetchOptions?: FetchOptions;
};

type Return =
  | { status: 'ok'; client: string, provider: string, store: string }
  | { status: 'err'; message: string };

export async function printFromEndpoint(
  url: string,
  options: Options = {}
): Promise<Return> {
  const response = await getRemoteSchema(url, {
    ...options.fetchOptions,
    json: false
  });

  if (response.status !== 'ok') {
    return response;
  }

  try {
    const source = new Source(response.schema);
    const gqlSchema = buildSchema(source);
    const { client, provider, store } = await printClient(gqlSchema);

    return { status: 'ok', client, provider, store };
  } catch (e) {
    return { status: 'err', message: e.message };
  }
}

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: { [key: string]: string };
  json?: boolean;
}

// Fetch remote schema and turn it into string
export async function getRemoteSchema(
  endpoint: string,
  options: FetchOptions
): Promise<
  { status: 'ok'; schema: string } | { status: 'err'; message: string }
> {
  const body = JSON.stringify({ query: introspectionQuery });

  try {
    const response = await got
      .post(endpoint, {
        method: options.method || 'POST',
        headers: {
          ...options.headers,
          'Content-type': 'application/json',
          Accept: 'application/json'
        },
        body
      })
      .catch(console.log);

    // @ts-ignore
    const { data, errors } = JSON.parse(response.body);

    if (errors) {
      return { status: 'err', message: JSON.stringify(errors, null, 2) };
    }

    if (options.json) {
      return {
        status: 'ok',
        schema: JSON.stringify(data, null, 2)
      };
    } else {
      const schema = buildClientSchema(data);
      return {
        status: 'ok',
        schema: printSchema(schema)
      };
    }
  } catch (err) {
    return { status: 'err', message: err.message };
  }
}
