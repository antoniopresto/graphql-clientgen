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
exports.query = {
    PostFindMany: function (config) { return "\n        query PostFindMany($filter: Filter){\n            PostFindMany(filter: $filter){\n                " + parseFragmentConfig("_id\n                        title\n                        updatedAt\n                        createdAt", config) + "\n            }\n        }"; },
    PostCreateOne: function (config) { return "\n        mutation PostCreateOne($title: String!){\n            PostCreateOne(title: $title){\n                " + parseFragmentConfig("recordId", config) + "\n            }\n        }"; }
};
var OpKind;
(function (OpKind) {
    OpKind["mutation"] = "mutation";
    OpKind["query"] = "query";
    // subscription = 'subscription', // TODO
})(OpKind = exports.OpKind || (exports.OpKind = {}));
var Actions;
(function (Actions) {
    // 1
    // when a query fetch will be queued, use to handle loading states
    // this action is called for each query that will be added to a
    // batch of queries
    Actions["willQueue"] = "willQueue";
    // 2 - never called if abort is called
    // when the fetch is started can be used to update requestConfig
    // to update loading state use willQueue, because initFetch
    // will be called only one time for a batch of queries
    Actions["initFetch"] = "initFetch";
    // 2 or never
    // called when one query in a batch of queries is aborted, probably because
    // the query is already cached or have one identical query in progress
    Actions["abort"] = "abort";
    // 3 - never called if aborted
    // called when fetch ends - called for a batch of queries, to handle
    // each query independently, you should listen to the 'complete' action
    Actions["completeFetch"] = "completeFetch";
    // 4 - never called if aborted
    // called when one query is completed (but not aborted) - with success or not
    // to handle when a query completes even if the result comes from the cache,
    // you should listen to 'abort' too
    Actions["complete"] = "complete";
})(Actions = exports.Actions || (exports.Actions = {}));
var GraphQLClient = /** @class */ (function () {
    function GraphQLClient(config) {
        var _this = this;
        this.url = '/graphql';
        this.middleware = [];
        this.mutationQueue = [];
        this.queryQueue = [];
        this.queueLimit = 20;
        this.timeoutLimit = 50;
        this.fetchQueue = function (queue, kind) {
            var batchMiddleware = [];
            var headers = {};
            var finalQueryBody = '';
            var finalQueryHeader = '';
            var finalVariables = {};
            var resolverMap = {};
            queue.forEach(function (childQuery, childQueryIndex) {
                var qiKey = kind + "_" + childQueryIndex;
                var qiQuery = childQuery.config.query;
                resolverMap[qiKey] = childQuery;
                if (childQuery.config.middleware) {
                    var m = ensureArray(childQuery.config.middleware);
                    batchMiddleware = batchMiddleware.concat(m);
                }
                if (childQuery.config.middleware) {
                    headers = __assign(__assign({}, headers), childQuery.config.headers);
                }
                if (childQuery.variables) {
                    Object.keys(childQuery.variables).forEach(function (k) {
                        finalVariables[k + "_" + childQueryIndex] = childQuery.variables[k];
                    });
                }
                // We will pass all batched queries in the body of one main query
                // The variables of the child queries will give new names in the
                // following format: "originalName" + "_" + childQueryIndex
                var firstQueryLine = qiQuery.trim().split('\n')[0];
                var variablesMatch = firstQueryLine.match(/\((.*)\)/);
                if (variablesMatch) {
                    // if this child batched query has variables
                    variablesMatch[1]
                        .split(',')
                        .map(function (pair) {
                        return pair
                            .trim()
                            .split(':') // will generate '["$varName", "GQLType"]
                            .map(function (e) { return e.trim(); });
                    })
                        .forEach(function (pair) {
                        var nname = pair[0] + "_" + childQueryIndex;
                        finalQueryHeader += " " + nname + ": " + pair[1] + " ";
                        // regex to replace "$varName" with "$varName" + '_' + index
                        // resulting in a varName like: "$varName_0"
                        var reg = new RegExp('\\' + pair[0], 'mg');
                        qiQuery = qiQuery.replace(reg, nname);
                    });
                }
                finalQueryBody +=
                    "\n " + qiKey + ": " +
                        qiQuery
                            .trim()
                            .split('\n')
                            .slice(1, -1) // remove query declaration line and closing tag
                            .join('\n') +
                        '\n';
            });
            if (finalQueryHeader) {
                // if this child query has variables
                finalQueryHeader = "(" + finalQueryHeader + ")";
            }
            var query = kind + " " + finalQueryHeader + " {\n      " + finalQueryBody + "\n    }";
            _this.queryFetcher(finalVariables, {
                url: _this.url,
                query: query,
                middleware: batchMiddleware,
                kind: kind
            }).then(function (ctx) {
                Object.keys(resolverMap).forEach(function (key) {
                    var _a = resolverMap[key], resolver = _a.resolver, config = _a.config, variables = _a.variables;
                    if (!resolver)
                        return;
                    var middleware = exports.applyMiddleware(ensureArray(config.middleware));
                    resolver(middleware(__assign(__assign({}, ctx), { result: ctx.result ? ctx.result[key] : null, action: Actions.complete, variables: variables, config: config, querySuffix: key })));
                });
            });
        };
        this.exec = function (_variables, _config) { return __awaiter(_this, void 0, Promise, function () {
            var kind, config, context, queueItem, promise, fulfill, fulfill;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        kind = _config.kind;
                        if (kind !== OpKind.mutation && kind !== OpKind.query) {
                            throw new Error("invalid kind of operation: " + kind);
                        }
                        config = __assign(__assign({}, _config), { url: this.url, middleware: __spreadArrays(this.middleware, ensureArray(_config.middleware)) });
                        return [4 /*yield*/, exports.applyMiddleware(config.middleware)({
                                requestConfig: {},
                                variables: _variables,
                                config: config,
                                action: Actions.willQueue
                                // errors?: string[];
                                // result?: R | null;
                                // querySuffix?: string;
                            })];
                    case 1:
                        context = _a.sent();
                        if (context.action === Actions.abort) {
                            // applying middleware because listeners should be able
                            // to listen to 'abort' action
                            return [2 /*return*/, exports.applyMiddleware(config.middleware)(context)];
                        }
                        queueItem = {
                            config: context.config,
                            resolver: null,
                            variables: _variables,
                            kind: kind
                        };
                        promise = new Promise(function (r) {
                            queueItem.resolver = r;
                        });
                        if (kind === OpKind.query) {
                            this.queryQueue.push(queueItem);
                            fulfill = function () {
                                var queue = __spreadArrays(_this.queryQueue);
                                _this.queryQueue = [];
                                _this.fetchQueue(queue, kind);
                            };
                            clearTimeout(this.queryBachTimeout);
                            this.queryBachTimeout = setTimeout(fulfill, this.timeoutLimit);
                            if (this.queryQueue.length >= this.queueLimit) {
                                fulfill();
                            }
                        }
                        else if (kind === OpKind.mutation) {
                            this.mutationQueue.push(queueItem);
                            fulfill = function () {
                                var queue = __spreadArrays(_this.mutationQueue);
                                _this.mutationQueue = [];
                                _this.fetchQueue(queue, kind);
                            };
                            clearTimeout(this.mutationBachTimeout);
                            this.mutationBachTimeout = setTimeout(fulfill, this.timeoutLimit);
                            if (this.mutationQueue.length >= this.queueLimit) {
                                fulfill();
                            }
                        }
                        return [2 /*return*/, promise];
                }
            });
        }); };
        this.methods = {
            PostFindMany: function (variables, config) {
                return _this.exec(variables, __assign({ url: _this.url, entityName: 'Post', schemaKey: 'PostFindMany', query: exports.query.PostFindMany(config), kind: OpKind.query }, config));
            },
            PostCreateOne: function (variables, config) {
                return _this.exec(variables, __assign({ url: _this.url, entityName: 'PostCreateOnePayload', schemaKey: 'PostCreateOne', query: exports.query.PostCreateOne(config), kind: OpKind.mutation }, config));
            }
        };
        this.methodsInfo = {
            PostFindMany: {
                type: '[Post]',
                schemaKey: 'PostFindMany',
                entityName: 'Post',
                isList: true,
                argsTSName: 'QueryPostFindManyArgs',
                returnTSName: "Query['PostFindMany']",
                isMutation: false,
                isQuery: true,
                isSubscription: false,
                field: {
                    description: null,
                    deprecationReason: null,
                    type: '[Post]',
                    args: [{ name: 'filter', description: null, type: 'Filter' }],
                    name: 'PostFindMany',
                    isDeprecated: false
                },
                isNonNull: false,
                kind: 'query'
            },
            PostCreateOne: {
                type: 'PostCreateOnePayload',
                schemaKey: 'PostCreateOne',
                entityName: 'PostCreateOnePayload',
                isList: false,
                argsTSName: 'MutationPostCreateOneArgs',
                returnTSName: "Mutation['PostCreateOne']",
                isMutation: true,
                isQuery: false,
                isSubscription: false,
                field: {
                    description: null,
                    deprecationReason: null,
                    type: 'PostCreateOnePayload',
                    args: [{ name: 'title', description: null, type: 'String!' }],
                    name: 'PostCreateOne',
                    isDeprecated: false
                },
                isNonNull: false,
                kind: 'mutation'
            }
        };
        this.queryFetcher = function (variables, config) { return __awaiter(_this, void 0, Promise, function () {
            var requestConfig, middleware, context;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        requestConfig = {
                            method: 'POST',
                            credentials: 'include',
                            headers: __assign({ 'Content-Type': 'application/json', Accept: 'application/json' }, config.headers)
                        };
                        middleware = typeof config.middleware === 'function'
                            ? config.middleware
                            : exports.applyMiddleware(ensureArray(config.middleware));
                        return [4 /*yield*/, middleware({
                                requestConfig: requestConfig,
                                variables: variables,
                                config: config,
                                action: Actions.initFetch,
                                querySuffix: config.querySuffix
                            })];
                    case 1:
                        context = _a.sent();
                        if (context.action === Actions.abort) {
                            return [2 /*return*/, context];
                        }
                        context.requestConfig.body = JSON.stringify({
                            query: context.config.query,
                            variables: context.variables
                        });
                        return [2 /*return*/, fetch(context.config.url, context.requestConfig)
                                .then(function (response) { return __awaiter(_this, void 0, void 0, function () {
                                var contentType, isJSON, fetchError, _a, errors, data;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            contentType = response.headers.get('Content-Type');
                                            isJSON = contentType && contentType.startsWith('application/json');
                                            if (!!isJSON) return [3 /*break*/, 2];
                                            return [4 /*yield*/, response.text()];
                                        case 1:
                                            fetchError = _b.sent();
                                            return [2 /*return*/, middleware(__assign(__assign({}, context), { result: null, action: Actions.completeFetch, errors: [fetchError] }))];
                                        case 2: return [4 /*yield*/, response.json()];
                                        case 3:
                                            _a = _b.sent(), errors = _a.errors, data = _a.data;
                                            if (errors && !Array.isArray(errors)) {
                                                errors = [errors];
                                            }
                                            if (errors) {
                                                errors = errors.map(function (e) {
                                                    return e && e.message ? e.message : JSON.stringify(e);
                                                });
                                            }
                                            return [2 /*return*/, middleware(__assign(__assign({}, context), { errors: errors, action: Actions.completeFetch, result: data
                                                        ? config.schemaKey
                                                            ? data[config.schemaKey]
                                                            : data
                                                        : null }))];
                                    }
                                });
                            }); })
                                .catch(function (err) {
                                return middleware(__assign(__assign({}, context), { errors: [err], action: Actions.completeFetch, result: null }));
                            })];
                }
            });
        }); };
        // apply global client instance middleware
        if (config.middleware) {
            var _instanceMiddleware_1 = exports.applyMiddleware(ensureArray(config.middleware));
            this.middleware = [
                function instanceMiddleware(ctx) {
                    return _instanceMiddleware_1(ctx);
                }
            ];
        }
        if (config.url) {
            this.url = config.url;
        }
    }
    return GraphQLClient;
}());
exports.GraphQLClient = GraphQLClient;
// compose(f, g, h) is identical to doing (...args) => f(g(h(...args))).
function compose(funcs) {
    var _this = this;
    if (!Array.isArray(funcs) || funcs.length === 0) {
        return (function (arg) { return Promise.resolve(arg); });
    }
    if (funcs.length === 1) {
        return funcs[0];
    }
    return funcs.reduce(function (a, b) { return function (context) { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = a;
                    return [4 /*yield*/, b(context)];
                case 1: return [4 /*yield*/, _a.apply(void 0, [_b.sent()])];
                case 2: return [2 /*return*/, _b.sent()];
            }
        });
    }); }; });
}
function parseFragmentConfig(fragment, config) {
    var resultingFragment = fragment || '';
    if (config) {
        if (config.fragment) {
            resultingFragment += "\n " + config.fragment;
        }
        if (config.appendToFragment) {
            resultingFragment += "\n " + config.appendToFragment;
        }
    }
    return resultingFragment;
}
exports.parseFragmentConfig = parseFragmentConfig;
exports.applyMiddleware = function (middleware) {
    return function (context) {
        return compose(middleware)(context);
    };
};
function ensureArray(el) {
    if (!el)
        return [];
    if (Array.isArray(el))
        return el;
    return [el];
}
exports.ensureArray = ensureArray;
