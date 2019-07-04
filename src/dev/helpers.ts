import memo from 'lodash/memoize';
import fs from 'fs-extra';
import path from 'path';
import ts from 'typescript';
import { printFromEndpoint } from '..';
import { mockServer as apolloMockServer } from 'graphql-tools';
import { GraphQLClient } from '../template/Client';
import {
  GraphQLProvider,
  GraphQLStoreContext,
  useClient
} from '../template/Provider';
import { GraphQLStore } from '../template/Store';
const Response = require('node-fetch').Response;

const mocksPath = path.resolve(__dirname, '../../../mock');

const gitLabTypeDefs = () => {
  return fs.readFile(mocksPath + '/schema.graphql', 'utf8');
};

const gitLabIntrospection = () => {
  return fs.readFile(mocksPath + '/introspection.json', 'utf8');
};

// make got "package" to always return the introspection mock
(function monkeyPatchGot() {
  const got = require('got');
  const original = got.post;
  got.post = async () => ({ body: await gitLabIntrospection() });

  return () => {
    require('got').post = original;
  };
})();

const mockServer = memo(async () => {
  return apolloMockServer(await gitLabTypeDefs(), {
    String: () => 'mock'
  });
});

export const fetchMock = async function(url: any, init?: RequestInit) {
  if (typeof url !== 'string')
    throw new Error('fetch url argument is not a string');

  const body = JSON.parse(
    init && typeof init.body === 'string' ? init.body || '' : ''
  );

  const server = await mockServer();

  return server.query(body.query, body.variables).then(
    res =>
      new Response(JSON.stringify(res), {
        status: 200,
        headers: { 'Content-type': 'application/json' }
      })
  );
};

global.fetch = fetchMock;

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

export function hope(timeout = 0, rejectOnTimeout = false) {
  let resolve: Function = () => {};
  let reject: Function = () => {};

  const promise = new Promise((s, e) => {
    resolve = s;
    reject = e;
  });

  if (timeout) {
    setTimeout(rejectOnTimeout ? reject : resolve, timeout);
  }

  return { promise, resolve, reject };
}

// cache imported modules
let imported: {
  Client: typeof GraphQLClient;
  Provider: typeof GraphQLProvider;
  Store: typeof GraphQLStore;
  Context: typeof GraphQLStoreContext;
  useClient: typeof useClient;
};

/**
 * Generate and import modules to test importing the generated code
 */
export async function getGeneratedModules(
  useCache = true
): Promise<typeof imported> {
  const generatedFilesDest = path.resolve(__dirname, '../generated');

  const filePaths = {
    client: generatedFilesDest + '/Client.js',
    store: generatedFilesDest + '/Store.js',
    provider: generatedFilesDest + '/Provider.js'
  };

  const response = await printFromEndpoint(TEST_API);
  if (response.status !== 'ok') {
    throw new Error('invalid printFromEndpoint response');
  }
  const { client, store, provider } = response;

  const clientJS = transpileTSSource(client);
  const storeJS = transpileTSSource(store);
  const providerJS = transpileTSSource(provider);

  await fs.mkdirp(generatedFilesDest);
  await fs.writeFile(filePaths.client, clientJS);
  await fs.writeFile(filePaths.store, storeJS);
  await fs.writeFile(filePaths.provider, providerJS);

  const importing = async () => {
    const client = await import(filePaths.client);
    const provider = await import(filePaths.provider);
    const store = await import(filePaths.store);

    return {
      Client: client.GraphQLClient,
      Provider: provider.GraphQLProvider,
      Store: store.GraphQLStore,
      useClient: provider.useClient,
      Context: provider.GraphQLStoreContext
    };
  };

  if (useCache !== false) {
    if (!imported) {
      imported = await importing();
    }
    return imported;
  }

  return importing();
}

/**
 * return the types of object values, sorted by keys
 */
export function mapObjectTypes(object: any) {
  return Object.keys(object)
    .sort()
    .map(key => `${key}__${typeof object[key]}`);
}
