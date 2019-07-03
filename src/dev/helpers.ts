import fs from 'fs-extra';
import path from 'path';
import ts from 'typescript';
import { printFromEndpoint } from '..';
import { mockServer as apolloMockServer } from 'graphql-tools';
const Response = require('node-fetch').Response;

const mocksPath = path.resolve(__dirname, '../../../mock');
const gitLabTypeDefs = fs.readFileSync(mocksPath + '/schema.graphql', 'utf8');
const gitLabIntrospection = fs.readFileSync(
  mocksPath + '/introspection.json',
  'utf8'
);

// make got "package" to always return the introspection mock
export function monkeyPatchGot() {
  const got = require('got');
  const original = got.post;
  got.post = () => ({ body: gitLabIntrospection });

  return () => {
    require('got').post = original;
  };
}

const mockServer = apolloMockServer(gitLabTypeDefs, {
  String: () => `mock`
});

// @ts-ignore
global.fetch = async function(url: any, init?: RequestInit) {
  if (typeof url !== 'string')
    throw new Error('fetch url argument is not a string');

  const body: string =
    init && typeof init.body === 'string' ? init.body || '' : '';

  return mockServer.query(JSON.parse(body).query).then(
    res =>
      new Response(JSON.stringify(res), {
        status: 200,
        headers: { 'Content-type': 'application/json' }
      })
  );
};

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
