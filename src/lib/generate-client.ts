import { plugin as tsPlugin } from '@graphql-codegen/typescript';
import { GraphQLSchema } from 'graphql';

import { generateQuery } from './expand-client-fields';
import { getResolversHelper } from './resolversHelper';
import { prettify } from '../utils/prettify';

function mountClient(schema: GraphQLSchema) {
  let prependBody = '';

  const storeSet = getResolversHelper(schema);
  const storeItems = [...storeSet.values()];

  const queryHelpers = generateQuery({ schema });

  let queriesStr = `
    export const query = {
  `;

  let actionsBody = `
    actions = {
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
        return this.exec<${info.argsTSName}, Maybe<${info.returnTSName}>>(${
      hasArgs ? 'variables, ' : 'undefined, '
    } {
        apiURL: this.apiURL,
        entityName: '${info.entityName}',
        schemaKey: '${info.schemaKey}',
        query: query.${
      info.schemaKey
    }(config.fragment), ...config});
      },
    `;
    
    actionsBody += clientEntry;
  });
  
  actionsBody += '}'; // close client

  // prepend queries
  prependBody += `
      ${queriesStr}
    }
  `;

  return {
    prependBody,
    clientBody: clientBase.replace('//[actions]//', actionsBody),
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

const clientBase = `type MiddlewareContext<V> = {
  requestConfig: RequestInit;
  variables: V;
  config: FetcherConfig<V>;
};

type Middleware<V = any> = (
  config: MiddlewareContext<V>
) => MiddlewareContext<V>;

export type FetcherConfig<V = any> = {
  apiURL: string;
  headers?: { [key: string]: string };
  query: string;
  entityName: string;
  schemaKey: string;
  middleware?: Middleware<V>[] | Middleware<V>;
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

  if (config.middleware) {
    context = applyMiddleware(ensureArray(config.middleware))(context);
  }

  return fetch(context.config.apiURL, context.requestConfig).then(
    async response => {
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
    }
  );
};

export type QueryFetcher = typeof queryFetcher;

export class GraphQLClient {
  apiURL = '/graphql';
  middleware: Middleware<any>[];

  constructor(config: {
    apiURL?: string;
    middleware?: Middleware | Middleware[];
  }) {
    this.middleware = ensureArray(config.middleware);
    
    if (config.apiURL) {
      this.apiURL = config.apiURL;
    }
  }

  exec = <V, R>(_variables: V, _config: FetcherConfig<V>) => {
    return queryFetcher<V, R>(_variables, {
      apiURL: this.apiURL,
      ..._config,
      middleware: [...this.middleware, ...ensureArray(_config.middleware)]
    });
  };

  //[actions]//
}

// compose(f, g, h) is identical to doing (...args) => f(g(h(...args))).
function compose(...funcs: Middleware<any>[]) {
  if (funcs.length === 0) {
    return (arg: any) => arg;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}

const applyMiddleware = <V = any>(middleware: Middleware<V>[]) => {
  return (context: MiddlewareContext<V>) => {
    return compose(...middleware)(context);
  };
};

function ensureArray(el: any) {
  if (!el) return [];
  if (Array.isArray(el)) return el;
  return [el];
}
`;
