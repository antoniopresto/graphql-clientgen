import { delay, getGeneratedModules, TEST_API } from './helpers';
import { render } from '@testing-library/react';
import * as React from 'react';
import { GraphQLStore } from '../template/Store';

describe('optimistic', function() {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should register query as active', async () => {
    const { Provider, Client, useClient } = await getGeneratedModules();
    const client = new Client({ url: TEST_API });

    let store = {} as GraphQLStore;
    const args = { text: 'opt' };

    const Child = () => {
      const echo = useClient('echo', { variables: args });
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
});
