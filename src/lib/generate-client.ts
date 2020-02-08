import { plugin as tsPlugin } from '@graphql-codegen/typescript';
import { GraphQLSchema } from 'graphql';
import fs from 'fs';
import path from 'path';

import { generateQuery } from './expand-client-fields';
import { getResolversHelper } from './resolversHelper';
import { prettify } from '../utils/prettify';

function mountClient(schema: GraphQLSchema, clientBase: string) {
  let prependBody = '';

  const storeSet = getResolversHelper(schema);
  const storeItems = [...storeSet.values()];

  const queryHelpers = generateQuery({ schema });

  let queriesStr = `
    export const query = {
  `;

  let methodsType = ``;

  let actionsBody = ``;

  let methodsInfo = ``;

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
          return addTabs(
            `\${parseFragmentConfig(\`${(el || '').trim()}\`, config)}`,
            8
          );
        })
        .join('\n'),
      8
    );

    queriesStr += `
        "${info.schemaKey}": (config?: any) => \`\n${query}\`,
      `;

    const hasArgs = !!info.field.args.length;
    let variablesDeclaration = '{}, ';
    if (hasArgs) {
      variablesDeclaration = `variables, `;
    }

    methodsType += `
      ${info.schemaKey} : Method<${info.argsTSName}, ${info.returnTSName}>;
    `;

    methodsInfo += `
      ${info.schemaKey}: ${JSON.stringify(info)},
    `;

    clientEntry += `
      ${info.schemaKey}: (${variablesDeclaration}config) => {
        return this.exec(${hasArgs ? 'variables, ' : '{}, '} {
        url: this.url,
        entityName: '${info.entityName}',
        schemaKey: '${info.schemaKey}',
        query: query.${info.schemaKey}(config),
        kind: OpKind.${info.kind},
        ...config
        });
        
      },
    `;

    actionsBody += clientEntry;
  });

  // prepend queries
  prependBody += `
      ${queriesStr}
    }
  `;

  return {
    clientBody: clientBase
      .replace('//[prepend]//', prependBody)
      .replace('//[methods]//', actionsBody)
      .replace('//[methodsType]//', methodsType)
      .replace('//[methodsInfo]//', methodsInfo),
    query: [...queryHelpers.values()].reduce(
      (prev, next) => `${prev}\n\n ${next.query}`,
      ''
    )
  };
}

export async function printClient(schema: GraphQLSchema) {
  const base = await getClientBase();

  const tsTypes = await tsPlugin(schema, [], {});

  const tsContent =
    typeof tsTypes === 'string'
      ? tsTypes
      : (tsTypes.prepend || []).join('\n') + '\n\n' + tsTypes.content;

  const { clientBody } = mountClient(
    schema,
    base.client.replace('//[types]//', tsContent)
  );

  const client = await prettify('client.ts', clientBody);

  return {
    ...base,
    client
  };
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

const basePath = path.resolve(__dirname, '../client');

const getClientBase = async () => {
  const client = fs.readFileSync(basePath + '/Client.ts', 'utf8');
  const provider = fs.readFileSync(basePath + '/Provider.ts', 'utf8');
  const store = fs.readFileSync(basePath + '/Store.ts', 'utf8');

  return {
    client,
    provider,
    store
  };
};
