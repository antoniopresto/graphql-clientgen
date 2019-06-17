import { plugin as tsPlugin } from '@graphql-codegen/typescript';
import { GraphQLSchema } from 'graphql';

import { generateQuery } from './expand-client-fields';
import { getResolversHelper } from './resolversHelper';
import { prettify } from '../utils/prettify';

function mountClient(schema: GraphQLSchema) {
  let prependBody = clientBase;

  const storeSet = getResolversHelper(schema);
  const storeItems = [...storeSet.values()];

  const queryHelpers = generateQuery({ schema });

  let queriesStr = `
    export const query = {
  `;

  let clientBody = `
    export const client = {
  `;

  storeItems.forEach(info => {
    let clientEntry = ``;

    const queryHelper = queryHelpers.get(info.schemaKey);

    if (!queryHelper) {
      console.log(`no client generated for ${info.schemaKey}`);
      return;
    }

    const query = addTabs(
      queryHelper.queryParts
        .map((el, k) => {
          if (k !== 1) return el;
          return addTabs(`\${fragment || \`\n${el}\n\`}`, 8);
        })
        .join('\n'),
      8
    );

    queriesStr += `
        "${info.schemaKey}": (fragment = '') => \`\n${query}\`,
      `;

    const hasArgs = !!info.field.args.length;
    let variablesDeclaration = '';
    if (hasArgs) {
      variablesDeclaration = `variables: ${info.argsTSName}, `;
    }

    clientEntry += `
      ${
        info.schemaKey
      }: (${variablesDeclaration}config: Partial<FetcherConfig> = {}) => {
        return queryFetcher<${info.argsTSName}, Maybe<${info.returnTSName}>>(${
      hasArgs ? 'variables, ' : 'undefined, '
    } {
        entityName: '${info.entityName}',
        schemaKey: '${info.schemaKey}',
        query: query.${
      info.schemaKey
    }(config.fragment), ...config});
      },
    `;
    
    clientBody += clientEntry;
  });

  clientBody += '}'; // close client

  // prepend queries
  prependBody += `
      ${queriesStr}
    }
  `;

  return {
    prependBody,
    clientBody,
    query: [...queryHelpers.values()].reduce(
      (prev, next) => `${prev}\n\n ${next.query}`,
      ''
    )
  };
}

export async function printClient(schema: GraphQLSchema) {
  const tsTypes = await tsPlugin(schema, [], {});
  const tsContent =
    typeof tsTypes === 'string'
      ? tsTypes
      : tsTypes.prepend + '\n\n' + tsTypes.content;

  const { prependBody, clientBody } = mountClient(schema);

  return prettify(
    'client.ts',
    `
      ${prependBody}
      ${tsContent}
      ${clientBody}
    `
  );
}

function addTabs(str = '', n = 8) {
  let spaces = '';

  for (let i = 0; i < n; i++) {
    spaces += ' ';
  }

  return str
    .split('\n')
    .map(el => `${spaces}${el}`)
    .join('\n');
}

const clientBase = `export type FetcherConfig<V = any> = {
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
`;
