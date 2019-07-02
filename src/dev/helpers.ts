import ts from 'typescript';
import { printFromEndpoint } from '..';
import * as fs from 'fs';

// @ts-ignore
global.fetch = require('node-fetch');

const CWD = process.cwd();
export const TEST_API = 'https://gitlab.com/api/graphql';

function loadConfig(mainPath = CWD) {
  const fileName = ts.findConfigFile(mainPath, ts.sys.fileExists);
  if (!fileName) throw Error('tsconfig not found');
  const text = ts.sys.readFile(fileName) || '';
  const loadedConfig = ts.parseConfigFileTextToJson(fileName, text).config;
  return ts.parseJsonConfigFileContent(
    loadedConfig,
    ts.sys,
    CWD,
    undefined,
    fileName
  );
}

export function transpileTSSource(tsContent: string) {
  return ts.transpile(tsContent, loadConfig().raw);
}

// return a GraphQLClient class from a ts source text
export async function getClientFromTSSource(tsContent: string) {
  const js = ts.transpile(tsContent, loadConfig().raw);

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
  const GraphQLClient = await getClientFromTSSource(tsContent);
  const { methods } = new GraphQLClient({ url });
  return methods;
}
