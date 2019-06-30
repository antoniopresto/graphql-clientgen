import fs from 'fs';
import ts from 'typescript';
import { printFromEndpoint } from '..';

// @ts-ignore
global.fetch = require('node-fetch');

export const TEST_API = 'https://gitlab.com/api/graphql';

// return a GraphQLClient class from a ts source text
export async function transpileTSSource(tsContent: string) {
  const tsConfigText = fs.readFileSync(
    process.cwd() + '/tsconfig.json',
    'utf8'
  );
  let config: any = {};
  eval(`config = ${tsConfigText}`);
  config.compilerOptions.inlineSourceMap = false;
  const js = ts.transpile(tsContent, config);

  const GraphQLClient = new Function(`
    const exports = {};
    ${js};
    return GraphQLClient;
  `);

  return GraphQLClient();
}

export async function getTSFile() {
  const client = await printFromEndpoint(TEST_API);
  if (client.status !== 'ok') {
    throw new Error(client.message);
  }
  return client.client;
}

export async function getMethodsFromEndpoint(url = TEST_API) {
  const tsContent = await getTSFile();
  const GraphQLClient = await transpileTSSource(tsContent);
  const { methods } = new GraphQLClient({ url });
  return methods;
}
