import test from 'ava';
import { transpileTSSource, TEST_API } from '../dev/helpers';
import fs from 'fs-extra';
import { printFromEndpoint } from '..';
import * as path from 'path';

// using a folder named git to prevent watcher to reload. just works
const dest = path.resolve(__dirname, '../generated');
const filePaths = {
  client: dest + '/Client.js',
  store: dest + '/Store.js',
  provider: dest + '/Provider.js'
};

test('write generated JS files', async t => {
  const response = await printFromEndpoint(TEST_API);
  if (response.status !== 'ok') {
    throw new Error('invalid printFromEndpoint response');
  }
  const { client, store } = response;

  const clientJS = transpileTSSource(client);
  const storeJS = transpileTSSource(store);
  // const providerJS = transpileTSSource(provider);

  await fs.mkdirp(dest);
  await fs.writeFile(filePaths.client, clientJS);
  await fs.writeFile(filePaths.store, storeJS);
  // await fs.writeFile(filePaths.provider, providerJS);

  t.is(clientJS.length > 100, true);
  t.is(storeJS.length > 100, true);
  // t.is(providerJS.length > 100, true);
});

test('should import generated files', async t => {
  const client = await import(filePaths.client);
  // const provider = await import(filePaths.provider);
  const store = await import(filePaths.store);

  t.is(client.__esModule, true);
  // t.is(provider.__esModule, true);
  t.is(store.__esModule, true);
});
