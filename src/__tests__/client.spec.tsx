import * as React from 'react';
import ava from 'ava';
import { mount } from 'enzyme';
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
import '../dev/prepareClientEnv';

const test = ava.serial;

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

test('should get store from useClient', t => {
  const { Provider, Client, useClient } = imported;
  const client = new Client({ url: TEST_API });

  const Child = () => {
    const [, , store] = useClient('echo');
    return <div>{Object.keys(store.client.methods).join('')}</div>;
  };

  const wrapper = mount(
    <Provider client={client}>
      <Child />
    </Provider>
  );

  t.is(
    wrapper.find('div').getDOMNode().innerHTML,
    Object.keys(client.methods).join('')
  );

  t.is(Object.keys(client.methods).length > 1, true);
});

test('should get response from useClient', async t => {
  const { Provider, Client, useClient } = imported;
  const client = new Client({ url: TEST_API });
  let resolve: Function;
  const promise = new Promise(r => (resolve = r));

  const Child = () => {
    const [state, , store] = useClient('echo', { variables: { text: 'hey' } });

    React.useEffect(() => {
      return store.subscribe(state => {
        if (state.resolved) {
          resolve();
        }
      });
    }, []);

    return <div>{state.result}</div>;
  };

  const wrapper = mount(
    <Provider client={client}>
      <Child />
    </Provider>
  );

  await promise;

  t.is(wrapper.getDOMNode().innerHTML, 'mock');
});

test('should render only 3 times', async t => {
  const { Provider, Client, useClient } = imported;
  const client = new Client({ url: TEST_API });
  let resolve: Function;
  const promise = new Promise(r => (resolve = r));
  let renderCount = 0;

  const Child = () => {
    const [state] = useClient('echo', { variables: { text: 'hey' } });

    React.useEffect(() => {
      if (state.result) {
        resolve(state);
      }
    }, [state.loading]);

    renderCount++;

    return <div>{state.result}</div>;
  };

  const wrapper = mount(
    <Provider client={client}>
      <Child />
    </Provider>
  );

  await promise;

  t.is(wrapper.getDOMNode().innerHTML, 'mock');
  t.is(renderCount, 3);
});

// default query and the first query in useEffect should render at
// same time(batch), the second in setTimeout should render alone
// the component should render for 6 state changes
test('should render loading state in the correct order', async t => {
  const { Provider, Client, useClient } = imported;
  const client = new Client({ url: TEST_API });
  let resolve: Function;
  const promise = new Promise(r => (resolve = r));
  let loadingStates: (boolean | undefined)[] = [];

  const Child = () => {
    const [state, echo] = useClient('echo', { variables: { text: 'hey' } });

    React.useEffect(() => {
      echo({ text: 'how' }).then(() => {
        setTimeout(() => {
          echo({ text: 'lets go!' }).then(() => resolve());
        }, 200);
      });
    }, []);

    loadingStates.push(state.loading);

    return <div>{state.result}</div>;
  };

  const wrapper = mount(
    <Provider client={client}>
      <Child />
    </Provider>
  );

  await promise;

  t.is(wrapper.getDOMNode().innerHTML, 'mock');
  t.deepEqual(loadingStates, [
    false, // initial
    true, // started first batch - update state from default fetch
    true, // second fetch should be attached to the first batch queue
    false, // finish first batch fetch
    false, // start second batch fetch
    true, // start loading
    false // finish second batch
  ]);
});
