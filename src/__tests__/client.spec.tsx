import * as React from 'react';

import {
  TEST_API,
  hope,
  fetchMock,
  getGeneratedModules,
  mapObjectTypes,
  delayedFetchMock
} from '../dev/helpers';

import { render } from '@testing-library/react';

test('should import generated files', async () => {
  const { Client, Provider, Store, useClient } = await getGeneratedModules();

  expect(typeof Client).toBe('function');
  expect(typeof Provider).toBe('function');
  expect(typeof Store).toBe('function');
  expect(typeof useClient).toBe('function');
});

test('should mount node with Provider', async t => {
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

// test('should get store from useClient', async t => {
//   const { Provider, Client, useClient } = await getGeneratedModules();
//   const client = new Client({ url: TEST_API });
//
//   const Child = () => {
//     const { store } = useClient('echo');
//     return <div>{Object.keys(store.client.methods).join('')}</div>;
//   };
//
//   const wrapper = mount(
//     <Provider client={client}>
//       <Child />
//     </Provider>
//   );
//
//   expect(
//     wrapper.find('div').getDOMNode().innerHTML).toBe(
//     Object.keys(client.methods).join('')
//   );
//
//   expect(Object.keys(client.methods).length > 1).toBe( true);
// });
//
// test('should get response from useClient', async t => {
//   const { Provider, Client, useClient } = await getGeneratedModules();
//   const client = new Client({ url: TEST_API });
//   let resolve: Function;
//   const promise = new Promise(r => (resolve = r));
//
//   const Child = () => {
//     const echoState = useClient('echo', { variables: { text: 'hey' } });
//
//     React.useEffect(() => {
//       return echoState.store.subscribe(state => {
//         if (state.resolved) {
//           resolve();
//         }
//       });
//     }, []);
//
//     return <div>{echoState.result}</div>;
//   };
//
//   const wrapper = mount(
//     <Provider client={client}>
//       <Child />
//     </Provider>
//   );
//
//   await promise;
//
//   expect(wrapper.getDOMNode().innerHTML).toBe( 'nil says: hey');
// });
//
// test('useClient should update state', async t => {
//   const { Provider, Client, useClient } = await getGeneratedModules();
//   const client = new Client({ url: TEST_API });
//
//   let initialState1: any = {};
//   let initialState2: any = {};
//
//   let renderCount = 0;
//
//   const hope1 = hope();
//   const hope2 = hope();
//   const hope3 = hope();
//
//   const Child = () => {
//     const { fetch: echo1, ...state1 } = useClient('echo');
//     const state2 = useClient('echo', { variables: { text: 'foo' } });
//     const { fetch: group, ...state3 } = useClient('group');
//
//     if (renderCount === 0) {
//       initialState1 = state1;
//       initialState2 = state2;
//
//       setTimeout(() => {
//         echo1({ text: 'echo1' }).then(() => {
//           group({ shouldThrow: 1234 });
//         });
//       }, 100);
//     }
//
//     if (state1.resolved) {
//       hope1.resolve(state1);
//     }
//
//     if (state2.resolved) {
//       hope2.resolve(state2);
//     }
//
//     if (state3.resolved) {
//       hope3.resolve(state3);
//     }
//
//     renderCount++;
//     return <div>{state2.result}</div>;
//   };
//
//   const wrapper = mount(
//     <Provider client={client}>
//       <Child />
//     </Provider>
//   );
//
//   const { context, ...finalState1 } = await hope1.promise;
//   const { context: c2, ...finalState2 } = await hope2.promise;
//   const { context: c3, ...finalState3 } = await hope3.promise;
//
//   t.deepEqual(initialState1, {
//     error: null,
//     loading: false,
//     resolved: false,
//     result: undefined
//   });
//
//   t.deepEqual(initialState2, {
//     error: null,
//     loading: true,
//     resolved: false,
//     result: undefined
//   });
//
//   t.deepEqual(finalState1, {
//     error: null,
//     loading: false,
//     resolved: true,
//     result: 'nil says: echo1'
//   });
//
//   t.deepEqual(finalState2, {
//     error: null,
//     loading: false,
//     resolved: true,
//     result: 'nil says: foo'
//   });
//
//   t.deepEqual(finalState3, {
//     error: 'Variable "$fullPath_0" of required type "ID!" was not provided.',
//     loading: false,
//     resolved: true,
//     result: null
//   });
//
//   expect(wrapper.getDOMNode().innerHTML).toBe( 'nil says: foo');
// });
//
// test('should render only 2 times', async t => {
//   const { Provider, Client, useClient } = await getGeneratedModules();
//   const client = new Client({ url: TEST_API });
//   const { resolve, promise } = hope();
//   let renderCount = 0;
//
//   const Child = () => {
//     const state = useClient('echo', { variables: { text: 'hey' } });
//
//     if (state.result) {
//       resolve(state);
//     }
//
//     renderCount++;
//
//     return <div>{state.result}</div>;
//   };
//
//   const wrapper = mount(
//     <Provider client={client}>
//       <Child />
//     </Provider>
//   );
//
//   await promise;
//
//   expect(wrapper.getDOMNode().innerHTML).toBe( 'nil says: hey');
//   expect(renderCount).toBe( 2);
// });
//
// test('store should batch multiple queries', async t => {
//   const stub = sinon.stub(global, 'fetch').callsFake(fetchMock);
//   const {
//     Provider,
//     Client,
//     useClient,
//     Context,
//     Store
//   } = await getGeneratedModules();
//   const client = new Client({ url: TEST_API });
//   const firstCall = hope();
//
//   let listen = false;
//   let context = {} as typeof Store.prototype;
//   const promises: Promise<any>[] = [];
//
//   const Child = () => {
//     context = React.useContext(Context);
//
//     if (!listen) {
//       listen = true;
//       context.subscribe((s, c) => {
//         if (c === 'echo(text:predefined_query)' && s.resolved) {
//           firstCall.resolve();
//         }
//       });
//     }
//
//     const { fetch: echo, ...state } = useClient('echo', {
//       variables: { text: 'predefined_query' }
//     });
//
//     React.useEffect(() => {
//       promises.push(echo({ text: 'shouldBatch1' }));
//       promises.push(echo({ text: 'shouldBatch2' }));
//       promises.push(echo({ text: 'shouldBatch3' }));
//       promises.push(echo({ text: 'shouldBatch4' }));
//     }, []);
//
//     return <div>{state.result}</div>;
//   };
//
//   const wrapper = mount(
//     <Provider client={client}>
//       <Child />
//     </Provider>
//   );
//
//   expect(promises.length).toBe( 4);
//
//   await firstCall.promise;
//   await Promise.all(promises);
//
//   expect(wrapper.getDOMNode().innerHTML).toBe( 'nil says: shouldBatch4');
//   expect(stub.callCount).toBe( 1);
// });
//
// test('store should cache', async t => {
//   const stub = sinon.stub(global, 'fetch').callsFake(fetchMock);
//   const { Provider, Client, useClient, Context } = await getGeneratedModules();
//   const client = new Client({ url: TEST_API });
//
//   const firstCall = hope();
//   let renderCount = 0;
//   const promises: Promise<any>[] = [];
//   const errors: any[] = [];
//
//   let listen = false;
//
//   const Child = () => {
//     const context = React.useContext(Context);
//
//     if (!listen) {
//       listen = true;
//       context.subscribe((s, c) => {
//         const testStateID = `${s.context.action}_${c}`;
//
//         if (s.context.errors) {
//           errors.push({
//             testStateID,
//             errors: s.context.errors,
//             requestConfig: s.context.requestConfig
//           });
//         }
//
//         if (c === 'echo(text:predefined_query)' && s.resolved) {
//           firstCall.resolve();
//         }
//       });
//     }
//
//     const { fetch: echo, ...state } = useClient('echo', {
//       variables: { text: 'predefined_query' }
//     });
//
//     const { fetch: callNamespace, ...namespace } = useClient('namespace');
//
//     React.useEffect(() => {
//       (async () => {
//         promises.push(echo({ text: 'shouldCache1' }));
//         promises.push(echo({ text: 'shouldCache1' }));
//         promises.push(echo({ text: 'shouldCache1' }));
//         promises.push(echo({ text: 'shouldCache1' }));
//         promises.push(echo({ text: 'shouldCache2' }));
//         promises.push(callNamespace({ fullPath: 'myFullPath' }));
//       })();
//     }, []);
//
//     renderCount++;
//
//     return (
//       <div>
//         <span className={'echo'}>{state.result}</span>
//         <span className={'fullPath'}>
//           {namespace.result && namespace.result.fullPath}
//         </span>
//       </div>
//     );
//   };
//
//   const wrapper = mount(
//     <Provider client={client}>
//       <Child />
//     </Provider>
//   );
//
//   expect(promises.length).toBe( 6);
//   const promisedResults = await Promise.all(promises);
//   await firstCall.promise;
//
//   const namespaceResult = promisedResults[5].result;
//
//   t.deepEqual(
//     mapObjectTypes(namespaceResult),
//
//     mapObjectTypes({
//       description: 'mock',
//       descriptionHtml: 'mock',
//       fullName: 'mock',
//       fullPath: 'e8be6f80-7e23-4508-9a09-2e37e4651a77',
//       id: '6820e8fa-76c6-4acc-83c3-8162a170f5e3',
//       lfsEnabled: true,
//       name: 'mock',
//       path: 'mock',
//       requestAccessEnabled: false,
//       visibility: 'mock'
//     })
//   );
//
//   expect(stub.callCount).toBe( 1);
//
//   expect(errors.length).toBe( 0);
//
//   expect(wrapper.find('.echo').getDOMNode().innerHTML).toBe( 'nil says: shouldCache2');
//
//   expect(
//     wrapper.find('.fullPath').getDOMNode().innerHTML).toBe(
//     namespaceResult.fullPath
//   );
//
//   // 2 for echo state + 2 for namespace state
//   // although only one fetch was made
//   expect(renderCount).toBe( 4);
// });
//
// test('should make default fetch even if cache is false', async t => {
//   const stub = sinon.stub(global, 'fetch').callsFake(fetchMock);
//   const { Provider, Client, useClient } = await getGeneratedModules();
//
//   const client = new Client({ url: TEST_API });
//   const firstCall = hope();
//
//   let stateResults: (string | null | undefined)[][] = [];
//
//   const Child = () => {
//     const state = useClient('echo', {
//       variables: { text: 'testingCache' },
//       config: {
//         cache: false
//       }
//     });
//
//     stateResults.push([state.result]);
//
//     if (state.result) {
//       firstCall.resolve();
//     }
//
//     return <div>{state.result}</div>;
//   };
//
//   const wrapper = mount(
//     <Provider client={client}>
//       <Child />
//     </Provider>
//   );
//
//   await firstCall.promise;
//
//   expect(wrapper.getDOMNode().innerHTML).toBe( 'nil says: testingCache');
//   expect(stub.callCount).toBe( 1);
//   expect(stateResults.length).toBe( 2);
// });
//
// test('should ignore cache when cache is false', async t => {
//   const stub = sinon.stub(global, 'fetch').callsFake(fetchMock);
//   const { Provider, Client, useClient } = await getGeneratedModules();
//
//   const client = new Client({ url: TEST_API });
//   const firstCall = hope();
//   const secondCall = hope();
//
//   let stateResults: (string | null | undefined)[][] = [];
//
//   const Child = () => {
//     const {fetch: echo, ...state} = useClient('echo', {
//       variables: { text: 'testingCache' },
//       config: {
//         cache: false,
//         async middleware(ctx: any) {
//           if (ctx.action === 'complete') {
//             firstCall.resolve();
//           }
//           return ctx;
//         }
//       }
//     });
//
//     React.useEffect(() => {
//       firstCall.promise.then(() => {
//         echo({ text: 'testingCache' }, { cache: false }).then(() =>
//           secondCall.resolve()
//         );
//       });
//     }, []);
//
//     stateResults.push([state.result]);
//
//     return <div>{state.result}</div>;
//   };
//
//   const wrapper = mount(
//     <Provider client={client}>
//       <Child />
//     </Provider>
//   );
//
//   await firstCall.promise;
//   await secondCall.promise;
//
//   expect(wrapper.getDOMNode().innerHTML).toBe( 'nil says: testingCache');
//   expect(stub.callCount).toBe( 2);
//   expect(stateResults.length).toBe( 3);
// });
//
// test('should ignore cache when mixed cache false/true', async t => {
//   const stub = sinon.stub(global, 'fetch').callsFake(fetchMock);
//
//   const { Provider, Client, useClient } = await getGeneratedModules();
//
//   const client = new Client({ url: TEST_API });
//   const firstCall = hope();
//   const secondCall = hope();
//   const thirdCall = hope();
//
//   const Child = () => {
//     const echo = useClient('echo', {
//       variables: { text: 'testingCache' },
//       config: {
//         cache: false,
//         async middleware(ctx: any) {
//           if (ctx.action === 'complete') {
//             firstCall.resolve();
//           }
//           return ctx;
//         }
//       }
//     });
//
//     const echo2 = useClient('echo', {
//       variables: { text: 'testingCache' },
//       config: {
//         cache: false,
//         async middleware(ctx) {
//           if (ctx.action === 'complete') {
//             secondCall.resolve();
//           }
//           return ctx;
//         }
//       }
//     });
//
//     React.useEffect(() => {
//       (async () => {
//         await echo.fetch({ text: 'testingCache' }, { cache: false }); // this will batch with the first 2 calls
//         await echo.fetch({ text: 'testingCache' }); // this should use cache
//         await echo2.fetch({ text: 'testingCache' }, { cache: false }); // this will run without cache
//         await echo2.fetch({ text: 'testingCache' }); // this should use cache
//         thirdCall.resolve();
//       })();
//     }, []);
//
//     return <div>{echo.result}</div>;
//   };
//
//   const wrapper = mount(
//     <Provider client={client}>
//       <Child />
//     </Provider>
//   );
//
//   await firstCall.promise;
//   await secondCall.promise;
//   await thirdCall.promise;
//
//   expect(wrapper.getDOMNode().innerHTML).toBe( 'nil says: testingCache');
//
//   // 1 call will batch 3 echos (2 in the component body and one in effect)
//   // 2 will use cache
//   // 1 will run without cache
//   expect(stub.callCount).toBe( 2);
// });
//
// test('should run listener even if cache is false', async t => {
//   const {
//     Provider,
//     Client,
//     useClient,
//     Context,
//     Store
//   } = await getGeneratedModules();
//
//   const client = new Client({ url: TEST_API });
//   const firstCall = hope();
//   const secondCall = hope();
//
//   let context = {} as typeof Store.prototype;
//
//   let listen = false;
//   let subscription1Count = 0;
//
//   const Child = () => {
//     context = React.useContext(Context);
//
//     if (!listen) {
//       listen = true;
//       context.subscribe((state, requestSignature) => {
//         if (requestSignature === 'echo(text:default_query)' && state.resolved) {
//           firstCall.resolve(requestSignature);
//           subscription1Count++;
//         }
//
//         if (requestSignature === 'echo(text:second_call)' && state.resolved) {
//           secondCall.resolve(requestSignature);
//         }
//       });
//     }
//
//     const echo = useClient('echo', {
//       variables: { text: 'default_query' },
//       config: {
//         cache: false
//       }
//     });
//
//     React.useEffect(() => {
//       (async () => {
//         await echo.fetch({ text: 'second_call' }, { cache: false });
//       })();
//     }, []);
//
//     return <div>{echo.result}</div>;
//   };
//
//   mount(
//     <Provider client={client}>
//       <Child />
//     </Provider>
//   );
//
//   expect(await firstCall.promise).toBe( 'echo(text:default_query)');
//   expect(await secondCall.promise).toBe( 'echo(text:second_call)');
//   expect(subscription1Count).toBe( 1);
//   expect(subscription1Count).toBe( 1);
// });
//
// test('should not change the loadingState of an already loaded item', async t => {
//   const stub = sinon.stub(global, 'fetch').callsFake(fetchMock);
//
//   const { Provider, Client, useClient } = await getGeneratedModules(false);
//
//   const client = new Client({ url: TEST_API });
//   const firstCall = hope();
//   const secondCall = hope();
//
//   let stateLoadingChanges = {
//     1: [] as boolean[],
//     2: [] as boolean[],
//     3: [] as boolean[]
//   };
//
//   function pushIfDiff(value: boolean, key: keyof typeof stateLoadingChanges) {
//     const entry = stateLoadingChanges[key];
//     const lastEntryValue = entry[entry.length - 1];
//     if (lastEntryValue !== value) {
//       stateLoadingChanges[key].push(value);
//     }
//   }
//
//   const Child = () => {
//     const state1 = useClient('echo', {
//       variables: { text: 'holly shit' },
//       config: {
//         cache: false,
//         async middleware(ctx) {
//           if (ctx.action === 'complete') {
//             firstCall.resolve(ctx.result);
//           }
//           return ctx;
//         }
//       }
//     });
//
//     const state2 = useClient('echo');
//
//     const state3 = useClient('echo');
//
//     React.useEffect(() => {
//       firstCall.promise.then(() => {
//         state2.fetch({ text: 'hy' }).then(() => {
//           state3.fetch({ text: 'hy' }, { cache: false }).then(() => {
//             secondCall.resolve();
//           });
//         });
//       });
//     }, []);
//
//     pushIfDiff(state1.loading, 1);
//     pushIfDiff(state2.loading, 2);
//     pushIfDiff(state3.loading, 3);
//
//     return <div>{state3.result}</div>;
//   };
//
//   const wrapper = mount(
//     <Provider client={client}>
//       <Child />
//     </Provider>
//   );
//
//   await secondCall.promise;
//
//   expect(stub.callCount).toBe( 3);
//
//   t.deepEqual(stateLoadingChanges[1], [true, false]);
//   t.deepEqual(stateLoadingChanges[2], [false, true, false]);
//   t.deepEqual(stateLoadingChanges[3], [false, true, false]);
//
//   expect(wrapper.getDOMNode().innerHTML).toBe( 'nil says: hy');
// });
//
// test('one cacheable request should wait if there is one with same signature in progress', async t => {
//   const stub = sinon.stub(global, 'fetch').callsFake(delayedFetchMock);
//
//   const { Provider, Client, useClient, Context } = await getGeneratedModules(
//     false
//   );
//
//   const client = new Client({ url: TEST_API });
//   const secondCall = hope();
//
//   let stateLoadingChanges = {
//     1: [] as boolean[],
//     2: [] as boolean[],
//     3: [] as boolean[]
//   };
//
//   function pushIfDiff(value: boolean, key: keyof typeof stateLoadingChanges) {
//     const entry = stateLoadingChanges[key];
//     const lastEntryValue = entry[entry.length - 1];
//     if (lastEntryValue !== value) {
//       stateLoadingChanges[key].push(value);
//     }
//   }
//
//   const Child = () => {
//     const context = React.useContext(Context);
//
//     const state1 = useClient('echo', {
//       variables: { text: 'hy' }
//     });
//
//     const state2 = useClient('echo');
//
//     React.useEffect(() => {
//       // wait batch dispatch first fetch
//       setTimeout(() => {
//         const current = context.getItem('echo(text:hy)');
//         // run one query while another with same signature is loading
//         if (current && current.loading && stub.callCount === 1) {
//           state2.fetch({ text: 'hy' }).then(() => {
//             secondCall.resolve();
//           });
//         }
//       }, 200);
//     }, []);
//
//     pushIfDiff(state1.loading, 1);
//     pushIfDiff(state2.loading, 2);
//
//     return <div>{state2.result}</div>;
//   };
//
//   const wrapper = mount(
//     <Provider client={client}>
//       <Child />
//     </Provider>
//   );
//
//   await secondCall.promise;
//
//   expect(stub.callCount).toBe( 1);
//
//   t.deepEqual(stateLoadingChanges[1], [true, false]);
//   t.deepEqual(stateLoadingChanges[2], [false, true, false]);
//
//   expect(wrapper.getDOMNode().innerHTML).toBe( 'nil says: hy');
// });
