import {
  Actions,
  Context,
  Dict,
  GraphQLClient,
  Method,
  Methods,
  Middleware,
  OpKind
} from './Client';

// when a fetch is called but there is already a query with same
// requestSignature loading, we add a listener to wait the first call complete
type SameCacheKeyListener = (ctx: Context<any, any>) => any;

export type StoreState<Result = any, V = any> = {
  loading: boolean;
  resolved: boolean;
  context: Context<V, Result>;
  result: undefined | Result;
  error: undefined | string;
  isOptimistic: boolean;

  // when a query is started but not finished and other queries with the same
  // requestSignature is called, the queries started last will be added to listeners
  // and resolved when the first query completes
  listeners: SameCacheKeyListener[];
};

export type Store = {
  [key: string]: StoreState | undefined;
};

export type Config = { client: GraphQLClient };

export type MiddlewareWrapper = (
  requestSignature: string,
  schemaKey: string
) => Middleware<any>;

export type StoreListener = (
  value: StoreState,
  requestSignature: string,
  schemaKey: string
) => any;

/**
 * state actions are actions that are not fetch actions, that is,
 * actions that are not generic for all queries on a batch -
 *
 * only initFetch and completeFetch are not state actions:
 * initFetch is called before fetch and can be used to change fetch
 * config, like headers - completeFetch is called before distribute results by
 * the queries in the current batch that originated the fetch request
 * @param ctx
 */
function parseContextAction(
  ctx: Context
): { isStateAction: boolean; isComplete: boolean } {
  switch (ctx.action) {
    case Actions.clearQuery: {
      return { isStateAction: true, isComplete: false };
    }

    case Actions.abort: {
      return { isStateAction: true, isComplete: true };
    }

    case Actions.complete: {
      return { isStateAction: true, isComplete: true };
    }

    case Actions.completeFetch: {
      return { isStateAction: false, isComplete: true };
    }

    case Actions.initFetch: {
      return { isStateAction: false, isComplete: false };
    }

    case Actions.willQueue: {
      return { isStateAction: true, isComplete: false };
    }

    default: {
      throw new Error('invalid action ' + ctx.action);
    }
  }
}

/**
 * Parse info from Middleware context
 * @param ctx
 */
export function parseContextInfo<C extends Context>(
  ctx: C
): ParsedContextInfo<C> {
  const isMutation = ctx.methodConfig.kind === OpKind.mutation;
  const isQuery = ctx.methodConfig.kind === OpKind.query;
  const shouldCacheByConfig = ctx.methodConfig.cache === true;
  const isActionComplete = ctx.action === Actions.complete;
  const isActionWillQueue = ctx.action === Actions.willQueue;
  const isActionAbort = ctx.action === Actions.abort;
  const isActionClearQuery = ctx.action === Actions.clearQuery;
  const error = ctx.errors ? ctx.errors.join('\n') : undefined;

  const { isStateAction, isComplete } = parseContextAction(ctx);

  return {
    isMutation,
    isQuery,
    canCache: shouldCacheByConfig && isQuery,
    isActionWillQueue,
    isActionAbort,
    isActionComplete,
    isActionClearQuery,

    // true if the action is a state action
    // and not a fetch action for example
    // there is no schemaKey in fetch actions, because they are generics to
    // a group of queries in a batch - and each one can have one schemaKey
    isStateAction,

    isComplete,

    error,
    result: ctx.result
  };
}

export type ParsedContextInfo<C extends Context> = {
  isMutation: boolean;
  isQuery: boolean;
  canCache: boolean;
  isActionWillQueue: boolean;
  isActionAbort: boolean;
  isActionComplete: boolean;
  isActionClearQuery: boolean;

  // true if the action is a state action
  // and not a fetch action for example
  // there is no schemaKey in fetch actions, because they are generics to
  // a group of queries in a batch - and each one can have one schemaKey
  isStateAction: boolean;

  isComplete: boolean;

  error: string | undefined;
  result: C['result'];
};

export class GraphQLStore {
  client: GraphQLClient;
  private store: Store = {};
  private _listeners: StoreListener[] = [];

  // hooks not unmounted using the query
  activeQueries = new ActiveQueriesRegister();

  constructor(config: Config) {
    this.client = config.client;
    this.client.middleware = [...this.client.middleware, this.middleware];
  }

  getListeners = () => [...this._listeners];

  middleware: Middleware<any> = async ctx => {
    const info = parseContextInfo(ctx);

    // there is no schemaKey in fetch actions (initFetch, fetchComplete)
    if (!info.isStateAction) return ctx;

    if (info.isActionClearQuery) return ctx;

    if (!ctx.methodConfig.schemaKey) {
      throw new Error('ctx.config.schemaKey is undefined');
    }

    const { schemaKey } = ctx.methodConfig;

    const requestSignature = this.mountRequestSignature(
      schemaKey,
      ctx.variables
    );

    if (!info.isQuery) {
      this.dispatch(
        requestSignature,
        {
          loading: !info.isComplete,
          resolved: info.isComplete,
          context: ctx,
          listeners: [],
          error: info.error,
          result: info.result,
          isOptimistic: false
        },
        schemaKey
      );

      return ctx;
    }

    const entry = this.getItem(requestSignature);

    if (entry && info.isActionAbort) {
      this.dispatch(requestSignature, entry, schemaKey);
      return ctx;
    }

    if (info.isActionComplete) {
      if (!entry) {
        throw new Error(
          `reached complete action but store has no entry for requestSignature: "${requestSignature}"`
        );
      }

      const listeners = [...entry.listeners];

      this.setItem(
        requestSignature,
        {
          context: ctx,
          resolved: true,
          loading: false,
          listeners: [],
          error: info.error,
          result: info.result,
          isOptimistic: false
        },
        schemaKey
      );

      listeners.forEach(fn => {
        fn(ctx);
      });

      return ctx;
    }

    if (info.isActionWillQueue) {
      // will queue and already has a entry with same requestSignature
      // the entry can be resolved or in progress
      if (entry && info.canCache && !entry.error && !entry.isOptimistic) {
        if (
          entry.resolved &&
          entry.context &&
          !entry.context.methodConfig.ignoreCached
        ) {
          // dont need to dispatch action here, because  when the request
          // started, we should have checked if there was already
          // a cached response
          return {
            ...entry.context,
            action: Actions.abort
          };
        }

        // if the existing entry is waiting network response
        // we add a listener to wait network response and return a promise
        return new Promise(resolve => {
          entry.listeners.push(completedCtx => {
            resolve({ ...completedCtx, action: Actions.abort });
          });
        });
      }
      // will queue and there is no corresponding item in store
      else {
        this.setItem(
          requestSignature,
          {
            loading: true,
            resolved: false,
            context: ctx,
            listeners: [],
            error: info.error,
            result: info.result,
            isOptimistic: false
          },
          schemaKey
        );
      }

      return ctx;
    }

    if (!this.store[requestSignature]) {
      throw new Error(
        `reached the end of middleware without store set for "${requestSignature}"`
      );
    }

    return ctx;
  };

  getItem = (requestSignature: string) => {
    return this.store[requestSignature];
  };

  setItem = (
    requestSignature: string,
    state: StoreState,
    schemaKey: string,
    shouldDispatch = true
  ) => {
    if (!this.client.methods[schemaKey as keyof Methods]) {
      throw new Error(
        `schemaKey "${schemaKey}" is not present in client methods: ${Object.keys(
          this.client.methods
        )}`
      );
    }

    this.store[requestSignature] = state;

    if (shouldDispatch) {
      this.dispatch(requestSignature, state, schemaKey);
    }
  };

  removeItem = (requestSignature: string, shouldDispatch = true) => {
    const currentItem = this.getItem(requestSignature);
    if (!currentItem) return;

    const schemaKey = currentItem.context.methodConfig.schemaKey;

    // can't delete - another request with the same signature cold be made
    // delete this.store[requestSignature];

    delete currentItem.resolved;
    delete currentItem.result;
    delete currentItem.loading;

    currentItem.isOptimistic = true;
    currentItem.context.action = Actions.clearQuery;

    if (shouldDispatch) {
      this.dispatch(requestSignature, currentItem, schemaKey);
    }
  };

  dispatch = (
    requestSignature: string,
    state: StoreState,
    schemaKey?: string
  ) => {
    if (!schemaKey || !this.client.methods[schemaKey as keyof Methods]) {
      throw new Error(
        `schemaKey "${schemaKey}" is not present in client methods: ${Object.keys(
          this.client.methods
        )}`
      );
    }

    this._listeners.forEach(fn => {
      fn(state, requestSignature, schemaKey);
    });
  };

  getState = () => this.store;

  subscribe = (listener: StoreListener) => {
    if (typeof listener !== 'function') {
      throw new Error('Expected the listener to be a function.');
    }

    const self = this;
    let isSubscribed = true;
    this._listeners.push(listener);
    // this.queryCount[signature] += 1;

    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }

      // self.queryCount[signature] -= 1;
      isSubscribed = false;

      const index = self._listeners.indexOf(listener);
      self._listeners.splice(index, 1);
    };
  };

  /**
   * mounts a string with schemaKey and variables like 'postCount(foo:12,bar:1)'
   * @param schemaKey
   * @param variables
   */
  mountRequestSignature(schemaKey: string, variables: Dict) {
    if (
      typeof (this.client.methods as { [key: string]: Method })[schemaKey] !==
      'function'
    ) {
      console.warn('valid schemaKeys:', Object.keys(this.client.methods));
      throw new Error(
        `Expected "schemaKey" to be a valid entry, received: "${schemaKey}"`
      );
    }

    const variablesString = Object.keys(variables)
      .map(key => key.replace(/_(\d)*/, '')) // remove batch query suffix
      .sort()
      .reduce((prev, key) => {
        const acc = prev ? prev + ',' : prev;
        const value = JSON.stringify(variables[key]);
        return `${acc}${key}:${value}`;
      }, '');

    return `${schemaKey}(${variablesString})`.replace(
      /[^a-z0-9._\-;,():]/gim,
      ''
    );
  }

  redoQuery = (regex: RegExp) => {
    Object.keys(this.store).forEach(k => {
      if (!regex.exec(k)) return;

      const active = this.activeQueries.count(k);
      const item = this.store[k]!;
      const info = parseContextInfo(item.context);

      if (!info.isQuery) return;

      if (!active) {
        this.activeQueries.remove(k);
        this.removeItem(k);
        return;
      }

      const methodName = item.context.methodConfig.schemaKey;
      const variables = item.context.variables;
      const methodConfig = item.context.methodConfig;

      methodConfig.ignoreCached = true;

      methodConfig.redoQueriesNumber =
        (methodConfig.redoQueriesNumber || 0) + 1;

      const method = this.client.methods[methodName as any];

      method(variables, methodConfig);
    });
  };
}

class ActiveQueriesRegister {
  private _register: { [key: string]: number } = {};

  add = (signature: string) => {
    return (this._register[signature] = (this._register[signature] || 0) + 1);
  };

  remove = (signature: string) => {
    let count = this._register[signature] - 1;
    if (count < 0) count = 1;
    return (this._register[signature] = count);
  };

  count = (signature: string) => this._register[signature] || 0;
}
