import { plugin as tsPlugin } from '@graphql-codegen/typescript';
import { GraphQLSchema } from 'graphql';
import fs from 'fs';

import { generateQuery } from './expand-client-fields';
import { getResolversHelper } from './resolversHelper';
import { prettify } from '../utils/prettify';

const got = require('got');

function mountClient(schema: GraphQLSchema, clientBase: string) {
  let prependBody = '';

  const storeSet = getResolversHelper(schema);
  const storeItems = [...storeSet.values()];

  const queryHelpers = generateQuery({ schema });

  let queriesStr = `
    export const query = {
  `;

  let actionsBody = `
    client = {
  `;

  storeItems.forEach(info => {
    let clientEntry = ``;

    const queryHelper = queryHelpers.get(info.schemaKey);

    if (!queryHelper) {
      console.log('available schema keys:', [...queryHelpers.keys()]);
      throw new Error(`no client generated for ${info.schemaKey}`);
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
      }: (${variablesDeclaration}config: Partial<FetcherConfig<${
      info.argsTSName
    }, ${info.returnTSName}>> = {}) => {
        return this.exec<${info.argsTSName}, ${info.returnTSName}>(${
      hasArgs ? 'variables, ' : '{}, '
    } {
        url: this.url,
        entityName: '${info.entityName}',
        schemaKey: '${info.schemaKey}',
        query: query.${info.schemaKey}(config.fragment), ...config});
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
  const clientBase = await getClientBase();

  const tsTypes = await tsPlugin(schema, [], {});

  const tsContent =
    typeof tsTypes === 'string'
      ? tsTypes
      : (tsTypes.prepend || []).join('\n') + '\n\n' + tsTypes.content;

  const { prependBody, clientBody } = mountClient(schema, clientBase);

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

const getClientBase = async () => {
  const dest = __dirname + '/clientbase.ts';
  const url =
    'https://raw.githubusercontent.com/antoniopresto/graphql-clientgen/2c47af9b8512bdeaf1bb68fd6e059a5e704b533f/src/lib/clientbase.ts';

  if (fs.existsSync(dest)) {
    return fs.readFileSync(dest, 'utf8');
  }

  const response = await got(url);
  fs.writeFileSync(dest, response.body);
  return response.body;
};
