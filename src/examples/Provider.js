"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var Store_1 = require("./Store");
exports.useClient = function (methodName, initialFetchConfig) {
    var _a = useGraphQLStore(methodName), store = _a.store, method = _a.method;
    // as setState is async, we also save requestSignature in a ref
    var requestSignatureRef = React.useRef('');
    // to unsubscribe when unmount or when requestSignature changes
    var unsubscribeRef = React.useRef(function () { });
    // if there is a initialConfig, we generate a default requestSignature with
    // this config - otherwise the requestSignature will be set on
    // the first request and possible changed with setCacheKey if
    // requestSignature changes between fetches or renders
    var _b = React.useState(function () {
        if (!initialFetchConfig) {
            return '';
        }
        var reqSign = store.mountRequestSignature(methodName, initialFetchConfig.variables || {});
        requestSignatureRef.current = reqSign;
        return reqSign;
    }), requestSignature = _b[0], updateReqSignatureState = _b[1];
    var _c = React.useState(function () {
        var isLoading = !!initialFetchConfig;
        // if there is a initial fetch config and cache !== false we have
        // a requestSignature at the first render
        if (requestSignature) {
            var cached = store.getItem(requestSignature);
            return storeStateToHookState(cached, isLoading);
        }
        return storeStateToHookState(undefined, isLoading);
    }), state = _c[0], setState = _c[1];
    // update requestSignature and state
    function updateSignature(_a, cb) {
        var methodName = _a.methodName, variables = _a.variables;
        var newSignature = store.mountRequestSignature(methodName, variables);
        if (newSignature === requestSignatureRef.current)
            return;
        updateReqSignatureState(newSignature);
        requestSignatureRef.current = newSignature;
        if (cb)
            cb(newSignature);
    }
    // subscription
    React.useEffect(function () {
        unsubscribeRef.current();
        unsubscribeRef.current = store.subscribe(function (value, _requestSignature) {
            if (requestSignatureRef.current !== _requestSignature) {
                return;
            }
            if (value.context.action !== 'complete' &&
                value.context.action !== 'abort') {
                return;
            }
            setState(storeStateToHookState(value));
        });
        return unsubscribeRef.current;
    }, []);
    var fetcher = function (variables, config) {
        if (variables === void 0) { variables = {}; }
        if (config === void 0) { config = {}; }
        var methodInfo = store.client.methodsInfo[methodName];
        if (methodInfo.isQuery) {
            // we set loading here because we dont set loading from the above
            // subscription - because  setting from the subscription will set loading
            // for items that not called the current request
            if ((config.cache === false && !state.loading) || state.error) {
                setState(__assign(__assign({}, state), { loading: true }));
            }
            updateSignature({ methodName: methodName, variables: variables }, function (sign) {
                var cached = store.getItem(sign);
                setState(__assign(__assign({}, storeStateToHookState(cached)), { loading: true }));
            });
            return method(variables, config);
        }
        if (!state.loading) {
            setState(__assign(__assign({}, state), { loading: true }));
        }
        return method(variables, config).then(function (ctx) {
            setState(storeStateToHookState({
                context: ctx,
                loading: false,
                resolved: true,
                listeners: [],
                result: undefined,
                error: undefined,
                isOptimistic: false
            }));
            return ctx;
        });
    };
    // if there is a default fetch config, fetch it on first render
    var wasStartedTheDefaultFetch = React.useRef(false);
    if (!wasStartedTheDefaultFetch.current &&
        initialFetchConfig &&
        initialFetchConfig.fetchOnMount) {
        if (!state.loading && !state.resolved && !state.error) {
            wasStartedTheDefaultFetch.current = true;
            fetcher(initialFetchConfig.variables, initialFetchConfig.config);
        }
    }
    return __assign(__assign({}, state), { fetch: fetch,
        store: store, signature: requestSignature });
};
exports.GraphQLStoreContext = React.createContext({});
var GraphQLProvider = /** @class */ (function (_super) {
    __extends(GraphQLProvider, _super);
    function GraphQLProvider(props, context) {
        var _this = _super.call(this, props, context) || this;
        _this.store = new Store_1.GraphQLStore({ client: _this.props.client });
        return _this;
    }
    GraphQLProvider.prototype.render = function () {
        return React.createElement(exports.GraphQLStoreContext.Provider, {
            children: this.props.children,
            value: this.store
        });
    };
    return GraphQLProvider;
}(React.Component));
exports.GraphQLProvider = GraphQLProvider;
function useGraphQLStore(methodName) {
    var store = React.useContext(exports.GraphQLStoreContext);
    if (!store) {
        throw new Error('store is not present in React Context');
    }
    if (!store.client) {
        throw new Error('client is not present in GraphQLStore');
    }
    // the corresponding graphql method fetcher
    var method = store.client.methods[methodName];
    if (typeof method !== 'function') {
        throw new Error("expected method with name \"" + methodName + "\" to be a function. found \"" + typeof method + "\"");
    }
    return { store: store, method: method };
}
var storeStateToHookState = function (state, isLoadingIfNotCached) {
    return {
        result: state ? state.context.result : undefined,
        loading: state ? state.loading : !!isLoadingIfNotCached,
        resolved: state ? state.resolved : false,
        error: state && state.context && state.context.errors
            ? state.context.errors.join('\n')
            : null
    };
};
