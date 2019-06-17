import groupBy from 'lodash/groupBy';
import { plugin as tsPlugin } from '@graphql-codegen/typescript';
import { GraphQLSchema } from 'graphql';

import { genClientFields } from './expand-client-fields';
import { getResolversHelper, ResolverStoreItem } from './resolversHelper';
import { prettify } from '../utils/prettify';

function mountClient(schema: GraphQLSchema) {
  let prependBody = clientBase;

  const storeSet = getResolversHelper(schema);
  const store = [...storeSet.values()];

  const queryHelpers = genClientFields({ schema });

  let queriesStr = `
    export const query = {
  `;

  let clientBody = `
    export type FetchConfig = any;
    export const client = {
  `;

  const storeByEntity = groupBy(store, 'entityName');
  const entityNames = Object.keys(storeByEntity);

  entityNames.forEach(entityName => {
    const entries = storeByEntity[entityName];

    queriesStr += `
      ${entityName}: {
    `;

    let clientEntry = `
    ${entityName}: {
  `;

    entries.forEach((fieldInfo: ResolverStoreItem) => {
      const queryHelper = queryHelpers.find(el => {
        // console.log(el);
        return el.schemaKey === fieldInfo.camelPath;
      });

      if (!queryHelper) {
        console.log(`no client generated for ${fieldInfo.camelPath}`);
        // query not exists, probably because no auth rule was created, not wrong.
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
        "${fieldInfo.resolverName}": (fragment = '') => \`\n${query}\`,
      `;

      clientEntry += `
      ${fieldInfo.resolverName}: (variables: ${fieldInfo.argsTSType}, config: Partial<FetcherConfig> = {}) => {
        return queryFetcher<${fieldInfo.argsTSType}, Maybe<${fieldInfo.returnTSType}>>(variables, {
        entityName: '${fieldInfo.entityName}',
        schemaKey: '${fieldInfo.camelPath}',
        query: query.${fieldInfo.entityName}.${fieldInfo.resolverName}(config.fragment), ...config});
      },
    `;
    });

    queriesStr += `
    },
  `;

    clientEntry += `
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
    query: queryHelpers.reduce((prev, next) => `${prev}\n\n ${next.query}`, '')
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
