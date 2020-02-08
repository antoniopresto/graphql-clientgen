import fs from 'fs-extra';
import path from 'path';
import ts from 'typescript';
import { printFromEndpoint } from '../src/lib/printFromEndpoint';
import { GraphQLClient } from '../src/client/Client';
import {
  GraphQLProvider,
  GraphQLStoreContext,
  useClient
} from '../src/client/Provider';
import { GraphQLStore } from '../src/client/Store';

const CWD = process.cwd();
export const TEST_API = 'http://localhost:3379/graphql';

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

export function hope<T = any>(timeout = 0, rejectOnTimeout = false) {
  let resolve: Function = () => {};
  let reject: Function = () => {};

  const promise = new Promise<T>((s, e) => {
    resolve = s;
    reject = e;
  });

  if (timeout) {
    setTimeout(rejectOnTimeout ? reject : resolve, timeout);
  }

  return { promise, resolve, reject };
}

/**
 * Generate and import modules to test importing the generated code
 */
export async function getGeneratedModules(): Promise<{
  Client: typeof GraphQLClient;
  Provider: typeof GraphQLProvider;
  Store: typeof GraphQLStore;
  Context: typeof GraphQLStoreContext;
  useClient: typeof useClient;
}> {
  const random = Math.floor(Math.random() * 99999999);
  const generatedFilesDest = path.resolve(
    CWD,
    `build/generated/${Date.now()}_${random}`
  );

  const filePaths = {
    client: generatedFilesDest + '/Client.js',
    store: generatedFilesDest + '/Store.js',
    provider: generatedFilesDest + '/Provider.js'
  };

  const response = await printFromEndpoint(TEST_API);

  if (response.status !== 'ok') {
    console.error(response, TEST_API);
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

export async function delay(t = 100) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, t);
  });
}
