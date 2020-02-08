import { delay, getGeneratedModules, hope, TEST_API } from './helpers';
import { render } from '@testing-library/react';
import * as React from 'react';
import { GraphQLStore } from '../client/Store';

describe('redoQuery', function() {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should register query as active', async () => {
    const { Provider, Client, useClient } = await getGeneratedModules();
    const client = new Client({ url: TEST_API });

    let store = {} as GraphQLStore;
    const args = { text: 'opt' };

    const Child = () => {
      const echo = useClient('echo', { variables: args, fetchOnMount: true });
      store = echo.store;
      return <div>{echo.result}</div>;
    };

    const wrapper = render(
      <Provider client={client}>
        <Child />
      </Provider>
    );

    const key = store.mountRequestSignature('echo', args);

    expect(store.activeQueries.count(key)).toBe(1);

    wrapper.unmount();

    expect(store.activeQueries.count(key)).toBe(0);
  });

  test('should remove inactive queries', async () => {
    const { Provider, Client, useClient } = await getGeneratedModules();
    const client = new Client({ url: TEST_API });

    let store = {} as GraphQLStore;
    const args = { text: 'opt' };

    const Child = () => {
      const echo = useClient('echo', { variables: args, fetchOnMount: true });
      store = echo.store;
      return <div>{echo.result}</div>;
    };

    const wrapper = render(
      <Provider client={client}>
        <Child />
      </Provider>
    );

    const key = store.mountRequestSignature('echo', args);

    wrapper.unmount();

    expect(store.getItem(key)).toBeTruthy();

    store.redoQuery(/echo/);

    expect(store.getItem(key)!.result).toBeFalsy();
    expect(store.getItem(key)!.resolved).toBeFalsy();
    expect(store.getItem(key)!.loading).toBeFalsy();
  });

  test('should redo active queries', async () => {
    const stub = jest.spyOn(global, 'fetch');

    const { Provider, Client, useClient } = await getGeneratedModules();
    const client = new Client({ url: TEST_API });

    const coming = hope();
    const coming2 = hope();
    let redoCount = 0;

    let store = {} as GraphQLStore;
    const args = { text: 'opt' };

    let listen = false;

    const Child = () => {
      let echo = useClient('echo', {
        variables: args,
        fetchOnMount: true
      });

      store = echo.store;

      if (echo.resolved) {
        coming.resolve(echo.result);
      }

      if (!listen) {
        listen = true;
        echo.store.subscribe(s => {
          redoCount = s.context.methodConfig.redoQueriesNumber || 0;
          if (redoCount > 0 && s.resolved) {
            coming2.resolve(redoCount);
          }
        });
      }

      return <div>{echo ? echo.result : ''}</div>;
    };

    render(
      <Provider client={client}>
        <Child />
      </Provider>
    );

    await coming.promise;

    const key = store.mountRequestSignature('echo', args);

    expect(store.getItem(key)).toHaveProperty('result', 'nil says: opt');
    expect(stub).toBeCalledTimes(1);

    store.redoQuery(/echo/);

    await coming2.promise;

    expect(store.getItem(key)).toHaveProperty('result', 'nil says: opt');
    expect(stub).toBeCalledTimes(2);
    expect(redoCount).toBe(1);

    store.redoQuery(/echo/);
    await delay(500);

    expect(stub).toBeCalledTimes(3);
    expect(redoCount).toBe(2);
  });

  test('useClient should handle redoQuery', async () => {
    const stub = jest.spyOn(global, 'fetch');

    const { Provider, Client, useClient } = await getGeneratedModules();
    const client = new Client({ url: TEST_API });

    const createOneHope = hope();

    let store = {} as GraphQLStore;

    let startedMutation = false;

    const Child = () => {
      let PostCreateOne = useClient('PostCreateOne', {
        afterMutate: /Post/,
        cache: true
      });

      store = PostCreateOne.store;

      const PostFindMany = useClient('PostFindMany', {
        fetchOnMount: true
      });

      if (PostFindMany.resolved) {
        createOneHope.resolve(PostCreateOne.result);

        if (!startedMutation) {
          startedMutation = true;

          PostCreateOne.fetch({
            variables: { title: 'My Post' }
          });
        }
      }

      return <div>_</div>;
    };

    render(
      <Provider client={client}>
        <Child />
      </Provider>
    );

    await createOneHope.promise;

    const key = store.mountRequestSignature('PostFindMany', {});

    await delay(500);

    const postsEntry = store.getItem(key)!;

    expect(postsEntry.context.methodConfig.redoQueriesNumber).toEqual(1);

    // 1 mutation, 1 query, 1 refetch
    expect(stub).toBeCalledTimes(3);
  });
});
