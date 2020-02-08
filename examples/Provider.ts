import * as React from 'react';

import { GraphQLStore, StoreState } from './Store';

import {
  Context,
  fetchGraphql,
  GraphQLClient,
  Method,
  MethodConfig,
  Methods
} from './Client';

interface State extends HookState<any, any> {
  updated?: number;
}

export const useClient: UseClient = (methodName, hookConfig) => {
  const { store } = useGraphQLStore(methodName);

  const defaulter = (override: typeof hookConfig = {}) => {
    const initial: any = hookConfig || {};

    return {
      ...initial,
      ...override,
      variables: override.variables
        ? override.variables
        : initial.variables || {}
    };
  };

  // as setState is async, we also save requestSignature in a ref
  const requestSignatureRef = React.useRef('');

  // to unsubscribe when unmount or when requestSignature changes
  const unsubscribeRef = React.useRef(() => {});

  // if there is a initialConfig, we generate a default requestSignature with
  // this config - otherwise the requestSignature will be set on
  // the first request and possible changed with setCacheKey if
  // requestSignature changes between fetches or renders
  const [requestSignature, updateReqSignatureState] = React.useState(() => {
    // no initial variables
    if (!hookConfig) {
      return '';
    }

    const reqSign = store.mountRequestSignature(
      methodName as string,
      defaulter().variables || {},
      (defaulter().fragment || '') + (defaulter().appendToFragment || '')
    );

    requestSignatureRef.current = reqSign;
    return reqSign;
  });

  const [state, _setState] = React.useState<State>(() => {
    const isLoading = hookConfig && hookConfig.fetchOnMount;

    // if there is a initial fetch config and cache !== false we have
    // a requestSignature at the first render
    if (requestSignature) {
      const cached = store.getItem(requestSignature);
      return storeStateToHookState(cached, isLoading);
    }

    const result = storeStateToHookState(undefined, isLoading);

    return {
      ...result,
      updated: 0
    };
  });

  const stateRef = React.useRef<State>(state);

  function setState(newState: State) {
    let { result, loading, resolved } = newState;

    if (
      result === stateRef.current.result &&
      loading === stateRef.current.loading &&
      resolved === stateRef.current.resolved
    ) {
      return;
    }

    stateRef.current = { ...newState, updated: (state.updated || 0) + 1 };

    _setState(stateRef.current);
  }

  // subscription
  React.useEffect(() => {
    unsubscribeRef.current();

    unsubscribeRef.current = store.subscribe((value, _requestSignature) => {
      if (requestSignatureRef.current !== _requestSignature) {
        return;
      }

      if (value.loading) {
        setState({
          ...stateRef.current,
          loading: true
        });
        return;
      }

      if (
        value.context.action !== 'complete' &&
        value.context.action !== 'abort'
      ) {
        return;
      }

      setState(storeStateToHookState(value));
    });

    return () => {
      store.activeQueries.remove(requestSignatureRef.current);
      unsubscribeRef.current();
    };
  }, []);

  const fetcher = fetchGraphql(methodName as string, hookConfig, store, {
    willCallMutation() {
      setState({ ...stateRef.current, loading: true });
    },
    updateSignature(newSignature) {
      updateReqSignatureState(newSignature);
      requestSignatureRef.current = newSignature;
    },
    resolvedMutation(ctx) {
      setState(
        storeStateToHookState({
          context: ctx,
          loading: false,
          resolved: true,
          listeners: [],
          result: undefined,
          error: undefined,
          isOptimistic: false
        })
      );
    }
  });

  // if there is a default fetch config, fetch it on first render
  const wasStartedTheDefaultFetch = React.useRef(false);
  if (!wasStartedTheDefaultFetch.current && defaulter().fetchOnMount) {
    wasStartedTheDefaultFetch.current = true;
    fetcher();
  }

  return {
    ...(state as any),
    fetch: fetcher,
    store,
    signature: requestSignature
  };
};

export const GraphQLStoreContext = React.createContext({} as GraphQLStore);

type GraphQLProviderProps = {
  client: GraphQLClient;
  store?: GraphQLStore;
  children?: React.ReactNode;
  render?: (store: GraphQLStore, client: GraphQLClient) => React.ReactNode;
};

export class GraphQLProvider extends React.Component<GraphQLProviderProps> {
  store: GraphQLStore;
  client: GraphQLClient;

  constructor(props: GraphQLProviderProps, context: any) {
    super(props, context);
    this.client = this.props.client;
    this.store = props.store || new GraphQLStore({ client: this.client });
  }

  render() {
    const { children, render } = this.props;
    const child = render ? render(this.store, this.client) : children;
    return React.createElement(GraphQLStoreContext.Provider, {
      children: child,
      value: this.store
    });
  }
}

export function useGraphQLStore(methodName: keyof Methods) {
  const store = React.useContext(GraphQLStoreContext);

  if (!store) {
    throw new Error('store is not present in React Context');
  }

  if (!store.client) {
    throw new Error('client is not present in GraphQLStore');
  }

  // the corresponding graphql method fetcher
  const method: Method = store.client.methods[methodName];

  if (typeof method !== 'function') {
    throw new Error(
      `expected method with name "${methodName}" to be a function. found "${typeof method}"`
    );
  }

  return { store, method };
}

export const storeStateToHookState = (
  state?: StoreState,
  isLoadingIfNotCached?: boolean
): HookState<any, any> => {
  return {
    result: state ? state.context.result : undefined,
    loading: state ? state.loading : !!isLoadingIfNotCached,
    resolved: state ? state.resolved : false,
    error:
      state && state.context && state.context.errors
        ? state.context.errors.join('\n')
        : null
  };
};

// extract the type from a generic: ex. T from Promise<T>
export type Unpacked<T> = T extends (infer U)[]
  ? U
  : T extends (...args: any[]) => infer U
  ? U
  : T extends Promise<infer U>
  ? U
  : T;

export type UseClient = <
  A extends { variables: Parameters<M>[0]; config?: Parameters<M>[1] }, // argsArray
  K extends keyof Methods = any, // method key (name)
  M extends (...args: any) => any = Methods[K], // method
  R = Unpacked<ReturnType<M>>['result'] // return type without promise
>(
  methodName: K,
  config?: Partial<MethodConfig<A['variables'], R>> & {
    fetchOnMount?: boolean;
  }
) => HookState<R, A['variables']> & {
  fetch: (
    config?: Partial<MethodConfig<A['variables'], R>> & {
      fetchOnMount?: boolean;
    }
  ) => Promise<Context<A['variables'], R>>;
  store: GraphQLStore;
  signature: string;
  updated: number;
};

export type HookState<T, V> = {
  loading: boolean;
  resolved: boolean;
  context?: StoreState<T, V>['context'];
  result?: StoreState<T, V>['result'];
  error?: string | null;
};
