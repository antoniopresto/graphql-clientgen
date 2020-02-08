import * as React from 'react';

import { TEST_API, getGeneratedModules, hope, delay } from './helpers';

import { render } from '@testing-library/react';

describe('client', function() {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should import generated files', async () => {
    const { Client, Provider, Store, useClient } = await getGeneratedModules();

    expect(typeof Client).toBe('function');
    expect(typeof Provider).toBe('function');
    expect(typeof Store).toBe('function');
    expect(typeof useClient).toBe('function');
  });

  test('should mount node with Provider', async () => {
    const { Provider, Client, Context } = await getGeneratedModules();
    const client = new Client({ url: TEST_API });

    const wrapper: any = render(
      <Provider client={client}>
        <Context.Consumer>
          {store => <div>{Object.keys(store.client.methods)}</div>}
        </Context.Consumer>
      </Provider>
    );

    expect(wrapper.container.firstChild.innerHTML).toBe(
      Object.keys(client.methods).join('')
    );
  });

  test('should get store from useClient', async () => {
    const { Provider, Client, useClient } = await getGeneratedModules();
    const client = new Client({ url: TEST_API });

    const Child = () => {
      const { store } = useClient('echo');
      return <div>{Object.keys(store.client.methods).join('')}</div>;
    };

    const wrapper: any = render(
      <Provider client={client}>
        <Child />
      </Provider>
    );

    expect(wrapper.container.firstChild.innerHTML).toBe(
      Object.keys(client.methods).join('')
    );

    expect(Object.keys(client.methods).length > 1).toBe(true);
  });

  test('should get response from useClient', async () => {
    const { Provider, Client, useClient } = await getGeneratedModules();

    const client = new Client({ url: TEST_API });
    let resolve: Function;
    const promise = new Promise(r => (resolve = r));

    const Child = () => {
      const echoState = useClient('echo', {
        variables: { text: 'hey' },
        fetchOnMount: true
      });

      React.useEffect(() => {
        return echoState.store.subscribe(state => {
          if (state.resolved) {
            resolve();
          }
        });
      }, []);

      return (
        <div>
          {echoState.result}
          {echoState.error}
        </div>
      );
    };

    const wrapper: any = render(
      <Provider client={client}>
        <Child />
      </Provider>
    );

    await promise;

    expect(wrapper.container.firstChild.innerHTML).toBe('nil says: hey');
  });

  test('should merge initial and fetch variables', async () => {
    const originalFetch = global.fetch;

    let body: any[] = [];

    jest.spyOn(global, 'fetch').mockImplementation((url, config) => {
      body.push(JSON.parse(config!.body as string).variables);
      return originalFetch(url, config);
    });

    const { Provider, Client, useClient } = await getGeneratedModules();

    const client = new Client({ url: TEST_API });

    const Child = () => {
      useClient('echo', {
        variables: { text: 'hey' },
        fetchOnMount: true
      });

      const echo2 = useClient('echo');

      React.useEffect(() => {
        echo2.fetch({ variables: { text: 'how' } });

        setTimeout(() => {
          echo2.fetch({ variables: { text: 'lets go', foo: 'bar' } });
        }, 100);
      }, []);

      return null;
    };

    render(
      <Provider client={client}>
        <Child />
      </Provider>
    );

    await delay(500);

    expect(body).toEqual([
      {
        text_0: 'hey',
        text_1: 'how'
      },
      {
        foo_0: 'bar',
        text_0: 'lets go'
      }
    ]);
  });

  test('should handle fetchOnMount on queries', async () => {
    const { Provider, Client, useClient } = await getGeneratedModules();

    const client = new Client({ url: TEST_API });

    const Child = () => {
      const echoState = useClient('echo', {
        variables: { text: 'hey' },
        fetchOnMount: true
      });

      return (
        <div>
          {echoState.result}
          {echoState.error}
        </div>
      );
    };

    const wrapper: any = render(
      <Provider client={client}>
        <Child />
      </Provider>
    );

    await delay(300);

    expect(wrapper.container.firstChild.innerHTML).toBe('nil says: hey');
  });

  test('should handle fetchOnMount on mutations', async () => {
    const { Provider, Client, useClient } = await getGeneratedModules();

    const client = new Client({ url: TEST_API });

    const Child = () => {
      const echoState = useClient('PostCreateOne', {
        variables: { title: 'hey' },
        fetchOnMount: true
      });

      return (
        <div>{typeof (echoState.result && echoState.result.recordId)}</div>
      );
    };

    const wrapper: any = render(
      <Provider client={client}>
        <Child />
      </Provider>
    );

    await delay(300);

    expect(wrapper.container.firstChild.innerHTML).toBe('string');
  });

  test('useClient should update state', async () => {
    const { Provider, Client, useClient } = await getGeneratedModules();
    const client = new Client({ url: TEST_API });

    let renderCount = 0;

    const hope1 = hope();
    const hope2 = hope();
    const hope3 = hope();

    const Child = () => {
      const echo1 = useClient('echo');

      const echo2 = useClient('echo', {
        variables: { text: 'foo' },
        fetchOnMount: true
      });

      const echo3 = useClient('echo');

      if (renderCount === 0) {
        setTimeout(() => {
          echo1.fetch({ variables: { text: 'echo1' } }).then(() => {
            echo3.fetch({ variables: { shouldThrow: 1234 } });
          });
        }, 100);
      }

      if (echo1.resolved) {
        hope1.resolve(echo1);
      }

      if (echo2.resolved) {
        hope2.resolve(echo2);
      }

      if (echo3.resolved) {
        hope3.resolve(echo3);
      }

      renderCount++;
      return <div>{echo2.result}</div>;
    };

    const wrapper: any = render(
      <Provider client={client}>
        <Child />
      </Provider>
    );

    const finalState1 = await hope1.promise;
    const finalState2 = await hope2.promise;
    const finalState3 = await hope3.promise;

    expect(finalState1).toMatchObject({
      error: null,
      loading: false,
      resolved: true,
      result: 'nil says: echo1'
    });

    expect(finalState2).toMatchObject({
      error: null,
      loading: false,
      resolved: true,
      result: 'nil says: foo'
    });

    expect(finalState3).toMatchObject({
      error: 'Variable "$text_0" of required type "String!" was not provided.',
      loading: false,
      resolved: true,
      result: null
    });

    expect(wrapper.container.firstChild.innerHTML).toBe('nil says: foo');
  });

  test('should render only 2 times', async () => {
    const { Provider, Client, useClient } = await getGeneratedModules();
    const client = new Client({ url: TEST_API });
    const { resolve, promise } = hope();
    let renderCount = 0;

    const Child = () => {
      const state = useClient('echo', {
        variables: { text: 'hey' },
        fetchOnMount: true
      });

      if (state.result) {
        resolve(state);
      }

      renderCount++;

      return <div>{state.result}</div>;
    };

    const wrapper = render(
      <Provider client={client}>
        <Child />
      </Provider>
    );

    await promise;

    expect(wrapper.container.querySelector('div')!.innerHTML).toBe(
      'nil says: hey'
    );
    expect(renderCount).toBe(3);
  });

  test('store should batch multiple queries', async () => {
    const stub = jest.spyOn(global, 'fetch');

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
    let context = {} as typeof Store.prototype;
    const promises: Promise<any>[] = [];

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

      const { fetch: echo, ...state } = useClient('echo', {
        variables: { text: 'predefined_query' },
        fetchOnMount: true
      });

      React.useEffect(() => {
        promises.push(echo({ variables: { text: 'shouldBatch1' } }));
        promises.push(echo({ variables: { text: 'shouldBatch2' } }));
        promises.push(echo({ variables: { text: 'shouldBatch3' } }));
        promises.push(echo({ variables: { text: 'shouldBatch4' } }));
      }, []);

      return <div>{state.result}</div>;
    };

    const wrapper = render(
      <Provider client={client}>
        <Child />
      </Provider>
    );

    expect(promises.length).toBe(4);

    await firstCall.promise;
    await Promise.all(promises);

    expect(wrapper.container.querySelector('div')!.innerHTML).toBe(
      'nil says: shouldBatch4'
    );
    expect(stub).toBeCalledTimes(1);
  });

  test('store should cache', async () => {
    const stub = jest.spyOn(global, 'fetch');

    const {
      Provider,
      Client,
      useClient,
      Context
    } = await getGeneratedModules();

    const client = new Client({ url: TEST_API });

    const firstCall = hope();
    let renderCount = 0;
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

          if (c === 'echo(text:predefined_query)' && s.resolved) {
            firstCall.resolve();
          }
        });
      }

      const { fetch: echo, ...state } = useClient('echo', {
        variables: { text: 'predefined_query' },
        fetchOnMount: true
      });

      const posts = useClient('PostFindMany');

      React.useEffect(() => {
        (async () => {
          promises.push(echo({ variables: { text: 'shouldCache1' } }));
          promises.push(echo({ variables: { text: 'shouldCache1' } }));
          promises.push(echo({ variables: { text: 'shouldCache1' } }));
          promises.push(echo({ variables: { text: 'shouldCache1' } }));
          promises.push(echo({ variables: { text: 'shouldCache2' } }));
          promises.push(posts.fetch({}));
        })();
      }, []);

      renderCount++;

      return (
        <div>
          <span className={'echo'}>{state.result}</span>
          <span className={'posts'}>{posts.result && posts.result.length}</span>
        </div>
      );
    };

    const wrapper = render(
      <Provider client={client}>
        <Child />
      </Provider>
    );

    expect(promises.length).toBe(6);
    const promisedResults = await Promise.all(promises);
    await firstCall.promise;

    const postsResult = promisedResults[5].result;

    expect(stub).toBeCalledTimes(1);

    expect(errors.length).toBe(0);

    expect(wrapper.container.querySelector('.echo')!.innerHTML).toBe(
      'nil says: shouldCache2'
    );

    expect(wrapper.container.querySelector('.posts')!.innerHTML).toBe(
      postsResult.length + ''
    );

    // 1 initial + 2 for echo state + 2 for namespace state
    // although only one fetch was made
    expect(renderCount).toBe(5);
  });

  test('should make default fetch even if cache is false', async () => {
    const stub = jest.spyOn(global, 'fetch');
    const { Provider, Client, useClient } = await getGeneratedModules();

    const client = new Client({ url: TEST_API });
    const firstCall = hope();

    let stateResults: (string | null | undefined)[][] = [];

    const Child = () => {
      const state = useClient('echo', {
        variables: { text: 'testingCache' },
        cache: false,
        fetchOnMount: true
      });

      stateResults.push([state.result]);

      if (state.result) {
        firstCall.resolve();
      }

      return <div>{state.result}</div>;
    };

    const wrapper = render(
      <Provider client={client}>
        <Child />
      </Provider>
    );

    await firstCall.promise;

    expect(wrapper.container.querySelector('div')!.innerHTML).toBe(
      'nil says: testingCache'
    );
    expect(stub).toBeCalledTimes(1);
    expect(stateResults.length).toBeLessThan(4);
  });

  test('should ignore cache when cache is false', async () => {
    const stub = jest.spyOn(global, 'fetch');
    const { Provider, Client, useClient } = await getGeneratedModules();

    const client = new Client({ url: TEST_API });
    const firstCall = hope();
    const secondCall = hope();

    let stateResults: (string | null | undefined)[][] = [];

    const Child = () => {
      const { fetch: echo, ...state } = useClient('echo', {
        variables: { text: 'testingCache' },
        cache: false,
        async middleware(ctx: any) {
          if (ctx.action === 'complete') {
            firstCall.resolve();
          }
          return ctx;
        },
        fetchOnMount: true
      });

      React.useEffect(() => {
        firstCall.promise.then(() => {
          echo({ variables: { text: 'testingCache' }, cache: false }).then(() =>
            secondCall.resolve()
          );
        });
      }, []);

      stateResults.push([state.result]);

      return <div>{state.result}</div>;
    };

    const wrapper = render(
      <Provider client={client}>
        <Child />
      </Provider>
    );

    await firstCall.promise;
    await secondCall.promise;

    expect(wrapper.container.querySelector('div')!.innerHTML).toBe(
      'nil says: testingCache'
    );
    expect(stub).toBeCalledTimes(2);
  });

  test('should ignore cache when mixed cache false/true', async () => {
    const stub = jest.spyOn(global, 'fetch');

    const { Provider, Client, useClient } = await getGeneratedModules();

    const client = new Client({ url: TEST_API });
    const firstCall = hope();
    const secondCall = hope();
    const thirdCall = hope();

    const Child = () => {
      const echo = useClient('echo', {
        variables: { text: 'testingCache' },
        cache: false,
        async middleware(ctx: any) {
          if (ctx.action === 'complete') {
            firstCall.resolve();
          }
          return ctx;
        },
        fetchOnMount: true
      });

      const echo2 = useClient('echo', {
        variables: { text: 'testingCache' },
        cache: false,
        async middleware(ctx) {
          if (ctx.action === 'complete') {
            secondCall.resolve();
          }
          return ctx;
        },
        fetchOnMount: true
      });

      React.useEffect(() => {
        (async () => {
          await echo.fetch({
            variables: { text: 'testingCache' },
            cache: false
          }); // this will batch with the first 2 calls
          await echo.fetch({
            variables: { text: 'testingCache' },
            cache: true
          }); // this should use cache
          await echo2.fetch({
            variables: { text: 'testingCache' },
            cache: false
          }); // this will run without cache
          await echo2.fetch({
            variables: { text: 'testingCache' },
            cache: true
          }); // this should use cache
          thirdCall.resolve();
        })();
      }, []);

      return <div>{echo.result}</div>;
    };

    const wrapper = render(
      <Provider client={client}>
        <Child />
      </Provider>
    );

    await firstCall.promise;
    await secondCall.promise;
    await thirdCall.promise;

    expect(wrapper.container.querySelector('div')!.innerHTML).toBe(
      'nil says: testingCache'
    );

    // 1 call will batch 3 echos (2 in the component body and one in effect)
    // 2 will use cache
    // 1 will run without cache
    expect(stub).toBeCalledTimes(2);
  });

  test('should run listener even if cache is false', async () => {
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

    let context = {} as typeof Store.prototype;

    let listen = false;
    let subscription1Count = 0;

    const Child = () => {
      context = React.useContext(Context);

      if (!listen) {
        listen = true;
        context.subscribe((state, requestSignature) => {
          if (
            requestSignature === 'echo(text:default_query)' &&
            state.resolved
          ) {
            firstCall.resolve(requestSignature);
            subscription1Count++;
          }

          if (requestSignature === 'echo(text:second_call)' && state.resolved) {
            secondCall.resolve(requestSignature);
          }
        });
      }

      const echo = useClient('echo', {
        variables: { text: 'default_query' },
        cache: false,
        fetchOnMount: true
      });

      React.useEffect(() => {
        (async () => {
          await echo.fetch({
            variables: { text: 'second_call' },
            cache: false
          });
        })();
      }, []);

      return <div>{echo.result}</div>;
    };

    render(
      <Provider client={client}>
        <Child />
      </Provider>
    );

    expect(await firstCall.promise).toBe('echo(text:default_query)');
    expect(await secondCall.promise).toBe('echo(text:second_call)');
    expect(subscription1Count).toBe(1);
    expect(subscription1Count).toBe(1);
  });

  test('should not change the loadingState of an already loaded item', async () => {
    const stub = jest.spyOn(global, 'fetch');

    const { Provider, Client, useClient } = await getGeneratedModules();

    const client = new Client({ url: TEST_API });
    const firstCall = hope();
    const secondCall = hope();

    let stateLoadingChanges = {
      1: [] as boolean[],
      2: [] as boolean[],
      3: [] as boolean[]
    };

    function pushIfDiff(value: boolean, key: keyof typeof stateLoadingChanges) {
      const entry = stateLoadingChanges[key];
      const lastEntryValue = entry[entry.length - 1];
      if (lastEntryValue !== value) {
        stateLoadingChanges[key].push(value);
      }
    }

    const Child = () => {
      const state1 = useClient('echo', {
        variables: { text: 'holly shit' },
        cache: false,
        async middleware(ctx) {
          if (ctx.action === 'complete') {
            firstCall.resolve(ctx.result);
          }
          return ctx;
        },
        fetchOnMount: true
      });

      const state2 = useClient('echo');

      const state3 = useClient('echo');

      React.useEffect(() => {
        firstCall.promise.then(() => {
          state2.fetch({ variables: { text: 'hy' } }).then(() => {
            state3
              .fetch({ variables: { text: 'hy' }, cache: false })
              .then(() => {
                secondCall.resolve();
              });
          });
        });
      }, []);

      pushIfDiff(state1.loading, 1);
      pushIfDiff(state2.loading, 2);
      pushIfDiff(state3.loading, 3);

      return <div>{state3.result}</div>;
    };

    const wrapper = render(
      <Provider client={client}>
        <Child />
      </Provider>
    );

    await secondCall.promise;

    expect(stub).toBeCalledTimes(3);

    expect(stateLoadingChanges[1]).toEqual([false, true, false]);
    expect(stateLoadingChanges[2]).toEqual([false, true, false]);
    expect(stateLoadingChanges[3]).toEqual([false, true, false]);

    expect(wrapper.container.querySelector('div')!.innerHTML).toBe(
      'nil says: hy'
    );
  });

  test('one cacheable request should wait if there is one with same signature in progress', async () => {
    const originalFetch = global.fetch;

    const stub = jest
      .spyOn(global, 'fetch')
      .mockImplementation(async (...args) => {
        await delay(500);
        return originalFetch(...args);
      });

    const {
      Provider,
      Client,
      useClient,
      Context
    } = await getGeneratedModules();

    const client = new Client({ url: TEST_API });
    const secondCall = hope();

    let stateLoadingChanges = {
      1: [] as boolean[],
      2: [] as boolean[],
      3: [] as boolean[]
    };

    function pushIfDiff(value: boolean, key: keyof typeof stateLoadingChanges) {
      const entry = stateLoadingChanges[key];
      const lastEntryValue = entry[entry.length - 1];
      if (lastEntryValue !== value) {
        stateLoadingChanges[key].push(value);
      }
    }

    const Child = () => {
      const context = React.useContext(Context);

      const state1 = useClient('echo', {
        variables: { text: 'hy' },
        fetchOnMount: true
      });

      const state2 = useClient('echo');

      React.useEffect(() => {
        // wait batch dispatch first fetch
        setTimeout(() => {
          const current = context.getItem('echo(text:hy)');
          // run one query while another with same signature is loading
          if (current && current.loading) {
            state2
              .fetch({ variables: { text: 'hy' }, cache: true })
              .then(() => {
                secondCall.resolve();
              });
          }
        }, 100);
      }, []);

      pushIfDiff(state1.loading, 1);
      pushIfDiff(state2.loading, 2);

      return <div>{state2.result}</div>;
    };

    const wrapper = render(
      <Provider client={client}>
        <Child />
      </Provider>
    );

    await secondCall.promise;

    expect(stub).toBeCalledTimes(1);

    expect(wrapper.container.querySelector('div')!.innerHTML).toBe(
      'nil says: hy'
    );
  });
});
