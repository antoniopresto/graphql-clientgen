"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Client_1 = require("./Client");
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
function parseContextAction(ctx) {
    switch (ctx.action) {
        case Client_1.Actions.abort: {
            return { isStateAction: true, isComplete: true };
        }
        case Client_1.Actions.complete: {
            return { isStateAction: true, isComplete: true };
        }
        case Client_1.Actions.completeFetch: {
            return { isStateAction: false, isComplete: true };
        }
        case Client_1.Actions.initFetch: {
            return { isStateAction: false, isComplete: false };
        }
        case Client_1.Actions.willQueue: {
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
function parseContextInfo(ctx) {
    var isMutation = ctx.config.kind === Client_1.OpKind.mutation;
    var isQuery = ctx.config.kind === Client_1.OpKind.query;
    var shouldCacheByConfig = ctx.config.cache !== false;
    var isActionComplete = ctx.action === Client_1.Actions.complete;
    var isActionWillQueue = ctx.action === Client_1.Actions.willQueue;
    var isActionAbort = ctx.action === Client_1.Actions.abort;
    var error = ctx.errors ? ctx.errors.join('\n') : undefined;
    var _a = parseContextAction(ctx), isStateAction = _a.isStateAction, isComplete = _a.isComplete;
    return {
        isMutation: isMutation,
        isQuery: isQuery,
        canCache: shouldCacheByConfig && isQuery,
        isActionWillQueue: isActionWillQueue,
        isActionAbort: isActionAbort,
        isActionComplete: isActionComplete,
        // true if the action is a state action
        // and not a fetch action for example
        // there is no schemaKey in fetch actions, because they are generics to
        // a group of queries in a batch - and each one can have one schemaKey
        isStateAction: isStateAction,
        isComplete: isComplete,
        error: error,
        result: ctx.result
    };
}
var GraphQLStore = /** @class */ (function () {
    // hooks not unmounted using the query
    // private queryCount: { [key: string]: number } = {};
    function GraphQLStore(config) {
        var _this = this;
        this.store = {};
        this._listeners = [];
        this.getListeners = function () { return __spreadArrays(_this._listeners); };
        this.middleware = function (ctx) { return __awaiter(_this, void 0, void 0, function () {
            var info, schemaKey, requestSignature, entry, listeners;
            return __generator(this, function (_a) {
                info = parseContextInfo(ctx);
                // there is no schemaKey in fetch actions (initFetch, fetchComplete)
                if (!info.isStateAction)
                    return [2 /*return*/, ctx];
                if (!ctx.config.schemaKey) {
                    throw new Error('ctx.config.schemaKey is undefined');
                }
                schemaKey = ctx.config.schemaKey;
                requestSignature = this.mountRequestSignature(schemaKey, ctx.variables);
                if (!info.isQuery) {
                    this.dispatch(requestSignature, {
                        loading: !info.isComplete,
                        resolved: info.isComplete,
                        context: ctx,
                        listeners: [],
                        error: info.error,
                        result: info.result,
                        isOptimistic: false
                    }, schemaKey);
                    return [2 /*return*/, ctx];
                }
                entry = this.getItem(requestSignature);
                if (entry && info.isActionAbort) {
                    this.dispatch(requestSignature, entry, schemaKey);
                    return [2 /*return*/, ctx];
                }
                if (info.isActionComplete) {
                    if (!entry) {
                        throw new Error("reached complete action but store has no entry for requestSignature: \"" + requestSignature + "\"");
                    }
                    listeners = __spreadArrays(entry.listeners);
                    this.setItem(requestSignature, {
                        context: ctx,
                        resolved: true,
                        loading: false,
                        listeners: [],
                        error: info.error,
                        result: info.result,
                        isOptimistic: false
                    }, schemaKey);
                    listeners.forEach(function (fn) {
                        fn(ctx);
                    });
                    return [2 /*return*/, ctx];
                }
                if (info.isActionWillQueue) {
                    // will queue and already has a entry with same requestSignature
                    // the entry can be resolved or in progress
                    if (entry && info.canCache && !entry.error && !entry.isOptimistic) {
                        if (entry.resolved && entry.context) {
                            // dont need to dispatch action here, because  when the request
                            // started, we should have checked if there was already
                            // a cached response
                            return [2 /*return*/, __assign(__assign({}, entry.context), { action: Client_1.Actions.abort })];
                        }
                        // if the existing entry is waiting network response
                        // we add a listener to wait network response and return a promise
                        return [2 /*return*/, new Promise(function (resolve) {
                                entry.listeners.push(function (completedCtx) {
                                    resolve(__assign(__assign({}, completedCtx), { action: Client_1.Actions.abort }));
                                });
                            })];
                    }
                    // will queue and there is no corresponding item in store
                    else {
                        this.setItem(requestSignature, {
                            loading: true,
                            resolved: false,
                            context: ctx,
                            listeners: [],
                            error: info.error,
                            result: info.result,
                            isOptimistic: false
                        }, schemaKey);
                    }
                    return [2 /*return*/, ctx];
                }
                if (!this.store[requestSignature]) {
                    throw new Error("reached the end of middleware without store set for \"" + requestSignature + "\"");
                }
                return [2 /*return*/, ctx];
            });
        }); };
        this.getItem = function (requestSignature) {
            return _this.store[requestSignature];
        };
        this.setItem = function (requestSignature, state, schemaKey, shouldDispatch) {
            if (shouldDispatch === void 0) { shouldDispatch = true; }
            if (!_this.client.methods[schemaKey]) {
                throw new Error("schemaKey \"" + schemaKey + "\" is not present in client methods: " + Object.keys(_this.client.methods));
            }
            _this.store[requestSignature] = state;
            if (shouldDispatch) {
                _this.dispatch(requestSignature, state, schemaKey);
            }
        };
        this.dispatch = function (requestSignature, state, schemaKey) {
            if (!schemaKey || !_this.client.methods[schemaKey]) {
                throw new Error("schemaKey \"" + schemaKey + "\" is not present in client methods: " + Object.keys(_this.client.methods));
            }
            _this._listeners.forEach(function (fn) {
                fn(state, requestSignature, schemaKey);
            });
        };
        this.getState = function () { return _this.store; };
        this.subscribe = function (listener) {
            if (typeof listener !== 'function') {
                throw new Error('Expected the listener to be a function.');
            }
            var self = _this;
            var isSubscribed = true;
            _this._listeners.push(listener);
            // this.queryCount[signature] += 1;
            return function unsubscribe() {
                if (!isSubscribed) {
                    return;
                }
                // self.queryCount[signature] -= 1;
                isSubscribed = false;
                var index = self._listeners.indexOf(listener);
                self._listeners.splice(index, 1);
            };
        };
        this.optimisticUpdate = function (methodName, variables, setter) {
            var signature = _this.mountRequestSignature(methodName, variables);
            var current = _this.getItem(signature);
            var newValue = setter(current);
            _this.setItem(signature, {
                loading: false,
                resolved: true,
                context: {
                    requestConfig: {},
                    variables: variables,
                    config: {},
                    action: Client_1.Actions.complete,
                    result: newValue
                },
                listeners: [],
                error: undefined,
                result: newValue,
                isOptimistic: true
            }, methodName);
        };
        this.client = config.client;
        this.client.middleware = __spreadArrays(this.client.middleware, [this.middleware]);
    }
    /**
     * mounts a string with schemaKey and variables like 'postCount(foo:12,bar:1)'
     * @param schemaKey
     * @param variables
     */
    GraphQLStore.prototype.mountRequestSignature = function (schemaKey, variables) {
        if (typeof this.client.methods[schemaKey] !==
            'function') {
            console.warn('valid schemaKeys:', Object.keys(this.client.methods));
            throw new Error("Expected \"schemaKey\" to be a valid entry, received: \"" + schemaKey + "\"");
        }
        var variablesString = Object.keys(variables)
            .map(function (key) { return key.replace(/_(\d)*/, ''); }) // remove batch query suffix
            .sort()
            .reduce(function (prev, key) {
            var acc = prev ? prev + ',' : prev;
            var value = JSON.stringify(variables[key]);
            return "" + acc + key + ":" + value;
        }, '');
        return (schemaKey + "(" + variablesString + ")").replace(/[^a-z0-9._\-;,():]/gim, '');
    };
    return GraphQLStore;
}());
exports.GraphQLStore = GraphQLStore;
