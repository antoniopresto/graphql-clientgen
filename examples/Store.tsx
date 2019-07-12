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

export class GraphQLStore {
  client: GraphQLClient;
  private store: Store = {};
  private _listeners: StoreListener[] = [];

  constructor(config: Config) {
    this.client = config.client;
    this.client.middleware = [...this.client.middleware, this.middleware];
  }

  getListeners = () => [...this._listeners];

  middleware: Middleware<any> = async ctx => {
    if (ctx.config.cache === false) return ctx;

    if (ctx.config.kind !== OpKind.query) return ctx;

    const isActionComplete = ctx.action === Actions.complete;
    const isActionWillQueue = ctx.action === Actions.willQueue;

    if (!isActionComplete && !isActionWillQueue) {
      return ctx;
    }

    if (!ctx.config.schemaKey) {
      throw new Error('ctx.config.schemaKey is undefined');
    }

    const { schemaKey } = ctx.config;

    const requestSignature = this.mountRequestSignature(schemaKey, ctx.variables);
    const entry = this.getItem(requestSignature);

    if (isActionComplete) {
      if (!entry) {
        throw new Error(
          `reached complete action but store has no entry for requestSignature: "${requestSignature}"`
        );
      }

      const listeners = [...entry.listeners];
      entry.context = ctx;
      entry.resolved = true;
      entry.loading = false;
      entry.listeners = [];

      this.setItem(requestSignature, entry, schemaKey);

      listeners.forEach(fn => {
        fn(ctx);
      });

      return ctx;
    }

    if (isActionWillQueue) {
      if (entry) {
        if (entry.resolved) {
          return {
            ...entry.context,
            action: Actions.abort
          };
        }

        return new Promise(resolve => {
          entry.listeners.push(completedCtx => {
            resolve({ ...completedCtx, action: Actions.abort });
          });
        });
      } else {
        this.setItem(
          requestSignature,
          {
            loading: true,
            resolved: false,
            context: ctx,
            listeners: []
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

  setItem = (requestSignature: string, state: StoreState, schemaKey: string) => {
    if (!this.client.methods[schemaKey as keyof Methods]) {
      throw new Error(
        `schemaKey "${schemaKey}" is not present in client methods: ${Object.keys(
          this.client.methods
        )}`
      );
    }

    this.store[requestSignature] = state;
    this.dispatch(requestSignature, state, schemaKey);
  };

  dispatch = (requestSignature: string, state: StoreState, schemaKey?: string) => {
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

    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }

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
      console.log('valid schemaKeys:', Object.keys(this.client.methods));
      throw new Error(
        `Expected "schemaKey" to be a valid entry, received: "${schemaKey}"`
      );
    }

    const variablesString = Object.keys(variables)
      .map(key => key.replace(/_(\d)*$/, '')) // remove batch query suffix
      .sort()
      .reduce((prev, key) => {
        const acc = prev ? prev + ',' : prev;
        const value = JSON.stringify(variables[key]);
        return `${acc}${key}:${value}`;
      }, '');

    return `${schemaKey}(${variablesString})`.replace(/\n/mig, ' ').trim();
  }
}
