import * as React from 'react';

import { GraphQLStore, StoreState } from './Store';
import {
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

  // the corresponding graphql method fetcher
  const method: Method = store.client.methods[methodName];

  if (typeof method !== 'function') {
    throw new Error(
      `expected method with name "${methodName}" to be a function. found "${typeof method}"`
    );
  }

  // as setState is async, we also save requestSignature in a ref to prevent
  // setCacheKey to be called during a state update
  const requestSignatureRef = React.useRef('');

  // to unsubscribe when unmount or when requestSignature changes
  const unsubscribeRef = React.useRef(() => {});

  // if there is a initialConfig, we generate a default requestSignature with
  // this config - otherwise the requestSignature will be set on
  // the first request and possible changed with setCacheKey if
  // requestSignature changes between fetches or renders
  const [requestSignature, updateReqSignatureState] = React.useState(() => {
    if (!initialFetchConfig) {
      return '';
    }

    // if requestSignature is false, the local state will be set when the request
    // is made in the fetcher function below, independently of the cache
    if (
      initialFetchConfig.config &&
      initialFetchConfig.config.cache === false
    ) {
      return '';
    }

    const reqSign = store.mountRequestSignature(
      methodName as string,
      initialFetchConfig.variables
    );

    requestSignatureRef.current = reqSign;
    return reqSign;
  });

  const [state, setState] = React.useState<HookState<any, any>>(() => {
    // if there is a initial fetch config and cache !== false we have
    // a requestSignature at the first render
    if (requestSignature) {
      const cached = store.getItem(requestSignature);
      return storeStateToHookState(cached);
    }

    return storeStateToHookState();
  });

  function updateSignature(newSignature: string) {
    if (newSignature === requestSignatureRef.current) return;
    updateReqSignatureState(newSignature);
    requestSignatureRef.current = newSignature;

    const cached = store.getItem(newSignature);
    setState(storeStateToHookState(cached));
  }

  // subscription
  React.useEffect(() => {
    unsubscribeRef.current();

    unsubscribeRef.current = store.subscribe(
      (value, _requestSignature, _schemaKey) => {
        // This listener  observes all app requests.
        // Requests with cache === false can not update state from
        // other requests with the same requestSignature - they should only
        // set local state - local state are set from inside the "fetcher"
        if (value.context.config.cache === false) {
          return;
        }

        // check if current update should reflect in this hook local state
        if (requestSignatureRef.current !== _requestSignature) {
          return;
        }

        if (methodName !== _schemaKey) {
          throw new Error(
            `expected subscription schemaKey to be "${methodName}" but received ${_schemaKey}`
          );
        }

        setState({ ...value, ...value.context });
      }
    );

    return unsubscribeRef.current;
  }, []);

  const fetcher = React.useMemo(() => {
    return (
      variables: any = {},
      config: Partial<FetcherConfig<any, any>> = {}
    ) => {
      const methodInfo = store.client.methodsInfo[methodName];
      const usingCache = config.cache !== false && methodInfo.isQuery;

      if (usingCache) {
        // using cache, we will subscribe to cache store in
        // the React.useEffect above
        const newReqId = store.mountRequestSignature(
          methodName as string,
          variables
        );
        updateSignature(newReqId);
        return method(variables, config);
      } else {
        // not using cache, set state from a
        // independently fetch call
        if (!state.loading) {
          setState({ ...state, loading: true });
        }

        return method(variables, config).then(ctx => {
          setState(
            storeStateToHookState({
              context: ctx,
              loading: false,
              resolved: true,
              listeners: []
            })
          );
          return ctx;
        });
      }
    };
  }, []);

  // if there is a default fetch config, fetch it on first render
  const wasStartedTheDefaultFetch = React.useRef(false);
  if (!wasStartedTheDefaultFetch.current && initialFetchConfig) {
    wasStartedTheDefaultFetch.current = true;
    fetcher(initialFetchConfig.variables, initialFetchConfig.config);
  }

  return [state, fetcher, store];
};

const storeStateToHookState = (cached?: StoreState): HookState<any, any> => {
  return {
    ...cached,
    result: cached ? cached.context.result : undefined,
    loading: cached ? cached.loading : false,
    resolved: cached ? cached.resolved : false
  };
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

type HookState<T, V> = {
  loading: boolean;
  resolved: boolean;
  context?: StoreState<T, V>['context'];
  result?: StoreState<T, V>['context']['result'];
};
