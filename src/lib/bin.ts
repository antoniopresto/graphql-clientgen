#!/usr/bin/env node

import meow from 'meow';
import { printFromEndpoint } from './printFromEndpoint';
import qs from 'querystring';
import fs from 'fs-extra';
import path from 'path';

const cli = meow(
  `
Usage:
  $ graphql-clientgen ENDPOINT_URL destination-folder/
  
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
  let [endpoint, destination] = cli.input;

  if (!endpoint) {
    console.warn('No endpoint provided');
    return;
  }

  if (!destination) {
    destination = process.cwd() + '/generated';
  }

  const folder = path.resolve(destination);

  await fs.mkdirp(folder);

  /* Headers */
  const defaultHeaders = {
    'Content-Type': 'application/json'
  };

  const headers = { ...defaultHeaders, ...getHeadersFromInput(cli) };

  /* Fetch schema */
  const client = await printFromEndpoint(endpoint, {
    fetchOptions: {
      method: cli.flags.method,
      headers
    }
  });

  if (client.status === 'err') {
    throw new Error(client.message);
  }

  const clientPath = `${folder}/client.ts`;
  const typesPath = `${folder}/types.ts`;

  console.log(`writing ${clientPath}`);
  fs.writeFileSync(clientPath, client.client);

  console.log(`writing ${typesPath}`);
  fs.writeFileSync(typesPath, client.types);
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
