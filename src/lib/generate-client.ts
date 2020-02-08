import { plugin as tsPlugin } from '@graphql-codegen/typescript';
import { GraphQLSchema } from 'graphql';
import fs from 'fs';
import path from 'path';

import { generateQuery } from './expand-client-fields';
import { getResolversHelper } from './resolversHelper';
import { prettify } from '../utils/prettify';

async function templateValues(schema: GraphQLSchema) {
  let prepend = '';

  const storeSet = getResolversHelper(schema);
  const storeItems = [...storeSet.values()];

  const queryHelpers = generateQuery({ schema });

  let queriesStr = `
    export const query = {
  `;

  let methodsType = ``;

  let methodsMap = ``;

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
      ${info.schemaKey}: (${variablesDeclaration}config, client) => {
        return client.exec(${hasArgs ? 'variables, ' : '{}, '} {
        url: client.url,
        entityName: '${info.entityName}',
        schemaKey: '${info.schemaKey}',
        query: query.${info.schemaKey}(config),
        kind: OpKind.${info.kind},
        ...config
        });
        
      },
    `;

    methodsMap += clientEntry;
  });

  // prepend queries
  prepend += `
      ${queriesStr}
    }
  `;

  const tsTypes = await tsPlugin(schema, [], {});

  const types =
    typeof tsTypes === 'string'
      ? tsTypes
      : (tsTypes.prepend || []).join('\n') + '\n\n' + tsTypes.content;

  return {
    types,
    prepend,
    methods: methodsMap,
    methodsType,
    methodsInfo,
    query: [...queryHelpers.values()].reduce(
      (prev, next) => `${prev}\n\n ${next.query}`,
      ''
    )
  };
}

export async function printClient(schema: GraphQLSchema) {
  const templates = await readTemplates();

  const values = await templateValues(schema);

  function fill(input: string) {
    Object.keys(values).forEach(key => {
      input = input.replace(`//[${key}]//`, (<any>values)[key]);
    });
    return input;
  }

  const types = await prettify('types.ts', fill(templates.types));
  const client = await prettify('client.ts', fill(templates.client));

  return {
    client,
    types
  };
}

const basePath = path.resolve(__dirname, '../template');

const readTemplates = async () => {
  const types = fs.readFileSync(basePath + '/types.txt', 'utf8');
  const client = fs.readFileSync(basePath + '/client.txt', 'utf8');

  return {
    types,
    client
  };
};

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

// const indentString = (
//   string: string,
//   count = 1,
//   options: { indent?: string } = {}
// ) => {
//   options = {
//     indent: ' ',
//     ...options
//   };
//
//   if (typeof options.indent !== 'string') {
//     throw new TypeError(
//       `Expected \`options.indent\` to be a \`string\`, got \`${typeof options.indent}\``
//     );
//   }
//
//   if (count === 0) {
//     return string;
//   }
//
//   const regex = /^(?!\s*$)/gm;
//
//   return string.replace(regex, options.indent.repeat(count));
// };
//
// function removeNL(string = '') {
//   return string.trim().replace(/\n/g, '').replace(/ +/g, ' ');
// }
