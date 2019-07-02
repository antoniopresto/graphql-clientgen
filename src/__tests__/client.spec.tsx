import * as React from 'react';
import ava from 'ava';
import Adapter from 'enzyme-adapter-react-16';
import { configure, mount } from 'enzyme';
import { transpileTSSource, TEST_API } from '../dev/helpers';
import fs from 'fs-extra';
import { printFromEndpoint } from '..';
import * as path from 'path';
import { GraphQLClient } from '../template/Client';
import {
  GraphQLProvider,
  GraphQLStoreContext,
  useClient
} from '../template/Provider';
import { GraphQLStore } from '../template/Store';

const test = ava.serial;

require('jsdom-global/register');

configure({ adapter: new Adapter() });

const dest = path.resolve(__dirname, '../generated');

const filePaths = {
  client: dest + '/Client.js',
  store: dest + '/Store.js',
  provider: dest + '/Provider.js'
};

// cache imported modules
let imported = {} as {
  Client: typeof GraphQLClient;
  Provider: typeof GraphQLProvider;
  Store: typeof GraphQLStore;
  Context: typeof GraphQLStoreContext;
  useClient: typeof useClient;
};

test('write generated JS files', async t => {
  const response = await printFromEndpoint(TEST_API);
  if (response.status !== 'ok') {
    throw new Error('invalid printFromEndpoint response');
  }
  const { client, store, provider } = response;

  const clientJS = transpileTSSource(client);
  const storeJS = transpileTSSource(store);
  const providerJS = transpileTSSource(provider);

  await fs.mkdirp(dest);
  await fs.writeFile(filePaths.client, clientJS);
  await fs.writeFile(filePaths.store, storeJS);
  await fs.writeFile(filePaths.provider, providerJS);

  t.is(clientJS.length > 100, true);
  t.is(storeJS.length > 100, true);
  t.is(providerJS.length > 100, true);
});

test('should import generated files', async t => {
  const client = await import(filePaths.client);
  const provider = await import(filePaths.provider);
  const store = await import(filePaths.store);

  imported = {
    Client: client.GraphQLClient,
    Provider: provider.GraphQLProvider,
    Store: store.GraphQLStore,
    useClient: provider.useClient,
    Context: provider.GraphQLStoreContext
  };

  t.is(client.__esModule, true);
  t.is(provider.__esModule, true);
  t.is(store.__esModule, true);

  t.is(typeof imported.Client, 'function');
  t.is(typeof imported.Provider, 'function');
  t.is(typeof imported.Store, 'function');
  t.is(typeof imported.useClient, 'function');
});

test('should mount node with Provider', t => {
  const { Provider, Client, Context } = imported;
  const client = new Client({ url: TEST_API });

  const wrapper = mount(
    <Provider client={client}>
      <Context.Consumer>
        {store => <div>{Object.keys(store.client.methods)}</div>}
      </Context.Consumer>
    </Provider>
  );

  t.is(
    wrapper.find('div').getDOMNode().innerHTML,
    Object.keys(client.methods).join('')
  );
});

