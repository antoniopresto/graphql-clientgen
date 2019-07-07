import React from 'react';

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
    return (
      <GraphQLStoreContext.Provider value={this.store}>
        {this.props.children}
      </GraphQLStoreContext.Provider>
    );
  }
}

export const useClient: UseClient = (methodName, initialFetchConfig) => {
  const unsubscribeRef = React.useRef(() => {});
  const mounted = React.useRef(false);
  const store = React.useContext(GraphQLStoreContext);
  const method: Method = store.client.methods[methodName];
  const requestSignatureRef = React.useRef('');

  const [requestSignature, _setCacheKey] = React.useState(() => {
    if (!initialFetchConfig) {
      return '';
    }

    if (
      initialFetchConfig.config &&
      initialFetchConfig.config.cache === false
    ) {
      return '';
    }

    const signature = store.mountRequestSignature(
      methodName as string,
      initialFetchConfig.variables
    );
    requestSignatureRef.current = signature;
    return signature;
  });

  const [state, setState] = React.useState<HookState<any, any>>(() => {
    const cached = store.getItem(requestSignature);
    if (!cached) return { loading: false };
    return { ...cached, result: cached.context.result };
  });

  function setCacheKey(nck: string) {
    if (nck === requestSignatureRef.current) return;
    _setCacheKey(nck);
    unsubscribeRef.current();
    requestSignatureRef.current = nck;
  }

  // subscription
  React.useEffect(() => {
    // there is no requestSignature because config.cache is false
    // or fetcher is not called yet.
    // if config.cache is false the state is set via middleware in fetcher below
    if (!requestSignature) return;
    setState(store.getItem(requestSignature) || { loading: true });

    unsubscribeRef.current = store.subscribe((value, _requestSignature, _schemaKey) => {
      if (requestSignatureRef.current !== _requestSignature) {
        return;
      }

      if (methodName !== _schemaKey) {
        throw new Error(
          `expected subscription schemaKey to be "${methodName}" but received ${_schemaKey}`
        );
      }

      setState({ ...value, ...value.context });
    });
  }, [requestSignature]);

  const fetcher = React.useMemo(() => {
    return (
      variables: any = {},
      config: Partial<FetcherConfig<any, any>> = {}
    ) => {
      const usingCache = config.cache !== false;

      if (usingCache) {
        // using cache, we will subscribe to cache store in
        // the React.useEffect above
        const nck = store.mountRequestSignature(methodName as string, variables);
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

  if (!mounted.current && initialFetchConfig) {
    mounted.current = true;
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
