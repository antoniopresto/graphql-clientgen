#!/usr/bin/env node

import meow from 'meow';
import { printFromEndpoint } from './printFromEndpoint';
import qs from 'querystring';

const cli = meow(
  `
Usage: 
  $ graphql-clientgen ENDPOINT_URL > client.ts
  
  Fetch and print the GraphQL Client from a GraphQL HTTP endpoint.
  
  Options:
    --header, -h    Add a custom header (ex. 'X-API-KEY=ABC123'), can be used multiple times
    --method        Use method (GET,POST, PUT, DELETE)
`,
  {
    flags: {
      header: {
        type: 'string',
        alias: 'h'
      },
      method: {
        type: 'string',
        default: 'POST'
      },
      output: {
        type: 'string'
      }
    }
  }
);

/* istanbul ignore next */
if (process.env.NODE_ENV !== 'test') main(cli);

/**
 * Main
 */
export async function main(cli: meow.Result): Promise<void> {
  /* Get remote endpoint from args */
  const [endpoint] = cli.input;

  if (!endpoint) {
    console.warn('No endpoint provided');
    return;
  }

  /* Headers */
  const defaultHeaders = {
    'Content-Type': 'application/json'
  };

  const headers = { ...defaultHeaders, ...getHeadersFromInput(cli) };

  /* Fetch schema */
  const client = await printFromEndpoint(endpoint, {
    fetchOptions: {
      method: cli.flags.method,
      headers,
      json: cli.flags.json
    }
  });

  if (client.status === 'err') {
    console.warn(client.message);
    return;
  }

  console.clear();
  console.log(client.client);
}

export function getHeadersFromInput(cli: meow.Result) {
  if (typeof cli.flags.header !== 'string') return {};
  const parsed = qs.parse(cli.flags.header);
  return Object.keys(parsed).reduce((acc, key) => {
    const value = parsed[key];
    return {
      ...acc,
      [key]: Array.isArray(value) ? value[0] : value
    };
  }, {});
}
