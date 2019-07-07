import * as React from 'react';

import { GraphQLStore, StoreState } from './Store';
import {
  Actions,
  Context,
  FetcherConfig,
  GraphQLClient,
  Method,
  Methods
} from './Client';

export const GraphQLStoreContext = React.createContext({} as GraphQLStore);

type Props = {
  client: GraphQLClient;
};

export class GraphQLProvider extends React.Component<Props> {
  store: GraphQLStore;

  constructor(props: Props, context: any) {
    super(props, context);

    this.store = new GraphQLStore({ client: this.props.client });
  }

  render() {
    return React.createElement(GraphQLStoreContext.Provider, {
      children: this.props.children,
      value: this.store
    });
  }
}

export const useClient: UseClient = (methodName, initialFetchConfig) => {
  const store = React.useContext(GraphQLStoreContext);

  if (!store) {
    throw new Error('store is not present in React Context');
  }

  if (!store.client) {
    throw new Error('client is not present in GraphQLStore');
  }

  const unsubscribeRef = React.useRef(() => {});
  const wasStartedTheDefaultFetch = React.useRef(false);
  const method: Method = store.client.methods[methodName];

  // as setState is async, we also save cacheKey in a ref to prevent
  // setCacheKey to be called during a state update
  const cacheKeyRef = React.useRef('');

  // if there is a initialConfig, we generate a default cacheKey with
  // this config - otherwise this cacheKey will be set on a new request
  const [cacheKey, _setCacheKey] = React.useState(() => {
    if (!initialFetchConfig) {
      return '';
    }

    // if cacheKey is false, the local state will be set when the request
    // is made in the fetcher function below, independently of the cache
    if (
      initialFetchConfig.config &&
      initialFetchConfig.config.cache === false
    ) {
      return '';
    }

    const ck = store.mountCacheKey(
      methodName as string,
      initialFetchConfig.variables
    );

    cacheKeyRef.current = ck;
    return ck;
  });

  const [state, setState] = React.useState<HookState<any, any>>(() => {
    const cached = store.getItem(cacheKey);
    if (!cached) return { loading: false };
    return { ...cached, result: cached.context.result };
  });

  function setCacheKey(nck: string) {
    if (nck === cacheKeyRef.current) return;
    _setCacheKey(nck);
    unsubscribeRef.current();
    cacheKeyRef.current = nck;
  }

  // subscription
  React.useEffect(() => {
    // if there is no cacheKey because config.cache is false
    // or fetcher is not called yet.
    // if config.cache is false the state is set via middleware in fetcher below
    if (!cacheKey) return;
    setState(store.getItem(cacheKey) || { loading: true });

    unsubscribeRef.current = store.subscribe((value, _cacheKey, _schemaKey) => {
      if (cacheKeyRef.current !== _cacheKey) {
        return;
      }

      if (methodName !== _schemaKey) {
        throw new Error(
          `expected subscription schemaKey to be "${methodName}" but received ${_schemaKey}`
        );
      }

      if (value.context.action !== Actions.abort) {
        setState({ ...value, ...value.context });
      }
    });
  }, [cacheKey]);

  const fetcher = React.useMemo(() => {
    return (
      variables: any = {},
      config: Partial<FetcherConfig<any, any>> = {}
    ) => {
      const usingCache = config.cache !== false;

      if (usingCache) {
        // using cache, we will subscribe to cache store in
        // the React.useEffect above
        const nck = store.mountCacheKey(methodName as string, variables);
        setCacheKey(nck);
        return method(variables, config);
      } else {
        // not using cache, set state from a
        // independently fetch call
        setState({ ...state, loading: true });
        return method(variables, config).then(ctx => {
          setState({
            ...state,
            ...ctx
          });

          return ctx;
        });
      }
    };
  }, []);

  if (!wasStartedTheDefaultFetch.current && initialFetchConfig) {
    wasStartedTheDefaultFetch.current = true;
    fetcher(initialFetchConfig.variables, initialFetchConfig.config);
  }

  return [state, fetcher, store];
};

// type ArgumentTypes<T> = T extends (...args: infer U) => infer _ ? U : never;
// type ReplaceReturnType<T, TNewReturn> = (...a: ArgumentTypes<T>) => TNewReturn;

// extract the type from a generic: ex. T from Promise<T>
type Unpacked<T> = T extends (infer U)[]
  ? U
  : T extends (...args: any[]) => infer U
  ? U
  : T extends Promise<infer U>
  ? U
  : T;

type UseClient = <
  A extends { variables: Parameters<M>[0]; config?: Parameters<M>[1] }, // argsArray
  K extends keyof Methods = any, // method key (name)
  M extends (...args: any) => any = Methods[K], // method
  R = Unpacked<ReturnType<M>>['result'] // return type without promise
  // C extends Context<A['variables'], R> = any
>(
  methodName: K,
  initialFetchConfig?: {
    variables: A['variables'];
    config?: A['config'];
  }
) => [
  HookState<R, A['variables']>,
  (variables: A['variables'], config?: A['config']) => Promise<Context>,
  GraphQLStore
];

type HookState<T, V> = Partial<StoreState<T, V>> &
  Partial<StoreState<T, V>['context']>;
