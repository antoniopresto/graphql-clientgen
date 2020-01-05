import * as React from 'react';

import { GraphQLStore, StoreState } from './Store';

import {
  Context,
  Dict,
  GraphQLClient,
  Method,
  MethodConfig,
  Methods
} from './Client';

interface State extends HookState<any, any> {
  updated?: number;
}

export const useClient: UseClient = (methodName, hookConfig) => {
  const { store, method } = useGraphQLStore(methodName);

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
      defaulter().variables || {}
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

  // update requestSignature and state
  function updateSignature(
    { methodName, variables }: { methodName: string; variables: Dict },
    cb?: (newReqSeg: string) => any
  ) {
    const newSignature = store.mountRequestSignature(methodName, variables);
    if (newSignature === requestSignatureRef.current) return;

    store.activeQueries.remove(requestSignatureRef.current);

    updateReqSignatureState(newSignature);
    requestSignatureRef.current = newSignature;

    if (cb) cb(newSignature);
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

  const fetcher = (config = hookConfig) => {
    const { variables, fetchOnMount, afterMutate, ...methodConfig } = defaulter(
      config
    );

    const methodInfo = store.client.methodsInfo[methodName];

    if (methodInfo.isQuery) {
      updateSignature({ methodName: methodName as string, variables });
      store.activeQueries.add(requestSignatureRef.current);
      return method(variables, methodConfig);
    }

    return method(variables, methodConfig).then(ctx => {
      if (!ctx.errors && afterMutate) {
        if (afterMutate instanceof RegExp) {
          store.redoQuery(afterMutate);
        } else {
          afterMutate(ctx.result, store);
        }
      }

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
      return ctx;
    });
  };

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

function useGraphQLStore(methodName: keyof Methods) {
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

const storeStateToHookState = (
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

type Props = {
  client: GraphQLClient;
};

// extract the type from a generic: ex. T from Promise<T>
type Unpacked<T> = T extends (infer U)[]
  ? U
  : T extends (...args: any[]) => infer U
  ? U
  : T extends Promise<infer U>
  ? U
  : T;

type AfterMutate<R> = ((r: R, s: GraphQLStore) => any) | RegExp; // redo query if regex or run a callback

type UseClient = <
  A extends { variables: Parameters<M>[0]; config?: Parameters<M>[1] }, // argsArray
  K extends keyof Methods = any, // method key (name)
  M extends (...args: any) => any = Methods[K], // method
  R = Unpacked<ReturnType<M>>['result'] // return type without promise
>(
  methodName: K,
  config?: Partial<MethodConfig<A['variables'], R>> & {
    variables?: A['variables'];
    fetchOnMount?: boolean;
    afterMutate?: AfterMutate<R>;
  }
) => HookState<R, A['variables']> & {
  fetch: (
    config?: Partial<MethodConfig<A['variables'], R>> & {
      variables?: A['variables'];
      fetchOnMount?: boolean;
      afterMutate?: AfterMutate<R>;
    }
  ) => Promise<Context>;
  store: GraphQLStore;
  signature: string;
  updated: number;
};

type HookState<T, V> = {
  loading: boolean;
  resolved: boolean;
  context?: StoreState<T, V>['context'];
  result?: StoreState<T, V>['result'];
  error?: string | null;
};
