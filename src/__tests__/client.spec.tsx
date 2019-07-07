import * as React from 'react';
import ava from 'ava';
import sinon from 'sinon';
import { mount } from 'enzyme';
import {
  TEST_API,
  hope,
  fetchMock,
  getGeneratedModules,
  mapObjectTypes
} from '../dev/helpers';

import '../dev/prepareClientEnv';

const test = ava.serial;

ava.afterEach(() => {
  sinon.restore();
});

test('should import generated files', async t => {
  const { Client, Provider, Store, useClient } = await getGeneratedModules();

  t.is(typeof Client, 'function');
  t.is(typeof Provider, 'function');
  t.is(typeof Store, 'function');
  t.is(typeof useClient, 'function');
});

test('should mount node with Provider', async t => {
  const { Provider, Client, Context } = await getGeneratedModules();
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

test('should get store from useClient', async t => {
  const { Provider, Client, useClient } = await getGeneratedModules();
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
  const { Provider, Client, useClient } = await getGeneratedModules();
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
  const { Provider, Client, useClient } = await getGeneratedModules();
  const client = new Client({ url: TEST_API });
  const { resolve, promise } = hope();
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
  const { Provider, Client, useClient } = await getGeneratedModules();
  const client = new Client({ url: TEST_API });
  const { promise, resolve } = hope();
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

test('store should batch multiple queries', async t => {
  const stub = sinon.stub(global, 'fetch').callsFake(fetchMock);
  const {
    Provider,
    Client,
    useClient,
    Context,
    Store
  } = await getGeneratedModules();
  const client = new Client({ url: TEST_API });
  const firstCall = hope();

  let listen = false;
  let context = {} as (typeof Store.prototype);
  const promises: Promise<any>[] = [];
  let stateResults: (string | null | undefined)[] = [];

  const Child = () => {
    context = React.useContext(Context);

    if (!listen) {
      listen = true;
      context.subscribe((s, c) => {
        if (c === 'echo(text:predefined_query)' && s.resolved) {
          firstCall.resolve();
        }
      });
    }

    const [state, echo] = useClient('echo', {
      variables: { text: 'predefined_query' }
    });

    stateResults.push(state.result);

    React.useEffect(() => {
      promises.push(echo({ text: 'shouldBatch1' }));
      promises.push(echo({ text: 'shouldBatch2' }));
      promises.push(echo({ text: 'shouldBatch3' }));
      promises.push(echo({ text: 'shouldBatch4' }));
    }, []);

    return <div>{state.result}</div>;
  };

  const wrapper = mount(
    <Provider client={client}>
      <Child />
    </Provider>
  );

  t.is(promises.length, 4);

  await firstCall.promise;
  await Promise.all(promises);

  t.is(wrapper.getDOMNode().innerHTML, 'mock');
  t.is(stub.callCount, 1);
});

test('store should cache', async t => {
  const stub = sinon.stub(global, 'fetch').callsFake(fetchMock);
  const { Provider, Client, useClient, Context } = await getGeneratedModules();
  const client = new Client({ url: TEST_API });

  const firstCall = hope();
  let renderCount = 0;
  let aborts: string[] = []; // should abort when cached
  const promises: Promise<any>[] = [];
  const errors: any[] = [];

  let listen = false;

  const Child = () => {
    const context = React.useContext(Context);

    if (!listen) {
      listen = true;
      context.subscribe((s, c) => {
        const testStateID = `${s.context.action}_${c}`;

        if (s.context.errors) {
          errors.push({
            testStateID,
            errors: s.context.errors,
            requestConfig: s.context.requestConfig
          });
        }

        if (s.context.action === 'abort') {
          aborts.push(testStateID);
        }

        if (c === 'echo(text:predefined_query)' && s.resolved) {
          firstCall.resolve();
        }
      });
    }

    const [state, echo] = useClient('echo', {
      variables: { text: 'predefined_query' }
    });

    const [namespace, callNamespace] = useClient('namespace');

    React.useEffect(() => {
      (async () => {
        promises.push(echo({ text: 'shouldCache1' }));
        promises.push(echo({ text: 'shouldCache1' }));
        promises.push(echo({ text: 'shouldCache1' }));
        promises.push(echo({ text: 'shouldCache1' }));
        promises.push(echo({ text: 'shouldCache2' }));
        promises.push(callNamespace({ fullPath: 'myFullPath' }));
      })();
    }, []);

    renderCount++;

    return (
      <div>
        <span className={'echo'}>{state.result}</span>
        <span className={'fullPath'}>
          {namespace.result && namespace.result.fullPath}
        </span>
      </div>
    );
  };

  const wrapper = mount(
    <Provider client={client}>
      <Child />
    </Provider>
  );

  t.is(promises.length, 6);
  const promisedResults = await Promise.all(promises);
  await firstCall.promise;

  const namespaceResult = promisedResults[5].result;

  t.deepEqual(
    mapObjectTypes(namespaceResult),

    mapObjectTypes({
      description: 'mock',
      descriptionHtml: 'mock',
      fullName: 'mock',
      fullPath: 'e8be6f80-7e23-4508-9a09-2e37e4651a77',
      id: '6820e8fa-76c6-4acc-83c3-8162a170f5e3',
      lfsEnabled: true,
      name: 'mock',
      path: 'mock',
      requestAccessEnabled: false,
      visibility: 'mock'
    })
  );

  t.is(stub.callCount, 1);

  t.is(errors.length, 0);

  t.is(wrapper.find('.echo').getDOMNode().innerHTML, 'mock');

  t.is(
    wrapper.find('.fullPath').getDOMNode().innerHTML,
    namespaceResult.fullPath
  );

  t.is(aborts.length, 3);

  // 1 initial state + 2 for echo state + 2 for namespace state
  // although only one fetch was made
  t.is(renderCount, 5);
});

test('should make default fetch even if cache is false', async t => {
  const stub = sinon.stub(global, 'fetch').callsFake(fetchMock);
  const {
    Provider,
    Client,
    useClient,
    Context,
    Store
  } = await getGeneratedModules();

  const client = new Client({ url: TEST_API });
  const firstCall = hope();

  let context = {} as (typeof Store.prototype);
  let stateResults: ((string | null | undefined)[])[] = [];

  const Child = () => {
    context = React.useContext(Context);

    const [state] = useClient('echo', {
      variables: { text: 'testingCache' },
      config: {
        cache: false,
      }
    });
    
    stateResults.push([state.result]);

    if (state.result) {
      firstCall.resolve();
    }
    
    return <div>{state.result}</div>;
  };

  const wrapper = mount(
    <Provider client={client}>
      <Child />
    </Provider>
  );

  await firstCall.promise;

  t.is(wrapper.getDOMNode().innerHTML, 'mock');
  t.is(stub.callCount, 1);
  t.is(stateResults.length, 3);
  t.deepEqual(context.getState(), {});
});

test('should ignore cache when cache is false', async t => {
  const stub = sinon.stub(global, 'fetch').callsFake(fetchMock);
  const {
    Provider,
    Client,
    useClient,
    Context,
    Store
  } = await getGeneratedModules();

  const client = new Client({ url: TEST_API });
  const firstCall = hope();
  const secondCall = hope();

  let context = {} as (typeof Store.prototype);
  let stateResults: ((string | null | undefined)[])[] = [];

  const Child = () => {
    context = React.useContext(Context);

    const [state, echo] = useClient('echo', {
      variables: { text: 'testingCache' },
      config: {
        cache: false,
        async middleware(ctx) {
          if (ctx.action === 'complete') {
            firstCall.resolve();
          }
          return ctx;
        }
      }
    });

    React.useEffect(() => {
      firstCall.promise.then(() => {
        echo({ text: 'testingCache' }, { cache: false }).then(() =>
          secondCall.resolve()
        );
      });
    }, []);

    stateResults.push([state.result]);

    return <div>{state.result}</div>;
  };

  const wrapper = mount(
    <Provider client={client}>
      <Child />
    </Provider>
  );

  await firstCall.promise;
  await secondCall.promise;

  t.is(wrapper.getDOMNode().innerHTML, 'mock');
  t.is(stub.callCount, 2);
  t.is(stateResults.length, 5);
  t.deepEqual(context.getState(), {});
});

test('should ignore cache when mixed cache false/true', async t => {
  const stub = sinon.stub(global, 'fetch').callsFake(fetchMock);

  const {
    Provider,
    Client,
    useClient,
    Context,
    Store
  } = await getGeneratedModules();

  const client = new Client({ url: TEST_API });
  const firstCall = hope();
  const secondCall = hope();
  const thirdCall = hope();

  let context = {} as (typeof Store.prototype);
  let stateResults: ((string | null | undefined)[])[] = [];

  const Child = () => {
    context = React.useContext(Context);

    const [state, echo] = useClient('echo', {
      variables: { text: 'testingCache' },
      config: {
        cache: false,
        async middleware(ctx) {
          if (ctx.action === 'complete') {
            firstCall.resolve();
          }
          return ctx;
        }
      }
    });

    const [state2, echo2] = useClient('echo', {
      variables: { text: 'testingCache' },
      config: {
        cache: false,
        async middleware(ctx) {
          if (ctx.action === 'complete') {
            secondCall.resolve();
          }
          return ctx;
        }
      }
    });

    React.useEffect(() => {
      (async () => {
        await echo({ text: 'testingCache' }, { cache: false });
        await echo({ text: 'testingCache' });
        await echo2({ text: 'testingCache' }, { cache: false });
        await echo2({ text: 'testingCache' });
        thirdCall.resolve();
      })();
    }, []);

    stateResults.push([state.result, state2.result]);

    return <div>{state.result}</div>;
  };

  const wrapper = mount(
    <Provider client={client}>
      <Child />
    </Provider>
  );

  await firstCall.promise;
  await secondCall.promise;
  await thirdCall.promise;

  t.is(wrapper.getDOMNode().innerHTML, 'mock');

  // 1 call will batch 3 echos (2 in the component body and one in effect)
  // 2 will run without cache
  // 1 will use cache
  t.is(stub.callCount, 3);
});

// TODO
// should make default fetch even if cache is false
// listener should emit even if cache is false
// should wait if have one query with the same cacheKey waiting api response
// should ignore previous cached
// echo({ text: 'predefined_query' }, { cache: false }).then(() => {
//   secondCall.resolve();
// });
