import fs from 'fs';
import ts from 'typescript';
import { printFromEndpoint } from '..';

// @ts-ignore
global.fetch = require('node-fetch');

export const TEST_API = 'https://gitlab.com/api/graphql';

export async function getJSFile(tsContet: string) {
  const tsConfigText = fs.readFileSync(
    process.cwd() + '/tsconfig.json',
    'utf8'
  );
  let config: any = {};
  eval(`config = ${tsConfigText}`);
  config.compilerOptions.inlineSourceMap = false;
  let result = ts.transpileModule(tsContet, config);
  return result.outputText;
}

export async function getTSFile() {
  const client = await printFromEndpoint(TEST_API);
  if (client.status !== 'ok') {
    throw new Error(client.message);
  }
  return client.client;
}

export async function getClient() {
  const tsContent = await getTSFile();
  const js = await getJSFile(tsContent);
  const Client = eval(js);
  const { client } = new Client({ url: TEST_API });
  return client;
}
