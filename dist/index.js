module.exports =
/******/ (function(modules, runtime) { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	__webpack_require__.ab = __dirname + "/";
/******/
/******/ 	// the startup function
/******/ 	function startup() {
/******/ 		// Load entry module and return exports
/******/ 		return __webpack_require__(198);
/******/ 	};
/******/ 	// initialize runtime
/******/ 	runtime(__webpack_require__);
/******/
/******/ 	// run startup
/******/ 	return startup();
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module) {

module.exports = (date) => Math.floor(date.getTime() / 1000)


/***/ }),
/* 1 */,
/* 2 */
/***/ (function(module) {

/**
 * A specialized version of `matchesProperty` for source values suitable
 * for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */
function matchesStrictComparable(key, srcValue) {
  return function(object) {
    if (object == null) {
      return false;
    }
    return object[key] === srcValue &&
      (srcValue !== undefined || (key in Object(object)));
  };
}

module.exports = matchesStrictComparable;


/***/ }),
/* 3 */,
/* 4 */,
/* 5 */
/***/ (function(__unusedmodule, exports) {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @class
 * Class representing MiddlewareControl
 */
var MiddlewareControl = /** @class */ (function () {
    /**
     * @public
     * @constructor
     * Creates an instance of MiddlewareControl
     * @param {MiddlewareOptions[]} [middlewareOptions = []] - The array of middlewareOptions
     * @returns The instance of MiddlewareControl
     */
    function MiddlewareControl(middlewareOptions) {
        if (middlewareOptions === void 0) { middlewareOptions = []; }
        // tslint:disable-next-line:ban-types
        this.middlewareOptions = new Map();
        for (var _i = 0, middlewareOptions_1 = middlewareOptions; _i < middlewareOptions_1.length; _i++) {
            var option = middlewareOptions_1[_i];
            var fn = option.constructor;
            this.middlewareOptions.set(fn, option);
        }
    }
    /**
     * @public
     * To get the middleware option using the class of the option
     * @param {Function} fn - The class of the strongly typed option class
     * @returns The middleware option
     * @example
     * // if you wanted to return the middleware option associated with this class (MiddlewareControl)
     * // call this function like this:
     * getMiddlewareOptions(MiddlewareControl)
     */
    // tslint:disable-next-line:ban-types
    MiddlewareControl.prototype.getMiddlewareOptions = function (fn) {
        return this.middlewareOptions.get(fn);
    };
    /**
     * @public
     * To set the middleware options using the class of the option
     * @param {Function} fn - The class of the strongly typed option class
     * @param {MiddlewareOptions} option - The strongly typed middleware option
     * @returns nothing
     */
    // tslint:disable-next-line:ban-types
    MiddlewareControl.prototype.setMiddlewareOptions = function (fn, option) {
        this.middlewareOptions.set(fn, option);
    };
    return MiddlewareControl;
}());
exports.MiddlewareControl = MiddlewareControl;
//# sourceMappingURL=MiddlewareControl.js.map

/***/ }),
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var once = __webpack_require__(49);

var noop = function() {};

var isRequest = function(stream) {
	return stream.setHeader && typeof stream.abort === 'function';
};

var isChildProcess = function(stream) {
	return stream.stdio && Array.isArray(stream.stdio) && stream.stdio.length === 3
};

var eos = function(stream, opts, callback) {
	if (typeof opts === 'function') return eos(stream, null, opts);
	if (!opts) opts = {};

	callback = once(callback || noop);

	var ws = stream._writableState;
	var rs = stream._readableState;
	var readable = opts.readable || (opts.readable !== false && stream.readable);
	var writable = opts.writable || (opts.writable !== false && stream.writable);
	var cancelled = false;

	var onlegacyfinish = function() {
		if (!stream.writable) onfinish();
	};

	var onfinish = function() {
		writable = false;
		if (!readable) callback.call(stream);
	};

	var onend = function() {
		readable = false;
		if (!writable) callback.call(stream);
	};

	var onexit = function(exitCode) {
		callback.call(stream, exitCode ? new Error('exited with error code: ' + exitCode) : null);
	};

	var onerror = function(err) {
		callback.call(stream, err);
	};

	var onclose = function() {
		process.nextTick(onclosenexttick);
	};

	var onclosenexttick = function() {
		if (cancelled) return;
		if (readable && !(rs && (rs.ended && !rs.destroyed))) return callback.call(stream, new Error('premature close'));
		if (writable && !(ws && (ws.ended && !ws.destroyed))) return callback.call(stream, new Error('premature close'));
	};

	var onrequest = function() {
		stream.req.on('finish', onfinish);
	};

	if (isRequest(stream)) {
		stream.on('complete', onfinish);
		stream.on('abort', onclose);
		if (stream.req) onrequest();
		else stream.on('request', onrequest);
	} else if (writable && !ws) { // legacy streams
		stream.on('end', onlegacyfinish);
		stream.on('close', onlegacyfinish);
	}

	if (isChildProcess(stream)) stream.on('exit', onexit);

	stream.on('end', onend);
	stream.on('finish', onfinish);
	if (opts.error !== false) stream.on('error', onerror);
	stream.on('close', onclose);

	return function() {
		cancelled = true;
		stream.removeListener('complete', onfinish);
		stream.removeListener('abort', onclose);
		stream.removeListener('request', onrequest);
		if (stream.req) stream.req.removeListener('finish', onfinish);
		stream.removeListener('end', onlegacyfinish);
		stream.removeListener('close', onlegacyfinish);
		stream.removeListener('finish', onfinish);
		stream.removeListener('exit', onexit);
		stream.removeListener('end', onend);
		stream.removeListener('error', onerror);
		stream.removeListener('close', onclose);
	};
};

module.exports = eos;


/***/ }),
/* 10 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var baseGetTag = __webpack_require__(51),
    isObject = __webpack_require__(988);

/** `Object#toString` result references. */
var asyncTag = '[object AsyncFunction]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    proxyTag = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

module.exports = isFunction;


/***/ }),
/* 11 */
/***/ (function(module) {

// Returns a wrapper function that returns a wrapped callback
// The wrapper function should do some stuff, and return a
// presumably different callback function.
// This makes sure that own properties are retained, so that
// decorations and such are not lost along the way.
module.exports = wrappy
function wrappy (fn, cb) {
  if (fn && cb) return wrappy(fn)(cb)

  if (typeof fn !== 'function')
    throw new TypeError('need wrapper function')

  Object.keys(fn).forEach(function (k) {
    wrapper[k] = fn[k]
  })

  return wrapper

  function wrapper() {
    var args = new Array(arguments.length)
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i]
    }
    var ret = fn.apply(this, args)
    var cb = args[args.length-1]
    if (typeof ret === 'function' && ret !== cb) {
      Object.keys(cb).forEach(function (k) {
        ret[k] = cb[k]
      })
    }
    return ret
  }
}


/***/ }),
/* 12 */,
/* 13 */,
/* 14 */,
/* 15 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const os = __webpack_require__(87);

const extractPathRegex = /\s+at.*(?:\(|\s)(.*)\)?/;
const pathRegex = /^(?:(?:(?:node|(?:internal\/[\w/]*|.*node_modules\/(?:babel-polyfill|pirates)\/.*)?\w+)\.js:\d+:\d+)|native)/;
const homeDir = typeof os.homedir === 'undefined' ? '' : os.homedir();

module.exports = (stack, options) => {
	options = Object.assign({pretty: false}, options);

	return stack.replace(/\\/g, '/')
		.split('\n')
		.filter(line => {
			const pathMatches = line.match(extractPathRegex);
			if (pathMatches === null || !pathMatches[1]) {
				return true;
			}

			const match = pathMatches[1];

			// Electron
			if (
				match.includes('.app/Contents/Resources/electron.asar') ||
				match.includes('.app/Contents/Resources/default_app.asar')
			) {
				return false;
			}

			return !pathRegex.test(match);
		})
		.filter(line => line.trim() !== '')
		.map(line => {
			if (options.pretty) {
				return line.replace(extractPathRegex, (m, p1) => m.replace(p1, p1.replace(homeDir, '~')));
			}

			return line;
		})
		.join('\n');
};


/***/ }),
/* 16 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const pump = __webpack_require__(453);
const bufferStream = __webpack_require__(375);

class MaxBufferError extends Error {
	constructor() {
		super('maxBuffer exceeded');
		this.name = 'MaxBufferError';
	}
}

async function getStream(inputStream, options) {
	if (!inputStream) {
		return Promise.reject(new Error('Expected a stream'));
	}

	options = {
		maxBuffer: Infinity,
		...options
	};

	const {maxBuffer} = options;

	let stream;
	await new Promise((resolve, reject) => {
		const rejectPromise = error => {
			if (error) { // A null check
				error.bufferedData = stream.getBufferedValue();
			}

			reject(error);
		};

		stream = pump(inputStream, bufferStream(options), error => {
			if (error) {
				rejectPromise(error);
				return;
			}

			resolve();
		});

		stream.on('data', () => {
			if (stream.getBufferedLength() > maxBuffer) {
				rejectPromise(new MaxBufferError());
			}
		});
	});

	return stream.getBufferedValue();
}

module.exports = getStream;
// TODO: Remove this for the next major release
module.exports.default = getStream;
module.exports.buffer = (stream, options) => getStream(stream, {...options, encoding: 'buffer'});
module.exports.array = (stream, options) => getStream(stream, {...options, array: true});
module.exports.MaxBufferError = MaxBufferError;


/***/ }),
/* 17 */,
/* 18 */
/***/ (function() {

eval("require")("encoding");


/***/ }),
/* 19 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(422);
var RequestMethod_1 = __webpack_require__(819);
var MiddlewareControl_1 = __webpack_require__(5);
var MiddlewareUtil_1 = __webpack_require__(874);
var RedirectHandlerOptions_1 = __webpack_require__(770);
var TelemetryHandlerOptions_1 = __webpack_require__(343);
/**
 * @class
 * Class
 * @implements Middleware
 * Class representing RedirectHandler
 */
var RedirectHandler = /** @class */ (function () {
    /**
     * @public
     * @constructor
     * To create an instance of RedirectHandler
     * @param {RedirectHandlerOptions} [options = new RedirectHandlerOptions()] - The redirect handler options instance
     * @returns An instance of RedirectHandler
     */
    function RedirectHandler(options) {
        if (options === void 0) { options = new RedirectHandlerOptions_1.RedirectHandlerOptions(); }
        this.options = options;
    }
    /**
     * @private
     * To check whether the response has the redirect status code or not
     * @param {Response} response - The response object
     * @returns A boolean representing whether the response contains the redirect status code or not
     */
    RedirectHandler.prototype.isRedirect = function (response) {
        return RedirectHandler.REDIRECT_STATUS_CODES.indexOf(response.status) !== -1;
    };
    /**
     * @private
     * To check whether the response has location header or not
     * @param {Response} response - The response object
     * @returns A boolean representing the whether the response has location header or not
     */
    RedirectHandler.prototype.hasLocationHeader = function (response) {
        return response.headers.has(RedirectHandler.LOCATION_HEADER);
    };
    /**
     * @private
     * To get the redirect url from location header in response object
     * @param {Response} response - The response object
     * @returns A redirect url from location header
     */
    RedirectHandler.prototype.getLocationHeader = function (response) {
        return response.headers.get(RedirectHandler.LOCATION_HEADER);
    };
    /**
     * @private
     * To check whether the given url is a relative url or not
     * @param {string} url - The url string value
     * @returns A boolean representing whether the given url is a relative url or not
     */
    RedirectHandler.prototype.isRelativeURL = function (url) {
        return url.indexOf("://") === -1;
    };
    /**
     * @private
     * To check whether the authorization header in the request should be dropped for consequent redirected requests
     * @param {string} requestUrl - The request url value
     * @param {string} redirectUrl - The redirect url value
     * @returns A boolean representing whether the authorization header in the request should be dropped for consequent redirected requests
     */
    RedirectHandler.prototype.shouldDropAuthorizationHeader = function (requestUrl, redirectUrl) {
        var schemeHostRegex = /^[A-Za-z].+?:\/\/.+?(?=\/|$)/;
        var requestMatches = schemeHostRegex.exec(requestUrl);
        var requestAuthority;
        var redirectAuthority;
        if (requestMatches !== null) {
            requestAuthority = requestMatches[0];
        }
        var redirectMatches = schemeHostRegex.exec(redirectUrl);
        if (redirectMatches !== null) {
            redirectAuthority = redirectMatches[0];
        }
        return typeof requestAuthority !== "undefined" && typeof redirectAuthority !== "undefined" && requestAuthority !== redirectAuthority;
    };
    /**
     * @private
     * @async
     * To update a request url with the redirect url
     * @param {string} redirectUrl - The redirect url value
     * @param {Context} context - The context object value
     * @returns Nothing
     */
    RedirectHandler.prototype.updateRequestUrl = function (redirectUrl, context) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = context;
                        if (!(typeof context.request === "string")) return [3 /*break*/, 1];
                        _b = redirectUrl;
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, MiddlewareUtil_1.cloneRequestWithNewUrl(redirectUrl, context.request)];
                    case 2:
                        _b = _c.sent();
                        _c.label = 3;
                    case 3:
                        _a.request = _b;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @private
     * To get the options for execution of the middleware
     * @param {Context} context - The context object
     * @returns A options for middleware execution
     */
    RedirectHandler.prototype.getOptions = function (context) {
        var options;
        if (context.middlewareControl instanceof MiddlewareControl_1.MiddlewareControl) {
            options = context.middlewareControl.getMiddlewareOptions(RedirectHandlerOptions_1.RedirectHandlerOptions);
        }
        if (typeof options === "undefined") {
            options = Object.assign(new RedirectHandlerOptions_1.RedirectHandlerOptions(), this.options);
        }
        return options;
    };
    /**
     * @private
     * @async
     * To execute the next middleware and to handle in case of redirect response returned by the server
     * @param {Context} context - The context object
     * @param {number} redirectCount - The redirect count value
     * @param {RedirectHandlerOptions} options - The redirect handler options instance
     * @returns A promise that resolves to nothing
     */
    RedirectHandler.prototype.executeWithRedirect = function (context, redirectCount, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var response, redirectUrl, error_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        return [4 /*yield*/, this.nextMiddleware.execute(context)];
                    case 1:
                        _a.sent();
                        response = context.response;
                        if (!(redirectCount < options.maxRedirects && this.isRedirect(response) && this.hasLocationHeader(response) && options.shouldRedirect(response))) return [3 /*break*/, 6];
                        ++redirectCount;
                        if (!(response.status === RedirectHandler.STATUS_CODE_SEE_OTHER)) return [3 /*break*/, 2];
                        context.options.method = RequestMethod_1.RequestMethod.GET;
                        delete context.options.body;
                        return [3 /*break*/, 4];
                    case 2:
                        redirectUrl = this.getLocationHeader(response);
                        if (!this.isRelativeURL(redirectUrl) && this.shouldDropAuthorizationHeader(response.url, redirectUrl)) {
                            MiddlewareUtil_1.setRequestHeader(context.request, context.options, RedirectHandler.AUTHORIZATION_HEADER, undefined);
                        }
                        return [4 /*yield*/, this.updateRequestUrl(redirectUrl, context)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [4 /*yield*/, this.executeWithRedirect(context, redirectCount, options)];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 6: return [2 /*return*/];
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        error_1 = _a.sent();
                        throw error_1;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @public
     * @async
     * To execute the current middleware
     * @param {Context} context - The context object of the request
     * @returns A Promise that resolves to nothing
     */
    RedirectHandler.prototype.execute = function (context) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var redirectCount, options, error_2;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        redirectCount = 0;
                        options = this.getOptions(context);
                        context.options.redirect = RedirectHandler.MANUAL_REDIRECT;
                        TelemetryHandlerOptions_1.TelemetryHandlerOptions.updateFeatureUsageFlag(context, TelemetryHandlerOptions_1.FeatureUsageFlag.REDIRECT_HANDLER_ENABLED);
                        return [4 /*yield*/, this.executeWithRedirect(context, redirectCount, options)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_2 = _a.sent();
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @public
     * To set the next middleware in the chain
     * @param {Middleware} next - The middleware instance
     * @returns Nothing
     */
    RedirectHandler.prototype.setNext = function (next) {
        this.nextMiddleware = next;
    };
    /**
     * @private
     * @static
     * A member holding the array of redirect status codes
     */
    RedirectHandler.REDIRECT_STATUS_CODES = [
        301,
        302,
        303,
        307,
        308,
    ];
    /**
     * @private
     * @static
     * A member holding SeeOther status code
     */
    RedirectHandler.STATUS_CODE_SEE_OTHER = 303;
    /**
     * @private
     * @static
     * A member holding the name of the location header
     */
    RedirectHandler.LOCATION_HEADER = "Location";
    /**
     * @private
     * @static
     * A member representing the authorization header name
     */
    RedirectHandler.AUTHORIZATION_HEADER = "Authorization";
    /**
     * @private
     * @static
     * A member holding the manual redirect value
     */
    RedirectHandler.MANUAL_REDIRECT = "manual";
    return RedirectHandler;
}());
exports.RedirectHandler = RedirectHandler;
//# sourceMappingURL=RedirectHandler.js.map

/***/ }),
/* 20 */
/***/ (function(module) {

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}

module.exports = setCacheAdd;


/***/ }),
/* 21 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var baseGet = __webpack_require__(356),
    baseSet = __webpack_require__(918),
    castPath = __webpack_require__(929);

/**
 * The base implementation of  `_.pickBy` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The source object.
 * @param {string[]} paths The property paths to pick.
 * @param {Function} predicate The function invoked per property.
 * @returns {Object} Returns the new object.
 */
function basePickBy(object, paths, predicate) {
  var index = -1,
      length = paths.length,
      result = {};

  while (++index < length) {
    var path = paths[index],
        value = baseGet(object, path);

    if (predicate(value, path)) {
      baseSet(result, castPath(path, object), value);
    }
  }
  return result;
}

module.exports = basePickBy;


/***/ }),
/* 22 */
/***/ (function(module) {

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

module.exports = listCacheClear;


/***/ }),
/* 23 */
/***/ (function(module) {

/**
 * This function is like
 * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * except that it includes inherited enumerable properties.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function nativeKeysIn(object) {
  var result = [];
  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }
  return result;
}

module.exports = nativeKeysIn;


/***/ }),
/* 24 */,
/* 25 */,
/* 26 */,
/* 27 */,
/* 28 */,
/* 29 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(422);
/**
 * @class
 * Class for PageIterator
 */
var PageIterator = /** @class */ (function () {
    /**
     * @public
     * @constructor
     * Creates new instance for PageIterator
     * @param {Client} client - The graph client instance
     * @param {PageCollection} pageCollection - The page collection object
     * @param {PageIteratorCallback} callBack - The callback function
     * @returns An instance of a PageIterator
     */
    function PageIterator(client, pageCollection, callback) {
        this.client = client;
        this.collection = pageCollection.value;
        this.nextLink = pageCollection["@odata.nextLink"];
        this.deltaLink = pageCollection["@odata.deltaLink"];
        this.callback = callback;
        this.complete = false;
    }
    /**
     * @private
     * Iterates over a collection by enqueuing entries one by one and kicking the callback with the enqueued entry
     * @returns A boolean indicating the continue flag to process next page
     */
    PageIterator.prototype.iterationHelper = function () {
        if (this.collection === undefined) {
            return false;
        }
        var advance = true;
        while (advance && this.collection.length !== 0) {
            var item = this.collection.shift();
            advance = this.callback(item);
        }
        return advance;
    };
    /**
     * @private
     * @async
     * Helper to make a get request to fetch next page with nextLink url and update the page iterator instance with the returned response
     * @returns A promise that resolves to a response data with next page collection
     */
    PageIterator.prototype.fetchAndUpdateNextPageData = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var response, error_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client.api(this.nextLink).get()];
                    case 1:
                        response = _a.sent();
                        this.collection = response.value;
                        this.nextLink = response["@odata.nextLink"];
                        this.deltaLink = response["@odata.deltaLink"];
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @public
     * Getter to get the deltaLink in the current response
     * @returns A deltaLink which is being used to make delta requests in future
     */
    PageIterator.prototype.getDeltaLink = function () {
        return this.deltaLink;
    };
    /**
     * @public
     * @async
     * Iterates over the collection and kicks callback for each item on iteration. Fetches next set of data through nextLink and iterates over again
     * This happens until the nextLink is drained out or the user responds with a red flag to continue from callback
     * @returns A Promise that resolves to nothing on completion and throws error incase of any discrepancy.
     */
    PageIterator.prototype.iterate = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var advance, error_2;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        advance = this.iterationHelper();
                        _a.label = 1;
                    case 1:
                        if (!advance) return [3 /*break*/, 5];
                        if (!(this.nextLink !== undefined)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.fetchAndUpdateNextPageData()];
                    case 2:
                        _a.sent();
                        advance = this.iterationHelper();
                        return [3 /*break*/, 4];
                    case 3:
                        advance = false;
                        _a.label = 4;
                    case 4: return [3 /*break*/, 1];
                    case 5:
                        if (this.nextLink === undefined && this.collection.length === 0) {
                            this.complete = true;
                        }
                        return [3 /*break*/, 7];
                    case 6:
                        error_2 = _a.sent();
                        throw error_2;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @public
     * @async
     * To resume the iteration
     * Note: This internally calls the iterate method, It's just for more readability.
     * @returns A Promise that resolves to nothing on completion and throws error incase of any discrepancy
     */
    PageIterator.prototype.resume = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                try {
                    return [2 /*return*/, this.iterate()];
                }
                catch (error) {
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * @public
     * To get the completeness status of the iterator
     * @returns Boolean indicating the completeness
     */
    PageIterator.prototype.isComplete = function () {
        return this.complete;
    };
    return PageIterator;
}());
exports.PageIterator = PageIterator;
//# sourceMappingURL=PageIterator.js.map

/***/ }),
/* 30 */,
/* 31 */,
/* 32 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { improvedDH } = __webpack_require__(915)
const { KEYLENGTHS } = __webpack_require__(962)
const { generateSync } = __webpack_require__(104)
const { name: secp256k1 } = __webpack_require__(997)

const derive = __webpack_require__(715)

const wrapKey = (key, payload, { enc }) => {
  const epk = generateSync(key.kty, key.crv)

  const derivedKey = derive(enc, KEYLENGTHS.get(enc), epk, key)

  return {
    wrapped: derivedKey,
    header: { epk: { kty: key.kty, crv: key.crv, x: epk.x, y: epk.y } }
  }
}

const unwrapKey = (key, payload, header) => {
  const { enc, epk } = header
  return derive(enc, KEYLENGTHS.get(enc), key, epk, header)
}

module.exports = (JWA, JWK) => {
  JWA.keyManagementEncrypt.set('ECDH-ES', wrapKey)
  JWA.keyManagementDecrypt.set('ECDH-ES', unwrapKey)
  JWK.EC.deriveKey['ECDH-ES'] = key => (key.use === 'enc' || key.use === undefined) && key.crv !== secp256k1

  if (improvedDH) {
    JWK.OKP.deriveKey['ECDH-ES'] = key => (key.use === 'enc' || key.use === undefined) && key.keyObject.asymmetricKeyType.startsWith('x')
  }
}


/***/ }),
/* 33 */,
/* 34 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const {
  createSign,
  createVerify,
  constants
} = __webpack_require__(417)

const { KEYOBJECT } = __webpack_require__(771)
const resolveNodeAlg = __webpack_require__(165)
const { asInput } = __webpack_require__(727)

const sign = (nodeAlg, { [KEYOBJECT]: keyObject }, payload) => {
  const key = asInput(keyObject, false)
  return createSign(nodeAlg).update(payload).sign({
    key,
    padding: constants.RSA_PKCS1_PSS_PADDING,
    saltLength: constants.RSA_PSS_SALTLEN_DIGEST
  })
}

const verify = (nodeAlg, { [KEYOBJECT]: keyObject }, payload, signature) => {
  const key = asInput(keyObject, true)
  return createVerify(nodeAlg).update(payload).verify({
    key,
    padding: constants.RSA_PKCS1_PSS_PADDING,
    saltLength: constants.RSA_PSS_SALTLEN_DIGEST
  }, signature)
}

const LENGTHS = {
  PS256: 528,
  PS384: 784,
  PS512: 1040
}

module.exports = (JWA, JWK) => {
  ['PS256', 'PS384', 'PS512'].forEach((jwaAlg) => {
    const nodeAlg = resolveNodeAlg(jwaAlg)
    JWA.sign.set(jwaAlg, sign.bind(undefined, nodeAlg))
    JWA.verify.set(jwaAlg, verify.bind(undefined, nodeAlg))
    JWK.RSA.sign[jwaAlg] = key => key.private && JWK.RSA.verify[jwaAlg](key)
    JWK.RSA.verify[jwaAlg] = key => (key.use === 'sig' || key.use === undefined) && key.length >= LENGTHS[jwaAlg]
  })
}


/***/ }),
/* 35 */,
/* 36 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { createCipheriv, createDecipheriv, getCiphers } = __webpack_require__(417)

const uint64be = __webpack_require__(537)
const timingSafeEqual = __webpack_require__(355)
const { KEYOBJECT } = __webpack_require__(771)
const { asInput } = __webpack_require__(727)

const checkInput = (data) => {
  if (data !== undefined && data.length % 8 !== 0) {
    throw new Error('invalid data length')
  }
}

const IV = Buffer.alloc(8, 'a6', 'hex')

const xor = (a, b) => {
  const len = Math.max(a.length, b.length)
  const result = Buffer.alloc(len)
  for (let idx = 0; len > idx; idx++) {
    result[idx] = (a[idx] || 0) ^ (b[idx] || 0)
  }

  return result
}

const split = (input, size) => {
  const output = []
  for (let idx = 0; input.length > idx; idx += size) {
    output.push(input.slice(idx, idx + size))
  }
  return output
}

const wrapKey = (size, { [KEYOBJECT]: keyObject }, payload) => {
  const key = asInput(keyObject, false)
  const iv = Buffer.alloc(16)
  let R = split(payload, 8)
  let A
  let B
  let count
  A = IV
  for (let jdx = 0; jdx < 6; jdx++) {
    for (let idx = 0; R.length > idx; idx++) {
      count = (R.length * jdx) + idx + 1
      const cipher = createCipheriv(`aes${size}`, key, iv)
      B = Buffer.concat([A, R[idx]])
      B = cipher.update(B)

      A = xor(B.slice(0, 8), uint64be(count))
      R[idx] = B.slice(8, 16)
    }
  }
  R = [A].concat(R)

  return { wrapped: Buffer.concat(R) }
}

const unwrapKey = (size, { [KEYOBJECT]: keyObject }, payload) => {
  const key = asInput(keyObject, false)
  checkInput(payload)

  const iv = Buffer.alloc(16)

  let R = split(payload, 8)
  let A
  let B
  let count
  A = R[0]
  R = R.slice(1)
  for (let jdx = 5; jdx >= 0; --jdx) {
    for (let idx = R.length - 1; idx >= 0; --idx) {
      count = (R.length * jdx) + idx + 1
      B = xor(A, uint64be(count))
      B = Buffer.concat([B, R[idx], iv])
      const cipher = createDecipheriv(`aes${size}`, key, iv)
      B = cipher.update(B)

      A = B.slice(0, 8)
      R[idx] = B.slice(8, 16)
    }
  }

  if (!timingSafeEqual(IV, A)) {
    throw new Error('unwrap failed')
  }

  return Buffer.concat(R)
}

module.exports = (JWA, JWK) => {
  ['A128KW', 'A192KW', 'A256KW'].forEach((jwaAlg) => {
    const size = parseInt(jwaAlg.substr(1, 3), 10)
    if (getCiphers().includes(`aes${size}`)) {
      JWA.keyManagementEncrypt.set(jwaAlg, wrapKey.bind(undefined, size))
      JWA.keyManagementDecrypt.set(jwaAlg, unwrapKey.bind(undefined, size))
      JWK.oct.wrapKey[jwaAlg] = JWK.oct.unwrapKey[jwaAlg] = key => (key.use === 'enc' || key.use === undefined) && key.length === size
    }
  })
}


/***/ }),
/* 37 */,
/* 38 */,
/* 39 */
/***/ (function(module, __unusedexports, __webpack_require__) {

/* eslint-disable max-classes-per-file */

const { inspect, deprecate } = __webpack_require__(669);
const url = __webpack_require__(835);

const jose = __webpack_require__(387);
const pAny = __webpack_require__(547);
const LRU = __webpack_require__(702);
const objectHash = __webpack_require__(418);

const { RPError } = __webpack_require__(889);
const getClient = __webpack_require__(860);
const registry = __webpack_require__(667);
const processResponse = __webpack_require__(944);
const webfingerNormalize = __webpack_require__(548);
const instance = __webpack_require__(483);
const request = __webpack_require__(204);
const { assertIssuerConfiguration } = __webpack_require__(475);
const {
  ISSUER_DEFAULTS, OIDC_DISCOVERY, OAUTH2_DISCOVERY, WEBFINGER, REL, AAD_MULTITENANT_DISCOVERY,
} = __webpack_require__(766);

const AAD_MULTITENANT = Symbol('AAD_MULTITENANT');

class Issuer {
  /**
   * @name constructor
   * @api public
   */
  constructor(meta = {}) {
    const aadIssValidation = meta[AAD_MULTITENANT];
    delete meta[AAD_MULTITENANT];

    ['introspection', 'revocation'].forEach((endpoint) => {
      // if intro/revocation endpoint auth specific meta is missing use the token ones if they
      // are defined
      if (
        meta[`${endpoint}_endpoint`]
        && meta[`${endpoint}_endpoint_auth_methods_supported`] === undefined
        && meta[`${endpoint}_endpoint_auth_signing_alg_values_supported`] === undefined
      ) {
        if (meta.token_endpoint_auth_methods_supported) {
          meta[`${endpoint}_endpoint_auth_methods_supported`] = meta.token_endpoint_auth_methods_supported;
        }
        if (meta.token_endpoint_auth_signing_alg_values_supported) {
          meta[`${endpoint}_endpoint_auth_signing_alg_values_supported`] = meta.token_endpoint_auth_signing_alg_values_supported;
        }
      }
    });

    Object.entries(meta).forEach(([key, value]) => {
      instance(this).get('metadata').set(key, value);
      if (!this[key]) {
        Object.defineProperty(this, key, {
          get() { return instance(this).get('metadata').get(key); },
          enumerable: true,
        });
      }
    });

    instance(this).set('cache', new LRU({ max: 100 }));

    registry.set(this.issuer, this);

    Object.defineProperty(this, 'Client', {
      value: getClient(this, aadIssValidation),
    });

    Object.defineProperty(this, 'FAPIClient', {
      value: class FAPIClient extends this.Client {},
    });
  }

  /**
   * @name keystore
   * @api public
   */
  async keystore(reload = false) {
    assertIssuerConfiguration(this, 'jwks_uri');

    const keystore = instance(this).get('keystore');
    const cache = instance(this).get('cache');

    if (reload || !keystore) {
      cache.reset();
      const response = await request.call(this, {
        method: 'GET',
        json: true,
        url: this.jwks_uri,
      });
      const jwks = processResponse(response);

      const joseKeyStore = jose.JWKS.asKeyStore(jwks, { ignoreErrors: true });
      cache.set('throttle', true, 60 * 1000);
      instance(this).set('keystore', joseKeyStore);
      return joseKeyStore;
    }

    return keystore;
  }

  /**
   * @name queryKeyStore
   * @api private
   */
  async queryKeyStore({
    kid, kty, alg, use, key_ops: ops,
  }, { allowMulti = false } = {}) {
    const cache = instance(this).get('cache');

    const def = {
      kid, kty, alg, use, key_ops: ops,
    };

    const defHash = objectHash(def, {
      algorithm: 'sha256',
      ignoreUnknown: true,
      unorderedArrays: true,
      unorderedSets: true,
    });

    // refresh keystore on every unknown key but also only upto once every minute
    const freshJwksUri = cache.get(defHash) || cache.get('throttle');

    const keystore = await this.keystore(!freshJwksUri);
    const keys = keystore.all(def);

    if (keys.length === 0) {
      throw new RPError({
        printf: ["no valid key found in issuer's jwks_uri for key parameters %j", def],
        jwks: keystore,
      });
    }

    if (!allowMulti && keys.length > 1 && !kid) {
      throw new RPError({
        printf: ["multiple matching keys found in issuer's jwks_uri for key parameters %j, kid must be provided in this case", def],
        jwks: keystore,
      });
    }

    cache.set(defHash, true);

    return new jose.JWKS.KeyStore(keys);
  }

  /**
   * @name metadata
   * @api public
   */
  get metadata() {
    const copy = {};
    instance(this).get('metadata').forEach((value, key) => {
      copy[key] = value;
    });
    return copy;
  }

  /**
   * @name webfinger
   * @api public
   */
  static async webfinger(input) {
    const resource = webfingerNormalize(input);
    const { host } = url.parse(resource);
    const webfingerUrl = `https://${host}${WEBFINGER}`;

    const response = await request.call(this, {
      method: 'GET',
      url: webfingerUrl,
      json: true,
      query: { resource, rel: REL },
      followRedirect: true,
    });
    const body = processResponse(response);

    const location = Array.isArray(body.links) && body.links.find((link) => typeof link === 'object' && link.rel === REL && link.href);

    if (!location) {
      throw new RPError({
        message: 'no issuer found in webfinger response',
        body,
      });
    }

    if (typeof location.href !== 'string' || !location.href.startsWith('https://')) {
      throw new RPError({
        printf: ['invalid issuer location %s', location.href],
        body,
      });
    }

    const expectedIssuer = location.href;
    if (registry.has(expectedIssuer)) {
      return registry.get(expectedIssuer);
    }

    const issuer = await this.discover(expectedIssuer);

    if (issuer.issuer !== expectedIssuer) {
      registry.delete(issuer.issuer);
      throw new RPError('discovered issuer mismatch, expected %s, got: %s', expectedIssuer, issuer.issuer);
    }
    return issuer;
  }

  /**
   * @name discover
   * @api public
   */
  static async discover(uri) {
    const parsed = url.parse(uri);

    if (parsed.pathname.includes('/.well-known/')) {
      const response = await request.call(this, {
        method: 'GET',
        json: true,
        url: uri,
      });
      const body = processResponse(response);
      return new Issuer({
        ...ISSUER_DEFAULTS,
        ...body,
        [AAD_MULTITENANT]: AAD_MULTITENANT_DISCOVERY.has(uri),
      });
    }

    const uris = [];
    if (parsed.pathname === '/') {
      uris.push(`${OAUTH2_DISCOVERY}`);
    } else {
      uris.push(`${OAUTH2_DISCOVERY}${parsed.pathname}`);
    }
    if (parsed.pathname.endsWith('/')) {
      uris.push(`${parsed.pathname}${OIDC_DISCOVERY.substring(1)}`);
    } else {
      uris.push(`${parsed.pathname}${OIDC_DISCOVERY}`);
    }

    return pAny(uris.map(async (pathname) => {
      const wellKnownUri = url.format({ ...parsed, pathname });
      const response = await request.call(this, {
        method: 'GET',
        json: true,
        url: wellKnownUri,
      });
      const body = processResponse(response);
      return new Issuer({
        ...ISSUER_DEFAULTS,
        ...body,
        [AAD_MULTITENANT]: AAD_MULTITENANT_DISCOVERY.has(wellKnownUri),
      });
    }));
  }

  /* istanbul ignore next */
  [inspect.custom]() {
    return `${this.constructor.name} ${inspect(this.metadata, {
      depth: Infinity,
      colors: process.stdout.isTTY,
      compact: false,
      sorted: true,
    })}`;
  }
}

/**
 * @name key
 * @api private
 */
Issuer.prototype.key = deprecate(async function key({
  kid, kty, alg, use, key_ops: ops,
}, allowMulti = false) {
  const cache = instance(this).get('cache');

  const def = {
    kid, kty, alg, use, key_ops: ops,
  };

  const defHash = objectHash(def, {
    algorithm: 'sha256',
    ignoreUnknown: true,
    unorderedArrays: true,
    unorderedSets: true,
  });

  // refresh keystore on every unknown key but also only upto once every minute
  const freshJwksUri = cache.get(defHash) || cache.get('throttle');

  const keystore = await this.keystore(!freshJwksUri);
  const keys = keystore.all(def);

  if (keys.length === 0) {
    throw new RPError({
      printf: ["no valid key found in issuer's jwks_uri for key parameters %j", def],
      jwks: keystore,
    });
  }
  if (!allowMulti) {
    if (keys.length !== 1) {
      throw new RPError({
        printf: ["multiple matching keys found in issuer's jwks_uri for key parameters %j, kid must be provided in this case", def],
        jwks: keystore,
      });
    }
    cache.set(defHash, true);
  }
  return keys[0];
}, 'issuer.key is not only a private API, it is also deprecated');

module.exports = Issuer;


/***/ }),
/* 40 */,
/* 41 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var baseIsEqual = __webpack_require__(190),
    get = __webpack_require__(342),
    hasIn = __webpack_require__(360),
    isKey = __webpack_require__(748),
    isStrictComparable = __webpack_require__(258),
    matchesStrictComparable = __webpack_require__(2),
    toKey = __webpack_require__(503);

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;

/**
 * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
 *
 * @private
 * @param {string} path The path of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */
function baseMatchesProperty(path, srcValue) {
  if (isKey(path) && isStrictComparable(srcValue)) {
    return matchesStrictComparable(toKey(path), srcValue);
  }
  return function(object) {
    var objValue = get(object, path);
    return (objValue === undefined && objValue === srcValue)
      ? hasIn(object, path)
      : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
  };
}

module.exports = baseMatchesProperty;


/***/ }),
/* 42 */,
/* 43 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

const { inherits } = __webpack_require__(669)

function Reporter (options) {
  this._reporterState = {
    obj: null,
    path: [],
    options: options || {},
    errors: []
  }
}

Reporter.prototype.isError = function isError (obj) {
  return obj instanceof ReporterError
}

Reporter.prototype.save = function save () {
  const state = this._reporterState

  return { obj: state.obj, pathLen: state.path.length }
}

Reporter.prototype.restore = function restore (data) {
  const state = this._reporterState

  state.obj = data.obj
  state.path = state.path.slice(0, data.pathLen)
}

Reporter.prototype.enterKey = function enterKey (key) {
  return this._reporterState.path.push(key)
}

Reporter.prototype.exitKey = function exitKey (index) {
  const state = this._reporterState

  state.path = state.path.slice(0, index - 1)
}

Reporter.prototype.leaveKey = function leaveKey (index, key, value) {
  const state = this._reporterState

  this.exitKey(index)
  if (state.obj !== null) { state.obj[key] = value }
}

Reporter.prototype.path = function path () {
  return this._reporterState.path.join('/')
}

Reporter.prototype.enterObject = function enterObject () {
  const state = this._reporterState

  const prev = state.obj
  state.obj = {}
  return prev
}

Reporter.prototype.leaveObject = function leaveObject (prev) {
  const state = this._reporterState

  const now = state.obj
  state.obj = prev
  return now
}

Reporter.prototype.error = function error (msg) {
  let err
  const state = this._reporterState

  const inherited = msg instanceof ReporterError
  if (inherited) {
    err = msg
  } else {
    err = new ReporterError(state.path.map(function (elem) {
      return `[${JSON.stringify(elem)}]`
    }).join(''), msg.message || msg, msg.stack)
  }

  if (!state.options.partial) { throw err }

  if (!inherited) { state.errors.push(err) }

  return err
}

Reporter.prototype.wrapResult = function wrapResult (result) {
  const state = this._reporterState
  if (!state.options.partial) { return result }

  return {
    result: this.isError(result) ? null : result,
    errors: state.errors
  }
}

function ReporterError (path, msg) {
  this.path = path
  this.rethrow(msg)
}
inherits(ReporterError, Error)

ReporterError.prototype.rethrow = function rethrow (msg) {
  this.message = `${msg} at: ${this.path || '(shallow)'}`
  if (Error.captureStackTrace) { Error.captureStackTrace(this, ReporterError) }

  if (!this.stack) {
    try {
      // IE only adds stack when thrown
      throw new Error(this.message)
    } catch (e) {
      this.stack = e.stack
    }
  }
  return this
}

exports.Reporter = Reporter


/***/ }),
/* 44 */
/***/ (function(module) {

/* global BigInt */

const fromBase64 = (base64) => {
  return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

const encode = (input, encoding = 'utf8') => {
  return fromBase64(Buffer.from(input, encoding).toString('base64'))
}

const encodeBuffer = (buf) => {
  return fromBase64(buf.toString('base64'))
}

const decodeToBuffer = (input) => {
  return Buffer.from(input, 'base64')
}

const decode = (input, encoding = 'utf8') => {
  return decodeToBuffer(input).toString(encoding)
}

const b64uJSON = {
  encode: (input) => {
    return encode(JSON.stringify(input))
  },
  decode: (input, encoding = 'utf8') => {
    return JSON.parse(decode(input, encoding))
  }
}

b64uJSON.decode.try = (input, encoding = 'utf8') => {
  try {
    return b64uJSON.decode(input, encoding)
  } catch (err) {
    return decode(input, encoding)
  }
}

const bnToBuf = (bn) => {
  let hex = BigInt(bn).toString(16)
  if (hex.length % 2) {
    hex = `0${hex}`
  }

  const len = hex.length / 2
  const u8 = new Uint8Array(len)

  let i = 0
  let j = 0
  while (i < len) {
    u8[i] = parseInt(hex.slice(j, j + 2), 16)
    i += 1
    j += 2
  }

  return u8
}

const encodeBigInt = (bn) => encodeBuffer(Buffer.from(bnToBuf(bn)))

module.exports.decode = decode
module.exports.decodeToBuffer = decodeToBuffer
module.exports.encode = encode
module.exports.encodeBuffer = encodeBuffer
module.exports.JSON = b64uJSON
module.exports.encodeBigInt = encodeBigInt


/***/ }),
/* 45 */,
/* 46 */,
/* 47 */,
/* 48 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const Issuer = __webpack_require__(39);
const { OPError, RPError } = __webpack_require__(889);
const Registry = __webpack_require__(667);
const Strategy = __webpack_require__(166);
const TokenSet = __webpack_require__(933);
const { CLOCK_TOLERANCE, HTTP_OPTIONS } = __webpack_require__(766);
const generators = __webpack_require__(368);
const { setDefaults } = __webpack_require__(204);

module.exports = {
  Issuer,
  Registry,
  Strategy,
  TokenSet,
  errors: {
    OPError,
    RPError,
  },
  custom: {
    setHttpOptionsDefaults: setDefaults,
    http_options: HTTP_OPTIONS,
    clock_tolerance: CLOCK_TOLERANCE,
  },
  generators,
};


/***/ }),
/* 49 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var wrappy = __webpack_require__(11)
module.exports = wrappy(once)
module.exports.strict = wrappy(onceStrict)

once.proto = once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this)
    },
    configurable: true
  })

  Object.defineProperty(Function.prototype, 'onceStrict', {
    value: function () {
      return onceStrict(this)
    },
    configurable: true
  })
})

function once (fn) {
  var f = function () {
    if (f.called) return f.value
    f.called = true
    return f.value = fn.apply(this, arguments)
  }
  f.called = false
  return f
}

function onceStrict (fn) {
  var f = function () {
    if (f.called)
      throw new Error(f.onceError)
    f.called = true
    return f.value = fn.apply(this, arguments)
  }
  var name = fn.name || 'Function wrapped with `once`'
  f.onceError = name + " shouldn't be called more than once"
  f.called = false
  return f
}


/***/ }),
/* 50 */,
/* 51 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var Symbol = __webpack_require__(498),
    getRawTag = __webpack_require__(985),
    objectToString = __webpack_require__(602);

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

module.exports = baseGetTag;


/***/ }),
/* 52 */,
/* 53 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

// TODO: Use the `URL` global when targeting Node.js 10
const URLParser = typeof URL === 'undefined' ? __webpack_require__(835).URL : URL;

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
const DATA_URL_DEFAULT_MIME_TYPE = 'text/plain';
const DATA_URL_DEFAULT_CHARSET = 'us-ascii';

const testParameter = (name, filters) => {
	return filters.some(filter => filter instanceof RegExp ? filter.test(name) : filter === name);
};

const normalizeDataURL = (urlString, {stripHash}) => {
	const parts = urlString.match(/^data:(.*?),(.*?)(?:#(.*))?$/);

	if (!parts) {
		throw new Error(`Invalid URL: ${urlString}`);
	}

	const mediaType = parts[1].split(';');
	const body = parts[2];
	const hash = stripHash ? '' : parts[3];

	let base64 = false;

	if (mediaType[mediaType.length - 1] === 'base64') {
		mediaType.pop();
		base64 = true;
	}

	// Lowercase MIME type
	const mimeType = (mediaType.shift() || '').toLowerCase();
	const attributes = mediaType
		.map(attribute => {
			let [key, value = ''] = attribute.split('=').map(string => string.trim());

			// Lowercase `charset`
			if (key === 'charset') {
				value = value.toLowerCase();

				if (value === DATA_URL_DEFAULT_CHARSET) {
					return '';
				}
			}

			return `${key}${value ? `=${value}` : ''}`;
		})
		.filter(Boolean);

	const normalizedMediaType = [
		...attributes
	];

	if (base64) {
		normalizedMediaType.push('base64');
	}

	if (normalizedMediaType.length !== 0 || (mimeType && mimeType !== DATA_URL_DEFAULT_MIME_TYPE)) {
		normalizedMediaType.unshift(mimeType);
	}

	return `data:${normalizedMediaType.join(';')},${base64 ? body.trim() : body}${hash ? `#${hash}` : ''}`;
};

const normalizeUrl = (urlString, options) => {
	options = {
		defaultProtocol: 'http:',
		normalizeProtocol: true,
		forceHttp: false,
		forceHttps: false,
		stripAuthentication: true,
		stripHash: false,
		stripWWW: true,
		removeQueryParameters: [/^utm_\w+/i],
		removeTrailingSlash: true,
		removeDirectoryIndex: false,
		sortQueryParameters: true,
		...options
	};

	// TODO: Remove this at some point in the future
	if (Reflect.has(options, 'normalizeHttps')) {
		throw new Error('options.normalizeHttps is renamed to options.forceHttp');
	}

	if (Reflect.has(options, 'normalizeHttp')) {
		throw new Error('options.normalizeHttp is renamed to options.forceHttps');
	}

	if (Reflect.has(options, 'stripFragment')) {
		throw new Error('options.stripFragment is renamed to options.stripHash');
	}

	urlString = urlString.trim();

	// Data URL
	if (/^data:/i.test(urlString)) {
		return normalizeDataURL(urlString, options);
	}

	const hasRelativeProtocol = urlString.startsWith('//');
	const isRelativeUrl = !hasRelativeProtocol && /^\.*\//.test(urlString);

	// Prepend protocol
	if (!isRelativeUrl) {
		urlString = urlString.replace(/^(?!(?:\w+:)?\/\/)|^\/\//, options.defaultProtocol);
	}

	const urlObj = new URLParser(urlString);

	if (options.forceHttp && options.forceHttps) {
		throw new Error('The `forceHttp` and `forceHttps` options cannot be used together');
	}

	if (options.forceHttp && urlObj.protocol === 'https:') {
		urlObj.protocol = 'http:';
	}

	if (options.forceHttps && urlObj.protocol === 'http:') {
		urlObj.protocol = 'https:';
	}

	// Remove auth
	if (options.stripAuthentication) {
		urlObj.username = '';
		urlObj.password = '';
	}

	// Remove hash
	if (options.stripHash) {
		urlObj.hash = '';
	}

	// Remove duplicate slashes if not preceded by a protocol
	if (urlObj.pathname) {
		// TODO: Use the following instead when targeting Node.js 10
		// `urlObj.pathname = urlObj.pathname.replace(/(?<!https?:)\/{2,}/g, '/');`
		urlObj.pathname = urlObj.pathname.replace(/((?!:).|^)\/{2,}/g, (_, p1) => {
			if (/^(?!\/)/g.test(p1)) {
				return `${p1}/`;
			}

			return '/';
		});
	}

	// Decode URI octets
	if (urlObj.pathname) {
		urlObj.pathname = decodeURI(urlObj.pathname);
	}

	// Remove directory index
	if (options.removeDirectoryIndex === true) {
		options.removeDirectoryIndex = [/^index\.[a-z]+$/];
	}

	if (Array.isArray(options.removeDirectoryIndex) && options.removeDirectoryIndex.length > 0) {
		let pathComponents = urlObj.pathname.split('/');
		const lastComponent = pathComponents[pathComponents.length - 1];

		if (testParameter(lastComponent, options.removeDirectoryIndex)) {
			pathComponents = pathComponents.slice(0, pathComponents.length - 1);
			urlObj.pathname = pathComponents.slice(1).join('/') + '/';
		}
	}

	if (urlObj.hostname) {
		// Remove trailing dot
		urlObj.hostname = urlObj.hostname.replace(/\.$/, '');

		// Remove `www.`
		if (options.stripWWW && /^www\.([a-z\-\d]{2,63})\.([a-z.]{2,5})$/.test(urlObj.hostname)) {
			// Each label should be max 63 at length (min: 2).
			// The extension should be max 5 at length (min: 2).
			// Source: https://en.wikipedia.org/wiki/Hostname#Restrictions_on_valid_host_names
			urlObj.hostname = urlObj.hostname.replace(/^www\./, '');
		}
	}

	// Remove query unwanted parameters
	if (Array.isArray(options.removeQueryParameters)) {
		for (const key of [...urlObj.searchParams.keys()]) {
			if (testParameter(key, options.removeQueryParameters)) {
				urlObj.searchParams.delete(key);
			}
		}
	}

	// Sort query parameters
	if (options.sortQueryParameters) {
		urlObj.searchParams.sort();
	}

	if (options.removeTrailingSlash) {
		urlObj.pathname = urlObj.pathname.replace(/\/$/, '');
	}

	// Take advantage of many of the Node `url` normalizations
	urlString = urlObj.toString();

	// Remove ending `/`
	if ((options.removeTrailingSlash || urlObj.pathname === '/') && urlObj.hash === '') {
		urlString = urlString.replace(/\/$/, '');
	}

	// Restore relative protocol, if applicable
	if (hasRelativeProtocol && !options.normalizeProtocol) {
		urlString = urlString.replace(/^http:\/\//, '//');
	}

	// Remove http/https
	if (options.stripProtocol) {
		urlString = urlString.replace(/^(?:https?:)?\/\//, '');
	}

	return urlString;
};

module.exports = normalizeUrl;
// TODO: Remove this for the next major release
module.exports.default = normalizeUrl;


/***/ }),
/* 54 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const deferToConnect = __webpack_require__(958);

module.exports = request => {
	const timings = {
		start: Date.now(),
		socket: null,
		lookup: null,
		connect: null,
		upload: null,
		response: null,
		end: null,
		error: null,
		phases: {
			wait: null,
			dns: null,
			tcp: null,
			request: null,
			firstByte: null,
			download: null,
			total: null
		}
	};

	const handleError = origin => {
		const emit = origin.emit.bind(origin);
		origin.emit = (event, ...args) => {
			// Catches the `error` event
			if (event === 'error') {
				timings.error = Date.now();
				timings.phases.total = timings.error - timings.start;

				origin.emit = emit;
			}

			// Saves the original behavior
			return emit(event, ...args);
		};
	};

	let uploadFinished = false;
	const onUpload = () => {
		timings.upload = Date.now();
		timings.phases.request = timings.upload - timings.connect;
	};

	handleError(request);

	request.once('socket', socket => {
		timings.socket = Date.now();
		timings.phases.wait = timings.socket - timings.start;

		const lookupListener = () => {
			timings.lookup = Date.now();
			timings.phases.dns = timings.lookup - timings.socket;
		};

		socket.once('lookup', lookupListener);

		deferToConnect(socket, () => {
			timings.connect = Date.now();

			if (timings.lookup === null) {
				socket.removeListener('lookup', lookupListener);
				timings.lookup = timings.connect;
				timings.phases.dns = timings.lookup - timings.socket;
			}

			timings.phases.tcp = timings.connect - timings.lookup;

			if (uploadFinished && !timings.upload) {
				onUpload();
			}
		});
	});

	request.once('finish', () => {
		uploadFinished = true;

		if (timings.connect) {
			onUpload();
		}
	});

	request.once('response', response => {
		timings.response = Date.now();
		timings.phases.firstByte = timings.response - timings.upload;

		handleError(response);

		response.once('end', () => {
			timings.end = Date.now();
			timings.phases.download = timings.end - timings.response;
			timings.phases.total = timings.end - timings.start;
		});
	});

	return timings;
};


/***/ }),
/* 55 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const errors = __webpack_require__(774);
const asStream = __webpack_require__(794);
const asPromise = __webpack_require__(916);
const normalizeArguments = __webpack_require__(523);
const merge = __webpack_require__(821);
const deepFreeze = __webpack_require__(262);

const getPromiseOrStream = options => options.stream ? asStream(options) : asPromise(options);

const aliases = [
	'get',
	'post',
	'put',
	'patch',
	'head',
	'delete'
];

const create = defaults => {
	defaults = merge({}, defaults);
	normalizeArguments.preNormalize(defaults.options);

	if (!defaults.handler) {
		// This can't be getPromiseOrStream, because when merging
		// the chain would stop at this point and no further handlers would be called.
		defaults.handler = (options, next) => next(options);
	}

	function got(url, options) {
		try {
			return defaults.handler(normalizeArguments(url, options, defaults), getPromiseOrStream);
		} catch (error) {
			if (options && options.stream) {
				throw error;
			} else {
				return Promise.reject(error);
			}
		}
	}

	got.create = create;
	got.extend = options => {
		let mutableDefaults;
		if (options && Reflect.has(options, 'mutableDefaults')) {
			mutableDefaults = options.mutableDefaults;
			delete options.mutableDefaults;
		} else {
			mutableDefaults = defaults.mutableDefaults;
		}

		return create({
			options: merge.options(defaults.options, options),
			handler: defaults.handler,
			mutableDefaults
		});
	};

	got.mergeInstances = (...args) => create(merge.instances(args));

	got.stream = (url, options) => got(url, {...options, stream: true});

	for (const method of aliases) {
		got[method] = (url, options) => got(url, {...options, method});
		got.stream[method] = (url, options) => got.stream(url, {...options, method});
	}

	Object.assign(got, {...errors, mergeOptions: merge.options});
	Object.defineProperty(got, 'defaults', {
		value: defaults.mutableDefaults ? defaults : deepFreeze(defaults),
		writable: defaults.mutableDefaults,
		configurable: defaults.mutableDefaults,
		enumerable: true
	});

	return got;
};

module.exports = create;


/***/ }),
/* 56 */
/***/ (function(module) {

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

module.exports = isLength;


/***/ }),
/* 57 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const fs = __webpack_require__(747);
const util = __webpack_require__(669);
const is = __webpack_require__(534);
const isFormData = __webpack_require__(504);

module.exports = async options => {
	const {body} = options;

	if (options.headers['content-length']) {
		return Number(options.headers['content-length']);
	}

	if (!body && !options.stream) {
		return 0;
	}

	if (is.string(body)) {
		return Buffer.byteLength(body);
	}

	if (isFormData(body)) {
		return util.promisify(body.getLength.bind(body))();
	}

	if (body instanceof fs.ReadStream) {
		const {size} = await util.promisify(fs.stat)(body.path);
		return size;
	}

	return null;
};


/***/ }),
/* 58 */,
/* 59 */,
/* 60 */,
/* 61 */,
/* 62 */,
/* 63 */,
/* 64 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(422);
/**
 * @class
 * Class that handles BatchResponseContent
 */
var BatchResponseContent = /** @class */ (function () {
    /**
     * @public
     * @constructor
     * Creates the BatchResponseContent instance
     * @param {BatchResponseBody} response - The response body returned for batch request from server
     * @returns An instance of a BatchResponseContent
     */
    function BatchResponseContent(response) {
        this.responses = new Map();
        this.update(response);
    }
    /**
     * @private
     * Creates native Response object from the json representation of it.
     * @param {KeyValuePairObject} responseJSON - The response json value
     * @returns The Response Object instance
     */
    BatchResponseContent.prototype.createResponseObject = function (responseJSON) {
        var body = responseJSON.body;
        var options = {};
        options.status = responseJSON.status;
        if (responseJSON.statusText !== undefined) {
            options.statusText = responseJSON.statusText;
        }
        options.headers = responseJSON.headers;
        if (options.headers !== undefined && options.headers["Content-Type"] !== undefined) {
            if (options.headers["Content-Type"].split(";")[0] === "application/json") {
                var bodyString = JSON.stringify(body);
                return new Response(bodyString, options);
            }
        }
        return new Response(body, options);
    };
    /**
     * @public
     * Updates the Batch response content instance with given responses.
     * @param {BatchResponseBody} response - The response json representing batch response message
     * @returns Nothing
     */
    BatchResponseContent.prototype.update = function (response) {
        this.nextLink = response["@odata.nextLink"];
        var responses = response.responses;
        for (var i = 0, l = responses.length; i < l; i++) {
            this.responses.set(responses[i].id, this.createResponseObject(responses[i]));
        }
    };
    /**
     * @public
     * To get the response of a request for a given request id
     * @param {string} requestId - The request id value
     * @returns The Response object instance for the particular request
     */
    BatchResponseContent.prototype.getResponseById = function (requestId) {
        return this.responses.get(requestId);
    };
    /**
     * @public
     * To get all the responses of the batch request
     * @returns The Map of id and Response objects
     */
    BatchResponseContent.prototype.getResponses = function () {
        return this.responses;
    };
    /**
     * @public
     * To get the iterator for the responses
     * @returns The Iterable generator for the response objects
     */
    BatchResponseContent.prototype.getResponsesIterator = function () {
        var iterator, cur;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    iterator = this.responses.entries();
                    cur = iterator.next();
                    _a.label = 1;
                case 1:
                    if (!!cur.done) return [3 /*break*/, 3];
                    return [4 /*yield*/, cur.value];
                case 2:
                    _a.sent();
                    cur = iterator.next();
                    return [3 /*break*/, 1];
                case 3: return [2 /*return*/];
            }
        });
    };
    return BatchResponseContent;
}());
exports.BatchResponseContent = BatchResponseContent;
//# sourceMappingURL=BatchResponseContent.js.map

/***/ }),
/* 65 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { inflateRawSync } = __webpack_require__(761)

const base64url = __webpack_require__(44)
const getKey = __webpack_require__(322)
const { KeyStore } = __webpack_require__(851)
const errors = __webpack_require__(688)
const { check, decrypt, keyManagementDecrypt } = __webpack_require__(855)
const JWK = __webpack_require__(105)

const { createSecretKey } = __webpack_require__(727)
const generateCEK = __webpack_require__(201)
const validateHeaders = __webpack_require__(635)
const { detect: resolveSerialization } = __webpack_require__(975)

const SINGLE_RECIPIENT = new Set(['compact', 'flattened'])

const combineHeader = (prot = {}, unprotected = {}, header = {}) => {
  if (typeof prot === 'string') {
    prot = base64url.JSON.decode(prot)
  }

  const p2s = prot.p2s || unprotected.p2s || header.p2s
  const apu = prot.apu || unprotected.apu || header.apu
  const apv = prot.apv || unprotected.apv || header.apv
  const iv = prot.iv || unprotected.iv || header.iv
  const tag = prot.tag || unprotected.tag || header.tag

  return {
    ...prot,
    ...unprotected,
    ...header,
    ...(typeof p2s === 'string' ? { p2s: base64url.decodeToBuffer(p2s) } : undefined),
    ...(typeof apu === 'string' ? { apu: base64url.decodeToBuffer(apu) } : undefined),
    ...(typeof apv === 'string' ? { apv: base64url.decodeToBuffer(apv) } : undefined),
    ...(typeof iv === 'string' ? { iv: base64url.decodeToBuffer(iv) } : undefined),
    ...(typeof tag === 'string' ? { tag: base64url.decodeToBuffer(tag) } : undefined)
  }
}

/*
 * @public
 */
const jweDecrypt = (skipValidateHeaders, serialization, jwe, key, { crit = [], complete = false, algorithms } = {}) => {
  key = getKey(key, true)

  if (algorithms !== undefined && (!Array.isArray(algorithms) || algorithms.some(s => typeof s !== 'string' || !s))) {
    throw new TypeError('"algorithms" option must be an array of non-empty strings')
  } else if (algorithms) {
    algorithms = new Set(algorithms)
  }

  if (!Array.isArray(crit) || crit.some(s => typeof s !== 'string' || !s)) {
    throw new TypeError('"crit" option must be an array of non-empty strings')
  }

  if (!serialization) {
    serialization = resolveSerialization(jwe)
  }

  let alg, ciphertext, enc, encryptedKey, iv, opts, prot, tag, unprotected, cek, aad, header

  // treat general format with one recipient as flattened
  // skips iteration and avoids multi errors in this case
  if (serialization === 'general' && jwe.recipients.length === 1) {
    serialization = 'flattened'
    const { recipients, ...root } = jwe
    jwe = { ...root, ...recipients[0] }
  }

  if (SINGLE_RECIPIENT.has(serialization)) {
    if (serialization === 'compact') { // compact serialization format
      ([prot, encryptedKey, iv, ciphertext, tag] = jwe.split('.'))
    } else { // flattened serialization format
      ({ protected: prot, encrypted_key: encryptedKey, iv, ciphertext, tag, unprotected, aad, header } = jwe)
    }

    if (!skipValidateHeaders) {
      validateHeaders(prot, unprotected, [{ header }], true, crit)
    }

    opts = combineHeader(prot, unprotected, header)

    ;({ alg, enc } = opts)

    if (algorithms && !algorithms.has(alg === 'dir' ? enc : alg)) {
      throw new errors.JOSEAlgNotWhitelisted('alg not whitelisted')
    }

    if (key instanceof KeyStore) {
      const keystore = key
      let keys
      if (opts.alg === 'dir') {
        keys = keystore.all({ kid: opts.kid, alg: opts.enc, key_ops: ['decrypt'] })
      } else {
        keys = keystore.all({ kid: opts.kid, alg: opts.alg, key_ops: ['unwrapKey'] })
      }
      switch (keys.length) {
        case 0:
          throw new errors.JWKSNoMatchingKey()
        case 1:
          // treat the call as if a Key instance was passed in
          // skips iteration and avoids multi errors in this case
          key = keys[0]
          break
        default: {
          const errs = []
          for (const key of keys) {
            try {
              return jweDecrypt(true, serialization, jwe, key, { crit, complete, algorithms: algorithms ? [...algorithms] : undefined })
            } catch (err) {
              errs.push(err)
              continue
            }
          }

          const multi = new errors.JOSEMultiError(errs)
          if ([...multi].some(e => e instanceof errors.JWEDecryptionFailed)) {
            throw new errors.JWEDecryptionFailed()
          }
          throw multi
        }
      }
    }

    check(key, ...(alg === 'dir' ? ['decrypt', enc] : ['keyManagementDecrypt', alg]))

    try {
      if (alg === 'dir') {
        cek = JWK.asKey(key, { alg: enc, use: 'enc' })
      } else if (alg === 'ECDH-ES') {
        const unwrapped = keyManagementDecrypt(alg, key, undefined, opts)
        cek = JWK.asKey(createSecretKey(unwrapped), { alg: enc, use: 'enc' })
      } else {
        const unwrapped = keyManagementDecrypt(alg, key, base64url.decodeToBuffer(encryptedKey), opts)
        cek = JWK.asKey(createSecretKey(unwrapped), { alg: enc, use: 'enc' })
      }
    } catch (err) {
      // To mitigate the attacks described in RFC 3218, the
      // recipient MUST NOT distinguish between format, padding, and length
      // errors of encrypted keys.  It is strongly recommended, in the event
      // of receiving an improperly formatted key, that the recipient
      // substitute a randomly generated CEK and proceed to the next step, to
      // mitigate timing attacks.
      cek = generateCEK(enc)
    }

    let adata
    if (aad) {
      adata = Buffer.concat([
        Buffer.from(prot || ''),
        Buffer.from('.'),
        Buffer.from(aad)
      ])
    } else {
      adata = Buffer.from(prot || '')
    }

    try {
      iv = base64url.decodeToBuffer(iv)
    } catch (err) {}
    try {
      tag = base64url.decodeToBuffer(tag)
    } catch (err) {}

    let cleartext = decrypt(enc, cek, base64url.decodeToBuffer(ciphertext), { iv, tag, aad: adata })

    if (opts.zip) {
      cleartext = inflateRawSync(cleartext)
    }

    if (complete) {
      const result = { cleartext, key, cek }
      if (aad) result.aad = aad
      if (header) result.header = header
      if (unprotected) result.unprotected = unprotected
      if (prot) result.protected = base64url.JSON.decode(prot)
      return result
    }

    return cleartext
  }

  validateHeaders(jwe.protected, jwe.unprotected, jwe.recipients.map(({ header }) => ({ header })), true, crit)

  // general serialization format
  const { recipients, ...root } = jwe
  const errs = []
  for (const recipient of recipients) {
    try {
      return jweDecrypt(true, 'flattened', { ...root, ...recipient }, key, { crit, complete, algorithms: algorithms ? [...algorithms] : undefined })
    } catch (err) {
      errs.push(err)
      continue
    }
  }

  const multi = new errors.JOSEMultiError(errs)
  if ([...multi].some(e => e instanceof errors.JWEDecryptionFailed)) {
    throw new errors.JWEDecryptionFailed()
  } else if ([...multi].every(e => e instanceof errors.JWKSNoMatchingKey)) {
    throw new errors.JWKSNoMatchingKey()
  }
  throw multi
}

module.exports = jweDecrypt.bind(undefined, false, undefined)


/***/ }),
/* 66 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var baseCreate = __webpack_require__(318),
    getPrototype = __webpack_require__(488),
    isPrototype = __webpack_require__(653);

/**
 * Initializes an object clone.
 *
 * @private
 * @param {Object} object The object to clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneObject(object) {
  return (typeof object.constructor == 'function' && !isPrototype(object))
    ? baseCreate(getPrototype(object))
    : {};
}

module.exports = initCloneObject;


/***/ }),
/* 67 */,
/* 68 */,
/* 69 */
/***/ (function(module) {

module.exports = AlgorithmIdentifier => function () {
  this.seq().obj(
    this.key('algorithm').use(AlgorithmIdentifier),
    this.key('publicKey').bitstr()
  )
}


/***/ }),
/* 70 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var baseSetToString = __webpack_require__(292),
    shortOut = __webpack_require__(906);

/**
 * Sets the `toString` method of `func` to return `string`.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var setToString = shortOut(baseSetToString);

module.exports = setToString;


/***/ }),
/* 71 */,
/* 72 */,
/* 73 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var getMapData = __webpack_require__(569);

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  var data = getMapData(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

module.exports = mapCacheSet;


/***/ }),
/* 74 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var Symbol = __webpack_require__(498),
    Uint8Array = __webpack_require__(161),
    eq = __webpack_require__(338),
    equalArrays = __webpack_require__(90),
    mapToArray = __webpack_require__(664),
    setToArray = __webpack_require__(438);

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;

/** `Object#toString` result references. */
var boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]';

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * A specialized version of `baseIsEqualDeep` for comparing objects of
 * the same `toStringTag`.
 *
 * **Note:** This function only supports comparing values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {string} tag The `toStringTag` of the objects to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
  switch (tag) {
    case dataViewTag:
      if ((object.byteLength != other.byteLength) ||
          (object.byteOffset != other.byteOffset)) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;

    case arrayBufferTag:
      if ((object.byteLength != other.byteLength) ||
          !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
        return false;
      }
      return true;

    case boolTag:
    case dateTag:
    case numberTag:
      // Coerce booleans to `1` or `0` and dates to milliseconds.
      // Invalid dates are coerced to `NaN`.
      return eq(+object, +other);

    case errorTag:
      return object.name == other.name && object.message == other.message;

    case regexpTag:
    case stringTag:
      // Coerce regexes to strings and treat strings, primitives and objects,
      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
      // for more details.
      return object == (other + '');

    case mapTag:
      var convert = mapToArray;

    case setTag:
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
      convert || (convert = setToArray);

      if (object.size != other.size && !isPartial) {
        return false;
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= COMPARE_UNORDERED_FLAG;

      // Recursively compare objects (susceptible to call stack limits).
      stack.set(object, other);
      var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
      stack['delete'](object);
      return result;

    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }
  }
  return false;
}

module.exports = equalByTag;


/***/ }),
/* 75 */,
/* 76 */,
/* 77 */,
/* 78 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var getMapData = __webpack_require__(569);

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  var result = getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

module.exports = mapCacheDelete;


/***/ }),
/* 79 */,
/* 80 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(422);
var LargeFileUploadTask_1 = __webpack_require__(722);
var OneDriveLargeFileUploadTaskUtil_1 = __webpack_require__(519);
/**
 * @class
 * Class representing OneDriveLargeFileUploadTask
 */
var OneDriveLargeFileUploadTask = /** @class */ (function (_super) {
    tslib_1.__extends(OneDriveLargeFileUploadTask, _super);
    /**
     * @public
     * @constructor
     * Constructs a OneDriveLargeFileUploadTask
     * @param {Client} client - The GraphClient instance
     * @param {FileObject} file - The FileObject holding details of a file that needs to be uploaded
     * @param {LargeFileUploadSession} uploadSession - The upload session to which the upload has to be done
     * @param {LargeFileUploadTaskOptions} options - The upload task options
     * @returns An instance of OneDriveLargeFileUploadTask
     */
    function OneDriveLargeFileUploadTask(client, file, uploadSession, options) {
        return _super.call(this, client, file, uploadSession, options) || this;
    }
    /**
     * @private
     * @static
     * Constructs the create session url for Onedrive
     * @param {string} fileName - The name of the file
     * @param {path} [path = OneDriveLargeFileUploadTask.DEFAULT_UPLOAD_PATH] - The path for the upload
     * @returns The constructed create session url
     */
    OneDriveLargeFileUploadTask.constructCreateSessionUrl = function (fileName, path) {
        if (path === void 0) { path = OneDriveLargeFileUploadTask.DEFAULT_UPLOAD_PATH; }
        fileName = fileName.trim();
        path = path.trim();
        if (path === "") {
            path = "/";
        }
        if (path[0] !== "/") {
            path = "/" + path;
        }
        if (path[path.length - 1] !== "/") {
            path = path + "/";
        }
        return encodeURI("/me/drive/root:" + path + fileName + ":/createUploadSession");
    };
    /**
     * @public
     * @static
     * @async
     * Creates a OneDriveLargeFileUploadTask
     * @param {Client} client - The GraphClient instance
     * @param {Blob | Buffer | File} file - File represented as Blob, Buffer or File
     * @param {OneDriveLargeFileUploadOptions} options - The options for upload task
     * @returns The promise that will be resolves to OneDriveLargeFileUploadTask instance
     */
    OneDriveLargeFileUploadTask.create = function (client, file, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var name, content, size, b, requestUrl, session, rangeSize, fileObj, err_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        name = options.fileName;
                        if (typeof Blob !== "undefined" && file instanceof Blob) {
                            content = new File([file], name);
                            size = content.size;
                        }
                        else if (typeof File !== "undefined" && file instanceof File) {
                            content = file;
                            size = content.size;
                        }
                        else if (typeof Buffer !== "undefined" && file instanceof Buffer) {
                            b = file;
                            size = b.byteLength - b.byteOffset;
                            content = b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        requestUrl = OneDriveLargeFileUploadTask.constructCreateSessionUrl(options.fileName, options.path);
                        return [4 /*yield*/, OneDriveLargeFileUploadTask.createUploadSession(client, requestUrl, options.fileName)];
                    case 2:
                        session = _a.sent();
                        rangeSize = OneDriveLargeFileUploadTaskUtil_1.getValidRangeSize(options.rangeSize);
                        fileObj = {
                            name: name,
                            content: content,
                            size: size,
                        };
                        return [2 /*return*/, new OneDriveLargeFileUploadTask(client, fileObj, session, {
                                rangeSize: rangeSize,
                            })];
                    case 3:
                        err_1 = _a.sent();
                        throw err_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @public
     * @static
     * @async
     * Makes request to the server to create an upload session
     * @param {Client} client - The GraphClient instance
     * @param {string} requestUrl - The URL to create the upload session
     * @param {string} fileName - The name of a file to upload, (with extension)
     * @returns The promise that resolves to LargeFileUploadSession
     */
    OneDriveLargeFileUploadTask.createUploadSession = function (client, requestUrl, fileName) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var payload;
            return tslib_1.__generator(this, function (_a) {
                payload = {
                    item: {
                        "@microsoft.graph.conflictBehavior": "rename",
                        name: fileName,
                    },
                };
                try {
                    return [2 /*return*/, _super.createUploadSession.call(this, client, requestUrl, payload)];
                }
                catch (err) {
                    throw err;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * @public
     * Commits upload session to end uploading
     * @param {string} requestUrl - The URL to commit the upload session
     * @returns The promise resolves to committed response
     */
    OneDriveLargeFileUploadTask.prototype.commit = function (requestUrl) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var payload, err_2;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        payload = {
                            name: this.file.name,
                            "@microsoft.graph.conflictBehavior": "rename",
                            "@microsoft.graph.sourceUrl": this.uploadSession.url,
                        };
                        return [4 /*yield*/, this.client.api(requestUrl).put(payload)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        err_2 = _a.sent();
                        throw err_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @private
     * @static
     * Default path for the file being uploaded
     */
    OneDriveLargeFileUploadTask.DEFAULT_UPLOAD_PATH = "/";
    return OneDriveLargeFileUploadTask;
}(LargeFileUploadTask_1.LargeFileUploadTask));
exports.OneDriveLargeFileUploadTask = OneDriveLargeFileUploadTask;
//# sourceMappingURL=OneDriveLargeFileUploadTask.js.map

/***/ }),
/* 81 */,
/* 82 */,
/* 83 */
/***/ (function(module) {

/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */
function identity(value) {
  return value;
}

module.exports = identity;


/***/ }),
/* 84 */
/***/ (function(module, __unusedexports, __webpack_require__) {

module.exports = {
  der: __webpack_require__(822)
}


/***/ }),
/* 85 */,
/* 86 */
/***/ (function(module) {

"use strict";

module.exports = function (obj) {
	var ret = {};
	var keys = Object.keys(Object(obj));

	for (var i = 0; i < keys.length; i++) {
		ret[keys[i].toLowerCase()] = obj[keys[i]];
	}

	return ret;
};


/***/ }),
/* 87 */
/***/ (function(module) {

module.exports = require("os");

/***/ }),
/* 88 */,
/* 89 */
/***/ (function(module) {

"use strict";


// We define these manually to ensure they're always copied
// even if they would move up the prototype chain
// https://nodejs.org/api/http.html#http_class_http_incomingmessage
const knownProps = [
	'destroy',
	'setTimeout',
	'socket',
	'headers',
	'trailers',
	'rawHeaders',
	'statusCode',
	'httpVersion',
	'httpVersionMinor',
	'httpVersionMajor',
	'rawTrailers',
	'statusMessage'
];

module.exports = (fromStream, toStream) => {
	const fromProps = new Set(Object.keys(fromStream).concat(knownProps));

	for (const prop of fromProps) {
		// Don't overwrite existing properties
		if (prop in toStream) {
			continue;
		}

		toStream[prop] = typeof fromStream[prop] === 'function' ? fromStream[prop].bind(fromStream) : fromStream[prop];
	}
};


/***/ }),
/* 90 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var SetCache = __webpack_require__(405),
    arraySome = __webpack_require__(743),
    cacheHas = __webpack_require__(275);

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;

/**
 * A specialized version of `baseIsEqualDeep` for arrays with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Array} array The array to compare.
 * @param {Array} other The other array to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `array` and `other` objects.
 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
 */
function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
      arrLength = array.length,
      othLength = other.length;

  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(array);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var index = -1,
      result = true,
      seen = (bitmask & COMPARE_UNORDERED_FLAG) ? new SetCache : undefined;

  stack.set(array, other);
  stack.set(other, array);

  // Ignore non-index properties.
  while (++index < arrLength) {
    var arrValue = array[index],
        othValue = other[index];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, arrValue, index, other, array, stack)
        : customizer(arrValue, othValue, index, array, other, stack);
    }
    if (compared !== undefined) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    // Recursively compare arrays (susceptible to call stack limits).
    if (seen) {
      if (!arraySome(other, function(othValue, othIndex) {
            if (!cacheHas(seen, othIndex) &&
                (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
              return seen.push(othIndex);
            }
          })) {
        result = false;
        break;
      }
    } else if (!(
          arrValue === othValue ||
            equalFunc(arrValue, othValue, bitmask, customizer, stack)
        )) {
      result = false;
      break;
    }
  }
  stack['delete'](array);
  stack['delete'](other);
  return result;
}

module.exports = equalArrays;


/***/ }),
/* 91 */,
/* 92 */,
/* 93 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const Readable = __webpack_require__(413).Readable;
const lowercaseKeys = __webpack_require__(86);

class Response extends Readable {
	constructor(statusCode, headers, body, url) {
		if (typeof statusCode !== 'number') {
			throw new TypeError('Argument `statusCode` should be a number');
		}
		if (typeof headers !== 'object') {
			throw new TypeError('Argument `headers` should be an object');
		}
		if (!(body instanceof Buffer)) {
			throw new TypeError('Argument `body` should be a buffer');
		}
		if (typeof url !== 'string') {
			throw new TypeError('Argument `url` should be a string');
		}

		super();
		this.statusCode = statusCode;
		this.headers = lowercaseKeys(headers);
		this.body = body;
		this.url = url;
	}

	_read() {
		this.push(this.body);
		this.push(null);
	}
}

module.exports = Response;


/***/ }),
/* 94 */,
/* 95 */,
/* 96 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var baseIsMap = __webpack_require__(229),
    baseUnary = __webpack_require__(231),
    nodeUtil = __webpack_require__(616);

/* Node.js helper references. */
var nodeIsMap = nodeUtil && nodeUtil.isMap;

/**
 * Checks if `value` is classified as a `Map` object.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a map, else `false`.
 * @example
 *
 * _.isMap(new Map);
 * // => true
 *
 * _.isMap(new WeakMap);
 * // => false
 */
var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;

module.exports = isMap;


/***/ }),
/* 97 */
/***/ (function(module) {

const MAX_OCTET = 0x80
const CLASS_UNIVERSAL = 0
const PRIMITIVE_BIT = 0x20
const TAG_SEQ = 0x10
const TAG_INT = 0x02
const ENCODED_TAG_SEQ = (TAG_SEQ | PRIMITIVE_BIT) | (CLASS_UNIVERSAL << 6)
const ENCODED_TAG_INT = TAG_INT | (CLASS_UNIVERSAL << 6)

const getParamSize = keySize => ((keySize / 8) | 0) + (keySize % 8 === 0 ? 0 : 1)

const paramBytesForAlg = {
  ES256: getParamSize(256),
  ES256K: getParamSize(256),
  ES384: getParamSize(384),
  ES512: getParamSize(521)
}

const countPadding = (buf, start, stop) => {
  let padding = 0
  while (start + padding < stop && buf[start + padding] === 0) {
    ++padding
  }

  const needsSign = buf[start + padding] >= MAX_OCTET
  if (needsSign) {
    --padding
  }

  return padding
}

module.exports.derToJose = (signature, alg) => {
  if (!Buffer.isBuffer(signature)) {
    throw new TypeError('ECDSA signature must be a Buffer')
  }

  if (!paramBytesForAlg[alg]) {
    throw new Error(`Unknown algorithm "${alg}"`)
  }

  const paramBytes = paramBytesForAlg[alg]

  // the DER encoded param should at most be the param size, plus a padding
  // zero, since due to being a signed integer
  const maxEncodedParamLength = paramBytes + 1

  const inputLength = signature.length

  let offset = 0
  if (signature[offset++] !== ENCODED_TAG_SEQ) {
    throw new Error('Could not find expected "seq"')
  }

  let seqLength = signature[offset++]
  if (seqLength === (MAX_OCTET | 1)) {
    seqLength = signature[offset++]
  }

  if (inputLength - offset < seqLength) {
    throw new Error(`"seq" specified length of ${seqLength}", only ${inputLength - offset}" remaining`)
  }

  if (signature[offset++] !== ENCODED_TAG_INT) {
    throw new Error('Could not find expected "int" for "r"')
  }

  const rLength = signature[offset++]

  if (inputLength - offset - 2 < rLength) {
    throw new Error(`"r" specified length of "${rLength}", only "${inputLength - offset - 2}" available`)
  }

  if (maxEncodedParamLength < rLength) {
    throw new Error(`"r" specified length of "${rLength}", max of "${maxEncodedParamLength}" is acceptable`)
  }

  const rOffset = offset
  offset += rLength

  if (signature[offset++] !== ENCODED_TAG_INT) {
    throw new Error('Could not find expected "int" for "s"')
  }

  const sLength = signature[offset++]

  if (inputLength - offset !== sLength) {
    throw new Error(`"s" specified length of "${sLength}", expected "${inputLength - offset}"`)
  }

  if (maxEncodedParamLength < sLength) {
    throw new Error(`"s" specified length of "${sLength}", max of "${maxEncodedParamLength}" is acceptable`)
  }

  const sOffset = offset
  offset += sLength

  if (offset !== inputLength) {
    throw new Error(`Expected to consume entire buffer, but "${inputLength - offset}" bytes remain`)
  }

  const rPadding = paramBytes - rLength

  const sPadding = paramBytes - sLength

  const dst = Buffer.allocUnsafe(rPadding + rLength + sPadding + sLength)

  for (offset = 0; offset < rPadding; ++offset) {
    dst[offset] = 0
  }
  signature.copy(dst, offset, rOffset + Math.max(-rPadding, 0), rOffset + rLength)

  offset = paramBytes

  for (const o = offset; offset < o + sPadding; ++offset) {
    dst[offset] = 0
  }
  signature.copy(dst, offset, sOffset + Math.max(-sPadding, 0), sOffset + sLength)

  return dst
}

module.exports.joseToDer = (signature, alg) => {
  if (!Buffer.isBuffer(signature)) {
    throw new TypeError('ECDSA signature must be a Buffer')
  }

  if (!paramBytesForAlg[alg]) {
    throw new TypeError(`Unknown algorithm "${alg}"`)
  }

  const paramBytes = paramBytesForAlg[alg]

  const signatureBytes = signature.length
  if (signatureBytes !== paramBytes * 2) {
    throw new Error(`"${alg}" signatures must be "${paramBytes * 2}" bytes, saw "${signatureBytes}"`)
  }

  const rPadding = countPadding(signature, 0, paramBytes)
  const sPadding = countPadding(signature, paramBytes, signature.length)
  const rLength = paramBytes - rPadding
  const sLength = paramBytes - sPadding

  const rsBytes = 1 + 1 + rLength + 1 + 1 + sLength

  const shortLength = rsBytes < MAX_OCTET

  const dst = Buffer.allocUnsafe((shortLength ? 2 : 3) + rsBytes)

  let offset = 0
  dst[offset++] = ENCODED_TAG_SEQ
  if (shortLength) {
    // Bit 8 has value "0"
    // bits 7-1 give the length.
    dst[offset++] = rsBytes
  } else {
    // Bit 8 of first octet has value "1"
    // bits 7-1 give the number of additional length octets.
    dst[offset++] = MAX_OCTET	| 1 // eslint-disable-line no-tabs
    // length, base 256
    dst[offset++] = rsBytes & 0xff
  }
  dst[offset++] = ENCODED_TAG_INT
  dst[offset++] = rLength
  if (rPadding < 0) {
    dst[offset++] = 0
    offset += signature.copy(dst, offset, 0, paramBytes)
  } else {
    offset += signature.copy(dst, offset, rPadding, paramBytes)
  }
  dst[offset++] = ENCODED_TAG_INT
  dst[offset++] = sLength
  if (sPadding < 0) {
    dst[offset++] = 0
    signature.copy(dst, offset, paramBytes)
  } else {
    signature.copy(dst, offset, paramBytes + sPadding)
  }

  return dst
}


/***/ }),
/* 98 */,
/* 99 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { createCipheriv, createDecipheriv, getCiphers } = __webpack_require__(417)

const uint64be = __webpack_require__(537)
const timingSafeEqual = __webpack_require__(355)
const { KEYOBJECT } = __webpack_require__(771)
const { JWEInvalid, JWEDecryptionFailed } = __webpack_require__(688)

const checkInput = function (size, iv, tag) {
  if (iv.length !== 16) {
    throw new JWEInvalid('invalid iv')
  }
  if (arguments.length === 3) {
    if (tag.length !== size / 8) {
      throw new JWEInvalid('invalid tag')
    }
  }
}

const encrypt = (size, sign, { [KEYOBJECT]: keyObject }, cleartext, { iv, aad = Buffer.alloc(0) }) => {
  const key = keyObject.export()
  checkInput(size, iv)

  const keySize = size / 8
  const encKey = key.slice(keySize)
  const cipher = createCipheriv(`aes-${size}-cbc`, encKey, iv)
  const ciphertext = Buffer.concat([cipher.update(cleartext), cipher.final()])
  const macData = Buffer.concat([aad, iv, ciphertext, uint64be(aad.length * 8)])

  const macKey = key.slice(0, keySize)
  const tag = sign({ [KEYOBJECT]: macKey }, macData).slice(0, keySize)

  return { ciphertext, tag }
}

const decrypt = (size, sign, { [KEYOBJECT]: keyObject }, ciphertext, { iv, tag = Buffer.alloc(0), aad = Buffer.alloc(0) }) => {
  checkInput(size, iv, tag)

  const keySize = size / 8
  const key = keyObject.export()
  const encKey = key.slice(keySize)
  const macKey = key.slice(0, keySize)

  const macData = Buffer.concat([aad, iv, ciphertext, uint64be(aad.length * 8)])
  const expectedTag = sign({ [KEYOBJECT]: macKey }, macData, tag).slice(0, keySize)
  const macCheckPassed = timingSafeEqual(tag, expectedTag)

  let cleartext
  try {
    const cipher = createDecipheriv(`aes-${size}-cbc`, encKey, iv)
    cleartext = Buffer.concat([cipher.update(ciphertext), cipher.final()])
  } catch (err) {}

  if (!cleartext || !macCheckPassed) {
    throw new JWEDecryptionFailed()
  }

  return cleartext
}

module.exports = (JWA, JWK) => {
  ['A128CBC-HS256', 'A192CBC-HS384', 'A256CBC-HS512'].forEach((jwaAlg) => {
    const size = parseInt(jwaAlg.substr(1, 3), 10)
    const sign = JWA.sign.get(`HS${size * 2}`)
    if (getCiphers().includes(`aes-${size}-cbc`)) {
      JWA.encrypt.set(jwaAlg, encrypt.bind(undefined, size, sign))
      JWA.decrypt.set(jwaAlg, decrypt.bind(undefined, size, sign))
      JWK.oct.encrypt[jwaAlg] = JWK.oct.decrypt[jwaAlg] = key => (key.use === 'enc' || key.use === undefined) && key.length / 2 === size
    }
  })
}


/***/ }),
/* 100 */,
/* 101 */,
/* 102 */,
/* 103 */,
/* 104 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const errors = __webpack_require__(688)

const importKey = __webpack_require__(284)

const RSAKey = __webpack_require__(872)
const ECKey = __webpack_require__(186)
const OKPKey = __webpack_require__(728)
const OctKey = __webpack_require__(847)

const generate = async (kty, crvOrSize, params, generatePrivate = true) => {
  switch (kty) {
    case 'RSA':
      return importKey(
        await RSAKey.generate(crvOrSize, generatePrivate),
        params
      )
    case 'EC':
      return importKey(
        await ECKey.generate(crvOrSize, generatePrivate),
        params
      )
    case 'OKP':
      return importKey(
        await OKPKey.generate(crvOrSize, generatePrivate),
        params
      )
    case 'oct':
      return importKey(
        await OctKey.generate(crvOrSize, generatePrivate),
        params
      )
    default:
      throw new errors.JOSENotSupported(`unsupported key type: ${kty}`)
  }
}

const generateSync = (kty, crvOrSize, params, generatePrivate = true) => {
  switch (kty) {
    case 'RSA':
      return importKey(RSAKey.generateSync(crvOrSize, generatePrivate), params)
    case 'EC':
      return importKey(ECKey.generateSync(crvOrSize, generatePrivate), params)
    case 'OKP':
      return importKey(OKPKey.generateSync(crvOrSize, generatePrivate), params)
    case 'oct':
      return importKey(OctKey.generateSync(crvOrSize, generatePrivate), params)
    default:
      throw new errors.JOSENotSupported(`unsupported key type: ${kty}`)
  }
}

module.exports.generate = generate
module.exports.generateSync = generateSync


/***/ }),
/* 105 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const Key = __webpack_require__(228)
const None = __webpack_require__(611)
const importKey = __webpack_require__(284)
const generate = __webpack_require__(104)

module.exports = {
  ...generate,
  asKey: importKey,
  isKey: input => input instanceof Key,
  None
}

/* deprecated */
Object.defineProperty(module.exports, 'importKey', {
  value: importKey.deprecated,
  enumerable: false
})


/***/ }),
/* 106 */,
/* 107 */,
/* 108 */
/***/ (function(module) {

module.exports = function pick(object, ...paths) {
  const obj = {};
  for (const path of paths) { // eslint-disable-line no-restricted-syntax
    if (object[path]) {
      obj[path] = object[path];
    }
  }
  return obj;
};


/***/ }),
/* 109 */,
/* 110 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { inherits } = __webpack_require__(669)

const { Reporter } = __webpack_require__(43)

function DecoderBuffer (base, options) {
  Reporter.call(this, options)
  if (!Buffer.isBuffer(base)) {
    this.error('Input not Buffer')
    return
  }

  this.base = base
  this.offset = 0
  this.length = base.length
}
inherits(DecoderBuffer, Reporter)

DecoderBuffer.isDecoderBuffer = function isDecoderBuffer (data) {
  if (data instanceof DecoderBuffer) {
    return true
  }

  // Or accept compatible API
  const isCompatible = typeof data === 'object' &&
    Buffer.isBuffer(data.base) &&
    data.constructor.name === 'DecoderBuffer' &&
    typeof data.offset === 'number' &&
    typeof data.length === 'number' &&
    typeof data.save === 'function' &&
    typeof data.restore === 'function' &&
    typeof data.isEmpty === 'function' &&
    typeof data.readUInt8 === 'function' &&
    typeof data.skip === 'function' &&
    typeof data.raw === 'function'

  return isCompatible
}

DecoderBuffer.prototype.save = function save () {
  return { offset: this.offset, reporter: Reporter.prototype.save.call(this) }
}

DecoderBuffer.prototype.restore = function restore (save) {
  // Return skipped data
  const res = new DecoderBuffer(this.base)
  res.offset = save.offset
  res.length = this.offset

  this.offset = save.offset
  Reporter.prototype.restore.call(this, save.reporter)

  return res
}

DecoderBuffer.prototype.isEmpty = function isEmpty () {
  return this.offset === this.length
}

DecoderBuffer.prototype.readUInt8 = function readUInt8 (fail) {
  if (this.offset + 1 <= this.length) { return this.base.readUInt8(this.offset++, true) } else { return this.error(fail || 'DecoderBuffer overrun') }
}

DecoderBuffer.prototype.skip = function skip (bytes, fail) {
  if (!(this.offset + bytes <= this.length)) { return this.error(fail || 'DecoderBuffer overrun') }

  const res = new DecoderBuffer(this.base)

  // Share reporter state
  res._reporterState = this._reporterState

  res.offset = this.offset
  res.length = this.offset + bytes
  this.offset += bytes
  return res
}

DecoderBuffer.prototype.raw = function raw (save) {
  return this.base.slice(save ? save.offset : this.offset, this.length)
}

function EncoderBuffer (value, reporter) {
  if (Array.isArray(value)) {
    this.length = 0
    this.value = value.map(function (item) {
      if (!EncoderBuffer.isEncoderBuffer(item)) { item = new EncoderBuffer(item, reporter) }
      this.length += item.length
      return item
    }, this)
  } else if (typeof value === 'number') {
    if (!(value >= 0 && value <= 0xff)) { return reporter.error('non-byte EncoderBuffer value') }
    this.value = value
    this.length = 1
  } else if (typeof value === 'string') {
    this.value = value
    this.length = Buffer.byteLength(value)
  } else if (Buffer.isBuffer(value)) {
    this.value = value
    this.length = value.length
  } else {
    return reporter.error(`Unsupported type: ${typeof value}`)
  }
}

EncoderBuffer.isEncoderBuffer = function isEncoderBuffer (data) {
  if (data instanceof EncoderBuffer) {
    return true
  }

  // Or accept compatible API
  const isCompatible = typeof data === 'object' &&
    data.constructor.name === 'EncoderBuffer' &&
    typeof data.length === 'number' &&
    typeof data.join === 'function'

  return isCompatible
}

EncoderBuffer.prototype.join = function join (out, offset) {
  if (!out) { out = Buffer.alloc(this.length) }
  if (!offset) { offset = 0 }

  if (this.length === 0) { return out }

  if (Array.isArray(this.value)) {
    this.value.forEach(function (item) {
      item.join(out, offset)
      offset += item.length
    })
  } else {
    if (typeof this.value === 'number') { out[offset] = this.value } else if (typeof this.value === 'string') { out.write(this.value, offset) } else if (Buffer.isBuffer(this.value)) { this.value.copy(out, offset) }
    offset += this.length
  }

  return out
}

module.exports = {
  DecoderBuffer,
  EncoderBuffer
}


/***/ }),
/* 111 */,
/* 112 */,
/* 113 */,
/* 114 */,
/* 115 */,
/* 116 */,
/* 117 */,
/* 118 */,
/* 119 */,
/* 120 */,
/* 121 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var mapCacheClear = __webpack_require__(812),
    mapCacheDelete = __webpack_require__(78),
    mapCacheGet = __webpack_require__(604),
    mapCacheHas = __webpack_require__(809),
    mapCacheSet = __webpack_require__(73);

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

module.exports = MapCache;


/***/ }),
/* 122 */,
/* 123 */,
/* 124 */,
/* 125 */,
/* 126 */,
/* 127 */,
/* 128 */
/***/ (function(module) {

"use strict";

module.exports = (url, opts) => {
	if (typeof url !== 'string') {
		throw new TypeError(`Expected \`url\` to be of type \`string\`, got \`${typeof url}\``);
	}

	url = url.trim();
	opts = Object.assign({https: false}, opts);

	if (/^\.*\/|^(?!localhost)\w+:/.test(url)) {
		return url;
	}

	return url.replace(/^(?!(?:\w+:)?\/\/)/, opts.https ? 'https://' : 'http://');
};


/***/ }),
/* 129 */,
/* 130 */
/***/ (function(module) {

/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

module.exports = stubArray;


/***/ }),
/* 131 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const Sign = __webpack_require__(170)
const { verify } = __webpack_require__(633)

const single = (serialization, payload, key, protectedHeader, unprotectedHeader) => {
  return new Sign(payload)
    .recipient(key, protectedHeader, unprotectedHeader)
    .sign(serialization)
}

module.exports.Sign = Sign
module.exports.sign = single.bind(undefined, 'compact')
module.exports.sign.flattened = single.bind(undefined, 'flattened')
module.exports.sign.general = single.bind(undefined, 'general')

module.exports.verify = verify


/***/ }),
/* 132 */,
/* 133 */,
/* 134 */,
/* 135 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { inherits } = __webpack_require__(669)
const encoders = __webpack_require__(645)
const decoders = __webpack_require__(474)

module.exports.define = function define (name, body) {
  return new Entity(name, body)
}

function Entity (name, body) {
  this.name = name
  this.body = body

  this.decoders = {}
  this.encoders = {}
}

Entity.prototype._createNamed = function createNamed (Base) {
  const name = this.name

  function Generated (entity) {
    this._initNamed(entity, name)
  }
  inherits(Generated, Base)
  Generated.prototype._initNamed = function _initNamed (entity, name) {
    Base.call(this, entity, name)
  }

  return new Generated(this)
}

Entity.prototype._getDecoder = function _getDecoder (enc) {
  enc = enc || 'der'
  // Lazily create decoder
  if (!Object.prototype.hasOwnProperty.call(this.decoders, enc)) { this.decoders[enc] = this._createNamed(decoders[enc]) }
  return this.decoders[enc]
}

Entity.prototype.decode = function decode (data, enc, options) {
  return this._getDecoder(enc).decode(data, options)
}

Entity.prototype._getEncoder = function _getEncoder (enc) {
  enc = enc || 'der'
  // Lazily create encoder
  if (!Object.prototype.hasOwnProperty.call(this.encoders, enc)) { this.encoders[enc] = this._createNamed(encoders[enc]) }
  return this.encoders[enc]
}

Entity.prototype.encode = function encode (data, enc, /* internal */ reporter) {
  return this._getEncoder(enc).encode(data, reporter)
}


/***/ }),
/* 136 */,
/* 137 */,
/* 138 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var memoize = __webpack_require__(507);

/** Used as the maximum memoize cache size. */
var MAX_MEMOIZE_SIZE = 500;

/**
 * A specialized version of `_.memoize` which clears the memoized function's
 * cache when it exceeds `MAX_MEMOIZE_SIZE`.
 *
 * @private
 * @param {Function} func The function to have its output memoized.
 * @returns {Function} Returns the new memoized function.
 */
function memoizeCapped(func) {
  var result = memoize(func, function(key) {
    if (cache.size === MAX_MEMOIZE_SIZE) {
      cache.clear();
    }
    return key;
  });

  var cache = result.cache;
  return result;
}

module.exports = memoizeCapped;


/***/ }),
/* 139 */,
/* 140 */,
/* 141 */,
/* 142 */,
/* 143 */
/***/ (function(module) {

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

module.exports = isArray;


/***/ }),
/* 144 */,
/* 145 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const pump = __webpack_require__(453);
const bufferStream = __webpack_require__(966);

class MaxBufferError extends Error {
	constructor() {
		super('maxBuffer exceeded');
		this.name = 'MaxBufferError';
	}
}

function getStream(inputStream, options) {
	if (!inputStream) {
		return Promise.reject(new Error('Expected a stream'));
	}

	options = Object.assign({maxBuffer: Infinity}, options);

	const {maxBuffer} = options;

	let stream;
	return new Promise((resolve, reject) => {
		const rejectPromise = error => {
			if (error) { // A null check
				error.bufferedData = stream.getBufferedValue();
			}
			reject(error);
		};

		stream = pump(inputStream, bufferStream(options), error => {
			if (error) {
				rejectPromise(error);
				return;
			}

			resolve();
		});

		stream.on('data', () => {
			if (stream.getBufferedLength() > maxBuffer) {
				rejectPromise(new MaxBufferError());
			}
		});
	}).then(() => stream.getBufferedValue());
}

module.exports = getStream;
module.exports.buffer = (stream, options) => getStream(stream, Object.assign({}, options, {encoding: 'buffer'}));
module.exports.array = (stream, options) => getStream(stream, Object.assign({}, options, {array: true}));
module.exports.MaxBufferError = MaxBufferError;


/***/ }),
/* 146 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var isFunction = __webpack_require__(10),
    isLength = __webpack_require__(56);

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

module.exports = isArrayLike;


/***/ }),
/* 147 */,
/* 148 */,
/* 149 */,
/* 150 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const base64url = __webpack_require__(44)
const errors = __webpack_require__(688)

module.exports = (token, { complete = false } = {}) => {
  if (typeof token !== 'string' || !token) {
    throw new TypeError('JWT must be a string')
  }

  const { 0: header, 1: payload, 2: signature, length } = token.split('.')

  if (length === 5) {
    throw new TypeError('JWTs must be decrypted first')
  }

  if (length !== 3) {
    throw new errors.JWTMalformed('JWTs must have three components')
  }

  try {
    const result = {
      header: base64url.JSON.decode(header),
      payload: base64url.JSON.decode(payload),
      signature
    }

    return complete ? result : result.payload
  } catch (err) {
    throw new errors.JWTMalformed('JWT is malformed')
  }
}


/***/ }),
/* 151 */,
/* 152 */,
/* 153 */,
/* 154 */
/***/ (function(module) {

"use strict";

// rfc7231 6.1
const statusCodeCacheableByDefault = new Set([
    200,
    203,
    204,
    206,
    300,
    301,
    404,
    405,
    410,
    414,
    501,
]);

// This implementation does not understand partial responses (206)
const understoodStatuses = new Set([
    200,
    203,
    204,
    300,
    301,
    302,
    303,
    307,
    308,
    404,
    405,
    410,
    414,
    501,
]);

const errorStatusCodes = new Set([
    500,
    502,
    503, 
    504,
]);

const hopByHopHeaders = {
    date: true, // included, because we add Age update Date
    connection: true,
    'keep-alive': true,
    'proxy-authenticate': true,
    'proxy-authorization': true,
    te: true,
    trailer: true,
    'transfer-encoding': true,
    upgrade: true,
};

const excludedFromRevalidationUpdate = {
    // Since the old body is reused, it doesn't make sense to change properties of the body
    'content-length': true,
    'content-encoding': true,
    'transfer-encoding': true,
    'content-range': true,
};

function toNumberOrZero(s) {
    const n = parseInt(s, 10);
    return isFinite(n) ? n : 0;
}

// RFC 5861
function isErrorResponse(response) {
    // consider undefined response as faulty
    if(!response) {
        return true
    }
    return errorStatusCodes.has(response.status);
}

function parseCacheControl(header) {
    const cc = {};
    if (!header) return cc;

    // TODO: When there is more than one value present for a given directive (e.g., two Expires header fields, multiple Cache-Control: max-age directives),
    // the directive's value is considered invalid. Caches are encouraged to consider responses that have invalid freshness information to be stale
    const parts = header.trim().split(/\s*,\s*/); // TODO: lame parsing
    for (const part of parts) {
        const [k, v] = part.split(/\s*=\s*/, 2);
        cc[k] = v === undefined ? true : v.replace(/^"|"$/g, ''); // TODO: lame unquoting
    }

    return cc;
}

function formatCacheControl(cc) {
    let parts = [];
    for (const k in cc) {
        const v = cc[k];
        parts.push(v === true ? k : k + '=' + v);
    }
    if (!parts.length) {
        return undefined;
    }
    return parts.join(', ');
}

module.exports = class CachePolicy {
    constructor(
        req,
        res,
        {
            shared,
            cacheHeuristic,
            immutableMinTimeToLive,
            ignoreCargoCult,
            _fromObject,
        } = {}
    ) {
        if (_fromObject) {
            this._fromObject(_fromObject);
            return;
        }

        if (!res || !res.headers) {
            throw Error('Response headers missing');
        }
        this._assertRequestHasHeaders(req);

        this._responseTime = this.now();
        this._isShared = shared !== false;
        this._cacheHeuristic =
            undefined !== cacheHeuristic ? cacheHeuristic : 0.1; // 10% matches IE
        this._immutableMinTtl =
            undefined !== immutableMinTimeToLive
                ? immutableMinTimeToLive
                : 24 * 3600 * 1000;

        this._status = 'status' in res ? res.status : 200;
        this._resHeaders = res.headers;
        this._rescc = parseCacheControl(res.headers['cache-control']);
        this._method = 'method' in req ? req.method : 'GET';
        this._url = req.url;
        this._host = req.headers.host;
        this._noAuthorization = !req.headers.authorization;
        this._reqHeaders = res.headers.vary ? req.headers : null; // Don't keep all request headers if they won't be used
        this._reqcc = parseCacheControl(req.headers['cache-control']);

        // Assume that if someone uses legacy, non-standard uncecessary options they don't understand caching,
        // so there's no point stricly adhering to the blindly copy&pasted directives.
        if (
            ignoreCargoCult &&
            'pre-check' in this._rescc &&
            'post-check' in this._rescc
        ) {
            delete this._rescc['pre-check'];
            delete this._rescc['post-check'];
            delete this._rescc['no-cache'];
            delete this._rescc['no-store'];
            delete this._rescc['must-revalidate'];
            this._resHeaders = Object.assign({}, this._resHeaders, {
                'cache-control': formatCacheControl(this._rescc),
            });
            delete this._resHeaders.expires;
            delete this._resHeaders.pragma;
        }

        // When the Cache-Control header field is not present in a request, caches MUST consider the no-cache request pragma-directive
        // as having the same effect as if "Cache-Control: no-cache" were present (see Section 5.2.1).
        if (
            res.headers['cache-control'] == null &&
            /no-cache/.test(res.headers.pragma)
        ) {
            this._rescc['no-cache'] = true;
        }
    }

    now() {
        return Date.now();
    }

    storable() {
        // The "no-store" request directive indicates that a cache MUST NOT store any part of either this request or any response to it.
        return !!(
            !this._reqcc['no-store'] &&
            // A cache MUST NOT store a response to any request, unless:
            // The request method is understood by the cache and defined as being cacheable, and
            ('GET' === this._method ||
                'HEAD' === this._method ||
                ('POST' === this._method && this._hasExplicitExpiration())) &&
            // the response status code is understood by the cache, and
            understoodStatuses.has(this._status) &&
            // the "no-store" cache directive does not appear in request or response header fields, and
            !this._rescc['no-store'] &&
            // the "private" response directive does not appear in the response, if the cache is shared, and
            (!this._isShared || !this._rescc.private) &&
            // the Authorization header field does not appear in the request, if the cache is shared,
            (!this._isShared ||
                this._noAuthorization ||
                this._allowsStoringAuthenticated()) &&
            // the response either:
            // contains an Expires header field, or
            (this._resHeaders.expires ||
                // contains a max-age response directive, or
                // contains a s-maxage response directive and the cache is shared, or
                // contains a public response directive.
                this._rescc['max-age'] ||
                (this._isShared && this._rescc['s-maxage']) ||
                this._rescc.public ||
                // has a status code that is defined as cacheable by default
                statusCodeCacheableByDefault.has(this._status))
        );
    }

    _hasExplicitExpiration() {
        // 4.2.1 Calculating Freshness Lifetime
        return (
            (this._isShared && this._rescc['s-maxage']) ||
            this._rescc['max-age'] ||
            this._resHeaders.expires
        );
    }

    _assertRequestHasHeaders(req) {
        if (!req || !req.headers) {
            throw Error('Request headers missing');
        }
    }

    satisfiesWithoutRevalidation(req) {
        this._assertRequestHasHeaders(req);

        // When presented with a request, a cache MUST NOT reuse a stored response, unless:
        // the presented request does not contain the no-cache pragma (Section 5.4), nor the no-cache cache directive,
        // unless the stored response is successfully validated (Section 4.3), and
        const requestCC = parseCacheControl(req.headers['cache-control']);
        if (requestCC['no-cache'] || /no-cache/.test(req.headers.pragma)) {
            return false;
        }

        if (requestCC['max-age'] && this.age() > requestCC['max-age']) {
            return false;
        }

        if (
            requestCC['min-fresh'] &&
            this.timeToLive() < 1000 * requestCC['min-fresh']
        ) {
            return false;
        }

        // the stored response is either:
        // fresh, or allowed to be served stale
        if (this.stale()) {
            const allowsStale =
                requestCC['max-stale'] &&
                !this._rescc['must-revalidate'] &&
                (true === requestCC['max-stale'] ||
                    requestCC['max-stale'] > this.age() - this.maxAge());
            if (!allowsStale) {
                return false;
            }
        }

        return this._requestMatches(req, false);
    }

    _requestMatches(req, allowHeadMethod) {
        // The presented effective request URI and that of the stored response match, and
        return (
            (!this._url || this._url === req.url) &&
            this._host === req.headers.host &&
            // the request method associated with the stored response allows it to be used for the presented request, and
            (!req.method ||
                this._method === req.method ||
                (allowHeadMethod && 'HEAD' === req.method)) &&
            // selecting header fields nominated by the stored response (if any) match those presented, and
            this._varyMatches(req)
        );
    }

    _allowsStoringAuthenticated() {
        //  following Cache-Control response directives (Section 5.2.2) have such an effect: must-revalidate, public, and s-maxage.
        return (
            this._rescc['must-revalidate'] ||
            this._rescc.public ||
            this._rescc['s-maxage']
        );
    }

    _varyMatches(req) {
        if (!this._resHeaders.vary) {
            return true;
        }

        // A Vary header field-value of "*" always fails to match
        if (this._resHeaders.vary === '*') {
            return false;
        }

        const fields = this._resHeaders.vary
            .trim()
            .toLowerCase()
            .split(/\s*,\s*/);
        for (const name of fields) {
            if (req.headers[name] !== this._reqHeaders[name]) return false;
        }
        return true;
    }

    _copyWithoutHopByHopHeaders(inHeaders) {
        const headers = {};
        for (const name in inHeaders) {
            if (hopByHopHeaders[name]) continue;
            headers[name] = inHeaders[name];
        }
        // 9.1.  Connection
        if (inHeaders.connection) {
            const tokens = inHeaders.connection.trim().split(/\s*,\s*/);
            for (const name of tokens) {
                delete headers[name];
            }
        }
        if (headers.warning) {
            const warnings = headers.warning.split(/,/).filter(warning => {
                return !/^\s*1[0-9][0-9]/.test(warning);
            });
            if (!warnings.length) {
                delete headers.warning;
            } else {
                headers.warning = warnings.join(',').trim();
            }
        }
        return headers;
    }

    responseHeaders() {
        const headers = this._copyWithoutHopByHopHeaders(this._resHeaders);
        const age = this.age();

        // A cache SHOULD generate 113 warning if it heuristically chose a freshness
        // lifetime greater than 24 hours and the response's age is greater than 24 hours.
        if (
            age > 3600 * 24 &&
            !this._hasExplicitExpiration() &&
            this.maxAge() > 3600 * 24
        ) {
            headers.warning =
                (headers.warning ? `${headers.warning}, ` : '') +
                '113 - "rfc7234 5.5.4"';
        }
        headers.age = `${Math.round(age)}`;
        headers.date = new Date(this.now()).toUTCString();
        return headers;
    }

    /**
     * Value of the Date response header or current time if Date was invalid
     * @return timestamp
     */
    date() {
        const serverDate = Date.parse(this._resHeaders.date);
        if (isFinite(serverDate)) {
            return serverDate;
        }
        return this._responseTime;
    }

    /**
     * Value of the Age header, in seconds, updated for the current time.
     * May be fractional.
     *
     * @return Number
     */
    age() {
        let age = this._ageValue();

        const residentTime = (this.now() - this._responseTime) / 1000;
        return age + residentTime;
    }

    _ageValue() {
        return toNumberOrZero(this._resHeaders.age);
    }

    /**
     * Value of applicable max-age (or heuristic equivalent) in seconds. This counts since response's `Date`.
     *
     * For an up-to-date value, see `timeToLive()`.
     *
     * @return Number
     */
    maxAge() {
        if (!this.storable() || this._rescc['no-cache']) {
            return 0;
        }

        // Shared responses with cookies are cacheable according to the RFC, but IMHO it'd be unwise to do so by default
        // so this implementation requires explicit opt-in via public header
        if (
            this._isShared &&
            (this._resHeaders['set-cookie'] &&
                !this._rescc.public &&
                !this._rescc.immutable)
        ) {
            return 0;
        }

        if (this._resHeaders.vary === '*') {
            return 0;
        }

        if (this._isShared) {
            if (this._rescc['proxy-revalidate']) {
                return 0;
            }
            // if a response includes the s-maxage directive, a shared cache recipient MUST ignore the Expires field.
            if (this._rescc['s-maxage']) {
                return toNumberOrZero(this._rescc['s-maxage']);
            }
        }

        // If a response includes a Cache-Control field with the max-age directive, a recipient MUST ignore the Expires field.
        if (this._rescc['max-age']) {
            return toNumberOrZero(this._rescc['max-age']);
        }

        const defaultMinTtl = this._rescc.immutable ? this._immutableMinTtl : 0;

        const serverDate = this.date();
        if (this._resHeaders.expires) {
            const expires = Date.parse(this._resHeaders.expires);
            // A cache recipient MUST interpret invalid date formats, especially the value "0", as representing a time in the past (i.e., "already expired").
            if (Number.isNaN(expires) || expires < serverDate) {
                return 0;
            }
            return Math.max(defaultMinTtl, (expires - serverDate) / 1000);
        }

        if (this._resHeaders['last-modified']) {
            const lastModified = Date.parse(this._resHeaders['last-modified']);
            if (isFinite(lastModified) && serverDate > lastModified) {
                return Math.max(
                    defaultMinTtl,
                    ((serverDate - lastModified) / 1000) * this._cacheHeuristic
                );
            }
        }

        return defaultMinTtl;
    }

    timeToLive() {
        const age = this.maxAge() - this.age();
        const staleIfErrorAge = age + toNumberOrZero(this._rescc['stale-if-error']);
        const staleWhileRevalidateAge = age + toNumberOrZero(this._rescc['stale-while-revalidate']);
        return Math.max(0, age, staleIfErrorAge, staleWhileRevalidateAge) * 1000;
    }

    stale() {
        return this.maxAge() <= this.age();
    }

    _useStaleIfError() {
        return this.maxAge() + toNumberOrZero(this._rescc['stale-if-error']) > this.age();
    }

    useStaleWhileRevalidate() {
        return this.maxAge() + toNumberOrZero(this._rescc['stale-while-revalidate']) > this.age();
    }

    static fromObject(obj) {
        return new this(undefined, undefined, { _fromObject: obj });
    }

    _fromObject(obj) {
        if (this._responseTime) throw Error('Reinitialized');
        if (!obj || obj.v !== 1) throw Error('Invalid serialization');

        this._responseTime = obj.t;
        this._isShared = obj.sh;
        this._cacheHeuristic = obj.ch;
        this._immutableMinTtl =
            obj.imm !== undefined ? obj.imm : 24 * 3600 * 1000;
        this._status = obj.st;
        this._resHeaders = obj.resh;
        this._rescc = obj.rescc;
        this._method = obj.m;
        this._url = obj.u;
        this._host = obj.h;
        this._noAuthorization = obj.a;
        this._reqHeaders = obj.reqh;
        this._reqcc = obj.reqcc;
    }

    toObject() {
        return {
            v: 1,
            t: this._responseTime,
            sh: this._isShared,
            ch: this._cacheHeuristic,
            imm: this._immutableMinTtl,
            st: this._status,
            resh: this._resHeaders,
            rescc: this._rescc,
            m: this._method,
            u: this._url,
            h: this._host,
            a: this._noAuthorization,
            reqh: this._reqHeaders,
            reqcc: this._reqcc,
        };
    }

    /**
     * Headers for sending to the origin server to revalidate stale response.
     * Allows server to return 304 to allow reuse of the previous response.
     *
     * Hop by hop headers are always stripped.
     * Revalidation headers may be added or removed, depending on request.
     */
    revalidationHeaders(incomingReq) {
        this._assertRequestHasHeaders(incomingReq);
        const headers = this._copyWithoutHopByHopHeaders(incomingReq.headers);

        // This implementation does not understand range requests
        delete headers['if-range'];

        if (!this._requestMatches(incomingReq, true) || !this.storable()) {
            // revalidation allowed via HEAD
            // not for the same resource, or wasn't allowed to be cached anyway
            delete headers['if-none-match'];
            delete headers['if-modified-since'];
            return headers;
        }

        /* MUST send that entity-tag in any cache validation request (using If-Match or If-None-Match) if an entity-tag has been provided by the origin server. */
        if (this._resHeaders.etag) {
            headers['if-none-match'] = headers['if-none-match']
                ? `${headers['if-none-match']}, ${this._resHeaders.etag}`
                : this._resHeaders.etag;
        }

        // Clients MAY issue simple (non-subrange) GET requests with either weak validators or strong validators. Clients MUST NOT use weak validators in other forms of request.
        const forbidsWeakValidators =
            headers['accept-ranges'] ||
            headers['if-match'] ||
            headers['if-unmodified-since'] ||
            (this._method && this._method != 'GET');

        /* SHOULD send the Last-Modified value in non-subrange cache validation requests (using If-Modified-Since) if only a Last-Modified value has been provided by the origin server.
        Note: This implementation does not understand partial responses (206) */
        if (forbidsWeakValidators) {
            delete headers['if-modified-since'];

            if (headers['if-none-match']) {
                const etags = headers['if-none-match']
                    .split(/,/)
                    .filter(etag => {
                        return !/^\s*W\//.test(etag);
                    });
                if (!etags.length) {
                    delete headers['if-none-match'];
                } else {
                    headers['if-none-match'] = etags.join(',').trim();
                }
            }
        } else if (
            this._resHeaders['last-modified'] &&
            !headers['if-modified-since']
        ) {
            headers['if-modified-since'] = this._resHeaders['last-modified'];
        }

        return headers;
    }

    /**
     * Creates new CachePolicy with information combined from the previews response,
     * and the new revalidation response.
     *
     * Returns {policy, modified} where modified is a boolean indicating
     * whether the response body has been modified, and old cached body can't be used.
     *
     * @return {Object} {policy: CachePolicy, modified: Boolean}
     */
    revalidatedPolicy(request, response) {
        this._assertRequestHasHeaders(request);
        if(this._useStaleIfError() && isErrorResponse(response)) {  // I consider the revalidation request unsuccessful
          return {
            modified: false,
            matches: false,
            policy: this,
          };
        }
        if (!response || !response.headers) {
            throw Error('Response headers missing');
        }

        // These aren't going to be supported exactly, since one CachePolicy object
        // doesn't know about all the other cached objects.
        let matches = false;
        if (response.status !== undefined && response.status != 304) {
            matches = false;
        } else if (
            response.headers.etag &&
            !/^\s*W\//.test(response.headers.etag)
        ) {
            // "All of the stored responses with the same strong validator are selected.
            // If none of the stored responses contain the same strong validator,
            // then the cache MUST NOT use the new response to update any stored responses."
            matches =
                this._resHeaders.etag &&
                this._resHeaders.etag.replace(/^\s*W\//, '') ===
                    response.headers.etag;
        } else if (this._resHeaders.etag && response.headers.etag) {
            // "If the new response contains a weak validator and that validator corresponds
            // to one of the cache's stored responses,
            // then the most recent of those matching stored responses is selected for update."
            matches =
                this._resHeaders.etag.replace(/^\s*W\//, '') ===
                response.headers.etag.replace(/^\s*W\//, '');
        } else if (this._resHeaders['last-modified']) {
            matches =
                this._resHeaders['last-modified'] ===
                response.headers['last-modified'];
        } else {
            // If the new response does not include any form of validator (such as in the case where
            // a client generates an If-Modified-Since request from a source other than the Last-Modified
            // response header field), and there is only one stored response, and that stored response also
            // lacks a validator, then that stored response is selected for update.
            if (
                !this._resHeaders.etag &&
                !this._resHeaders['last-modified'] &&
                !response.headers.etag &&
                !response.headers['last-modified']
            ) {
                matches = true;
            }
        }

        if (!matches) {
            return {
                policy: new this.constructor(request, response),
                // Client receiving 304 without body, even if it's invalid/mismatched has no option
                // but to reuse a cached body. We don't have a good way to tell clients to do
                // error recovery in such case.
                modified: response.status != 304,
                matches: false,
            };
        }

        // use other header fields provided in the 304 (Not Modified) response to replace all instances
        // of the corresponding header fields in the stored response.
        const headers = {};
        for (const k in this._resHeaders) {
            headers[k] =
                k in response.headers && !excludedFromRevalidationUpdate[k]
                    ? response.headers[k]
                    : this._resHeaders[k];
        }

        const newResponse = Object.assign({}, response, {
            status: this._status,
            method: this._method,
            headers,
        });
        return {
            policy: new this.constructor(request, newResponse, {
                shared: this._isShared,
                cacheHeuristic: this._cacheHeuristic,
                immutableMinTimeToLive: this._immutableMinTtl,
            }),
            modified: false,
            matches: true,
        };
    }
};


/***/ }),
/* 155 */,
/* 156 */,
/* 157 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var baseIteratee = __webpack_require__(295),
    negate = __webpack_require__(316),
    pickBy = __webpack_require__(677);

/**
 * The opposite of `_.pickBy`; this method creates an object composed of
 * the own and inherited enumerable string keyed properties of `object` that
 * `predicate` doesn't return truthy for. The predicate is invoked with two
 * arguments: (value, key).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Object
 * @param {Object} object The source object.
 * @param {Function} [predicate=_.identity] The function invoked per property.
 * @returns {Object} Returns the new object.
 * @example
 *
 * var object = { 'a': 1, 'b': '2', 'c': 3 };
 *
 * _.omitBy(object, _.isNumber);
 * // => { 'b': '2' }
 */
function omitBy(object, predicate) {
  return pickBy(object, negate(baseIteratee(predicate)));
}

module.exports = omitBy;


/***/ }),
/* 158 */,
/* 159 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var coreJsData = __webpack_require__(871);

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

module.exports = isMasked;


/***/ }),
/* 160 */
/***/ (function(module) {

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER : length;

  return !!length &&
    (type == 'number' ||
      (type != 'symbol' && reIsUint.test(value))) &&
        (value > -1 && value % 1 == 0 && value < length);
}

module.exports = isIndex;


/***/ }),
/* 161 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var root = __webpack_require__(824);

/** Built-in value references. */
var Uint8Array = root.Uint8Array;

module.exports = Uint8Array;


/***/ }),
/* 162 */,
/* 163 */,
/* 164 */,
/* 165 */
/***/ (function(module) {

module.exports = alg => `sha${alg.substr(2, 3)}`


/***/ }),
/* 166 */
/***/ (function(module, __unusedexports, __webpack_require__) {

/* eslint-disable no-underscore-dangle */

const url = __webpack_require__(835);
const { format } = __webpack_require__(669);

const cloneDeep = __webpack_require__(769);

const { RPError, OPError } = __webpack_require__(889);
const { BaseClient } = __webpack_require__(860);
const { random, codeChallenge } = __webpack_require__(368);
const pick = __webpack_require__(108);
const { resolveResponseType, resolveRedirectUri } = __webpack_require__(285);

function verified(err, user, info = {}) {
  if (err) {
    this.error(err);
  } else if (!user) {
    this.fail(info);
  } else {
    this.success(user, info);
  }
}

/**
 * @name constructor
 * @api public
 */
function OpenIDConnectStrategy({
  client,
  params = {},
  passReqToCallback = false,
  sessionKey,
  usePKCE = false,
} = {}, verify) {
  if (!(client instanceof BaseClient)) {
    throw new TypeError('client must be an instance of openid-client Client');
  }

  if (typeof verify !== 'function') {
    throw new TypeError('verify callback must be a function');
  }

  if (!client.issuer || !client.issuer.issuer) {
    throw new TypeError('client must have an issuer with an identifier');
  }

  this._client = client;
  this._issuer = client.issuer;
  this._verify = verify;
  this._passReqToCallback = passReqToCallback;
  this._usePKCE = usePKCE;
  this._key = sessionKey || `oidc:${url.parse(this._issuer.issuer).hostname}`;
  this._params = cloneDeep(params);

  if (this._usePKCE === true) {
    const supportedMethods = this._issuer.code_challenge_methods_supported;
    if (!Array.isArray(supportedMethods)) {
      throw new TypeError('code_challenge_methods_supported is not properly set on issuer');
    }
    if (supportedMethods.includes('S256')) {
      this._usePKCE = 'S256';
    } else if (supportedMethods.includes('plain')) {
      this._usePKCE = 'plain';
    } else {
      throw new TypeError('neither supported code_challenge_method is supported by the issuer');
    }
  } else if (typeof this._usePKCE === 'string' && !['plain', 'S256'].includes(this._usePKCE)) {
    throw new TypeError(`${this._usePKCE} is not valid/implemented PKCE code_challenge_method`);
  }

  this.name = url.parse(client.issuer.issuer).hostname;

  if (!this._params.response_type) this._params.response_type = resolveResponseType.call(client);
  if (!this._params.redirect_uri) this._params.redirect_uri = resolveRedirectUri.call(client);
  if (!this._params.scope) this._params.scope = 'openid';
}

OpenIDConnectStrategy.prototype.authenticate = function authenticate(req, options) {
  (async () => {
    const client = this._client;
    if (!req.session) {
      throw new TypeError('authentication requires session support');
    }
    const reqParams = client.callbackParams(req);
    const sessionKey = this._key;

    /* start authentication request */
    if (Object.keys(reqParams).length === 0) {
      // provide options object with extra authentication parameters
      const params = {
        state: random(),
        ...this._params,
        ...options,
      };

      if (!params.nonce && params.response_type.includes('id_token')) {
        params.nonce = random();
      }

      req.session[sessionKey] = pick(params, 'nonce', 'state', 'max_age', 'response_type');

      if (this._usePKCE) {
        const verifier = random();
        req.session[sessionKey].code_verifier = verifier;

        switch (this._usePKCE) { // eslint-disable-line default-case
          case 'S256':
            params.code_challenge = codeChallenge(verifier);
            params.code_challenge_method = 'S256';
            break;
          case 'plain':
            params.code_challenge = verifier;
            break;
        }
      }

      this.redirect(client.authorizationUrl(params));
      return;
    }
    /* end authentication request */

    /* start authentication response */

    const session = req.session[sessionKey];
    if (Object.keys(session || {}).length === 0) {
      throw new Error(format('did not find expected authorization request details in session, req.session["%s"] is %j', sessionKey, session));
    }

    const {
      state, nonce, max_age: maxAge, code_verifier: codeVerifier, response_type: responseType,
    } = session;

    try {
      delete req.session[sessionKey];
    } catch (err) {}

    const opts = {
      redirect_uri: this._params.redirect_uri,
      ...options,
    };

    const checks = {
      state,
      nonce,
      max_age: maxAge,
      code_verifier: codeVerifier,
      response_type: responseType,
    };

    const tokenset = await client.callback(opts.redirect_uri, reqParams, checks);

    const passReq = this._passReqToCallback;
    const loadUserinfo = this._verify.length > (passReq ? 3 : 2) && client.issuer.userinfo_endpoint;

    const args = [tokenset, verified.bind(this)];

    if (loadUserinfo) {
      if (!tokenset.access_token) {
        throw new RPError({
          message: 'expected access_token to be returned when asking for userinfo in verify callback',
          tokenset,
        });
      }
      const userinfo = await client.userinfo(tokenset);
      args.splice(1, 0, userinfo);
    }

    if (passReq) {
      args.unshift(req);
    }

    this._verify(...args);
    /* end authentication response */
  })().catch((error) => {
    if (
      (error instanceof OPError && error.error !== 'server_error' && !error.error.startsWith('invalid'))
      || error instanceof RPError
    ) {
      this.fail(error);
    } else {
      this.error(error);
    }
  });
};

module.exports = OpenIDConnectStrategy;


/***/ }),
/* 167 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const verify = __webpack_require__(745)

module.exports = {
  IdToken: { verify: (token, key, options) => verify(token, key, { ...options, profile: 'id_token' }) },
  LogoutToken: { verify: (token, key, options) => verify(token, key, { ...options, profile: 'logout_token' }) },
  AccessToken: { verify: (token, key, options) => verify(token, key, { ...options, profile: 'at+JWT' }) }
}


/***/ }),
/* 168 */,
/* 169 */,
/* 170 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const base64url = __webpack_require__(44)
const isDisjoint = __webpack_require__(490)
const isObject = __webpack_require__(920)
const deepClone = __webpack_require__(562)
const { JWSInvalid } = __webpack_require__(688)
const { sign } = __webpack_require__(855)
const getKey = __webpack_require__(322)

const serializers = __webpack_require__(995)

const PROCESS_RECIPIENT = Symbol('PROCESS_RECIPIENT')

class Sign {
  constructor (payload) {
    if (typeof payload === 'string') {
      payload = base64url.encode(payload)
    } else if (Buffer.isBuffer(payload)) {
      payload = base64url.encodeBuffer(payload)
      this._binary = true
    } else if (isObject(payload)) {
      payload = base64url.JSON.encode(payload)
    } else {
      throw new TypeError('payload argument must be a Buffer, string or an object')
    }

    this._payload = payload
    this._recipients = []
  }

  /*
   * @public
   */
  recipient (key, protectedHeader, unprotectedHeader) {
    key = getKey(key)

    if (protectedHeader !== undefined && !isObject(protectedHeader)) {
      throw new TypeError('protectedHeader argument must be a plain object when provided')
    }

    if (unprotectedHeader !== undefined && !isObject(unprotectedHeader)) {
      throw new TypeError('unprotectedHeader argument must be a plain object when provided')
    }

    if (!isDisjoint(protectedHeader, unprotectedHeader)) {
      throw new JWSInvalid('JWS Protected and JWS Unprotected Header Parameter names must be disjoint')
    }

    this._recipients.push({
      key,
      protectedHeader: protectedHeader ? deepClone(protectedHeader) : undefined,
      unprotectedHeader: unprotectedHeader ? deepClone(unprotectedHeader) : undefined
    })

    return this
  }

  /*
   * @private
   */
  [PROCESS_RECIPIENT] (recipient) {
    const { key, protectedHeader, unprotectedHeader } = recipient

    if (key.use === 'enc') {
      throw new TypeError('a key with "use":"enc" is not usable for signing')
    }

    const joseHeader = {
      protected: protectedHeader || {},
      unprotected: unprotectedHeader || {}
    }

    let alg = joseHeader.protected.alg || joseHeader.unprotected.alg

    if (!alg) {
      alg = key.alg || [...key.algorithms('sign')][0]
      if (recipient.protectedHeader) {
        joseHeader.protected.alg = recipient.protectedHeader.alg = alg
      } else {
        joseHeader.protected = recipient.protectedHeader = { alg }
      }
    }

    if (!alg) {
      throw new JWSInvalid('could not resolve a usable "alg" for a recipient')
    }

    recipient.header = unprotectedHeader
    recipient.protected = Object.keys(joseHeader.protected).length ? base64url.JSON.encode(joseHeader.protected) : ''

    let toBeSigned
    if (joseHeader.protected.crit && joseHeader.protected.crit.includes('b64')) {
      if (this._b64 !== undefined && this._b64 !== joseHeader.protected.b64) {
        throw new JWSInvalid('the "b64" Header Parameter value MUST be the same for all recipients')
      } else {
        this._b64 = joseHeader.protected.b64
      }

      if (!joseHeader.protected.b64) {
        if (this._binary) {
          this._payload = base64url.decodeToBuffer(this._payload)
        } else {
          this._payload = base64url.decode(this._payload)
        }
      }

      toBeSigned = Buffer.concat([
        Buffer.from(recipient.protected || ''),
        Buffer.from('.'),
        Buffer.isBuffer(this._payload) ? this._payload : Buffer.from(this._payload)
      ])
    } else {
      toBeSigned = `${recipient.protected || ''}.${this._payload}`
    }

    recipient.signature = base64url.encodeBuffer(sign(alg, key, toBeSigned))
  }

  /*
   * @public
   */
  sign (serialization) {
    const serializer = serializers[serialization]
    if (!serializer) {
      throw new TypeError('serialization must be one of "compact", "flattened", "general"')
    }

    if (!this._recipients.length) {
      throw new JWSInvalid('missing recipients')
    }

    serializer.validate(this, this._recipients)

    for (const recipient of this._recipients) {
      this[PROCESS_RECIPIENT](recipient)
    }

    return serializer(this._payload, this._recipients)
  }
}

module.exports = Sign


/***/ }),
/* 171 */,
/* 172 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { sign: signOneShot, verify: verifyOneShot, createSign, createVerify, getCurves } = __webpack_require__(417)

const { derToJose, joseToDer } = __webpack_require__(97)
const { KEYOBJECT } = __webpack_require__(771)
const resolveNodeAlg = __webpack_require__(165)
const { asInput } = __webpack_require__(727)
const { dsaEncodingSupported } = __webpack_require__(915)
const { name: secp256k1 } = __webpack_require__(997)

let sign, verify

if (dsaEncodingSupported) {
  sign = (jwaAlg, nodeAlg, { [KEYOBJECT]: keyObject }, payload) => {
    if (typeof payload === 'string') {
      payload = Buffer.from(payload)
    }
    return signOneShot(nodeAlg, payload, { key: asInput(keyObject, false), dsaEncoding: 'ieee-p1363' })
  }
  verify = (jwaAlg, nodeAlg, { [KEYOBJECT]: keyObject }, payload, signature) => {
    try {
      return verifyOneShot(nodeAlg, payload, { key: asInput(keyObject, true), dsaEncoding: 'ieee-p1363' }, signature)
    } catch (err) {
      return false
    }
  }
} else {
  sign = (jwaAlg, nodeAlg, { [KEYOBJECT]: keyObject }, payload) => {
    return derToJose(createSign(nodeAlg).update(payload).sign(asInput(keyObject, false)), jwaAlg)
  }
  verify = (jwaAlg, nodeAlg, { [KEYOBJECT]: keyObject }, payload, signature) => {
    try {
      return createVerify(nodeAlg).update(payload).verify(asInput(keyObject, true), joseToDer(signature, jwaAlg))
    } catch (err) {
      return false
    }
  }
}

const crvToAlg = (crv) => {
  switch (crv) {
    case 'P-256':
      return 'ES256'
    case secp256k1:
      return 'ES256K'
    case 'P-384':
      return 'ES384'
    case 'P-521':
      return 'ES512'
  }
}

module.exports = (JWA, JWK) => {
  const algs = []

  if (getCurves().includes('prime256v1')) {
    algs.push('ES256')
  }

  if (getCurves().includes('secp256k1')) {
    algs.push('ES256K')
  }

  if (getCurves().includes('secp384r1')) {
    algs.push('ES384')
  }

  if (getCurves().includes('secp521r1')) {
    algs.push('ES512')
  }

  algs.forEach((jwaAlg) => {
    const nodeAlg = resolveNodeAlg(jwaAlg)
    JWA.sign.set(jwaAlg, sign.bind(undefined, jwaAlg, nodeAlg))
    JWA.verify.set(jwaAlg, verify.bind(undefined, jwaAlg, nodeAlg))
    JWK.EC.sign[jwaAlg] = key => key.private && JWK.EC.verify[jwaAlg](key)
    JWK.EC.verify[jwaAlg] = key => (key.use === 'sig' || key.use === undefined) && crvToAlg(key.crv) === jwaAlg
  })
}


/***/ }),
/* 173 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const url = __webpack_require__(835);
const prependHttp = __webpack_require__(128);

module.exports = (input, options) => {
	if (typeof input !== 'string') {
		throw new TypeError(`Expected \`url\` to be of type \`string\`, got \`${typeof input}\` instead.`);
	}

	const finalUrl = prependHttp(input, Object.assign({https: true}, options));
	return url.parse(finalUrl);
};


/***/ }),
/* 174 */,
/* 175 */,
/* 176 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const decompressResponse = __webpack_require__(861);
const is = __webpack_require__(534);
const mimicResponse = __webpack_require__(89);
const progress = __webpack_require__(365);

module.exports = (response, options, emitter) => {
	const downloadBodySize = Number(response.headers['content-length']) || null;

	const progressStream = progress.download(response, emitter, downloadBodySize);

	mimicResponse(response, progressStream);

	const newResponse = options.decompress === true &&
		is.function(decompressResponse) &&
		options.method !== 'HEAD' ? decompressResponse(progressStream) : progressStream;

	if (!options.decompress && ['gzip', 'deflate'].includes(response.headers['content-encoding'])) {
		options.encoding = null;
	}

	emitter.emit('response', newResponse);

	emitter.emit('downloadProgress', {
		percent: 0,
		transferred: 0,
		total: downloadBodySize
	});

	response.pipe(progressStream);
};


/***/ }),
/* 177 */,
/* 178 */,
/* 179 */,
/* 180 */,
/* 181 */,
/* 182 */,
/* 183 */,
/* 184 */,
/* 185 */,
/* 186 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { generateKeyPairSync, generateKeyPair: async } = __webpack_require__(417)
const { promisify } = __webpack_require__(669)

const {
  THUMBPRINT_MATERIAL, JWK_MEMBERS, PUBLIC_MEMBERS,
  PRIVATE_MEMBERS, KEY_MANAGEMENT_DECRYPT, KEY_MANAGEMENT_ENCRYPT
} = __webpack_require__(771)
const { EC_CURVES } = __webpack_require__(962)
const { keyObjectSupported } = __webpack_require__(915)
const { createPublicKey, createPrivateKey } = __webpack_require__(727)

const errors = __webpack_require__(688)
const { name: secp256k1 } = __webpack_require__(997)

const Key = __webpack_require__(228)

const generateKeyPair = promisify(async)

const EC_PUBLIC = new Set(['crv', 'x', 'y'])
Object.freeze(EC_PUBLIC)
const EC_PRIVATE = new Set([...EC_PUBLIC, 'd'])
Object.freeze(EC_PRIVATE)

// Elliptic Curve Key Type
class ECKey extends Key {
  constructor (...args) {
    super(...args)
    this[JWK_MEMBERS]()
    Object.defineProperty(this, 'kty', {
      value: 'EC',
      enumerable: true
    })
    if (!this.crv) {
      throw new errors.JOSENotSupported('unsupported EC key curve')
    }
  }

  static get [PUBLIC_MEMBERS] () {
    return EC_PUBLIC
  }

  static get [PRIVATE_MEMBERS] () {
    return EC_PRIVATE
  }

  // https://tc39.github.io/ecma262/#sec-ordinaryownpropertykeys no need for any special
  // JSON.stringify handling in V8
  [THUMBPRINT_MATERIAL] () {
    return { crv: this.crv, kty: 'EC', x: this.x, y: this.y }
  }

  [KEY_MANAGEMENT_ENCRYPT] () {
    return this.algorithms('deriveKey')
  }

  [KEY_MANAGEMENT_DECRYPT] () {
    if (this.public) {
      return new Set()
    }
    return this.algorithms('deriveKey')
  }

  static async generate (crv = 'P-256', privat = true) {
    if (!EC_CURVES.has(crv)) {
      throw new errors.JOSENotSupported(`unsupported EC key curve: ${crv}`)
    }

    if (crv === secp256k1 && crv !== 'secp256k1') {
      crv = 'secp256k1'
    }

    let privateKey, publicKey

    if (keyObjectSupported) {
      ({ privateKey, publicKey } = await generateKeyPair('ec', { namedCurve: crv }))
      return privat ? privateKey : publicKey
    }

    ({ privateKey, publicKey } = await generateKeyPair('ec', {
      namedCurve: crv,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    }))

    if (privat) {
      return createPrivateKey(privateKey)
    } else {
      return createPublicKey(publicKey)
    }
  }

  static generateSync (crv = 'P-256', privat = true) {
    if (!EC_CURVES.has(crv)) {
      throw new errors.JOSENotSupported(`unsupported EC key curve: ${crv}`)
    }

    if (crv === secp256k1 && crv !== 'secp256k1') {
      crv = 'secp256k1'
    }

    let privateKey, publicKey

    if (keyObjectSupported) {
      ({ privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: crv }))
      return privat ? privateKey : publicKey
    }

    ({ privateKey, publicKey } = generateKeyPairSync('ec', {
      namedCurve: crv,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    }))

    if (privat) {
      return createPrivateKey(privateKey)
    } else {
      return createPublicKey(publicKey)
    }
  }
}

module.exports = ECKey


/***/ }),
/* 187 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module HTTPClientFactory
 */
var HTTPClient_1 = __webpack_require__(663);
var AuthenticationHandler_1 = __webpack_require__(618);
var HTTPMessageHandler_1 = __webpack_require__(306);
var RedirectHandlerOptions_1 = __webpack_require__(770);
var RetryHandlerOptions_1 = __webpack_require__(848);
var RedirectHandler_1 = __webpack_require__(19);
var RetryHandler_1 = __webpack_require__(880);
var TelemetryHandler_1 = __webpack_require__(886);
/**
 * @private
 * To check whether the environment is node or not
 * @returns A boolean representing the environment is node or not
 */
var isNodeEnvironment = function () {
    return new Function("try {return this === global;}catch(e){return false;}")(); // tslint:disable-line: function-constructor
};
/**
 * @class
 * Class representing HTTPClientFactory
 */
var HTTPClientFactory = /** @class */ (function () {
    function HTTPClientFactory() {
    }
    /**
     * @public
     * @static
     * Creates HTTPClient with default middleware chain
     * @param {AuthenticationProvider} authProvider - The authentication provider instance
     * @returns A HTTPClient instance
     *
     * NOTE: These are the things that we need to remember while doing modifications in the below default pipeline.
     * 		* HTTPMessageHander should be the last one in the middleware pipeline, because this makes the actual network call of the request
     * 		* TelemetryHandler should be the one prior to the last middleware in the chain, because this is the one which actually collects and appends the usage flag and placing this handler 	*		  before making the actual network call ensures that the usage of all features are recorded in the flag.
     * 		* The best place for AuthenticationHandler is in the starting of the pipeline, because every other handler might have to work for multiple times for a request but the auth token for
     * 		  them will remain same. For example, Retry and Redirect handlers might be working multiple times for a request based on the response but their auth token would remain same.
     */
    HTTPClientFactory.createWithAuthenticationProvider = function (authProvider) {
        var authenticationHandler = new AuthenticationHandler_1.AuthenticationHandler(authProvider);
        var retryHandler = new RetryHandler_1.RetryHandler(new RetryHandlerOptions_1.RetryHandlerOptions());
        var telemetryHandler = new TelemetryHandler_1.TelemetryHandler();
        var httpMessageHandler = new HTTPMessageHandler_1.HTTPMessageHandler();
        authenticationHandler.setNext(retryHandler);
        if (isNodeEnvironment()) {
            var redirectHandler = new RedirectHandler_1.RedirectHandler(new RedirectHandlerOptions_1.RedirectHandlerOptions());
            retryHandler.setNext(redirectHandler);
            redirectHandler.setNext(telemetryHandler);
        }
        else {
            retryHandler.setNext(telemetryHandler);
        }
        telemetryHandler.setNext(httpMessageHandler);
        return HTTPClientFactory.createWithMiddleware(authenticationHandler);
    };
    /**
     * @public
     * @static
     * Creates a middleware chain with the given one
     * @param {Middleware} middleware - The first middleware of the middleware chain
     * @returns A HTTPClient instance
     */
    HTTPClientFactory.createWithMiddleware = function (middleware) {
        return new HTTPClient_1.HTTPClient(middleware);
    };
    return HTTPClientFactory;
}());
exports.HTTPClientFactory = HTTPClientFactory;
//# sourceMappingURL=HTTPClientFactory.js.map

/***/ }),
/* 188 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var baseGetTag = __webpack_require__(51),
    isObjectLike = __webpack_require__(337);

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && baseGetTag(value) == symbolTag);
}

module.exports = isSymbol;


/***/ }),
/* 189 */,
/* 190 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var baseIsEqualDeep = __webpack_require__(840),
    isObjectLike = __webpack_require__(337);

/**
 * The base implementation of `_.isEqual` which supports partial comparisons
 * and tracks traversed objects.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Unordered comparison
 *  2 - Partial comparison
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
function baseIsEqual(value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
}

module.exports = baseIsEqual;


/***/ }),
/* 191 */
/***/ (function(module) {

module.exports = require("querystring");

/***/ }),
/* 192 */,
/* 193 */,
/* 194 */,
/* 195 */,
/* 196 */,
/* 197 */,
/* 198 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __webpack_require__(470);
const fs = __webpack_require__(747);
global.fetch = __webpack_require__(454); // Polyfill for graph client
const microsoft_graph_client_1 = __webpack_require__(590);
const auth_1 = __webpack_require__(827);
function main() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const file = core.getInput('file');
            const policy = core.getInput('policy');
            const tenant = core.getInput('tenant');
            const clientId = core.getInput('clientId');
            const clientSecret = core.getInput('clientSecret');
            let client = microsoft_graph_client_1.Client.initWithMiddleware({
                authProvider: new auth_1.ClientCredentialsAuthProvider(tenant, clientId, clientSecret),
                defaultVersion: 'beta'
            });
            let fileStream = fs.createReadStream(file);
            let response = yield client
                .api(`trustFramework/policies/${policy}/$value`)
                .putStream(fileStream);
            core.info('Wrote policy using Microsoft Graph: ' + response);
        }
        catch (error) {
            let errorText = (_a = error.message, (_a !== null && _a !== void 0 ? _a : error));
            core.error('Action failed: ' + errorText);
            core.setFailed();
        }
    });
}
main();


/***/ }),
/* 199 */,
/* 200 */,
/* 201 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { randomBytes } = __webpack_require__(417)

const { createSecretKey } = __webpack_require__(727)
const { KEYLENGTHS } = __webpack_require__(962)
const Key = __webpack_require__(847)

module.exports = (alg) => {
  const keyLength = KEYLENGTHS.get(alg)

  if (!keyLength) {
    return new Key({ type: 'secret' })
  }

  return new Key(createSecretKey(randomBytes(keyLength / 8)), { use: 'enc', alg })
}


/***/ }),
/* 202 */,
/* 203 */,
/* 204 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const Got = __webpack_require__(798);
const defaultsDeep = __webpack_require__(230);

const pkg = __webpack_require__(566);

const isAbsoluteUrl = __webpack_require__(854);
const { HTTP_OPTIONS } = __webpack_require__(766);

let DEFAULT_HTTP_OPTIONS;
let got;

const setDefaults = (options) => {
  DEFAULT_HTTP_OPTIONS = defaultsDeep(options, DEFAULT_HTTP_OPTIONS);
  got = Got.extend(DEFAULT_HTTP_OPTIONS);
};

setDefaults({
  followRedirect: false,
  headers: { 'User-Agent': `${pkg.name}/${pkg.version} (${pkg.homepage})` },
  retry: 0,
  timeout: 2500,
  throwHttpErrors: false,
});

module.exports = function request(options, { mTLS = false } = {}) {
  const { url } = options;
  isAbsoluteUrl(url);
  const optsFn = this[HTTP_OPTIONS];
  let opts;
  if (optsFn) {
    opts = optsFn.call(this, defaultsDeep(options, DEFAULT_HTTP_OPTIONS));
  } else {
    opts = options;
  }

  if (mTLS && (!opts.key || !opts.cert)) {
    throw new TypeError('mutual-TLS certificate and key not set');
  }
  return got(opts);
};

module.exports.setDefaults = setDefaults;


/***/ }),
/* 205 */
/***/ (function(__unusedmodule, exports) {

//TODO: handle reviver/dehydrate function like normal
//and handle indentation, like normal.
//if anyone needs this... please send pull request.

exports.stringify = function stringify (o) {
  if('undefined' == typeof o) return o

  if(o && Buffer.isBuffer(o))
    return JSON.stringify(':base64:' + o.toString('base64'))

  if(o && o.toJSON)
    o =  o.toJSON()

  if(o && 'object' === typeof o) {
    var s = ''
    var array = Array.isArray(o)
    s = array ? '[' : '{'
    var first = true

    for(var k in o) {
      var ignore = 'function' == typeof o[k] || (!array && 'undefined' === typeof o[k])
      if(Object.hasOwnProperty.call(o, k) && !ignore) {
        if(!first)
          s += ','
        first = false
        if (array) {
          if(o[k] == undefined)
            s += 'null'
          else
            s += stringify(o[k])
        } else if (o[k] !== void(0)) {
          s += stringify(k) + ':' + stringify(o[k])
        }
      }
    }

    s += array ? ']' : '}'

    return s
  } else if ('string' === typeof o) {
    return JSON.stringify(/^:/.test(o) ? ':' + o : o)
  } else if ('undefined' === typeof o) {
    return 'null';
  } else
    return JSON.stringify(o)
}

exports.parse = function (s) {
  return JSON.parse(s, function (key, value) {
    if('string' === typeof value) {
      if(/^:base64:/.test(value))
        return new Buffer(value.substring(8), 'base64')
      else
        return /^:/.test(value) ? value.substring(1) : value 
    }
    return value
  })
}


/***/ }),
/* 206 */,
/* 207 */,
/* 208 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var baseGetTag = __webpack_require__(51),
    isObjectLike = __webpack_require__(337);

/** `Object#toString` result references. */
var argsTag = '[object Arguments]';

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag;
}

module.exports = baseIsArguments;


/***/ }),
/* 209 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { publicEncrypt, privateDecrypt, constants } = __webpack_require__(417)

const { oaepHashSupported } = __webpack_require__(915)
const { KEYOBJECT } = __webpack_require__(771)
const { asInput } = __webpack_require__(727)

const resolvePadding = (alg) => {
  switch (alg) {
    case 'RSA-OAEP':
    case 'RSA-OAEP-256':
    case 'RSA-OAEP-384':
    case 'RSA-OAEP-512':
      return constants.RSA_PKCS1_OAEP_PADDING
    case 'RSA1_5':
      return constants.RSA_PKCS1_PADDING
  }
}

const resolveOaepHash = (alg) => {
  switch (alg) {
    case 'RSA-OAEP':
      return 'sha1'
    case 'RSA-OAEP-256':
      return 'sha256'
    case 'RSA-OAEP-384':
      return 'sha384'
    case 'RSA-OAEP-512':
      return 'sha512'
    default:
      return undefined
  }
}

const wrapKey = (padding, oaepHash, { [KEYOBJECT]: keyObject }, payload) => {
  const key = asInput(keyObject, true)
  return { wrapped: publicEncrypt({ key, oaepHash, padding }, payload) }
}

const unwrapKey = (padding, oaepHash, { [KEYOBJECT]: keyObject }, payload) => {
  const key = asInput(keyObject, false)
  return privateDecrypt({ key, oaepHash, padding }, payload)
}

const LENGTHS = {
  RSA1_5: 0,
  'RSA-OAEP': 592,
  'RSA-OAEP-256': 784,
  'RSA-OAEP-384': 1040,
  'RSA-OAEP-512': 1296
}

module.exports = (JWA, JWK) => {
  const algs = ['RSA-OAEP', 'RSA1_5']

  if (oaepHashSupported) {
    algs.splice(1, 0, 'RSA-OAEP-256', 'RSA-OAEP-384', 'RSA-OAEP-512')
  }

  algs.forEach((jwaAlg) => {
    const padding = resolvePadding(jwaAlg)
    const oaepHash = resolveOaepHash(jwaAlg)
    JWA.keyManagementEncrypt.set(jwaAlg, wrapKey.bind(undefined, padding, oaepHash))
    JWA.keyManagementDecrypt.set(jwaAlg, unwrapKey.bind(undefined, padding, oaepHash))
    JWK.RSA.wrapKey[jwaAlg] = key => (key.use === 'enc' || key.use === undefined) && key.length >= LENGTHS[jwaAlg]
    JWK.RSA.unwrapKey[jwaAlg] = key => key.private && (key.use === 'enc' || key.use === undefined) && key.length >= LENGTHS[jwaAlg]
  })
}


/***/ }),
/* 210 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var getNative = __webpack_require__(319),
    root = __webpack_require__(824);

/* Built-in method references that are verified to be native. */
var DataView = getNative(root, 'DataView');

module.exports = DataView;


/***/ }),
/* 211 */
/***/ (function(module) {

module.exports = require("https");

/***/ }),
/* 212 */,
/* 213 */,
/* 214 */,
/* 215 */,
/* 216 */,
/* 217 */,
/* 218 */,
/* 219 */,
/* 220 */,
/* 221 */,
/* 222 */,
/* 223 */,
/* 224 */,
/* 225 */,
/* 226 */,
/* 227 */,
/* 228 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { strict: assert } = __webpack_require__(357)
const { inspect } = __webpack_require__(669)
const { EOL } = __webpack_require__(87)

const { keyObjectSupported } = __webpack_require__(915)
const { createPublicKey } = __webpack_require__(727)
const { keyObjectToJWK } = __webpack_require__(522)
const {
  THUMBPRINT_MATERIAL, PUBLIC_MEMBERS, PRIVATE_MEMBERS, JWK_MEMBERS, KEYOBJECT,
  USES_MAPPING, OPS, USES
} = __webpack_require__(771)
const isObject = __webpack_require__(920)
const thumbprint = __webpack_require__(514)
const errors = __webpack_require__(688)

const privateApi = Symbol('privateApi')
const { JWK } = __webpack_require__(962)

class Key {
  constructor (keyObject, { alg, use, kid, key_ops: ops, x5c, x5t, 'x5t#S256': x5t256 } = {}) {
    if (use !== undefined) {
      if (typeof use !== 'string' || !USES.has(use)) {
        throw new TypeError('`use` must be either "sig" or "enc" string when provided')
      }
    }

    if (alg !== undefined) {
      if (typeof alg !== 'string' || !alg) {
        throw new TypeError('`alg` must be a non-empty string when provided')
      }
    }

    if (kid !== undefined) {
      if (typeof kid !== 'string' || !kid) {
        throw new TypeError('`kid` must be a non-empty string when provided')
      }
    }

    if (ops !== undefined) {
      if (!Array.isArray(ops) || !ops.length || ops.some(o => typeof o !== 'string')) {
        throw new TypeError('`key_ops` must be a non-empty array of strings when provided')
      }
      ops = Array.from(new Set(ops)).filter(x => OPS.has(x))
    }

    if (ops && use) {
      if (
        (use === 'enc' && ops.some(x => USES_MAPPING.sig.has(x))) ||
        (use === 'sig' && ops.some(x => USES_MAPPING.enc.has(x)))
      ) {
        throw new errors.JWKInvalid('inconsistent JWK "use" and "key_ops"')
      }
    }

    if (keyObjectSupported && x5c !== undefined) {
      if (!Array.isArray(x5c) || !x5c.length || x5c.some(c => typeof c !== 'string')) {
        throw new TypeError('`x5c` must be an array of one or more PKIX certificates when provided')
      }

      x5c.forEach((cert, i) => {
        let publicKey
        try {
          publicKey = createPublicKey({
            key: `-----BEGIN CERTIFICATE-----${EOL}${cert.match(/.{1,64}/g).join(EOL)}${EOL}-----END CERTIFICATE-----`, format: 'pem'
          })
        } catch (err) {
          throw new errors.JWKInvalid(`\`x5c\` member at index ${i} is not a valid base64-encoded DER PKIX certificate`)
        }
        if (i === 0) {
          try {
            assert.deepEqual(
              publicKey.export({ type: 'spki', format: 'der' }),
              (keyObject.type === 'public' ? keyObject : createPublicKey(keyObject)).export({ type: 'spki', format: 'der' })
            )
          } catch (err) {
            throw new errors.JWKInvalid('The key in the first `x5c` certificate MUST match the public key represented by the JWK')
          }
        }
      })
    }

    Object.defineProperties(this, {
      [KEYOBJECT]: { value: isObject(keyObject) ? undefined : keyObject },
      keyObject: {
        get () {
          if (!keyObjectSupported) {
            throw new errors.JOSENotSupported('KeyObject class is not supported in your Node.js runtime version')
          }

          return this[KEYOBJECT]
        }
      },
      type: { value: keyObject.type },
      private: { value: keyObject.type === 'private' },
      public: { value: keyObject.type === 'public' },
      secret: { value: keyObject.type === 'secret' },
      alg: { value: alg, enumerable: alg !== undefined },
      use: { value: use, enumerable: use !== undefined },
      x5c: {
        enumerable: x5c !== undefined,
        ...(x5c ? { get () { return [...x5c] } } : { value: undefined })
      },
      key_ops: {
        enumerable: ops !== undefined,
        ...(ops ? { get () { return [...ops] } } : { value: undefined })
      },
      kid: {
        enumerable: true,
        ...(kid ? { value: kid } : {
          get () {
            Object.defineProperty(this, 'kid', { value: this.thumbprint, configurable: false })
            return this.kid
          },
          configurable: true
        })
      },
      ...(x5c ? {
        x5t: {
          enumerable: true,
          ...(x5t ? { value: x5t } : {
            get () {
              Object.defineProperty(this, 'x5t', { value: thumbprint.x5t(this.x5c[0]), configurable: false })
              return this.x5t
            },
            configurable: true
          })
        }
      } : undefined),
      ...(x5c ? {
        'x5t#S256': {
          enumerable: true,
          ...(x5t256 ? { value: x5t256 } : {
            get () {
              Object.defineProperty(this, 'x5t#S256', { value: thumbprint['x5t#S256'](this.x5c[0]), configurable: false })
              return this['x5t#S256']
            },
            configurable: true
          })
        }
      } : undefined),
      thumbprint: {
        get () {
          Object.defineProperty(this, 'thumbprint', { value: thumbprint.kid(this[THUMBPRINT_MATERIAL]()), configurable: false })
          return this.thumbprint
        },
        configurable: true
      }
    })
  }

  toPEM (priv = false, encoding = {}) {
    if (this.secret) {
      throw new TypeError('symmetric keys cannot be exported as PEM')
    }

    if (priv && this.public === true) {
      throw new TypeError('public key cannot be exported as private')
    }

    const { type = priv ? 'pkcs8' : 'spki', cipher, passphrase } = encoding

    let keyObject = this[KEYOBJECT]

    if (!priv) {
      if (this.private) {
        keyObject = createPublicKey(keyObject)
      }
      if (cipher || passphrase) {
        throw new TypeError('cipher and passphrase can only be applied when exporting private keys')
      }
    }

    if (priv) {
      return keyObject.export({ format: 'pem', type, cipher, passphrase })
    }

    return keyObject.export({ format: 'pem', type })
  }

  toJWK (priv = false) {
    if (priv && this.public === true) {
      throw new TypeError('public key cannot be exported as private')
    }

    const components = [...this.constructor[priv ? PRIVATE_MEMBERS : PUBLIC_MEMBERS]]
      .map(k => [k, this[k]])

    const result = {}

    Object.keys(components).forEach((key) => {
      const [k, v] = components[key]

      result[k] = v
    })

    result.kty = this.kty
    result.kid = this.kid

    if (this.alg) {
      result.alg = this.alg
    }

    if (this.key_ops && this.key_ops.length) {
      result.key_ops = this.key_ops
    }

    if (this.use) {
      result.use = this.use
    }

    if (this.x5c) {
      result.x5c = this.x5c
    }

    if (this.x5t) {
      result.x5t = this.x5t
    }

    if (this['x5t#S256']) {
      result['x5t#S256'] = this['x5t#S256']
    }

    return result
  }

  [JWK_MEMBERS] () {
    const props = this[KEYOBJECT].type === 'private' ? this.constructor[PRIVATE_MEMBERS] : this.constructor[PUBLIC_MEMBERS]
    Object.defineProperties(this, [...props].reduce((acc, component) => {
      acc[component] = {
        get () {
          const jwk = keyObjectToJWK(this[KEYOBJECT])
          Object.defineProperties(
            this,
            Object.entries(jwk)
              .filter(([key]) => props.has(key))
              .reduce((acc, [key, value]) => {
                acc[key] = { value, enumerable: this.constructor[PUBLIC_MEMBERS].has(key), configurable: false }
                return acc
              }, {})
          )

          return this[component]
        },
        enumerable: this.constructor[PUBLIC_MEMBERS].has(component),
        configurable: true
      }
      return acc
    }, {}))
  }

  /* c8 ignore next 8 */
  [inspect.custom] () {
    return `${this.constructor.name} ${inspect(this.toJWK(false), {
      depth: Infinity,
      colors: process.stdout.isTTY,
      compact: false,
      sorted: true
    })}`
  }

  /* c8 ignore next 3 */
  [THUMBPRINT_MATERIAL] () {
    throw new Error(`"[THUMBPRINT_MATERIAL]()" is not implemented on ${this.constructor.name}`)
  }

  algorithms (operation, /* the rest is private API */ int, opts) {
    const { use = this.use, alg = this.alg, key_ops: ops = this.key_ops } = int === privateApi ? opts : {}
    if (alg) {
      return new Set(this.algorithms(operation, privateApi, { alg: null, use, key_ops: ops }).has(alg) ? [alg] : undefined)
    }

    if (typeof operation === 'symbol') {
      try {
        return this[operation]()
      } catch (err) {
        return new Set()
      }
    }

    if (operation && ops && !ops.includes(operation)) {
      return new Set()
    }

    switch (operation) {
      case 'decrypt':
      case 'deriveKey':
      case 'encrypt':
      case 'sign':
      case 'unwrapKey':
      case 'verify':
      case 'wrapKey':
        return new Set(Object.entries(JWK[this.kty][operation]).map(([alg, fn]) => fn(this) ? alg : undefined).filter(Boolean))
      case undefined:
        return new Set([
          ...this.algorithms('sign'),
          ...this.algorithms('verify'),
          ...this.algorithms('decrypt'),
          ...this.algorithms('encrypt'),
          ...this.algorithms('unwrapKey'),
          ...this.algorithms('wrapKey'),
          ...this.algorithms('deriveKey')
        ])
      default:
        throw new TypeError('invalid key operation')
    }
  }

  /* c8 ignore next 3 */
  static async generate () {
    throw new Error(`"static async generate()" is not implemented on ${this.name}`)
  }

  /* c8 ignore next 3 */
  static generateSync () {
    throw new Error(`"static generateSync()" is not implemented on ${this.name}`)
  }

  /* c8 ignore next 3 */
  static get [PUBLIC_MEMBERS] () {
    throw new Error(`"static get [PUBLIC_MEMBERS]()" is not implemented on ${this.name}`)
  }

  /* c8 ignore next 3 */
  static get [PRIVATE_MEMBERS] () {
    throw new Error(`"static get [PRIVATE_MEMBERS]()" is not implemented on ${this.name}`)
  }
}

module.exports = Key


/***/ }),
/* 229 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var getTag = __webpack_require__(700),
    isObjectLike = __webpack_require__(337);

/** `Object#toString` result references. */
var mapTag = '[object Map]';

/**
 * The base implementation of `_.isMap` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a map, else `false`.
 */
function baseIsMap(value) {
  return isObjectLike(value) && getTag(value) == mapTag;
}

module.exports = baseIsMap;


/***/ }),
/* 230 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var apply = __webpack_require__(512),
    baseRest = __webpack_require__(407),
    customDefaultsMerge = __webpack_require__(540),
    mergeWith = __webpack_require__(730);

/**
 * This method is like `_.defaults` except that it recursively assigns
 * default properties.
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @memberOf _
 * @since 3.10.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @see _.defaults
 * @example
 *
 * _.defaultsDeep({ 'a': { 'b': 2 } }, { 'a': { 'b': 1, 'c': 3 } });
 * // => { 'a': { 'b': 2, 'c': 3 } }
 */
var defaultsDeep = baseRest(function(args) {
  args.push(undefined, customDefaultsMerge);
  return apply(mergeWith, undefined, args);
});

module.exports = defaultsDeep;


/***/ }),
/* 231 */
/***/ (function(module) {

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

module.exports = baseUnary;


/***/ }),
/* 232 */,
/* 233 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var cloneArrayBuffer = __webpack_require__(600);

/**
 * Creates a clone of `dataView`.
 *
 * @private
 * @param {Object} dataView The data view to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned data view.
 */
function cloneDataView(dataView, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
}

module.exports = cloneDataView;


/***/ }),
/* 234 */,
/* 235 */,
/* 236 */,
/* 237 */,
/* 238 */,
/* 239 */
/***/ (function(module) {

/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function copyArray(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

module.exports = copyArray;


/***/ }),
/* 240 */,
/* 241 */,
/* 242 */,
/* 243 */,
/* 244 */,
/* 245 */,
/* 246 */,
/* 247 */,
/* 248 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var isFunction = __webpack_require__(10),
    isMasked = __webpack_require__(159),
    isObject = __webpack_require__(988),
    toSource = __webpack_require__(473);

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

module.exports = baseIsNative;


/***/ }),
/* 249 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var assignValue = __webpack_require__(363),
    copyObject = __webpack_require__(875),
    createAssigner = __webpack_require__(797),
    isArrayLike = __webpack_require__(146),
    isPrototype = __webpack_require__(653),
    keys = __webpack_require__(863);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Assigns own enumerable string keyed properties of source objects to the
 * destination object. Source objects are applied from left to right.
 * Subsequent sources overwrite property assignments of previous sources.
 *
 * **Note:** This method mutates `object` and is loosely based on
 * [`Object.assign`](https://mdn.io/Object/assign).
 *
 * @static
 * @memberOf _
 * @since 0.10.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @see _.assignIn
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * function Bar() {
 *   this.c = 3;
 * }
 *
 * Foo.prototype.b = 2;
 * Bar.prototype.d = 4;
 *
 * _.assign({ 'a': 0 }, new Foo, new Bar);
 * // => { 'a': 1, 'c': 3 }
 */
var assign = createAssigner(function(object, source) {
  if (isPrototype(source) || isArrayLike(source)) {
    copyObject(source, keys(source), object);
    return;
  }
  for (var key in source) {
    if (hasOwnProperty.call(source, key)) {
      assignValue(object, key, source[key]);
    }
  }
});

module.exports = assign;


/***/ }),
/* 250 */,
/* 251 */,
/* 252 */
/***/ (function(module) {

module.exports = function () {
  this.seq().obj(
    this.key('n').int(),
    this.key('e').int()
  )
}


/***/ }),
/* 253 */,
/* 254 */,
/* 255 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var Stack = __webpack_require__(598),
    baseIsEqual = __webpack_require__(190);

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;

/**
 * The base implementation of `_.isMatch` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to inspect.
 * @param {Object} source The object of property values to match.
 * @param {Array} matchData The property names, values, and compare flags to match.
 * @param {Function} [customizer] The function to customize comparisons.
 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
 */
function baseIsMatch(object, source, matchData, customizer) {
  var index = matchData.length,
      length = index,
      noCustomizer = !customizer;

  if (object == null) {
    return !length;
  }
  object = Object(object);
  while (index--) {
    var data = matchData[index];
    if ((noCustomizer && data[2])
          ? data[1] !== object[data[0]]
          : !(data[0] in object)
        ) {
      return false;
    }
  }
  while (++index < length) {
    data = matchData[index];
    var key = data[0],
        objValue = object[key],
        srcValue = data[1];

    if (noCustomizer && data[2]) {
      if (objValue === undefined && !(key in object)) {
        return false;
      }
    } else {
      var stack = new Stack;
      if (customizer) {
        var result = customizer(objValue, srcValue, key, object, source, stack);
      }
      if (!(result === undefined
            ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG, customizer, stack)
            : result
          )) {
        return false;
      }
    }
  }
  return true;
}

module.exports = baseIsMatch;


/***/ }),
/* 256 */,
/* 257 */
/***/ (function(module) {

"use strict";


module.exports = (string, count = 1, options) => {
	options = {
		indent: ' ',
		includeEmptyLines: false,
		...options
	};

	if (typeof string !== 'string') {
		throw new TypeError(
			`Expected \`input\` to be a \`string\`, got \`${typeof string}\``
		);
	}

	if (typeof count !== 'number') {
		throw new TypeError(
			`Expected \`count\` to be a \`number\`, got \`${typeof count}\``
		);
	}

	if (typeof options.indent !== 'string') {
		throw new TypeError(
			`Expected \`options.indent\` to be a \`string\`, got \`${typeof options.indent}\``
		);
	}

	if (count === 0) {
		return string;
	}

	const regex = options.includeEmptyLines ? /^/gm : /^(?!\s*$)/gm;

	return string.replace(regex, options.indent.repeat(count));
};


/***/ }),
/* 258 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var isObject = __webpack_require__(988);

/**
 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` if suitable for strict
 *  equality comparisons, else `false`.
 */
function isStrictComparable(value) {
  return value === value && !isObject(value);
}

module.exports = isStrictComparable;


/***/ }),
/* 259 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { deflateRawSync } = __webpack_require__(761)

const { KEYOBJECT } = __webpack_require__(771)
const generateIV = __webpack_require__(456)
const base64url = __webpack_require__(44)
const getKey = __webpack_require__(322)
const isObject = __webpack_require__(920)
const { createSecretKey } = __webpack_require__(727)
const deepClone = __webpack_require__(562)
const importKey = __webpack_require__(284)
const { JWEInvalid } = __webpack_require__(688)
const { check, keyManagementEncrypt, encrypt } = __webpack_require__(855)

const serializers = __webpack_require__(975)
const generateCEK = __webpack_require__(201)
const validateHeaders = __webpack_require__(635)

const PROCESS_RECIPIENT = Symbol('PROCESS_RECIPIENT')

class Encrypt {
  // TODO: in v2.x swap unprotectedHeader and aad
  constructor (cleartext, protectedHeader, unprotectedHeader, aad) {
    if (!Buffer.isBuffer(cleartext) && typeof cleartext !== 'string') {
      throw new TypeError('cleartext argument must be a Buffer or a string')
    }
    cleartext = Buffer.from(cleartext)

    if (aad !== undefined && !Buffer.isBuffer(aad) && typeof aad !== 'string') {
      throw new TypeError('aad argument must be a Buffer or a string when provided')
    }
    aad = aad ? Buffer.from(aad) : undefined

    if (protectedHeader !== undefined && !isObject(protectedHeader)) {
      throw new TypeError('protectedHeader argument must be a plain object when provided')
    }

    if (unprotectedHeader !== undefined && !isObject(unprotectedHeader)) {
      throw new TypeError('unprotectedHeader argument must be a plain object when provided')
    }

    this._recipients = []
    this._cleartext = cleartext
    this._aad = aad
    this._unprotected = unprotectedHeader ? deepClone(unprotectedHeader) : undefined
    this._protected = protectedHeader ? deepClone(protectedHeader) : undefined
  }

  /*
   * @public
   */
  recipient (key, header) {
    key = getKey(key)

    if (header !== undefined && !isObject(header)) {
      throw new TypeError('header argument must be a plain object when provided')
    }

    this._recipients.push({
      key,
      header: header ? deepClone(header) : undefined
    })

    return this
  }

  /*
   * @private
   */
  [PROCESS_RECIPIENT] (recipient) {
    const unprotectedHeader = this._unprotected
    const protectedHeader = this._protected
    const { length: recipientCount } = this._recipients

    const jweHeader = {
      ...protectedHeader,
      ...unprotectedHeader,
      ...recipient.header
    }
    const { key } = recipient

    const enc = jweHeader.enc
    let alg = jweHeader.alg

    if (key.use === 'sig') {
      throw new TypeError('a key with "use":"sig" is not usable for encryption')
    }

    if (alg === 'dir') {
      check(key, 'encrypt', enc)
    } else if (alg) {
      check(key, 'keyManagementEncrypt', alg)
    } else {
      alg = key.alg || [...key.algorithms('wrapKey')][0] || [...key.algorithms('deriveKey')][0]

      if (alg === 'ECDH-ES' && recipientCount !== 1) {
        alg = [...key.algorithms('deriveKey')][1]
      }

      if (!alg) {
        throw new JWEInvalid('could not resolve a usable "alg" for a recipient')
      }

      if (recipientCount === 1) {
        if (protectedHeader) {
          protectedHeader.alg = alg
        } else {
          this._protected = { alg }
        }
      } else {
        if (recipient.header) {
          recipient.header.alg = alg
        } else {
          recipient.header = { alg }
        }
      }
    }

    let wrapped
    let generatedHeader

    if (key.kty === 'oct' && alg === 'dir') {
      this._cek = importKey(key[KEYOBJECT], { use: 'enc', alg: enc })
    } else {
      check(this._cek, 'encrypt', enc)
      ;({ wrapped, header: generatedHeader } = keyManagementEncrypt(alg, key, this._cek[KEYOBJECT].export(), { enc, alg }))
      if (alg === 'ECDH-ES') {
        this._cek = importKey(createSecretKey(wrapped), { use: 'enc', alg: enc })
      }
    }

    if (alg === 'dir' || alg === 'ECDH-ES') {
      recipient.encrypted_key = ''
    } else {
      recipient.encrypted_key = base64url.encodeBuffer(wrapped)
    }

    if (generatedHeader) {
      recipient.generatedHeader = generatedHeader
    }
  }

  /*
   * @public
   */
  encrypt (serialization) {
    const serializer = serializers[serialization]
    if (!serializer) {
      throw new TypeError('serialization must be one of "compact", "flattened", "general"')
    }

    if (!this._recipients.length) {
      throw new JWEInvalid('missing recipients')
    }

    serializer.validate(this._protected, this._unprotected, this._aad, this._recipients)

    let enc = validateHeaders(this._protected, this._unprotected, this._recipients, false, this._protected ? this._protected.crit : undefined)
    if (!enc) {
      enc = 'A128CBC-HS256'
      if (this._protected) {
        this._protected.enc = enc
      } else {
        this._protected = { enc }
      }
    }
    const final = {}
    this._cek = generateCEK(enc)

    for (const recipient of this._recipients) {
      this[PROCESS_RECIPIENT](recipient)
    }

    const iv = generateIV(enc)
    final.iv = base64url.encodeBuffer(iv)

    if (this._recipients.length === 1 && this._recipients[0].generatedHeader) {
      const [{ generatedHeader }] = this._recipients
      delete this._recipients[0].generatedHeader
      this._protected = {
        ...this._protected,
        ...generatedHeader
      }
    }

    if (this._protected) {
      final.protected = base64url.JSON.encode(this._protected)
    }
    final.unprotected = this._unprotected

    let aad
    if (this._aad) {
      final.aad = base64url.encode(this._aad)
      aad = Buffer.concat([Buffer.from(final.protected || ''), Buffer.from('.'), Buffer.from(final.aad)])
    } else {
      aad = Buffer.from(final.protected || '')
    }

    let cleartext = this._cleartext
    if (this._protected && 'zip' in this._protected) {
      cleartext = deflateRawSync(cleartext)
    }

    const { ciphertext, tag } = encrypt(enc, this._cek, cleartext, { iv, aad })
    final.tag = base64url.encodeBuffer(tag)
    final.ciphertext = base64url.encodeBuffer(ciphertext)

    return serializer(final, this._recipients)
  }
}

module.exports = Encrypt


/***/ }),
/* 260 */,
/* 261 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var nativeCreate = __webpack_require__(878);

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

module.exports = hashSet;


/***/ }),
/* 262 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const is = __webpack_require__(534);

module.exports = function deepFreeze(object) {
	for (const [key, value] of Object.entries(object)) {
		if (is.plainObject(value) || is.array(value)) {
			deepFreeze(object[key]);
		}
	}

	return Object.freeze(object);
};


/***/ }),
/* 263 */,
/* 264 */,
/* 265 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { inherits } = __webpack_require__(669)

const DEREncoder = __webpack_require__(832)

function PEMEncoder (entity) {
  DEREncoder.call(this, entity)
  this.enc = 'pem'
}
inherits(PEMEncoder, DEREncoder)

PEMEncoder.prototype.encode = function encode (data, options) {
  const buf = DEREncoder.prototype.encode.call(this, data)

  const p = buf.toString('base64')
  const out = [`-----BEGIN ${options.label}-----`]
  for (let i = 0; i < p.length; i += 64) { out.push(p.slice(i, i + 64)) }
  out.push(`-----END ${options.label}-----`)
  return out.join('\n')
}

module.exports = PEMEncoder


/***/ }),
/* 266 */,
/* 267 */,
/* 268 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var assocIndexOf = __webpack_require__(820);

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

module.exports = listCacheSet;


/***/ }),
/* 269 */
/***/ (function(module) {

/** Used to match `RegExp` flags from their coerced string values. */
var reFlags = /\w*$/;

/**
 * Creates a clone of `regexp`.
 *
 * @private
 * @param {Object} regexp The regexp to clone.
 * @returns {Object} Returns the cloned regexp.
 */
function cloneRegExp(regexp) {
  var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
  result.lastIndex = regexp.lastIndex;
  return result;
}

module.exports = cloneRegExp;


/***/ }),
/* 270 */,
/* 271 */,
/* 272 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { Reporter } = __webpack_require__(43)
const { DecoderBuffer, EncoderBuffer } = __webpack_require__(110)
const Node = __webpack_require__(720)

module.exports = {
  DecoderBuffer,
  EncoderBuffer,
  Node,
  Reporter
}


/***/ }),
/* 273 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const indentString = __webpack_require__(257);
const cleanStack = __webpack_require__(15);

const cleanInternalStack = stack => stack.replace(/\s+at .*aggregate-error\/index.js:\d+:\d+\)?/g, '');

class AggregateError extends Error {
	constructor(errors) {
		if (!Array.isArray(errors)) {
			throw new TypeError(`Expected input to be an Array, got ${typeof errors}`);
		}

		errors = [...errors].map(error => {
			if (error instanceof Error) {
				return error;
			}

			if (error !== null && typeof error === 'object') {
				// Handle plain error objects with message property and/or possibly other metadata
				return Object.assign(new Error(error.message), error);
			}

			return new Error(error);
		});

		let message = errors
			.map(error => {
				// The `stack` property is not standardized, so we can't assume it exists
				return typeof error.stack === 'string' ? cleanInternalStack(cleanStack(error.stack)) : String(error);
			})
			.join('\n');
		message = '\n' + indentString(message, 4);
		super(message);

		this.name = 'AggregateError';

		Object.defineProperty(this, '_errors', {value: errors});
	}

	* [Symbol.iterator]() {
		for (const error of this._errors) {
			yield error;
		}
	}
}

module.exports = AggregateError;


/***/ }),
/* 274 */,
/* 275 */
/***/ (function(module) {

/**
 * Checks if a `cache` value for `key` exists.
 *
 * @private
 * @param {Object} cache The cache to query.
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function cacheHas(cache, key) {
  return cache.has(key);
}

module.exports = cacheHas;


/***/ }),
/* 276 */,
/* 277 */,
/* 278 */,
/* 279 */,
/* 280 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var Symbol = __webpack_require__(498),
    arrayMap = __webpack_require__(649),
    isArray = __webpack_require__(143),
    isSymbol = __webpack_require__(188);

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isArray(value)) {
    // Recursively convert values (susceptible to call stack limits).
    return arrayMap(value, baseToString) + '';
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

module.exports = baseToString;


/***/ }),
/* 281 */,
/* 282 */,
/* 283 */,
/* 284 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { deprecate } = __webpack_require__(669)

const { createPublicKey, createPrivateKey, createSecretKey, KeyObject } = __webpack_require__(727)
const base64url = __webpack_require__(44)
const isObject = __webpack_require__(920)
const { jwkToPem } = __webpack_require__(522)
const errors = __webpack_require__(688)

const RSAKey = __webpack_require__(872)
const ECKey = __webpack_require__(186)
const OKPKey = __webpack_require__(728)
const OctKey = __webpack_require__(847)

const importable = new Set(['string', 'buffer', 'object'])

const mergedParameters = (target = {}, source = {}) => {
  return {
    alg: source.alg,
    key_ops: source.key_ops,
    kid: source.kid,
    use: source.use,
    x5c: source.x5c,
    x5t: source.x5t,
    'x5t#S256': source['x5t#S256'],
    ...target
  }
}

const openSSHpublicKey = /^[a-zA-Z0-9-]+ (?:[a-zA-Z0-9+/])*(?:==|=)?(?: .*)?$/

const asKey = (key, parameters, { calculateMissingRSAPrimes = false } = {}) => {
  let privateKey, publicKey, secret

  if (!importable.has(typeof key)) {
    throw new TypeError('key argument must be a string, buffer or an object')
  }

  if (parameters !== undefined && !isObject(parameters)) {
    throw new TypeError('parameters argument must be a plain object when provided')
  }

  if (key instanceof KeyObject) {
    switch (key.type) {
      case 'private':
        privateKey = key
        break
      case 'public':
        publicKey = key
        break
      case 'secret':
        secret = key
        break
    }
  } else if (typeof key === 'object' && key && 'kty' in key && key.kty === 'oct') { // symmetric key <Object>
    try {
      secret = createSecretKey(base64url.decodeToBuffer(key.k))
    } catch (err) {
      if (!('k' in key)) {
        secret = { type: 'secret' }
      }
    }
    parameters = mergedParameters(parameters, key)
  } else if (typeof key === 'object' && key && 'kty' in key) { // assume JWK formatted asymmetric key <Object>
    ({ calculateMissingRSAPrimes = false } = parameters || { calculateMissingRSAPrimes })
    let pem

    try {
      pem = jwkToPem(key, { calculateMissingRSAPrimes })
    } catch (err) {
      if (err instanceof errors.JOSEError) {
        throw err
      }
    }

    if (pem && key.d) {
      privateKey = createPrivateKey(pem)
    } else if (pem) {
      publicKey = createPublicKey(pem)
    }

    parameters = mergedParameters({}, key)
  } else if (key && (typeof key === 'object' || typeof key === 'string')) { // <Object> | <string> | <Buffer> passed to crypto.createPrivateKey or crypto.createPublicKey or <Buffer> passed to crypto.createSecretKey
    try {
      privateKey = createPrivateKey(key)
    } catch (err) {
      if (err instanceof errors.JOSEError) {
        throw err
      }
    }

    try {
      publicKey = createPublicKey(key)
      if (key.startsWith('-----BEGIN CERTIFICATE-----') && (!parameters || !('x5c' in parameters))) {
        parameters = mergedParameters(parameters, {
          x5c: [key.replace(/(?:-----(?:BEGIN|END) CERTIFICATE-----|\s)/g, '')]
        })
      }
    } catch (err) {
      if (err instanceof errors.JOSEError) {
        throw err
      }
    }

    try {
      // this is to filter out invalid PEM keys and certs, i'll rather have them fail import then
      // have them imported as symmetric "oct" keys
      if (!key.includes('-----BEGIN') && !openSSHpublicKey.test(key.toString('ascii').replace(/[\r\n]/g, ''))) {
        secret = createSecretKey(Buffer.isBuffer(key) ? key : Buffer.from(key))
      }
    } catch (err) {}
  }

  const keyObject = privateKey || publicKey || secret

  if (privateKey || publicKey) {
    switch (keyObject.asymmetricKeyType) {
      case 'rsa':
        return new RSAKey(keyObject, parameters)
      case 'ec':
        return new ECKey(keyObject, parameters)
      case 'ed25519':
      case 'ed448':
      case 'x25519':
      case 'x448':
        return new OKPKey(keyObject, parameters)
      default:
        throw new errors.JOSENotSupported('only RSA, EC and OKP asymmetric keys are supported')
    }
  } else if (secret) {
    return new OctKey(keyObject, parameters)
  }

  throw new errors.JWKImportFailed('key import failed')
}

module.exports = asKey
Object.defineProperty(asKey, 'deprecated', {
  value: deprecate((key, parameters) => { return asKey(key, parameters, { calculateMissingRSAPrimes: true }) }, 'JWK.importKey() is deprecated, use JWK.asKey() instead'),
  enumerable: false
})


/***/ }),
/* 285 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const merge = __webpack_require__(587);
const omitBy = __webpack_require__(157);
const jose = __webpack_require__(387);

const { assertIssuerConfiguration } = __webpack_require__(475);
const { random } = __webpack_require__(368);
const now = __webpack_require__(416);
const request = __webpack_require__(204);
const instance = __webpack_require__(483);

const formUrlEncode = (value) => encodeURIComponent(value).replace(/%20/g, '+');

async function clientAssertion(endpoint, payload) {
  let alg = this[`${endpoint}_endpoint_auth_signing_alg`];
  if (!alg) {
    assertIssuerConfiguration(this.issuer, `${endpoint}_endpoint_auth_signing_alg_values_supported`);
  }

  if (this[`${endpoint}_endpoint_auth_method`] === 'client_secret_jwt') {
    const key = await this.joseSecret();

    if (!alg) {
      const supported = this.issuer[`${endpoint}_endpoint_auth_signing_alg_values_supported`];
      alg = Array.isArray(supported) && supported.find((signAlg) => key.algorithms('sign').has(signAlg));
    }

    return jose.JWS.sign(payload, key, { alg, typ: 'JWT' });
  }

  const keystore = instance(this).get('keystore');

  if (!keystore) {
    throw new TypeError('no client jwks provided for signing a client assertion with');
  }

  if (!alg) {
    const algs = new Set();

    keystore.all().forEach((key) => {
      key.algorithms('sign').forEach(Set.prototype.add.bind(algs));
    });

    const supported = this.issuer[`${endpoint}_endpoint_auth_signing_alg_values_supported`];
    alg = Array.isArray(supported) && supported.find((signAlg) => algs.has(signAlg));
  }

  const key = keystore.get({ alg, use: 'sig' });
  if (!key) {
    throw new TypeError(`no key found in client jwks to sign a client assertion with using alg ${alg}`);
  }
  return jose.JWS.sign(payload, key, { alg, typ: 'JWT', kid: key.kid });
}

async function authFor(endpoint, { clientAssertionPayload } = {}) {
  const authMethod = this[`${endpoint}_endpoint_auth_method`];
  switch (authMethod) {
    case 'self_signed_tls_client_auth':
    case 'tls_client_auth':
    case 'none':
      return { body: { client_id: this.client_id } };
    case 'client_secret_post':
      if (!this.client_secret) {
        throw new TypeError('client_secret_post client authentication method requires a client_secret');
      }
      return { body: { client_id: this.client_id, client_secret: this.client_secret } };
    case 'private_key_jwt':
    case 'client_secret_jwt': {
      const timestamp = now();
      const assertion = await clientAssertion.call(this, endpoint, {
        iat: timestamp,
        exp: timestamp + 60,
        jti: random(),
        iss: this.client_id,
        sub: this.client_id,
        aud: this.issuer[`${endpoint}_endpoint`], // TODO: in v4.x pass the issuer instead (for now clientAssertionPayload can be used for that)
        ...clientAssertionPayload,
      });

      return {
        body: {
          client_id: this.client_id,
          client_assertion: assertion,
          client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        },
      };
    }
    default: { // client_secret_basic
      // This is correct behaviour, see https://tools.ietf.org/html/rfc6749#section-2.3.1 and the
      // related appendix. (also https://github.com/panva/node-openid-client/pull/91)
      // > The client identifier is encoded using the
      // > "application/x-www-form-urlencoded" encoding algorithm per
      // > Appendix B, and the encoded value is used as the username; the client
      // > password is encoded using the same algorithm and used as the
      // > password.
      if (!this.client_secret) {
        throw new TypeError('client_secret_basic client authentication method requires a client_secret');
      }
      const encoded = `${formUrlEncode(this.client_id)}:${formUrlEncode(this.client_secret)}`;
      const value = Buffer.from(encoded).toString('base64');
      return { headers: { Authorization: `Basic ${value}` } };
    }
  }
}

function resolveResponseType() {
  const { length, 0: value } = this.response_types;

  if (length === 1) {
    return value;
  }

  return undefined;
}

function resolveRedirectUri() {
  const { length, 0: value } = this.redirect_uris || [];

  if (length === 1) {
    return value;
  }

  return undefined;
}

async function authenticatedPost(endpoint, opts, {
  clientAssertionPayload, endpointAuthMethod = endpoint,
} = {}) {
  const auth = await authFor.call(this, endpointAuthMethod, { clientAssertionPayload });
  const requestOpts = merge(opts, auth, { form: true });

  const mTLS = this[`${endpointAuthMethod}_endpoint_auth_method`].includes('tls_client_auth')
    || (endpoint === 'token' && this.tls_client_certificate_bound_access_tokens);

  let targetUrl;
  if (mTLS && this.issuer.mtls_endpoint_aliases) {
    targetUrl = this.issuer.mtls_endpoint_aliases[`${endpoint}_endpoint`];
  }

  targetUrl = targetUrl || this.issuer[`${endpoint}_endpoint`];

  if ('body' in requestOpts) {
    requestOpts.body = omitBy(requestOpts.body, (arg) => arg === undefined);
  }

  return request.call(this, {
    ...requestOpts,
    method: 'POST',
    url: targetUrl,
  }, { mTLS });
}

module.exports = {
  resolveResponseType,
  resolveRedirectUri,
  authFor,
  authenticatedPost,
};


/***/ }),
/* 286 */,
/* 287 */,
/* 288 */,
/* 289 */,
/* 290 */,
/* 291 */,
/* 292 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var constant = __webpack_require__(817),
    defineProperty = __webpack_require__(382),
    identity = __webpack_require__(83);

/**
 * The base implementation of `setToString` without support for hot loop shorting.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var baseSetToString = !defineProperty ? identity : function(func, string) {
  return defineProperty(func, 'toString', {
    'configurable': true,
    'enumerable': false,
    'value': constant(string),
    'writable': true
  });
};

module.exports = baseSetToString;


/***/ }),
/* 293 */,
/* 294 */,
/* 295 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var baseMatches = __webpack_require__(974),
    baseMatchesProperty = __webpack_require__(41),
    identity = __webpack_require__(83),
    isArray = __webpack_require__(143),
    property = __webpack_require__(927);

/**
 * The base implementation of `_.iteratee`.
 *
 * @private
 * @param {*} [value=_.identity] The value to convert to an iteratee.
 * @returns {Function} Returns the iteratee.
 */
function baseIteratee(value) {
  // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
  // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
  if (typeof value == 'function') {
    return value;
  }
  if (value == null) {
    return identity;
  }
  if (typeof value == 'object') {
    return isArray(value)
      ? baseMatchesProperty(value[0], value[1])
      : baseMatches(value);
  }
  return property(value);
}

module.exports = baseIteratee;


/***/ }),
/* 296 */,
/* 297 */,
/* 298 */,
/* 299 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var baseGetAllKeys = __webpack_require__(857),
    getSymbolsIn = __webpack_require__(386),
    keysIn = __webpack_require__(971);

/**
 * Creates an array of own and inherited enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeysIn(object) {
  return baseGetAllKeys(object, keysIn, getSymbolsIn);
}

module.exports = getAllKeysIn;


/***/ }),
/* 300 */,
/* 301 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var isArrayLike = __webpack_require__(146),
    isObjectLike = __webpack_require__(337);

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

module.exports = isArrayLikeObject;


/***/ }),
/* 302 */,
/* 303 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const EventEmitter = __webpack_require__(614);
const JSONB = __webpack_require__(205);

const loadStore = opts => {
	const adapters = {
		redis: '@keyv/redis',
		mongodb: '@keyv/mongo',
		mongo: '@keyv/mongo',
		sqlite: '@keyv/sqlite',
		postgresql: '@keyv/postgres',
		postgres: '@keyv/postgres',
		mysql: '@keyv/mysql'
	};
	if (opts.adapter || opts.uri) {
		const adapter = opts.adapter || /^[^:]*/.exec(opts.uri)[0];
		return new (require(adapters[adapter]))(opts);
	}
	return new Map();
};

class Keyv extends EventEmitter {
	constructor(uri, opts) {
		super();
		this.opts = Object.assign(
			{
				namespace: 'keyv',
				serialize: JSONB.stringify,
				deserialize: JSONB.parse
			},
			(typeof uri === 'string') ? { uri } : uri,
			opts
		);

		if (!this.opts.store) {
			const adapterOpts = Object.assign({}, this.opts);
			this.opts.store = loadStore(adapterOpts);
		}

		if (typeof this.opts.store.on === 'function') {
			this.opts.store.on('error', err => this.emit('error', err));
		}

		this.opts.store.namespace = this.opts.namespace;
	}

	_getKeyPrefix(key) {
		return `${this.opts.namespace}:${key}`;
	}

	get(key) {
		key = this._getKeyPrefix(key);
		const store = this.opts.store;
		return Promise.resolve()
			.then(() => store.get(key))
			.then(data => {
				data = (typeof data === 'string') ? this.opts.deserialize(data) : data;
				if (data === undefined) {
					return undefined;
				}
				if (typeof data.expires === 'number' && Date.now() > data.expires) {
					this.delete(key);
					return undefined;
				}
				return data.value;
			});
	}

	set(key, value, ttl) {
		key = this._getKeyPrefix(key);
		if (typeof ttl === 'undefined') {
			ttl = this.opts.ttl;
		}
		if (ttl === 0) {
			ttl = undefined;
		}
		const store = this.opts.store;

		return Promise.resolve()
			.then(() => {
				const expires = (typeof ttl === 'number') ? (Date.now() + ttl) : null;
				value = { value, expires };
				return store.set(key, this.opts.serialize(value), ttl);
			})
			.then(() => true);
	}

	delete(key) {
		key = this._getKeyPrefix(key);
		const store = this.opts.store;
		return Promise.resolve()
			.then(() => store.delete(key));
	}

	clear() {
		const store = this.opts.store;
		return Promise.resolve()
			.then(() => store.clear());
	}
}

module.exports = Keyv;


/***/ }),
/* 304 */,
/* 305 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var assignMergeValue = __webpack_require__(907),
    cloneBuffer = __webpack_require__(744),
    cloneTypedArray = __webpack_require__(439),
    copyArray = __webpack_require__(239),
    initCloneObject = __webpack_require__(66),
    isArguments = __webpack_require__(460),
    isArray = __webpack_require__(143),
    isArrayLikeObject = __webpack_require__(301),
    isBuffer = __webpack_require__(629),
    isFunction = __webpack_require__(10),
    isObject = __webpack_require__(988),
    isPlainObject = __webpack_require__(585),
    isTypedArray = __webpack_require__(850),
    safeGet = __webpack_require__(807),
    toPlainObject = __webpack_require__(808);

/**
 * A specialized version of `baseMerge` for arrays and objects which performs
 * deep merges and tracks traversed objects enabling objects with circular
 * references to be merged.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {string} key The key of the value to merge.
 * @param {number} srcIndex The index of `source`.
 * @param {Function} mergeFunc The function to merge values.
 * @param {Function} [customizer] The function to customize assigned values.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 */
function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
  var objValue = safeGet(object, key),
      srcValue = safeGet(source, key),
      stacked = stack.get(srcValue);

  if (stacked) {
    assignMergeValue(object, key, stacked);
    return;
  }
  var newValue = customizer
    ? customizer(objValue, srcValue, (key + ''), object, source, stack)
    : undefined;

  var isCommon = newValue === undefined;

  if (isCommon) {
    var isArr = isArray(srcValue),
        isBuff = !isArr && isBuffer(srcValue),
        isTyped = !isArr && !isBuff && isTypedArray(srcValue);

    newValue = srcValue;
    if (isArr || isBuff || isTyped) {
      if (isArray(objValue)) {
        newValue = objValue;
      }
      else if (isArrayLikeObject(objValue)) {
        newValue = copyArray(objValue);
      }
      else if (isBuff) {
        isCommon = false;
        newValue = cloneBuffer(srcValue, true);
      }
      else if (isTyped) {
        isCommon = false;
        newValue = cloneTypedArray(srcValue, true);
      }
      else {
        newValue = [];
      }
    }
    else if (isPlainObject(srcValue) || isArguments(srcValue)) {
      newValue = objValue;
      if (isArguments(objValue)) {
        newValue = toPlainObject(objValue);
      }
      else if (!isObject(objValue) || isFunction(objValue)) {
        newValue = initCloneObject(srcValue);
      }
    }
    else {
      isCommon = false;
    }
  }
  if (isCommon) {
    // Recursively merge objects and arrays (susceptible to call stack limits).
    stack.set(srcValue, newValue);
    mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
    stack['delete'](srcValue);
  }
  assignMergeValue(object, key, newValue);
}

module.exports = baseMergeDeep;


/***/ }),
/* 306 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(422);
/**
 * @class
 * @implements Middleware
 * Class for HTTPMessageHandler
 */
var HTTPMessageHandler = /** @class */ (function () {
    function HTTPMessageHandler() {
    }
    /**
     * @public
     * @async
     * To execute the current middleware
     * @param {Context} context - The request context object
     * @returns A promise that resolves to nothing
     */
    HTTPMessageHandler.prototype.execute = function (context) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, error_1;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = context;
                        return [4 /*yield*/, fetch(context.request, context.options)];
                    case 1:
                        _a.response = _b.sent();
                        return [2 /*return*/];
                    case 2:
                        error_1 = _b.sent();
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return HTTPMessageHandler;
}());
exports.HTTPMessageHandler = HTTPMessageHandler;
//# sourceMappingURL=HTTPMessageHandler.js.map

/***/ }),
/* 307 */,
/* 308 */,
/* 309 */,
/* 310 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var castPath = __webpack_require__(929),
    isArguments = __webpack_require__(460),
    isArray = __webpack_require__(143),
    isIndex = __webpack_require__(160),
    isLength = __webpack_require__(56),
    toKey = __webpack_require__(503);

/**
 * Checks if `path` exists on `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @param {Function} hasFunc The function to check properties.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 */
function hasPath(object, path, hasFunc) {
  path = castPath(path, object);

  var index = -1,
      length = path.length,
      result = false;

  while (++index < length) {
    var key = toKey(path[index]);
    if (!(result = object != null && hasFunc(object, key))) {
      break;
    }
    object = object[key];
  }
  if (result || ++index != length) {
    return result;
  }
  length = object == null ? 0 : object.length;
  return !!length && isLength(length) && isIndex(key, length) &&
    (isArray(object) || isArguments(object));
}

module.exports = hasPath;


/***/ }),
/* 311 */,
/* 312 */,
/* 313 */,
/* 314 */,
/* 315 */,
/* 316 */
/***/ (function(module) {

/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/**
 * Creates a function that negates the result of the predicate `func`. The
 * `func` predicate is invoked with the `this` binding and arguments of the
 * created function.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Function
 * @param {Function} predicate The predicate to negate.
 * @returns {Function} Returns the new negated function.
 * @example
 *
 * function isEven(n) {
 *   return n % 2 == 0;
 * }
 *
 * _.filter([1, 2, 3, 4, 5, 6], _.negate(isEven));
 * // => [1, 3, 5]
 */
function negate(predicate) {
  if (typeof predicate != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  return function() {
    var args = arguments;
    switch (args.length) {
      case 0: return !predicate.call(this);
      case 1: return !predicate.call(this, args[0]);
      case 2: return !predicate.call(this, args[0], args[1]);
      case 3: return !predicate.call(this, args[0], args[1], args[2]);
    }
    return !predicate.apply(this, args);
  };
}

module.exports = negate;


/***/ }),
/* 317 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { improvedDH } = __webpack_require__(915)

if (improvedDH) {
  const { diffieHellman } = __webpack_require__(417)

  const { KeyObject } = __webpack_require__(727)
  const importKey = __webpack_require__(284)

  module.exports = ({ keyObject: privateKey }, publicKey) => {
    if (!(publicKey instanceof KeyObject)) {
      ({ keyObject: publicKey } = importKey(publicKey))
    }

    return diffieHellman({ privateKey, publicKey })
  }
} else {
  const { createECDH, constants: { POINT_CONVERSION_UNCOMPRESSED } } = __webpack_require__(417)

  const base64url = __webpack_require__(44)

  const crvToCurve = (crv) => {
    switch (crv) {
      case 'P-256':
        return 'prime256v1'
      case 'P-384':
        return 'secp384r1'
      case 'P-521':
        return 'secp521r1'
    }
  }

  const UNCOMPRESSED = Buffer.alloc(1, POINT_CONVERSION_UNCOMPRESSED)
  const pubToBuffer = (x, y) => Buffer.concat([UNCOMPRESSED, base64url.decodeToBuffer(x), base64url.decodeToBuffer(y)])

  module.exports = ({ crv, d }, { x, y }) => {
    const curve = crvToCurve(crv)
    const exchange = createECDH(curve)

    exchange.setPrivateKey(base64url.decodeToBuffer(d))

    return exchange.computeSecret(pubToBuffer(x, y))
  }
}


/***/ }),
/* 318 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var isObject = __webpack_require__(988);

/** Built-in value references. */
var objectCreate = Object.create;

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} proto The object to inherit from.
 * @returns {Object} Returns the new object.
 */
var baseCreate = (function() {
  function object() {}
  return function(proto) {
    if (!isObject(proto)) {
      return {};
    }
    if (objectCreate) {
      return objectCreate(proto);
    }
    object.prototype = proto;
    var result = new object;
    object.prototype = undefined;
    return result;
  };
}());

module.exports = baseCreate;


/***/ }),
/* 319 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var baseIsNative = __webpack_require__(248),
    getValue = __webpack_require__(879);

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

module.exports = getNative;


/***/ }),
/* 320 */,
/* 321 */,
/* 322 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const errors = __webpack_require__(688)
const Key = __webpack_require__(228)
const importKey = __webpack_require__(284)
const { KeyStore } = __webpack_require__(926)

module.exports = (input, keyStoreAllowed = false) => {
  if (input instanceof Key) {
    return input
  }

  if (input instanceof KeyStore) {
    if (!keyStoreAllowed) {
      throw new TypeError('key argument for this operation must not be a JWKS.KeyStore instance')
    }

    return input
  }

  try {
    return importKey(input)
  } catch (err) {
    if (err instanceof errors.JOSEError && !(err instanceof errors.JWKImportFailed)) {
      throw err
    }

    let msg
    if (keyStoreAllowed) {
      msg = 'key must be an instance of a key instantiated by JWK.asKey, a valid JWK.asKey input, or a JWKS.KeyStore instance'
    } else {
      msg = 'key must be an instance of a key instantiated by JWK.asKey, or a valid JWK.asKey input'
    }

    throw new TypeError(msg)
  }
}


/***/ }),
/* 323 */,
/* 324 */,
/* 325 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const PassThrough = __webpack_require__(413).PassThrough;
const mimicResponse = __webpack_require__(89);

const cloneResponse = response => {
	if (!(response && response.pipe)) {
		throw new TypeError('Parameter `response` must be a response stream.');
	}

	const clone = new PassThrough();
	mimicResponse(response, clone);

	return response.pipe(clone);
};

module.exports = cloneResponse;


/***/ }),
/* 326 */,
/* 327 */,
/* 328 */,
/* 329 */,
/* 330 */,
/* 331 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const isObject = __webpack_require__(920)
const secs = __webpack_require__(434)
const epoch = __webpack_require__(0)
const getKey = __webpack_require__(322)
const JWS = __webpack_require__(131)

const isString = __webpack_require__(518).isString.bind(undefined, TypeError)

const validateOptions = (options) => {
  if (typeof options.iat !== 'boolean') {
    throw new TypeError('options.iat must be a boolean')
  }

  if (typeof options.kid !== 'boolean') {
    throw new TypeError('options.kid must be a boolean')
  }

  isString(options.subject, 'options.subject')
  isString(options.issuer, 'options.issuer')

  if (
    options.audience !== undefined &&
    (
      (typeof options.audience !== 'string' || !options.audience) &&
      (!Array.isArray(options.audience) || options.audience.length === 0 || options.audience.some(a => !a || typeof a !== 'string'))
    )
  ) {
    throw new TypeError('options.audience must be a string or an array of strings')
  }

  if (!isObject(options.header)) {
    throw new TypeError('options.header must be an object')
  }

  isString(options.algorithm, 'options.algorithm')
  isString(options.expiresIn, 'options.expiresIn')
  isString(options.notBefore, 'options.notBefore')
  isString(options.jti, 'options.jti')
  isString(options.nonce, 'options.nonce')

  if (options.now !== undefined && (!(options.now instanceof Date) || !options.now.getTime())) {
    throw new TypeError('options.now must be a valid Date object')
  }
}

module.exports = (payload, key, options = {}) => {
  if (!isObject(options)) {
    throw new TypeError('options must be an object')
  }

  const {
    algorithm, audience, expiresIn, header = {}, iat = true,
    issuer, jti, kid = true, nonce, notBefore, subject, now
  } = options

  validateOptions({
    algorithm, audience, expiresIn, header, iat, issuer, jti, kid, nonce, notBefore, now, subject
  })

  if (!isObject(payload)) {
    throw new TypeError('payload must be an object')
  }

  let unix
  if (expiresIn || notBefore || iat) {
    unix = epoch(now || new Date())
  }

  payload = {
    ...payload,
    sub: subject || payload.sub,
    aud: audience || payload.aud,
    iss: issuer || payload.iss,
    jti: jti || payload.jti,
    iat: iat ? unix : payload.iat,
    nonce: nonce || payload.nonce,
    exp: expiresIn ? unix + secs(expiresIn) : payload.exp,
    nbf: notBefore ? unix + secs(notBefore) : payload.nbf
  }

  key = getKey(key)

  let includeKid

  if (typeof options.kid === 'boolean') {
    includeKid = kid
  } else {
    includeKid = !key.secret
  }

  return JWS.sign(JSON.stringify(payload), key, {
    ...header,
    alg: algorithm || header.alg,
    kid: includeKid ? key.kid : header.kid
  })
}


/***/ }),
/* 332 */,
/* 333 */,
/* 334 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var Symbol = __webpack_require__(498);

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * Creates a clone of the `symbol` object.
 *
 * @private
 * @param {Object} symbol The symbol object to clone.
 * @returns {Object} Returns the cloned symbol object.
 */
function cloneSymbol(symbol) {
  return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
}

module.exports = cloneSymbol;


/***/ }),
/* 335 */,
/* 336 */,
/* 337 */
/***/ (function(module) {

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

module.exports = isObjectLike;


/***/ }),
/* 338 */
/***/ (function(module) {

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

module.exports = eq;


/***/ }),
/* 339 */,
/* 340 */,
/* 341 */,
/* 342 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var baseGet = __webpack_require__(356);

/**
 * Gets the value at `path` of `object`. If the resolved value is
 * `undefined`, the `defaultValue` is returned in its place.
 *
 * @static
 * @memberOf _
 * @since 3.7.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.get(object, 'a[0].b.c');
 * // => 3
 *
 * _.get(object, ['a', '0', 'b', 'c']);
 * // => 3
 *
 * _.get(object, 'a.b.c', 'default');
 * // => 'default'
 */
function get(object, path, defaultValue) {
  var result = object == null ? undefined : baseGet(object, path);
  return result === undefined ? defaultValue : result;
}

module.exports = get;


/***/ }),
/* 343 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
var MiddlewareControl_1 = __webpack_require__(5);
/**
 * @enum
 * @property {number} NONE - The hexadecimal flag value for nothing enabled
 * @property {number} REDIRECT_HANDLER_ENABLED - The hexadecimal flag value for redirect handler enabled
 * @property {number} RETRY_HANDLER_ENABLED - The hexadecimal flag value for retry handler enabled
 * @property {number} AUTHENTICATION_HANDLER_ENABLED - The hexadecimal flag value for the authentication handler enabled
 */
var FeatureUsageFlag;
(function (FeatureUsageFlag) {
    FeatureUsageFlag[FeatureUsageFlag["NONE"] = 0] = "NONE";
    FeatureUsageFlag[FeatureUsageFlag["REDIRECT_HANDLER_ENABLED"] = 1] = "REDIRECT_HANDLER_ENABLED";
    FeatureUsageFlag[FeatureUsageFlag["RETRY_HANDLER_ENABLED"] = 2] = "RETRY_HANDLER_ENABLED";
    FeatureUsageFlag[FeatureUsageFlag["AUTHENTICATION_HANDLER_ENABLED"] = 4] = "AUTHENTICATION_HANDLER_ENABLED";
})(FeatureUsageFlag = exports.FeatureUsageFlag || (exports.FeatureUsageFlag = {}));
/**
 * @class
 * @implements MiddlewareOptions
 * Class for TelemetryHandlerOptions
 */
var TelemetryHandlerOptions = /** @class */ (function () {
    function TelemetryHandlerOptions() {
        /**
         * @private
         * A member to hold the OR of feature usage flags
         */
        this.featureUsage = FeatureUsageFlag.NONE;
    }
    /**
     * @public
     * @static
     * To update the feature usage in the context object
     * @param {Context} context - The request context object containing middleware options
     * @param {FeatureUsageFlag} flag - The flag value
     * @returns nothing
     */
    TelemetryHandlerOptions.updateFeatureUsageFlag = function (context, flag) {
        var options;
        if (context.middlewareControl instanceof MiddlewareControl_1.MiddlewareControl) {
            options = context.middlewareControl.getMiddlewareOptions(TelemetryHandlerOptions);
        }
        else {
            context.middlewareControl = new MiddlewareControl_1.MiddlewareControl();
        }
        if (typeof options === "undefined") {
            options = new TelemetryHandlerOptions();
            context.middlewareControl.setMiddlewareOptions(TelemetryHandlerOptions, options);
        }
        options.setFeatureUsage(flag);
    };
    /**
     * @private
     * To set the feature usage flag
     * @param {FeatureUsageFlag} flag - The flag value
     * @returns nothing
     */
    TelemetryHandlerOptions.prototype.setFeatureUsage = function (flag) {
        /* tslint:disable: no-bitwise */
        this.featureUsage = this.featureUsage | flag;
        /* tslint:enable: no-bitwise */
    };
    /**
     * @public
     * To get the feature usage
     * @returns A feature usage flag as hexadecimal string
     */
    TelemetryHandlerOptions.prototype.getFeatureUsage = function () {
        return this.featureUsage.toString(16);
    };
    return TelemetryHandlerOptions;
}());
exports.TelemetryHandlerOptions = TelemetryHandlerOptions;
//# sourceMappingURL=TelemetryHandlerOptions.js.map

/***/ }),
/* 344 */,
/* 345 */
/***/ (function(__unusedmodule, exports) {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @enum
 * Enum for ResponseType values
 * @property {string} ARRAYBUFFER - To download response content as an [ArrayBuffer]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer}
 * @property {string} BLOB - To download content as a [binary/blob] {@link https://developer.mozilla.org/en-US/docs/Web/API/Blob}
 * @property {string} DOCUMENT - This downloads content as a document or stream
 * @property {string} JSON - To download response content as a json
 * @property {string} STREAM - To download response as a [stream]{@link https://nodejs.org/api/stream.html}
 * @property {string} TEXT - For downloading response as a text
 */
var ResponseType;
(function (ResponseType) {
    ResponseType["ARRAYBUFFER"] = "arraybuffer";
    ResponseType["BLOB"] = "blob";
    ResponseType["DOCUMENT"] = "document";
    ResponseType["JSON"] = "json";
    ResponseType["RAW"] = "raw";
    ResponseType["STREAM"] = "stream";
    ResponseType["TEXT"] = "text";
})(ResponseType = exports.ResponseType || (exports.ResponseType = {}));
//# sourceMappingURL=ResponseType.js.map

/***/ }),
/* 346 */,
/* 347 */,
/* 348 */
/***/ (function(module) {

/**
 * A specialized version of `_.filter` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function arrayFilter(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length,
      resIndex = 0,
      result = [];

  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}

module.exports = arrayFilter;


/***/ }),
/* 349 */,
/* 350 */,
/* 351 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var isPrototype = __webpack_require__(653),
    nativeKeys = __webpack_require__(773);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

module.exports = baseKeys;


/***/ }),
/* 352 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var baseGet = __webpack_require__(356);

/**
 * A specialized version of `baseProperty` which supports deep paths.
 *
 * @private
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function basePropertyDeep(path) {
  return function(object) {
    return baseGet(object, path);
  };
}

module.exports = basePropertyDeep;


/***/ }),
/* 353 */,
/* 354 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var createBaseFor = __webpack_require__(795);

/**
 * The base implementation of `baseForOwn` which iterates over `object`
 * properties returned by `keysFunc` and invokes `iteratee` for each property.
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor = createBaseFor();

module.exports = baseFor;


/***/ }),
/* 355 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { timingSafeEqual: TSE } = __webpack_require__(417)

const paddedBuffer = (input, length) => {
  if (input.length === length) {
    return input
  }

  const buffer = Buffer.alloc(length)
  input.copy(buffer)
  return buffer
}

const timingSafeEqual = (a, b) => {
  const length = Math.max(a.length, b.length)
  return TSE(paddedBuffer(a, length), paddedBuffer(b, length))
}

module.exports = timingSafeEqual


/***/ }),
/* 356 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var castPath = __webpack_require__(929),
    toKey = __webpack_require__(503);

/**
 * The base implementation of `_.get` without support for default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @returns {*} Returns the resolved value.
 */
function baseGet(object, path) {
  path = castPath(path, object);

  var index = 0,
      length = path.length;

  while (object != null && index < length) {
    object = object[toKey(path[index++])];
  }
  return (index && index == length) ? object : undefined;
}

module.exports = baseGet;


/***/ }),
/* 357 */
/***/ (function(module) {

module.exports = require("assert");

/***/ }),
/* 358 */,
/* 359 */,
/* 360 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var baseHasIn = __webpack_require__(754),
    hasPath = __webpack_require__(310);

/**
 * Checks if `path` is a direct or inherited property of `object`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 * @example
 *
 * var object = _.create({ 'a': _.create({ 'b': 2 }) });
 *
 * _.hasIn(object, 'a');
 * // => true
 *
 * _.hasIn(object, 'a.b');
 * // => true
 *
 * _.hasIn(object, ['a', 'b']);
 * // => true
 *
 * _.hasIn(object, 'b');
 * // => false
 */
function hasIn(object, path) {
  return object != null && hasPath(object, path, baseHasIn);
}

module.exports = hasIn;


/***/ }),
/* 361 */,
/* 362 */,
/* 363 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var baseAssignValue = __webpack_require__(772),
    eq = __webpack_require__(338);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
      (value === undefined && !(key in object))) {
    baseAssignValue(object, key, value);
  }
}

module.exports = assignValue;


/***/ }),
/* 364 */,
/* 365 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const {Transform} = __webpack_require__(413);

module.exports = {
	download(response, emitter, downloadBodySize) {
		let downloaded = 0;

		return new Transform({
			transform(chunk, encoding, callback) {
				downloaded += chunk.length;

				const percent = downloadBodySize ? downloaded / downloadBodySize : 0;

				// Let `flush()` be responsible for emitting the last event
				if (percent < 1) {
					emitter.emit('downloadProgress', {
						percent,
						transferred: downloaded,
						total: downloadBodySize
					});
				}

				callback(null, chunk);
			},

			flush(callback) {
				emitter.emit('downloadProgress', {
					percent: 1,
					transferred: downloaded,
					total: downloadBodySize
				});

				callback();
			}
		});
	},

	upload(request, emitter, uploadBodySize) {
		const uploadEventFrequency = 150;
		let uploaded = 0;
		let progressInterval;

		emitter.emit('uploadProgress', {
			percent: 0,
			transferred: 0,
			total: uploadBodySize
		});

		request.once('error', () => {
			clearInterval(progressInterval);
		});

		request.once('response', () => {
			clearInterval(progressInterval);

			emitter.emit('uploadProgress', {
				percent: 1,
				transferred: uploaded,
				total: uploadBodySize
			});
		});

		request.once('socket', socket => {
			const onSocketConnect = () => {
				progressInterval = setInterval(() => {
					const lastUploaded = uploaded;
					/* istanbul ignore next: see #490 (occurs randomly!) */
					const headersSize = request._header ? Buffer.byteLength(request._header) : 0;
					uploaded = socket.bytesWritten - headersSize;

					// Don't emit events with unchanged progress and
					// prevent last event from being emitted, because
					// it's emitted when `response` is emitted
					if (uploaded === lastUploaded || uploaded === uploadBodySize) {
						return;
					}

					emitter.emit('uploadProgress', {
						percent: uploadBodySize ? uploaded / uploadBodySize : 0,
						transferred: uploaded,
						total: uploadBodySize
					});
				}, uploadEventFrequency);
			};

			/* istanbul ignore next: hard to test */
			if (socket.connecting) {
				socket.once('connect', onSocketConnect);
			} else if (socket.writable) {
				// The socket is being reused from pool,
				// so the connect event will not be emitted
				onSocketConnect();
			}
		});
	}
};


/***/ }),
/* 366 */,
/* 367 */,
/* 368 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { createHash, randomBytes } = __webpack_require__(417);

const { encode: base64url } = __webpack_require__(575);

const random = (bytes = 32) => base64url(randomBytes(bytes));

module.exports = {
  random,
  state: random,
  nonce: random,
  codeVerifier: random,
  codeChallenge: (codeVerifier) => base64url(createHash('sha256').update(codeVerifier).digest()),
};


/***/ }),
/* 369 */,
/* 370 */,
/* 371 */,
/* 372 */,
/* 373 */,
/* 374 */
/***/ (function(__unusedmodule, exports) {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @constant
 * @function
 * Validates availability of Promise and fetch in global context
 * @returns The true in case the Promise and fetch available, otherwise throws error
 */
exports.validatePolyFilling = function () {
    if (typeof Promise === "undefined" && typeof fetch === "undefined") {
        var error = new Error("Library cannot function without Promise and fetch. So, please provide polyfill for them.");
        error.name = "PolyFillNotAvailable";
        throw error;
    }
    else if (typeof Promise === "undefined") {
        var error = new Error("Library cannot function without Promise. So, please provide polyfill for it.");
        error.name = "PolyFillNotAvailable";
        throw error;
    }
    else if (typeof fetch === "undefined") {
        var error = new Error("Library cannot function without fetch. So, please provide polyfill for it.");
        error.name = "PolyFillNotAvailable";
        throw error;
    }
    return true;
};
//# sourceMappingURL=ValidatePolyFilling.js.map

/***/ }),
/* 375 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const {PassThrough: PassThroughStream} = __webpack_require__(413);

module.exports = options => {
	options = {...options};

	const {array} = options;
	let {encoding} = options;
	const isBuffer = encoding === 'buffer';
	let objectMode = false;

	if (array) {
		objectMode = !(encoding || isBuffer);
	} else {
		encoding = encoding || 'utf8';
	}

	if (isBuffer) {
		encoding = null;
	}

	const stream = new PassThroughStream({objectMode});

	if (encoding) {
		stream.setEncoding(encoding);
	}

	let length = 0;
	const chunks = [];

	stream.on('data', chunk => {
		chunks.push(chunk);

		if (objectMode) {
			length = chunks.length;
		} else {
			length += chunk.length;
		}
	});

	stream.getBufferedValue = () => {
		if (array) {
			return chunks;
		}

		return isBuffer ? Buffer.concat(chunks, length) : chunks.join('');
	};

	stream.getBufferedLength = () => length;

	return stream;
};


/***/ }),
/* 376 */,
/* 377 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var Stack = __webpack_require__(598),
    arrayEach = __webpack_require__(698),
    assignValue = __webpack_require__(363),
    baseAssign = __webpack_require__(839),
    baseAssignIn = __webpack_require__(610),
    cloneBuffer = __webpack_require__(744),
    copyArray = __webpack_require__(239),
    copySymbols = __webpack_require__(760),
    copySymbolsIn = __webpack_require__(589),
    getAllKeys = __webpack_require__(620),
    getAllKeysIn = __webpack_require__(299),
    getTag = __webpack_require__(700),
    initCloneArray = __webpack_require__(403),
    initCloneByTag = __webpack_require__(538),
    initCloneObject = __webpack_require__(66),
    isArray = __webpack_require__(143),
    isBuffer = __webpack_require__(629),
    isMap = __webpack_require__(96),
    isObject = __webpack_require__(988),
    isSet = __webpack_require__(678),
    keys = __webpack_require__(863);

/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG = 1,
    CLONE_FLAT_FLAG = 2,
    CLONE_SYMBOLS_FLAG = 4;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values supported by `_.clone`. */
var cloneableTags = {};
cloneableTags[argsTag] = cloneableTags[arrayTag] =
cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] =
cloneableTags[boolTag] = cloneableTags[dateTag] =
cloneableTags[float32Tag] = cloneableTags[float64Tag] =
cloneableTags[int8Tag] = cloneableTags[int16Tag] =
cloneableTags[int32Tag] = cloneableTags[mapTag] =
cloneableTags[numberTag] = cloneableTags[objectTag] =
cloneableTags[regexpTag] = cloneableTags[setTag] =
cloneableTags[stringTag] = cloneableTags[symbolTag] =
cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
cloneableTags[errorTag] = cloneableTags[funcTag] =
cloneableTags[weakMapTag] = false;

/**
 * The base implementation of `_.clone` and `_.cloneDeep` which tracks
 * traversed objects.
 *
 * @private
 * @param {*} value The value to clone.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Deep clone
 *  2 - Flatten inherited properties
 *  4 - Clone symbols
 * @param {Function} [customizer] The function to customize cloning.
 * @param {string} [key] The key of `value`.
 * @param {Object} [object] The parent object of `value`.
 * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
 * @returns {*} Returns the cloned value.
 */
function baseClone(value, bitmask, customizer, key, object, stack) {
  var result,
      isDeep = bitmask & CLONE_DEEP_FLAG,
      isFlat = bitmask & CLONE_FLAT_FLAG,
      isFull = bitmask & CLONE_SYMBOLS_FLAG;

  if (customizer) {
    result = object ? customizer(value, key, object, stack) : customizer(value);
  }
  if (result !== undefined) {
    return result;
  }
  if (!isObject(value)) {
    return value;
  }
  var isArr = isArray(value);
  if (isArr) {
    result = initCloneArray(value);
    if (!isDeep) {
      return copyArray(value, result);
    }
  } else {
    var tag = getTag(value),
        isFunc = tag == funcTag || tag == genTag;

    if (isBuffer(value)) {
      return cloneBuffer(value, isDeep);
    }
    if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
      result = (isFlat || isFunc) ? {} : initCloneObject(value);
      if (!isDeep) {
        return isFlat
          ? copySymbolsIn(value, baseAssignIn(result, value))
          : copySymbols(value, baseAssign(result, value));
      }
    } else {
      if (!cloneableTags[tag]) {
        return object ? value : {};
      }
      result = initCloneByTag(value, tag, isDeep);
    }
  }
  // Check for circular references and return its corresponding clone.
  stack || (stack = new Stack);
  var stacked = stack.get(value);
  if (stacked) {
    return stacked;
  }
  stack.set(value, result);

  if (isSet(value)) {
    value.forEach(function(subValue) {
      result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
    });
  } else if (isMap(value)) {
    value.forEach(function(subValue, key) {
      result.set(key, baseClone(subValue, bitmask, customizer, key, value, stack));
    });
  }

  var keysFunc = isFull
    ? (isFlat ? getAllKeysIn : getAllKeys)
    : (isFlat ? keysIn : keys);

  var props = isArr ? undefined : keysFunc(value);
  arrayEach(props || value, function(subValue, key) {
    if (props) {
      key = subValue;
      subValue = value[key];
    }
    // Recursively populate clone (susceptible to call stack limits).
    assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
  });
  return result;
}

module.exports = baseClone;


/***/ }),
/* 378 */,
/* 379 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var getNative = __webpack_require__(319),
    root = __webpack_require__(824);

/* Built-in method references that are verified to be native. */
var WeakMap = getNative(root, 'WeakMap');

module.exports = WeakMap;


/***/ }),
/* 380 */,
/* 381 */,
/* 382 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var getNative = __webpack_require__(319);

var defineProperty = (function() {
  try {
    var func = getNative(Object, 'defineProperty');
    func({}, '', {});
    return func;
  } catch (e) {}
}());

module.exports = defineProperty;


/***/ }),
/* 383 */,
/* 384 */,
/* 385 */,
/* 386 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var arrayPush = __webpack_require__(883),
    getPrototype = __webpack_require__(488),
    getSymbols = __webpack_require__(709),
    stubArray = __webpack_require__(130);

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own and inherited enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object) {
  var result = [];
  while (object) {
    arrayPush(result, getSymbols(object));
    object = getPrototype(object);
  }
  return result;
};

module.exports = getSymbolsIn;


/***/ }),
/* 387 */
/***/ (function(module, __unusedexports, __webpack_require__) {

module.exports = {
  JWE: __webpack_require__(978),
  JWK: __webpack_require__(105),
  JWKS: __webpack_require__(851),
  JWS: __webpack_require__(131),
  JWT: __webpack_require__(931),
  errors: __webpack_require__(688)
}


/***/ }),
/* 388 */,
/* 389 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var baseTimes = __webpack_require__(553),
    isArguments = __webpack_require__(460),
    isArray = __webpack_require__(143),
    isBuffer = __webpack_require__(629),
    isIndex = __webpack_require__(160),
    isTypedArray = __webpack_require__(850);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value),
      isArg = !isArr && isArguments(value),
      isBuff = !isArr && !isArg && isBuffer(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           isIndex(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = arrayLikeKeys;


/***/ }),
/* 390 */,
/* 391 */,
/* 392 */,
/* 393 */
/***/ (function(module) {

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

module.exports = overArg;


/***/ }),
/* 394 */,
/* 395 */,
/* 396 */
/***/ (function(module) {

"use strict";

module.exports = function (Yallist) {
  Yallist.prototype[Symbol.iterator] = function* () {
    for (let walker = this.head; walker; walker = walker.next) {
      yield walker.value
    }
  }
}


/***/ }),
/* 397 */,
/* 398 */,
/* 399 */,
/* 400 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const net = __webpack_require__(937);

class TimeoutError extends Error {
	constructor(threshold, event) {
		super(`Timeout awaiting '${event}' for ${threshold}ms`);
		this.name = 'TimeoutError';
		this.code = 'ETIMEDOUT';
		this.event = event;
	}
}

const reentry = Symbol('reentry');

const noop = () => {};

module.exports = (request, delays, options) => {
	/* istanbul ignore next: this makes sure timed-out isn't called twice */
	if (request[reentry]) {
		return;
	}

	request[reentry] = true;

	let stopNewTimeouts = false;

	const addTimeout = (delay, callback, ...args) => {
		// An error had been thrown before. Going further would result in uncaught errors.
		// See https://github.com/sindresorhus/got/issues/631#issuecomment-435675051
		if (stopNewTimeouts) {
			return noop;
		}

		// Event loop order is timers, poll, immediates.
		// The timed event may emit during the current tick poll phase, so
		// defer calling the handler until the poll phase completes.
		let immediate;
		const timeout = setTimeout(() => {
			immediate = setImmediate(callback, delay, ...args);
			/* istanbul ignore next: added in node v9.7.0 */
			if (immediate.unref) {
				immediate.unref();
			}
		}, delay);

		/* istanbul ignore next: in order to support electron renderer */
		if (timeout.unref) {
			timeout.unref();
		}

		const cancel = () => {
			clearTimeout(timeout);
			clearImmediate(immediate);
		};

		cancelers.push(cancel);

		return cancel;
	};

	const {host, hostname} = options;
	const timeoutHandler = (delay, event) => {
		request.emit('error', new TimeoutError(delay, event));
		request.once('error', () => {}); // Ignore the `socket hung up` error made by request.abort()

		request.abort();
	};

	const cancelers = [];
	const cancelTimeouts = () => {
		stopNewTimeouts = true;
		cancelers.forEach(cancelTimeout => cancelTimeout());
	};

	request.once('error', cancelTimeouts);
	request.once('response', response => {
		response.once('end', cancelTimeouts);
	});

	if (delays.request !== undefined) {
		addTimeout(delays.request, timeoutHandler, 'request');
	}

	if (delays.socket !== undefined) {
		const socketTimeoutHandler = () => {
			timeoutHandler(delays.socket, 'socket');
		};

		request.setTimeout(delays.socket, socketTimeoutHandler);

		// `request.setTimeout(0)` causes a memory leak.
		// We can just remove the listener and forget about the timer - it's unreffed.
		// See https://github.com/sindresorhus/got/issues/690
		cancelers.push(() => request.removeListener('timeout', socketTimeoutHandler));
	}

	if (delays.lookup !== undefined && !request.socketPath && !net.isIP(hostname || host)) {
		request.once('socket', socket => {
			/* istanbul ignore next: hard to test */
			if (socket.connecting) {
				const cancelTimeout = addTimeout(delays.lookup, timeoutHandler, 'lookup');
				socket.once('lookup', cancelTimeout);
			}
		});
	}

	if (delays.connect !== undefined) {
		request.once('socket', socket => {
			/* istanbul ignore next: hard to test */
			if (socket.connecting) {
				const timeConnect = () => addTimeout(delays.connect, timeoutHandler, 'connect');

				if (request.socketPath || net.isIP(hostname || host)) {
					socket.once('connect', timeConnect());
				} else {
					socket.once('lookup', error => {
						if (error === null) {
							socket.once('connect', timeConnect());
						}
					});
				}
			}
		});
	}

	if (delays.secureConnect !== undefined && options.protocol === 'https:') {
		request.once('socket', socket => {
			/* istanbul ignore next: hard to test */
			if (socket.connecting) {
				socket.once('connect', () => {
					const cancelTimeout = addTimeout(delays.secureConnect, timeoutHandler, 'secureConnect');
					socket.once('secureConnect', cancelTimeout);
				});
			}
		});
	}

	if (delays.send !== undefined) {
		request.once('socket', socket => {
			const timeRequest = () => addTimeout(delays.send, timeoutHandler, 'send');
			/* istanbul ignore next: hard to test */
			if (socket.connecting) {
				socket.once('connect', () => {
					request.once('upload-complete', timeRequest());
				});
			} else {
				request.once('upload-complete', timeRequest());
			}
		});
	}

	if (delays.response !== undefined) {
		request.once('upload-complete', () => {
			const cancelTimeout = addTimeout(delays.response, timeoutHandler, 'response');
			request.once('response', cancelTimeout);
		});
	}
};

module.exports.TimeoutError = TimeoutError;


/***/ }),
/* 401 */
/***/ (function(module) {

module.exports = function () {
  this.seq().obj(
    this.key('version').int(),
    this.key('privateKey').octstr(),
    this.key('parameters').explicit(0).optional().choice({ namedCurve: this.objid() }),
    this.key('publicKey').explicit(1).optional().bitstr()
  )
}


/***/ }),
/* 402 */,
/* 403 */
/***/ (function(module) {

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Initializes an array clone.
 *
 * @private
 * @param {Array} array The array to clone.
 * @returns {Array} Returns the initialized clone.
 */
function initCloneArray(array) {
  var length = array.length,
      result = new array.constructor(length);

  // Add properties assigned by `RegExp#exec`.
  if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
    result.index = array.index;
    result.input = array.input;
  }
  return result;
}

module.exports = initCloneArray;


/***/ }),
/* 404 */,
/* 405 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var MapCache = __webpack_require__(121),
    setCacheAdd = __webpack_require__(20),
    setCacheHas = __webpack_require__(945);

/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */
function SetCache(values) {
  var index = -1,
      length = values == null ? 0 : values.length;

  this.__data__ = new MapCache;
  while (++index < length) {
    this.add(values[index]);
  }
}

// Add methods to `SetCache`.
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;

module.exports = SetCache;


/***/ }),
/* 406 */,
/* 407 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var identity = __webpack_require__(83),
    overRest = __webpack_require__(430),
    setToString = __webpack_require__(70);

/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */
function baseRest(func, start) {
  return setToString(overRest(func, start, identity), func + '');
}

module.exports = baseRest;


/***/ }),
/* 408 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { createCipheriv, createDecipheriv, getCiphers } = __webpack_require__(417)

const { KEYOBJECT } = __webpack_require__(771)
const { JWEInvalid, JWEDecryptionFailed } = __webpack_require__(688)
const { asInput } = __webpack_require__(727)

const checkInput = function (size, iv, tag) {
  if (iv.length !== 12) {
    throw new JWEInvalid('invalid iv')
  }
  if (arguments.length === 3) {
    if (tag.length !== 16) {
      throw new JWEInvalid('invalid tag')
    }
  }
}

const encrypt = (size, { [KEYOBJECT]: keyObject }, cleartext, { iv, aad = Buffer.alloc(0) }) => {
  const key = asInput(keyObject, false)
  checkInput(size, iv)

  const cipher = createCipheriv(`aes-${size}-gcm`, key, iv, { authTagLength: 16 })
  cipher.setAAD(aad)

  const ciphertext = Buffer.concat([cipher.update(cleartext), cipher.final()])
  const tag = cipher.getAuthTag()

  return { ciphertext, tag }
}

const decrypt = (size, { [KEYOBJECT]: keyObject }, ciphertext, { iv, tag = Buffer.alloc(0), aad = Buffer.alloc(0) }) => {
  const key = asInput(keyObject, false)
  checkInput(size, iv, tag)

  try {
    const cipher = createDecipheriv(`aes-${size}-gcm`, key, iv, { authTagLength: 16 })
    cipher.setAuthTag(tag)
    cipher.setAAD(aad)

    return Buffer.concat([cipher.update(ciphertext), cipher.final()])
  } catch (err) {
    throw new JWEDecryptionFailed()
  }
}

module.exports = (JWA, JWK) => {
  ['A128GCM', 'A192GCM', 'A256GCM'].forEach((jwaAlg) => {
    const size = parseInt(jwaAlg.substr(1, 3), 10)
    if (getCiphers().includes(`aes-${size}-gcm`)) {
      JWA.encrypt.set(jwaAlg, encrypt.bind(undefined, size))
      JWA.decrypt.set(jwaAlg, decrypt.bind(undefined, size))
      JWK.oct.encrypt[jwaAlg] = JWK.oct.decrypt[jwaAlg] = key => (key.use === 'enc' || key.use === undefined) && key.length === size
    }
  })
}


/***/ }),
/* 409 */,
/* 410 */,
/* 411 */,
/* 412 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var baseGetTag = __webpack_require__(51),
    isLength = __webpack_require__(56),
    isObjectLike = __webpack_require__(337);

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}

module.exports = baseIsTypedArray;


/***/ }),
/* 413 */
/***/ (function(module) {

module.exports = require("stream");

/***/ }),
/* 414 */,
/* 415 */,
/* 416 */
/***/ (function(module) {

module.exports = () => Math.floor(Date.now() / 1000);


/***/ }),
/* 417 */
/***/ (function(module) {

module.exports = require("crypto");

/***/ }),
/* 418 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var crypto = __webpack_require__(417);

/**
 * Exported function
 *
 * Options:
 *
 *  - `algorithm` hash algo to be used by this instance: *'sha1', 'md5'
 *  - `excludeValues` {true|*false} hash object keys, values ignored
 *  - `encoding` hash encoding, supports 'buffer', '*hex', 'binary', 'base64'
 *  - `ignoreUnknown` {true|*false} ignore unknown object types
 *  - `replacer` optional function that replaces values before hashing
 *  - `respectFunctionProperties` {*true|false} consider function properties when hashing
 *  - `respectFunctionNames` {*true|false} consider 'name' property of functions for hashing
 *  - `respectType` {*true|false} Respect special properties (prototype, constructor)
 *    when hashing to distinguish between types
 *  - `unorderedArrays` {true|*false} Sort all arrays before hashing
 *  - `unorderedSets` {*true|false} Sort `Set` and `Map` instances before hashing
 *  * = default
 *
 * @param {object} object value to hash
 * @param {object} options hashing options
 * @return {string} hash value
 * @api public
 */
exports = module.exports = objectHash;

function objectHash(object, options){
  options = applyDefaults(object, options);

  return hash(object, options);
}

/**
 * Exported sugar methods
 *
 * @param {object} object value to hash
 * @return {string} hash value
 * @api public
 */
exports.sha1 = function(object){
  return objectHash(object);
};
exports.keys = function(object){
  return objectHash(object, {excludeValues: true, algorithm: 'sha1', encoding: 'hex'});
};
exports.MD5 = function(object){
  return objectHash(object, {algorithm: 'md5', encoding: 'hex'});
};
exports.keysMD5 = function(object){
  return objectHash(object, {algorithm: 'md5', encoding: 'hex', excludeValues: true});
};

// Internals
var hashes = crypto.getHashes ? crypto.getHashes().slice() : ['sha1', 'md5'];
hashes.push('passthrough');
var encodings = ['buffer', 'hex', 'binary', 'base64'];

function applyDefaults(object, sourceOptions){
  sourceOptions = sourceOptions || {};

  // create a copy rather than mutating
  var options = {};
  options.algorithm = sourceOptions.algorithm || 'sha1';
  options.encoding = sourceOptions.encoding || 'hex';
  options.excludeValues = sourceOptions.excludeValues ? true : false;
  options.algorithm = options.algorithm.toLowerCase();
  options.encoding = options.encoding.toLowerCase();
  options.ignoreUnknown = sourceOptions.ignoreUnknown !== true ? false : true; // default to false
  options.respectType = sourceOptions.respectType === false ? false : true; // default to true
  options.respectFunctionNames = sourceOptions.respectFunctionNames === false ? false : true;
  options.respectFunctionProperties = sourceOptions.respectFunctionProperties === false ? false : true;
  options.unorderedArrays = sourceOptions.unorderedArrays !== true ? false : true; // default to false
  options.unorderedSets = sourceOptions.unorderedSets === false ? false : true; // default to false
  options.unorderedObjects = sourceOptions.unorderedObjects === false ? false : true; // default to true
  options.replacer = sourceOptions.replacer || undefined;
  options.excludeKeys = sourceOptions.excludeKeys || undefined;

  if(typeof object === 'undefined') {
    throw new Error('Object argument required.');
  }

  // if there is a case-insensitive match in the hashes list, accept it
  // (i.e. SHA256 for sha256)
  for (var i = 0; i < hashes.length; ++i) {
    if (hashes[i].toLowerCase() === options.algorithm.toLowerCase()) {
      options.algorithm = hashes[i];
    }
  }

  if(hashes.indexOf(options.algorithm) === -1){
    throw new Error('Algorithm "' + options.algorithm + '"  not supported. ' +
      'supported values: ' + hashes.join(', '));
  }

  if(encodings.indexOf(options.encoding) === -1 &&
     options.algorithm !== 'passthrough'){
    throw new Error('Encoding "' + options.encoding + '"  not supported. ' +
      'supported values: ' + encodings.join(', '));
  }

  return options;
}

/** Check if the given function is a native function */
function isNativeFunction(f) {
  if ((typeof f) !== 'function') {
    return false;
  }
  var exp = /^function\s+\w*\s*\(\s*\)\s*{\s+\[native code\]\s+}$/i;
  return exp.exec(Function.prototype.toString.call(f)) != null;
}

function hash(object, options) {
  var hashingStream;

  if (options.algorithm !== 'passthrough') {
    hashingStream = crypto.createHash(options.algorithm);
  } else {
    hashingStream = new PassThrough();
  }

  if (typeof hashingStream.write === 'undefined') {
    hashingStream.write = hashingStream.update;
    hashingStream.end   = hashingStream.update;
  }

  var hasher = typeHasher(options, hashingStream);
  hasher.dispatch(object);
  if (!hashingStream.update) {
    hashingStream.end('');
  }

  if (hashingStream.digest) {
    return hashingStream.digest(options.encoding === 'buffer' ? undefined : options.encoding);
  }

  var buf = hashingStream.read();
  if (options.encoding === 'buffer') {
    return buf;
  }

  return buf.toString(options.encoding);
}

/**
 * Expose streaming API
 *
 * @param {object} object  Value to serialize
 * @param {object} options  Options, as for hash()
 * @param {object} stream  A stream to write the serializiation to
 * @api public
 */
exports.writeToStream = function(object, options, stream) {
  if (typeof stream === 'undefined') {
    stream = options;
    options = {};
  }

  options = applyDefaults(object, options);

  return typeHasher(options, stream).dispatch(object);
};

function typeHasher(options, writeTo, context){
  context = context || [];
  var write = function(str) {
    if (writeTo.update) {
      return writeTo.update(str, 'utf8');
    } else {
      return writeTo.write(str, 'utf8');
    }
  };

  return {
    dispatch: function(value){
      if (options.replacer) {
        value = options.replacer(value);
      }

      var type = typeof value;
      if (value === null) {
        type = 'null';
      }

      //console.log("[DEBUG] Dispatch: ", value, "->", type, " -> ", "_" + type);

      return this['_' + type](value);
    },
    _object: function(object) {
      var pattern = (/\[object (.*)\]/i);
      var objString = Object.prototype.toString.call(object);
      var objType = pattern.exec(objString);
      if (!objType) { // object type did not match [object ...]
        objType = 'unknown:[' + objString + ']';
      } else {
        objType = objType[1]; // take only the class name
      }

      objType = objType.toLowerCase();

      var objectNumber = null;

      if ((objectNumber = context.indexOf(object)) >= 0) {
        return this.dispatch('[CIRCULAR:' + objectNumber + ']');
      } else {
        context.push(object);
      }

      if (typeof Buffer !== 'undefined' && Buffer.isBuffer && Buffer.isBuffer(object)) {
        write('buffer:');
        return write(object);
      }

      if(objType !== 'object' && objType !== 'function' && objType !== 'asyncfunction') {
        if(this['_' + objType]) {
          this['_' + objType](object);
        } else if (options.ignoreUnknown) {
          return write('[' + objType + ']');
        } else {
          throw new Error('Unknown object type "' + objType + '"');
        }
      }else{
        var keys = Object.keys(object);
        if (options.unorderedObjects) {
          keys = keys.sort();
        }
        // Make sure to incorporate special properties, so
        // Types with different prototypes will produce
        // a different hash and objects derived from
        // different functions (`new Foo`, `new Bar`) will
        // produce different hashes.
        // We never do this for native functions since some
        // seem to break because of that.
        if (options.respectType !== false && !isNativeFunction(object)) {
          keys.splice(0, 0, 'prototype', '__proto__', 'constructor');
        }

        if (options.excludeKeys) {
          keys = keys.filter(function(key) { return !options.excludeKeys(key); });
        }

        write('object:' + keys.length + ':');
        var self = this;
        return keys.forEach(function(key){
          self.dispatch(key);
          write(':');
          if(!options.excludeValues) {
            self.dispatch(object[key]);
          }
          write(',');
        });
      }
    },
    _array: function(arr, unordered){
      unordered = typeof unordered !== 'undefined' ? unordered :
        options.unorderedArrays !== false; // default to options.unorderedArrays

      var self = this;
      write('array:' + arr.length + ':');
      if (!unordered || arr.length <= 1) {
        return arr.forEach(function(entry) {
          return self.dispatch(entry);
        });
      }

      // the unordered case is a little more complicated:
      // since there is no canonical ordering on objects,
      // i.e. {a:1} < {a:2} and {a:1} > {a:2} are both false,
      // we first serialize each entry using a PassThrough stream
      // before sorting.
      // also: we can’t use the same context array for all entries
      // since the order of hashing should *not* matter. instead,
      // we keep track of the additions to a copy of the context array
      // and add all of them to the global context array when we’re done
      var contextAdditions = [];
      var entries = arr.map(function(entry) {
        var strm = new PassThrough();
        var localContext = context.slice(); // make copy
        var hasher = typeHasher(options, strm, localContext);
        hasher.dispatch(entry);
        // take only what was added to localContext and append it to contextAdditions
        contextAdditions = contextAdditions.concat(localContext.slice(context.length));
        return strm.read().toString();
      });
      context = context.concat(contextAdditions);
      entries.sort();
      return this._array(entries, false);
    },
    _date: function(date){
      return write('date:' + date.toJSON());
    },
    _symbol: function(sym){
      return write('symbol:' + sym.toString());
    },
    _error: function(err){
      return write('error:' + err.toString());
    },
    _boolean: function(bool){
      return write('bool:' + bool.toString());
    },
    _string: function(string){
      write('string:' + string.length + ':');
      write(string.toString());
    },
    _function: function(fn){
      write('fn:');
      if (isNativeFunction(fn)) {
        this.dispatch('[native]');
      } else {
        this.dispatch(fn.toString());
      }

      if (options.respectFunctionNames !== false) {
        // Make sure we can still distinguish native functions
        // by their name, otherwise String and Function will
        // have the same hash
        this.dispatch("function-name:" + String(fn.name));
      }

      if (options.respectFunctionProperties) {
        this._object(fn);
      }
    },
    _number: function(number){
      return write('number:' + number.toString());
    },
    _xml: function(xml){
      return write('xml:' + xml.toString());
    },
    _null: function() {
      return write('Null');
    },
    _undefined: function() {
      return write('Undefined');
    },
    _regexp: function(regex){
      return write('regex:' + regex.toString());
    },
    _uint8array: function(arr){
      write('uint8array:');
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    _uint8clampedarray: function(arr){
      write('uint8clampedarray:');
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    _int8array: function(arr){
      write('uint8array:');
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    _uint16array: function(arr){
      write('uint16array:');
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    _int16array: function(arr){
      write('uint16array:');
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    _uint32array: function(arr){
      write('uint32array:');
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    _int32array: function(arr){
      write('uint32array:');
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    _float32array: function(arr){
      write('float32array:');
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    _float64array: function(arr){
      write('float64array:');
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    _arraybuffer: function(arr){
      write('arraybuffer:');
      return this.dispatch(new Uint8Array(arr));
    },
    _url: function(url) {
      return write('url:' + url.toString(), 'utf8');
    },
    _map: function(map) {
      write('map:');
      var arr = Array.from(map);
      return this._array(arr, options.unorderedSets !== false);
    },
    _set: function(set) {
      write('set:');
      var arr = Array.from(set);
      return this._array(arr, options.unorderedSets !== false);
    },
    _blob: function() {
      if (options.ignoreUnknown) {
        return write('[blob]');
      }

      throw Error('Hashing Blob objects is currently not supported\n' +
        '(see https://github.com/puleos/object-hash/issues/26)\n' +
        'Use "options.replacer" or "options.ignoreUnknown"\n');
    },
    _domwindow: function() { return write('domwindow'); },
    /* Node.js standard native objects */
    _process: function() { return write('process'); },
    _timer: function() { return write('timer'); },
    _pipe: function() { return write('pipe'); },
    _tcp: function() { return write('tcp'); },
    _udp: function() { return write('udp'); },
    _tty: function() { return write('tty'); },
    _statwatcher: function() { return write('statwatcher'); },
    _securecontext: function() { return write('securecontext'); },
    _connection: function() { return write('connection'); },
    _zlib: function() { return write('zlib'); },
    _context: function() { return write('context'); },
    _nodescript: function() { return write('nodescript'); },
    _httpparser: function() { return write('httpparser'); },
    _dataview: function() { return write('dataview'); },
    _signal: function() { return write('signal'); },
    _fsevent: function() { return write('fsevent'); },
    _tlswrap: function() { return write('tlswrap'); }
  };
}

// Mini-implementation of stream.PassThrough
// We are far from having need for the full implementation, and we can
// make assumptions like "many writes, then only one final read"
// and we can ignore encoding specifics
function PassThrough() {
  return {
    buf: '',

    write: function(b) {
      this.buf += b;
    },

    end: function(b) {
      this.buf += b;
    },

    read: function() {
      return this.buf;
    }
  };
}


/***/ }),
/* 419 */,
/* 420 */,
/* 421 */,
/* 422 */
/***/ (function(module) {

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global global, define, System, Reflect, Promise */
var __extends;
var __assign;
var __rest;
var __decorate;
var __param;
var __metadata;
var __awaiter;
var __generator;
var __exportStar;
var __values;
var __read;
var __spread;
var __spreadArrays;
var __await;
var __asyncGenerator;
var __asyncDelegator;
var __asyncValues;
var __makeTemplateObject;
var __importStar;
var __importDefault;
(function (factory) {
    var root = typeof global === "object" ? global : typeof self === "object" ? self : typeof this === "object" ? this : {};
    if (typeof define === "function" && define.amd) {
        define("tslib", ["exports"], function (exports) { factory(createExporter(root, createExporter(exports))); });
    }
    else if ( true && typeof module.exports === "object") {
        factory(createExporter(root, createExporter(module.exports)));
    }
    else {
        factory(createExporter(root));
    }
    function createExporter(exports, previous) {
        if (exports !== root) {
            if (typeof Object.create === "function") {
                Object.defineProperty(exports, "__esModule", { value: true });
            }
            else {
                exports.__esModule = true;
            }
        }
        return function (id, v) { return exports[id] = previous ? previous(id, v) : v; };
    }
})
(function (exporter) {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

    __extends = function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };

    __assign = Object.assign || function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };

    __rest = function (s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    };

    __decorate = function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };

    __param = function (paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    };

    __metadata = function (metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    };

    __awaiter = function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };

    __generator = function (thisArg, body) {
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

    __exportStar = function (m, exports) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    };

    __values = function (o) {
        var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
        if (m) return m.call(o);
        return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
    };

    __read = function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };

    __spread = function () {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    };

    __spreadArrays = function () {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    };

    __await = function (v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    };

    __asyncGenerator = function (thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);  }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
    };

    __asyncDelegator = function (o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    };

    __asyncValues = function (o) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
    };

    __makeTemplateObject = function (cooked, raw) {
        if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
        return cooked;
    };

    __importStar = function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };

    __importDefault = function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };

    exporter("__extends", __extends);
    exporter("__assign", __assign);
    exporter("__rest", __rest);
    exporter("__decorate", __decorate);
    exporter("__param", __param);
    exporter("__metadata", __metadata);
    exporter("__awaiter", __awaiter);
    exporter("__generator", __generator);
    exporter("__exportStar", __exportStar);
    exporter("__values", __values);
    exporter("__read", __read);
    exporter("__spread", __spread);
    exporter("__spreadArrays", __spreadArrays);
    exporter("__await", __await);
    exporter("__asyncGenerator", __asyncGenerator);
    exporter("__asyncDelegator", __asyncDelegator);
    exporter("__asyncValues", __asyncValues);
    exporter("__makeTemplateObject", __makeTemplateObject);
    exporter("__importStar", __importStar);
    exporter("__importDefault", __importDefault);
});


/***/ }),
/* 423 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var getNative = __webpack_require__(319),
    root = __webpack_require__(824);

/* Built-in method references that are verified to be native. */
var Set = getNative(root, 'Set');

module.exports = Set;


/***/ }),
/* 424 */,
/* 425 */,
/* 426 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(422);
/**
 * @class
 * Class representing CustomAuthenticationProvider
 * @extends AuthenticationProvider
 */
var CustomAuthenticationProvider = /** @class */ (function () {
    /**
     * @public
     * @constructor
     * Creates an instance of CustomAuthenticationProvider
     * @param {AuthProviderCallback} provider - An authProvider function
     * @returns An instance of CustomAuthenticationProvider
     */
    function CustomAuthenticationProvider(provider) {
        this.provider = provider;
    }
    /**
     * @public
     * @async
     * To get the access token
     * @returns The promise that resolves to an access token
     */
    CustomAuthenticationProvider.prototype.getAccessToken = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.provider(function (error, accessToken) {
                            if (accessToken) {
                                resolve(accessToken);
                            }
                            else {
                                reject(error);
                            }
                        });
                    })];
            });
        });
    };
    return CustomAuthenticationProvider;
}());
exports.CustomAuthenticationProvider = CustomAuthenticationProvider;
//# sourceMappingURL=CustomAuthenticationProvider.js.map

/***/ }),
/* 427 */,
/* 428 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var baseToString = __webpack_require__(280);

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

module.exports = toString;


/***/ }),
/* 429 */,
/* 430 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var apply = __webpack_require__(512);

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * A specialized version of `baseRest` which transforms the rest array.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @param {Function} transform The rest array transform.
 * @returns {Function} Returns the new function.
 */
function overRest(func, start, transform) {
  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = transform(array);
    return apply(func, this, otherArgs);
  };
}

module.exports = overRest;


/***/ }),
/* 431 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const os = __webpack_require__(87);
/**
 * Commands
 *
 * Command Format:
 *   ##[name key=value;key=value]message
 *
 * Examples:
 *   ##[warning]This is the user warning message
 *   ##[set-secret name=mypassword]definitelyNotAPassword!
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        // safely append the val - avoid blowing up when attempting to
                        // call .replace() if message is not a string for some reason
                        cmdStr += `${key}=${escape(`${val || ''}`)},`;
                    }
                }
            }
        }
        cmdStr += CMD_STRING;
        // safely append the message - avoid blowing up when attempting to
        // call .replace() if message is not a string for some reason
        const message = `${this.message || ''}`;
        cmdStr += escapeData(message);
        return cmdStr;
    }
}
function escapeData(s) {
    return s.replace(/\r/g, '%0D').replace(/\n/g, '%0A');
}
function escape(s) {
    return s
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/]/g, '%5D')
        .replace(/;/g, '%3B');
}
//# sourceMappingURL=command.js.map

/***/ }),
/* 432 */,
/* 433 */
/***/ (function(module) {

"use strict";


module.exports = [
	'beforeError',
	'init',
	'beforeRequest',
	'beforeRedirect',
	'beforeRetry',
	'afterResponse'
];


/***/ }),
/* 434 */
/***/ (function(module) {

const minute = 60
const hour = minute * 60
const day = hour * 24
const week = day * 7
const year = day * 365.25

const REGEX = /^(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)$/i

module.exports = (str) => {
  const matched = REGEX.exec(str)

  if (!matched) {
    throw new TypeError(`invalid time period format ("${str}")`)
  }

  const value = parseFloat(matched[1])
  const unit = matched[2].toLowerCase()

  switch (unit) {
    case 'sec':
    case 'secs':
    case 'second':
    case 'seconds':
    case 's':
      return Math.round(value)
    case 'minute':
    case 'minutes':
    case 'min':
    case 'mins':
    case 'm':
      return Math.round(value * minute)
    case 'hour':
    case 'hours':
    case 'hr':
    case 'hrs':
    case 'h':
      return Math.round(value * hour)
    case 'day':
    case 'days':
    case 'd':
      return Math.round(value * day)
    case 'week':
    case 'weeks':
    case 'w':
      return Math.round(value * week)
    case 'year':
    case 'years':
    case 'yr':
    case 'yrs':
    case 'y':
      return Math.round(value * year)
  }
}


/***/ }),
/* 435 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const is = __webpack_require__(534);

module.exports = url => {
	const options = {
		protocol: url.protocol,
		hostname: url.hostname.startsWith('[') ? url.hostname.slice(1, -1) : url.hostname,
		hash: url.hash,
		search: url.search,
		pathname: url.pathname,
		href: url.href
	};

	if (is.string(url.port) && url.port.length > 0) {
		options.port = Number(url.port);
	}

	if (url.username || url.password) {
		options.auth = `${url.username}:${url.password}`;
	}

	options.path = is.null(url.search) ? url.pathname : `${url.pathname}${url.search}`;

	return options;
};


/***/ }),
/* 436 */,
/* 437 */,
/* 438 */
/***/ (function(module) {

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

module.exports = setToArray;


/***/ }),
/* 439 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var cloneArrayBuffer = __webpack_require__(600);

/**
 * Creates a clone of `typedArray`.
 *
 * @private
 * @param {Object} typedArray The typed array to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned typed array.
 */
function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}

module.exports = cloneTypedArray;


/***/ }),
/* 440 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var memoizeCapped = __webpack_require__(138);

/** Used to match property names within property paths. */
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

/** Used to match backslashes in property paths. */
var reEscapeChar = /\\(\\)?/g;

/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
var stringToPath = memoizeCapped(function(string) {
  var result = [];
  if (string.charCodeAt(0) === 46 /* . */) {
    result.push('');
  }
  string.replace(rePropName, function(match, number, quote, subString) {
    result.push(quote ? subString.replace(reEscapeChar, '$1') : (number || match));
  });
  return result;
});

module.exports = stringToPath;


/***/ }),
/* 441 */,
/* 442 */,
/* 443 */,
/* 444 */,
/* 445 */,
/* 446 */,
/* 447 */,
/* 448 */,
/* 449 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { getCurves } = __webpack_require__(417)

const { name: secp256k1 } = __webpack_require__(997)

const curves = new Set()

if (getCurves().includes('prime256v1')) {
  curves.add('P-256')
}

if (getCurves().includes('secp256k1')) {
  curves.add(secp256k1)
}

if (getCurves().includes('secp384r1')) {
  curves.add('P-384')
}

if (getCurves().includes('secp521r1')) {
  curves.add('P-521')
}

module.exports = curves


/***/ }),
/* 450 */
/***/ (function(__unusedmodule, exports) {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
// THIS FILE IS AUTO GENERATED
// ANY CHANGES WILL BE LOST DURING BUILD
/**
 * @module Version
 */
exports.PACKAGE_VERSION = "2.0.0";
//# sourceMappingURL=Version.js.map

/***/ }),
/* 451 */
/***/ (function(module) {

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

module.exports = stubFalse;


/***/ }),
/* 452 */,
/* 453 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var once = __webpack_require__(49)
var eos = __webpack_require__(9)
var fs = __webpack_require__(747) // we only need fs to get the ReadStream and WriteStream prototypes

var noop = function () {}
var ancient = /^v?\.0/.test(process.version)

var isFn = function (fn) {
  return typeof fn === 'function'
}

var isFS = function (stream) {
  if (!ancient) return false // newer node version do not need to care about fs is a special way
  if (!fs) return false // browser
  return (stream instanceof (fs.ReadStream || noop) || stream instanceof (fs.WriteStream || noop)) && isFn(stream.close)
}

var isRequest = function (stream) {
  return stream.setHeader && isFn(stream.abort)
}

var destroyer = function (stream, reading, writing, callback) {
  callback = once(callback)

  var closed = false
  stream.on('close', function () {
    closed = true
  })

  eos(stream, {readable: reading, writable: writing}, function (err) {
    if (err) return callback(err)
    closed = true
    callback()
  })

  var destroyed = false
  return function (err) {
    if (closed) return
    if (destroyed) return
    destroyed = true

    if (isFS(stream)) return stream.close(noop) // use close for fs streams to avoid fd leaks
    if (isRequest(stream)) return stream.abort() // request.destroy just do .end - .abort is what we want

    if (isFn(stream.destroy)) return stream.destroy()

    callback(err || new Error('stream was destroyed'))
  }
}

var call = function (fn) {
  fn()
}

var pipe = function (from, to) {
  return from.pipe(to)
}

var pump = function () {
  var streams = Array.prototype.slice.call(arguments)
  var callback = isFn(streams[streams.length - 1] || noop) && streams.pop() || noop

  if (Array.isArray(streams[0])) streams = streams[0]
  if (streams.length < 2) throw new Error('pump requires two streams per minimum')

  var error
  var destroys = streams.map(function (stream, i) {
    var reading = i < streams.length - 1
    var writing = i > 0
    return destroyer(stream, reading, writing, function (err) {
      if (!error) error = err
      if (err) destroys.forEach(call)
      if (reading) return
      destroys.forEach(call)
      callback(error)
    })
  })

  return streams.reduce(pipe)
}

module.exports = pump


/***/ }),
/* 454 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Stream = _interopDefault(__webpack_require__(413));
var http = _interopDefault(__webpack_require__(605));
var Url = _interopDefault(__webpack_require__(835));
var https = _interopDefault(__webpack_require__(211));
var zlib = _interopDefault(__webpack_require__(761));

// Based on https://github.com/tmpvar/jsdom/blob/aa85b2abf07766ff7bf5c1f6daafb3726f2f2db5/lib/jsdom/living/blob.js

// fix for "Readable" isn't a named export issue
const Readable = Stream.Readable;

const BUFFER = Symbol('buffer');
const TYPE = Symbol('type');

class Blob {
	constructor() {
		this[TYPE] = '';

		const blobParts = arguments[0];
		const options = arguments[1];

		const buffers = [];
		let size = 0;

		if (blobParts) {
			const a = blobParts;
			const length = Number(a.length);
			for (let i = 0; i < length; i++) {
				const element = a[i];
				let buffer;
				if (element instanceof Buffer) {
					buffer = element;
				} else if (ArrayBuffer.isView(element)) {
					buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
				} else if (element instanceof ArrayBuffer) {
					buffer = Buffer.from(element);
				} else if (element instanceof Blob) {
					buffer = element[BUFFER];
				} else {
					buffer = Buffer.from(typeof element === 'string' ? element : String(element));
				}
				size += buffer.length;
				buffers.push(buffer);
			}
		}

		this[BUFFER] = Buffer.concat(buffers);

		let type = options && options.type !== undefined && String(options.type).toLowerCase();
		if (type && !/[^\u0020-\u007E]/.test(type)) {
			this[TYPE] = type;
		}
	}
	get size() {
		return this[BUFFER].length;
	}
	get type() {
		return this[TYPE];
	}
	text() {
		return Promise.resolve(this[BUFFER].toString());
	}
	arrayBuffer() {
		const buf = this[BUFFER];
		const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		return Promise.resolve(ab);
	}
	stream() {
		const readable = new Readable();
		readable._read = function () {};
		readable.push(this[BUFFER]);
		readable.push(null);
		return readable;
	}
	toString() {
		return '[object Blob]';
	}
	slice() {
		const size = this.size;

		const start = arguments[0];
		const end = arguments[1];
		let relativeStart, relativeEnd;
		if (start === undefined) {
			relativeStart = 0;
		} else if (start < 0) {
			relativeStart = Math.max(size + start, 0);
		} else {
			relativeStart = Math.min(start, size);
		}
		if (end === undefined) {
			relativeEnd = size;
		} else if (end < 0) {
			relativeEnd = Math.max(size + end, 0);
		} else {
			relativeEnd = Math.min(end, size);
		}
		const span = Math.max(relativeEnd - relativeStart, 0);

		const buffer = this[BUFFER];
		const slicedBuffer = buffer.slice(relativeStart, relativeStart + span);
		const blob = new Blob([], { type: arguments[2] });
		blob[BUFFER] = slicedBuffer;
		return blob;
	}
}

Object.defineProperties(Blob.prototype, {
	size: { enumerable: true },
	type: { enumerable: true },
	slice: { enumerable: true }
});

Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
	value: 'Blob',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * fetch-error.js
 *
 * FetchError interface for operational errors
 */

/**
 * Create FetchError instance
 *
 * @param   String      message      Error message for human
 * @param   String      type         Error type for machine
 * @param   String      systemError  For Node.js system error
 * @return  FetchError
 */
function FetchError(message, type, systemError) {
  Error.call(this, message);

  this.message = message;
  this.type = type;

  // when err.type is `system`, err.code contains system error code
  if (systemError) {
    this.code = this.errno = systemError.code;
  }

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

FetchError.prototype = Object.create(Error.prototype);
FetchError.prototype.constructor = FetchError;
FetchError.prototype.name = 'FetchError';

let convert;
try {
	convert = __webpack_require__(18).convert;
} catch (e) {}

const INTERNALS = Symbol('Body internals');

// fix an issue where "PassThrough" isn't a named export for node <10
const PassThrough = Stream.PassThrough;

/**
 * Body mixin
 *
 * Ref: https://fetch.spec.whatwg.org/#body
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
function Body(body) {
	var _this = this;

	var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	    _ref$size = _ref.size;

	let size = _ref$size === undefined ? 0 : _ref$size;
	var _ref$timeout = _ref.timeout;
	let timeout = _ref$timeout === undefined ? 0 : _ref$timeout;

	if (body == null) {
		// body is undefined or null
		body = null;
	} else if (isURLSearchParams(body)) {
		// body is a URLSearchParams
		body = Buffer.from(body.toString());
	} else if (isBlob(body)) ; else if (Buffer.isBuffer(body)) ; else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is ArrayBuffer
		body = Buffer.from(body);
	} else if (ArrayBuffer.isView(body)) {
		// body is ArrayBufferView
		body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
	} else if (body instanceof Stream) ; else {
		// none of the above
		// coerce to string then buffer
		body = Buffer.from(String(body));
	}
	this[INTERNALS] = {
		body,
		disturbed: false,
		error: null
	};
	this.size = size;
	this.timeout = timeout;

	if (body instanceof Stream) {
		body.on('error', function (err) {
			const error = err.name === 'AbortError' ? err : new FetchError(`Invalid response body while trying to fetch ${_this.url}: ${err.message}`, 'system', err);
			_this[INTERNALS].error = error;
		});
	}
}

Body.prototype = {
	get body() {
		return this[INTERNALS].body;
	},

	get bodyUsed() {
		return this[INTERNALS].disturbed;
	},

	/**
  * Decode response as ArrayBuffer
  *
  * @return  Promise
  */
	arrayBuffer() {
		return consumeBody.call(this).then(function (buf) {
			return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		});
	},

	/**
  * Return raw response as Blob
  *
  * @return Promise
  */
	blob() {
		let ct = this.headers && this.headers.get('content-type') || '';
		return consumeBody.call(this).then(function (buf) {
			return Object.assign(
			// Prevent copying
			new Blob([], {
				type: ct.toLowerCase()
			}), {
				[BUFFER]: buf
			});
		});
	},

	/**
  * Decode response as json
  *
  * @return  Promise
  */
	json() {
		var _this2 = this;

		return consumeBody.call(this).then(function (buffer) {
			try {
				return JSON.parse(buffer.toString());
			} catch (err) {
				return Body.Promise.reject(new FetchError(`invalid json response body at ${_this2.url} reason: ${err.message}`, 'invalid-json'));
			}
		});
	},

	/**
  * Decode response as text
  *
  * @return  Promise
  */
	text() {
		return consumeBody.call(this).then(function (buffer) {
			return buffer.toString();
		});
	},

	/**
  * Decode response as buffer (non-spec api)
  *
  * @return  Promise
  */
	buffer() {
		return consumeBody.call(this);
	},

	/**
  * Decode response as text, while automatically detecting the encoding and
  * trying to decode to UTF-8 (non-spec api)
  *
  * @return  Promise
  */
	textConverted() {
		var _this3 = this;

		return consumeBody.call(this).then(function (buffer) {
			return convertBody(buffer, _this3.headers);
		});
	}
};

// In browsers, all properties are enumerable.
Object.defineProperties(Body.prototype, {
	body: { enumerable: true },
	bodyUsed: { enumerable: true },
	arrayBuffer: { enumerable: true },
	blob: { enumerable: true },
	json: { enumerable: true },
	text: { enumerable: true }
});

Body.mixIn = function (proto) {
	for (const name of Object.getOwnPropertyNames(Body.prototype)) {
		// istanbul ignore else: future proof
		if (!(name in proto)) {
			const desc = Object.getOwnPropertyDescriptor(Body.prototype, name);
			Object.defineProperty(proto, name, desc);
		}
	}
};

/**
 * Consume and convert an entire Body to a Buffer.
 *
 * Ref: https://fetch.spec.whatwg.org/#concept-body-consume-body
 *
 * @return  Promise
 */
function consumeBody() {
	var _this4 = this;

	if (this[INTERNALS].disturbed) {
		return Body.Promise.reject(new TypeError(`body used already for: ${this.url}`));
	}

	this[INTERNALS].disturbed = true;

	if (this[INTERNALS].error) {
		return Body.Promise.reject(this[INTERNALS].error);
	}

	let body = this.body;

	// body is null
	if (body === null) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is blob
	if (isBlob(body)) {
		body = body.stream();
	}

	// body is buffer
	if (Buffer.isBuffer(body)) {
		return Body.Promise.resolve(body);
	}

	// istanbul ignore if: should never happen
	if (!(body instanceof Stream)) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is stream
	// get ready to actually consume the body
	let accum = [];
	let accumBytes = 0;
	let abort = false;

	return new Body.Promise(function (resolve, reject) {
		let resTimeout;

		// allow timeout on slow response body
		if (_this4.timeout) {
			resTimeout = setTimeout(function () {
				abort = true;
				reject(new FetchError(`Response timeout while trying to fetch ${_this4.url} (over ${_this4.timeout}ms)`, 'body-timeout'));
			}, _this4.timeout);
		}

		// handle stream errors
		body.on('error', function (err) {
			if (err.name === 'AbortError') {
				// if the request was aborted, reject with this Error
				abort = true;
				reject(err);
			} else {
				// other errors, such as incorrect content-encoding
				reject(new FetchError(`Invalid response body while trying to fetch ${_this4.url}: ${err.message}`, 'system', err));
			}
		});

		body.on('data', function (chunk) {
			if (abort || chunk === null) {
				return;
			}

			if (_this4.size && accumBytes + chunk.length > _this4.size) {
				abort = true;
				reject(new FetchError(`content size at ${_this4.url} over limit: ${_this4.size}`, 'max-size'));
				return;
			}

			accumBytes += chunk.length;
			accum.push(chunk);
		});

		body.on('end', function () {
			if (abort) {
				return;
			}

			clearTimeout(resTimeout);

			try {
				resolve(Buffer.concat(accum, accumBytes));
			} catch (err) {
				// handle streams that have accumulated too much data (issue #414)
				reject(new FetchError(`Could not create Buffer from response body for ${_this4.url}: ${err.message}`, 'system', err));
			}
		});
	});
}

/**
 * Detect buffer encoding and convert to target encoding
 * ref: http://www.w3.org/TR/2011/WD-html5-20110113/parsing.html#determining-the-character-encoding
 *
 * @param   Buffer  buffer    Incoming buffer
 * @param   String  encoding  Target encoding
 * @return  String
 */
function convertBody(buffer, headers) {
	if (typeof convert !== 'function') {
		throw new Error('The package `encoding` must be installed to use the textConverted() function');
	}

	const ct = headers.get('content-type');
	let charset = 'utf-8';
	let res, str;

	// header
	if (ct) {
		res = /charset=([^;]*)/i.exec(ct);
	}

	// no charset in content type, peek at response body for at most 1024 bytes
	str = buffer.slice(0, 1024).toString();

	// html5
	if (!res && str) {
		res = /<meta.+?charset=(['"])(.+?)\1/i.exec(str);
	}

	// html4
	if (!res && str) {
		res = /<meta[\s]+?http-equiv=(['"])content-type\1[\s]+?content=(['"])(.+?)\2/i.exec(str);

		if (res) {
			res = /charset=(.*)/i.exec(res.pop());
		}
	}

	// xml
	if (!res && str) {
		res = /<\?xml.+?encoding=(['"])(.+?)\1/i.exec(str);
	}

	// found charset
	if (res) {
		charset = res.pop();

		// prevent decode issues when sites use incorrect encoding
		// ref: https://hsivonen.fi/encoding-menu/
		if (charset === 'gb2312' || charset === 'gbk') {
			charset = 'gb18030';
		}
	}

	// turn raw buffers into a single utf-8 buffer
	return convert(buffer, 'UTF-8', charset).toString();
}

/**
 * Detect a URLSearchParams object
 * ref: https://github.com/bitinn/node-fetch/issues/296#issuecomment-307598143
 *
 * @param   Object  obj     Object to detect by type or brand
 * @return  String
 */
function isURLSearchParams(obj) {
	// Duck-typing as a necessary condition.
	if (typeof obj !== 'object' || typeof obj.append !== 'function' || typeof obj.delete !== 'function' || typeof obj.get !== 'function' || typeof obj.getAll !== 'function' || typeof obj.has !== 'function' || typeof obj.set !== 'function') {
		return false;
	}

	// Brand-checking and more duck-typing as optional condition.
	return obj.constructor.name === 'URLSearchParams' || Object.prototype.toString.call(obj) === '[object URLSearchParams]' || typeof obj.sort === 'function';
}

/**
 * Check if `obj` is a W3C `Blob` object (which `File` inherits from)
 * @param  {*} obj
 * @return {boolean}
 */
function isBlob(obj) {
	return typeof obj === 'object' && typeof obj.arrayBuffer === 'function' && typeof obj.type === 'string' && typeof obj.stream === 'function' && typeof obj.constructor === 'function' && typeof obj.constructor.name === 'string' && /^(Blob|File)$/.test(obj.constructor.name) && /^(Blob|File)$/.test(obj[Symbol.toStringTag]);
}

/**
 * Clone body given Res/Req instance
 *
 * @param   Mixed  instance  Response or Request instance
 * @return  Mixed
 */
function clone(instance) {
	let p1, p2;
	let body = instance.body;

	// don't allow cloning a used body
	if (instance.bodyUsed) {
		throw new Error('cannot clone body after it is used');
	}

	// check that body is a stream and not form-data object
	// note: we can't clone the form-data object without having it as a dependency
	if (body instanceof Stream && typeof body.getBoundary !== 'function') {
		// tee instance body
		p1 = new PassThrough();
		p2 = new PassThrough();
		body.pipe(p1);
		body.pipe(p2);
		// set instance body to teed body and return the other teed body
		instance[INTERNALS].body = p1;
		body = p2;
	}

	return body;
}

/**
 * Performs the operation "extract a `Content-Type` value from |object|" as
 * specified in the specification:
 * https://fetch.spec.whatwg.org/#concept-bodyinit-extract
 *
 * This function assumes that instance.body is present.
 *
 * @param   Mixed  instance  Any options.body input
 */
function extractContentType(body) {
	if (body === null) {
		// body is null
		return null;
	} else if (typeof body === 'string') {
		// body is string
		return 'text/plain;charset=UTF-8';
	} else if (isURLSearchParams(body)) {
		// body is a URLSearchParams
		return 'application/x-www-form-urlencoded;charset=UTF-8';
	} else if (isBlob(body)) {
		// body is blob
		return body.type || null;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return null;
	} else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is ArrayBuffer
		return null;
	} else if (ArrayBuffer.isView(body)) {
		// body is ArrayBufferView
		return null;
	} else if (typeof body.getBoundary === 'function') {
		// detect form data input from form-data module
		return `multipart/form-data;boundary=${body.getBoundary()}`;
	} else if (body instanceof Stream) {
		// body is stream
		// can't really do much about this
		return null;
	} else {
		// Body constructor defaults other things to string
		return 'text/plain;charset=UTF-8';
	}
}

/**
 * The Fetch Standard treats this as if "total bytes" is a property on the body.
 * For us, we have to explicitly get it with a function.
 *
 * ref: https://fetch.spec.whatwg.org/#concept-body-total-bytes
 *
 * @param   Body    instance   Instance of Body
 * @return  Number?            Number of bytes, or null if not possible
 */
function getTotalBytes(instance) {
	const body = instance.body;


	if (body === null) {
		// body is null
		return 0;
	} else if (isBlob(body)) {
		return body.size;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return body.length;
	} else if (body && typeof body.getLengthSync === 'function') {
		// detect form data input from form-data module
		if (body._lengthRetrievers && body._lengthRetrievers.length == 0 || // 1.x
		body.hasKnownLength && body.hasKnownLength()) {
			// 2.x
			return body.getLengthSync();
		}
		return null;
	} else {
		// body is stream
		return null;
	}
}

/**
 * Write a Body to a Node.js WritableStream (e.g. http.Request) object.
 *
 * @param   Body    instance   Instance of Body
 * @return  Void
 */
function writeToStream(dest, instance) {
	const body = instance.body;


	if (body === null) {
		// body is null
		dest.end();
	} else if (isBlob(body)) {
		body.stream().pipe(dest);
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		dest.write(body);
		dest.end();
	} else {
		// body is stream
		body.pipe(dest);
	}
}

// expose Promise
Body.Promise = global.Promise;

/**
 * headers.js
 *
 * Headers class offers convenient helpers
 */

const invalidTokenRegex = /[^\^_`a-zA-Z\-0-9!#$%&'*+.|~]/;
const invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/;

function validateName(name) {
	name = `${name}`;
	if (invalidTokenRegex.test(name) || name === '') {
		throw new TypeError(`${name} is not a legal HTTP header name`);
	}
}

function validateValue(value) {
	value = `${value}`;
	if (invalidHeaderCharRegex.test(value)) {
		throw new TypeError(`${value} is not a legal HTTP header value`);
	}
}

/**
 * Find the key in the map object given a header name.
 *
 * Returns undefined if not found.
 *
 * @param   String  name  Header name
 * @return  String|Undefined
 */
function find(map, name) {
	name = name.toLowerCase();
	for (const key in map) {
		if (key.toLowerCase() === name) {
			return key;
		}
	}
	return undefined;
}

const MAP = Symbol('map');
class Headers {
	/**
  * Headers class
  *
  * @param   Object  headers  Response headers
  * @return  Void
  */
	constructor() {
		let init = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

		this[MAP] = Object.create(null);

		if (init instanceof Headers) {
			const rawHeaders = init.raw();
			const headerNames = Object.keys(rawHeaders);

			for (const headerName of headerNames) {
				for (const value of rawHeaders[headerName]) {
					this.append(headerName, value);
				}
			}

			return;
		}

		// We don't worry about converting prop to ByteString here as append()
		// will handle it.
		if (init == null) ; else if (typeof init === 'object') {
			const method = init[Symbol.iterator];
			if (method != null) {
				if (typeof method !== 'function') {
					throw new TypeError('Header pairs must be iterable');
				}

				// sequence<sequence<ByteString>>
				// Note: per spec we have to first exhaust the lists then process them
				const pairs = [];
				for (const pair of init) {
					if (typeof pair !== 'object' || typeof pair[Symbol.iterator] !== 'function') {
						throw new TypeError('Each header pair must be iterable');
					}
					pairs.push(Array.from(pair));
				}

				for (const pair of pairs) {
					if (pair.length !== 2) {
						throw new TypeError('Each header pair must be a name/value tuple');
					}
					this.append(pair[0], pair[1]);
				}
			} else {
				// record<ByteString, ByteString>
				for (const key of Object.keys(init)) {
					const value = init[key];
					this.append(key, value);
				}
			}
		} else {
			throw new TypeError('Provided initializer must be an object');
		}
	}

	/**
  * Return combined header value given name
  *
  * @param   String  name  Header name
  * @return  Mixed
  */
	get(name) {
		name = `${name}`;
		validateName(name);
		const key = find(this[MAP], name);
		if (key === undefined) {
			return null;
		}

		return this[MAP][key].join(', ');
	}

	/**
  * Iterate over all headers
  *
  * @param   Function  callback  Executed for each item with parameters (value, name, thisArg)
  * @param   Boolean   thisArg   `this` context for callback function
  * @return  Void
  */
	forEach(callback) {
		let thisArg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

		let pairs = getHeaders(this);
		let i = 0;
		while (i < pairs.length) {
			var _pairs$i = pairs[i];
			const name = _pairs$i[0],
			      value = _pairs$i[1];

			callback.call(thisArg, value, name, this);
			pairs = getHeaders(this);
			i++;
		}
	}

	/**
  * Overwrite header values given name
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	set(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find(this[MAP], name);
		this[MAP][key !== undefined ? key : name] = [value];
	}

	/**
  * Append a value onto existing header
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	append(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find(this[MAP], name);
		if (key !== undefined) {
			this[MAP][key].push(value);
		} else {
			this[MAP][name] = [value];
		}
	}

	/**
  * Check for header name existence
  *
  * @param   String   name  Header name
  * @return  Boolean
  */
	has(name) {
		name = `${name}`;
		validateName(name);
		return find(this[MAP], name) !== undefined;
	}

	/**
  * Delete all header values given name
  *
  * @param   String  name  Header name
  * @return  Void
  */
	delete(name) {
		name = `${name}`;
		validateName(name);
		const key = find(this[MAP], name);
		if (key !== undefined) {
			delete this[MAP][key];
		}
	}

	/**
  * Return raw headers (non-spec api)
  *
  * @return  Object
  */
	raw() {
		return this[MAP];
	}

	/**
  * Get an iterator on keys.
  *
  * @return  Iterator
  */
	keys() {
		return createHeadersIterator(this, 'key');
	}

	/**
  * Get an iterator on values.
  *
  * @return  Iterator
  */
	values() {
		return createHeadersIterator(this, 'value');
	}

	/**
  * Get an iterator on entries.
  *
  * This is the default iterator of the Headers object.
  *
  * @return  Iterator
  */
	[Symbol.iterator]() {
		return createHeadersIterator(this, 'key+value');
	}
}
Headers.prototype.entries = Headers.prototype[Symbol.iterator];

Object.defineProperty(Headers.prototype, Symbol.toStringTag, {
	value: 'Headers',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Headers.prototype, {
	get: { enumerable: true },
	forEach: { enumerable: true },
	set: { enumerable: true },
	append: { enumerable: true },
	has: { enumerable: true },
	delete: { enumerable: true },
	keys: { enumerable: true },
	values: { enumerable: true },
	entries: { enumerable: true }
});

function getHeaders(headers) {
	let kind = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'key+value';

	const keys = Object.keys(headers[MAP]).sort();
	return keys.map(kind === 'key' ? function (k) {
		return k.toLowerCase();
	} : kind === 'value' ? function (k) {
		return headers[MAP][k].join(', ');
	} : function (k) {
		return [k.toLowerCase(), headers[MAP][k].join(', ')];
	});
}

const INTERNAL = Symbol('internal');

function createHeadersIterator(target, kind) {
	const iterator = Object.create(HeadersIteratorPrototype);
	iterator[INTERNAL] = {
		target,
		kind,
		index: 0
	};
	return iterator;
}

const HeadersIteratorPrototype = Object.setPrototypeOf({
	next() {
		// istanbul ignore if
		if (!this || Object.getPrototypeOf(this) !== HeadersIteratorPrototype) {
			throw new TypeError('Value of `this` is not a HeadersIterator');
		}

		var _INTERNAL = this[INTERNAL];
		const target = _INTERNAL.target,
		      kind = _INTERNAL.kind,
		      index = _INTERNAL.index;

		const values = getHeaders(target, kind);
		const len = values.length;
		if (index >= len) {
			return {
				value: undefined,
				done: true
			};
		}

		this[INTERNAL].index = index + 1;

		return {
			value: values[index],
			done: false
		};
	}
}, Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]())));

Object.defineProperty(HeadersIteratorPrototype, Symbol.toStringTag, {
	value: 'HeadersIterator',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * Export the Headers object in a form that Node.js can consume.
 *
 * @param   Headers  headers
 * @return  Object
 */
function exportNodeCompatibleHeaders(headers) {
	const obj = Object.assign({ __proto__: null }, headers[MAP]);

	// http.request() only supports string as Host header. This hack makes
	// specifying custom Host header possible.
	const hostHeaderKey = find(headers[MAP], 'Host');
	if (hostHeaderKey !== undefined) {
		obj[hostHeaderKey] = obj[hostHeaderKey][0];
	}

	return obj;
}

/**
 * Create a Headers object from an object of headers, ignoring those that do
 * not conform to HTTP grammar productions.
 *
 * @param   Object  obj  Object of headers
 * @return  Headers
 */
function createHeadersLenient(obj) {
	const headers = new Headers();
	for (const name of Object.keys(obj)) {
		if (invalidTokenRegex.test(name)) {
			continue;
		}
		if (Array.isArray(obj[name])) {
			for (const val of obj[name]) {
				if (invalidHeaderCharRegex.test(val)) {
					continue;
				}
				if (headers[MAP][name] === undefined) {
					headers[MAP][name] = [val];
				} else {
					headers[MAP][name].push(val);
				}
			}
		} else if (!invalidHeaderCharRegex.test(obj[name])) {
			headers[MAP][name] = [obj[name]];
		}
	}
	return headers;
}

const INTERNALS$1 = Symbol('Response internals');

// fix an issue where "STATUS_CODES" aren't a named export for node <10
const STATUS_CODES = http.STATUS_CODES;

/**
 * Response class
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
class Response {
	constructor() {
		let body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
		let opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		Body.call(this, body, opts);

		const status = opts.status || 200;
		const headers = new Headers(opts.headers);

		if (body != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(body);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		this[INTERNALS$1] = {
			url: opts.url,
			status,
			statusText: opts.statusText || STATUS_CODES[status],
			headers,
			counter: opts.counter
		};
	}

	get url() {
		return this[INTERNALS$1].url || '';
	}

	get status() {
		return this[INTERNALS$1].status;
	}

	/**
  * Convenience property representing if the request ended normally
  */
	get ok() {
		return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
	}

	get redirected() {
		return this[INTERNALS$1].counter > 0;
	}

	get statusText() {
		return this[INTERNALS$1].statusText;
	}

	get headers() {
		return this[INTERNALS$1].headers;
	}

	/**
  * Clone this response
  *
  * @return  Response
  */
	clone() {
		return new Response(clone(this), {
			url: this.url,
			status: this.status,
			statusText: this.statusText,
			headers: this.headers,
			ok: this.ok,
			redirected: this.redirected
		});
	}
}

Body.mixIn(Response.prototype);

Object.defineProperties(Response.prototype, {
	url: { enumerable: true },
	status: { enumerable: true },
	ok: { enumerable: true },
	redirected: { enumerable: true },
	statusText: { enumerable: true },
	headers: { enumerable: true },
	clone: { enumerable: true }
});

Object.defineProperty(Response.prototype, Symbol.toStringTag, {
	value: 'Response',
	writable: false,
	enumerable: false,
	configurable: true
});

const INTERNALS$2 = Symbol('Request internals');

// fix an issue where "format", "parse" aren't a named export for node <10
const parse_url = Url.parse;
const format_url = Url.format;

const streamDestructionSupported = 'destroy' in Stream.Readable.prototype;

/**
 * Check if a value is an instance of Request.
 *
 * @param   Mixed   input
 * @return  Boolean
 */
function isRequest(input) {
	return typeof input === 'object' && typeof input[INTERNALS$2] === 'object';
}

function isAbortSignal(signal) {
	const proto = signal && typeof signal === 'object' && Object.getPrototypeOf(signal);
	return !!(proto && proto.constructor.name === 'AbortSignal');
}

/**
 * Request class
 *
 * @param   Mixed   input  Url or Request instance
 * @param   Object  init   Custom options
 * @return  Void
 */
class Request {
	constructor(input) {
		let init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		let parsedURL;

		// normalize input
		if (!isRequest(input)) {
			if (input && input.href) {
				// in order to support Node.js' Url objects; though WHATWG's URL objects
				// will fall into this branch also (since their `toString()` will return
				// `href` property anyway)
				parsedURL = parse_url(input.href);
			} else {
				// coerce input to a string before attempting to parse
				parsedURL = parse_url(`${input}`);
			}
			input = {};
		} else {
			parsedURL = parse_url(input.url);
		}

		let method = init.method || input.method || 'GET';
		method = method.toUpperCase();

		if ((init.body != null || isRequest(input) && input.body !== null) && (method === 'GET' || method === 'HEAD')) {
			throw new TypeError('Request with GET/HEAD method cannot have body');
		}

		let inputBody = init.body != null ? init.body : isRequest(input) && input.body !== null ? clone(input) : null;

		Body.call(this, inputBody, {
			timeout: init.timeout || input.timeout || 0,
			size: init.size || input.size || 0
		});

		const headers = new Headers(init.headers || input.headers || {});

		if (inputBody != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(inputBody);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		let signal = isRequest(input) ? input.signal : null;
		if ('signal' in init) signal = init.signal;

		if (signal != null && !isAbortSignal(signal)) {
			throw new TypeError('Expected signal to be an instanceof AbortSignal');
		}

		this[INTERNALS$2] = {
			method,
			redirect: init.redirect || input.redirect || 'follow',
			headers,
			parsedURL,
			signal
		};

		// node-fetch-only options
		this.follow = init.follow !== undefined ? init.follow : input.follow !== undefined ? input.follow : 20;
		this.compress = init.compress !== undefined ? init.compress : input.compress !== undefined ? input.compress : true;
		this.counter = init.counter || input.counter || 0;
		this.agent = init.agent || input.agent;
	}

	get method() {
		return this[INTERNALS$2].method;
	}

	get url() {
		return format_url(this[INTERNALS$2].parsedURL);
	}

	get headers() {
		return this[INTERNALS$2].headers;
	}

	get redirect() {
		return this[INTERNALS$2].redirect;
	}

	get signal() {
		return this[INTERNALS$2].signal;
	}

	/**
  * Clone this request
  *
  * @return  Request
  */
	clone() {
		return new Request(this);
	}
}

Body.mixIn(Request.prototype);

Object.defineProperty(Request.prototype, Symbol.toStringTag, {
	value: 'Request',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Request.prototype, {
	method: { enumerable: true },
	url: { enumerable: true },
	headers: { enumerable: true },
	redirect: { enumerable: true },
	clone: { enumerable: true },
	signal: { enumerable: true }
});

/**
 * Convert a Request to Node.js http request options.
 *
 * @param   Request  A Request instance
 * @return  Object   The options object to be passed to http.request
 */
function getNodeRequestOptions(request) {
	const parsedURL = request[INTERNALS$2].parsedURL;
	const headers = new Headers(request[INTERNALS$2].headers);

	// fetch step 1.3
	if (!headers.has('Accept')) {
		headers.set('Accept', '*/*');
	}

	// Basic fetch
	if (!parsedURL.protocol || !parsedURL.hostname) {
		throw new TypeError('Only absolute URLs are supported');
	}

	if (!/^https?:$/.test(parsedURL.protocol)) {
		throw new TypeError('Only HTTP(S) protocols are supported');
	}

	if (request.signal && request.body instanceof Stream.Readable && !streamDestructionSupported) {
		throw new Error('Cancellation of streamed requests with AbortSignal is not supported in node < 8');
	}

	// HTTP-network-or-cache fetch steps 2.4-2.7
	let contentLengthValue = null;
	if (request.body == null && /^(POST|PUT)$/i.test(request.method)) {
		contentLengthValue = '0';
	}
	if (request.body != null) {
		const totalBytes = getTotalBytes(request);
		if (typeof totalBytes === 'number') {
			contentLengthValue = String(totalBytes);
		}
	}
	if (contentLengthValue) {
		headers.set('Content-Length', contentLengthValue);
	}

	// HTTP-network-or-cache fetch step 2.11
	if (!headers.has('User-Agent')) {
		headers.set('User-Agent', 'node-fetch/1.0 (+https://github.com/bitinn/node-fetch)');
	}

	// HTTP-network-or-cache fetch step 2.15
	if (request.compress && !headers.has('Accept-Encoding')) {
		headers.set('Accept-Encoding', 'gzip,deflate');
	}

	let agent = request.agent;
	if (typeof agent === 'function') {
		agent = agent(parsedURL);
	}

	if (!headers.has('Connection') && !agent) {
		headers.set('Connection', 'close');
	}

	// HTTP-network fetch step 4.2
	// chunked encoding is handled by Node.js

	return Object.assign({}, parsedURL, {
		method: request.method,
		headers: exportNodeCompatibleHeaders(headers),
		agent
	});
}

/**
 * abort-error.js
 *
 * AbortError interface for cancelled requests
 */

/**
 * Create AbortError instance
 *
 * @param   String      message      Error message for human
 * @return  AbortError
 */
function AbortError(message) {
  Error.call(this, message);

  this.type = 'aborted';
  this.message = message;

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

AbortError.prototype = Object.create(Error.prototype);
AbortError.prototype.constructor = AbortError;
AbortError.prototype.name = 'AbortError';

// fix an issue where "PassThrough", "resolve" aren't a named export for node <10
const PassThrough$1 = Stream.PassThrough;
const resolve_url = Url.resolve;

/**
 * Fetch function
 *
 * @param   Mixed    url   Absolute url or Request instance
 * @param   Object   opts  Fetch options
 * @return  Promise
 */
function fetch(url, opts) {

	// allow custom promise
	if (!fetch.Promise) {
		throw new Error('native promise missing, set fetch.Promise to your favorite alternative');
	}

	Body.Promise = fetch.Promise;

	// wrap http.request into fetch
	return new fetch.Promise(function (resolve, reject) {
		// build request object
		const request = new Request(url, opts);
		const options = getNodeRequestOptions(request);

		const send = (options.protocol === 'https:' ? https : http).request;
		const signal = request.signal;

		let response = null;

		const abort = function abort() {
			let error = new AbortError('The user aborted a request.');
			reject(error);
			if (request.body && request.body instanceof Stream.Readable) {
				request.body.destroy(error);
			}
			if (!response || !response.body) return;
			response.body.emit('error', error);
		};

		if (signal && signal.aborted) {
			abort();
			return;
		}

		const abortAndFinalize = function abortAndFinalize() {
			abort();
			finalize();
		};

		// send request
		const req = send(options);
		let reqTimeout;

		if (signal) {
			signal.addEventListener('abort', abortAndFinalize);
		}

		function finalize() {
			req.abort();
			if (signal) signal.removeEventListener('abort', abortAndFinalize);
			clearTimeout(reqTimeout);
		}

		if (request.timeout) {
			req.once('socket', function (socket) {
				reqTimeout = setTimeout(function () {
					reject(new FetchError(`network timeout at: ${request.url}`, 'request-timeout'));
					finalize();
				}, request.timeout);
			});
		}

		req.on('error', function (err) {
			reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, 'system', err));
			finalize();
		});

		req.on('response', function (res) {
			clearTimeout(reqTimeout);

			const headers = createHeadersLenient(res.headers);

			// HTTP fetch step 5
			if (fetch.isRedirect(res.statusCode)) {
				// HTTP fetch step 5.2
				const location = headers.get('Location');

				// HTTP fetch step 5.3
				const locationURL = location === null ? null : resolve_url(request.url, location);

				// HTTP fetch step 5.5
				switch (request.redirect) {
					case 'error':
						reject(new FetchError(`redirect mode is set to error: ${request.url}`, 'no-redirect'));
						finalize();
						return;
					case 'manual':
						// node-fetch-specific step: make manual redirect a bit easier to use by setting the Location header value to the resolved URL.
						if (locationURL !== null) {
							// handle corrupted header
							try {
								headers.set('Location', locationURL);
							} catch (err) {
								// istanbul ignore next: nodejs server prevent invalid response headers, we can't test this through normal request
								reject(err);
							}
						}
						break;
					case 'follow':
						// HTTP-redirect fetch step 2
						if (locationURL === null) {
							break;
						}

						// HTTP-redirect fetch step 5
						if (request.counter >= request.follow) {
							reject(new FetchError(`maximum redirect reached at: ${request.url}`, 'max-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 6 (counter increment)
						// Create a new Request object.
						const requestOpts = {
							headers: new Headers(request.headers),
							follow: request.follow,
							counter: request.counter + 1,
							agent: request.agent,
							compress: request.compress,
							method: request.method,
							body: request.body,
							signal: request.signal,
							timeout: request.timeout
						};

						// HTTP-redirect fetch step 9
						if (res.statusCode !== 303 && request.body && getTotalBytes(request) === null) {
							reject(new FetchError('Cannot follow redirect with body being a readable stream', 'unsupported-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 11
						if (res.statusCode === 303 || (res.statusCode === 301 || res.statusCode === 302) && request.method === 'POST') {
							requestOpts.method = 'GET';
							requestOpts.body = undefined;
							requestOpts.headers.delete('content-length');
						}

						// HTTP-redirect fetch step 15
						resolve(fetch(new Request(locationURL, requestOpts)));
						finalize();
						return;
				}
			}

			// prepare response
			res.once('end', function () {
				if (signal) signal.removeEventListener('abort', abortAndFinalize);
			});
			let body = res.pipe(new PassThrough$1());

			const response_options = {
				url: request.url,
				status: res.statusCode,
				statusText: res.statusMessage,
				headers: headers,
				size: request.size,
				timeout: request.timeout,
				counter: request.counter
			};

			// HTTP-network fetch step 12.1.1.3
			const codings = headers.get('Content-Encoding');

			// HTTP-network fetch step 12.1.1.4: handle content codings

			// in following scenarios we ignore compression support
			// 1. compression support is disabled
			// 2. HEAD request
			// 3. no Content-Encoding header
			// 4. no content response (204)
			// 5. content not modified response (304)
			if (!request.compress || request.method === 'HEAD' || codings === null || res.statusCode === 204 || res.statusCode === 304) {
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// For Node v6+
			// Be less strict when decoding compressed responses, since sometimes
			// servers send slightly invalid responses that are still accepted
			// by common browsers.
			// Always using Z_SYNC_FLUSH is what cURL does.
			const zlibOptions = {
				flush: zlib.Z_SYNC_FLUSH,
				finishFlush: zlib.Z_SYNC_FLUSH
			};

			// for gzip
			if (codings == 'gzip' || codings == 'x-gzip') {
				body = body.pipe(zlib.createGunzip(zlibOptions));
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// for deflate
			if (codings == 'deflate' || codings == 'x-deflate') {
				// handle the infamous raw deflate response from old servers
				// a hack for old IIS and Apache servers
				const raw = res.pipe(new PassThrough$1());
				raw.once('data', function (chunk) {
					// see http://stackoverflow.com/questions/37519828
					if ((chunk[0] & 0x0F) === 0x08) {
						body = body.pipe(zlib.createInflate());
					} else {
						body = body.pipe(zlib.createInflateRaw());
					}
					response = new Response(body, response_options);
					resolve(response);
				});
				return;
			}

			// for br
			if (codings == 'br' && typeof zlib.createBrotliDecompress === 'function') {
				body = body.pipe(zlib.createBrotliDecompress());
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// otherwise, use response as-is
			response = new Response(body, response_options);
			resolve(response);
		});

		writeToStream(req, request);
	});
}
/**
 * Redirect code matching
 *
 * @param   Number   code  Status code
 * @return  Boolean
 */
fetch.isRedirect = function (code) {
	return code === 301 || code === 302 || code === 303 || code === 307 || code === 308;
};

// expose Promise
fetch.Promise = global.Promise;

module.exports = exports = fetch;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports;
exports.Headers = Headers;
exports.Request = Request;
exports.Response = Response;
exports.FetchError = FetchError;


/***/ }),
/* 455 */,
/* 456 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { randomBytes } = __webpack_require__(417)

const { IVLENGTHS } = __webpack_require__(962)

module.exports = alg => randomBytes(IVLENGTHS.get(alg) / 8)


/***/ }),
/* 457 */,
/* 458 */,
/* 459 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { define } = __webpack_require__(135)
const base = __webpack_require__(272)
const constants = __webpack_require__(84)
const decoders = __webpack_require__(474)
const encoders = __webpack_require__(645)

module.exports = {
  base,
  constants,
  decoders,
  define,
  encoders
}


/***/ }),
/* 460 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var baseIsArguments = __webpack_require__(208),
    isObjectLike = __webpack_require__(337);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
  return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
};

module.exports = isArguments;


/***/ }),
/* 461 */
/***/ (function(module) {

const curves = new Set(['Ed25519'])

if (!('electron' in process.versions)) {
  curves.add('Ed448')
  curves.add('X25519')
  curves.add('X448')
}

module.exports = curves


/***/ }),
/* 462 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { JOSECritNotUnderstood, JWSInvalid } = __webpack_require__(688)

const DEFINED = new Set([
  'alg', 'jku', 'jwk', 'kid', 'x5u', 'x5c', 'x5t', 'x5t#S256', 'typ', 'cty',
  'crit', 'enc', 'zip', 'epk', 'apu', 'apv', 'iv', 'tag', 'p2s', 'p2c'
])

module.exports = function validateCrit (Err, protectedHeader, unprotectedHeader, understood) {
  if (protectedHeader && 'crit' in protectedHeader) {
    if (
      !Array.isArray(protectedHeader.crit) ||
      protectedHeader.crit.length === 0 ||
      protectedHeader.crit.some(s => typeof s !== 'string' || !s)
    ) {
      throw new Err('"crit" Header Parameter MUST be an array of non-empty strings when present')
    }
    const whitelisted = new Set(understood)
    const combined = { ...protectedHeader, ...unprotectedHeader }
    protectedHeader.crit.forEach((parameter) => {
      if (DEFINED.has(parameter)) {
        throw new Err(`The critical list contains a non-extension Header Parameter ${parameter}`)
      }
      if (!whitelisted.has(parameter)) {
        throw new JOSECritNotUnderstood(`critical "${parameter}" is not understood`)
      }
      if (parameter === 'b64') {
        if (!('b64' in protectedHeader)) {
          throw new JWSInvalid('"b64" critical parameter must be integrity protected')
        }
        if (typeof protectedHeader.b64 !== 'boolean') {
          throw new JWSInvalid('"b64" critical parameter must be a boolean')
        }
      } else if (!(parameter in combined)) {
        throw new Err(`critical parameter "${parameter}" is missing`)
      }
    })
  }
  if (unprotectedHeader && 'crit' in unprotectedHeader) {
    throw new Err('"crit" Header Parameter MUST be integrity protected when present')
  }
}


/***/ }),
/* 463 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const AggregateError = __webpack_require__(273);
const PCancelable = __webpack_require__(693);

class FilterError extends Error { }

const pSome = (iterable, options) => new PCancelable((resolve, reject, onCancel) => {
	const {
		count,
		filter = () => true
	} = options;

	if (!Number.isFinite(count)) {
		reject(new TypeError(`Expected a finite number, got ${typeof options.count}`));
		return;
	}

	const values = [];
	const errors = [];
	let elementCount = 0;
	let isSettled = false;

	const completed = new Set();
	const maybeSettle = () => {
		if (values.length === count) {
			resolve(values);
			isSettled = true;
		}

		if (elementCount - errors.length < count) {
			reject(new AggregateError(errors));
			isSettled = true;
		}

		return isSettled;
	};

	const cancelPending = () => {
		for (const promise of iterable) {
			if (!completed.has(promise) && typeof promise.cancel === 'function') {
				promise.cancel();
			}
		}
	};

	onCancel(cancelPending);

	for (const element of iterable) {
		elementCount++;

		(async () => {
			try {
				const value = await element;

				if (isSettled) {
					return;
				}

				if (!filter(value)) {
					throw new FilterError('Value does not satisfy filter');
				}

				values.push(value);
			} catch (error) {
				errors.push(error);
			} finally {
				completed.add(element);

				if (!isSettled && maybeSettle()) {
					cancelPending();
				}
			}
		})();
	}

	if (count > elementCount) {
		reject(new RangeError(`Expected input to contain at least ${options.count} items, but contains ${elementCount} items`));
		cancelPending();
	}
});

module.exports = pSome;
module.exports.AggregateError = AggregateError;
module.exports.FilterError = FilterError;


/***/ }),
/* 464 */,
/* 465 */,
/* 466 */,
/* 467 */,
/* 468 */,
/* 469 */,
/* 470 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = __webpack_require__(431);
const os = __webpack_require__(87);
const path = __webpack_require__(622);
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * Sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable
 */
function exportVariable(name, val) {
    process.env[name] = val;
    command_1.issueCommand('set-env', { name }, val);
}
exports.exportVariable = exportVariable;
/**
 * Registers a secret which will get masked from logs
 * @param secret value of the secret
 */
function setSecret(secret) {
    command_1.issueCommand('add-mask', {}, secret);
}
exports.setSecret = setSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    command_1.issueCommand('add-path', {}, inputPath);
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.  The value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store
 */
function setOutput(name, value) {
    command_1.issueCommand('set-output', { name }, value);
}
exports.setOutput = setOutput;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command_1.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message
 */
function error(message) {
    command_1.issue('error', message);
}
exports.error = error;
/**
 * Adds an warning issue
 * @param message warning issue message
 */
function warning(message) {
    command_1.issue('warning', message);
}
exports.warning = warning;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command_1.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command_1.issue('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------
/**
 * Saves state for current action, the state can only be retrieved by this action's post job execution.
 *
 * @param     name     name of the state to store
 * @param     value    value to store
 */
function saveState(name, value) {
    command_1.issueCommand('save-state', { name }, value);
}
exports.saveState = saveState;
/**
 * Gets the value of an state set by this action's main execution.
 *
 * @param     name     name of the state to get
 * @returns   string
 */
function getState(name) {
    return process.env[`STATE_${name}`] || '';
}
exports.getState = getState;
//# sourceMappingURL=core.js.map

/***/ }),
/* 471 */,
/* 472 */,
/* 473 */
/***/ (function(module) {

/** Used for built-in method references. */
var funcProto = Function.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

module.exports = toSource;


/***/ }),
/* 474 */
/***/ (function(module, __unusedexports, __webpack_require__) {

module.exports = {
  der: __webpack_require__(768),
  pem: __webpack_require__(782)
}


/***/ }),
/* 475 */
/***/ (function(module) {

function assertSigningAlgValuesSupport(endpoint, issuer, properties) {
  if (!issuer[`${endpoint}_endpoint`]) return;

  const eam = `${endpoint}_endpoint_auth_method`;
  const easa = `${endpoint}_endpoint_auth_signing_alg`;
  const easavs = `${endpoint}_endpoint_auth_signing_alg_values_supported`;

  if (properties[eam] && properties[eam].endsWith('_jwt') && !properties[easa] && !issuer[easavs]) {
    throw new TypeError(`${easavs} must be configured on the issuer if ${easa} is not defined on a client`);
  }
}

function assertIssuerConfiguration(issuer, endpoint) {
  if (!issuer[endpoint]) {
    throw new TypeError(`${endpoint} must be configured on the issuer`);
  }
}

module.exports = {
  assertSigningAlgValuesSupport,
  assertIssuerConfiguration,
};


/***/ }),
/* 476 */,
/* 477 */,
/* 478 */,
/* 479 */,
/* 480 */,
/* 481 */
/***/ (function(module) {

module.exports = (AlgorithmIdentifier, PrivateKey) => function () {
  this.seq().obj(
    this.key('version').int(),
    this.key('algorithm').use(AlgorithmIdentifier),
    this.key('privateKey').use(PrivateKey)
  )
}


/***/ }),
/* 482 */
/***/ (function(module) {

module.exports = {"_from":"got@^9.6.0","_id":"got@9.6.0","_inBundle":false,"_integrity":"sha512-R7eWptXuGYxwijs0eV+v3o6+XH1IqVK8dJOEecQfTmkncw9AV4dcw/Dhxi8MdlqPthxxpZyizMzyg8RTmEsG+Q==","_location":"/got","_phantomChildren":{},"_requested":{"type":"range","registry":true,"raw":"got@^9.6.0","name":"got","escapedName":"got","rawSpec":"^9.6.0","saveSpec":null,"fetchSpec":"^9.6.0"},"_requiredBy":["/openid-client"],"_resolved":"https://registry.npmjs.org/got/-/got-9.6.0.tgz","_shasum":"edf45e7d67f99545705de1f7bbeeeb121765ed85","_spec":"got@^9.6.0","_where":"C:\\Users\\adstoffe\\OneDrive - Microsoft\\B2C Integrations\\GitHub Actions\\deploy-trustframework-policy\\deploy-trustframework-policy\\node_modules\\openid-client","ava":{"concurrency":4},"browser":{"decompress-response":false,"electron":false},"bugs":{"url":"https://github.com/sindresorhus/got/issues"},"bundleDependencies":false,"dependencies":{"@sindresorhus/is":"^0.14.0","@szmarczak/http-timer":"^1.1.2","cacheable-request":"^6.0.0","decompress-response":"^3.3.0","duplexer3":"^0.1.4","get-stream":"^4.1.0","lowercase-keys":"^1.0.1","mimic-response":"^1.0.1","p-cancelable":"^1.0.0","to-readable-stream":"^1.0.0","url-parse-lax":"^3.0.0"},"deprecated":false,"description":"Simplified HTTP requests","devDependencies":{"ava":"^1.1.0","coveralls":"^3.0.0","delay":"^4.1.0","form-data":"^2.3.3","get-port":"^4.0.0","np":"^3.1.0","nyc":"^13.1.0","p-event":"^2.1.0","pem":"^1.13.2","proxyquire":"^2.0.1","sinon":"^7.2.2","slow-stream":"0.0.4","tempfile":"^2.0.0","tempy":"^0.2.1","tough-cookie":"^3.0.0","xo":"^0.24.0"},"engines":{"node":">=8.6"},"files":["source"],"homepage":"https://github.com/sindresorhus/got#readme","keywords":["http","https","get","got","url","uri","request","util","utility","simple","curl","wget","fetch","net","network","electron"],"license":"MIT","main":"source","name":"got","repository":{"type":"git","url":"git+https://github.com/sindresorhus/got.git"},"scripts":{"release":"np","test":"xo && nyc ava"},"version":"9.6.0"};

/***/ }),
/* 483 */
/***/ (function(module) {

const privateProps = new WeakMap();

module.exports = (ctx) => {
  if (!privateProps.has(ctx)) {
    privateProps.set(ctx, new Map([['metadata', new Map()]]));
  }
  return privateProps.get(ctx);
};


/***/ }),
/* 484 */,
/* 485 */,
/* 486 */
/***/ (function(module, __unusedexports, __webpack_require__) {

/* eslint-disable camelcase */
const { inspect } = __webpack_require__(669);

const { RPError, OPError } = __webpack_require__(889);
const instance = __webpack_require__(483);
const now = __webpack_require__(416);
const { authenticatedPost } = __webpack_require__(285);
const processResponse = __webpack_require__(944);
const TokenSet = __webpack_require__(933);

class DeviceFlowHandle {
  constructor({
    client, exchangeBody, clientAssertionPayload, response, maxAge,
  }) {
    ['verification_uri', 'user_code', 'device_code'].forEach((prop) => {
      if (typeof response[prop] !== 'string' || !response[prop]) {
        throw new RPError(`expected ${prop} string to be returned by Device Authorization Response, got %j`, response[prop]);
      }
    });

    if (!Number.isSafeInteger(response.expires_in)) {
      throw new RPError('expected expires_in number to be returned by Device Authorization Response, got %j', response.expires_in);
    }

    instance(this).expires_at = now() + response.expires_in;
    instance(this).client = client;
    instance(this).maxAge = maxAge;
    instance(this).exchangeBody = exchangeBody;
    instance(this).clientAssertionPayload = clientAssertionPayload;
    instance(this).response = response;
    instance(this).interval = response.interval * 1000 || 5000;
  }

  async poll() {
    if (this.expired()) {
      throw new RPError('the device code %j has expired and the device authorization session has concluded', this.device_code);
    }

    await new Promise((resolve) => setTimeout(resolve, instance(this).interval));

    const response = await authenticatedPost.call(
      instance(this).client,
      'token',
      {
        form: true,
        body: {
          ...instance(this).exchangeBody,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
          device_code: this.device_code,
        },
        json: true,
      },
      { clientAssertionPayload: instance(this).clientAssertionPayload },
    );

    let responseBody;
    try {
      responseBody = processResponse(response);
    } catch (err) {
      switch (err instanceof OPError && err.error) {
        case 'slow_down':
          instance(this).interval += 5000;
        case 'authorization_pending': // eslint-disable-line no-fallthrough
          return this.poll();
        default:
          throw err;
      }
    }

    const tokenset = new TokenSet(responseBody);

    if ('id_token' in tokenset) {
      await instance(this).client.decryptIdToken(tokenset);
      await instance(this).client.validateIdToken(tokenset, undefined, 'token', instance(this).maxAge);
    }

    return tokenset;
  }

  get device_code() {
    return instance(this).response.device_code;
  }

  get user_code() {
    return instance(this).response.user_code;
  }

  get verification_uri() {
    return instance(this).response.verification_uri;
  }

  get verification_uri_complete() {
    return instance(this).response.verification_uri_complete;
  }

  get expires_in() {
    return Math.max.apply(null, [instance(this).expires_at - now(), 0]);
  }

  expired() {
    return this.expires_in === 0;
  }

  /* istanbul ignore next */
  [inspect.custom]() {
    return `${this.constructor.name} ${inspect(instance(this).response, {
      depth: Infinity,
      colors: process.stdout.isTTY,
      compact: false,
      sorted: true,
    })}`;
  }
}

module.exports = DeviceFlowHandle;


/***/ }),
/* 487 */,
/* 488 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var overArg = __webpack_require__(393);

/** Built-in value references. */
var getPrototype = overArg(Object.getPrototypeOf, Object);

module.exports = getPrototype;


/***/ }),
/* 489 */,
/* 490 */
/***/ (function(module) {

module.exports = (a = {}, b = {}) => {
  const keysA = Object.keys(a)
  const keysB = new Set(Object.keys(b))
  return !keysA.some((ka) => keysB.has(ka))
}


/***/ }),
/* 491 */,
/* 492 */,
/* 493 */,
/* 494 */,
/* 495 */,
/* 496 */,
/* 497 */,
/* 498 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var root = __webpack_require__(824);

/** Built-in value references. */
var Symbol = root.Symbol;

module.exports = Symbol;


/***/ }),
/* 499 */,
/* 500 */,
/* 501 */,
/* 502 */,
/* 503 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var isSymbol = __webpack_require__(188);

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */
function toKey(value) {
  if (typeof value == 'string' || isSymbol(value)) {
    return value;
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

module.exports = toKey;


/***/ }),
/* 504 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const is = __webpack_require__(534);

module.exports = body => is.nodeStream(body) && is.function(body.getBoundary);


/***/ }),
/* 505 */,
/* 506 */,
/* 507 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var MapCache = __webpack_require__(121);

/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `_.memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `clear`, `delete`, `get`, `has`, and `set`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace `_.memoize.Cache`.
 * _.memoize.Cache = WeakMap;
 */
function memoize(func, resolver) {
  if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };
  memoized.cache = new (memoize.Cache || MapCache);
  return memoized;
}

// Expose `MapCache`.
memoize.Cache = MapCache;

module.exports = memoize;


/***/ }),
/* 508 */,
/* 509 */
/***/ (function(module) {

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

module.exports = baseProperty;


/***/ }),
/* 510 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { createHmac } = __webpack_require__(417)

const { KEYOBJECT } = __webpack_require__(771)
const timingSafeEqual = __webpack_require__(355)
const resolveNodeAlg = __webpack_require__(165)
const { asInput } = __webpack_require__(727)

const sign = (jwaAlg, hmacAlg, { [KEYOBJECT]: keyObject }, payload) => {
  const hmac = createHmac(hmacAlg, asInput(keyObject, false))
  hmac.update(payload)
  return hmac.digest()
}

const verify = (jwaAlg, hmacAlg, key, payload, signature) => {
  const expected = sign(jwaAlg, hmacAlg, key, payload)
  const actual = signature

  return timingSafeEqual(actual, expected)
}

module.exports = (JWA, JWK) => {
  ['HS256', 'HS384', 'HS512'].forEach((jwaAlg) => {
    const hmacAlg = resolveNodeAlg(jwaAlg)
    JWA.sign.set(jwaAlg, sign.bind(undefined, jwaAlg, hmacAlg))
    JWA.verify.set(jwaAlg, verify.bind(undefined, jwaAlg, hmacAlg))
    JWK.oct.sign[jwaAlg] = JWK.oct.verify[jwaAlg] = key => key.use === 'sig' || key.use === undefined
  })
}


/***/ }),
/* 511 */
/***/ (function(module) {

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

module.exports = isKeyable;


/***/ }),
/* 512 */
/***/ (function(module) {

/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0: return func.call(thisArg);
    case 1: return func.call(thisArg, args[0]);
    case 2: return func.call(thisArg, args[0], args[1]);
    case 3: return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

module.exports = apply;


/***/ }),
/* 513 */,
/* 514 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { createHash } = __webpack_require__(417)

const base64url = __webpack_require__(44)

const x5t = (hash, cert) => base64url.encodeBuffer(createHash(hash).update(Buffer.from(cert, 'base64')).digest())

module.exports.kid = components => base64url.encodeBuffer(createHash('sha256').update(JSON.stringify(components)).digest())
module.exports.x5t = x5t.bind(undefined, 'sha1')
module.exports['x5t#S256'] = x5t.bind(undefined, 'sha256')


/***/ }),
/* 515 */,
/* 516 */,
/* 517 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var isStrictComparable = __webpack_require__(258),
    keys = __webpack_require__(863);

/**
 * Gets the property names, values, and compare flags of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the match data of `object`.
 */
function getMatchData(object) {
  var result = keys(object),
      length = result.length;

  while (length--) {
    var key = result[length],
        value = object[key];

    result[length] = [key, value, isStrictComparable(value)];
  }
  return result;
}

module.exports = getMatchData;


/***/ }),
/* 518 */
/***/ (function(module) {

const isNotString = val => typeof val !== 'string' || val.length === 0

module.exports.isNotString = isNotString
module.exports.isString = function isString (Err, value, label, claim, required = false) {
  if (required && value === undefined) {
    throw new Err(`${label} is missing`, claim, 'missing')
  }

  if (value !== undefined && isNotString(value)) {
    throw new Err(`${label} must be a string`, claim, 'invalid')
  }
}


/***/ }),
/* 519 */
/***/ (function(__unusedmodule, exports) {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module OneDriveLargeFileUploadTaskUtil
 */
/**
 * @constant
 * Default value for the rangeSize
 * Recommended size is between 5 - 10 MB {@link https://developer.microsoft.com/en-us/graph/docs/api-reference/v1.0/api/driveitem_createuploadsession#best-practices}
 */
var DEFAULT_FILE_SIZE = 5 * 1024 * 1024;
/**
 * @constant
 * Rounds off the given value to a multiple of 320 KB
 * @param {number} value - The value
 * @returns The rounded off value
 */
var roundTo320KB = function (value) {
    if (value > 320 * 1024) {
        value = Math.floor(value / (320 * 1024)) * 320 * 1024;
    }
    return value;
};
/**
 * @constant
 * Get the valid rangeSize for a file slicing (validity is based on the constrains mentioned in here
 * {@link https://developer.microsoft.com/en-us/graph/docs/api-reference/v1.0/api/driveitem_createuploadsession#upload-bytes-to-the-upload-session})
 *
 * @param {number} [rangeSize = DEFAULT_FILE_SIZE] - The rangeSize value.
 * @returns The valid rangeSize
 */
exports.getValidRangeSize = function (rangeSize) {
    if (rangeSize === void 0) { rangeSize = DEFAULT_FILE_SIZE; }
    var sixtyMB = 60 * 1024 * 1024;
    if (rangeSize > sixtyMB) {
        rangeSize = sixtyMB;
    }
    return roundTo320KB(rangeSize);
};
//# sourceMappingURL=OneDriveLargeFileUploadTaskUtil.js.map

/***/ }),
/* 520 */,
/* 521 */,
/* 522 */
/***/ (function(module, __unusedexports, __webpack_require__) {

/* global BigInt */

const { EOL } = __webpack_require__(87)

const { name: secp256k1 } = __webpack_require__(997)
const errors = __webpack_require__(688)

const { createPublicKey } = __webpack_require__(727)
const base64url = __webpack_require__(44)
const asn1 = __webpack_require__(805)
const computePrimes = __webpack_require__(694)
const { OKP_CURVES, EC_CURVES } = __webpack_require__(962)

const oidHexToCurve = new Map([
  ['06082a8648ce3d030107', 'P-256'],
  ['06052b8104000a', secp256k1],
  ['06052b81040022', 'P-384'],
  ['06052b81040023', 'P-521']
])
const EC_KEY_OID = '1.2.840.10045.2.1'.split('.')
const crvToOid = new Map([
  ['P-256', '1.2.840.10045.3.1.7'.split('.')],
  [secp256k1, '1.3.132.0.10'.split('.')],
  ['P-384', '1.3.132.0.34'.split('.')],
  ['P-521', '1.3.132.0.35'.split('.')]
])
const crvToOidBuf = new Map([
  ['P-256', Buffer.from('06082a8648ce3d030107', 'hex')],
  [secp256k1, Buffer.from('06052b8104000a', 'hex')],
  ['P-384', Buffer.from('06052b81040022', 'hex')],
  ['P-521', Buffer.from('06052b81040023', 'hex')]
])

const formatPem = (base64pem, descriptor) => `-----BEGIN ${descriptor} KEY-----${EOL}${base64pem.match(/.{1,64}/g).join(EOL)}${EOL}-----END ${descriptor} KEY-----`

const okpToJWK = {
  private (crv, keyObject) {
    const der = keyObject.export({ type: 'pkcs8', format: 'der' })
    const OneAsymmetricKey = asn1.get('OneAsymmetricKey')
    const { privateKey: { privateKey: d } } = OneAsymmetricKey.decode(der)

    return {
      ...okpToJWK.public(crv, createPublicKey(keyObject)),
      d: base64url.encodeBuffer(d)
    }
  },
  public (crv, keyObject) {
    const der = keyObject.export({ type: 'spki', format: 'der' })

    const PublicKeyInfo = asn1.get('PublicKeyInfo')

    const { publicKey: { data: x } } = PublicKeyInfo.decode(der)

    return {
      kty: 'OKP',
      crv,
      x: base64url.encodeBuffer(x)
    }
  }
}

const keyObjectToJWK = {
  rsa: {
    private (keyObject) {
      const der = keyObject.export({ type: 'pkcs8', format: 'der' })

      const PrivateKeyInfo = asn1.get('PrivateKeyInfo')
      const RSAPrivateKey = asn1.get('RSAPrivateKey')

      const { privateKey } = PrivateKeyInfo.decode(der)
      const { version, n, e, d, p, q, dp, dq, qi } = RSAPrivateKey.decode(privateKey)

      if (version !== 'two-prime') {
        throw new errors.JOSENotSupported('Private RSA keys with more than two primes are not supported')
      }

      return {
        kty: 'RSA',
        n: base64url.encodeBigInt(n),
        e: base64url.encodeBigInt(e),
        d: base64url.encodeBigInt(d),
        p: base64url.encodeBigInt(p),
        q: base64url.encodeBigInt(q),
        dp: base64url.encodeBigInt(dp),
        dq: base64url.encodeBigInt(dq),
        qi: base64url.encodeBigInt(qi)
      }
    },
    public (keyObject) {
      const der = keyObject.export({ type: 'spki', format: 'der' })

      const PublicKeyInfo = asn1.get('PublicKeyInfo')
      const RSAPublicKey = asn1.get('RSAPublicKey')

      const { publicKey: { data: publicKey } } = PublicKeyInfo.decode(der)
      const { n, e } = RSAPublicKey.decode(publicKey)

      return {
        kty: 'RSA',
        n: base64url.encodeBigInt(n),
        e: base64url.encodeBigInt(e)
      }
    }
  },
  ec: {
    private (keyObject) {
      const der = keyObject.export({ type: 'pkcs8', format: 'der' })

      const PrivateKeyInfo = asn1.get('PrivateKeyInfo')
      const ECPrivateKey = asn1.get('ECPrivateKey')

      const { privateKey, algorithm: { parameters: curveOid } } = PrivateKeyInfo.decode(der)
      const crv = oidHexToCurve.get(curveOid.toString('hex'))
      const { privateKey: d, publicKey: { data: publicKey } } = ECPrivateKey.decode(privateKey)

      const x = publicKey.slice(1, ((publicKey.length - 1) / 2) + 1)
      const y = publicKey.slice(((publicKey.length - 1) / 2) + 1)

      return {
        kty: 'EC',
        crv,
        d: base64url.encodeBuffer(d),
        x: base64url.encodeBuffer(x),
        y: base64url.encodeBuffer(y)
      }
    },
    public (keyObject) {
      const der = keyObject.export({ type: 'spki', format: 'der' })

      const PublicKeyInfo = asn1.get('PublicKeyInfo')

      const { publicKey: { data: publicKey }, algorithm: { parameters: curveOid } } = PublicKeyInfo.decode(der)
      const crv = oidHexToCurve.get(curveOid.toString('hex'))

      const x = publicKey.slice(1, ((publicKey.length - 1) / 2) + 1)
      const y = publicKey.slice(((publicKey.length - 1) / 2) + 1)

      return {
        kty: 'EC',
        crv,
        x: base64url.encodeBuffer(x),
        y: base64url.encodeBuffer(y)
      }
    }
  },
  ed25519: {
    private (keyObject) {
      return okpToJWK.private('Ed25519', keyObject)
    },
    public (keyObject) {
      return okpToJWK.public('Ed25519', keyObject)
    }
  },
  ed448: {
    private (keyObject) {
      return okpToJWK.private('Ed448', keyObject)
    },
    public (keyObject) {
      return okpToJWK.public('Ed448', keyObject)
    }
  },
  x25519: {
    private (keyObject) {
      return okpToJWK.private('X25519', keyObject)
    },
    public (keyObject) {
      return okpToJWK.public('X25519', keyObject)
    }
  },
  x448: {
    private (keyObject) {
      return okpToJWK.private('X448', keyObject)
    },
    public (keyObject) {
      return okpToJWK.public('X448', keyObject)
    }
  }
}

module.exports.keyObjectToJWK = (keyObject) => {
  if (keyObject.type === 'private') {
    return keyObjectToJWK[keyObject.asymmetricKeyType].private(keyObject)
  }

  return keyObjectToJWK[keyObject.asymmetricKeyType].public(keyObject)
}

const concatEcPublicKey = (x, y) => ({
  unused: 0,
  data: Buffer.concat([
    Buffer.alloc(1, 4),
    base64url.decodeToBuffer(x),
    base64url.decodeToBuffer(y)
  ])
})

const okpCrvToOid = (crv) => {
  switch (crv) {
    case 'X25519':
      return '1.3.101.110'.split('.')
    case 'X448':
      return '1.3.101.111'.split('.')
    case 'Ed25519':
      return '1.3.101.112'.split('.')
    case 'Ed448':
      return '1.3.101.113'.split('.')
  }
}

const jwkToPem = {
  RSA: {
    private (jwk, { calculateMissingRSAPrimes }) {
      const RSAPrivateKey = asn1.get('RSAPrivateKey')

      if ('oth' in jwk) {
        throw new errors.JOSENotSupported('Private RSA keys with more than two primes are not supported')
      }

      if (jwk.p || jwk.q || jwk.dp || jwk.dq || jwk.qi) {
        if (!(jwk.p && jwk.q && jwk.dp && jwk.dq && jwk.qi)) {
          throw new errors.JWKInvalid('all other private key parameters must be present when any one of them is present')
        }
      } else if (calculateMissingRSAPrimes) {
        jwk = computePrimes(jwk)
      } else if (!calculateMissingRSAPrimes) {
        throw new errors.JOSENotSupported('importing private RSA keys without all other private key parameters is not enabled, see documentation and its advisory on how and when its ok to enable it')
      }

      return RSAPrivateKey.encode({
        version: 0,
        n: BigInt(`0x${base64url.decodeToBuffer(jwk.n).toString('hex')}`),
        e: BigInt(`0x${base64url.decodeToBuffer(jwk.e).toString('hex')}`),
        d: BigInt(`0x${base64url.decodeToBuffer(jwk.d).toString('hex')}`),
        p: BigInt(`0x${base64url.decodeToBuffer(jwk.p).toString('hex')}`),
        q: BigInt(`0x${base64url.decodeToBuffer(jwk.q).toString('hex')}`),
        dp: BigInt(`0x${base64url.decodeToBuffer(jwk.dp).toString('hex')}`),
        dq: BigInt(`0x${base64url.decodeToBuffer(jwk.dq).toString('hex')}`),
        qi: BigInt(`0x${base64url.decodeToBuffer(jwk.qi).toString('hex')}`)
      }, 'pem', { label: 'RSA PRIVATE KEY' })
    },
    public (jwk) {
      const RSAPublicKey = asn1.get('RSAPublicKey')

      return RSAPublicKey.encode({
        version: 0,
        n: BigInt(`0x${base64url.decodeToBuffer(jwk.n).toString('hex')}`),
        e: BigInt(`0x${base64url.decodeToBuffer(jwk.e).toString('hex')}`)
      }, 'pem', { label: 'RSA PUBLIC KEY' })
    }
  },
  EC: {
    private (jwk) {
      const ECPrivateKey = asn1.get('ECPrivateKey')

      return ECPrivateKey.encode({
        version: 1,
        privateKey: base64url.decodeToBuffer(jwk.d),
        parameters: {
          type: 'namedCurve',
          value: crvToOid.get(jwk.crv)
        },
        publicKey: concatEcPublicKey(jwk.x, jwk.y)
      }, 'pem', { label: 'EC PRIVATE KEY' })
    },
    public (jwk) {
      const PublicKeyInfo = asn1.get('PublicKeyInfo')

      return PublicKeyInfo.encode({
        algorithm: {
          algorithm: EC_KEY_OID,
          parameters: crvToOidBuf.get(jwk.crv)
        },
        publicKey: concatEcPublicKey(jwk.x, jwk.y)
      }, 'pem', { label: 'PUBLIC KEY' })
    }
  },
  OKP: {
    private (jwk) {
      const OneAsymmetricKey = asn1.get('OneAsymmetricKey')

      const b64 = OneAsymmetricKey.encode({
        version: 0,
        privateKey: { privateKey: base64url.decodeToBuffer(jwk.d) },
        algorithm: { algorithm: okpCrvToOid(jwk.crv) }
      }, 'der')

      // TODO: WHYYY? https://github.com/indutny/asn1.js/issues/110
      b64.write('04', 12, 1, 'hex')

      return formatPem(b64.toString('base64'), 'PRIVATE')
    },
    public (jwk) {
      const PublicKeyInfo = asn1.get('PublicKeyInfo')

      return PublicKeyInfo.encode({
        algorithm: { algorithm: okpCrvToOid(jwk.crv) },
        publicKey: {
          unused: 0,
          data: base64url.decodeToBuffer(jwk.x)
        }
      }, 'pem', { label: 'PUBLIC KEY' })
    }
  }
}

module.exports.jwkToPem = (jwk, { calculateMissingRSAPrimes = false } = {}) => {
  switch (jwk.kty) {
    case 'EC':
      if (!EC_CURVES.has(jwk.crv)) {
        throw new errors.JOSENotSupported(`unsupported EC key curve: ${jwk.crv}`)
      }
      break
    case 'OKP':
      if (!OKP_CURVES.has(jwk.crv)) {
        throw new errors.JOSENotSupported(`unsupported OKP key curve: ${jwk.crv}`)
      }
      break
    case 'RSA':
      break
    default:
      throw new errors.JOSENotSupported(`unsupported key type: ${jwk.kty}`)
  }

  if (jwk.d) {
    return jwkToPem[jwk.kty].private(jwk, { calculateMissingRSAPrimes })
  }

  return jwkToPem[jwk.kty].public(jwk)
}


/***/ }),
/* 523 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const {URL, URLSearchParams} = __webpack_require__(835); // TODO: Use the `URL` global when targeting Node.js 10
const urlLib = __webpack_require__(835);
const is = __webpack_require__(534);
const urlParseLax = __webpack_require__(173);
const lowercaseKeys = __webpack_require__(86);
const urlToOptions = __webpack_require__(435);
const isFormData = __webpack_require__(504);
const merge = __webpack_require__(821);
const knownHookEvents = __webpack_require__(433);

const retryAfterStatusCodes = new Set([413, 429, 503]);

// `preNormalize` handles static options (e.g. headers).
// For example, when you create a custom instance and make a request
// with no static changes, they won't be normalized again.
//
// `normalize` operates on dynamic options - they cannot be saved.
// For example, `body` is everytime different per request.
// When it's done normalizing the new options, it performs merge()
// on the prenormalized options and the normalized ones.

const preNormalize = (options, defaults) => {
	if (is.nullOrUndefined(options.headers)) {
		options.headers = {};
	} else {
		options.headers = lowercaseKeys(options.headers);
	}

	if (options.baseUrl && !options.baseUrl.toString().endsWith('/')) {
		options.baseUrl += '/';
	}

	if (options.stream) {
		options.json = false;
	}

	if (is.nullOrUndefined(options.hooks)) {
		options.hooks = {};
	} else if (!is.object(options.hooks)) {
		throw new TypeError(`Parameter \`hooks\` must be an object, not ${is(options.hooks)}`);
	}

	for (const event of knownHookEvents) {
		if (is.nullOrUndefined(options.hooks[event])) {
			if (defaults) {
				options.hooks[event] = [...defaults.hooks[event]];
			} else {
				options.hooks[event] = [];
			}
		}
	}

	if (is.number(options.timeout)) {
		options.gotTimeout = {request: options.timeout};
	} else if (is.object(options.timeout)) {
		options.gotTimeout = options.timeout;
	}

	delete options.timeout;

	const {retry} = options;
	options.retry = {
		retries: 0,
		methods: [],
		statusCodes: [],
		errorCodes: []
	};

	if (is.nonEmptyObject(defaults) && retry !== false) {
		options.retry = {...defaults.retry};
	}

	if (retry !== false) {
		if (is.number(retry)) {
			options.retry.retries = retry;
		} else {
			options.retry = {...options.retry, ...retry};
		}
	}

	if (options.gotTimeout) {
		options.retry.maxRetryAfter = Math.min(...[options.gotTimeout.request, options.gotTimeout.connection].filter(n => !is.nullOrUndefined(n)));
	}

	if (is.array(options.retry.methods)) {
		options.retry.methods = new Set(options.retry.methods.map(method => method.toUpperCase()));
	}

	if (is.array(options.retry.statusCodes)) {
		options.retry.statusCodes = new Set(options.retry.statusCodes);
	}

	if (is.array(options.retry.errorCodes)) {
		options.retry.errorCodes = new Set(options.retry.errorCodes);
	}

	return options;
};

const normalize = (url, options, defaults) => {
	if (is.plainObject(url)) {
		options = {...url, ...options};
		url = options.url || {};
		delete options.url;
	}

	if (defaults) {
		options = merge({}, defaults.options, options ? preNormalize(options, defaults.options) : {});
	} else {
		options = merge({}, preNormalize(options));
	}

	if (!is.string(url) && !is.object(url)) {
		throw new TypeError(`Parameter \`url\` must be a string or object, not ${is(url)}`);
	}

	if (is.string(url)) {
		if (options.baseUrl) {
			if (url.toString().startsWith('/')) {
				url = url.toString().slice(1);
			}

			url = urlToOptions(new URL(url, options.baseUrl));
		} else {
			url = url.replace(/^unix:/, 'http://$&');
			url = urlParseLax(url);
		}
	} else if (is(url) === 'URL') {
		url = urlToOptions(url);
	}

	// Override both null/undefined with default protocol
	options = merge({path: ''}, url, {protocol: url.protocol || 'https:'}, options);

	for (const hook of options.hooks.init) {
		const called = hook(options);

		if (is.promise(called)) {
			throw new TypeError('The `init` hook must be a synchronous function');
		}
	}

	const {baseUrl} = options;
	Object.defineProperty(options, 'baseUrl', {
		set: () => {
			throw new Error('Failed to set baseUrl. Options are normalized already.');
		},
		get: () => baseUrl
	});

	const {query} = options;
	if (is.nonEmptyString(query) || is.nonEmptyObject(query) || query instanceof URLSearchParams) {
		if (!is.string(query)) {
			options.query = (new URLSearchParams(query)).toString();
		}

		options.path = `${options.path.split('?')[0]}?${options.query}`;
		delete options.query;
	}

	if (options.hostname === 'unix') {
		const matches = /(.+?):(.+)/.exec(options.path);

		if (matches) {
			const [, socketPath, path] = matches;
			options = {
				...options,
				socketPath,
				path,
				host: null
			};
		}
	}

	const {headers} = options;
	for (const [key, value] of Object.entries(headers)) {
		if (is.nullOrUndefined(value)) {
			delete headers[key];
		}
	}

	if (options.json && is.undefined(headers.accept)) {
		headers.accept = 'application/json';
	}

	if (options.decompress && is.undefined(headers['accept-encoding'])) {
		headers['accept-encoding'] = 'gzip, deflate';
	}

	const {body} = options;
	if (is.nullOrUndefined(body)) {
		options.method = options.method ? options.method.toUpperCase() : 'GET';
	} else {
		const isObject = is.object(body) && !is.buffer(body) && !is.nodeStream(body);
		if (!is.nodeStream(body) && !is.string(body) && !is.buffer(body) && !(options.form || options.json)) {
			throw new TypeError('The `body` option must be a stream.Readable, string or Buffer');
		}

		if (options.json && !(isObject || is.array(body))) {
			throw new TypeError('The `body` option must be an Object or Array when the `json` option is used');
		}

		if (options.form && !isObject) {
			throw new TypeError('The `body` option must be an Object when the `form` option is used');
		}

		if (isFormData(body)) {
			// Special case for https://github.com/form-data/form-data
			headers['content-type'] = headers['content-type'] || `multipart/form-data; boundary=${body.getBoundary()}`;
		} else if (options.form) {
			headers['content-type'] = headers['content-type'] || 'application/x-www-form-urlencoded';
			options.body = (new URLSearchParams(body)).toString();
		} else if (options.json) {
			headers['content-type'] = headers['content-type'] || 'application/json';
			options.body = JSON.stringify(body);
		}

		options.method = options.method ? options.method.toUpperCase() : 'POST';
	}

	if (!is.function(options.retry.retries)) {
		const {retries} = options.retry;

		options.retry.retries = (iteration, error) => {
			if (iteration > retries) {
				return 0;
			}

			if ((!error || !options.retry.errorCodes.has(error.code)) && (!options.retry.methods.has(error.method) || !options.retry.statusCodes.has(error.statusCode))) {
				return 0;
			}

			if (Reflect.has(error, 'headers') && Reflect.has(error.headers, 'retry-after') && retryAfterStatusCodes.has(error.statusCode)) {
				let after = Number(error.headers['retry-after']);
				if (is.nan(after)) {
					after = Date.parse(error.headers['retry-after']) - Date.now();
				} else {
					after *= 1000;
				}

				if (after > options.retry.maxRetryAfter) {
					return 0;
				}

				return after;
			}

			if (error.statusCode === 413) {
				return 0;
			}

			const noise = Math.random() * 100;
			return ((2 ** (iteration - 1)) * 1000) + noise;
		};
	}

	return options;
};

const reNormalize = options => normalize(urlLib.format(options), options);

module.exports = normalize;
module.exports.preNormalize = preNormalize;
module.exports.reNormalize = reNormalize;


/***/ }),
/* 524 */,
/* 525 */,
/* 526 */,
/* 527 */,
/* 528 */,
/* 529 */,
/* 530 */,
/* 531 */
/***/ (function(__unusedmodule, exports) {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @class
 * @implements MiddlewareOptions
 * Class representing AuthenticationHandlerOptions
 */
var AuthenticationHandlerOptions = /** @class */ (function () {
    /**
     * @public
     * @constructor
     * To create an instance of AuthenticationHandlerOptions
     * @param {AuthenticationProvider} [authenticationProvider] - The authentication provider instance
     * @param {AuthenticationProviderOptions} [authenticationProviderOptions] - The authentication provider options instance
     * @returns An instance of AuthenticationHandlerOptions
     */
    function AuthenticationHandlerOptions(authenticationProvider, authenticationProviderOptions) {
        this.authenticationProvider = authenticationProvider;
        this.authenticationProviderOptions = authenticationProviderOptions;
    }
    return AuthenticationHandlerOptions;
}());
exports.AuthenticationHandlerOptions = AuthenticationHandlerOptions;
//# sourceMappingURL=AuthenticationHandlerOptions.js.map

/***/ }),
/* 532 */,
/* 533 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { pbkdf2Sync: pbkdf2, randomBytes } = __webpack_require__(417)

const { KEYOBJECT } = __webpack_require__(771)
const base64url = __webpack_require__(44)

const SALT_LENGTH = 16
const NULL_BUFFER = Buffer.alloc(1, 0)

const concatSalt = (alg, p2s) => {
  return Buffer.concat([
    Buffer.from(alg, 'utf8'),
    NULL_BUFFER,
    p2s
  ])
}

const wrapKey = (keylen, sha, concat, wrap, { [KEYOBJECT]: keyObject }, payload) => {
  // Note that if password-based encryption is used for multiple
  // recipients, it is expected that each recipient use different values
  // for the PBES2 parameters "p2s" and "p2c".
  // here we generate p2c between 2048 and 4096 and random p2s
  const p2c = Math.floor((Math.random() * 2049) + 2048)
  const p2s = randomBytes(SALT_LENGTH)
  const salt = concat(p2s)

  const derivedKey = pbkdf2(keyObject.export(), salt, p2c, keylen, sha)

  const result = wrap({ [KEYOBJECT]: derivedKey }, payload)
  result.header = result.header || {}
  Object.assign(result.header, { p2c, p2s: base64url.encodeBuffer(p2s) })

  return result
}

const unwrapKey = (keylen, sha, concat, unwrap, { [KEYOBJECT]: keyObject }, payload, header) => {
  const { p2s, p2c } = header
  const salt = concat(p2s)
  const derivedKey = pbkdf2(keyObject.export(), salt, p2c, keylen, sha)
  return unwrap({ [KEYOBJECT]: derivedKey }, payload, header)
}

module.exports = (JWA, JWK) => {
  ['PBES2-HS256+A128KW', 'PBES2-HS384+A192KW', 'PBES2-HS512+A256KW'].forEach((jwaAlg) => {
    const kw = jwaAlg.substr(-6)
    const kwWrap = JWA.keyManagementEncrypt.get(kw)
    const kwUnwrap = JWA.keyManagementDecrypt.get(kw)
    const keylen = parseInt(jwaAlg.substr(13, 3), 10) / 8
    const sha = `sha${jwaAlg.substr(8, 3)}`

    if (kwWrap && kwUnwrap) {
      JWA.keyManagementEncrypt.set(jwaAlg, wrapKey.bind(undefined, keylen, sha, concatSalt.bind(undefined, jwaAlg), kwWrap))
      JWA.keyManagementDecrypt.set(jwaAlg, unwrapKey.bind(undefined, keylen, sha, concatSalt.bind(undefined, jwaAlg), kwUnwrap))
      JWK.oct.deriveKey[jwaAlg] = key => key.use === 'enc' || key.use === undefined
    }
  })
}


/***/ }),
/* 534 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/// <reference lib="es2016"/>
/// <reference lib="es2017.sharedmemory"/>
/// <reference lib="esnext.asynciterable"/>
/// <reference lib="dom"/>
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: Use the `URL` global when targeting Node.js 10
// tslint:disable-next-line
const URLGlobal = typeof URL === 'undefined' ? __webpack_require__(835).URL : URL;
const toString = Object.prototype.toString;
const isOfType = (type) => (value) => typeof value === type;
const isBuffer = (input) => !is.nullOrUndefined(input) && !is.nullOrUndefined(input.constructor) && is.function_(input.constructor.isBuffer) && input.constructor.isBuffer(input);
const getObjectType = (value) => {
    const objectName = toString.call(value).slice(8, -1);
    if (objectName) {
        return objectName;
    }
    return null;
};
const isObjectOfType = (type) => (value) => getObjectType(value) === type;
function is(value) {
    switch (value) {
        case null:
            return "null" /* null */;
        case true:
        case false:
            return "boolean" /* boolean */;
        default:
    }
    switch (typeof value) {
        case 'undefined':
            return "undefined" /* undefined */;
        case 'string':
            return "string" /* string */;
        case 'number':
            return "number" /* number */;
        case 'symbol':
            return "symbol" /* symbol */;
        default:
    }
    if (is.function_(value)) {
        return "Function" /* Function */;
    }
    if (is.observable(value)) {
        return "Observable" /* Observable */;
    }
    if (Array.isArray(value)) {
        return "Array" /* Array */;
    }
    if (isBuffer(value)) {
        return "Buffer" /* Buffer */;
    }
    const tagType = getObjectType(value);
    if (tagType) {
        return tagType;
    }
    if (value instanceof String || value instanceof Boolean || value instanceof Number) {
        throw new TypeError('Please don\'t use object wrappers for primitive types');
    }
    return "Object" /* Object */;
}
(function (is) {
    // tslint:disable-next-line:strict-type-predicates
    const isObject = (value) => typeof value === 'object';
    // tslint:disable:variable-name
    is.undefined = isOfType('undefined');
    is.string = isOfType('string');
    is.number = isOfType('number');
    is.function_ = isOfType('function');
    // tslint:disable-next-line:strict-type-predicates
    is.null_ = (value) => value === null;
    is.class_ = (value) => is.function_(value) && value.toString().startsWith('class ');
    is.boolean = (value) => value === true || value === false;
    is.symbol = isOfType('symbol');
    // tslint:enable:variable-name
    is.numericString = (value) => is.string(value) && value.length > 0 && !Number.isNaN(Number(value));
    is.array = Array.isArray;
    is.buffer = isBuffer;
    is.nullOrUndefined = (value) => is.null_(value) || is.undefined(value);
    is.object = (value) => !is.nullOrUndefined(value) && (is.function_(value) || isObject(value));
    is.iterable = (value) => !is.nullOrUndefined(value) && is.function_(value[Symbol.iterator]);
    is.asyncIterable = (value) => !is.nullOrUndefined(value) && is.function_(value[Symbol.asyncIterator]);
    is.generator = (value) => is.iterable(value) && is.function_(value.next) && is.function_(value.throw);
    is.nativePromise = (value) => isObjectOfType("Promise" /* Promise */)(value);
    const hasPromiseAPI = (value) => !is.null_(value) &&
        isObject(value) &&
        is.function_(value.then) &&
        is.function_(value.catch);
    is.promise = (value) => is.nativePromise(value) || hasPromiseAPI(value);
    is.generatorFunction = isObjectOfType("GeneratorFunction" /* GeneratorFunction */);
    is.asyncFunction = isObjectOfType("AsyncFunction" /* AsyncFunction */);
    is.boundFunction = (value) => is.function_(value) && !value.hasOwnProperty('prototype');
    is.regExp = isObjectOfType("RegExp" /* RegExp */);
    is.date = isObjectOfType("Date" /* Date */);
    is.error = isObjectOfType("Error" /* Error */);
    is.map = (value) => isObjectOfType("Map" /* Map */)(value);
    is.set = (value) => isObjectOfType("Set" /* Set */)(value);
    is.weakMap = (value) => isObjectOfType("WeakMap" /* WeakMap */)(value);
    is.weakSet = (value) => isObjectOfType("WeakSet" /* WeakSet */)(value);
    is.int8Array = isObjectOfType("Int8Array" /* Int8Array */);
    is.uint8Array = isObjectOfType("Uint8Array" /* Uint8Array */);
    is.uint8ClampedArray = isObjectOfType("Uint8ClampedArray" /* Uint8ClampedArray */);
    is.int16Array = isObjectOfType("Int16Array" /* Int16Array */);
    is.uint16Array = isObjectOfType("Uint16Array" /* Uint16Array */);
    is.int32Array = isObjectOfType("Int32Array" /* Int32Array */);
    is.uint32Array = isObjectOfType("Uint32Array" /* Uint32Array */);
    is.float32Array = isObjectOfType("Float32Array" /* Float32Array */);
    is.float64Array = isObjectOfType("Float64Array" /* Float64Array */);
    is.arrayBuffer = isObjectOfType("ArrayBuffer" /* ArrayBuffer */);
    is.sharedArrayBuffer = isObjectOfType("SharedArrayBuffer" /* SharedArrayBuffer */);
    is.dataView = isObjectOfType("DataView" /* DataView */);
    is.directInstanceOf = (instance, klass) => Object.getPrototypeOf(instance) === klass.prototype;
    is.urlInstance = (value) => isObjectOfType("URL" /* URL */)(value);
    is.urlString = (value) => {
        if (!is.string(value)) {
            return false;
        }
        try {
            new URLGlobal(value); // tslint:disable-line no-unused-expression
            return true;
        }
        catch (_a) {
            return false;
        }
    };
    is.truthy = (value) => Boolean(value);
    is.falsy = (value) => !value;
    is.nan = (value) => Number.isNaN(value);
    const primitiveTypes = new Set([
        'undefined',
        'string',
        'number',
        'boolean',
        'symbol'
    ]);
    is.primitive = (value) => is.null_(value) || primitiveTypes.has(typeof value);
    is.integer = (value) => Number.isInteger(value);
    is.safeInteger = (value) => Number.isSafeInteger(value);
    is.plainObject = (value) => {
        // From: https://github.com/sindresorhus/is-plain-obj/blob/master/index.js
        let prototype;
        return getObjectType(value) === "Object" /* Object */ &&
            (prototype = Object.getPrototypeOf(value), prototype === null || // tslint:disable-line:ban-comma-operator
                prototype === Object.getPrototypeOf({}));
    };
    const typedArrayTypes = new Set([
        "Int8Array" /* Int8Array */,
        "Uint8Array" /* Uint8Array */,
        "Uint8ClampedArray" /* Uint8ClampedArray */,
        "Int16Array" /* Int16Array */,
        "Uint16Array" /* Uint16Array */,
        "Int32Array" /* Int32Array */,
        "Uint32Array" /* Uint32Array */,
        "Float32Array" /* Float32Array */,
        "Float64Array" /* Float64Array */
    ]);
    is.typedArray = (value) => {
        const objectType = getObjectType(value);
        if (objectType === null) {
            return false;
        }
        return typedArrayTypes.has(objectType);
    };
    const isValidLength = (value) => is.safeInteger(value) && value > -1;
    is.arrayLike = (value) => !is.nullOrUndefined(value) && !is.function_(value) && isValidLength(value.length);
    is.inRange = (value, range) => {
        if (is.number(range)) {
            return value >= Math.min(0, range) && value <= Math.max(range, 0);
        }
        if (is.array(range) && range.length === 2) {
            return value >= Math.min(...range) && value <= Math.max(...range);
        }
        throw new TypeError(`Invalid range: ${JSON.stringify(range)}`);
    };
    const NODE_TYPE_ELEMENT = 1;
    const DOM_PROPERTIES_TO_CHECK = [
        'innerHTML',
        'ownerDocument',
        'style',
        'attributes',
        'nodeValue'
    ];
    is.domElement = (value) => is.object(value) && value.nodeType === NODE_TYPE_ELEMENT && is.string(value.nodeName) &&
        !is.plainObject(value) && DOM_PROPERTIES_TO_CHECK.every(property => property in value);
    is.observable = (value) => {
        if (!value) {
            return false;
        }
        if (value[Symbol.observable] && value === value[Symbol.observable]()) {
            return true;
        }
        if (value['@@observable'] && value === value['@@observable']()) {
            return true;
        }
        return false;
    };
    is.nodeStream = (value) => !is.nullOrUndefined(value) && isObject(value) && is.function_(value.pipe) && !is.observable(value);
    is.infinite = (value) => value === Infinity || value === -Infinity;
    const isAbsoluteMod2 = (rem) => (value) => is.integer(value) && Math.abs(value % 2) === rem;
    is.even = isAbsoluteMod2(0);
    is.odd = isAbsoluteMod2(1);
    const isWhiteSpaceString = (value) => is.string(value) && /\S/.test(value) === false;
    is.emptyArray = (value) => is.array(value) && value.length === 0;
    is.nonEmptyArray = (value) => is.array(value) && value.length > 0;
    is.emptyString = (value) => is.string(value) && value.length === 0;
    is.nonEmptyString = (value) => is.string(value) && value.length > 0;
    is.emptyStringOrWhitespace = (value) => is.emptyString(value) || isWhiteSpaceString(value);
    is.emptyObject = (value) => is.object(value) && !is.map(value) && !is.set(value) && Object.keys(value).length === 0;
    is.nonEmptyObject = (value) => is.object(value) && !is.map(value) && !is.set(value) && Object.keys(value).length > 0;
    is.emptySet = (value) => is.set(value) && value.size === 0;
    is.nonEmptySet = (value) => is.set(value) && value.size > 0;
    is.emptyMap = (value) => is.map(value) && value.size === 0;
    is.nonEmptyMap = (value) => is.map(value) && value.size > 0;
    const predicateOnArray = (method, predicate, values) => {
        if (is.function_(predicate) === false) {
            throw new TypeError(`Invalid predicate: ${JSON.stringify(predicate)}`);
        }
        if (values.length === 0) {
            throw new TypeError('Invalid number of values');
        }
        return method.call(values, predicate);
    };
    // tslint:disable variable-name
    is.any = (predicate, ...values) => predicateOnArray(Array.prototype.some, predicate, values);
    is.all = (predicate, ...values) => predicateOnArray(Array.prototype.every, predicate, values);
    // tslint:enable variable-name
})(is || (is = {}));
// Some few keywords are reserved, but we'll populate them for Node.js users
// See https://github.com/Microsoft/TypeScript/issues/2536
Object.defineProperties(is, {
    class: {
        value: is.class_
    },
    function: {
        value: is.function_
    },
    null: {
        value: is.null_
    }
});
exports.default = is;
// For CommonJS default export support
module.exports = is;
module.exports.default = is;
//# sourceMappingURL=index.js.map

/***/ }),
/* 535 */,
/* 536 */,
/* 537 */
/***/ (function(module) {

const MAX_INT32 = Math.pow(2, 32)

module.exports = (value, buf = Buffer.allocUnsafe(8)) => {
  const high = Math.floor(value / MAX_INT32)
  const low = value % MAX_INT32

  buf.writeUInt32BE(high, 0)
  buf.writeUInt32BE(low, 4)
  return buf
}


/***/ }),
/* 538 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var cloneArrayBuffer = __webpack_require__(600),
    cloneDataView = __webpack_require__(233),
    cloneRegExp = __webpack_require__(269),
    cloneSymbol = __webpack_require__(334),
    cloneTypedArray = __webpack_require__(439);

/** `Object#toString` result references. */
var boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/**
 * Initializes an object clone based on its `toStringTag`.
 *
 * **Note:** This function only supports cloning values with tags of
 * `Boolean`, `Date`, `Error`, `Map`, `Number`, `RegExp`, `Set`, or `String`.
 *
 * @private
 * @param {Object} object The object to clone.
 * @param {string} tag The `toStringTag` of the object to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneByTag(object, tag, isDeep) {
  var Ctor = object.constructor;
  switch (tag) {
    case arrayBufferTag:
      return cloneArrayBuffer(object);

    case boolTag:
    case dateTag:
      return new Ctor(+object);

    case dataViewTag:
      return cloneDataView(object, isDeep);

    case float32Tag: case float64Tag:
    case int8Tag: case int16Tag: case int32Tag:
    case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
      return cloneTypedArray(object, isDeep);

    case mapTag:
      return new Ctor;

    case numberTag:
    case stringTag:
      return new Ctor(object);

    case regexpTag:
      return cloneRegExp(object);

    case setTag:
      return new Ctor;

    case symbolTag:
      return cloneSymbol(object);
  }
}

module.exports = initCloneByTag;


/***/ }),
/* 539 */,
/* 540 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var baseMerge = __webpack_require__(834),
    isObject = __webpack_require__(988);

/**
 * Used by `_.defaultsDeep` to customize its `_.merge` use to merge source
 * objects into destination objects that are passed thru.
 *
 * @private
 * @param {*} objValue The destination value.
 * @param {*} srcValue The source value.
 * @param {string} key The key of the property to merge.
 * @param {Object} object The parent object of `objValue`.
 * @param {Object} source The parent object of `srcValue`.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 * @returns {*} Returns the value to assign.
 */
function customDefaultsMerge(objValue, srcValue, key, object, source, stack) {
  if (isObject(objValue) && isObject(srcValue)) {
    // Recursively merge objects and arrays (susceptible to call stack limits).
    stack.set(srcValue, objValue);
    baseMerge(objValue, srcValue, undefined, customDefaultsMerge, stack);
    stack['delete'](srcValue);
  }
  return objValue;
}

module.exports = customDefaultsMerge;


/***/ }),
/* 541 */,
/* 542 */
/***/ (function(__unusedmodule, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function padString(input) {
    var segmentLength = 4;
    var stringLength = input.length;
    var diff = stringLength % segmentLength;
    if (!diff) {
        return input;
    }
    var position = stringLength;
    var padLength = segmentLength - diff;
    var paddedStringLength = stringLength + padLength;
    var buffer = Buffer.alloc(paddedStringLength);
    buffer.write(input);
    while (padLength--) {
        buffer.write("=", position++);
    }
    return buffer.toString();
}
exports.default = padString;


/***/ }),
/* 543 */,
/* 544 */,
/* 545 */,
/* 546 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module Client
 */
var Constants_1 = __webpack_require__(634);
var CustomAuthenticationProvider_1 = __webpack_require__(426);
var GraphRequest_1 = __webpack_require__(631);
var HTTPClient_1 = __webpack_require__(663);
var HTTPClientFactory_1 = __webpack_require__(187);
var ValidatePolyFilling_1 = __webpack_require__(374);
var Client = /** @class */ (function () {
    /**
     * @private
     * @constructor
     * Creates an instance of Client
     * @param {ClientOptions} clientOptions - The options to instantiate the client object
     */
    function Client(clientOptions) {
        /**
         * @private
         * A member which stores the Client instance options
         */
        this.config = {
            baseUrl: Constants_1.GRAPH_BASE_URL,
            debugLogging: false,
            defaultVersion: Constants_1.GRAPH_API_VERSION,
        };
        try {
            ValidatePolyFilling_1.validatePolyFilling();
        }
        catch (error) {
            throw error;
        }
        for (var key in clientOptions) {
            if (clientOptions.hasOwnProperty(key)) {
                this.config[key] = clientOptions[key];
            }
        }
        var httpClient;
        if (clientOptions.authProvider !== undefined && clientOptions.middleware !== undefined) {
            var error = new Error();
            error.name = "AmbiguityInInitialization";
            error.message = "Unable to Create Client, Please provide either authentication provider for default middleware chain or custom middleware chain not both";
            throw error;
        }
        else if (clientOptions.authProvider !== undefined) {
            httpClient = HTTPClientFactory_1.HTTPClientFactory.createWithAuthenticationProvider(clientOptions.authProvider);
        }
        else if (clientOptions.middleware !== undefined) {
            httpClient = new HTTPClient_1.HTTPClient(clientOptions.middleware);
        }
        else {
            var error = new Error();
            error.name = "InvalidMiddlewareChain";
            error.message = "Unable to Create Client, Please provide either authentication provider for default middleware chain or custom middleware chain";
            throw error;
        }
        this.httpClient = httpClient;
    }
    /**
     * @public
     * @static
     * To create a client instance with options and initializes the default middleware chain
     * @param {Options} options - The options for client instance
     * @returns The Client instance
     */
    Client.init = function (options) {
        var clientOptions = {};
        for (var i in options) {
            if (options.hasOwnProperty(i)) {
                clientOptions[i] = i === "authProvider" ? new CustomAuthenticationProvider_1.CustomAuthenticationProvider(options[i]) : options[i];
            }
        }
        return Client.initWithMiddleware(clientOptions);
    };
    /**
     * @public
     * @static
     * To create a client instance with the Client Options
     * @param {ClientOptions} clientOptions - The options object for initializing the client
     * @returns The Client instance
     */
    Client.initWithMiddleware = function (clientOptions) {
        try {
            return new Client(clientOptions);
        }
        catch (error) {
            throw error;
        }
    };
    /**
     * @public
     * Entry point to make requests
     * @param {string} path - The path string value
     * @returns The graph request instance
     */
    Client.prototype.api = function (path) {
        return new GraphRequest_1.GraphRequest(this.httpClient, this.config, path);
    };
    return Client;
}());
exports.Client = Client;
//# sourceMappingURL=Client.js.map

/***/ }),
/* 547 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const pSome = __webpack_require__(463);
const PCancelable = __webpack_require__(845);

module.exports = (iterable, options) => {
	const anyCancelable = pSome(iterable, {...options, count: 1});

	return PCancelable.fn(async onCancel => {
		onCancel(() => {
			anyCancelable.cancel();
		});

		const [value] = await anyCancelable;
		return value;
	})();
};

module.exports.AggregateError = pSome.AggregateError;


/***/ }),
/* 548 */
/***/ (function(module) {

// Credit: https://github.com/rohe/pyoidc/blob/master/src/oic/utils/webfinger.py

// -- Normalization --
// A string of any other type is interpreted as a URI either the form of scheme
// "://" authority path-abempty [ "?" query ] [ "#" fragment ] or authority
// path-abempty [ "?" query ] [ "#" fragment ] per RFC 3986 [RFC3986] and is
// normalized according to the following rules:
//
// If the user input Identifier does not have an RFC 3986 [RFC3986] scheme
// portion, the string is interpreted as [userinfo "@"] host [":" port]
// path-abempty [ "?" query ] [ "#" fragment ] per RFC 3986 [RFC3986].
// If the userinfo component is present and all of the path component, query
// component, and port component are empty, the acct scheme is assumed. In this
// case, the normalized URI is formed by prefixing acct: to the string as the
// scheme. Per the 'acct' URI Scheme [I‑D.ietf‑appsawg‑acct‑uri], if there is an
// at-sign character ('@') in the userinfo component, it needs to be
// percent-encoded as described in RFC 3986 [RFC3986].
// For all other inputs without a scheme portion, the https scheme is assumed,
// and the normalized URI is formed by prefixing https:// to the string as the
// scheme.
// If the resulting URI contains a fragment portion, it MUST be stripped off
// together with the fragment delimiter character "#".
// The WebFinger [I‑D.ietf‑appsawg‑webfinger] Resource in this case is the
// resulting URI, and the WebFinger Host is the authority component.
//
// Note: Since the definition of authority in RFC 3986 [RFC3986] is
// [ userinfo "@" ] host [ ":" port ], it is legal to have a user input
// identifier like userinfo@host:port, e.g., alice@example.com:8080.

const PORT = /^\d+$/;

function hasScheme(input) {
  if (input.includes('://')) return true;

  const authority = input.replace(/(\/|\?)/g, '#').split('#')[0];
  if (authority.includes(':')) {
    const index = authority.indexOf(':');
    const hostOrPort = authority.slice(index + 1);
    if (!PORT.test(hostOrPort)) {
      return true;
    }
  }

  return false;
}

function acctSchemeAssumed(input) {
  if (!input.includes('@')) return false;
  const parts = input.split('@');
  const host = parts[parts.length - 1];
  return !(host.includes(':') || host.includes('/') || host.includes('?'));
}

function normalize(input) {
  if (typeof input !== 'string') {
    throw new TypeError('input must be a string');
  }

  let output;
  if (hasScheme(input)) {
    output = input;
  } else if (acctSchemeAssumed(input)) {
    output = `acct:${input}`;
  } else {
    output = `https://${input}`;
  }

  return output.split('#')[0];
}

module.exports = normalize;


/***/ }),
/* 549 */,
/* 550 */,
/* 551 */,
/* 552 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(422);
/**
 * @module BatchRequestContent
 */
var RequestMethod_1 = __webpack_require__(819);
/**
 * @class
 * Class for handling BatchRequestContent
 */
var BatchRequestContent = /** @class */ (function () {
    /**
     * @public
     * @constructor
     * Constructs a BatchRequestContent instance
     * @param {BatchRequestStep[]} [requests] - Array of requests value
     * @returns An instance of a BatchRequestContent
     */
    function BatchRequestContent(requests) {
        this.requests = new Map();
        if (typeof requests !== "undefined") {
            var limit = BatchRequestContent.requestLimit;
            if (requests.length > limit) {
                var error = new Error("Maximum requests limit exceeded, Max allowed number of requests are " + limit);
                error.name = "Limit Exceeded Error";
                throw error;
            }
            for (var _i = 0, requests_1 = requests; _i < requests_1.length; _i++) {
                var req = requests_1[_i];
                this.addRequest(req);
            }
        }
    }
    /**
     * @private
     * @static
     * Validates the dependency chain of the requests
     *
     * Note:
     * Individual requests can depend on other individual requests. Currently, requests can only depend on a single other request, and must follow one of these three patterns:
     * 1. Parallel - no individual request states a dependency in the dependsOn property.
     * 2. Serial - all individual requests depend on the previous individual request.
     * 3. Same - all individual requests that state a dependency in the dependsOn property, state the same dependency.
     * As JSON batching matures, these limitations will be removed.
     * @see {@link https://developer.microsoft.com/en-us/graph/docs/concepts/known_issues#json-batching}
     *
     * @param {Map<string, BatchRequestStep>} requests - The map of requests.
     * @returns The boolean indicating the validation status
     */
    BatchRequestContent.validateDependencies = function (requests) {
        var isParallel = function (reqs) {
            var iterator = reqs.entries();
            var cur = iterator.next();
            while (!cur.done) {
                var curReq = cur.value[1];
                if (curReq.dependsOn !== undefined && curReq.dependsOn.length > 0) {
                    return false;
                }
                cur = iterator.next();
            }
            return true;
        };
        var isSerial = function (reqs) {
            var iterator = reqs.entries();
            var cur = iterator.next();
            var firstRequest = cur.value[1];
            if (firstRequest.dependsOn !== undefined && firstRequest.dependsOn.length > 0) {
                return false;
            }
            var prev = cur;
            cur = iterator.next();
            while (!cur.done) {
                var curReq = cur.value[1];
                if (curReq.dependsOn === undefined || curReq.dependsOn.length !== 1 || curReq.dependsOn[0] !== prev.value[1].id) {
                    return false;
                }
                prev = cur;
                cur = iterator.next();
            }
            return true;
        };
        var isSame = function (reqs) {
            var iterator = reqs.entries();
            var cur = iterator.next();
            var firstRequest = cur.value[1];
            var dependencyId;
            if (firstRequest.dependsOn === undefined || firstRequest.dependsOn.length === 0) {
                dependencyId = firstRequest.id;
            }
            else {
                if (firstRequest.dependsOn.length === 1) {
                    var fDependencyId = firstRequest.dependsOn[0];
                    if (fDependencyId !== firstRequest.id && reqs.has(fDependencyId)) {
                        dependencyId = fDependencyId;
                    }
                    else {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
            cur = iterator.next();
            while (!cur.done) {
                var curReq = cur.value[1];
                if ((curReq.dependsOn === undefined || curReq.dependsOn.length === 0) && dependencyId !== curReq.id) {
                    return false;
                }
                if (curReq.dependsOn !== undefined && curReq.dependsOn.length !== 0) {
                    if (curReq.dependsOn.length === 1 && (curReq.id === dependencyId || curReq.dependsOn[0] !== dependencyId)) {
                        return false;
                    }
                    if (curReq.dependsOn.length > 1) {
                        return false;
                    }
                }
                cur = iterator.next();
            }
            return true;
        };
        if (requests.size === 0) {
            var error = new Error("Empty requests map, Please provide at least one request.");
            error.name = "Empty Requests Error";
            throw error;
        }
        return isParallel(requests) || isSerial(requests) || isSame(requests);
    };
    /**
     * @private
     * @static
     * @async
     * Converts Request Object instance to a JSON
     * @param {IsomorphicRequest} request - The IsomorphicRequest Object instance
     * @returns A promise that resolves to JSON representation of a request
     */
    BatchRequestContent.getRequestData = function (request) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var requestData, hasHttpRegex, headers, _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        requestData = {
                            url: "",
                        };
                        hasHttpRegex = new RegExp("^https?://");
                        // Stripping off hostname, port and url scheme
                        requestData.url = hasHttpRegex.test(request.url) ? "/" + request.url.split(/.*?\/\/.*?\//)[1] : request.url;
                        requestData.method = request.method;
                        headers = {};
                        request.headers.forEach(function (value, key) {
                            headers[key] = value;
                        });
                        if (Object.keys(headers).length) {
                            requestData.headers = headers;
                        }
                        if (!(request.method === RequestMethod_1.RequestMethod.PATCH || request.method === RequestMethod_1.RequestMethod.POST || request.method === RequestMethod_1.RequestMethod.PUT)) return [3 /*break*/, 2];
                        _a = requestData;
                        return [4 /*yield*/, BatchRequestContent.getRequestBody(request)];
                    case 1:
                        _a.body = _b.sent();
                        _b.label = 2;
                    case 2: 
                    /**
                     * TODO: Check any other property needs to be used from the Request object and add them
                     */
                    return [2 /*return*/, requestData];
                }
            });
        });
    };
    /**
     * @private
     * @static
     * @async
     * Gets the body of a Request object instance
     * @param {IsomorphicRequest} request - The IsomorphicRequest object instance
     * @returns The Promise that resolves to a body value of a Request
     */
    BatchRequestContent.getRequestBody = function (request) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var bodyParsed, body, cloneReq, e_1, blob_1, reader_1, buffer, e_2;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        bodyParsed = false;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        cloneReq = request.clone();
                        return [4 /*yield*/, cloneReq.json()];
                    case 2:
                        body = _a.sent();
                        bodyParsed = true;
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        if (!!bodyParsed) return [3 /*break*/, 12];
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 11, , 12]);
                        if (!(typeof Blob !== "undefined")) return [3 /*break*/, 8];
                        return [4 /*yield*/, request.blob()];
                    case 6:
                        blob_1 = _a.sent();
                        reader_1 = new FileReader();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                reader_1.addEventListener("load", function () {
                                    var dataURL = reader_1.result;
                                    /**
                                     * Some valid dataURL schemes:
                                     *  1. data:text/vnd-example+xyz;foo=bar;base64,R0lGODdh
                                     *  2. data:text/plain;charset=UTF-8;page=21,the%20data:1234,5678
                                     *  3. data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==
                                     *  4. data:image/png,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==
                                     *  5. data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==
                                     * @see Syntax {@link https://en.wikipedia.org/wiki/Data_URI_scheme} for more
                                     */
                                    var regex = new RegExp("^s*data:(.+?/.+?(;.+?=.+?)*)?(;base64)?,(.*)s*$");
                                    var segments = regex.exec(dataURL);
                                    resolve(segments[4]);
                                }, false);
                                reader_1.readAsDataURL(blob_1);
                            })];
                    case 7:
                        body = _a.sent();
                        return [3 /*break*/, 10];
                    case 8:
                        if (!(typeof Buffer !== "undefined")) return [3 /*break*/, 10];
                        return [4 /*yield*/, request.buffer()];
                    case 9:
                        buffer = _a.sent();
                        body = buffer.toString("base64");
                        _a.label = 10;
                    case 10:
                        bodyParsed = true;
                        return [3 /*break*/, 12];
                    case 11:
                        e_2 = _a.sent();
                        return [3 /*break*/, 12];
                    case 12: return [2 /*return*/, body];
                }
            });
        });
    };
    /**
     * @public
     * Adds a request to the batch request content
     * @param {BatchRequestStep} request - The request value
     * @returns The id of the added request
     */
    BatchRequestContent.prototype.addRequest = function (request) {
        var limit = BatchRequestContent.requestLimit;
        if (request.id === "") {
            var error = new Error("Id for a request is empty, Please provide an unique id");
            error.name = "Empty Id For Request";
            throw error;
        }
        if (this.requests.size === limit) {
            var error = new Error("Maximum requests limit exceeded, Max allowed number of requests are " + limit);
            error.name = "Limit Exceeded Error";
            throw error;
        }
        if (this.requests.has(request.id)) {
            var error = new Error("Adding request with duplicate id " + request.id + ", Make the id of the requests unique");
            error.name = "Duplicate RequestId Error";
            throw error;
        }
        this.requests.set(request.id, request);
        return request.id;
    };
    /**
     * @public
     * Removes request from the batch payload and its dependencies from all dependents
     * @param {string} requestId - The id of a request that needs to be removed
     * @returns The boolean indicating removed status
     */
    BatchRequestContent.prototype.removeRequest = function (requestId) {
        var deleteStatus = this.requests.delete(requestId);
        var iterator = this.requests.entries();
        var cur = iterator.next();
        /**
         * Removing dependencies where this request is present as a dependency
         */
        while (!cur.done) {
            var dependencies = cur.value[1].dependsOn;
            if (typeof dependencies !== "undefined") {
                var index = dependencies.indexOf(requestId);
                if (index !== -1) {
                    dependencies.splice(index, 1);
                }
                if (dependencies.length === 0) {
                    delete cur.value[1].dependsOn;
                }
            }
            cur = iterator.next();
        }
        return deleteStatus;
    };
    /**
     * @public
     * @async
     * Serialize content from BatchRequestContent instance
     * @returns The body content to make batch request
     */
    BatchRequestContent.prototype.getContent = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var requests, requestBody, iterator, cur, error, error, requestStep, batchRequestData, error;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        requests = [];
                        requestBody = {
                            requests: requests,
                        };
                        iterator = this.requests.entries();
                        cur = iterator.next();
                        if (cur.done) {
                            error = new Error("No requests added yet, Please add at least one request.");
                            error.name = "Empty Payload";
                            throw error;
                        }
                        if (!BatchRequestContent.validateDependencies(this.requests)) {
                            error = new Error("Invalid dependency found, Dependency should be:\n1. Parallel - no individual request states a dependency in the dependsOn property.\n2. Serial - all individual requests depend on the previous individual request.\n3. Same - all individual requests that state a dependency in the dependsOn property, state the same dependency.");
                            error.name = "Invalid Dependency";
                            throw error;
                        }
                        _a.label = 1;
                    case 1:
                        if (!!cur.done) return [3 /*break*/, 3];
                        requestStep = cur.value[1];
                        return [4 /*yield*/, BatchRequestContent.getRequestData(requestStep.request)];
                    case 2:
                        batchRequestData = (_a.sent());
                        /**
                         * @see {@link https://developer.microsoft.com/en-us/graph/docs/concepts/json_batching#request-format}
                         */
                        if (batchRequestData.body !== undefined && (batchRequestData.headers === undefined || batchRequestData.headers["content-type"] === undefined)) {
                            error = new Error("Content-type header is not mentioned for request #" + requestStep.id + ", For request having body, Content-type header should be mentioned");
                            error.name = "Invalid Content-type header";
                            throw error;
                        }
                        batchRequestData.id = requestStep.id;
                        if (requestStep.dependsOn !== undefined && requestStep.dependsOn.length > 0) {
                            batchRequestData.dependsOn = requestStep.dependsOn;
                        }
                        requests.push(batchRequestData);
                        cur = iterator.next();
                        return [3 /*break*/, 1];
                    case 3:
                        requestBody.requests = requests;
                        return [2 /*return*/, requestBody];
                }
            });
        });
    };
    /**
     * @public
     * Adds a dependency for a given dependent request
     * @param {string} dependentId - The id of the dependent request
     * @param {string} [dependencyId] - The id of the dependency request, if not specified the preceding request will be considered as a dependency
     * @returns Nothing
     */
    BatchRequestContent.prototype.addDependency = function (dependentId, dependencyId) {
        if (!this.requests.has(dependentId)) {
            var error = new Error("Dependent " + dependentId + " does not exists, Please check the id");
            error.name = "Invalid Dependent";
            throw error;
        }
        if (typeof dependencyId !== "undefined" && !this.requests.has(dependencyId)) {
            var error = new Error("Dependency " + dependencyId + " does not exists, Please check the id");
            error.name = "Invalid Dependency";
            throw error;
        }
        if (typeof dependencyId !== "undefined") {
            var dependent = this.requests.get(dependentId);
            if (dependent.dependsOn === undefined) {
                dependent.dependsOn = [];
            }
            if (dependent.dependsOn.indexOf(dependencyId) !== -1) {
                var error = new Error("Dependency " + dependencyId + " is already added for the request " + dependentId);
                error.name = "Duplicate Dependency";
                throw error;
            }
            dependent.dependsOn.push(dependencyId);
        }
        else {
            var iterator = this.requests.entries();
            var prev = void 0;
            var cur = iterator.next();
            while (!cur.done && cur.value[1].id !== dependentId) {
                prev = cur;
                cur = iterator.next();
            }
            if (typeof prev !== "undefined") {
                var dId = prev.value[0];
                if (cur.value[1].dependsOn === undefined) {
                    cur.value[1].dependsOn = [];
                }
                if (cur.value[1].dependsOn.indexOf(dId) !== -1) {
                    var error = new Error("Dependency " + dId + " is already added for the request " + dependentId);
                    error.name = "Duplicate Dependency";
                    throw error;
                }
                cur.value[1].dependsOn.push(dId);
            }
            else {
                var error = new Error("Can't add dependency " + dependencyId + ", There is only a dependent request in the batch");
                error.name = "Invalid Dependency Addition";
                throw error;
            }
        }
    };
    /**
     * @public
     * Removes a dependency for a given dependent request id
     * @param {string} dependentId - The id of the dependent request
     * @param {string} [dependencyId] - The id of the dependency request, if not specified will remove all the dependencies of that request
     * @returns The boolean indicating removed status
     */
    BatchRequestContent.prototype.removeDependency = function (dependentId, dependencyId) {
        var request = this.requests.get(dependentId);
        if (typeof request === "undefined" || request.dependsOn === undefined || request.dependsOn.length === 0) {
            return false;
        }
        if (typeof dependencyId !== "undefined") {
            var index = request.dependsOn.indexOf(dependencyId);
            if (index === -1) {
                return false;
            }
            request.dependsOn.splice(index, 1);
            return true;
        }
        else {
            delete request.dependsOn;
            return true;
        }
    };
    /**
     * @private
     * @static
     * Limit for number of requests {@link - https://developer.microsoft.com/en-us/graph/docs/concepts/known_issues#json-batching}
     */
    BatchRequestContent.requestLimit = 20;
    return BatchRequestContent;
}());
exports.BatchRequestContent = BatchRequestContent;
//# sourceMappingURL=BatchRequestContent.js.map

/***/ }),
/* 553 */
/***/ (function(module) {

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

module.exports = baseTimes;


/***/ }),
/* 554 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var eq = __webpack_require__(338),
    isArrayLike = __webpack_require__(146),
    isIndex = __webpack_require__(160),
    isObject = __webpack_require__(988);

/**
 * Checks if the given arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
 *  else `false`.
 */
function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number'
        ? (isArrayLike(object) && isIndex(index, object.length))
        : (type == 'string' && index in object)
      ) {
    return eq(object[index], value);
  }
  return false;
}

module.exports = isIterateeCall;


/***/ }),
/* 555 */,
/* 556 */,
/* 557 */
/***/ (function(module) {

"use strict";


class CancelError extends Error {
	constructor(reason) {
		super(reason || 'Promise was canceled');
		this.name = 'CancelError';
	}

	get isCanceled() {
		return true;
	}
}

class PCancelable {
	static fn(userFn) {
		return (...args) => {
			return new PCancelable((resolve, reject, onCancel) => {
				args.push(onCancel);
				userFn(...args).then(resolve, reject);
			});
		};
	}

	constructor(executor) {
		this._cancelHandlers = [];
		this._isPending = true;
		this._isCanceled = false;
		this._rejectOnCancel = true;

		this._promise = new Promise((resolve, reject) => {
			this._reject = reject;

			const onResolve = value => {
				this._isPending = false;
				resolve(value);
			};

			const onReject = error => {
				this._isPending = false;
				reject(error);
			};

			const onCancel = handler => {
				this._cancelHandlers.push(handler);
			};

			Object.defineProperties(onCancel, {
				shouldReject: {
					get: () => this._rejectOnCancel,
					set: bool => {
						this._rejectOnCancel = bool;
					}
				}
			});

			return executor(onResolve, onReject, onCancel);
		});
	}

	then(onFulfilled, onRejected) {
		return this._promise.then(onFulfilled, onRejected);
	}

	catch(onRejected) {
		return this._promise.catch(onRejected);
	}

	finally(onFinally) {
		return this._promise.finally(onFinally);
	}

	cancel(reason) {
		if (!this._isPending || this._isCanceled) {
			return;
		}

		if (this._cancelHandlers.length > 0) {
			try {
				for (const handler of this._cancelHandlers) {
					handler();
				}
			} catch (error) {
				this._reject(error);
			}
		}

		this._isCanceled = true;
		if (this._rejectOnCancel) {
			this._reject(new CancelError(reason));
		}
	}

	get isCanceled() {
		return this._isCanceled;
	}
}

Object.setPrototypeOf(PCancelable.prototype, Promise.prototype);

module.exports = PCancelable;
module.exports.default = PCancelable;

module.exports.CancelError = CancelError;


/***/ }),
/* 558 */,
/* 559 */,
/* 560 */,
/* 561 */,
/* 562 */
/***/ (function(module) {

module.exports = obj => JSON.parse(JSON.stringify(obj))


/***/ }),
/* 563 */
/***/ (function(module) {

module.exports = new Map()


/***/ }),
/* 564 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var ListCache = __webpack_require__(670);

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache;
  this.size = 0;
}

module.exports = stackClear;


/***/ }),
/* 565 */,
/* 566 */
/***/ (function(module) {

module.exports = {"_from":"openid-client@^3.14.0","_id":"openid-client@3.14.0","_inBundle":false,"_integrity":"sha512-YgAEeuJRPcB4YHz5dD4dOMnCo/IZSzwiH4eCGStcejjEgA6ekWuHuIK+hV3vAsfB5APGLYyCLhVtda93wLEtFA==","_location":"/openid-client","_phantomChildren":{},"_requested":{"type":"range","registry":true,"raw":"openid-client@^3.14.0","name":"openid-client","escapedName":"openid-client","rawSpec":"^3.14.0","saveSpec":null,"fetchSpec":"^3.14.0"},"_requiredBy":["/"],"_resolved":"https://registry.npmjs.org/openid-client/-/openid-client-3.14.0.tgz","_shasum":"acf5103def7e9ea9523ae4bc171e18a0e577960a","_spec":"openid-client@^3.14.0","_where":"C:\\Users\\adstoffe\\OneDrive - Microsoft\\B2C Integrations\\GitHub Actions\\deploy-trustframework-policy\\deploy-trustframework-policy","author":{"name":"Filip Skokan","email":"panva.ip@gmail.com"},"bugs":{"url":"https://github.com/panva/node-openid-client/issues"},"bundleDependencies":false,"commitlint":{"extends":["@commitlint/config-conventional"]},"dependencies":{"@types/got":"^9.6.9","base64url":"^3.0.1","got":"^9.6.0","jose":"^1.23.0","lodash":"^4.17.15","lru-cache":"^5.1.1","make-error":"^1.3.5","object-hash":"^2.0.1","oidc-token-hash":"^5.0.0","p-any":"^3.0.0"},"deprecated":false,"description":"OpenID Connect Relying Party (RP, Client) implementation for Node.js runtime, supports passportjs","devDependencies":{"@commitlint/cli":"^8.3.4","@commitlint/config-conventional":"^8.3.4","@types/passport":"^1.0.2","chai":"^4.2.0","dtslint":"^2.0.5","eslint":"^6.8.0","eslint-config-airbnb-base":"^14.0.0","eslint-plugin-import":"^2.19.1","husky":"^4.0.0","mocha":"^7.0.0","nock":"^11.7.1","nyc":"^15.0.0","readable-mock-req":"^0.2.2","sinon":"^8.0.4","timekeeper":"^2.2.0"},"engines":{"node":"^10.13.0 || >=12.0.0"},"files":["lib","types/index.d.ts"],"funding":"https://github.com/sponsors/panva","homepage":"https://github.com/panva/node-openid-client","husky":{"hooks":{"commit-msg":"commitlint -E HUSKY_GIT_PARAMS"}},"keywords":["auth","authentication","basic","certified","client","connect","dynamic","electron","hybrid","identity","implicit","oauth","oauth2","oidc","openid","passport","relying party","strategy"],"license":"MIT","main":"lib/index.js","name":"openid-client","nyc":{"reporter":["lcov","text-summary"]},"repository":{"type":"git","url":"git+https://github.com/panva/node-openid-client.git"},"scripts":{"coverage":"nyc mocha test/**/*.test.js","lint":"eslint lib test && dtslint types","lint-fix":"eslint lib test --fix","test":"mocha test/**/*.test.js"},"types":"types/index.d.ts","version":"3.14.0","warnings":[{"code":"ENOTSUP","required":{"node":"^10.13.0 || >=12.0.0"},"pkgid":"openid-client@3.14.0"}]};

/***/ }),
/* 567 */,
/* 568 */,
/* 569 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var isKeyable = __webpack_require__(511);

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

module.exports = getMapData;


/***/ }),
/* 570 */,
/* 571 */,
/* 572 */,
/* 573 */,
/* 574 */,
/* 575 */
/***/ (function(module, __unusedexports, __webpack_require__) {

module.exports = __webpack_require__(894).default;
module.exports.default = module.exports;


/***/ }),
/* 576 */,
/* 577 */,
/* 578 */,
/* 579 */,
/* 580 */,
/* 581 */,
/* 582 */,
/* 583 */,
/* 584 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const {URL} = __webpack_require__(835); // TODO: Use the `URL` global when targeting Node.js 10
const util = __webpack_require__(669);
const EventEmitter = __webpack_require__(614);
const http = __webpack_require__(605);
const https = __webpack_require__(211);
const urlLib = __webpack_require__(835);
const CacheableRequest = __webpack_require__(946);
const toReadableStream = __webpack_require__(952);
const is = __webpack_require__(534);
const timer = __webpack_require__(54);
const timedOut = __webpack_require__(400);
const getBodySize = __webpack_require__(57);
const getResponse = __webpack_require__(176);
const progress = __webpack_require__(365);
const {CacheError, UnsupportedProtocolError, MaxRedirectsError, RequestError, TimeoutError} = __webpack_require__(774);
const urlToOptions = __webpack_require__(435);

const getMethodRedirectCodes = new Set([300, 301, 302, 303, 304, 305, 307, 308]);
const allMethodRedirectCodes = new Set([300, 303, 307, 308]);

module.exports = (options, input) => {
	const emitter = new EventEmitter();
	const redirects = [];
	let currentRequest;
	let requestUrl;
	let redirectString;
	let uploadBodySize;
	let retryCount = 0;
	let shouldAbort = false;

	const setCookie = options.cookieJar ? util.promisify(options.cookieJar.setCookie.bind(options.cookieJar)) : null;
	const getCookieString = options.cookieJar ? util.promisify(options.cookieJar.getCookieString.bind(options.cookieJar)) : null;
	const agents = is.object(options.agent) ? options.agent : null;

	const emitError = async error => {
		try {
			for (const hook of options.hooks.beforeError) {
				// eslint-disable-next-line no-await-in-loop
				error = await hook(error);
			}

			emitter.emit('error', error);
		} catch (error2) {
			emitter.emit('error', error2);
		}
	};

	const get = async options => {
		const currentUrl = redirectString || requestUrl;

		if (options.protocol !== 'http:' && options.protocol !== 'https:') {
			throw new UnsupportedProtocolError(options);
		}

		decodeURI(currentUrl);

		let fn;
		if (is.function(options.request)) {
			fn = {request: options.request};
		} else {
			fn = options.protocol === 'https:' ? https : http;
		}

		if (agents) {
			const protocolName = options.protocol === 'https:' ? 'https' : 'http';
			options.agent = agents[protocolName] || options.agent;
		}

		/* istanbul ignore next: electron.net is broken */
		if (options.useElectronNet && process.versions.electron) {
			const r = ({x: require})['yx'.slice(1)]; // Trick webpack
			const electron = r('electron');
			fn = electron.net || electron.remote.net;
		}

		if (options.cookieJar) {
			const cookieString = await getCookieString(currentUrl, {});

			if (is.nonEmptyString(cookieString)) {
				options.headers.cookie = cookieString;
			}
		}

		let timings;
		const handleResponse = async response => {
			try {
				/* istanbul ignore next: fixes https://github.com/electron/electron/blob/cbb460d47628a7a146adf4419ed48550a98b2923/lib/browser/api/net.js#L59-L65 */
				if (options.useElectronNet) {
					response = new Proxy(response, {
						get: (target, name) => {
							if (name === 'trailers' || name === 'rawTrailers') {
								return [];
							}

							const value = target[name];
							return is.function(value) ? value.bind(target) : value;
						}
					});
				}

				const {statusCode} = response;
				response.url = currentUrl;
				response.requestUrl = requestUrl;
				response.retryCount = retryCount;
				response.timings = timings;
				response.redirectUrls = redirects;
				response.request = {
					gotOptions: options
				};

				const rawCookies = response.headers['set-cookie'];
				if (options.cookieJar && rawCookies) {
					await Promise.all(rawCookies.map(rawCookie => setCookie(rawCookie, response.url)));
				}

				if (options.followRedirect && 'location' in response.headers) {
					if (allMethodRedirectCodes.has(statusCode) || (getMethodRedirectCodes.has(statusCode) && (options.method === 'GET' || options.method === 'HEAD'))) {
						response.resume(); // We're being redirected, we don't care about the response.

						if (statusCode === 303) {
							// Server responded with "see other", indicating that the resource exists at another location,
							// and the client should request it from that location via GET or HEAD.
							options.method = 'GET';
						}

						if (redirects.length >= 10) {
							throw new MaxRedirectsError(statusCode, redirects, options);
						}

						// Handles invalid URLs. See https://github.com/sindresorhus/got/issues/604
						const redirectBuffer = Buffer.from(response.headers.location, 'binary').toString();
						const redirectURL = new URL(redirectBuffer, currentUrl);
						redirectString = redirectURL.toString();

						redirects.push(redirectString);

						const redirectOptions = {
							...options,
							...urlToOptions(redirectURL)
						};

						for (const hook of options.hooks.beforeRedirect) {
							// eslint-disable-next-line no-await-in-loop
							await hook(redirectOptions);
						}

						emitter.emit('redirect', response, redirectOptions);

						await get(redirectOptions);
						return;
					}
				}

				getResponse(response, options, emitter);
			} catch (error) {
				emitError(error);
			}
		};

		const handleRequest = request => {
			if (shouldAbort) {
				request.once('error', () => {});
				request.abort();
				return;
			}

			currentRequest = request;

			request.once('error', error => {
				if (request.aborted) {
					return;
				}

				if (error instanceof timedOut.TimeoutError) {
					error = new TimeoutError(error, options);
				} else {
					error = new RequestError(error, options);
				}

				if (emitter.retry(error) === false) {
					emitError(error);
				}
			});

			timings = timer(request);

			progress.upload(request, emitter, uploadBodySize);

			if (options.gotTimeout) {
				timedOut(request, options.gotTimeout, options);
			}

			emitter.emit('request', request);

			const uploadComplete = () => {
				request.emit('upload-complete');
			};

			try {
				if (is.nodeStream(options.body)) {
					options.body.once('end', uploadComplete);
					options.body.pipe(request);
					options.body = undefined;
				} else if (options.body) {
					request.end(options.body, uploadComplete);
				} else if (input && (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH')) {
					input.once('end', uploadComplete);
					input.pipe(request);
				} else {
					request.end(uploadComplete);
				}
			} catch (error) {
				emitError(new RequestError(error, options));
			}
		};

		if (options.cache) {
			const cacheableRequest = new CacheableRequest(fn.request, options.cache);
			const cacheRequest = cacheableRequest(options, handleResponse);

			cacheRequest.once('error', error => {
				if (error instanceof CacheableRequest.RequestError) {
					emitError(new RequestError(error, options));
				} else {
					emitError(new CacheError(error, options));
				}
			});

			cacheRequest.once('request', handleRequest);
		} else {
			// Catches errors thrown by calling fn.request(...)
			try {
				handleRequest(fn.request(options, handleResponse));
			} catch (error) {
				emitError(new RequestError(error, options));
			}
		}
	};

	emitter.retry = error => {
		let backoff;

		try {
			backoff = options.retry.retries(++retryCount, error);
		} catch (error2) {
			emitError(error2);
			return;
		}

		if (backoff) {
			const retry = async options => {
				try {
					for (const hook of options.hooks.beforeRetry) {
						// eslint-disable-next-line no-await-in-loop
						await hook(options, error, retryCount);
					}

					await get(options);
				} catch (error) {
					emitError(error);
				}
			};

			setTimeout(retry, backoff, {...options, forceRefresh: true});
			return true;
		}

		return false;
	};

	emitter.abort = () => {
		if (currentRequest) {
			currentRequest.once('error', () => {});
			currentRequest.abort();
		} else {
			shouldAbort = true;
		}
	};

	setImmediate(async () => {
		try {
			// Convert buffer to stream to receive upload progress events (#322)
			const {body} = options;
			if (is.buffer(body)) {
				options.body = toReadableStream(body);
				uploadBodySize = body.length;
			} else {
				uploadBodySize = await getBodySize(options);
			}

			if (is.undefined(options.headers['content-length']) && is.undefined(options.headers['transfer-encoding'])) {
				if ((uploadBodySize > 0 || options.method === 'PUT') && !is.null(uploadBodySize)) {
					options.headers['content-length'] = uploadBodySize;
				}
			}

			for (const hook of options.hooks.beforeRequest) {
				// eslint-disable-next-line no-await-in-loop
				await hook(options);
			}

			requestUrl = options.href || (new URL(options.path, urlLib.format(options))).toString();

			await get(options);
		} catch (error) {
			emitError(error);
		}
	});

	return emitter;
};


/***/ }),
/* 585 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var baseGetTag = __webpack_require__(51),
    getPrototype = __webpack_require__(488),
    isObjectLike = __webpack_require__(337);

/** `Object#toString` result references. */
var objectTag = '[object Object]';

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString.call(Object);

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
    return false;
  }
  var proto = getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor == 'function' && Ctor instanceof Ctor &&
    funcToString.call(Ctor) == objectCtorString;
}

module.exports = isPlainObject;


/***/ }),
/* 586 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var getAllKeys = __webpack_require__(620);

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1;

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * A specialized version of `baseIsEqualDeep` for objects with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
      objProps = getAllKeys(object),
      objLength = objProps.length,
      othProps = getAllKeys(other),
      othLength = othProps.length;

  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
      return false;
    }
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(object);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var result = true;
  stack.set(object, other);
  stack.set(other, object);

  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key],
        othValue = other[key];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, objValue, key, other, object, stack)
        : customizer(objValue, othValue, key, object, other, stack);
    }
    // Recursively compare objects (susceptible to call stack limits).
    if (!(compared === undefined
          ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
          : compared
        )) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == 'constructor');
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor,
        othCtor = other.constructor;

    // Non `Object` object instances with different constructors are not equal.
    if (objCtor != othCtor &&
        ('constructor' in object && 'constructor' in other) &&
        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack['delete'](object);
  stack['delete'](other);
  return result;
}

module.exports = equalObjects;


/***/ }),
/* 587 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var baseMerge = __webpack_require__(834),
    createAssigner = __webpack_require__(797);

/**
 * This method is like `_.assign` except that it recursively merges own and
 * inherited enumerable string keyed properties of source objects into the
 * destination object. Source properties that resolve to `undefined` are
 * skipped if a destination value exists. Array and plain object properties
 * are merged recursively. Other objects and value types are overridden by
 * assignment. Source objects are applied from left to right. Subsequent
 * sources overwrite property assignments of previous sources.
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @memberOf _
 * @since 0.5.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @example
 *
 * var object = {
 *   'a': [{ 'b': 2 }, { 'd': 4 }]
 * };
 *
 * var other = {
 *   'a': [{ 'c': 3 }, { 'e': 5 }]
 * };
 *
 * _.merge(object, other);
 * // => { 'a': [{ 'b': 2, 'c': 3 }, { 'd': 4, 'e': 5 }] }
 */
var merge = createAssigner(function(object, source, srcIndex) {
  baseMerge(object, source, srcIndex);
});

module.exports = merge;


/***/ }),
/* 588 */,
/* 589 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var copyObject = __webpack_require__(875),
    getSymbolsIn = __webpack_require__(386);

/**
 * Copies own and inherited symbols of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbolsIn(source, object) {
  return copyObject(source, getSymbolsIn(source), object);
}

module.exports = copySymbolsIn;


/***/ }),
/* 590 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(422);
tslib_1.__exportStar(__webpack_require__(552), exports);
tslib_1.__exportStar(__webpack_require__(64), exports);
tslib_1.__exportStar(__webpack_require__(618), exports);
tslib_1.__exportStar(__webpack_require__(306), exports);
tslib_1.__exportStar(__webpack_require__(880), exports);
tslib_1.__exportStar(__webpack_require__(19), exports);
tslib_1.__exportStar(__webpack_require__(886), exports);
tslib_1.__exportStar(__webpack_require__(531), exports);
tslib_1.__exportStar(__webpack_require__(848), exports);
tslib_1.__exportStar(__webpack_require__(770), exports);
tslib_1.__exportStar(__webpack_require__(343), exports);
tslib_1.__exportStar(__webpack_require__(722), exports);
tslib_1.__exportStar(__webpack_require__(80), exports);
tslib_1.__exportStar(__webpack_require__(29), exports);
tslib_1.__exportStar(__webpack_require__(546), exports);
tslib_1.__exportStar(__webpack_require__(765), exports);
tslib_1.__exportStar(__webpack_require__(631), exports);
tslib_1.__exportStar(__webpack_require__(345), exports);
//# sourceMappingURL=index.js.map

/***/ }),
/* 591 */,
/* 592 */,
/* 593 */,
/* 594 */,
/* 595 */
/***/ (function(module) {

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  var data = this.__data__,
      result = data['delete'](key);

  this.size = data.size;
  return result;
}

module.exports = stackDelete;


/***/ }),
/* 596 */,
/* 597 */,
/* 598 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var ListCache = __webpack_require__(670),
    stackClear = __webpack_require__(564),
    stackDelete = __webpack_require__(595),
    stackGet = __webpack_require__(870),
    stackHas = __webpack_require__(896),
    stackSet = __webpack_require__(986);

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

module.exports = Stack;


/***/ }),
/* 599 */,
/* 600 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var Uint8Array = __webpack_require__(161);

/**
 * Creates a clone of `arrayBuffer`.
 *
 * @private
 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */
function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
  return result;
}

module.exports = cloneArrayBuffer;


/***/ }),
/* 601 */,
/* 602 */
/***/ (function(module) {

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

module.exports = objectToString;


/***/ }),
/* 603 */,
/* 604 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var getMapData = __webpack_require__(569);

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

module.exports = mapCacheGet;


/***/ }),
/* 605 */
/***/ (function(module) {

module.exports = require("http");

/***/ }),
/* 606 */,
/* 607 */,
/* 608 */,
/* 609 */,
/* 610 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var copyObject = __webpack_require__(875),
    keysIn = __webpack_require__(971);

/**
 * The base implementation of `_.assignIn` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssignIn(object, source) {
  return object && copyObject(source, keysIn(source), object);
}

module.exports = baseAssignIn;


/***/ }),
/* 611 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { inspect } = __webpack_require__(669)

const Key = __webpack_require__(228)

class NoneKey extends Key {
  constructor () {
    super({ type: 'unsecured' }, { alg: 'none' })
    Object.defineProperties(this, {
      kid: { value: undefined },
      thumbprint: { value: undefined },
      toJWK: { value: undefined },
      toPEM: { value: undefined }
    })
  }

  /* c8 ignore next 3 */
  [inspect.custom] () {
    return 'None {}'
  }

  algorithms (operation) {
    switch (operation) {
      case 'sign':
      case 'verify':
      case undefined:
        return new Set(['none'])
      default:
        return new Set()
    }
  }
}

module.exports = new NoneKey({ type: 'unsecured' }, { alg: 'none' })


/***/ }),
/* 612 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

module.exports = Yallist

Yallist.Node = Node
Yallist.create = Yallist

function Yallist (list) {
  var self = this
  if (!(self instanceof Yallist)) {
    self = new Yallist()
  }

  self.tail = null
  self.head = null
  self.length = 0

  if (list && typeof list.forEach === 'function') {
    list.forEach(function (item) {
      self.push(item)
    })
  } else if (arguments.length > 0) {
    for (var i = 0, l = arguments.length; i < l; i++) {
      self.push(arguments[i])
    }
  }

  return self
}

Yallist.prototype.removeNode = function (node) {
  if (node.list !== this) {
    throw new Error('removing node which does not belong to this list')
  }

  var next = node.next
  var prev = node.prev

  if (next) {
    next.prev = prev
  }

  if (prev) {
    prev.next = next
  }

  if (node === this.head) {
    this.head = next
  }
  if (node === this.tail) {
    this.tail = prev
  }

  node.list.length--
  node.next = null
  node.prev = null
  node.list = null

  return next
}

Yallist.prototype.unshiftNode = function (node) {
  if (node === this.head) {
    return
  }

  if (node.list) {
    node.list.removeNode(node)
  }

  var head = this.head
  node.list = this
  node.next = head
  if (head) {
    head.prev = node
  }

  this.head = node
  if (!this.tail) {
    this.tail = node
  }
  this.length++
}

Yallist.prototype.pushNode = function (node) {
  if (node === this.tail) {
    return
  }

  if (node.list) {
    node.list.removeNode(node)
  }

  var tail = this.tail
  node.list = this
  node.prev = tail
  if (tail) {
    tail.next = node
  }

  this.tail = node
  if (!this.head) {
    this.head = node
  }
  this.length++
}

Yallist.prototype.push = function () {
  for (var i = 0, l = arguments.length; i < l; i++) {
    push(this, arguments[i])
  }
  return this.length
}

Yallist.prototype.unshift = function () {
  for (var i = 0, l = arguments.length; i < l; i++) {
    unshift(this, arguments[i])
  }
  return this.length
}

Yallist.prototype.pop = function () {
  if (!this.tail) {
    return undefined
  }

  var res = this.tail.value
  this.tail = this.tail.prev
  if (this.tail) {
    this.tail.next = null
  } else {
    this.head = null
  }
  this.length--
  return res
}

Yallist.prototype.shift = function () {
  if (!this.head) {
    return undefined
  }

  var res = this.head.value
  this.head = this.head.next
  if (this.head) {
    this.head.prev = null
  } else {
    this.tail = null
  }
  this.length--
  return res
}

Yallist.prototype.forEach = function (fn, thisp) {
  thisp = thisp || this
  for (var walker = this.head, i = 0; walker !== null; i++) {
    fn.call(thisp, walker.value, i, this)
    walker = walker.next
  }
}

Yallist.prototype.forEachReverse = function (fn, thisp) {
  thisp = thisp || this
  for (var walker = this.tail, i = this.length - 1; walker !== null; i--) {
    fn.call(thisp, walker.value, i, this)
    walker = walker.prev
  }
}

Yallist.prototype.get = function (n) {
  for (var i = 0, walker = this.head; walker !== null && i < n; i++) {
    // abort out of the list early if we hit a cycle
    walker = walker.next
  }
  if (i === n && walker !== null) {
    return walker.value
  }
}

Yallist.prototype.getReverse = function (n) {
  for (var i = 0, walker = this.tail; walker !== null && i < n; i++) {
    // abort out of the list early if we hit a cycle
    walker = walker.prev
  }
  if (i === n && walker !== null) {
    return walker.value
  }
}

Yallist.prototype.map = function (fn, thisp) {
  thisp = thisp || this
  var res = new Yallist()
  for (var walker = this.head; walker !== null;) {
    res.push(fn.call(thisp, walker.value, this))
    walker = walker.next
  }
  return res
}

Yallist.prototype.mapReverse = function (fn, thisp) {
  thisp = thisp || this
  var res = new Yallist()
  for (var walker = this.tail; walker !== null;) {
    res.push(fn.call(thisp, walker.value, this))
    walker = walker.prev
  }
  return res
}

Yallist.prototype.reduce = function (fn, initial) {
  var acc
  var walker = this.head
  if (arguments.length > 1) {
    acc = initial
  } else if (this.head) {
    walker = this.head.next
    acc = this.head.value
  } else {
    throw new TypeError('Reduce of empty list with no initial value')
  }

  for (var i = 0; walker !== null; i++) {
    acc = fn(acc, walker.value, i)
    walker = walker.next
  }

  return acc
}

Yallist.prototype.reduceReverse = function (fn, initial) {
  var acc
  var walker = this.tail
  if (arguments.length > 1) {
    acc = initial
  } else if (this.tail) {
    walker = this.tail.prev
    acc = this.tail.value
  } else {
    throw new TypeError('Reduce of empty list with no initial value')
  }

  for (var i = this.length - 1; walker !== null; i--) {
    acc = fn(acc, walker.value, i)
    walker = walker.prev
  }

  return acc
}

Yallist.prototype.toArray = function () {
  var arr = new Array(this.length)
  for (var i = 0, walker = this.head; walker !== null; i++) {
    arr[i] = walker.value
    walker = walker.next
  }
  return arr
}

Yallist.prototype.toArrayReverse = function () {
  var arr = new Array(this.length)
  for (var i = 0, walker = this.tail; walker !== null; i++) {
    arr[i] = walker.value
    walker = walker.prev
  }
  return arr
}

Yallist.prototype.slice = function (from, to) {
  to = to || this.length
  if (to < 0) {
    to += this.length
  }
  from = from || 0
  if (from < 0) {
    from += this.length
  }
  var ret = new Yallist()
  if (to < from || to < 0) {
    return ret
  }
  if (from < 0) {
    from = 0
  }
  if (to > this.length) {
    to = this.length
  }
  for (var i = 0, walker = this.head; walker !== null && i < from; i++) {
    walker = walker.next
  }
  for (; walker !== null && i < to; i++, walker = walker.next) {
    ret.push(walker.value)
  }
  return ret
}

Yallist.prototype.sliceReverse = function (from, to) {
  to = to || this.length
  if (to < 0) {
    to += this.length
  }
  from = from || 0
  if (from < 0) {
    from += this.length
  }
  var ret = new Yallist()
  if (to < from || to < 0) {
    return ret
  }
  if (from < 0) {
    from = 0
  }
  if (to > this.length) {
    to = this.length
  }
  for (var i = this.length, walker = this.tail; walker !== null && i > to; i--) {
    walker = walker.prev
  }
  for (; walker !== null && i > from; i--, walker = walker.prev) {
    ret.push(walker.value)
  }
  return ret
}

Yallist.prototype.splice = function (start, deleteCount /*, ...nodes */) {
  if (start > this.length) {
    start = this.length - 1
  }
  if (start < 0) {
    start = this.length + start;
  }

  for (var i = 0, walker = this.head; walker !== null && i < start; i++) {
    walker = walker.next
  }

  var ret = []
  for (var i = 0; walker && i < deleteCount; i++) {
    ret.push(walker.value)
    walker = this.removeNode(walker)
  }
  if (walker === null) {
    walker = this.tail
  }

  if (walker !== this.head && walker !== this.tail) {
    walker = walker.prev
  }

  for (var i = 2; i < arguments.length; i++) {
    walker = insert(this, walker, arguments[i])
  }
  return ret;
}

Yallist.prototype.reverse = function () {
  var head = this.head
  var tail = this.tail
  for (var walker = head; walker !== null; walker = walker.prev) {
    var p = walker.prev
    walker.prev = walker.next
    walker.next = p
  }
  this.head = tail
  this.tail = head
  return this
}

function insert (self, node, value) {
  var inserted = node === self.head ?
    new Node(value, null, node, self) :
    new Node(value, node, node.next, self)

  if (inserted.next === null) {
    self.tail = inserted
  }
  if (inserted.prev === null) {
    self.head = inserted
  }

  self.length++

  return inserted
}

function push (self, item) {
  self.tail = new Node(item, self.tail, null, self)
  if (!self.head) {
    self.head = self.tail
  }
  self.length++
}

function unshift (self, item) {
  self.head = new Node(item, null, self.head, self)
  if (!self.tail) {
    self.tail = self.head
  }
  self.length++
}

function Node (value, prev, next, list) {
  if (!(this instanceof Node)) {
    return new Node(value, prev, next, list)
  }

  this.list = list
  this.value = value

  if (prev) {
    prev.next = this
    this.prev = prev
  } else {
    this.prev = null
  }

  if (next) {
    next.prev = this
    this.next = next
  } else {
    this.next = null
  }
}

try {
  // add if support for Symbol.iterator is present
  __webpack_require__(396)(Yallist)
} catch (er) {}


/***/ }),
/* 613 */,
/* 614 */
/***/ (function(module) {

module.exports = require("events");

/***/ }),
/* 615 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { strict: assert } = __webpack_require__(357);
const { createHash } = __webpack_require__(417);
const { format } = __webpack_require__(669);

const shake256 = __webpack_require__(682);

const fromBase64 = (base64) => base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
const encode = (input) => fromBase64(input.toString('base64'));

/** SPECIFICATION
 * Its (_hash) value is the base64url encoding of the left-most half of the hash of the octets of
 * the ASCII representation of the token value, where the hash algorithm used is the hash algorithm
 * used in the alg Header Parameter of the ID Token's JOSE Header. For instance, if the alg is
 * RS256, hash the token value with SHA-256, then take the left-most 128 bits and base64url encode
 * them. The _hash value is a case sensitive string.
 */

/**
 * @name getHash
 * @api private
 *
 * returns the sha length based off the JOSE alg heade value, defaults to sha256
 *
 * @param token {String} token value to generate the hash from
 * @param alg {String} ID Token JOSE header alg value (i.e. RS256, HS384, ES512, PS256)
 * @param [crv] {String} For EdDSA the curve decides what hash algorithm is used. Required for EdDSA
 */
function getHash(alg, crv) {
  switch (alg) {
    case 'HS256':
    case 'RS256':
    case 'PS256':
    case 'ES256':
    case 'ES256K':
      return createHash('sha256');

    case 'HS384':
    case 'RS384':
    case 'PS384':
    case 'ES384':
      return createHash('sha384');

    case 'HS512':
    case 'RS512':
    case 'PS512':
    case 'ES512':
      return createHash('sha512');

    case 'EdDSA':
      switch (crv) {
        case 'Ed25519':
          return createHash('sha512');
        case 'Ed448':
          if (!shake256) {
            throw new TypeError('Ed448 *_hash calculation is not supported in your Node.js runtime version');
          }

          return createHash('shake256', { outputLength: 114 });
        default:
          throw new TypeError('unrecognized or invalid EdDSA curve provided');
      }

    default:
      throw new TypeError('unrecognized or invalid JWS algorithm provided');
  }
}

function generate(token, alg, crv) {
  const digest = getHash(alg, crv).update(token).digest();
  return encode(digest.slice(0, digest.length / 2));
}

function validate(names, actual, source, alg, crv) {
  if (typeof names.claim !== 'string' || !names.claim) {
    throw new TypeError('names.claim must be a non-empty string');
  }

  if (typeof names.source !== 'string' || !names.source) {
    throw new TypeError('names.source must be a non-empty string');
  }

  assert(typeof actual === 'string' && actual, `${names.claim} must be a non-empty string`);
  assert(typeof source === 'string' && source, `${names.source} must be a non-empty string`);

  let expected;
  let msg;
  try {
    expected = generate(source, alg, crv);
  } catch (err) {
    msg = format('%s could not be validated (%s)', names.claim, err.message);
  }

  msg = msg || format('%s mismatch, expected %s, got: %s', names.claim, expected, actual);

  assert.equal(expected, actual, msg);
}

module.exports = {
  validate,
  generate,
};


/***/ }),
/* 616 */
/***/ (function(module, exports, __webpack_require__) {

/* module decorator */ module = __webpack_require__.nmd(module);
var freeGlobal = __webpack_require__(973);

/** Detect free variable `exports`. */
var freeExports =  true && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && "object" == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    // Use `util.types` for Node.js 10+.
    var types = freeModule && freeModule.require && freeModule.require('util').types;

    if (types) {
      return types;
    }

    // Legacy `process.binding('util')` for Node.js < 10.
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

module.exports = nodeUtil;


/***/ }),
/* 617 */,
/* 618 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(422);
var MiddlewareControl_1 = __webpack_require__(5);
var MiddlewareUtil_1 = __webpack_require__(874);
var AuthenticationHandlerOptions_1 = __webpack_require__(531);
var TelemetryHandlerOptions_1 = __webpack_require__(343);
/**
 * @class
 * @implements Middleware
 * Class representing AuthenticationHandler
 */
var AuthenticationHandler = /** @class */ (function () {
    /**
     * @public
     * @constructor
     * Creates an instance of AuthenticationHandler
     * @param {AuthenticationProvider} authenticationProvider - The authentication provider for the authentication handler
     */
    function AuthenticationHandler(authenticationProvider) {
        this.authenticationProvider = authenticationProvider;
    }
    /**
     * @public
     * @async
     * To execute the current middleware
     * @param {Context} context - The context object of the request
     * @returns A Promise that resolves to nothing
     */
    AuthenticationHandler.prototype.execute = function (context) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var options, authenticationProvider, authenticationProviderOptions, token, bearerKey, error_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        options = void 0;
                        if (context.middlewareControl instanceof MiddlewareControl_1.MiddlewareControl) {
                            options = context.middlewareControl.getMiddlewareOptions(AuthenticationHandlerOptions_1.AuthenticationHandlerOptions);
                        }
                        authenticationProvider = void 0;
                        authenticationProviderOptions = void 0;
                        if (typeof options !== "undefined") {
                            authenticationProvider = options.authenticationProvider;
                            authenticationProviderOptions = options.authenticationProviderOptions;
                        }
                        if (typeof authenticationProvider === "undefined") {
                            authenticationProvider = this.authenticationProvider;
                        }
                        return [4 /*yield*/, authenticationProvider.getAccessToken(authenticationProviderOptions)];
                    case 1:
                        token = _a.sent();
                        bearerKey = "Bearer " + token;
                        MiddlewareUtil_1.appendRequestHeader(context.request, context.options, AuthenticationHandler.AUTHORIZATION_HEADER, bearerKey);
                        TelemetryHandlerOptions_1.TelemetryHandlerOptions.updateFeatureUsageFlag(context, TelemetryHandlerOptions_1.FeatureUsageFlag.AUTHENTICATION_HANDLER_ENABLED);
                        return [4 /*yield*/, this.nextMiddleware.execute(context)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_1 = _a.sent();
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @public
     * To set the next middleware in the chain
     * @param {Middleware} next - The middleware instance
     * @returns Nothing
     */
    AuthenticationHandler.prototype.setNext = function (next) {
        this.nextMiddleware = next;
    };
    /**
     * @private
     * A member representing the authorization header name
     */
    AuthenticationHandler.AUTHORIZATION_HEADER = "Authorization";
    return AuthenticationHandler;
}());
exports.AuthenticationHandler = AuthenticationHandler;
//# sourceMappingURL=AuthenticationHandler.js.map

/***/ }),
/* 619 */,
/* 620 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var baseGetAllKeys = __webpack_require__(857),
    getSymbols = __webpack_require__(709),
    keys = __webpack_require__(863);

/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys(object) {
  return baseGetAllKeys(object, keys, getSymbols);
}

module.exports = getAllKeys;


/***/ }),
/* 621 */,
/* 622 */
/***/ (function(module) {

module.exports = require("path");

/***/ }),
/* 623 */,
/* 624 */,
/* 625 */,
/* 626 */,
/* 627 */,
/* 628 */,
/* 629 */
/***/ (function(module, exports, __webpack_require__) {

/* module decorator */ module = __webpack_require__.nmd(module);
var root = __webpack_require__(824),
    stubFalse = __webpack_require__(451);

/** Detect free variable `exports`. */
var freeExports =  true && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && "object" == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

module.exports = isBuffer;


/***/ }),
/* 630 */,
/* 631 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(422);
var GraphErrorHandler_1 = __webpack_require__(751);
var GraphRequestUtil_1 = __webpack_require__(665);
var GraphResponseHandler_1 = __webpack_require__(856);
var MiddlewareControl_1 = __webpack_require__(5);
var RequestMethod_1 = __webpack_require__(819);
var ResponseType_1 = __webpack_require__(345);
/**
 * @class
 * A Class representing GraphRequest
 */
var GraphRequest = /** @class */ (function () {
    /* tslint:enable: variable-name */
    /**
     * @public
     * @constructor
     * Creates an instance of GraphRequest
     * @param {HTTPClient} httpClient - The HTTPClient instance
     * @param {ClientOptions} config - The options for making request
     * @param {string} path - A path string
     */
    function GraphRequest(httpClient, config, path) {
        var _this = this;
        /**
         * @private
         * Parses the path string and creates URLComponents out of it
         * @param {string} path - The request path string
         * @returns Nothing
         */
        this.parsePath = function (path) {
            // Strips out the base of the url if they passed in
            if (path.indexOf("https://") !== -1) {
                path = path.replace("https://", "");
                // Find where the host ends
                var endOfHostStrPos = path.indexOf("/");
                if (endOfHostStrPos !== -1) {
                    // Parse out the host
                    _this.urlComponents.host = "https://" + path.substring(0, endOfHostStrPos);
                    // Strip the host from path
                    path = path.substring(endOfHostStrPos + 1, path.length);
                }
                // Remove the following version
                var endOfVersionStrPos = path.indexOf("/");
                if (endOfVersionStrPos !== -1) {
                    // Parse out the version
                    _this.urlComponents.version = path.substring(0, endOfVersionStrPos);
                    // Strip version from path
                    path = path.substring(endOfVersionStrPos + 1, path.length);
                }
            }
            // Strip out any leading "/"
            if (path.charAt(0) === "/") {
                path = path.substr(1);
            }
            var queryStrPos = path.indexOf("?");
            if (queryStrPos === -1) {
                // No query string
                _this.urlComponents.path = path;
            }
            else {
                _this.urlComponents.path = path.substr(0, queryStrPos);
                // Capture query string into oDataQueryParams and otherURLQueryParams
                var queryParams = path.substring(queryStrPos + 1, path.length).split("&");
                for (var _i = 0, queryParams_1 = queryParams; _i < queryParams_1.length; _i++) {
                    var queryParam = queryParams_1[_i];
                    var qParams = queryParam.split("=");
                    var key = qParams[0];
                    var value = qParams[1];
                    if (GraphRequestUtil_1.oDataQueryNames.indexOf(key) !== -1) {
                        _this.urlComponents.oDataQueryParams[key] = value;
                    }
                    else {
                        _this.urlComponents.otherURLQueryParams[key] = value;
                    }
                }
            }
        };
        this.httpClient = httpClient;
        this.config = config;
        this.urlComponents = {
            host: this.config.baseUrl,
            version: this.config.defaultVersion,
            oDataQueryParams: {},
            otherURLQueryParams: {},
        };
        this._headers = {};
        this._options = {};
        this._middlewareOptions = [];
        this.parsePath(path);
    }
    /**
     * @private
     * Adds the query parameter as comma separated values
     * @param {string} propertyName - The name of a property
     * @param {string|string[]} propertyValue - The vale of a property
     * @param {IArguments} additionalProperties - The additional properties
     * @returns Nothing
     */
    GraphRequest.prototype.addCsvQueryParameter = function (propertyName, propertyValue, additionalProperties) {
        // If there are already $propertyName value there, append a ","
        this.urlComponents.oDataQueryParams[propertyName] = this.urlComponents.oDataQueryParams[propertyName] ? this.urlComponents.oDataQueryParams[propertyName] + "," : "";
        var allValues = [];
        if (additionalProperties.length > 1 && typeof propertyValue === "string") {
            allValues = Array.prototype.slice.call(additionalProperties);
        }
        else if (typeof propertyValue === "string") {
            allValues.push(propertyValue);
        }
        else {
            allValues = allValues.concat(propertyValue);
        }
        this.urlComponents.oDataQueryParams[propertyName] += allValues.join(",");
    };
    /**
     * @private
     * Builds the full url from the URLComponents to make a request
     * @returns The URL string that is qualified to make a request to graph endpoint
     */
    GraphRequest.prototype.buildFullUrl = function () {
        var url = GraphRequestUtil_1.urlJoin([this.urlComponents.host, this.urlComponents.version, this.urlComponents.path]) + this.createQueryString();
        if (this.config.debugLogging) {
            console.log(url); // tslint:disable-line: no-console
        }
        return url;
    };
    /**
     * @private
     * Builds the query string from the URLComponents
     * @returns The Constructed query string
     */
    GraphRequest.prototype.createQueryString = function () {
        // Combining query params from oDataQueryParams and otherURLQueryParams
        var urlComponents = this.urlComponents;
        var query = [];
        if (Object.keys(urlComponents.oDataQueryParams).length !== 0) {
            for (var property in urlComponents.oDataQueryParams) {
                if (urlComponents.oDataQueryParams.hasOwnProperty(property)) {
                    query.push(property + "=" + urlComponents.oDataQueryParams[property]);
                }
            }
        }
        if (Object.keys(urlComponents.otherURLQueryParams).length !== 0) {
            for (var property in urlComponents.otherURLQueryParams) {
                if (urlComponents.otherURLQueryParams.hasOwnProperty(property)) {
                    query.push(property + "=" + urlComponents.otherURLQueryParams[property]);
                }
            }
        }
        return query.length > 0 ? "?" + query.join("&") : "";
    };
    /**
     * @private
     * Updates the custom headers and options for a request
     * @param {FetchOptions} options - The request options object
     * @returns Nothing
     */
    GraphRequest.prototype.updateRequestOptions = function (options) {
        var optionsHeaders = tslib_1.__assign({}, options.headers);
        if (this.config.fetchOptions !== undefined) {
            var fetchOptions = tslib_1.__assign({}, this.config.fetchOptions);
            Object.assign(options, fetchOptions);
            if (typeof this.config.fetchOptions.headers !== undefined) {
                options.headers = tslib_1.__assign({}, this.config.fetchOptions.headers);
            }
        }
        Object.assign(options, this._options);
        if (options.headers !== undefined) {
            Object.assign(optionsHeaders, options.headers);
        }
        Object.assign(optionsHeaders, this._headers);
        options.headers = optionsHeaders;
    };
    /**
     * @private
     * @async
     * Adds the custom headers and options to the request and makes the HTTPClient send request call
     * @param {RequestInfo} request - The request url string or the Request object value
     * @param {FetchOptions} options - The options to make a request
     * @param {GraphRequestCallback} [callback] - The callback function to be called in response with async call
     * @returns A promise that resolves to the response content
     */
    GraphRequest.prototype.send = function (request, options, callback) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var rawResponse, middlewareControl, context_1, response, error_1, statusCode, gError;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        middlewareControl = new MiddlewareControl_1.MiddlewareControl(this._middlewareOptions);
                        this.updateRequestOptions(options);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 6]);
                        return [4 /*yield*/, this.httpClient.sendRequest({
                                request: request,
                                options: options,
                                middlewareControl: middlewareControl,
                            })];
                    case 2:
                        context_1 = _a.sent();
                        rawResponse = context_1.response;
                        return [4 /*yield*/, GraphResponseHandler_1.GraphResponseHandler.getResponse(rawResponse, this._responseType, callback)];
                    case 3:
                        response = _a.sent();
                        return [2 /*return*/, response];
                    case 4:
                        error_1 = _a.sent();
                        statusCode = void 0;
                        if (typeof rawResponse !== "undefined") {
                            statusCode = rawResponse.status;
                        }
                        return [4 /*yield*/, GraphErrorHandler_1.GraphErrorHandler.getError(error_1, statusCode, callback)];
                    case 5:
                        gError = _a.sent();
                        throw gError;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @public
     * Sets the custom header for a request
     * @param {string} headerKey - A header key
     * @param {string} headerValue - A header value
     * @returns The same GraphRequest instance that is being called with
     */
    GraphRequest.prototype.header = function (headerKey, headerValue) {
        this._headers[headerKey] = headerValue;
        return this;
    };
    /**
     * @public
     * Sets the custom headers for a request
     * @param {KeyValuePairObjectStringNumber} headers - The headers key value pair object
     * @returns The same GraphRequest instance that is being called with
     */
    GraphRequest.prototype.headers = function (headers) {
        for (var key in headers) {
            if (headers.hasOwnProperty(key)) {
                this._headers[key] = headers[key];
            }
        }
        return this;
    };
    /**
     * @public
     * Sets the option for making a request
     * @param {string} key - The key value
     * @param {any} value - The value
     * @returns The same GraphRequest instance that is being called with
     */
    GraphRequest.prototype.option = function (key, value) {
        this._options[key] = value;
        return this;
    };
    /**
     * @public
     * Sets the options for making a request
     * @param {{ [key: string]: any }} options - The options key value pair
     * @returns The same GraphRequest instance that is being called with
     */
    GraphRequest.prototype.options = function (options) {
        for (var key in options) {
            if (options.hasOwnProperty(key)) {
                this._options[key] = options[key];
            }
        }
        return this;
    };
    /**
     * @public
     * Sets the middleware options for a request
     * @param {MiddlewareOptions[]} options - The array of middleware options
     * @returns The same GraphRequest instance that is being called with
     */
    GraphRequest.prototype.middlewareOptions = function (options) {
        this._middlewareOptions = options;
        return this;
    };
    /**
     * @public
     * Sets the api endpoint version for a request
     * @param {string} version - The version value
     * @returns The same GraphRequest instance that is being called with
     */
    GraphRequest.prototype.version = function (version) {
        this.urlComponents.version = version;
        return this;
    };
    /**
     * @public
     * Sets the api endpoint version for a request
     * @param {ResponseType} responseType - The response type value
     * @returns The same GraphRequest instance that is being called with
     */
    GraphRequest.prototype.responseType = function (responseType) {
        this._responseType = responseType;
        return this;
    };
    /**
     * @public
     * To add properties for select OData Query param
     * @param {string|string[]} properties - The Properties value
     * @returns The same GraphRequest instance that is being called with
     */
    /*
     * Accepts .select("displayName,birthday")
     *     and .select(["displayName", "birthday"])
     *     and .select("displayName", "birthday")
     *
     */
    GraphRequest.prototype.select = function (properties) {
        this.addCsvQueryParameter("$select", properties, arguments);
        return this;
    };
    /**
     * @public
     * To add properties for expand OData Query param
     * @param {string|string[]} properties - The Properties value
     * @returns The same GraphRequest instance that is being called with
     */
    GraphRequest.prototype.expand = function (properties) {
        this.addCsvQueryParameter("$expand", properties, arguments);
        return this;
    };
    /**
     * @public
     * To add properties for orderby OData Query param
     * @param {string|string[]} properties - The Properties value
     * @returns The same GraphRequest instance that is being called with
     */
    GraphRequest.prototype.orderby = function (properties) {
        this.addCsvQueryParameter("$orderby", properties, arguments);
        return this;
    };
    /**
     * @public
     * To add query string for filter OData Query param
     * @param {string} filterStr - The filter query string
     * @returns The same GraphRequest instance that is being called with
     */
    GraphRequest.prototype.filter = function (filterStr) {
        this.urlComponents.oDataQueryParams.$filter = filterStr;
        return this;
    };
    /**
     * @public
     * To add criterion for search OData Query param
     * @param {string} searchStr - The search criterion string
     * @returns The same GraphRequest instance that is being called with
     */
    GraphRequest.prototype.search = function (searchStr) {
        this.urlComponents.oDataQueryParams.$search = searchStr;
        return this;
    };
    /**
     * @public
     * To add number for top OData Query param
     * @param {number} n - The number value
     * @returns The same GraphRequest instance that is being called with
     */
    GraphRequest.prototype.top = function (n) {
        this.urlComponents.oDataQueryParams.$top = n;
        return this;
    };
    /**
     * @public
     * To add number for skip OData Query param
     * @param {number} n - The number value
     * @returns The same GraphRequest instance that is being called with
     */
    GraphRequest.prototype.skip = function (n) {
        this.urlComponents.oDataQueryParams.$skip = n;
        return this;
    };
    /**
     * @public
     * To add token string for skipToken OData Query param
     * @param {string} token - The token value
     * @returns The same GraphRequest instance that is being called with
     */
    GraphRequest.prototype.skipToken = function (token) {
        this.urlComponents.oDataQueryParams.$skipToken = token;
        return this;
    };
    /**
     * @public
     * To add boolean for count OData Query param
     * @param {boolean} isCount - The count boolean
     * @returns The same GraphRequest instance that is being called with
     */
    GraphRequest.prototype.count = function (isCount) {
        this.urlComponents.oDataQueryParams.$count = isCount.toString();
        return this;
    };
    /**
     * @public
     * Appends query string to the urlComponent
     * @param {string|KeyValuePairObjectStringNumber} queryDictionaryOrString - The query value
     * @returns The same GraphRequest instance that is being called with
     */
    GraphRequest.prototype.query = function (queryDictionaryOrString) {
        var otherURLQueryParams = this.urlComponents.otherURLQueryParams;
        if (typeof queryDictionaryOrString === "string") {
            var querySplit = queryDictionaryOrString.split("=");
            var queryKey = querySplit[0];
            var queryValue = querySplit[1];
            otherURLQueryParams[queryKey] = queryValue;
        }
        else {
            for (var key in queryDictionaryOrString) {
                if (queryDictionaryOrString.hasOwnProperty(key)) {
                    otherURLQueryParams[key] = queryDictionaryOrString[key];
                }
            }
        }
        return this;
    };
    /**
     * @public
     * @async
     * Makes a http request with GET method
     * @param {GraphRequestCallback} [callback] - The callback function to be called in response with async call
     * @returns A promise that resolves to the get response
     */
    GraphRequest.prototype.get = function (callback) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var url, options, response, error_2;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = this.buildFullUrl();
                        options = {
                            method: RequestMethod_1.RequestMethod.GET,
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.send(url, options, callback)];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response];
                    case 3:
                        error_2 = _a.sent();
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @public
     * @async
     * Makes a http request with POST method
     * @param {any} content - The content that needs to be sent with the request
     * @param {GraphRequestCallback} [callback] - The callback function to be called in response with async call
     * @returns A promise that resolves to the post response
     */
    GraphRequest.prototype.post = function (content, callback) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var url, options, response, error_3;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = this.buildFullUrl();
                        options = {
                            method: RequestMethod_1.RequestMethod.POST,
                            body: GraphRequestUtil_1.serializeContent(content),
                            headers: typeof FormData !== "undefined" && content instanceof FormData
                                ? {}
                                : {
                                    "Content-Type": "application/json",
                                },
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.send(url, options, callback)];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response];
                    case 3:
                        error_3 = _a.sent();
                        throw error_3;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @public
     * @async
     * Alias for Post request call
     * @param {any} content - The content that needs to be sent with the request
     * @param {GraphRequestCallback} [callback] - The callback function to be called in response with async call
     * @returns A promise that resolves to the post response
     */
    GraphRequest.prototype.create = function (content, callback) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var error_4;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.post(content, callback)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_4 = _a.sent();
                        throw error_4;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @public
     * @async
     * Makes http request with PUT method
     * @param {any} content - The content that needs to be sent with the request
     * @param {GraphRequestCallback} [callback] - The callback function to be called in response with async call
     * @returns A promise that resolves to the put response
     */
    GraphRequest.prototype.put = function (content, callback) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var url, options, response, error_5;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = this.buildFullUrl();
                        options = {
                            method: RequestMethod_1.RequestMethod.PUT,
                            body: GraphRequestUtil_1.serializeContent(content),
                            headers: {
                                "Content-Type": "application/json",
                            },
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.send(url, options, callback)];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response];
                    case 3:
                        error_5 = _a.sent();
                        throw error_5;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @public
     * @async
     * Makes http request with PATCH method
     * @param {any} content - The content that needs to be sent with the request
     * @param {GraphRequestCallback} [callback] - The callback function to be called in response with async call
     * @returns A promise that resolves to the patch response
     */
    GraphRequest.prototype.patch = function (content, callback) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var url, options, response, error_6;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = this.buildFullUrl();
                        options = {
                            method: RequestMethod_1.RequestMethod.PATCH,
                            body: GraphRequestUtil_1.serializeContent(content),
                            headers: {
                                "Content-Type": "application/json",
                            },
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.send(url, options, callback)];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response];
                    case 3:
                        error_6 = _a.sent();
                        throw error_6;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @public
     * @async
     * Alias for PATCH request
     * @param {any} content - The content that needs to be sent with the request
     * @param {GraphRequestCallback} [callback] - The callback function to be called in response with async call
     * @returns A promise that resolves to the patch response
     */
    GraphRequest.prototype.update = function (content, callback) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var error_7;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.patch(content, callback)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_7 = _a.sent();
                        throw error_7;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @public
     * @async
     * Makes http request with DELETE method
     * @param {GraphRequestCallback} [callback] - The callback function to be called in response with async call
     * @returns A promise that resolves to the delete response
     */
    GraphRequest.prototype.delete = function (callback) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var url, options, response, error_8;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = this.buildFullUrl();
                        options = {
                            method: RequestMethod_1.RequestMethod.DELETE,
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.send(url, options, callback)];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response];
                    case 3:
                        error_8 = _a.sent();
                        throw error_8;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @public
     * @async
     * Alias for delete request call
     * @param {GraphRequestCallback} [callback] - The callback function to be called in response with async call
     * @returns A promise that resolves to the delete response
     */
    GraphRequest.prototype.del = function (callback) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var error_9;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.delete(callback)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_9 = _a.sent();
                        throw error_9;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @public
     * @async
     * Makes a http request with GET method to read response as a stream.
     * @param {GraphRequestCallback} [callback] - The callback function to be called in response with async call
     * @returns A promise that resolves to the getStream response
     */
    GraphRequest.prototype.getStream = function (callback) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var url, options, stream, error_10;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = this.buildFullUrl();
                        options = {
                            method: RequestMethod_1.RequestMethod.GET,
                        };
                        this.responseType(ResponseType_1.ResponseType.STREAM);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.send(url, options, callback)];
                    case 2:
                        stream = _a.sent();
                        return [2 /*return*/, stream];
                    case 3:
                        error_10 = _a.sent();
                        throw error_10;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @public
     * @async
     * Makes a http request with GET method to read response as a stream.
     * @param {any} stream - The stream instance
     * @param {GraphRequestCallback} [callback] - The callback function to be called in response with async call
     * @returns A promise that resolves to the putStream response
     */
    GraphRequest.prototype.putStream = function (stream, callback) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var url, options, response, error_11;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = this.buildFullUrl();
                        options = {
                            method: RequestMethod_1.RequestMethod.PUT,
                            headers: {
                                "Content-Type": "application/octet-stream",
                            },
                            body: stream,
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.send(url, options, callback)];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response];
                    case 3:
                        error_11 = _a.sent();
                        throw error_11;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return GraphRequest;
}());
exports.GraphRequest = GraphRequest;
//# sourceMappingURL=GraphRequest.js.map

/***/ }),
/* 632 */,
/* 633 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const base64url = __webpack_require__(44)
const isDisjoint = __webpack_require__(490)
let validateCrit = __webpack_require__(462)
const getKey = __webpack_require__(322)
const { KeyStore } = __webpack_require__(851)
const errors = __webpack_require__(688)
const { check, verify } = __webpack_require__(855)

const { detect: resolveSerialization } = __webpack_require__(995)

validateCrit = validateCrit.bind(undefined, errors.JWSInvalid)
const SINGLE_RECIPIENT = new Set(['compact', 'flattened', 'preparsed'])

/*
 * @public
 */
const jwsVerify = (skipDisjointCheck, serialization, jws, key, { crit = [], complete = false, algorithms, parse = true, encoding = 'utf8' } = {}) => {
  key = getKey(key, true)

  if (algorithms !== undefined && (!Array.isArray(algorithms) || algorithms.some(s => typeof s !== 'string' || !s))) {
    throw new TypeError('"algorithms" option must be an array of non-empty strings')
  } else if (algorithms) {
    algorithms = new Set(algorithms)
  }

  if (!Array.isArray(crit) || crit.some(s => typeof s !== 'string' || !s)) {
    throw new TypeError('"crit" option must be an array of non-empty strings')
  }

  if (!serialization) {
    serialization = resolveSerialization(jws)
  }

  let prot // protected header
  let header // unprotected header
  let payload
  let signature
  let alg

  // treat general format with one recipient as flattened
  // skips iteration and avoids multi errors in this case
  if (serialization === 'general' && jws.signatures.length === 1) {
    serialization = 'flattened'
    const { signatures, ...root } = jws
    jws = { ...root, ...signatures[0] }
  }

  let decoded

  if (SINGLE_RECIPIENT.has(serialization)) {
    let parsedProt = {}

    switch (serialization) {
      case 'compact': // compact serialization format
        ([prot, payload, signature] = jws.split('.'))
        break
      case 'flattened': // flattened serialization format
        ({ protected: prot, payload, signature, header } = jws)
        break
      case 'preparsed': { // from the JWT module
        ({ decoded } = jws);
        ([prot, payload, signature] = jws.token.split('.'))
        break
      }
    }

    if (!header) {
      skipDisjointCheck = true
    }

    if (decoded) {
      parsedProt = decoded.header
    } else if (prot) {
      try {
        parsedProt = base64url.JSON.decode(prot)
      } catch (err) {
        throw new errors.JWSInvalid('could not parse JWS protected header')
      }
    } else {
      skipDisjointCheck = skipDisjointCheck || true
    }

    if (!skipDisjointCheck && !isDisjoint(parsedProt, header)) {
      throw new errors.JWSInvalid('JWS Protected and JWS Unprotected Header Parameter names must be disjoint')
    }

    const combinedHeader = { ...parsedProt, ...header }
    validateCrit(parsedProt, header, crit)

    alg = parsedProt.alg || (header && header.alg)
    if (!alg) {
      throw new errors.JWSInvalid('missing JWS signature algorithm')
    } else if (algorithms && !algorithms.has(alg)) {
      throw new errors.JOSEAlgNotWhitelisted('alg not whitelisted')
    }

    if (key instanceof KeyStore) {
      const keystore = key
      const keys = keystore.all({ kid: combinedHeader.kid, alg: combinedHeader.alg, key_ops: ['verify'] })
      switch (keys.length) {
        case 0:
          throw new errors.JWKSNoMatchingKey()
        case 1:
          // treat the call as if a Key instance was passed in
          // skips iteration and avoids multi errors in this case
          key = keys[0]
          break
        default: {
          const errs = []
          for (const key of keys) {
            try {
              return jwsVerify(true, serialization, jws, key, { crit, complete, encoding, parse, algorithms: algorithms ? [...algorithms] : undefined })
            } catch (err) {
              errs.push(err)
              continue
            }
          }

          const multi = new errors.JOSEMultiError(errs)
          if ([...multi].some(e => e instanceof errors.JWSVerificationFailed)) {
            throw new errors.JWSVerificationFailed()
          }
          throw multi
        }
      }
    }

    check(key, 'verify', alg)

    const toBeVerified = Buffer.concat([
      Buffer.from(prot || ''),
      Buffer.from('.'),
      Buffer.isBuffer(payload) ? payload : Buffer.from(payload)
    ])

    if (!verify(alg, key, toBeVerified, base64url.decodeToBuffer(signature))) {
      throw new errors.JWSVerificationFailed()
    }

    if (!combinedHeader.crit || !combinedHeader.crit.includes('b64') || combinedHeader.b64) {
      if (parse) {
        payload = decoded ? decoded.payload : base64url.JSON.decode.try(payload, encoding)
      } else {
        payload = base64url.decodeToBuffer(payload)
      }
    }

    if (complete) {
      const result = { payload, key }
      if (prot) result.protected = parsedProt
      if (header) result.header = header
      return result
    }

    return payload
  }

  // general serialization format
  const { signatures, ...root } = jws
  const errs = []
  for (const recipient of signatures) {
    try {
      return jwsVerify(false, 'flattened', { ...root, ...recipient }, key, { crit, complete, encoding, parse, algorithms: algorithms ? [...algorithms] : undefined })
    } catch (err) {
      errs.push(err)
      continue
    }
  }

  const multi = new errors.JOSEMultiError(errs)
  if ([...multi].some(e => e instanceof errors.JWSVerificationFailed)) {
    throw new errors.JWSVerificationFailed()
  } else if ([...multi].every(e => e instanceof errors.JWKSNoMatchingKey)) {
    throw new errors.JWKSNoMatchingKey()
  }
  throw multi
}

module.exports = {
  bare: jwsVerify,
  verify: jwsVerify.bind(undefined, false, undefined)
}


/***/ }),
/* 634 */
/***/ (function(__unusedmodule, exports) {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module Constants
 */
/**
 * @constant
 * A Default API endpoint version for a request
 */
exports.GRAPH_API_VERSION = "v1.0";
/**
 * @constant
 * A Default base url for a request
 */
exports.GRAPH_BASE_URL = "https://graph.microsoft.com/";
//# sourceMappingURL=Constants.js.map

/***/ }),
/* 635 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const isDisjoint = __webpack_require__(490)
const base64url = __webpack_require__(44)
let validateCrit = __webpack_require__(462)
const { JWEInvalid, JOSENotSupported } = __webpack_require__(688)

validateCrit = validateCrit.bind(undefined, JWEInvalid)

module.exports = (prot, unprotected, recipients, checkAlgorithms, crit) => {
  if (typeof prot === 'string') {
    try {
      prot = base64url.JSON.decode(prot)
    } catch (err) {
      throw new JWEInvalid('could not parse JWE protected header')
    }
  }

  let alg = []
  const enc = new Set()
  if (!isDisjoint(prot, unprotected) || !recipients.every(({ header }) => {
    if (typeof header === 'object') {
      alg.push(header.alg)
      enc.add(header.enc)
    }
    const combined = { ...unprotected, ...header }
    validateCrit(prot, combined, crit)
    if ('zip' in combined) {
      throw new JWEInvalid('"zip" Header Parameter MUST be integrity protected')
    } else if (prot && 'zip' in prot && prot.zip !== 'DEF') {
      throw new JOSENotSupported('only "DEF" compression algorithm is supported')
    }
    return isDisjoint(header, prot) && isDisjoint(header, unprotected)
  })) {
    throw new JWEInvalid('JWE Shared Protected, JWE Shared Unprotected and JWE Per-Recipient Header Parameter names must be disjoint')
  }

  if (typeof prot === 'object') {
    alg.push(prot.alg)
    enc.add(prot.enc)
  }
  if (typeof unprotected === 'object') {
    alg.push(unprotected.alg)
    enc.add(unprotected.enc)
  }

  alg = alg.filter(Boolean)
  enc.delete(undefined)

  if (recipients.length !== 1) {
    if (alg.includes('dir') || alg.includes('ECDH-ES')) {
      throw new JWEInvalid('dir and ECDH-ES alg may only be used with a single recipient')
    }
  }

  if (checkAlgorithms) {
    if (alg.length !== recipients.length) {
      throw new JWEInvalid('missing Key Management algorithm')
    }
    if (enc.size === 0) {
      throw new JWEInvalid('missing Content Encryption algorithm')
    } else if (enc.size !== 1) {
      throw new JWEInvalid('there must only be one Content Encryption algorithm')
    }
  } else {
    if (enc.size > 1) {
      throw new JWEInvalid('there must only be one Content Encryption algorithm')
    }
  }

  return [...enc][0]
}


/***/ }),
/* 636 */,
/* 637 */,
/* 638 */
/***/ (function(module) {

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

module.exports = hashDelete;


/***/ }),
/* 639 */,
/* 640 */,
/* 641 */,
/* 642 */,
/* 643 */,
/* 644 */,
/* 645 */
/***/ (function(module, __unusedexports, __webpack_require__) {

module.exports = {
  der: __webpack_require__(832),
  pem: __webpack_require__(265)
}


/***/ }),
/* 646 */,
/* 647 */,
/* 648 */,
/* 649 */
/***/ (function(module) {

/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

module.exports = arrayMap;


/***/ }),
/* 650 */,
/* 651 */
/***/ (function(module) {

module.exports = new Map([
  ['A128CBC-HS256', 128],
  ['A128GCM', 96],
  ['A128GCMKW', 96],
  ['A192CBC-HS384', 128],
  ['A192GCM', 96],
  ['A192GCMKW', 96],
  ['A256CBC-HS512', 128],
  ['A256GCM', 96],
  ['A256GCMKW', 96]
])


/***/ }),
/* 652 */,
/* 653 */
/***/ (function(module) {

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

module.exports = isPrototype;


/***/ }),
/* 654 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var getNative = __webpack_require__(319),
    root = __webpack_require__(824);

/* Built-in method references that are verified to be native. */
var Map = getNative(root, 'Map');

module.exports = Map;


/***/ }),
/* 655 */,
/* 656 */,
/* 657 */,
/* 658 */,
/* 659 */,
/* 660 */,
/* 661 */,
/* 662 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var getTag = __webpack_require__(700),
    isObjectLike = __webpack_require__(337);

/** `Object#toString` result references. */
var setTag = '[object Set]';

/**
 * The base implementation of `_.isSet` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a set, else `false`.
 */
function baseIsSet(value) {
  return isObjectLike(value) && getTag(value) == setTag;
}

module.exports = baseIsSet;


/***/ }),
/* 663 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(422);
/**
 * @class
 * Class representing HTTPClient
 */
var HTTPClient = /** @class */ (function () {
    /**
     * @public
     * @constructor
     * Creates an instance of a HTTPClient
     * @param {Middleware} middleware - The first middleware of the middleware chain
     */
    function HTTPClient(middleware) {
        this.middleware = middleware;
    }
    /**
     * @public
     * @async
     * To send the request through the middleware chain
     * @param {Context} context - The context of a request
     * @returns A promise that resolves to the Context
     */
    HTTPClient.prototype.sendRequest = function (context) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var error, error_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (typeof context.request === "string" && context.options === undefined) {
                            error = new Error();
                            error.name = "InvalidRequestOptions";
                            error.message = "Unable to execute the middleware, Please provide valid options for a request";
                            throw error;
                        }
                        return [4 /*yield*/, this.middleware.execute(context)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, context];
                    case 2:
                        error_1 = _a.sent();
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return HTTPClient;
}());
exports.HTTPClient = HTTPClient;
//# sourceMappingURL=HTTPClient.js.map

/***/ }),
/* 664 */
/***/ (function(module) {

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}

module.exports = mapToArray;


/***/ }),
/* 665 */
/***/ (function(__unusedmodule, exports) {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module GraphRequestUtil
 */
/**
 * To hold list of OData query params
 */
exports.oDataQueryNames = ["$select", "$expand", "$orderby", "$filter", "$top", "$skip", "$skipToken", "$count"];
/**
 * To construct the URL by appending the segments with "/"
 * @param {string[]} urlSegments - The array of strings
 * @returns The constructed URL string
 */
exports.urlJoin = function (urlSegments) {
    var removePostSlash = function (s) { return s.replace(/\/+$/, ""); };
    var removePreSlash = function (s) { return s.replace(/^\/+/, ""); };
    var joiner = function (pre, cur) { return [removePostSlash(pre), removePreSlash(cur)].join("/"); };
    var parts = Array.prototype.slice.call(urlSegments);
    return parts.reduce(joiner);
};
/**
 * Serializes the content
 * @param {any} content - The content value that needs to be serialized
 * @returns The serialized content
 *
 * Note:
 * This conversion is required due to the following reasons:
 * Body parameter of Request method of isomorphic-fetch only accepts Blob, ArrayBuffer, FormData, TypedArrays string.
 * Node.js platform does not support Blob, FormData. Javascript File object inherits from Blob so it is also not supported in node. Therefore content of type Blob, File, FormData will only come from browsers.
 * Parallel to ArrayBuffer in javascript, node provides Buffer interface. Node's Buffer is able to send the arbitrary binary data to the server successfully for both Browser and Node platform. Whereas sending binary data via ArrayBuffer or TypedArrays was only possible using Browser. To support both Node and Browser, `serializeContent` converts TypedArrays or ArrayBuffer to `Node Buffer`.
 * If the data received is in JSON format, `serializeContent` converts the JSON to string.
 */
exports.serializeContent = function (content) {
    var className = content.constructor.name;
    if (className === "Buffer" || className === "Blob" || className === "File" || className === "FormData" || typeof content === "string") {
        return content;
    }
    if (className === "ArrayBuffer") {
        content = Buffer.from(content);
    }
    else if (className === "Int8Array" || className === "Int16Array" || className === "Int32Array" || className === "Uint8Array" || className === "Uint16Array" || className === "Uint32Array" || className === "Uint8ClampedArray" || className === "Float32Array" || className === "Float64Array" || className === "DataView") {
        content = Buffer.from(content.buffer);
    }
    else {
        try {
            content = JSON.stringify(content);
        }
        catch (error) {
            throw new Error("Unable to stringify the content");
        }
    }
    return content;
};
//# sourceMappingURL=GraphRequestUtil.js.map

/***/ }),
/* 666 */,
/* 667 */
/***/ (function(module) {

const REGISTRY = new Map();

module.exports = REGISTRY;


/***/ }),
/* 668 */,
/* 669 */
/***/ (function(module) {

module.exports = require("util");

/***/ }),
/* 670 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var listCacheClear = __webpack_require__(22),
    listCacheDelete = __webpack_require__(776),
    listCacheGet = __webpack_require__(755),
    listCacheHas = __webpack_require__(903),
    listCacheSet = __webpack_require__(268);

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

module.exports = ListCache;


/***/ }),
/* 671 */,
/* 672 */,
/* 673 */,
/* 674 */,
/* 675 */,
/* 676 */,
/* 677 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var arrayMap = __webpack_require__(649),
    baseIteratee = __webpack_require__(295),
    basePickBy = __webpack_require__(21),
    getAllKeysIn = __webpack_require__(299);

/**
 * Creates an object composed of the `object` properties `predicate` returns
 * truthy for. The predicate is invoked with two arguments: (value, key).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Object
 * @param {Object} object The source object.
 * @param {Function} [predicate=_.identity] The function invoked per property.
 * @returns {Object} Returns the new object.
 * @example
 *
 * var object = { 'a': 1, 'b': '2', 'c': 3 };
 *
 * _.pickBy(object, _.isNumber);
 * // => { 'a': 1, 'c': 3 }
 */
function pickBy(object, predicate) {
  if (object == null) {
    return {};
  }
  var props = arrayMap(getAllKeysIn(object), function(prop) {
    return [prop];
  });
  predicate = baseIteratee(predicate);
  return basePickBy(object, props, function(value, path) {
    return predicate(value, path[0]);
  });
}

module.exports = pickBy;


/***/ }),
/* 678 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var baseIsSet = __webpack_require__(662),
    baseUnary = __webpack_require__(231),
    nodeUtil = __webpack_require__(616);

/* Node.js helper references. */
var nodeIsSet = nodeUtil && nodeUtil.isSet;

/**
 * Checks if `value` is classified as a `Set` object.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a set, else `false`.
 * @example
 *
 * _.isSet(new Set);
 * // => true
 *
 * _.isSet(new WeakSet);
 * // => false
 */
var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;

module.exports = isSet;


/***/ }),
/* 679 */,
/* 680 */,
/* 681 */,
/* 682 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const crypto = __webpack_require__(417);

const [major, minor] = process.version.substr(1).split('.').map((x) => parseInt(x, 10));
const xofOutputLength = major > 12 || (major === 12 && minor >= 8);
const shake256 = xofOutputLength && crypto.getHashes().includes('shake256');

module.exports = shake256;


/***/ }),
/* 683 */,
/* 684 */,
/* 685 */,
/* 686 */,
/* 687 */,
/* 688 */
/***/ (function(module) {

const CODES = {
  JOSEAlgNotWhitelisted: 'ERR_JOSE_ALG_NOT_WHITELISTED',
  JOSECritNotUnderstood: 'ERR_JOSE_CRIT_NOT_UNDERSTOOD',
  JOSEInvalidEncoding: 'ERR_JOSE_INVALID_ENCODING',
  JOSEMultiError: 'ERR_JOSE_MULTIPLE_ERRORS',
  JOSENotSupported: 'ERR_JOSE_NOT_SUPPORTED',
  JWEDecryptionFailed: 'ERR_JWE_DECRYPTION_FAILED',
  JWEInvalid: 'ERR_JWE_INVALID',
  JWKImportFailed: 'ERR_JWK_IMPORT_FAILED',
  JWKInvalid: 'ERR_JWK_INVALID',
  JWKKeySupport: 'ERR_JWK_KEY_SUPPORT',
  JWKSNoMatchingKey: 'ERR_JWKS_NO_MATCHING_KEY',
  JWSInvalid: 'ERR_JWS_INVALID',
  JWSVerificationFailed: 'ERR_JWS_VERIFICATION_FAILED',
  JWTClaimInvalid: 'ERR_JWT_CLAIM_INVALID',
  JWTExpired: 'ERR_JWT_EXPIRED',
  JWTMalformed: 'ERR_JWT_MALFORMED'
}

const DEFAULT_MESSAGES = {
  JWEDecryptionFailed: 'decryption operation failed',
  JWEInvalid: 'JWE invalid',
  JWKSNoMatchingKey: 'no matching key found in the KeyStore',
  JWSInvalid: 'JWS invalid',
  JWSVerificationFailed: 'signature verification failed'
}

class JOSEError extends Error {
  constructor (message) {
    super(message)
    if (message === undefined) {
      this.message = DEFAULT_MESSAGES[this.constructor.name]
    }
    this.name = this.constructor.name
    this.code = CODES[this.constructor.name]
    Error.captureStackTrace(this, this.constructor)
  }
}

const isMulti = e => e instanceof JOSEMultiError
class JOSEMultiError extends JOSEError {
  constructor (errors) {
    super()
    let i
    while ((i = errors.findIndex(isMulti)) && i !== -1) {
      errors.splice(i, 1, ...errors[i])
    }
    Object.defineProperty(this, 'errors', { value: errors })
  }

  * [Symbol.iterator] () {
    for (const error of this.errors) {
      yield error
    }
  }
}
module.exports.JOSEError = JOSEError

module.exports.JOSEAlgNotWhitelisted = class JOSEAlgNotWhitelisted extends JOSEError {}
module.exports.JOSECritNotUnderstood = class JOSECritNotUnderstood extends JOSEError {}
module.exports.JOSEInvalidEncoding = class JOSEInvalidEncoding extends JOSEError {}
module.exports.JOSEMultiError = JOSEMultiError
module.exports.JOSENotSupported = class JOSENotSupported extends JOSEError {}

module.exports.JWEDecryptionFailed = class JWEDecryptionFailed extends JOSEError {}
module.exports.JWEInvalid = class JWEInvalid extends JOSEError {}

module.exports.JWKImportFailed = class JWKImportFailed extends JOSEError {}
module.exports.JWKInvalid = class JWKInvalid extends JOSEError {}
module.exports.JWKKeySupport = class JWKKeySupport extends JOSEError {}

module.exports.JWKSNoMatchingKey = class JWKSNoMatchingKey extends JOSEError {}

module.exports.JWSInvalid = class JWSInvalid extends JOSEError {}
module.exports.JWSVerificationFailed = class JWSVerificationFailed extends JOSEError {}

class JWTClaimInvalid extends JOSEError {
  constructor (message, claim = 'unspecified', reason = 'unspecified') {
    super(message)
    this.claim = claim
    this.reason = reason
  }
}
module.exports.JWTClaimInvalid = JWTClaimInvalid
module.exports.JWTExpired = class JWTExpired extends JWTClaimInvalid {}
module.exports.JWTMalformed = class JWTMalformed extends JOSEError {}


/***/ }),
/* 689 */,
/* 690 */,
/* 691 */,
/* 692 */,
/* 693 */
/***/ (function(module) {

"use strict";


class CancelError extends Error {
	constructor(reason) {
		super(reason || 'Promise was canceled');
		this.name = 'CancelError';
	}

	get isCanceled() {
		return true;
	}
}

class PCancelable {
	static fn(userFn) {
		return (...arguments_) => {
			return new PCancelable((resolve, reject, onCancel) => {
				arguments_.push(onCancel);
				// eslint-disable-next-line promise/prefer-await-to-then
				userFn(...arguments_).then(resolve, reject);
			});
		};
	}

	constructor(executor) {
		this._cancelHandlers = [];
		this._isPending = true;
		this._isCanceled = false;
		this._rejectOnCancel = true;

		this._promise = new Promise((resolve, reject) => {
			this._reject = reject;

			const onResolve = value => {
				this._isPending = false;
				resolve(value);
			};

			const onReject = error => {
				this._isPending = false;
				reject(error);
			};

			const onCancel = handler => {
				if (!this._isPending) {
					throw new Error('The `onCancel` handler was attached after the promise settled.');
				}

				this._cancelHandlers.push(handler);
			};

			Object.defineProperties(onCancel, {
				shouldReject: {
					get: () => this._rejectOnCancel,
					set: boolean => {
						this._rejectOnCancel = boolean;
					}
				}
			});

			return executor(onResolve, onReject, onCancel);
		});
	}

	then(onFulfilled, onRejected) {
		// eslint-disable-next-line promise/prefer-await-to-then
		return this._promise.then(onFulfilled, onRejected);
	}

	catch(onRejected) {
		return this._promise.catch(onRejected);
	}

	finally(onFinally) {
		return this._promise.finally(onFinally);
	}

	cancel(reason) {
		if (!this._isPending || this._isCanceled) {
			return;
		}

		if (this._cancelHandlers.length > 0) {
			try {
				for (const handler of this._cancelHandlers) {
					handler();
				}
			} catch (error) {
				this._reject(error);
			}
		}

		this._isCanceled = true;
		if (this._rejectOnCancel) {
			this._reject(new CancelError(reason));
		}
	}

	get isCanceled() {
		return this._isCanceled;
	}
}

Object.setPrototypeOf(PCancelable.prototype, Promise.prototype);

module.exports = PCancelable;
module.exports.CancelError = CancelError;


/***/ }),
/* 694 */
/***/ (function(module, __unusedexports, __webpack_require__) {

/* global BigInt */

const { randomBytes } = __webpack_require__(417)

const base64url = __webpack_require__(44)
const errors = __webpack_require__(688)

const ZERO = BigInt(0)
const ONE = BigInt(1)
const TWO = BigInt(2)

const toJWKParameter = (n) => {
  const hex = n.toString(16)
  return base64url.encodeBuffer(Buffer.from(hex.length % 2 ? `0${hex}` : hex, 'hex'))
}
const fromBuffer = buf => BigInt(`0x${buf.toString('hex')}`)
const bitLength = n => n.toString(2).length

const eGcdX = (a, b) => {
  let x = ZERO
  let y = ONE
  let u = ONE
  let v = ZERO

  while (a !== ZERO) {
    const q = b / a
    const r = b % a
    const m = x - (u * q)
    const n = y - (v * q)
    b = a
    a = r
    x = u
    y = v
    u = m
    v = n
  }
  return x
}

const gcd = (a, b) => {
  let shift = ZERO
  while (!((a | b) & ONE)) {
    a >>= ONE
    b >>= ONE
    shift++
  }
  while (!(a & ONE)) {
    a >>= ONE
  }
  do {
    while (!(b & ONE)) {
      b >>= ONE
    }
    if (a > b) {
      const x = a
      a = b
      b = x
    }
    b -= a
  } while (b)

  return a << shift
}

const modPow = (a, b, n) => {
  a = toZn(a, n)
  let result = ONE
  let x = a
  while (b > 0) {
    var leastSignificantBit = b % TWO
    b = b / TWO
    if (leastSignificantBit === ONE) {
      result = result * x
      result = result % n
    }
    x = x * x
    x = x % n
  }
  return result
}

const randBetween = (min, max) => {
  const interval = max - min
  const bitLen = bitLength(interval)
  let rnd
  do {
    rnd = fromBuffer(randBits(bitLen))
  } while (rnd > interval)
  return rnd + min
}

const randBits = (bitLength) => {
  const byteLength = Math.ceil(bitLength / 8)
  const rndBytes = randomBytes(byteLength)
  // Fill with 0's the extra bits
  rndBytes[0] = rndBytes[0] & (2 ** (bitLength % 8) - 1)
  return rndBytes
}

const toZn = (a, n) => {
  a = a % n
  return (a < 0) ? a + n : a
}

const odd = (n) => {
  let r = n
  while (r % TWO === ZERO) {
    r = r / TWO
  }
  return r
}

// not sold on these values
const maxCountWhileNoY = 30
const maxCountWhileInot0 = 22

const getPrimeFactors = (e, d, n) => {
  const r = odd(e * d - ONE)

  let countWhileNoY = 0
  let y
  do {
    countWhileNoY++
    if (countWhileNoY === maxCountWhileNoY) {
      throw new errors.JWKImportFailed('failed to calculate missing primes')
    }

    let countWhileInot0 = 0
    let i = modPow(randBetween(TWO, n), r, n)
    let o = ZERO
    while (i !== ONE) {
      countWhileInot0++
      if (countWhileInot0 === maxCountWhileInot0) {
        throw new errors.JWKImportFailed('failed to calculate missing primes')
      }
      o = i
      i = (i * i) % n
    }
    if (o !== (n - ONE)) {
      y = o
    }
  } while (!y)

  const p = gcd(y - ONE, n)
  const q = n / p

  return p > q ? { p, q } : { p: q, q: p }
}

module.exports = (jwk) => {
  const e = fromBuffer(base64url.decodeToBuffer(jwk.e))
  const d = fromBuffer(base64url.decodeToBuffer(jwk.d))
  const n = fromBuffer(base64url.decodeToBuffer(jwk.n))

  if (d >= n) {
    throw new errors.JWKInvalid('invalid RSA private exponent')
  }

  const { p, q } = getPrimeFactors(e, d, n)
  const dp = d % (p - ONE)
  const dq = d % (q - ONE)
  const qi = toZn(eGcdX(toZn(q, p), p), p)

  return {
    ...jwk,
    p: toJWKParameter(p),
    q: toJWKParameter(q),
    dp: toJWKParameter(dp),
    dq: toJWKParameter(dq),
    qi: toJWKParameter(qi)
  }
}


/***/ }),
/* 695 */,
/* 696 */,
/* 697 */,
/* 698 */
/***/ (function(module) {

/**
 * A specialized version of `_.forEach` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

module.exports = arrayEach;


/***/ }),
/* 699 */,
/* 700 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var DataView = __webpack_require__(210),
    Map = __webpack_require__(654),
    Promise = __webpack_require__(790),
    Set = __webpack_require__(423),
    WeakMap = __webpack_require__(379),
    baseGetTag = __webpack_require__(51),
    toSource = __webpack_require__(473);

/** `Object#toString` result references. */
var mapTag = '[object Map]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    setTag = '[object Set]',
    weakMapTag = '[object WeakMap]';

var dataViewTag = '[object DataView]';

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = toSource(DataView),
    mapCtorString = toSource(Map),
    promiseCtorString = toSource(Promise),
    setCtorString = toSource(Set),
    weakMapCtorString = toSource(WeakMap);

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
    (Map && getTag(new Map) != mapTag) ||
    (Promise && getTag(Promise.resolve()) != promiseTag) ||
    (Set && getTag(new Set) != setTag) ||
    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
  getTag = function(value) {
    var result = baseGetTag(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : '';

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag;
        case mapCtorString: return mapTag;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag;
        case weakMapCtorString: return weakMapTag;
      }
    }
    return result;
  };
}

module.exports = getTag;


/***/ }),
/* 701 */,
/* 702 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


// A linked list to keep track of recently-used-ness
const Yallist = __webpack_require__(612)

const MAX = Symbol('max')
const LENGTH = Symbol('length')
const LENGTH_CALCULATOR = Symbol('lengthCalculator')
const ALLOW_STALE = Symbol('allowStale')
const MAX_AGE = Symbol('maxAge')
const DISPOSE = Symbol('dispose')
const NO_DISPOSE_ON_SET = Symbol('noDisposeOnSet')
const LRU_LIST = Symbol('lruList')
const CACHE = Symbol('cache')
const UPDATE_AGE_ON_GET = Symbol('updateAgeOnGet')

const naiveLength = () => 1

// lruList is a yallist where the head is the youngest
// item, and the tail is the oldest.  the list contains the Hit
// objects as the entries.
// Each Hit object has a reference to its Yallist.Node.  This
// never changes.
//
// cache is a Map (or PseudoMap) that matches the keys to
// the Yallist.Node object.
class LRUCache {
  constructor (options) {
    if (typeof options === 'number')
      options = { max: options }

    if (!options)
      options = {}

    if (options.max && (typeof options.max !== 'number' || options.max < 0))
      throw new TypeError('max must be a non-negative number')
    // Kind of weird to have a default max of Infinity, but oh well.
    const max = this[MAX] = options.max || Infinity

    const lc = options.length || naiveLength
    this[LENGTH_CALCULATOR] = (typeof lc !== 'function') ? naiveLength : lc
    this[ALLOW_STALE] = options.stale || false
    if (options.maxAge && typeof options.maxAge !== 'number')
      throw new TypeError('maxAge must be a number')
    this[MAX_AGE] = options.maxAge || 0
    this[DISPOSE] = options.dispose
    this[NO_DISPOSE_ON_SET] = options.noDisposeOnSet || false
    this[UPDATE_AGE_ON_GET] = options.updateAgeOnGet || false
    this.reset()
  }

  // resize the cache when the max changes.
  set max (mL) {
    if (typeof mL !== 'number' || mL < 0)
      throw new TypeError('max must be a non-negative number')

    this[MAX] = mL || Infinity
    trim(this)
  }
  get max () {
    return this[MAX]
  }

  set allowStale (allowStale) {
    this[ALLOW_STALE] = !!allowStale
  }
  get allowStale () {
    return this[ALLOW_STALE]
  }

  set maxAge (mA) {
    if (typeof mA !== 'number')
      throw new TypeError('maxAge must be a non-negative number')

    this[MAX_AGE] = mA
    trim(this)
  }
  get maxAge () {
    return this[MAX_AGE]
  }

  // resize the cache when the lengthCalculator changes.
  set lengthCalculator (lC) {
    if (typeof lC !== 'function')
      lC = naiveLength

    if (lC !== this[LENGTH_CALCULATOR]) {
      this[LENGTH_CALCULATOR] = lC
      this[LENGTH] = 0
      this[LRU_LIST].forEach(hit => {
        hit.length = this[LENGTH_CALCULATOR](hit.value, hit.key)
        this[LENGTH] += hit.length
      })
    }
    trim(this)
  }
  get lengthCalculator () { return this[LENGTH_CALCULATOR] }

  get length () { return this[LENGTH] }
  get itemCount () { return this[LRU_LIST].length }

  rforEach (fn, thisp) {
    thisp = thisp || this
    for (let walker = this[LRU_LIST].tail; walker !== null;) {
      const prev = walker.prev
      forEachStep(this, fn, walker, thisp)
      walker = prev
    }
  }

  forEach (fn, thisp) {
    thisp = thisp || this
    for (let walker = this[LRU_LIST].head; walker !== null;) {
      const next = walker.next
      forEachStep(this, fn, walker, thisp)
      walker = next
    }
  }

  keys () {
    return this[LRU_LIST].toArray().map(k => k.key)
  }

  values () {
    return this[LRU_LIST].toArray().map(k => k.value)
  }

  reset () {
    if (this[DISPOSE] &&
        this[LRU_LIST] &&
        this[LRU_LIST].length) {
      this[LRU_LIST].forEach(hit => this[DISPOSE](hit.key, hit.value))
    }

    this[CACHE] = new Map() // hash of items by key
    this[LRU_LIST] = new Yallist() // list of items in order of use recency
    this[LENGTH] = 0 // length of items in the list
  }

  dump () {
    return this[LRU_LIST].map(hit =>
      isStale(this, hit) ? false : {
        k: hit.key,
        v: hit.value,
        e: hit.now + (hit.maxAge || 0)
      }).toArray().filter(h => h)
  }

  dumpLru () {
    return this[LRU_LIST]
  }

  set (key, value, maxAge) {
    maxAge = maxAge || this[MAX_AGE]

    if (maxAge && typeof maxAge !== 'number')
      throw new TypeError('maxAge must be a number')

    const now = maxAge ? Date.now() : 0
    const len = this[LENGTH_CALCULATOR](value, key)

    if (this[CACHE].has(key)) {
      if (len > this[MAX]) {
        del(this, this[CACHE].get(key))
        return false
      }

      const node = this[CACHE].get(key)
      const item = node.value

      // dispose of the old one before overwriting
      // split out into 2 ifs for better coverage tracking
      if (this[DISPOSE]) {
        if (!this[NO_DISPOSE_ON_SET])
          this[DISPOSE](key, item.value)
      }

      item.now = now
      item.maxAge = maxAge
      item.value = value
      this[LENGTH] += len - item.length
      item.length = len
      this.get(key)
      trim(this)
      return true
    }

    const hit = new Entry(key, value, len, now, maxAge)

    // oversized objects fall out of cache automatically.
    if (hit.length > this[MAX]) {
      if (this[DISPOSE])
        this[DISPOSE](key, value)

      return false
    }

    this[LENGTH] += hit.length
    this[LRU_LIST].unshift(hit)
    this[CACHE].set(key, this[LRU_LIST].head)
    trim(this)
    return true
  }

  has (key) {
    if (!this[CACHE].has(key)) return false
    const hit = this[CACHE].get(key).value
    return !isStale(this, hit)
  }

  get (key) {
    return get(this, key, true)
  }

  peek (key) {
    return get(this, key, false)
  }

  pop () {
    const node = this[LRU_LIST].tail
    if (!node)
      return null

    del(this, node)
    return node.value
  }

  del (key) {
    del(this, this[CACHE].get(key))
  }

  load (arr) {
    // reset the cache
    this.reset()

    const now = Date.now()
    // A previous serialized cache has the most recent items first
    for (let l = arr.length - 1; l >= 0; l--) {
      const hit = arr[l]
      const expiresAt = hit.e || 0
      if (expiresAt === 0)
        // the item was created without expiration in a non aged cache
        this.set(hit.k, hit.v)
      else {
        const maxAge = expiresAt - now
        // dont add already expired items
        if (maxAge > 0) {
          this.set(hit.k, hit.v, maxAge)
        }
      }
    }
  }

  prune () {
    this[CACHE].forEach((value, key) => get(this, key, false))
  }
}

const get = (self, key, doUse) => {
  const node = self[CACHE].get(key)
  if (node) {
    const hit = node.value
    if (isStale(self, hit)) {
      del(self, node)
      if (!self[ALLOW_STALE])
        return undefined
    } else {
      if (doUse) {
        if (self[UPDATE_AGE_ON_GET])
          node.value.now = Date.now()
        self[LRU_LIST].unshiftNode(node)
      }
    }
    return hit.value
  }
}

const isStale = (self, hit) => {
  if (!hit || (!hit.maxAge && !self[MAX_AGE]))
    return false

  const diff = Date.now() - hit.now
  return hit.maxAge ? diff > hit.maxAge
    : self[MAX_AGE] && (diff > self[MAX_AGE])
}

const trim = self => {
  if (self[LENGTH] > self[MAX]) {
    for (let walker = self[LRU_LIST].tail;
      self[LENGTH] > self[MAX] && walker !== null;) {
      // We know that we're about to delete this one, and also
      // what the next least recently used key will be, so just
      // go ahead and set it now.
      const prev = walker.prev
      del(self, walker)
      walker = prev
    }
  }
}

const del = (self, node) => {
  if (node) {
    const hit = node.value
    if (self[DISPOSE])
      self[DISPOSE](hit.key, hit.value)

    self[LENGTH] -= hit.length
    self[CACHE].delete(hit.key)
    self[LRU_LIST].removeNode(node)
  }
}

class Entry {
  constructor (key, value, length, now, maxAge) {
    this.key = key
    this.value = value
    this.length = length
    this.now = now
    this.maxAge = maxAge || 0
  }
}

const forEachStep = (self, fn, node, thisp) => {
  let hit = node.value
  if (isStale(self, hit)) {
    del(self, node)
    if (!self[ALLOW_STALE])
      hit = undefined
  }
  if (hit)
    fn.call(thisp, hit.value, hit.key, self)
}

module.exports = LRUCache


/***/ }),
/* 703 */,
/* 704 */,
/* 705 */,
/* 706 */,
/* 707 */,
/* 708 */,
/* 709 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var arrayFilter = __webpack_require__(348),
    stubArray = __webpack_require__(130);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return arrayFilter(nativeGetSymbols(object), function(symbol) {
    return propertyIsEnumerable.call(object, symbol);
  });
};

module.exports = getSymbols;


/***/ }),
/* 710 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var hashClear = __webpack_require__(711),
    hashDelete = __webpack_require__(638),
    hashGet = __webpack_require__(936),
    hashHas = __webpack_require__(802),
    hashSet = __webpack_require__(261);

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

module.exports = Hash;


/***/ }),
/* 711 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var nativeCreate = __webpack_require__(878);

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}

module.exports = hashClear;


/***/ }),
/* 712 */,
/* 713 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { improvedDH } = __webpack_require__(915)
const { KEYOBJECT } = __webpack_require__(771)
const { generateSync } = __webpack_require__(104)
const { name: secp256k1 } = __webpack_require__(997)
const { ECDH_DERIVE_LENGTHS } = __webpack_require__(962)

const derive = __webpack_require__(715)

const wrapKey = (wrap, derive, key, payload) => {
  const epk = generateSync(key.kty, key.crv)

  const derivedKey = derive(epk, key, payload)

  const result = wrap({ [KEYOBJECT]: derivedKey }, payload)
  result.header = result.header || {}
  Object.assign(result.header, { epk: { kty: key.kty, crv: key.crv, x: epk.x, y: epk.y } })

  return result
}

const unwrapKey = (unwrap, derive, key, payload, header) => {
  const { epk } = header
  const derivedKey = derive(key, epk, header)

  return unwrap({ [KEYOBJECT]: derivedKey }, payload, header)
}

module.exports = (JWA, JWK) => {
  ['ECDH-ES+A128KW', 'ECDH-ES+A192KW', 'ECDH-ES+A256KW'].forEach((jwaAlg) => {
    const kw = jwaAlg.substr(-6)
    const kwWrap = JWA.keyManagementEncrypt.get(kw)
    const kwUnwrap = JWA.keyManagementDecrypt.get(kw)
    const keylen = parseInt(jwaAlg.substr(9, 3), 10)
    ECDH_DERIVE_LENGTHS.set(jwaAlg, keylen)

    if (kwWrap && kwUnwrap) {
      JWA.keyManagementEncrypt.set(jwaAlg, wrapKey.bind(undefined, kwWrap, derive.bind(undefined, jwaAlg, keylen)))
      JWA.keyManagementDecrypt.set(jwaAlg, unwrapKey.bind(undefined, kwUnwrap, derive.bind(undefined, jwaAlg, keylen)))
      JWK.EC.deriveKey[jwaAlg] = key => (key.use === 'enc' || key.use === undefined) && key.crv !== secp256k1

      if (improvedDH) {
        JWK.OKP.deriveKey[jwaAlg] = key => (key.use === 'enc' || key.use === undefined) && key.keyObject.asymmetricKeyType.startsWith('x')
      }
    }
  })
}
module.exports.wrapKey = wrapKey
module.exports.unwrapKey = unwrapKey


/***/ }),
/* 714 */,
/* 715 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { createHash } = __webpack_require__(417)
const ecdhComputeSecret = __webpack_require__(317)

const concat = (key, length, value) => {
  const iterations = Math.ceil(length / 32)
  let res

  for (let iter = 1; iter <= iterations; iter++) {
    const buf = Buffer.allocUnsafe(4 + key.length + value.length)
    buf.writeUInt32BE(iter, 0)
    key.copy(buf, 4)
    value.copy(buf, 4 + key.length)
    if (!res) {
      res = createHash('sha256').update(buf).digest()
    } else {
      res = Buffer.concat([res, createHash('sha256').update(buf).digest()])
    }
  }

  return res.slice(0, length)
}

const uint32be = (value, buf = Buffer.allocUnsafe(4)) => {
  buf.writeUInt32BE(value)
  return buf
}

const lengthAndInput = input => Buffer.concat([uint32be(input.length), input])

module.exports = (alg, keyLen, privKey, pubKey, { apu = Buffer.alloc(0), apv = Buffer.alloc(0) } = {}, computeSecret = ecdhComputeSecret) => {
  const value = Buffer.concat([
    lengthAndInput(Buffer.from(alg)),
    lengthAndInput(apu),
    lengthAndInput(apv),
    uint32be(keyLen)
  ])

  const sharedSecret = computeSecret(privKey, pubKey)
  return concat(sharedSecret, keyLen / 8, value)
}


/***/ }),
/* 716 */,
/* 717 */,
/* 718 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


var stream = __webpack_require__(413);

function DuplexWrapper(options, writable, readable) {
  if (typeof readable === "undefined") {
    readable = writable;
    writable = options;
    options = null;
  }

  stream.Duplex.call(this, options);

  if (typeof readable.read !== "function") {
    readable = (new stream.Readable(options)).wrap(readable);
  }

  this._writable = writable;
  this._readable = readable;
  this._waiting = false;

  var self = this;

  writable.once("finish", function() {
    self.end();
  });

  this.once("finish", function() {
    writable.end();
  });

  readable.on("readable", function() {
    if (self._waiting) {
      self._waiting = false;
      self._read();
    }
  });

  readable.once("end", function() {
    self.push(null);
  });

  if (!options || typeof options.bubbleErrors === "undefined" || options.bubbleErrors) {
    writable.on("error", function(err) {
      self.emit("error", err);
    });

    readable.on("error", function(err) {
      self.emit("error", err);
    });
  }
}

DuplexWrapper.prototype = Object.create(stream.Duplex.prototype, {constructor: {value: DuplexWrapper}});

DuplexWrapper.prototype._write = function _write(input, encoding, done) {
  this._writable.write(input, encoding, done);
};

DuplexWrapper.prototype._read = function _read() {
  var buf;
  var reads = 0;
  while ((buf = this._readable.read()) !== null) {
    this.push(buf);
    reads++;
  }
  if (reads === 0) {
    this._waiting = true;
  }
};

module.exports = function duplex2(options, writable, readable) {
  return new DuplexWrapper(options, writable, readable);
};

module.exports.DuplexWrapper = DuplexWrapper;


/***/ }),
/* 719 */,
/* 720 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { strict: assert } = __webpack_require__(357)

const { Reporter } = __webpack_require__(43)
const { DecoderBuffer, EncoderBuffer } = __webpack_require__(110)

// Supported tags
const tags = [
  'seq', 'seqof', 'set', 'setof', 'objid', 'bool',
  'gentime', 'utctime', 'null_', 'enum', 'int', 'objDesc',
  'bitstr', 'bmpstr', 'charstr', 'genstr', 'graphstr', 'ia5str', 'iso646str',
  'numstr', 'octstr', 'printstr', 't61str', 'unistr', 'utf8str', 'videostr'
]

// Public methods list
const methods = [
  'key', 'obj', 'use', 'optional', 'explicit', 'implicit', 'def', 'choice',
  'any', 'contains'
].concat(tags)

// Overrided methods list
const overrided = [
  '_peekTag', '_decodeTag', '_use',
  '_decodeStr', '_decodeObjid', '_decodeTime',
  '_decodeNull', '_decodeInt', '_decodeBool', '_decodeList',

  '_encodeComposite', '_encodeStr', '_encodeObjid', '_encodeTime',
  '_encodeNull', '_encodeInt', '_encodeBool'
]

function Node (enc, parent, name) {
  const state = {}
  this._baseState = state

  state.name = name
  state.enc = enc

  state.parent = parent || null
  state.children = null

  // State
  state.tag = null
  state.args = null
  state.reverseArgs = null
  state.choice = null
  state.optional = false
  state.any = false
  state.obj = false
  state.use = null
  state.useDecoder = null
  state.key = null
  state.default = null
  state.explicit = null
  state.implicit = null
  state.contains = null

  // Should create new instance on each method
  if (!state.parent) {
    state.children = []
    this._wrap()
  }
}

const stateProps = [
  'enc', 'parent', 'children', 'tag', 'args', 'reverseArgs', 'choice',
  'optional', 'any', 'obj', 'use', 'alteredUse', 'key', 'default', 'explicit',
  'implicit', 'contains'
]

Node.prototype.clone = function clone () {
  const state = this._baseState
  const cstate = {}
  stateProps.forEach(function (prop) {
    cstate[prop] = state[prop]
  })
  const res = new this.constructor(cstate.parent)
  res._baseState = cstate
  return res
}

Node.prototype._wrap = function wrap () {
  const state = this._baseState
  methods.forEach(function (method) {
    this[method] = function _wrappedMethod () {
      const clone = new this.constructor(this)
      state.children.push(clone)
      return clone[method].apply(clone, arguments)
    }
  }, this)
}

Node.prototype._init = function init (body) {
  const state = this._baseState

  assert(state.parent === null)
  body.call(this)

  // Filter children
  state.children = state.children.filter(function (child) {
    return child._baseState.parent === this
  }, this)
  assert.equal(state.children.length, 1, 'Root node can have only one child')
}

Node.prototype._useArgs = function useArgs (args) {
  const state = this._baseState

  // Filter children and args
  const children = args.filter(function (arg) {
    return arg instanceof this.constructor
  }, this)
  args = args.filter(function (arg) {
    return !(arg instanceof this.constructor)
  }, this)

  if (children.length !== 0) {
    assert(state.children === null)
    state.children = children

    // Replace parent to maintain backward link
    children.forEach(function (child) {
      child._baseState.parent = this
    }, this)
  }
  if (args.length !== 0) {
    assert(state.args === null)
    state.args = args
    state.reverseArgs = args.map(function (arg) {
      if (typeof arg !== 'object' || arg.constructor !== Object) { return arg }

      const res = {}
      Object.keys(arg).forEach(function (key) {
        if (key == (key | 0)) { key |= 0 } // eslint-disable-line eqeqeq
        const value = arg[key]
        res[value] = key
      })
      return res
    })
  }
}

//
// Overrided methods
//

overrided.forEach(function (method) {
  Node.prototype[method] = function _overrided () {
    const state = this._baseState
    throw new Error(`${method} not implemented for encoding: ${state.enc}`)
  }
})

//
// Public methods
//

tags.forEach(function (tag) {
  Node.prototype[tag] = function _tagMethod () {
    const state = this._baseState
    const args = Array.prototype.slice.call(arguments)

    assert(state.tag === null)
    state.tag = tag

    this._useArgs(args)

    return this
  }
})

Node.prototype.use = function use (item) {
  assert(item)
  const state = this._baseState

  assert(state.use === null)
  state.use = item

  return this
}

Node.prototype.optional = function optional () {
  const state = this._baseState

  state.optional = true

  return this
}

Node.prototype.def = function def (val) {
  const state = this._baseState

  assert(state.default === null)
  state.default = val
  state.optional = true

  return this
}

Node.prototype.explicit = function explicit (num) {
  const state = this._baseState

  assert(state.explicit === null && state.implicit === null)
  state.explicit = num

  return this
}

Node.prototype.implicit = function implicit (num) {
  const state = this._baseState

  assert(state.explicit === null && state.implicit === null)
  state.implicit = num

  return this
}

Node.prototype.obj = function obj () {
  const state = this._baseState
  const args = Array.prototype.slice.call(arguments)

  state.obj = true

  if (args.length !== 0) { this._useArgs(args) }

  return this
}

Node.prototype.key = function key (newKey) {
  const state = this._baseState

  assert(state.key === null)
  state.key = newKey

  return this
}

Node.prototype.any = function any () {
  const state = this._baseState

  state.any = true

  return this
}

Node.prototype.choice = function choice (obj) {
  const state = this._baseState

  assert(state.choice === null)
  state.choice = obj
  this._useArgs(Object.keys(obj).map(function (key) {
    return obj[key]
  }))

  return this
}

Node.prototype.contains = function contains (item) {
  const state = this._baseState

  assert(state.use === null)
  state.contains = item

  return this
}

//
// Decoding
//

Node.prototype._decode = function decode (input, options) {
  const state = this._baseState

  // Decode root node
  if (state.parent === null) { return input.wrapResult(state.children[0]._decode(input, options)) }

  let result = state.default
  let present = true

  let prevKey = null
  if (state.key !== null) { prevKey = input.enterKey(state.key) }

  // Check if tag is there
  if (state.optional) {
    let tag = null
    if (state.explicit !== null) { tag = state.explicit } else if (state.implicit !== null) { tag = state.implicit } else if (state.tag !== null) { tag = state.tag }

    if (tag === null && !state.any) {
      // Trial and Error
      const save = input.save()
      try {
        if (state.choice === null) { this._decodeGeneric(state.tag, input, options) } else { this._decodeChoice(input, options) }
        present = true
      } catch (e) {
        present = false
      }
      input.restore(save)
    } else {
      present = this._peekTag(input, tag, state.any)

      if (input.isError(present)) { return present }
    }
  }

  // Push object on stack
  let prevObj
  if (state.obj && present) { prevObj = input.enterObject() }

  if (present) {
    // Unwrap explicit values
    if (state.explicit !== null) {
      const explicit = this._decodeTag(input, state.explicit)
      if (input.isError(explicit)) { return explicit }
      input = explicit
    }

    const start = input.offset

    // Unwrap implicit and normal values
    if (state.use === null && state.choice === null) {
      let save
      if (state.any) { save = input.save() }
      const body = this._decodeTag(
        input,
        state.implicit !== null ? state.implicit : state.tag,
        state.any
      )
      if (input.isError(body)) { return body }

      if (state.any) { result = input.raw(save) } else { input = body }
    }

    if (options && options.track && state.tag !== null) { options.track(input.path(), start, input.length, 'tagged') }

    if (options && options.track && state.tag !== null) { options.track(input.path(), input.offset, input.length, 'content') }

    // Select proper method for tag
    if (state.any) {
      // no-op
    } else if (state.choice === null) {
      result = this._decodeGeneric(state.tag, input, options)
    } else {
      result = this._decodeChoice(input, options)
    }

    if (input.isError(result)) { return result }

    // Decode children
    if (!state.any && state.choice === null && state.children !== null) {
      state.children.forEach(function decodeChildren (child) {
        // NOTE: We are ignoring errors here, to let parser continue with other
        // parts of encoded data
        child._decode(input, options)
      })
    }

    // Decode contained/encoded by schema, only in bit or octet strings
    if (state.contains && (state.tag === 'octstr' || state.tag === 'bitstr')) {
      const data = new DecoderBuffer(result)
      result = this._getUse(state.contains, input._reporterState.obj)
        ._decode(data, options)
    }
  }

  // Pop object
  if (state.obj && present) { result = input.leaveObject(prevObj) }

  // Set key
  if (state.key !== null && (result !== null || present === true)) { input.leaveKey(prevKey, state.key, result) } else if (prevKey !== null) { input.exitKey(prevKey) }

  return result
}

Node.prototype._decodeGeneric = function decodeGeneric (tag, input, options) {
  const state = this._baseState

  if (tag === 'seq' || tag === 'set') { return null }
  if (tag === 'seqof' || tag === 'setof') { return this._decodeList(input, tag, state.args[0], options) } else if (/str$/.test(tag)) { return this._decodeStr(input, tag, options) } else if (tag === 'objid' && state.args) { return this._decodeObjid(input, state.args[0], state.args[1], options) } else if (tag === 'objid') { return this._decodeObjid(input, null, null, options) } else if (tag === 'gentime' || tag === 'utctime') { return this._decodeTime(input, tag, options) } else if (tag === 'null_') { return this._decodeNull(input, options) } else if (tag === 'bool') { return this._decodeBool(input, options) } else if (tag === 'objDesc') { return this._decodeStr(input, tag, options) } else if (tag === 'int' || tag === 'enum') { return this._decodeInt(input, state.args && state.args[0], options) }

  if (state.use !== null) {
    return this._getUse(state.use, input._reporterState.obj)
      ._decode(input, options)
  } else {
    return input.error(`unknown tag: ${tag}`)
  }
}

Node.prototype._getUse = function _getUse (entity, obj) {
  const state = this._baseState
  // Create altered use decoder if implicit is set
  state.useDecoder = this._use(entity, obj)
  assert(state.useDecoder._baseState.parent === null)
  state.useDecoder = state.useDecoder._baseState.children[0]
  if (state.implicit !== state.useDecoder._baseState.implicit) {
    state.useDecoder = state.useDecoder.clone()
    state.useDecoder._baseState.implicit = state.implicit
  }
  return state.useDecoder
}

Node.prototype._decodeChoice = function decodeChoice (input, options) {
  const state = this._baseState
  let result = null
  let match = false

  Object.keys(state.choice).some(function (key) {
    const save = input.save()
    const node = state.choice[key]
    try {
      const value = node._decode(input, options)
      if (input.isError(value)) { return false }

      result = { type: key, value: value }
      match = true
    } catch (e) {
      input.restore(save)
      return false
    }
    return true
  }, this)

  if (!match) { return input.error('Choice not matched') }

  return result
}

//
// Encoding
//

Node.prototype._createEncoderBuffer = function createEncoderBuffer (data) {
  return new EncoderBuffer(data, this.reporter)
}

Node.prototype._encode = function encode (data, reporter, parent) {
  const state = this._baseState
  if (state.default !== null && state.default === data) { return }

  const result = this._encodeValue(data, reporter, parent)
  if (result === undefined) { return }

  if (this._skipDefault(result, reporter, parent)) { return }

  return result
}

Node.prototype._encodeValue = function encode (data, reporter, parent) {
  const state = this._baseState

  // Decode root node
  if (state.parent === null) { return state.children[0]._encode(data, reporter || new Reporter()) }

  let result = null

  // Set reporter to share it with a child class
  this.reporter = reporter

  // Check if data is there
  if (state.optional && data === undefined) {
    if (state.default !== null) { data = state.default } else { return }
  }

  // Encode children first
  let content = null
  let primitive = false
  if (state.any) {
    // Anything that was given is translated to buffer
    result = this._createEncoderBuffer(data)
  } else if (state.choice) {
    result = this._encodeChoice(data, reporter)
  } else if (state.contains) {
    content = this._getUse(state.contains, parent)._encode(data, reporter)
    primitive = true
  } else if (state.children) {
    content = state.children.map(function (child) {
      if (child._baseState.tag === 'null_') { return child._encode(null, reporter, data) }

      if (child._baseState.key === null) { return reporter.error('Child should have a key') }
      const prevKey = reporter.enterKey(child._baseState.key)

      if (typeof data !== 'object') { return reporter.error('Child expected, but input is not object') }

      const res = child._encode(data[child._baseState.key], reporter, data)
      reporter.leaveKey(prevKey)

      return res
    }, this).filter(function (child) {
      return child
    })
    content = this._createEncoderBuffer(content)
  } else {
    if (state.tag === 'seqof' || state.tag === 'setof') {
      if (!(state.args && state.args.length === 1)) { return reporter.error(`Too many args for: ${state.tag}`) }

      if (!Array.isArray(data)) { return reporter.error('seqof/setof, but data is not Array') }

      const child = this.clone()
      child._baseState.implicit = null
      content = this._createEncoderBuffer(data.map(function (item) {
        const state = this._baseState

        return this._getUse(state.args[0], data)._encode(item, reporter)
      }, child))
    } else if (state.use !== null) {
      result = this._getUse(state.use, parent)._encode(data, reporter)
    } else {
      content = this._encodePrimitive(state.tag, data)
      primitive = true
    }
  }

  // Encode data itself
  if (!state.any && state.choice === null) {
    const tag = state.implicit !== null ? state.implicit : state.tag
    const cls = state.implicit === null ? 'universal' : 'context'

    if (tag === null) {
      if (state.use === null) { reporter.error('Tag could be omitted only for .use()') }
    } else {
      if (state.use === null) { result = this._encodeComposite(tag, primitive, cls, content) }
    }
  }

  // Wrap in explicit
  if (state.explicit !== null) { result = this._encodeComposite(state.explicit, false, 'context', result) }

  return result
}

Node.prototype._encodeChoice = function encodeChoice (data, reporter) {
  const state = this._baseState

  const node = state.choice[data.type]
  if (!node) {
    assert(
      false,
      `${data.type} not found in ${JSON.stringify(Object.keys(state.choice))}`
    )
  }
  return node._encode(data.value, reporter)
}

Node.prototype._encodePrimitive = function encodePrimitive (tag, data) {
  const state = this._baseState

  if (/str$/.test(tag)) { return this._encodeStr(data, tag) } else if (tag === 'objid' && state.args) { return this._encodeObjid(data, state.reverseArgs[0], state.args[1]) } else if (tag === 'objid') { return this._encodeObjid(data, null, null) } else if (tag === 'gentime' || tag === 'utctime') { return this._encodeTime(data, tag) } else if (tag === 'null_') { return this._encodeNull() } else if (tag === 'int' || tag === 'enum') { return this._encodeInt(data, state.args && state.reverseArgs[0]) } else if (tag === 'bool') { return this._encodeBool(data) } else if (tag === 'objDesc') { return this._encodeStr(data, tag) } else { throw new Error(`Unsupported tag: ${tag}`) }
}

Node.prototype._isNumstr = function isNumstr (str) {
  return /^[0-9 ]*$/.test(str)
}

Node.prototype._isPrintstr = function isPrintstr (str) {
  return /^[A-Za-z0-9 '()+,-./:=?]*$/.test(str)
}

module.exports = Node


/***/ }),
/* 721 */,
/* 722 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(422);
var Range_1 = __webpack_require__(759);
/**
 * @class
 * Class representing LargeFileUploadTask
 */
var LargeFileUploadTask = /** @class */ (function () {
    /**
     * @public
     * @constructor
     * Constructs a LargeFileUploadTask
     * @param {Client} client - The GraphClient instance
     * @param {FileObject} file - The FileObject holding details of a file that needs to be uploaded
     * @param {LargeFileUploadSession} uploadSession - The upload session to which the upload has to be done
     * @param {LargeFileUploadTaskOptions} options - The upload task options
     * @returns An instance of LargeFileUploadTask
     */
    function LargeFileUploadTask(client, file, uploadSession, options) {
        if (options === void 0) { options = {}; }
        /**
         * @private
         * Default value for the rangeSize
         */
        this.DEFAULT_FILE_SIZE = 5 * 1024 * 1024;
        this.client = client;
        this.file = file;
        if (options.rangeSize === undefined) {
            options.rangeSize = this.DEFAULT_FILE_SIZE;
        }
        this.options = options;
        this.uploadSession = uploadSession;
        this.nextRange = new Range_1.Range(0, this.options.rangeSize - 1);
    }
    /**
     * @public
     * @static
     * @async
     * Makes request to the server to create an upload session
     * @param {Client} client - The GraphClient instance
     * @param {any} payload - The payload that needs to be sent
     * @param {KeyValuePairObjectStringNumber} headers - The headers that needs to be sent
     * @returns The promise that resolves to LargeFileUploadSession
     */
    LargeFileUploadTask.createUploadSession = function (client, requestUrl, payload, headers) {
        if (headers === void 0) { headers = {}; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var session, largeFileUploadSession, err_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, client
                                .api(requestUrl)
                                .headers(headers)
                                .post(payload)];
                    case 1:
                        session = _a.sent();
                        largeFileUploadSession = {
                            url: session.uploadUrl,
                            expiry: new Date(session.expirationDateTime),
                        };
                        return [2 /*return*/, largeFileUploadSession];
                    case 2:
                        err_1 = _a.sent();
                        throw err_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @private
     * Parses given range string to the Range instance
     * @param {string[]} ranges - The ranges value
     * @returns The range instance
     */
    LargeFileUploadTask.prototype.parseRange = function (ranges) {
        var rangeStr = ranges[0];
        if (typeof rangeStr === "undefined" || rangeStr === "") {
            return new Range_1.Range();
        }
        var firstRange = rangeStr.split("-");
        var minVal = parseInt(firstRange[0], 10);
        var maxVal = parseInt(firstRange[1], 10);
        if (Number.isNaN(maxVal)) {
            maxVal = this.file.size - 1;
        }
        return new Range_1.Range(minVal, maxVal);
    };
    /**
     * @private
     * Updates the expiration date and the next range
     * @param {UploadStatusResponse} response - The response of the upload status
     * @returns Nothing
     */
    LargeFileUploadTask.prototype.updateTaskStatus = function (response) {
        this.uploadSession.expiry = new Date(response.expirationDateTime);
        this.nextRange = this.parseRange(response.nextExpectedRanges);
    };
    /**
     * @public
     * Gets next range that needs to be uploaded
     * @returns The range instance
     */
    LargeFileUploadTask.prototype.getNextRange = function () {
        if (this.nextRange.minValue === -1) {
            return this.nextRange;
        }
        var minVal = this.nextRange.minValue;
        var maxValue = minVal + this.options.rangeSize - 1;
        if (maxValue >= this.file.size) {
            maxValue = this.file.size - 1;
        }
        return new Range_1.Range(minVal, maxValue);
    };
    /**
     * @public
     * Slices the file content to the given range
     * @param {Range} range - The range value
     * @returns The sliced ArrayBuffer or Blob
     */
    LargeFileUploadTask.prototype.sliceFile = function (range) {
        var blob = this.file.content.slice(range.minValue, range.maxValue + 1);
        return blob;
    };
    /**
     * @public
     * @async
     * Uploads file to the server in a sequential order by slicing the file
     * @returns The promise resolves to uploaded response
     */
    LargeFileUploadTask.prototype.upload = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var nextRange, err, fileSlice, response, err_2;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        _a.label = 1;
                    case 1:
                        if (false) {}
                        nextRange = this.getNextRange();
                        if (nextRange.maxValue === -1) {
                            err = new Error("Task with which you are trying to upload is already completed, Please check for your uploaded file");
                            err.name = "Invalid Session";
                            throw err;
                        }
                        fileSlice = this.sliceFile(nextRange);
                        return [4 /*yield*/, this.uploadSlice(fileSlice, nextRange, this.file.size)];
                    case 2:
                        response = _a.sent();
                        // Upon completion of upload process incase of onedrive, driveItem is returned, which contains id
                        if (response.id !== undefined) {
                            return [2 /*return*/, response];
                        }
                        else {
                            this.updateTaskStatus(response);
                        }
                        return [3 /*break*/, 1];
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        err_2 = _a.sent();
                        throw err_2;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @public
     * @async
     * Uploads given slice to the server
     * @param {ArrayBuffer | Blob | File} fileSlice - The file slice
     * @param {Range} range - The range value
     * @param {number} totalSize - The total size of a complete file
     */
    LargeFileUploadTask.prototype.uploadSlice = function (fileSlice, range, totalSize) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var err_3;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client
                                .api(this.uploadSession.url)
                                .headers({
                                "Content-Length": "" + (range.maxValue - range.minValue + 1),
                                "Content-Range": "bytes " + range.minValue + "-" + range.maxValue + "/" + totalSize,
                            })
                                .put(fileSlice)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        err_3 = _a.sent();
                        throw err_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @public
     * @async
     * Deletes upload session in the server
     * @returns The promise resolves to cancelled response
     */
    LargeFileUploadTask.prototype.cancel = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var err_4;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client.api(this.uploadSession.url).delete()];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        err_4 = _a.sent();
                        throw err_4;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @public
     * @async
     * Gets status for the upload session
     * @returns The promise resolves to the status enquiry response
     */
    LargeFileUploadTask.prototype.getStatus = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var response, err_5;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client.api(this.uploadSession.url).get()];
                    case 1:
                        response = _a.sent();
                        this.updateTaskStatus(response);
                        return [2 /*return*/, response];
                    case 2:
                        err_5 = _a.sent();
                        throw err_5;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @public
     * @async
     * Resumes upload session and continue uploading the file from the last sent range
     * @returns The promise resolves to the uploaded response
     */
    LargeFileUploadTask.prototype.resume = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var err_6;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getStatus()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.upload()];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        err_6 = _a.sent();
                        throw err_6;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return LargeFileUploadTask;
}());
exports.LargeFileUploadTask = LargeFileUploadTask;
//# sourceMappingURL=LargeFileUploadTask.js.map

/***/ }),
/* 723 */
/***/ (function(module) {

module.exports = {
  oct: {
    decrypt: {},
    deriveKey: {},
    encrypt: {},
    sign: {},
    unwrapKey: {},
    verify: {},
    wrapKey: {}
  },
  EC: {
    decrypt: {},
    deriveKey: {},
    encrypt: {},
    sign: {},
    unwrapKey: {},
    verify: {},
    wrapKey: {}
  },
  RSA: {
    decrypt: {},
    deriveKey: {},
    encrypt: {},
    sign: {},
    unwrapKey: {},
    verify: {},
    wrapKey: {}
  },
  OKP: {
    decrypt: {},
    deriveKey: {},
    encrypt: {},
    sign: {},
    unwrapKey: {},
    verify: {},
    wrapKey: {}
  }
}


/***/ }),
/* 724 */,
/* 725 */,
/* 726 */,
/* 727 */
/***/ (function(module, __unusedexports, __webpack_require__) {

/* global BigInt */

const { keyObjectSupported } = __webpack_require__(915)

let createPublicKey
let createPrivateKey
let createSecretKey
let KeyObject
let asInput

if (keyObjectSupported) {
  ({ createPublicKey, createPrivateKey, createSecretKey, KeyObject } = __webpack_require__(417))
  asInput = (input) => input
} else {
  const { EOL } = __webpack_require__(87)

  const errors = __webpack_require__(688)
  const isObject = __webpack_require__(920)
  const asn1 = __webpack_require__(805)
  const toInput = Symbol('toInput')

  const namedCurve = Symbol('namedCurve')

  asInput = (keyObject, needsPublic) => {
    if (keyObject instanceof KeyObject) {
      return keyObject[toInput](needsPublic)
    }

    return createSecretKey(keyObject)[toInput](needsPublic)
  }

  const pemToDer = pem => Buffer.from(pem.replace(/(?:-----(?:BEGIN|END)(?: (?:RSA|EC))? (?:PRIVATE|PUBLIC) KEY-----|\s)/g, ''), 'base64')
  const derToPem = (der, label) => `-----BEGIN ${label}-----${EOL}${der.toString('base64').match(/.{1,64}/g).join(EOL)}${EOL}-----END ${label}-----`
  const unsupported = (label) => {
    switch (label) {
      case '1.3.101.110':
        label = 'X25519'
        break
      case '1.3.101.111':
        label = 'X448'
        break
      case '1.3.101.112':
        label = 'Ed25519'
        break
      case '1.3.101.113':
        label = 'Ed448'
        break
      default:
        label = `OID ${label}`
    }

    throw new errors.JOSENotSupported(`${label} is not supported in your Node.js runtime version`)
  }

  KeyObject = class KeyObject {
    export ({ cipher, passphrase, type, format } = {}) {
      if (this._type === 'secret') {
        return this._buffer
      }

      if (this._type === 'public') {
        if (this.asymmetricKeyType === 'rsa') {
          switch (type) {
            case 'pkcs1':
              if (format === 'pem') {
                return this._pem
              }

              return pemToDer(this._pem)
            case 'spki': {
              const PublicKeyInfo = asn1.get('PublicKeyInfo')
              const pem = PublicKeyInfo.encode({
                algorithm: {
                  algorithm: '1.2.840.113549.1.1.1'.split('.'),
                  parameters: Buffer.from('BQA=', 'base64')
                },
                publicKey: {
                  unused: 0,
                  data: pemToDer(this._pem)
                }
              }, 'pem', { label: 'PUBLIC KEY' })

              return format === 'pem' ? pem : pemToDer(pem)
            }
            default:
              throw new TypeError(`The value ${type} is invalid for option "type"`)
          }
        }

        if (this.asymmetricKeyType === 'ec') {
          if (type !== 'spki') {
            throw new TypeError(`The value ${type} is invalid for option "type"`)
          }

          if (format === 'pem') {
            return this._pem
          }

          return pemToDer(this._pem)
        }
      }

      if (this._type === 'private') {
        if (passphrase !== undefined || cipher !== undefined) {
          throw new errors.JOSENotSupported('encrypted private keys are not supported in your Node.js runtime version')
        }

        if (type === 'pkcs8') {
          if (this._pkcs8) {
            if (format === 'der' && typeof this._pkcs8 === 'string') {
              return pemToDer(this._pkcs8)
            }

            if (format === 'pem' && Buffer.isBuffer(this._pkcs8)) {
              return derToPem(this._pkcs8, 'PRIVATE KEY')
            }

            return this._pkcs8
          }

          if (this.asymmetricKeyType === 'rsa') {
            const parsed = this._asn1
            const RSAPrivateKey = asn1.get('RSAPrivateKey')
            const privateKey = RSAPrivateKey.encode(parsed)
            const PrivateKeyInfo = asn1.get('PrivateKeyInfo')
            const pkcs8 = PrivateKeyInfo.encode({
              version: 0,
              privateKey,
              algorithm: {
                algorithm: '1.2.840.113549.1.1.1'.split('.'),
                parameters: Buffer.from('BQA=', 'base64')
              }
            })

            this._pkcs8 = pkcs8

            return this.export({ type, format })
          }

          if (this.asymmetricKeyType === 'ec') {
            const parsed = this._asn1
            const ECPrivateKey = asn1.get('ECPrivateKey')
            const privateKey = ECPrivateKey.encode({
              version: parsed.version,
              privateKey: parsed.privateKey,
              publicKey: parsed.publicKey
            })
            const PrivateKeyInfo = asn1.get('PrivateKeyInfo')
            const OID = asn1.get('OID')
            const pkcs8 = PrivateKeyInfo.encode({
              version: 0,
              privateKey,
              algorithm: {
                algorithm: '1.2.840.10045.2.1'.split('.'),
                parameters: OID.encode(this._asn1.parameters.value)
              }
            })

            this._pkcs8 = pkcs8

            return this.export({ type, format })
          }
        }

        if (this.asymmetricKeyType === 'rsa' && type === 'pkcs1') {
          if (format === 'pem') {
            return this._pem
          }

          return pemToDer(this._pem)
        } else if (this.asymmetricKeyType === 'ec' && type === 'sec1') {
          if (format === 'pem') {
            return this._pem
          }

          return pemToDer(this._pem)
        } else {
          throw new TypeError(`The value ${type} is invalid for option "type"`)
        }
      }
    }

    get type () {
      return this._type
    }

    get asymmetricKeyType () {
      return this._asymmetricKeyType
    }

    get symmetricKeySize () {
      return this._symmetricKeySize
    }

    [toInput] (needsPublic) {
      switch (this._type) {
        case 'secret':
          return this._buffer
        case 'public':
          return this._pem
        default:
          if (needsPublic) {
            if (!('_pub' in this)) {
              this._pub = createPublicKey(this)
            }

            return this._pub[toInput](false)
          }

          return this._pem
      }
    }
  }

  createSecretKey = (buffer) => {
    if (!Buffer.isBuffer(buffer) || !buffer.length) {
      throw new TypeError('input must be a non-empty Buffer instance')
    }

    const keyObject = new KeyObject()
    keyObject._buffer = Buffer.from(buffer)
    keyObject._symmetricKeySize = buffer.length
    keyObject._type = 'secret'

    return keyObject
  }

  createPublicKey = (input) => {
    if (input instanceof KeyObject) {
      if (input.type !== 'private') {
        throw new TypeError(`Invalid key object type ${input.type}, expected private.`)
      }

      switch (input.asymmetricKeyType) {
        case 'ec': {
          const PublicKeyInfo = asn1.get('PublicKeyInfo')
          const OID = asn1.get('OID')
          const key = PublicKeyInfo.encode({
            algorithm: {
              algorithm: '1.2.840.10045.2.1'.split('.'),
              parameters: OID.encode(input._asn1.parameters.value)
            },
            publicKey: input._asn1.publicKey
          })

          return createPublicKey({ key, format: 'der', type: 'spki' })
        }
        case 'rsa': {
          const RSAPublicKey = asn1.get('RSAPublicKey')
          const key = RSAPublicKey.encode(input._asn1)
          return createPublicKey({ key, format: 'der', type: 'pkcs1' })
        }
      }
    }

    if (typeof input === 'string' || Buffer.isBuffer(input)) {
      input = { key: input, format: 'pem' }
    }

    if (!isObject(input)) {
      throw new TypeError('input must be a string, Buffer or an object')
    }

    const { format, passphrase } = input
    let { key, type } = input

    if (typeof key !== 'string' && !Buffer.isBuffer(key)) {
      throw new TypeError('key must be a string or Buffer')
    }

    if (format !== 'pem' && format !== 'der') {
      throw new TypeError('format must be one of "pem" or "der"')
    }

    let label
    if (format === 'pem') {
      key = key.toString()
      switch (key.split(/\r?\n/g)[0].toString()) {
        case '-----BEGIN PUBLIC KEY-----':
          type = 'spki'
          label = 'PUBLIC KEY'
          break
        case '-----BEGIN RSA PUBLIC KEY-----':
          type = 'pkcs1'
          label = 'RSA PUBLIC KEY'
          break
        case '-----BEGIN CERTIFICATE-----':
          throw new errors.JOSENotSupported('X.509 certificates are not supported in your Node.js runtime version')
        case '-----BEGIN PRIVATE KEY-----':
        case '-----BEGIN EC PRIVATE KEY-----':
        case '-----BEGIN RSA PRIVATE KEY-----':
          return createPublicKey(createPrivateKey(key))
        default:
          throw new TypeError('unknown/unsupported PEM type')
      }
    }

    switch (type) {
      case 'spki': {
        const PublicKeyInfo = asn1.get('PublicKeyInfo')
        const parsed = PublicKeyInfo.decode(key, format, { label })

        let type, keyObject
        const oid = parsed.algorithm.algorithm.join('.')
        switch (oid) {
          case '1.2.840.10045.2.1': {
            keyObject = new KeyObject()
            keyObject._asn1 = parsed
            keyObject._asymmetricKeyType = 'ec'
            keyObject._type = 'public'
            keyObject._pem = PublicKeyInfo.encode(parsed, 'pem', { label: 'PUBLIC KEY' })

            break
          }
          case '1.2.840.113549.1.1.1': {
            type = 'pkcs1'
            keyObject = createPublicKey({ type, key: parsed.publicKey.data, format: 'der' })
            break
          }
          default:
            unsupported(oid)
        }

        return keyObject
      }
      case 'pkcs1': {
        const RSAPublicKey = asn1.get('RSAPublicKey')
        const parsed = RSAPublicKey.decode(key, format, { label })

        // special case when private pkcs1 PEM / DER is used with createPublicKey
        if (parsed.n === BigInt(0)) {
          return createPublicKey(createPrivateKey({ key, format, type, passphrase }))
        }

        const keyObject = new KeyObject()
        keyObject._asn1 = parsed
        keyObject._asymmetricKeyType = 'rsa'
        keyObject._type = 'public'
        keyObject._pem = RSAPublicKey.encode(parsed, 'pem', { label: 'RSA PUBLIC KEY' })

        return keyObject
      }
      case 'pkcs8':
      case 'sec1':
        return createPublicKey(createPrivateKey({ format, key, type, passphrase }))
      default:
        throw new TypeError(`The value ${type} is invalid for option "type"`)
    }
  }

  createPrivateKey = (input, hints) => {
    if (typeof input === 'string' || Buffer.isBuffer(input)) {
      input = { key: input, format: 'pem' }
    }

    if (!isObject(input)) {
      throw new TypeError('input must be a string, Buffer or an object')
    }

    const { format, passphrase } = input
    let { key, type } = input

    if (typeof key !== 'string' && !Buffer.isBuffer(key)) {
      throw new TypeError('key must be a string or Buffer')
    }

    if (passphrase !== undefined) {
      throw new errors.JOSENotSupported('encrypted private keys are not supported in your Node.js runtime version')
    }

    if (format !== 'pem' && format !== 'der') {
      throw new TypeError('format must be one of "pem" or "der"')
    }

    let label
    if (format === 'pem') {
      key = key.toString()
      switch (key.split(/\r?\n/g)[0].toString()) {
        case '-----BEGIN PRIVATE KEY-----':
          type = 'pkcs8'
          label = 'PRIVATE KEY'
          break
        case '-----BEGIN EC PRIVATE KEY-----':
          type = 'sec1'
          label = 'EC PRIVATE KEY'
          break
        case '-----BEGIN RSA PRIVATE KEY-----':
          type = 'pkcs1'
          label = 'RSA PRIVATE KEY'
          break
        default:
          throw new TypeError('unknown/unsupported PEM type')
      }
    }

    switch (type) {
      case 'pkcs8': {
        const PrivateKeyInfo = asn1.get('PrivateKeyInfo')
        const parsed = PrivateKeyInfo.decode(key, format, { label })

        let type, keyObject
        const oid = parsed.algorithm.algorithm.join('.')
        switch (oid) {
          case '1.2.840.10045.2.1': {
            const OID = asn1.get('OID')
            type = 'sec1'
            keyObject = createPrivateKey({ type, key: parsed.privateKey, format: 'der' }, { [namedCurve]: OID.decode(parsed.algorithm.parameters) })
            break
          }
          case '1.2.840.113549.1.1.1': {
            type = 'pkcs1'
            keyObject = createPrivateKey({ type, key: parsed.privateKey, format: 'der' })
            break
          }
          default:
            unsupported(oid)
        }

        keyObject._pkcs8 = key
        return keyObject
      }
      case 'pkcs1': {
        const RSAPrivateKey = asn1.get('RSAPrivateKey')
        const parsed = RSAPrivateKey.decode(key, format, { label })

        const keyObject = new KeyObject()
        keyObject._asn1 = parsed
        keyObject._asymmetricKeyType = 'rsa'
        keyObject._type = 'private'
        keyObject._pem = RSAPrivateKey.encode(parsed, 'pem', { label: 'RSA PRIVATE KEY' })

        return keyObject
      }
      case 'sec1': {
        const ECPrivateKey = asn1.get('ECPrivateKey')
        let parsed = ECPrivateKey.decode(key, format, { label })

        if (!('parameters' in parsed) && !hints[namedCurve]) {
          throw new Error('invalid sec1')
        } else if (!('parameters' in parsed)) {
          parsed = { ...parsed, parameters: { type: 'namedCurve', value: hints[namedCurve] } }
        }

        const keyObject = new KeyObject()
        keyObject._asn1 = parsed
        keyObject._asymmetricKeyType = 'ec'
        keyObject._type = 'private'
        keyObject._pem = ECPrivateKey.encode(parsed, 'pem', { label: 'EC PRIVATE KEY' })

        return keyObject
      }
      default:
        throw new TypeError(`The value ${type} is invalid for option "type"`)
    }
  }
}

module.exports = { createPublicKey, createPrivateKey, createSecretKey, KeyObject, asInput }


/***/ }),
/* 728 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { generateKeyPairSync, generateKeyPair: async } = __webpack_require__(417)
const { promisify } = __webpack_require__(669)

const {
  THUMBPRINT_MATERIAL, JWK_MEMBERS, PUBLIC_MEMBERS,
  PRIVATE_MEMBERS, KEY_MANAGEMENT_DECRYPT, KEY_MANAGEMENT_ENCRYPT
} = __webpack_require__(771)
const { OKP_CURVES } = __webpack_require__(962)
const { edDSASupported } = __webpack_require__(915)
const errors = __webpack_require__(688)

const Key = __webpack_require__(228)

const generateKeyPair = promisify(async)

const OKP_PUBLIC = new Set(['crv', 'x'])
Object.freeze(OKP_PUBLIC)
const OKP_PRIVATE = new Set([...OKP_PUBLIC, 'd'])
Object.freeze(OKP_PRIVATE)

// Octet string key pairs Key Type
class OKPKey extends Key {
  constructor (...args) {
    super(...args)

    Object.defineProperties(this, {
      kty: {
        value: 'OKP',
        enumerable: true
      }
    })
    this[JWK_MEMBERS]()
  }

  static get [PUBLIC_MEMBERS] () {
    return OKP_PUBLIC
  }

  static get [PRIVATE_MEMBERS] () {
    return OKP_PRIVATE
  }

  // https://tc39.github.io/ecma262/#sec-ordinaryownpropertykeys no need for any special
  // JSON.stringify handling in V8
  [THUMBPRINT_MATERIAL] () {
    return { crv: this.crv, kty: 'OKP', x: this.x }
  }

  [KEY_MANAGEMENT_ENCRYPT] () {
    return this.algorithms('deriveKey')
  }

  [KEY_MANAGEMENT_DECRYPT] () {
    if (this.public) {
      return new Set()
    }
    return this.algorithms('deriveKey')
  }

  static async generate (crv = 'Ed25519', privat = true) {
    if (!edDSASupported) {
      throw new errors.JOSENotSupported('OKP keys are not supported in your Node.js runtime version')
    }

    if (!OKP_CURVES.has(crv)) {
      throw new errors.JOSENotSupported(`unsupported OKP key curve: ${crv}`)
    }

    const { privateKey, publicKey } = await generateKeyPair(crv.toLowerCase())

    return privat ? privateKey : publicKey
  }

  static generateSync (crv = 'Ed25519', privat = true) {
    if (!edDSASupported) {
      throw new errors.JOSENotSupported('OKP keys are not supported in your Node.js runtime version')
    }

    if (!OKP_CURVES.has(crv)) {
      throw new errors.JOSENotSupported(`unsupported OKP key curve: ${crv}`)
    }

    const { privateKey, publicKey } = generateKeyPairSync(crv.toLowerCase())

    return privat ? privateKey : publicKey
  }
}

module.exports = OKPKey


/***/ }),
/* 729 */,
/* 730 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var baseMerge = __webpack_require__(834),
    createAssigner = __webpack_require__(797);

/**
 * This method is like `_.merge` except that it accepts `customizer` which
 * is invoked to produce the merged values of the destination and source
 * properties. If `customizer` returns `undefined`, merging is handled by the
 * method instead. The `customizer` is invoked with six arguments:
 * (objValue, srcValue, key, object, source, stack).
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} sources The source objects.
 * @param {Function} customizer The function to customize assigned values.
 * @returns {Object} Returns `object`.
 * @example
 *
 * function customizer(objValue, srcValue) {
 *   if (_.isArray(objValue)) {
 *     return objValue.concat(srcValue);
 *   }
 * }
 *
 * var object = { 'a': [1], 'b': [2] };
 * var other = { 'a': [3], 'b': [4] };
 *
 * _.mergeWith(object, other, customizer);
 * // => { 'a': [1, 3], 'b': [2, 4] }
 */
var mergeWith = createAssigner(function(object, source, srcIndex, customizer) {
  baseMerge(object, source, srcIndex, customizer);
});

module.exports = mergeWith;


/***/ }),
/* 731 */,
/* 732 */,
/* 733 */,
/* 734 */,
/* 735 */,
/* 736 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { sign: signOneShot, verify: verifyOneShot } = __webpack_require__(417)

const { KEYOBJECT } = __webpack_require__(771)
const { edDSASupported } = __webpack_require__(915)

const sign = ({ [KEYOBJECT]: keyObject }, payload) => {
  if (typeof payload === 'string') {
    payload = Buffer.from(payload)
  }
  return signOneShot(undefined, payload, keyObject)
}

const verify = ({ [KEYOBJECT]: keyObject }, payload, signature) => {
  return verifyOneShot(undefined, payload, keyObject, signature)
}

module.exports = (JWA, JWK) => {
  if (edDSASupported) {
    JWA.sign.set('EdDSA', sign)
    JWA.verify.set('EdDSA', verify)
    JWK.OKP.sign.EdDSA = key => key.private && JWK.OKP.verify.EdDSA(key)
    JWK.OKP.verify.EdDSA = key => (key.use === 'sig' || key.use === undefined) && key.keyObject.asymmetricKeyType.startsWith('ed')
  }
}


/***/ }),
/* 737 */,
/* 738 */,
/* 739 */,
/* 740 */,
/* 741 */
/***/ (function(module, exports) {

"use strict";
// ISC @ Julien Fontanet



// ===================================================================

var construct = typeof Reflect !== 'undefined' ? Reflect.construct : undefined
var defineProperty = Object.defineProperty

// -------------------------------------------------------------------

var captureStackTrace = Error.captureStackTrace
if (captureStackTrace === undefined) {
  captureStackTrace = function captureStackTrace (error) {
    var container = new Error()

    defineProperty(error, 'stack', {
      configurable: true,
      get: function getStack () {
        var stack = container.stack

        // Replace property with value for faster future accesses.
        defineProperty(this, 'stack', {
          configurable: true,
          value: stack,
          writable: true
        })

        return stack
      },
      set: function setStack (stack) {
        defineProperty(error, 'stack', {
          configurable: true,
          value: stack,
          writable: true
        })
      }
    })
  }
}

// -------------------------------------------------------------------

function BaseError (message) {
  if (message !== undefined) {
    defineProperty(this, 'message', {
      configurable: true,
      value: message,
      writable: true
    })
  }

  var cname = this.constructor.name
  if (
    cname !== undefined &&
    cname !== this.name
  ) {
    defineProperty(this, 'name', {
      configurable: true,
      value: cname,
      writable: true
    })
  }

  captureStackTrace(this, this.constructor)
}

BaseError.prototype = Object.create(Error.prototype, {
  // See: https://github.com/JsCommunity/make-error/issues/4
  constructor: {
    configurable: true,
    value: BaseError,
    writable: true
  }
})

// -------------------------------------------------------------------

// Sets the name of a function if possible (depends of the JS engine).
var setFunctionName = (function () {
  function setFunctionName (fn, name) {
    return defineProperty(fn, 'name', {
      configurable: true,
      value: name
    })
  }
  try {
    var f = function () {}
    setFunctionName(f, 'foo')
    if (f.name === 'foo') {
      return setFunctionName
    }
  } catch (_) {}
})()

// -------------------------------------------------------------------

function makeError (constructor, super_) {
  if (super_ == null || super_ === Error) {
    super_ = BaseError
  } else if (typeof super_ !== 'function') {
    throw new TypeError('super_ should be a function')
  }

  var name
  if (typeof constructor === 'string') {
    name = constructor
    constructor = construct !== undefined
      ? function () { return construct(super_, arguments, this.constructor) }
      : function () { super_.apply(this, arguments) }

    // If the name can be set, do it once and for all.
    if (setFunctionName !== undefined) {
      setFunctionName(constructor, name)
      name = undefined
    }
  } else if (typeof constructor !== 'function') {
    throw new TypeError('constructor should be either a string or a function')
  }

  // Also register the super constructor also as `constructor.super_` just
  // like Node's `util.inherits()`.
  constructor.super_ = constructor['super'] = super_

  var properties = {
    constructor: {
      configurable: true,
      value: constructor,
      writable: true
    }
  }

  // If the name could not be set on the constructor, set it on the
  // prototype.
  if (name !== undefined) {
    properties.name = {
      configurable: true,
      value: name,
      writable: true
    }
  }
  constructor.prototype = Object.create(super_.prototype, properties)

  return constructor
}
exports = module.exports = makeError
exports.BaseError = BaseError


/***/ }),
/* 742 */,
/* 743 */
/***/ (function(module) {

/**
 * A specialized version of `_.some` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 */
function arraySome(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}

module.exports = arraySome;


/***/ }),
/* 744 */
/***/ (function(module, exports, __webpack_require__) {

/* module decorator */ module = __webpack_require__.nmd(module);
var root = __webpack_require__(824);

/** Detect free variable `exports`. */
var freeExports =  true && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && "object" == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined,
    allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined;

/**
 * Creates a clone of  `buffer`.
 *
 * @private
 * @param {Buffer} buffer The buffer to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Buffer} Returns the cloned buffer.
 */
function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }
  var length = buffer.length,
      result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

  buffer.copy(result);
  return result;
}

module.exports = cloneBuffer;


/***/ }),
/* 745 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const isObject = __webpack_require__(920)
const epoch = __webpack_require__(0)
const secs = __webpack_require__(434)
const getKey = __webpack_require__(322)
const { bare: verify } = __webpack_require__(633)
const { JWTClaimInvalid, JWTExpired } = __webpack_require__(688)

const { isString, isNotString } = __webpack_require__(518)
const decode = __webpack_require__(150)

const isPayloadString = isString.bind(undefined, JWTClaimInvalid)
const isOptionString = isString.bind(undefined, TypeError)

const IDTOKEN = 'id_token'
const LOGOUTTOKEN = 'logout_token'
const ATJWT = 'at+JWT'

const isTimestamp = (value, label, required = false) => {
  if (required && value === undefined) {
    throw new JWTClaimInvalid(`"${label}" claim is missing`, label, 'missing')
  }

  if (value !== undefined && (typeof value !== 'number' || !Number.isSafeInteger(value))) {
    throw new JWTClaimInvalid(`"${label}" claim must be a unix timestamp`, label, 'invalid')
  }
}

const isStringOrArrayOfStrings = (value, label, required = false) => {
  if (required && value === undefined) {
    throw new JWTClaimInvalid(`"${label}" claim is missing`, label, 'missing')
  }

  if (value !== undefined && (isNotString(value) && isNotArrayOfStrings(value))) {
    throw new JWTClaimInvalid(`"${label}" claim must be a string or array of strings`, label, 'invalid')
  }
}

const isNotArrayOfStrings = val => !Array.isArray(val) || val.length === 0 || val.some(isNotString)

const validateOptions = ({
  algorithms, audience, clockTolerance, complete = false, crit, ignoreExp = false,
  ignoreIat = false, ignoreNbf = false, issuer, jti, maxAuthAge, maxTokenAge, nonce, now = new Date(),
  profile, subject, typ
}) => {
  isOptionString(profile, 'options.profile')

  if (typeof complete !== 'boolean') {
    throw new TypeError('options.complete must be a boolean')
  }

  if (typeof ignoreExp !== 'boolean') {
    throw new TypeError('options.ignoreExp must be a boolean')
  }

  if (typeof ignoreNbf !== 'boolean') {
    throw new TypeError('options.ignoreNbf must be a boolean')
  }

  if (typeof ignoreIat !== 'boolean') {
    throw new TypeError('options.ignoreIat must be a boolean')
  }

  isOptionString(maxTokenAge, 'options.maxTokenAge')
  isOptionString(subject, 'options.subject')
  isOptionString(issuer, 'options.issuer')
  isOptionString(maxAuthAge, 'options.maxAuthAge')
  isOptionString(jti, 'options.jti')
  isOptionString(clockTolerance, 'options.clockTolerance')
  isOptionString(typ, 'options.typ')

  if (audience !== undefined && (isNotString(audience) && isNotArrayOfStrings(audience))) {
    throw new TypeError('options.audience must be a string or an array of strings')
  }

  if (algorithms !== undefined && isNotArrayOfStrings(algorithms)) {
    throw new TypeError('options.algorithms must be an array of strings')
  }

  isOptionString(nonce, 'options.nonce')

  if (!(now instanceof Date) || !now.getTime()) {
    throw new TypeError('options.now must be a valid Date object')
  }

  if (ignoreIat && maxTokenAge !== undefined) {
    throw new TypeError('options.ignoreIat and options.maxTokenAge cannot used together')
  }

  if (crit !== undefined && isNotArrayOfStrings(crit)) {
    throw new TypeError('options.crit must be an array of strings')
  }

  switch (profile) {
    case IDTOKEN:
      if (!issuer) {
        throw new TypeError('"issuer" option is required to validate an ID Token')
      }

      if (!audience) {
        throw new TypeError('"audience" option is required to validate an ID Token')
      }

      break
    case ATJWT:
      if (!issuer) {
        throw new TypeError('"issuer" option is required to validate a JWT Access Token')
      }

      if (!audience) {
        throw new TypeError('"audience" option is required to validate a JWT Access Token')
      }

      typ = ATJWT

      break
    case LOGOUTTOKEN:
      if (!issuer) {
        throw new TypeError('"issuer" option is required to validate a Logout Token')
      }

      if (!audience) {
        throw new TypeError('"audience" option is required to validate a Logout Token')
      }

      break
    case undefined:
      break
    default:
      throw new TypeError(`unsupported options.profile value "${profile}"`)
  }

  return {
    algorithms,
    audience,
    clockTolerance,
    complete,
    crit,
    ignoreExp,
    ignoreIat,
    ignoreNbf,
    issuer,
    jti,
    maxAuthAge,
    maxTokenAge,
    nonce,
    now,
    profile,
    subject,
    typ
  }
}

const validateTypes = ({ header, payload }, profile, options) => {
  isPayloadString(header.alg, '"alg" header parameter', 'alg', true)

  isTimestamp(payload.iat, 'iat', profile === IDTOKEN || profile === LOGOUTTOKEN || !!options.maxTokenAge)
  isTimestamp(payload.exp, 'exp', profile === IDTOKEN || profile === ATJWT)
  isTimestamp(payload.auth_time, 'auth_time', !!options.maxAuthAge)
  isTimestamp(payload.nbf, 'nbf')
  isPayloadString(payload.jti, '"jti" claim', 'jti', profile === LOGOUTTOKEN || !!options.jti)
  isPayloadString(payload.acr, '"acr" claim', 'acr')
  isPayloadString(payload.nonce, '"nonce" claim', 'nonce', !!options.nonce)
  isPayloadString(payload.iss, '"iss" claim', 'iss', !!options.issuer)
  isPayloadString(payload.sub, '"sub" claim', 'sub', profile === IDTOKEN || profile === ATJWT || !!options.subject)
  isStringOrArrayOfStrings(payload.aud, 'aud', !!options.audience)
  isPayloadString(payload.azp, '"azp" claim', 'azp', profile === IDTOKEN && Array.isArray(payload.aud) && payload.aud.length > 1)
  isStringOrArrayOfStrings(payload.amr, 'amr')
  isPayloadString(header.typ, '"typ" header parameter', 'typ', !!options.typ)

  if (profile === ATJWT) {
    isPayloadString(payload.client_id, '"client_id" claim', 'client_id', true)
  }

  if (profile === LOGOUTTOKEN) {
    isPayloadString(payload.sid, '"sid" claim', 'sid')

    if (!('sid' in payload) && !('sub' in payload)) {
      throw new JWTClaimInvalid('either "sid" or "sub" (or both) claims must be present')
    }

    if ('nonce' in payload) {
      throw new JWTClaimInvalid('"nonce" claim is prohibited', 'nonce', 'prohibited')
    }

    if (!('events' in payload)) {
      throw new JWTClaimInvalid('"events" claim is missing', 'events', 'missing')
    }

    if (!isObject(payload.events)) {
      throw new JWTClaimInvalid('"events" claim must be an object', 'events', 'invalid')
    }

    if (!('http://schemas.openid.net/event/backchannel-logout' in payload.events)) {
      throw new JWTClaimInvalid('"http://schemas.openid.net/event/backchannel-logout" member is missing in the "events" claim', 'events', 'invalid')
    }

    if (!isObject(payload.events['http://schemas.openid.net/event/backchannel-logout'])) {
      throw new JWTClaimInvalid('"http://schemas.openid.net/event/backchannel-logout" member in the "events" claim must be an object', 'events', 'invalid')
    }
  }
}

const checkAudiencePresence = (audPayload, audOption, profile) => {
  if (typeof audPayload === 'string') {
    return audOption.includes(audPayload)
  }

  if (profile === ATJWT) {
    // reject if it contains additional audiences that are not known aliases of the resource
    // indicator of the current resource server
    audOption = new Set(audOption)
    return audPayload.every(Set.prototype.has.bind(audOption))
  } else {
    // Each principal intended to process the JWT MUST
    // identify itself with a value in the audience claim
    audPayload = new Set(audPayload)
    return audOption.some(Set.prototype.has.bind(audPayload))
  }
}

module.exports = (token, key, options = {}) => {
  if (!isObject(options)) {
    throw new TypeError('options must be an object')
  }

  const {
    algorithms, audience, clockTolerance, complete, crit, ignoreExp, ignoreIat, ignoreNbf, issuer,
    jti, maxAuthAge, maxTokenAge, nonce, now, profile, subject, typ
  } = options = validateOptions(options)

  const decoded = decode(token, { complete: true })
  key = getKey(key, true)

  if (complete) {
    ({ key } = verify(true, 'preparsed', { decoded, token }, key, { crit, algorithms, complete: true }))
    decoded.key = key
  } else {
    verify(true, 'preparsed', { decoded, token }, key, { crit, algorithms })
  }

  const unix = epoch(now)
  validateTypes(decoded, profile, options)

  if (issuer && decoded.payload.iss !== issuer) {
    throw new JWTClaimInvalid('unexpected "iss" claim value', 'iss', 'check_failed')
  }

  if (nonce && decoded.payload.nonce !== nonce) {
    throw new JWTClaimInvalid('unexpected "nonce" claim value', 'nonce', 'check_failed')
  }

  if (subject && decoded.payload.sub !== subject) {
    throw new JWTClaimInvalid('unexpected "sub" claim value', 'sub', 'check_failed')
  }

  if (jti && decoded.payload.jti !== jti) {
    throw new JWTClaimInvalid('unexpected "jti" claim value', 'jti', 'check_failed')
  }

  if (audience && !checkAudiencePresence(decoded.payload.aud, typeof audience === 'string' ? [audience] : audience, profile)) {
    throw new JWTClaimInvalid('unexpected "aud" claim value', 'aud', 'check_failed')
  }

  if (typ && decoded.header.typ !== typ) {
    throw new JWTClaimInvalid('unexpected "typ" JWT header value', 'typ', 'check_failed')
  }

  const tolerance = clockTolerance ? secs(clockTolerance) : 0

  if (maxAuthAge) {
    const maxAuthAgeSeconds = secs(maxAuthAge)
    if (decoded.payload.auth_time + maxAuthAgeSeconds < unix - tolerance) {
      throw new JWTClaimInvalid('"auth_time" claim timestamp check failed (too much time has elapsed since the last End-User authentication)', 'auth_time', 'check_failed')
    }
  }

  if (!ignoreIat && !('exp' in decoded.payload) && 'iat' in decoded.payload && decoded.payload.iat > unix + tolerance) {
    throw new JWTClaimInvalid('"iat" claim timestamp check failed (it should be in the past)', 'iat', 'check_failed')
  }

  if (!ignoreNbf && 'nbf' in decoded.payload && decoded.payload.nbf > unix + tolerance) {
    throw new JWTClaimInvalid('"nbf" claim timestamp check failed', 'nbf', 'check_failed')
  }

  if (!ignoreExp && 'exp' in decoded.payload && decoded.payload.exp <= unix - tolerance) {
    throw new JWTExpired('"exp" claim timestamp check failed', 'exp', 'check_failed')
  }

  if (maxTokenAge) {
    const age = unix - decoded.payload.iat
    const max = secs(maxTokenAge)

    if (age - tolerance > max) {
      throw new JWTExpired('"iat" claim timestamp check failed (too far in the past)', 'iat', 'check_failed')
    }

    if (age < 0 - tolerance) {
      throw new JWTClaimInvalid('"iat" claim timestamp check failed (it should be in the past)', 'iat', 'check_failed')
    }
  }

  if (profile === IDTOKEN && Array.isArray(decoded.payload.aud) && decoded.payload.aud.length > 1 && decoded.payload.azp !== audience) {
    throw new JWTClaimInvalid('unexpected "azp" claim value', 'azp', 'check_failed')
  }

  return complete ? decoded : decoded.payload
}


/***/ }),
/* 746 */,
/* 747 */
/***/ (function(module) {

module.exports = require("fs");

/***/ }),
/* 748 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var isArray = __webpack_require__(143),
    isSymbol = __webpack_require__(188);

/** Used to match property names within property paths. */
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/;

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
function isKey(value, object) {
  if (isArray(value)) {
    return false;
  }
  var type = typeof value;
  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
      value == null || isSymbol(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
    (object != null && value in Object(object));
}

module.exports = isKey;


/***/ }),
/* 749 */
/***/ (function(module) {

const sign = () => Buffer.from('')
const verify = (key, payload, signature) => !signature.length

module.exports = (JWA, JWK) => {
  JWA.sign.set('none', sign)
  JWA.verify.set('none', verify)
}


/***/ }),
/* 750 */,
/* 751 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(422);
/**
 * @module GraphErrorHandler
 */
var GraphError_1 = __webpack_require__(765);
/**
 * @class
 * Class for GraphErrorHandler
 */
var GraphErrorHandler = /** @class */ (function () {
    function GraphErrorHandler() {
    }
    /**
     * @private
     * @static
     * Populates the GraphError instance with Error instance values
     * @param {Error} error - The error returned by graph service or some native error
     * @param {number} [statusCode] - The status code of the response
     * @returns The GraphError instance
     */
    GraphErrorHandler.constructError = function (error, statusCode) {
        var gError = new GraphError_1.GraphError(statusCode);
        if (error.name !== undefined) {
            gError.code = error.name;
        }
        gError.body = error.toString();
        gError.message = error.message;
        gError.date = new Date();
        return gError;
    };
    /**
     * @private
     * @static
     * @async
     * Populates the GraphError instance from the Error returned by graph service
     * @param {any} error - The error returned by graph service or some native error
     * @param {number} statusCode - The status code of the response
     * @returns A promise that resolves to GraphError instance
     *
     * Example error for https://graph.microsoft.com/v1.0/me/events?$top=3&$search=foo
     * {
     *      "error": {
     *          "code": "SearchEvents",
     *          "message": "The parameter $search is not currently supported on the Events resource.",
     *          "innerError": {
     *              "request-id": "b31c83fd-944c-4663-aa50-5d9ceb367e19",
     *              "date": "2016-11-17T18:37:45"
     *          }
     *      }
     *  }
     */
    GraphErrorHandler.constructErrorFromResponse = function (error, statusCode) {
        error = error.error;
        var gError = new GraphError_1.GraphError(statusCode);
        gError.code = error.code;
        gError.message = error.message;
        if (error.innerError !== undefined) {
            gError.requestId = error.innerError["request-id"];
            gError.date = new Date(error.innerError.date);
        }
        try {
            gError.body = JSON.stringify(error);
        }
        catch (error) {
            // tslint:disable-line: no-empty
        }
        return gError;
    };
    /**
     * @public
     * @static
     * @async
     * To get the GraphError object
     * @param {any} [error = null] - The error returned by graph service or some native error
     * @param {number} [statusCode = -1] - The status code of the response
     * @param {GraphRequestCallback} [callback] - The graph request callback function
     * @returns A promise that resolves to GraphError instance
     */
    GraphErrorHandler.getError = function (error, statusCode, callback) {
        if (error === void 0) { error = null; }
        if (statusCode === void 0) { statusCode = -1; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var gError;
            return tslib_1.__generator(this, function (_a) {
                if (error && error.error) {
                    gError = GraphErrorHandler.constructErrorFromResponse(error, statusCode);
                }
                else if (typeof Error !== "undefined" && error instanceof Error) {
                    gError = GraphErrorHandler.constructError(error, statusCode);
                }
                else {
                    gError = new GraphError_1.GraphError(statusCode);
                }
                if (typeof callback === "function") {
                    callback(gError, null);
                }
                else {
                    return [2 /*return*/, gError];
                }
                return [2 /*return*/];
            });
        });
    };
    return GraphErrorHandler;
}());
exports.GraphErrorHandler = GraphErrorHandler;
//# sourceMappingURL=GraphErrorHandler.js.map

/***/ }),
/* 752 */,
/* 753 */,
/* 754 */
/***/ (function(module) {

/**
 * The base implementation of `_.hasIn` without support for deep paths.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {Array|string} key The key to check.
 * @returns {boolean} Returns `true` if `key` exists, else `false`.
 */
function baseHasIn(object, key) {
  return object != null && key in Object(object);
}

module.exports = baseHasIn;


/***/ }),
/* 755 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var assocIndexOf = __webpack_require__(820);

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

module.exports = listCacheGet;


/***/ }),
/* 756 */,
/* 757 */,
/* 758 */,
/* 759 */
/***/ (function(__unusedmodule, exports) {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module Range
 */
/**
 * @class
 * Class representing Range
 */
var Range = /** @class */ (function () {
    /**
     * @public
     * @constructor
     * Creates a range for given min and max values
     * @param {number} [minVal = -1] - The minimum value.
     * @param {number} [maxVal = -1] - The maximum value.
     * @returns An instance of a Range
     */
    function Range(minVal, maxVal) {
        if (minVal === void 0) { minVal = -1; }
        if (maxVal === void 0) { maxVal = -1; }
        this.minValue = minVal;
        this.maxValue = maxVal;
    }
    return Range;
}());
exports.Range = Range;
//# sourceMappingURL=Range.js.map

/***/ }),
/* 760 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var copyObject = __webpack_require__(875),
    getSymbols = __webpack_require__(709);

/**
 * Copies own symbols of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbols(source, object) {
  return copyObject(source, getSymbols(source), object);
}

module.exports = copySymbols;


/***/ }),
/* 761 */
/***/ (function(module) {

module.exports = require("zlib");

/***/ }),
/* 762 */,
/* 763 */,
/* 764 */,
/* 765 */
/***/ (function(__unusedmodule, exports) {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module GraphError
 */
/**
 * @class
 * Class for GraphError
 * @NOTE: This is NOT what is returned from the Graph
 * GraphError is created from parsing JSON errors returned from the graph
 * Some fields are renamed ie, "request-id" => requestId so you can use dot notation
 */
var GraphError = /** @class */ (function () {
    /**
     * @public
     * @constructor
     * Creates an instance of GraphError
     * @param {number} [statusCode = -1] - The status code of the error
     * @returns An instance of GraphError
     */
    function GraphError(statusCode) {
        if (statusCode === void 0) { statusCode = -1; }
        this.statusCode = statusCode;
        this.code = null;
        this.message = null;
        this.requestId = null;
        this.date = new Date();
        this.body = null;
    }
    return GraphError;
}());
exports.GraphError = GraphError;
//# sourceMappingURL=GraphError.js.map

/***/ }),
/* 766 */
/***/ (function(module) {

const OIDC_DISCOVERY = '/.well-known/openid-configuration';
const OAUTH2_DISCOVERY = '/.well-known/oauth-authorization-server';
const WEBFINGER = '/.well-known/webfinger';
const REL = 'http://openid.net/specs/connect/1.0/issuer';
const AAD_MULTITENANT_DISCOVERY = new Set([
  `https://login.microsoftonline.com/common/v2.0${OIDC_DISCOVERY}`,
  `https://login.microsoftonline.com/organizations/v2.0${OIDC_DISCOVERY}`,
  `https://login.microsoftonline.com/consumers/v2.0${OIDC_DISCOVERY}`,
]);

const CLIENT_DEFAULTS = {
  grant_types: ['authorization_code'],
  id_token_signed_response_alg: 'RS256',
  authorization_signed_response_alg: 'RS256',
  response_types: ['code'],
  token_endpoint_auth_method: 'client_secret_basic',
};

const ISSUER_DEFAULTS = {
  claim_types_supported: ['normal'],
  claims_parameter_supported: false,
  grant_types_supported: ['authorization_code', 'implicit'],
  request_parameter_supported: false,
  request_uri_parameter_supported: true,
  require_request_uri_registration: false,
  response_modes_supported: ['query', 'fragment'],
  token_endpoint_auth_methods_supported: ['client_secret_basic'],
};

const CALLBACK_PROPERTIES = [
  'access_token', // 6749
  'code', // 6749
  'error', // 6749
  'error_description', // 6749
  'error_uri', // 6749
  'expires_in', // 6749
  'id_token', // Core 1.0
  'state', // 6749
  'token_type', // 6749
  'session_state', // Session Management
  'response', // JARM
];

const JWT_CONTENT = /^application\/jwt/;

const HTTP_OPTIONS = Symbol('openid-client.custom.http-options');
const CLOCK_TOLERANCE = Symbol('openid-client.custom.clock-tolerance');

module.exports = {
  AAD_MULTITENANT_DISCOVERY,
  CALLBACK_PROPERTIES,
  CLIENT_DEFAULTS,
  CLOCK_TOLERANCE,
  HTTP_OPTIONS,
  ISSUER_DEFAULTS,
  JWT_CONTENT,
  OAUTH2_DISCOVERY,
  OIDC_DISCOVERY,
  REL,
  WEBFINGER,
};


/***/ }),
/* 767 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var baseRest = __webpack_require__(407),
    eq = __webpack_require__(338),
    isIterateeCall = __webpack_require__(554),
    keysIn = __webpack_require__(971);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Assigns own and inherited enumerable string keyed properties of source
 * objects to the destination object for all destination properties that
 * resolve to `undefined`. Source objects are applied from left to right.
 * Once a property is set, additional values of the same property are ignored.
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @see _.defaultsDeep
 * @example
 *
 * _.defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
 * // => { 'a': 1, 'b': 2 }
 */
var defaults = baseRest(function(object, sources) {
  object = Object(object);

  var index = -1;
  var length = sources.length;
  var guard = length > 2 ? sources[2] : undefined;

  if (guard && isIterateeCall(sources[0], sources[1], guard)) {
    length = 1;
  }

  while (++index < length) {
    var source = sources[index];
    var props = keysIn(source);
    var propsIndex = -1;
    var propsLength = props.length;

    while (++propsIndex < propsLength) {
      var key = props[propsIndex];
      var value = object[key];

      if (value === undefined ||
          (eq(value, objectProto[key]) && !hasOwnProperty.call(object, key))) {
        object[key] = source[key];
      }
    }
  }

  return object;
});

module.exports = defaults;


/***/ }),
/* 768 */
/***/ (function(module, __unusedexports, __webpack_require__) {

/* global BigInt */
const { inherits } = __webpack_require__(669)

const { DecoderBuffer } = __webpack_require__(110)
const Node = __webpack_require__(720)

// Import DER constants
const der = __webpack_require__(822)

function DERDecoder (entity) {
  this.enc = 'der'
  this.name = entity.name
  this.entity = entity

  // Construct base tree
  this.tree = new DERNode()
  this.tree._init(entity.body)
}

DERDecoder.prototype.decode = function decode (data, options) {
  if (!DecoderBuffer.isDecoderBuffer(data)) {
    data = new DecoderBuffer(data, options)
  }

  return this.tree._decode(data, options)
}

// Tree methods

function DERNode (parent) {
  Node.call(this, 'der', parent)
}
inherits(DERNode, Node)

DERNode.prototype._peekTag = function peekTag (buffer, tag, any) {
  if (buffer.isEmpty()) { return false }

  const state = buffer.save()
  const decodedTag = derDecodeTag(buffer, `Failed to peek tag: "${tag}"`)
  if (buffer.isError(decodedTag)) { return decodedTag }

  buffer.restore(state)

  return decodedTag.tag === tag || decodedTag.tagStr === tag || (decodedTag.tagStr + 'of') === tag || any
}

DERNode.prototype._decodeTag = function decodeTag (buffer, tag, any) {
  const decodedTag = derDecodeTag(buffer,
    `Failed to decode tag of "${tag}"`)
  if (buffer.isError(decodedTag)) { return decodedTag }

  let len = derDecodeLen(buffer,
    decodedTag.primitive,
    `Failed to get length of "${tag}"`)

  // Failure
  if (buffer.isError(len)) { return len }

  if (!any &&
      decodedTag.tag !== tag &&
      decodedTag.tagStr !== tag &&
      decodedTag.tagStr + 'of' !== tag) {
    return buffer.error(`Failed to match tag: "${tag}"`)
  }

  if (decodedTag.primitive || len !== null) { return buffer.skip(len, `Failed to match body of: "${tag}"`) }

  // Indefinite length... find END tag
  const state = buffer.save()
  const res = this._skipUntilEnd(
    buffer,
    `Failed to skip indefinite length body: "${this.tag}"`)
  if (buffer.isError(res)) { return res }

  len = buffer.offset - state.offset
  buffer.restore(state)
  return buffer.skip(len, `Failed to match body of: "${tag}"`)
}

DERNode.prototype._skipUntilEnd = function skipUntilEnd (buffer, fail) {
  for (;;) {
    const tag = derDecodeTag(buffer, fail)
    if (buffer.isError(tag)) { return tag }
    const len = derDecodeLen(buffer, tag.primitive, fail)
    if (buffer.isError(len)) { return len }

    let res
    if (tag.primitive || len !== null) { res = buffer.skip(len) } else { res = this._skipUntilEnd(buffer, fail) }

    // Failure
    if (buffer.isError(res)) { return res }

    if (tag.tagStr === 'end') { break }
  }
}

DERNode.prototype._decodeList = function decodeList (buffer, tag, decoder,
  options) {
  const result = []
  while (!buffer.isEmpty()) {
    const possibleEnd = this._peekTag(buffer, 'end')
    if (buffer.isError(possibleEnd)) { return possibleEnd }

    const res = decoder.decode(buffer, 'der', options)
    if (buffer.isError(res) && possibleEnd) { break }
    result.push(res)
  }
  return result
}

DERNode.prototype._decodeStr = function decodeStr (buffer, tag) {
  if (tag === 'bitstr') {
    const unused = buffer.readUInt8()
    if (buffer.isError(unused)) { return unused }
    return { unused: unused, data: buffer.raw() }
  } else if (tag === 'bmpstr') {
    const raw = buffer.raw()
    if (raw.length % 2 === 1) { return buffer.error('Decoding of string type: bmpstr length mismatch') }

    let str = ''
    for (let i = 0; i < raw.length / 2; i++) {
      str += String.fromCharCode(raw.readUInt16BE(i * 2))
    }
    return str
  } else if (tag === 'numstr') {
    const numstr = buffer.raw().toString('ascii')
    if (!this._isNumstr(numstr)) {
      return buffer.error('Decoding of string type: numstr unsupported characters')
    }
    return numstr
  } else if (tag === 'octstr') {
    return buffer.raw()
  } else if (tag === 'objDesc') {
    return buffer.raw()
  } else if (tag === 'printstr') {
    const printstr = buffer.raw().toString('ascii')
    if (!this._isPrintstr(printstr)) {
      return buffer.error('Decoding of string type: printstr unsupported characters')
    }
    return printstr
  } else if (/str$/.test(tag)) {
    return buffer.raw().toString()
  } else {
    return buffer.error(`Decoding of string type: ${tag} unsupported`)
  }
}

DERNode.prototype._decodeObjid = function decodeObjid (buffer, values, relative) {
  let result
  const identifiers = []
  let ident = 0
  let subident = 0
  while (!buffer.isEmpty()) {
    subident = buffer.readUInt8()
    ident <<= 7
    ident |= subident & 0x7f
    if ((subident & 0x80) === 0) {
      identifiers.push(ident)
      ident = 0
    }
  }
  if (subident & 0x80) { identifiers.push(ident) }

  const first = (identifiers[0] / 40) | 0
  const second = identifiers[0] % 40

  if (relative) { result = identifiers } else { result = [first, second].concat(identifiers.slice(1)) }

  if (values) {
    let tmp = values[result.join(' ')]
    if (tmp === undefined) { tmp = values[result.join('.')] }
    if (tmp !== undefined) { result = tmp }
  }

  return result
}

DERNode.prototype._decodeTime = function decodeTime (buffer, tag) {
  const str = buffer.raw().toString()

  let year
  let mon
  let day
  let hour
  let min
  let sec
  if (tag === 'gentime') {
    year = str.slice(0, 4) | 0
    mon = str.slice(4, 6) | 0
    day = str.slice(6, 8) | 0
    hour = str.slice(8, 10) | 0
    min = str.slice(10, 12) | 0
    sec = str.slice(12, 14) | 0
  } else if (tag === 'utctime') {
    year = str.slice(0, 2) | 0
    mon = str.slice(2, 4) | 0
    day = str.slice(4, 6) | 0
    hour = str.slice(6, 8) | 0
    min = str.slice(8, 10) | 0
    sec = str.slice(10, 12) | 0
    if (year < 70) { year = 2000 + year } else { year = 1900 + year }
  } else {
    return buffer.error(`Decoding ${tag} time is not supported yet`)
  }

  return Date.UTC(year, mon - 1, day, hour, min, sec, 0)
}

DERNode.prototype._decodeNull = function decodeNull () {
  return null
}

DERNode.prototype._decodeBool = function decodeBool (buffer) {
  const res = buffer.readUInt8()
  if (buffer.isError(res)) { return res } else { return res !== 0 }
}

DERNode.prototype._decodeInt = function decodeInt (buffer, values) {
  // Bigint, return as it is (assume big endian)
  const raw = buffer.raw()
  let res = BigInt(`0x${raw.toString('hex')}`)

  if (values) {
    res = values[res.toString(10)] || res
  }

  return res
}

DERNode.prototype._use = function use (entity, obj) {
  if (typeof entity === 'function') { entity = entity(obj) }
  return entity._getDecoder('der').tree
}

// Utility methods

function derDecodeTag (buf, fail) {
  let tag = buf.readUInt8(fail)
  if (buf.isError(tag)) { return tag }

  const cls = der.tagClass[tag >> 6]
  const primitive = (tag & 0x20) === 0

  // Multi-octet tag - load
  if ((tag & 0x1f) === 0x1f) {
    let oct = tag
    tag = 0
    while ((oct & 0x80) === 0x80) {
      oct = buf.readUInt8(fail)
      if (buf.isError(oct)) { return oct }

      tag <<= 7
      tag |= oct & 0x7f
    }
  } else {
    tag &= 0x1f
  }
  const tagStr = der.tag[tag]

  return {
    cls: cls,
    primitive: primitive,
    tag: tag,
    tagStr: tagStr
  }
}

function derDecodeLen (buf, primitive, fail) {
  let len = buf.readUInt8(fail)
  if (buf.isError(len)) { return len }

  // Indefinite form
  if (!primitive && len === 0x80) { return null }

  // Definite form
  if ((len & 0x80) === 0) {
    // Short form
    return len
  }

  // Long form
  const num = len & 0x7f
  if (num > 4) { return buf.error('length octect is too long') }

  len = 0
  for (let i = 0; i < num; i++) {
    len <<= 8
    const j = buf.readUInt8(fail)
    if (buf.isError(j)) { return j }
    len |= j
  }

  return len
}

module.exports = DERDecoder


/***/ }),
/* 769 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var baseClone = __webpack_require__(377);

/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG = 1,
    CLONE_SYMBOLS_FLAG = 4;

/**
 * This method is like `_.clone` except that it recursively clones `value`.
 *
 * @static
 * @memberOf _
 * @since 1.0.0
 * @category Lang
 * @param {*} value The value to recursively clone.
 * @returns {*} Returns the deep cloned value.
 * @see _.clone
 * @example
 *
 * var objects = [{ 'a': 1 }, { 'b': 2 }];
 *
 * var deep = _.cloneDeep(objects);
 * console.log(deep[0] === objects[0]);
 * // => false
 */
function cloneDeep(value) {
  return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG);
}

module.exports = cloneDeep;


/***/ }),
/* 770 */
/***/ (function(__unusedmodule, exports) {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @class
 * @implements MiddlewareOptions
 * A class representing RedirectHandlerOptions
 */
var RedirectHandlerOptions = /** @class */ (function () {
    /**
     * @public
     * @constructor
     * To create an instance of RedirectHandlerOptions
     * @param {number} [maxRedirects = RedirectHandlerOptions.DEFAULT_MAX_REDIRECTS] - The max redirects value
     * @param {ShouldRedirect} [shouldRedirect = RedirectHandlerOptions.DEFAULT_SHOULD_RETRY] - The should redirect callback
     * @returns An instance of RedirectHandlerOptions
     */
    function RedirectHandlerOptions(maxRedirects, shouldRedirect) {
        if (maxRedirects === void 0) { maxRedirects = RedirectHandlerOptions.DEFAULT_MAX_REDIRECTS; }
        if (shouldRedirect === void 0) { shouldRedirect = RedirectHandlerOptions.DEFAULT_SHOULD_RETRY; }
        if (maxRedirects > RedirectHandlerOptions.MAX_MAX_REDIRECTS) {
            var error = new Error("MaxRedirects should not be more than " + RedirectHandlerOptions.MAX_MAX_REDIRECTS);
            error.name = "MaxLimitExceeded";
            throw error;
        }
        if (maxRedirects < 0) {
            var error = new Error("MaxRedirects should not be negative");
            error.name = "MinExpectationNotMet";
            throw error;
        }
        this.maxRedirects = maxRedirects;
        this.shouldRedirect = shouldRedirect;
    }
    /**
     * @private
     * @static
     * A member holding default max redirects value
     */
    RedirectHandlerOptions.DEFAULT_MAX_REDIRECTS = 5;
    /**
     * @private
     * @static
     * A member holding maximum max redirects value
     */
    RedirectHandlerOptions.MAX_MAX_REDIRECTS = 20;
    /**
     * @private
     * A member holding default shouldRedirect callback
     */
    RedirectHandlerOptions.DEFAULT_SHOULD_RETRY = function () { return true; };
    return RedirectHandlerOptions;
}());
exports.RedirectHandlerOptions = RedirectHandlerOptions;
//# sourceMappingURL=RedirectHandlerOptions.js.map

/***/ }),
/* 771 */
/***/ (function(module) {

module.exports.KEYOBJECT = Symbol('KEYOBJECT')
module.exports.PRIVATE_MEMBERS = Symbol('PRIVATE_MEMBERS')
module.exports.PUBLIC_MEMBERS = Symbol('PUBLIC_MEMBERS')
module.exports.THUMBPRINT_MATERIAL = Symbol('THUMBPRINT_MATERIAL')
module.exports.JWK_MEMBERS = Symbol('JWK_MEMBERS')
module.exports.KEY_MANAGEMENT_ENCRYPT = Symbol('KEY_MANAGEMENT_ENCRYPT')
module.exports.KEY_MANAGEMENT_DECRYPT = Symbol('KEY_MANAGEMENT_DECRYPT')

const USES_MAPPING = {
  sig: new Set(['sign', 'verify']),
  enc: new Set(['encrypt', 'decrypt', 'wrapKey', 'unwrapKey', 'deriveKey'])
}
const OPS = new Set([...USES_MAPPING.sig, ...USES_MAPPING.enc])
const USES = new Set(Object.keys(USES_MAPPING))

module.exports.USES_MAPPING = USES_MAPPING
module.exports.OPS = OPS
module.exports.USES = USES


/***/ }),
/* 772 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var defineProperty = __webpack_require__(382);

/**
 * The base implementation of `assignValue` and `assignMergeValue` without
 * value checks.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function baseAssignValue(object, key, value) {
  if (key == '__proto__' && defineProperty) {
    defineProperty(object, key, {
      'configurable': true,
      'enumerable': true,
      'value': value,
      'writable': true
    });
  } else {
    object[key] = value;
  }
}

module.exports = baseAssignValue;


/***/ }),
/* 773 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var overArg = __webpack_require__(393);

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = overArg(Object.keys, Object);

module.exports = nativeKeys;


/***/ }),
/* 774 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const urlLib = __webpack_require__(835);
const http = __webpack_require__(605);
const PCancelable = __webpack_require__(557);
const is = __webpack_require__(534);

class GotError extends Error {
	constructor(message, error, options) {
		super(message);
		Error.captureStackTrace(this, this.constructor);
		this.name = 'GotError';

		if (!is.undefined(error.code)) {
			this.code = error.code;
		}

		Object.assign(this, {
			host: options.host,
			hostname: options.hostname,
			method: options.method,
			path: options.path,
			socketPath: options.socketPath,
			protocol: options.protocol,
			url: options.href,
			gotOptions: options
		});
	}
}

module.exports.GotError = GotError;

module.exports.CacheError = class extends GotError {
	constructor(error, options) {
		super(error.message, error, options);
		this.name = 'CacheError';
	}
};

module.exports.RequestError = class extends GotError {
	constructor(error, options) {
		super(error.message, error, options);
		this.name = 'RequestError';
	}
};

module.exports.ReadError = class extends GotError {
	constructor(error, options) {
		super(error.message, error, options);
		this.name = 'ReadError';
	}
};

module.exports.ParseError = class extends GotError {
	constructor(error, statusCode, options, data) {
		super(`${error.message} in "${urlLib.format(options)}": \n${data.slice(0, 77)}...`, error, options);
		this.name = 'ParseError';
		this.statusCode = statusCode;
		this.statusMessage = http.STATUS_CODES[this.statusCode];
	}
};

module.exports.HTTPError = class extends GotError {
	constructor(response, options) {
		const {statusCode} = response;
		let {statusMessage} = response;

		if (statusMessage) {
			statusMessage = statusMessage.replace(/\r?\n/g, ' ').trim();
		} else {
			statusMessage = http.STATUS_CODES[statusCode];
		}

		super(`Response code ${statusCode} (${statusMessage})`, {}, options);
		this.name = 'HTTPError';
		this.statusCode = statusCode;
		this.statusMessage = statusMessage;
		this.headers = response.headers;
		this.body = response.body;
	}
};

module.exports.MaxRedirectsError = class extends GotError {
	constructor(statusCode, redirectUrls, options) {
		super('Redirected 10 times. Aborting.', {}, options);
		this.name = 'MaxRedirectsError';
		this.statusCode = statusCode;
		this.statusMessage = http.STATUS_CODES[this.statusCode];
		this.redirectUrls = redirectUrls;
	}
};

module.exports.UnsupportedProtocolError = class extends GotError {
	constructor(options) {
		super(`Unsupported protocol "${options.protocol}"`, {}, options);
		this.name = 'UnsupportedProtocolError';
	}
};

module.exports.TimeoutError = class extends GotError {
	constructor(error, options) {
		super(error.message, {code: 'ETIMEDOUT'}, options);
		this.name = 'TimeoutError';
		this.event = error.event;
	}
};

module.exports.CancelError = PCancelable.CancelError;


/***/ }),
/* 775 */,
/* 776 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var assocIndexOf = __webpack_require__(820);

/** Used for built-in method references. */
var arrayProto = Array.prototype;

/** Built-in value references. */
var splice = arrayProto.splice;

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

module.exports = listCacheDelete;


/***/ }),
/* 777 */,
/* 778 */,
/* 779 */,
/* 780 */,
/* 781 */,
/* 782 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { inherits } = __webpack_require__(669)

const DERDecoder = __webpack_require__(768)

function PEMDecoder (entity) {
  DERDecoder.call(this, entity)
  this.enc = 'pem'
}
inherits(PEMDecoder, DERDecoder)

PEMDecoder.prototype.decode = function decode (data, options) {
  const lines = data.toString().split(/[\r\n]+/g)

  const label = options.label.toUpperCase()

  const re = /^-----(BEGIN|END) ([^-]+)-----$/
  let start = -1
  let end = -1
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(re)
    if (match === null) { continue }

    if (match[2] !== label) { continue }

    if (start === -1) {
      if (match[1] !== 'BEGIN') { break }
      start = i
    } else {
      if (match[1] !== 'END') { break }
      end = i
      break
    }
  }
  if (start === -1 || end === -1) { throw new Error(`PEM section not found for: ${label}`) }

  const base64 = lines.slice(start + 1, end).join('')
  // Remove excessive symbols
  base64.replace(/[^a-z0-9+/=]+/gi, '')

  const input = Buffer.from(base64, 'base64')
  return DERDecoder.prototype.decode.call(this, input, options)
}

module.exports = PEMDecoder


/***/ }),
/* 783 */,
/* 784 */
/***/ (function(module) {

"use strict";

module.exports = object => {
	const result = {};

	for (const [key, value] of Object.entries(object)) {
		result[key.toLowerCase()] = value;
	}

	return result;
};


/***/ }),
/* 785 */,
/* 786 */,
/* 787 */,
/* 788 */,
/* 789 */,
/* 790 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var getNative = __webpack_require__(319),
    root = __webpack_require__(824);

/* Built-in method references that are verified to be native. */
var Promise = getNative(root, 'Promise');

module.exports = Promise;


/***/ }),
/* 791 */,
/* 792 */,
/* 793 */,
/* 794 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const {PassThrough} = __webpack_require__(413);
const duplexer3 = __webpack_require__(718);
const requestAsEventEmitter = __webpack_require__(584);
const {HTTPError, ReadError} = __webpack_require__(774);

module.exports = options => {
	const input = new PassThrough();
	const output = new PassThrough();
	const proxy = duplexer3(input, output);
	const piped = new Set();
	let isFinished = false;

	options.retry.retries = () => 0;

	if (options.body) {
		proxy.write = () => {
			throw new Error('Got\'s stream is not writable when the `body` option is used');
		};
	}

	const emitter = requestAsEventEmitter(options, input);

	// Cancels the request
	proxy._destroy = emitter.abort;

	emitter.on('response', response => {
		const {statusCode} = response;

		response.on('error', error => {
			proxy.emit('error', new ReadError(error, options));
		});

		if (options.throwHttpErrors && statusCode !== 304 && (statusCode < 200 || statusCode > 299)) {
			proxy.emit('error', new HTTPError(response, options), null, response);
			return;
		}

		isFinished = true;

		response.pipe(output);

		for (const destination of piped) {
			if (destination.headersSent) {
				continue;
			}

			for (const [key, value] of Object.entries(response.headers)) {
				// Got gives *decompressed* data. Overriding `content-encoding` header would result in an error.
				// It's not possible to decompress already decompressed data, is it?
				const allowed = options.decompress ? key !== 'content-encoding' : true;
				if (allowed) {
					destination.setHeader(key, value);
				}
			}

			destination.statusCode = response.statusCode;
		}

		proxy.emit('response', response);
	});

	[
		'error',
		'request',
		'redirect',
		'uploadProgress',
		'downloadProgress'
	].forEach(event => emitter.on(event, (...args) => proxy.emit(event, ...args)));

	const pipe = proxy.pipe.bind(proxy);
	const unpipe = proxy.unpipe.bind(proxy);
	proxy.pipe = (destination, options) => {
		if (isFinished) {
			throw new Error('Failed to pipe. The response has been emitted already.');
		}

		const result = pipe(destination, options);

		if (Reflect.has(destination, 'setHeader')) {
			piped.add(destination);
		}

		return result;
	};

	proxy.unpipe = stream => {
		piped.delete(stream);
		return unpipe(stream);
	};

	return proxy;
};


/***/ }),
/* 795 */
/***/ (function(module) {

/**
 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;

    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

module.exports = createBaseFor;


/***/ }),
/* 796 */,
/* 797 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var baseRest = __webpack_require__(407),
    isIterateeCall = __webpack_require__(554);

/**
 * Creates a function like `_.assign`.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */
function createAssigner(assigner) {
  return baseRest(function(object, sources) {
    var index = -1,
        length = sources.length,
        customizer = length > 1 ? sources[length - 1] : undefined,
        guard = length > 2 ? sources[2] : undefined;

    customizer = (assigner.length > 3 && typeof customizer == 'function')
      ? (length--, customizer)
      : undefined;

    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }
    object = Object(object);
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, index, customizer);
      }
    }
    return object;
  });
}

module.exports = createAssigner;


/***/ }),
/* 798 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const pkg = __webpack_require__(482);
const create = __webpack_require__(55);

const defaults = {
	options: {
		retry: {
			retries: 2,
			methods: [
				'GET',
				'PUT',
				'HEAD',
				'DELETE',
				'OPTIONS',
				'TRACE'
			],
			statusCodes: [
				408,
				413,
				429,
				500,
				502,
				503,
				504
			],
			errorCodes: [
				'ETIMEDOUT',
				'ECONNRESET',
				'EADDRINUSE',
				'ECONNREFUSED',
				'EPIPE',
				'ENOTFOUND',
				'ENETUNREACH',
				'EAI_AGAIN'
			]
		},
		headers: {
			'user-agent': `${pkg.name}/${pkg.version} (https://github.com/sindresorhus/got)`
		},
		hooks: {
			beforeRequest: [],
			beforeRedirect: [],
			beforeRetry: [],
			afterResponse: []
		},
		decompress: true,
		throwHttpErrors: true,
		followRedirect: true,
		stream: false,
		form: false,
		json: false,
		cache: false,
		useElectronNet: false
	},
	mutableDefaults: false
};

const got = create(defaults);

module.exports = got;


/***/ }),
/* 799 */,
/* 800 */,
/* 801 */,
/* 802 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var nativeCreate = __webpack_require__(878);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? (data[key] !== undefined) : hasOwnProperty.call(data, key);
}

module.exports = hashHas;


/***/ }),
/* 803 */,
/* 804 */,
/* 805 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const asn1 = __webpack_require__(459)

const types = new Map()

const AlgorithmIdentifier = asn1.define('AlgorithmIdentifier', __webpack_require__(996))
types.set('AlgorithmIdentifier', AlgorithmIdentifier)

const ECPrivateKey = asn1.define('ECPrivateKey', __webpack_require__(401))
types.set('ECPrivateKey', ECPrivateKey)

const PrivateKeyInfo = asn1.define('PrivateKeyInfo', __webpack_require__(838)(AlgorithmIdentifier))
types.set('PrivateKeyInfo', PrivateKeyInfo)

const PublicKeyInfo = asn1.define('PublicKeyInfo', __webpack_require__(69)(AlgorithmIdentifier))
types.set('PublicKeyInfo', PublicKeyInfo)

const PrivateKey = asn1.define('PrivateKey', __webpack_require__(816))
types.set('PrivateKey', PrivateKey)

const OneAsymmetricKey = asn1.define('OneAsymmetricKey', __webpack_require__(481)(AlgorithmIdentifier, PrivateKey))
types.set('OneAsymmetricKey', OneAsymmetricKey)

const RSAPrivateKey = asn1.define('RSAPrivateKey', __webpack_require__(811))
types.set('RSAPrivateKey', RSAPrivateKey)

const RSAPublicKey = asn1.define('RSAPublicKey', __webpack_require__(252))
types.set('RSAPublicKey', RSAPublicKey)

const OID = asn1.define('OID', function () {
  return this.objid()
})
types.set('OID', OID)

module.exports = types


/***/ }),
/* 806 */,
/* 807 */
/***/ (function(module) {

/**
 * Gets the value at `key`, unless `key` is "__proto__" or "constructor".
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function safeGet(object, key) {
  if (key === 'constructor' && typeof object[key] === 'function') {
    return;
  }

  if (key == '__proto__') {
    return;
  }

  return object[key];
}

module.exports = safeGet;


/***/ }),
/* 808 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var copyObject = __webpack_require__(875),
    keysIn = __webpack_require__(971);

/**
 * Converts `value` to a plain object flattening inherited enumerable string
 * keyed properties of `value` to own properties of the plain object.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {Object} Returns the converted plain object.
 * @example
 *
 * function Foo() {
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.assign({ 'a': 1 }, new Foo);
 * // => { 'a': 1, 'b': 2 }
 *
 * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
 * // => { 'a': 1, 'b': 2, 'c': 3 }
 */
function toPlainObject(value) {
  return copyObject(value, keysIn(value));
}

module.exports = toPlainObject;


/***/ }),
/* 809 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var getMapData = __webpack_require__(569);

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

module.exports = mapCacheHas;


/***/ }),
/* 810 */,
/* 811 */
/***/ (function(module) {

module.exports = function () {
  this.seq().obj(
    this.key('version').int({ 0: 'two-prime', 1: 'multi' }),
    this.key('n').int(),
    this.key('e').int(),
    this.key('d').int(),
    this.key('p').int(),
    this.key('q').int(),
    this.key('dp').int(),
    this.key('dq').int(),
    this.key('qi').int()
  )
}


/***/ }),
/* 812 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var Hash = __webpack_require__(710),
    ListCache = __webpack_require__(670),
    Map = __webpack_require__(654);

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

module.exports = mapCacheClear;


/***/ }),
/* 813 */,
/* 814 */,
/* 815 */,
/* 816 */
/***/ (function(module) {

module.exports = function () {
  this.octstr().contains().obj(
    this.key('privateKey').octstr()
  )
}


/***/ }),
/* 817 */
/***/ (function(module) {

/**
 * Creates a function that returns `value`.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {*} value The value to return from the new function.
 * @returns {Function} Returns the new constant function.
 * @example
 *
 * var objects = _.times(2, _.constant({ 'a': 1 }));
 *
 * console.log(objects);
 * // => [{ 'a': 1 }, { 'a': 1 }]
 *
 * console.log(objects[0] === objects[1]);
 * // => true
 */
function constant(value) {
  return function() {
    return value;
  };
}

module.exports = constant;


/***/ }),
/* 818 */
/***/ (function(module) {

module.exports = require("tls");

/***/ }),
/* 819 */
/***/ (function(__unusedmodule, exports) {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @enum
 * Enum for RequestMethods
 * @property {string} GET - The get request type
 * @property {string} PATCH - The patch request type
 * @property {string} POST - The post request type
 * @property {string} PUT - The put request type
 * @property {string} DELETE - The delete request type
 */
var RequestMethod;
(function (RequestMethod) {
    RequestMethod["GET"] = "GET";
    RequestMethod["PATCH"] = "PATCH";
    RequestMethod["POST"] = "POST";
    RequestMethod["PUT"] = "PUT";
    RequestMethod["DELETE"] = "DELETE";
})(RequestMethod = exports.RequestMethod || (exports.RequestMethod = {}));
//# sourceMappingURL=RequestMethod.js.map

/***/ }),
/* 820 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var eq = __webpack_require__(338);

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

module.exports = assocIndexOf;


/***/ }),
/* 821 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const {URL} = __webpack_require__(835);
const is = __webpack_require__(534);
const knownHookEvents = __webpack_require__(433);

const merge = (target, ...sources) => {
	for (const source of sources) {
		for (const [key, sourceValue] of Object.entries(source)) {
			if (is.undefined(sourceValue)) {
				continue;
			}

			const targetValue = target[key];
			if (is.urlInstance(targetValue) && (is.urlInstance(sourceValue) || is.string(sourceValue))) {
				target[key] = new URL(sourceValue, targetValue);
			} else if (is.plainObject(sourceValue)) {
				if (is.plainObject(targetValue)) {
					target[key] = merge({}, targetValue, sourceValue);
				} else {
					target[key] = merge({}, sourceValue);
				}
			} else if (is.array(sourceValue)) {
				target[key] = merge([], sourceValue);
			} else {
				target[key] = sourceValue;
			}
		}
	}

	return target;
};

const mergeOptions = (...sources) => {
	sources = sources.map(source => source || {});
	const merged = merge({}, ...sources);

	const hooks = {};
	for (const hook of knownHookEvents) {
		hooks[hook] = [];
	}

	for (const source of sources) {
		if (source.hooks) {
			for (const hook of knownHookEvents) {
				hooks[hook] = hooks[hook].concat(source.hooks[hook]);
			}
		}
	}

	merged.hooks = hooks;

	return merged;
};

const mergeInstances = (instances, methods) => {
	const handlers = instances.map(instance => instance.defaults.handler);
	const size = instances.length - 1;

	return {
		methods,
		options: mergeOptions(...instances.map(instance => instance.defaults.options)),
		handler: (options, next) => {
			let iteration = -1;
			const iterate = options => handlers[++iteration](options, iteration === size ? next : iterate);

			return iterate(options);
		}
	};
};

module.exports = merge;
module.exports.options = mergeOptions;
module.exports.instances = mergeInstances;


/***/ }),
/* 822 */
/***/ (function(__unusedmodule, exports) {

// Helper
function reverse (map) {
  const res = {}

  Object.keys(map).forEach(function (key) {
    // Convert key to integer if it is stringified
    if ((key | 0) == key) { key = key | 0 } // eslint-disable-line eqeqeq

    const value = map[key]
    res[value] = key
  })

  return res
}

exports.tagClass = {
  0: 'universal',
  1: 'application',
  2: 'context',
  3: 'private'
}
exports.tagClassByName = reverse(exports.tagClass)

exports.tag = {
  0x00: 'end',
  0x01: 'bool',
  0x02: 'int',
  0x03: 'bitstr',
  0x04: 'octstr',
  0x05: 'null_',
  0x06: 'objid',
  0x07: 'objDesc',
  0x08: 'external',
  0x09: 'real',
  0x0a: 'enum',
  0x0b: 'embed',
  0x0c: 'utf8str',
  0x0d: 'relativeOid',
  0x10: 'seq',
  0x11: 'set',
  0x12: 'numstr',
  0x13: 'printstr',
  0x14: 't61str',
  0x15: 'videostr',
  0x16: 'ia5str',
  0x17: 'utctime',
  0x18: 'gentime',
  0x19: 'graphstr',
  0x1a: 'iso646str',
  0x1b: 'genstr',
  0x1c: 'unistr',
  0x1d: 'charstr',
  0x1e: 'bmpstr'
}
exports.tagByName = reverse(exports.tag)


/***/ }),
/* 823 */,
/* 824 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var freeGlobal = __webpack_require__(973);

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

module.exports = root;


/***/ }),
/* 825 */,
/* 826 */,
/* 827 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const openid_client_1 = __webpack_require__(48);
class ClientCredentialsAuthProvider {
    constructor(tenant, clientId, clientSecret, scopes = [ClientCredentialsAuthProvider.defaultScope]) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.scopes = scopes;
        this.cachedToken = null;
        this.authClient = openid_client_1.Issuer.discover(`https://login.microsoftonline.com/${tenant}/v2.0/.well-known/openid-configuration`).then(issuer => {
            let client = new issuer.Client({
                client_id: clientId,
                client_secret: clientSecret
            });
            return client;
        });
    }
    getAccessToken() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.cachedToken || this.cachedToken.expired()) {
                yield this.acquireNewToken();
            }
            if (!((_a = this.cachedToken) === null || _a === void 0 ? void 0 : _a.access_token)) {
                throw Error('Failed to acquire an authentication token.');
            }
            return this.cachedToken.access_token;
        });
    }
    acquireNewToken() {
        return __awaiter(this, void 0, void 0, function* () {
            this.cachedToken = yield (yield this.authClient).grant({
                grant_type: 'client_credentials',
                client_id: this.clientId,
                client_secret: this.clientSecret,
                scope: this.scopes.join(' ')
            });
        });
    }
}
exports.ClientCredentialsAuthProvider = ClientCredentialsAuthProvider;
ClientCredentialsAuthProvider.defaultScope = 'https://graph.microsoft.com/.default';


/***/ }),
/* 828 */,
/* 829 */,
/* 830 */,
/* 831 */,
/* 832 */
/***/ (function(module, __unusedexports, __webpack_require__) {

/* global BigInt */
const { inherits } = __webpack_require__(669)

const Node = __webpack_require__(720)
const der = __webpack_require__(822)

function DEREncoder (entity) {
  this.enc = 'der'
  this.name = entity.name
  this.entity = entity

  // Construct base tree
  this.tree = new DERNode()
  this.tree._init(entity.body)
}

DEREncoder.prototype.encode = function encode (data, reporter) {
  return this.tree._encode(data, reporter).join()
}

// Tree methods

function DERNode (parent) {
  Node.call(this, 'der', parent)
}
inherits(DERNode, Node)

DERNode.prototype._encodeComposite = function encodeComposite (tag,
  primitive,
  cls,
  content) {
  const encodedTag = encodeTag(tag, primitive, cls, this.reporter)

  // Short form
  if (content.length < 0x80) {
    const header = Buffer.alloc(2)
    header[0] = encodedTag
    header[1] = content.length
    return this._createEncoderBuffer([header, content])
  }

  // Long form
  // Count octets required to store length
  let lenOctets = 1
  for (let i = content.length; i >= 0x100; i >>= 8) { lenOctets++ }

  const header = Buffer.alloc(1 + 1 + lenOctets)
  header[0] = encodedTag
  header[1] = 0x80 | lenOctets

  for (let i = 1 + lenOctets, j = content.length; j > 0; i--, j >>= 8) { header[i] = j & 0xff }

  return this._createEncoderBuffer([header, content])
}

DERNode.prototype._encodeStr = function encodeStr (str, tag) {
  if (tag === 'bitstr') {
    return this._createEncoderBuffer([str.unused | 0, str.data])
  } else if (tag === 'bmpstr') {
    const buf = Buffer.alloc(str.length * 2)
    for (let i = 0; i < str.length; i++) {
      buf.writeUInt16BE(str.charCodeAt(i), i * 2)
    }
    return this._createEncoderBuffer(buf)
  } else if (tag === 'numstr') {
    if (!this._isNumstr(str)) {
      return this.reporter.error('Encoding of string type: numstr supports only digits and space')
    }
    return this._createEncoderBuffer(str)
  } else if (tag === 'printstr') {
    if (!this._isPrintstr(str)) {
      return this.reporter.error('Encoding of string type: printstr supports only latin upper and lower case letters, digits, space, apostrophe, left and rigth parenthesis, plus sign, comma, hyphen, dot, slash, colon, equal sign, question mark')
    }
    return this._createEncoderBuffer(str)
  } else if (/str$/.test(tag)) {
    return this._createEncoderBuffer(str)
  } else if (tag === 'objDesc') {
    return this._createEncoderBuffer(str)
  } else {
    return this.reporter.error(`Encoding of string type: ${tag} unsupported`)
  }
}

DERNode.prototype._encodeObjid = function encodeObjid (id, values, relative) {
  if (typeof id === 'string') {
    if (!values) { return this.reporter.error('string objid given, but no values map found') }
    if (!Object.prototype.hasOwnProperty.call(values, id)) { return this.reporter.error('objid not found in values map') }
    id = values[id].split(/[\s.]+/g)
    for (let i = 0; i < id.length; i++) { id[i] |= 0 }
  } else if (Array.isArray(id)) {
    id = id.slice()
    for (let i = 0; i < id.length; i++) { id[i] |= 0 }
  }

  if (!Array.isArray(id)) {
    return this.reporter.error(`objid() should be either array or string, got: ${JSON.stringify(id)}`)
  }

  if (!relative) {
    if (id[1] >= 40) { return this.reporter.error('Second objid identifier OOB') }
    id.splice(0, 2, id[0] * 40 + id[1])
  }

  // Count number of octets
  let size = 0
  for (let i = 0; i < id.length; i++) {
    let ident = id[i]
    for (size++; ident >= 0x80; ident >>= 7) { size++ }
  }

  const objid = Buffer.alloc(size)
  let offset = objid.length - 1
  for (let i = id.length - 1; i >= 0; i--) {
    let ident = id[i]
    objid[offset--] = ident & 0x7f
    while ((ident >>= 7) > 0) { objid[offset--] = 0x80 | (ident & 0x7f) }
  }

  return this._createEncoderBuffer(objid)
}

function two (num) {
  if (num < 10) { return `0${num}` } else { return num }
}

DERNode.prototype._encodeTime = function encodeTime (time, tag) {
  let str
  const date = new Date(time)

  if (tag === 'gentime') {
    str = [
      two(date.getUTCFullYear()),
      two(date.getUTCMonth() + 1),
      two(date.getUTCDate()),
      two(date.getUTCHours()),
      two(date.getUTCMinutes()),
      two(date.getUTCSeconds()),
      'Z'
    ].join('')
  } else if (tag === 'utctime') {
    str = [
      two(date.getUTCFullYear() % 100),
      two(date.getUTCMonth() + 1),
      two(date.getUTCDate()),
      two(date.getUTCHours()),
      two(date.getUTCMinutes()),
      two(date.getUTCSeconds()),
      'Z'
    ].join('')
  } else {
    this.reporter.error(`Encoding ${tag} time is not supported yet`)
  }

  return this._encodeStr(str, 'octstr')
}

DERNode.prototype._encodeNull = function encodeNull () {
  return this._createEncoderBuffer('')
}

function bnToBuf (bn) {
  var hex = BigInt(bn).toString(16)
  if (hex.length % 2) { hex = '0' + hex }

  var len = hex.length / 2
  var u8 = new Uint8Array(len)

  var i = 0
  var j = 0
  while (i < len) {
    u8[i] = parseInt(hex.slice(j, j + 2), 16)
    i += 1
    j += 2
  }

  return u8
}

DERNode.prototype._encodeInt = function encodeInt (num, values) {
  if (typeof num === 'string') {
    if (!values) { return this.reporter.error('String int or enum given, but no values map') }
    if (!Object.prototype.hasOwnProperty.call(values, num)) {
      return this.reporter.error(`Values map doesn't contain: ${JSON.stringify(num)}`)
    }
    num = values[num]
  }

  if (typeof num === 'bigint') {
    const numArray = [...bnToBuf(num)]
    if (numArray[0] & 0x80) {
      numArray.unshift(0)
    }
    num = Buffer.from(numArray)
  }

  if (Buffer.isBuffer(num)) {
    let size = num.length
    if (num.length === 0) { size++ }

    const out = Buffer.alloc(size)
    num.copy(out)
    if (num.length === 0) { out[0] = 0 }
    return this._createEncoderBuffer(out)
  }

  if (num < 0x80) { return this._createEncoderBuffer(num) }

  if (num < 0x100) { return this._createEncoderBuffer([0, num]) }

  let size = 1
  for (let i = num; i >= 0x100; i >>= 8) { size++ }

  const out = new Array(size)
  for (let i = out.length - 1; i >= 0; i--) {
    out[i] = num & 0xff
    num >>= 8
  }
  if (out[0] & 0x80) {
    out.unshift(0)
  }

  return this._createEncoderBuffer(Buffer.from(out))
}

DERNode.prototype._encodeBool = function encodeBool (value) {
  return this._createEncoderBuffer(value ? 0xff : 0)
}

DERNode.prototype._use = function use (entity, obj) {
  if (typeof entity === 'function') { entity = entity(obj) }
  return entity._getEncoder('der').tree
}

DERNode.prototype._skipDefault = function skipDefault (dataBuffer, reporter, parent) {
  const state = this._baseState
  let i
  if (state.default === null) { return false }

  const data = dataBuffer.join()
  if (state.defaultBuffer === undefined) { state.defaultBuffer = this._encodeValue(state.default, reporter, parent).join() }

  if (data.length !== state.defaultBuffer.length) { return false }

  for (i = 0; i < data.length; i++) {
    if (data[i] !== state.defaultBuffer[i]) { return false }
  }

  return true
}

// Utility methods

function encodeTag (tag, primitive, cls, reporter) {
  let res

  if (tag === 'seqof') { tag = 'seq' } else if (tag === 'setof') { tag = 'set' }

  if (Object.prototype.hasOwnProperty.call(der.tagByName, tag)) { res = der.tagByName[tag] } else if (typeof tag === 'number' && (tag | 0) === tag) { res = tag } else { return reporter.error(`Unknown tag: ${tag}`) }

  if (res >= 0x1f) { return reporter.error('Multi-octet tag encoding unsupported') }

  if (!primitive) { res |= 0x20 }

  res |= (der.tagClassByName[cls || 'universal'] << 6)

  return res
}

module.exports = DEREncoder


/***/ }),
/* 833 */,
/* 834 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var Stack = __webpack_require__(598),
    assignMergeValue = __webpack_require__(907),
    baseFor = __webpack_require__(354),
    baseMergeDeep = __webpack_require__(305),
    isObject = __webpack_require__(988),
    keysIn = __webpack_require__(971),
    safeGet = __webpack_require__(807);

/**
 * The base implementation of `_.merge` without support for multiple sources.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {number} srcIndex The index of `source`.
 * @param {Function} [customizer] The function to customize merged values.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 */
function baseMerge(object, source, srcIndex, customizer, stack) {
  if (object === source) {
    return;
  }
  baseFor(source, function(srcValue, key) {
    stack || (stack = new Stack);
    if (isObject(srcValue)) {
      baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
    }
    else {
      var newValue = customizer
        ? customizer(safeGet(object, key), srcValue, (key + ''), object, source, stack)
        : undefined;

      if (newValue === undefined) {
        newValue = srcValue;
      }
      assignMergeValue(object, key, newValue);
    }
  }, keysIn);
}

module.exports = baseMerge;


/***/ }),
/* 835 */
/***/ (function(module) {

module.exports = require("url");

/***/ }),
/* 836 */,
/* 837 */,
/* 838 */
/***/ (function(module) {

module.exports = (AlgorithmIdentifier) => function () {
  this.seq().obj(
    this.key('version').int(),
    this.key('algorithm').use(AlgorithmIdentifier),
    this.key('privateKey').octstr()
  )
}


/***/ }),
/* 839 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var copyObject = __webpack_require__(875),
    keys = __webpack_require__(863);

/**
 * The base implementation of `_.assign` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssign(object, source) {
  return object && copyObject(source, keys(source), object);
}

module.exports = baseAssign;


/***/ }),
/* 840 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var Stack = __webpack_require__(598),
    equalArrays = __webpack_require__(90),
    equalByTag = __webpack_require__(74),
    equalObjects = __webpack_require__(586),
    getTag = __webpack_require__(700),
    isArray = __webpack_require__(143),
    isBuffer = __webpack_require__(629),
    isTypedArray = __webpack_require__(850);

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    objectTag = '[object Object]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * A specialized version of `baseIsEqual` for arrays and objects which performs
 * deep comparisons and tracks traversed objects enabling objects with circular
 * references to be compared.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
  var objIsArr = isArray(object),
      othIsArr = isArray(other),
      objTag = objIsArr ? arrayTag : getTag(object),
      othTag = othIsArr ? arrayTag : getTag(other);

  objTag = objTag == argsTag ? objectTag : objTag;
  othTag = othTag == argsTag ? objectTag : othTag;

  var objIsObj = objTag == objectTag,
      othIsObj = othTag == objectTag,
      isSameTag = objTag == othTag;

  if (isSameTag && isBuffer(object)) {
    if (!isBuffer(other)) {
      return false;
    }
    objIsArr = true;
    objIsObj = false;
  }
  if (isSameTag && !objIsObj) {
    stack || (stack = new Stack);
    return (objIsArr || isTypedArray(object))
      ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
      : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
  }
  if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object,
          othUnwrapped = othIsWrapped ? other.value() : other;

      stack || (stack = new Stack);
      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new Stack);
  return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
}

module.exports = baseIsEqualDeep;


/***/ }),
/* 841 */,
/* 842 */,
/* 843 */,
/* 844 */,
/* 845 */
/***/ (function(module) {

"use strict";


class CancelError extends Error {
	constructor(reason) {
		super(reason || 'Promise was canceled');
		this.name = 'CancelError';
	}

	get isCanceled() {
		return true;
	}
}

class PCancelable {
	static fn(userFn) {
		return (...arguments_) => {
			return new PCancelable((resolve, reject, onCancel) => {
				arguments_.push(onCancel);
				// eslint-disable-next-line promise/prefer-await-to-then
				userFn(...arguments_).then(resolve, reject);
			});
		};
	}

	constructor(executor) {
		this._cancelHandlers = [];
		this._isPending = true;
		this._isCanceled = false;
		this._rejectOnCancel = true;

		this._promise = new Promise((resolve, reject) => {
			this._reject = reject;

			const onResolve = value => {
				this._isPending = false;
				resolve(value);
			};

			const onReject = error => {
				this._isPending = false;
				reject(error);
			};

			const onCancel = handler => {
				if (!this._isPending) {
					throw new Error('The `onCancel` handler was attached after the promise settled.');
				}

				this._cancelHandlers.push(handler);
			};

			Object.defineProperties(onCancel, {
				shouldReject: {
					get: () => this._rejectOnCancel,
					set: boolean => {
						this._rejectOnCancel = boolean;
					}
				}
			});

			return executor(onResolve, onReject, onCancel);
		});
	}

	then(onFulfilled, onRejected) {
		// eslint-disable-next-line promise/prefer-await-to-then
		return this._promise.then(onFulfilled, onRejected);
	}

	catch(onRejected) {
		return this._promise.catch(onRejected);
	}

	finally(onFinally) {
		return this._promise.finally(onFinally);
	}

	cancel(reason) {
		if (!this._isPending || this._isCanceled) {
			return;
		}

		if (this._cancelHandlers.length > 0) {
			try {
				for (const handler of this._cancelHandlers) {
					handler();
				}
			} catch (error) {
				this._reject(error);
			}
		}

		this._isCanceled = true;
		if (this._rejectOnCancel) {
			this._reject(new CancelError(reason));
		}
	}

	get isCanceled() {
		return this._isCanceled;
	}
}

Object.setPrototypeOf(PCancelable.prototype, Promise.prototype);

module.exports = PCancelable;
module.exports.CancelError = CancelError;


/***/ }),
/* 846 */,
/* 847 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { randomBytes } = __webpack_require__(417)

const { createSecretKey } = __webpack_require__(727)
const base64url = __webpack_require__(44)
const {
  THUMBPRINT_MATERIAL, PUBLIC_MEMBERS, PRIVATE_MEMBERS,
  KEY_MANAGEMENT_DECRYPT, KEY_MANAGEMENT_ENCRYPT, KEYOBJECT
} = __webpack_require__(771)

const Key = __webpack_require__(228)

const OCT_PUBLIC = new Set()
Object.freeze(OCT_PUBLIC)
const OCT_PRIVATE = new Set(['k'])
Object.freeze(OCT_PRIVATE)

// Octet sequence Key Type
class OctKey extends Key {
  constructor (...args) {
    super(...args)
    Object.defineProperties(this, {
      kty: {
        value: 'oct',
        enumerable: true
      },
      length: {
        value: this[KEYOBJECT] ? this[KEYOBJECT].symmetricKeySize * 8 : undefined
      },
      k: {
        enumerable: false,
        get () {
          if (this[KEYOBJECT]) {
            Object.defineProperty(this, 'k', {
              value: base64url.encodeBuffer(this[KEYOBJECT].export()),
              configurable: false
            })
          } else {
            Object.defineProperty(this, 'k', {
              value: undefined,
              configurable: false
            })
          }

          return this.k
        },
        configurable: true
      }
    })
  }

  static get [PUBLIC_MEMBERS] () {
    return OCT_PUBLIC
  }

  static get [PRIVATE_MEMBERS] () {
    return OCT_PRIVATE
  }

  // https://tc39.github.io/ecma262/#sec-ordinaryownpropertykeys no need for any special
  // JSON.stringify handling in V8
  [THUMBPRINT_MATERIAL] () {
    if (!this[KEYOBJECT]) {
      throw new TypeError('reference "oct" keys without "k" cannot have their thumbprint calculated')
    }
    return { k: this.k, kty: 'oct' }
  }

  [KEY_MANAGEMENT_ENCRYPT] () {
    return new Set([
      ...this.algorithms('wrapKey'),
      ...this.algorithms('deriveKey')
    ])
  }

  [KEY_MANAGEMENT_DECRYPT] () {
    return this[KEY_MANAGEMENT_ENCRYPT]()
  }

  algorithms (...args) {
    if (!this[KEYOBJECT]) {
      return new Set()
    }

    return Key.prototype.algorithms.call(this, ...args)
  }

  static async generate (...args) {
    return this.generateSync(...args)
  }

  static generateSync (len = 256, privat = true) {
    if (!privat) {
      throw new TypeError('"oct" keys cannot be generated as public')
    }
    if (!Number.isSafeInteger(len) || !len || len % 8 !== 0) {
      throw new TypeError('invalid bit length')
    }

    return createSecretKey(randomBytes(len / 8))
  }
}

module.exports = OctKey


/***/ }),
/* 848 */
/***/ (function(__unusedmodule, exports) {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @class
 * @implements MiddlewareOptions
 * Class for RetryHandlerOptions
 */
var RetryHandlerOptions = /** @class */ (function () {
    /**
     * @public
     * @constructor
     * To create an instance of RetryHandlerOptions
     * @param {number} [delay = RetryHandlerOptions.DEFAULT_DELAY] - The delay value in seconds
     * @param {number} [maxRetries = RetryHandlerOptions.DEFAULT_MAX_RETRIES] - The maxRetries value
     * @param {ShouldRetry} [shouldRetry = RetryHandlerOptions.DEFAULT_SHOULD_RETRY] - The shouldRetry callback function
     * @returns An instance of RetryHandlerOptions
     */
    function RetryHandlerOptions(delay, maxRetries, shouldRetry) {
        if (delay === void 0) { delay = RetryHandlerOptions.DEFAULT_DELAY; }
        if (maxRetries === void 0) { maxRetries = RetryHandlerOptions.DEFAULT_MAX_RETRIES; }
        if (shouldRetry === void 0) { shouldRetry = RetryHandlerOptions.DEFAULT_SHOULD_RETRY; }
        if (delay > RetryHandlerOptions.MAX_DELAY && maxRetries > RetryHandlerOptions.MAX_MAX_RETRIES) {
            var error = new Error("Delay and MaxRetries should not be more than " + RetryHandlerOptions.MAX_DELAY + " and " + RetryHandlerOptions.MAX_MAX_RETRIES);
            error.name = "MaxLimitExceeded";
            throw error;
        }
        else if (delay > RetryHandlerOptions.MAX_DELAY) {
            var error = new Error("Delay should not be more than " + RetryHandlerOptions.MAX_DELAY);
            error.name = "MaxLimitExceeded";
            throw error;
        }
        else if (maxRetries > RetryHandlerOptions.MAX_MAX_RETRIES) {
            var error = new Error("MaxRetries should not be more than " + RetryHandlerOptions.MAX_MAX_RETRIES);
            error.name = "MaxLimitExceeded";
            throw error;
        }
        else if (delay < 0 && maxRetries < 0) {
            var error = new Error("Delay and MaxRetries should not be negative");
            error.name = "MinExpectationNotMet";
            throw error;
        }
        else if (delay < 0) {
            var error = new Error("Delay should not be negative");
            error.name = "MinExpectationNotMet";
            throw error;
        }
        else if (maxRetries < 0) {
            var error = new Error("MaxRetries should not be negative");
            error.name = "MinExpectationNotMet";
            throw error;
        }
        this.delay = Math.min(delay, RetryHandlerOptions.MAX_DELAY);
        this.maxRetries = Math.min(maxRetries, RetryHandlerOptions.MAX_MAX_RETRIES);
        this.shouldRetry = shouldRetry;
    }
    /**
     * @public
     * To get the maximum delay
     * @returns A maximum delay
     */
    RetryHandlerOptions.prototype.getMaxDelay = function () {
        return RetryHandlerOptions.MAX_DELAY;
    };
    /**
     * @private
     * @static
     * A member holding default delay value in seconds
     */
    RetryHandlerOptions.DEFAULT_DELAY = 3;
    /**
     * @private
     * @static
     * A member holding default maxRetries value
     */
    RetryHandlerOptions.DEFAULT_MAX_RETRIES = 3;
    /**
     * @private
     * @static
     * A member holding maximum delay value in seconds
     */
    RetryHandlerOptions.MAX_DELAY = 180;
    /**
     * @private
     * @static
     * A member holding maximum maxRetries value
     */
    RetryHandlerOptions.MAX_MAX_RETRIES = 10;
    /**
     * @private
     * A member holding default shouldRetry callback
     */
    RetryHandlerOptions.DEFAULT_SHOULD_RETRY = function () { return true; };
    return RetryHandlerOptions;
}());
exports.RetryHandlerOptions = RetryHandlerOptions;
//# sourceMappingURL=RetryHandlerOptions.js.map

/***/ }),
/* 849 */,
/* 850 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var baseIsTypedArray = __webpack_require__(412),
    baseUnary = __webpack_require__(231),
    nodeUtil = __webpack_require__(616);

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

module.exports = isTypedArray;


/***/ }),
/* 851 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const KeyStore = __webpack_require__(926)

module.exports = KeyStore


/***/ }),
/* 852 */,
/* 853 */,
/* 854 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const url = __webpack_require__(835);
const { strict: assert } = __webpack_require__(357);

module.exports = (target) => {
  try {
    const { protocol } = new url.URL(target);
    assert(protocol.match(/^(https?:)$/));
    return true;
  } catch (err) {
    throw new TypeError('only valid absolute URLs can be requested');
  }
};


/***/ }),
/* 855 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { JWKKeySupport, JOSENotSupported } = __webpack_require__(688)
const { KEY_MANAGEMENT_ENCRYPT, KEY_MANAGEMENT_DECRYPT } = __webpack_require__(771)

const { JWA, JWK } = __webpack_require__(962)

// sign, verify
__webpack_require__(510)(JWA, JWK)
__webpack_require__(172)(JWA, JWK)
__webpack_require__(736)(JWA, JWK)
__webpack_require__(34)(JWA, JWK)
__webpack_require__(965)(JWA, JWK)
__webpack_require__(749)(JWA)

// encrypt, decrypt
__webpack_require__(99)(JWA, JWK)
__webpack_require__(408)(JWA, JWK)

// wrapKey, unwrapKey
__webpack_require__(209)(JWA, JWK)
__webpack_require__(36)(JWA, JWK)
__webpack_require__(919)(JWA, JWK)

// deriveKey
__webpack_require__(533)(JWA, JWK)
__webpack_require__(32)(JWA, JWK)
__webpack_require__(713)(JWA, JWK)

const check = (key, op, alg) => {
  const cache = `_${op}_${alg}`

  let label
  let keyOp
  if (op === 'keyManagementEncrypt') {
    label = 'key management (encryption)'
    keyOp = KEY_MANAGEMENT_ENCRYPT
  } else if (op === 'keyManagementDecrypt') {
    label = 'key management (decryption)'
    keyOp = KEY_MANAGEMENT_DECRYPT
  }

  if (cache in key) {
    if (key[cache]) {
      return
    }
    throw new JWKKeySupport(`the key does not support ${alg} ${label || op} algorithm`)
  }

  let value = true
  if (!JWA[op].has(alg)) {
    throw new JOSENotSupported(`unsupported ${label || op} alg: ${alg}`)
  } else if (!key.algorithms(keyOp).has(alg)) {
    value = false
  }

  Object.defineProperty(key, cache, { value, enumerable: false })

  if (!value) {
    return check(key, op, alg)
  }
}

module.exports = {
  check,
  sign: (alg, key, payload) => {
    check(key, 'sign', alg)
    return JWA.sign.get(alg)(key, payload)
  },
  verify: (alg, key, payload, signature) => {
    check(key, 'verify', alg)
    return JWA.verify.get(alg)(key, payload, signature)
  },
  keyManagementEncrypt: (alg, key, payload, opts) => {
    check(key, 'keyManagementEncrypt', alg)
    return JWA.keyManagementEncrypt.get(alg)(key, payload, opts)
  },
  keyManagementDecrypt: (alg, key, payload, opts) => {
    check(key, 'keyManagementDecrypt', alg)
    return JWA.keyManagementDecrypt.get(alg)(key, payload, opts)
  },
  encrypt: (alg, key, cleartext, opts) => {
    check(key, 'encrypt', alg)
    return JWA.encrypt.get(alg)(key, cleartext, opts)
  },
  decrypt: (alg, key, ciphertext, opts) => {
    check(key, 'decrypt', alg)
    return JWA.decrypt.get(alg)(key, ciphertext, opts)
  }
}


/***/ }),
/* 856 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(422);
var ResponseType_1 = __webpack_require__(345);
/**
 * @enum
 * Enum for document types
 * @property {string} TEXT_HTML - The text/html content type
 * @property {string} TEXT_XML - The text/xml content type
 * @property {string} APPLICATION_XML - The application/xml content type
 * @property {string} APPLICATION_XHTML - The application/xhml+xml content type
 */
var DocumentType;
(function (DocumentType) {
    DocumentType["TEXT_HTML"] = "text/html";
    DocumentType["TEXT_XML"] = "text/xml";
    DocumentType["APPLICATION_XML"] = "application/xml";
    DocumentType["APPLICATION_XHTML"] = "application/xhtml+xml";
})(DocumentType = exports.DocumentType || (exports.DocumentType = {}));
/**
 * @enum
 * Enum for Content types
 * @property {string} TEXT_PLAIN - The text/plain content type
 * @property {string} APPLICATION_JSON - The application/json content type
 */
var ContentType;
(function (ContentType) {
    ContentType["TEXT_PLAIN"] = "text/plain";
    ContentType["APPLICATION_JSON"] = "application/json";
})(ContentType || (ContentType = {}));
/**
 * @enum
 * Enum for Content type regex
 * @property {string} DOCUMENT - The regex to match document content types
 * @property {string} IMAGE - The regex to match image content types
 */
var ContentTypeRegexStr;
(function (ContentTypeRegexStr) {
    ContentTypeRegexStr["DOCUMENT"] = "^(text\\/(html|xml))|(application\\/(xml|xhtml\\+xml))$";
    ContentTypeRegexStr["IMAGE"] = "^image\\/.+";
})(ContentTypeRegexStr || (ContentTypeRegexStr = {}));
/**
 * @class
 * Class for GraphResponseHandler
 */
var GraphResponseHandler = /** @class */ (function () {
    function GraphResponseHandler() {
    }
    /**
     * @private
     * @static
     * To parse Document response
     * @param {Response} rawResponse - The response object
     * @param {DocumentType} type - The type to which the document needs to be parsed
     * @returns A promise that resolves to a document content
     */
    GraphResponseHandler.parseDocumentResponse = function (rawResponse, type) {
        try {
            if (typeof DOMParser !== "undefined") {
                return new Promise(function (resolve, reject) {
                    rawResponse.text().then(function (xmlString) {
                        try {
                            var parser = new DOMParser();
                            var xmlDoc = parser.parseFromString(xmlString, type);
                            resolve(xmlDoc);
                        }
                        catch (error) {
                            reject(error);
                        }
                    });
                });
            }
            else {
                return Promise.resolve(rawResponse.body);
            }
        }
        catch (error) {
            throw error;
        }
    };
    /**
     * @private
     * @static
     * @async
     * To convert the native Response to response content
     * @param {Response} rawResponse - The response object
     * @param {ResponseType} [responseType] - The response type value
     * @returns A promise that resolves to the converted response content
     */
    GraphResponseHandler.convertResponse = function (rawResponse, responseType) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var responseValue, _a, contentType, mimeType, error_1;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (rawResponse.status === 204) {
                            // NO CONTENT
                            return [2 /*return*/, Promise.resolve()];
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 26, , 27]);
                        _a = responseType;
                        switch (_a) {
                            case ResponseType_1.ResponseType.ARRAYBUFFER: return [3 /*break*/, 2];
                            case ResponseType_1.ResponseType.BLOB: return [3 /*break*/, 4];
                            case ResponseType_1.ResponseType.DOCUMENT: return [3 /*break*/, 6];
                            case ResponseType_1.ResponseType.JSON: return [3 /*break*/, 8];
                            case ResponseType_1.ResponseType.STREAM: return [3 /*break*/, 10];
                            case ResponseType_1.ResponseType.TEXT: return [3 /*break*/, 12];
                        }
                        return [3 /*break*/, 14];
                    case 2: return [4 /*yield*/, rawResponse.arrayBuffer()];
                    case 3:
                        responseValue = _b.sent();
                        return [3 /*break*/, 25];
                    case 4: return [4 /*yield*/, rawResponse.blob()];
                    case 5:
                        responseValue = _b.sent();
                        return [3 /*break*/, 25];
                    case 6: return [4 /*yield*/, GraphResponseHandler.parseDocumentResponse(rawResponse, DocumentType.TEXT_XML)];
                    case 7:
                        responseValue = _b.sent();
                        return [3 /*break*/, 25];
                    case 8: return [4 /*yield*/, rawResponse.json()];
                    case 9:
                        responseValue = _b.sent();
                        return [3 /*break*/, 25];
                    case 10: return [4 /*yield*/, Promise.resolve(rawResponse.body)];
                    case 11:
                        responseValue = _b.sent();
                        return [3 /*break*/, 25];
                    case 12: return [4 /*yield*/, rawResponse.text()];
                    case 13:
                        responseValue = _b.sent();
                        return [3 /*break*/, 25];
                    case 14:
                        contentType = rawResponse.headers.get("Content-type");
                        if (!(contentType !== null)) return [3 /*break*/, 23];
                        mimeType = contentType.split(";")[0];
                        if (!new RegExp(ContentTypeRegexStr.DOCUMENT).test(mimeType)) return [3 /*break*/, 16];
                        return [4 /*yield*/, GraphResponseHandler.parseDocumentResponse(rawResponse, mimeType)];
                    case 15:
                        responseValue = _b.sent();
                        return [3 /*break*/, 22];
                    case 16:
                        if (!new RegExp(ContentTypeRegexStr.IMAGE).test(mimeType)) return [3 /*break*/, 17];
                        responseValue = rawResponse.blob();
                        return [3 /*break*/, 22];
                    case 17:
                        if (!(mimeType === ContentType.TEXT_PLAIN)) return [3 /*break*/, 19];
                        return [4 /*yield*/, rawResponse.text()];
                    case 18:
                        responseValue = _b.sent();
                        return [3 /*break*/, 22];
                    case 19:
                        if (!(mimeType === ContentType.APPLICATION_JSON)) return [3 /*break*/, 21];
                        return [4 /*yield*/, rawResponse.json()];
                    case 20:
                        responseValue = _b.sent();
                        return [3 /*break*/, 22];
                    case 21:
                        responseValue = Promise.resolve(rawResponse.body);
                        _b.label = 22;
                    case 22: return [3 /*break*/, 24];
                    case 23:
                        /**
                         * RFC specification {@link https://tools.ietf.org/html/rfc7231#section-3.1.1.5} says:
                         *  A sender that generates a message containing a payload body SHOULD
                         *  generate a Content-Type header field in that message unless the
                         *  intended media type of the enclosed representation is unknown to the
                         *  sender.  If a Content-Type header field is not present, the recipient
                         *  MAY either assume a media type of "application/octet-stream"
                         *  ([RFC2046], Section 4.5.1) or examine the data to determine its type.
                         *
                         *  So assuming it as a stream type so returning the body.
                         */
                        responseValue = Promise.resolve(rawResponse.body);
                        _b.label = 24;
                    case 24: return [3 /*break*/, 25];
                    case 25: return [3 /*break*/, 27];
                    case 26:
                        error_1 = _b.sent();
                        throw error_1;
                    case 27: return [2 /*return*/, responseValue];
                }
            });
        });
    };
    /**
     * @public
     * @static
     * @async
     * To get the parsed response
     * @param {Response} rawResponse - The response object
     * @param {ResponseType} [responseType] - The response type value
     * @param {GraphRequestCallback} [callback] - The graph request callback function
     * @returns The parsed response
     */
    GraphResponseHandler.getResponse = function (rawResponse, responseType, callback) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var response, error_2;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        if (!(responseType === ResponseType_1.ResponseType.RAW)) return [3 /*break*/, 1];
                        return [2 /*return*/, Promise.resolve(rawResponse)];
                    case 1: return [4 /*yield*/, GraphResponseHandler.convertResponse(rawResponse, responseType)];
                    case 2:
                        response = _a.sent();
                        if (rawResponse.ok) {
                            // Status Code 2XX
                            if (typeof callback === "function") {
                                callback(null, response);
                            }
                            else {
                                return [2 /*return*/, response];
                            }
                        }
                        else {
                            // NOT OK Response
                            throw response;
                        }
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        throw error_2;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return GraphResponseHandler;
}());
exports.GraphResponseHandler = GraphResponseHandler;
//# sourceMappingURL=GraphResponseHandler.js.map

/***/ }),
/* 857 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var arrayPush = __webpack_require__(883),
    isArray = __webpack_require__(143);

/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
}

module.exports = baseGetAllKeys;


/***/ }),
/* 858 */,
/* 859 */,
/* 860 */
/***/ (function(module, __unusedexports, __webpack_require__) {

/* eslint-disable max-classes-per-file */

const { inspect, deprecate } = __webpack_require__(669);
const stdhttp = __webpack_require__(605);
const crypto = __webpack_require__(417);
const { strict: assert } = __webpack_require__(357);
const querystring = __webpack_require__(191);
const url = __webpack_require__(835);

const { ParseError } = __webpack_require__(798);
const jose = __webpack_require__(387);
const base64url = __webpack_require__(575);
const defaultsDeep = __webpack_require__(230);
const defaults = __webpack_require__(767);
const merge = __webpack_require__(587);
const isPlainObject = __webpack_require__(585);
const tokenHash = __webpack_require__(615);

const { assertSigningAlgValuesSupport, assertIssuerConfiguration } = __webpack_require__(475);
const pick = __webpack_require__(108);
const processResponse = __webpack_require__(944);
const TokenSet = __webpack_require__(933);
const { OPError, RPError } = __webpack_require__(889);
const now = __webpack_require__(416);
const { random } = __webpack_require__(368);
const request = __webpack_require__(204);
const {
  CALLBACK_PROPERTIES, CLIENT_DEFAULTS, JWT_CONTENT, CLOCK_TOLERANCE,
} = __webpack_require__(766);
const issuerRegistry = __webpack_require__(667);
const instance = __webpack_require__(483);
const { authenticatedPost, resolveResponseType, resolveRedirectUri } = __webpack_require__(285);
const DeviceFlowHandle = __webpack_require__(486);

function pickCb(input) {
  return pick(input, ...CALLBACK_PROPERTIES);
}

function authorizationHeaderValue(token, tokenType = 'Bearer') {
  return `${tokenType} ${token}`;
}

function cleanUpClaims(claims) {
  if (Object.keys(claims._claim_names).length === 0) {
    delete claims._claim_names;
  }
  if (Object.keys(claims._claim_sources).length === 0) {
    delete claims._claim_sources;
  }
}

function assignClaim(target, source, sourceName, throwOnMissing = true) {
  return ([claim, inSource]) => {
    if (inSource === sourceName) {
      if (throwOnMissing && source[claim] === undefined) {
        throw new RPError(`expected claim "${claim}" in "${sourceName}"`);
      } else if (source[claim] !== undefined) {
        target[claim] = source[claim];
      }
      delete target._claim_names[claim];
    }
  };
}

function verifyPresence(payload, jwt, prop) {
  if (payload[prop] === undefined) {
    throw new RPError({
      message: `missing required JWT property ${prop}`,
      jwt,
    });
  }
}

function authorizationParams(params) {
  const authParams = {
    client_id: this.client_id,
    scope: 'openid',
    response_type: resolveResponseType.call(this),
    redirect_uri: resolveRedirectUri.call(this),
    ...params,
  };

  Object.entries(authParams).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      delete authParams[key];
    } else if (key === 'claims' && typeof value === 'object') {
      authParams[key] = JSON.stringify(value);
    } else if (key === 'resource' && Array.isArray(value)) {
      authParams[key] = value;
    } else if (typeof value !== 'string') {
      authParams[key] = String(value);
    }
  });

  return authParams;
}

async function claimJWT(label, jwt) {
  try {
    const { header, payload } = jose.JWT.decode(jwt, { complete: true });
    const { iss } = payload;

    if (header.alg === 'none') {
      return payload;
    }

    let key;
    if (!iss || iss === this.issuer.issuer) {
      key = await this.issuer.queryKeyStore(header);
    } else if (issuerRegistry.has(iss)) {
      key = await issuerRegistry.get(iss).queryKeyStore(header);
    } else {
      const discovered = await this.issuer.constructor.discover(iss);
      key = await discovered.queryKeyStore(header);
    }
    return jose.JWT.verify(jwt, key);
  } catch (err) {
    if (err instanceof RPError || err instanceof OPError || err.name === 'AggregateError') {
      throw err;
    } else {
      throw new RPError({
        printf: ['failed to validate the %s JWT (%s: %s)', label, err.name, err.message],
        jwt,
      });
    }
  }
}

function getKeystore(jwks) {
  const keystore = jose.JWKS.asKeyStore(jwks);
  if (keystore.all().some((key) => key.type !== 'private')) {
    throw new TypeError('jwks must only contain private keys');
  }
  return keystore;
}

// if an OP doesnt support client_secret_basic but supports client_secret_post, use it instead
// this is in place to take care of most common pitfalls when first using discovered Issuers without
// the support for default values defined by Discovery 1.0
function checkBasicSupport(client, metadata, properties) {
  try {
    const supported = client.issuer.token_endpoint_auth_methods_supported;
    if (!supported.includes(properties.token_endpoint_auth_method)) {
      if (supported.includes('client_secret_post')) {
        properties.token_endpoint_auth_method = 'client_secret_post';
      }
    }
  } catch (err) {}
}

function handleCommonMistakes(client, metadata, properties) {
  if (!metadata.token_endpoint_auth_method) { // if no explicit value was provided
    checkBasicSupport(client, metadata, properties);
  }

  // :fp: c'mon people... RTFM
  if (metadata.redirect_uri) {
    if (metadata.redirect_uris) {
      throw new TypeError('provide a redirect_uri or redirect_uris, not both');
    }
    properties.redirect_uris = [metadata.redirect_uri];
    delete properties.redirect_uri;
  }

  if (metadata.response_type) {
    if (metadata.response_types) {
      throw new TypeError('provide a response_type or response_types, not both');
    }
    properties.response_types = [metadata.response_type];
    delete properties.response_type;
  }
}

function getDefaultsForEndpoint(endpoint, issuer, properties) {
  if (!issuer[`${endpoint}_endpoint`]) return;

  const tokenEndpointAuthMethod = properties.token_endpoint_auth_method;
  const tokenEndpointAuthSigningAlg = properties.token_endpoint_auth_signing_alg;

  const eam = `${endpoint}_endpoint_auth_method`;
  const easa = `${endpoint}_endpoint_auth_signing_alg`;

  if (properties[eam] === undefined && properties[easa] === undefined) {
    if (tokenEndpointAuthMethod !== undefined) {
      properties[eam] = tokenEndpointAuthMethod;
    }
    if (tokenEndpointAuthSigningAlg !== undefined) {
      properties[easa] = tokenEndpointAuthSigningAlg;
    }
  }
}

class BaseClient {}

module.exports = (issuer, aadIssValidation = false) => class Client extends BaseClient {
  /**
   * @name constructor
   * @api public
   */
  constructor(metadata = {}, jwks, options) {
    super();

    if (typeof metadata.client_id !== 'string' || !metadata.client_id) {
      throw new TypeError('client_id is required');
    }

    const properties = { ...CLIENT_DEFAULTS, ...metadata };

    handleCommonMistakes(this, metadata, properties);

    assertSigningAlgValuesSupport('token', this.issuer, properties);

    ['introspection', 'revocation'].forEach((endpoint) => {
      getDefaultsForEndpoint(endpoint, this.issuer, properties);
      assertSigningAlgValuesSupport(endpoint, this.issuer, properties);
    });

    Object.entries(properties).forEach(([key, value]) => {
      instance(this).get('metadata').set(key, value);
      if (!this[key]) {
        Object.defineProperty(this, key, {
          get() { return instance(this).get('metadata').get(key); },
          enumerable: true,
        });
      }
    });

    if (jwks !== undefined) {
      const keystore = getKeystore.call(this, jwks);
      instance(this).set('keystore', keystore);
    }

    if (options !== undefined) {
      instance(this).set('options', options);
    }

    this[CLOCK_TOLERANCE] = 0;
  }

  /**
   * @name authorizationUrl
   * @api public
   */
  authorizationUrl(params = {}) {
    if (!isPlainObject(params)) {
      throw new TypeError('params must be a plain object');
    }
    assertIssuerConfiguration(this.issuer, 'authorization_endpoint');
    const target = url.parse(this.issuer.authorization_endpoint, true);
    target.search = null;
    target.query = {
      ...target.query,
      ...authorizationParams.call(this, params),
    };
    return url.format(target);
  }

  /**
   * @name authorizationPost
   * @api public
   */
  authorizationPost(params = {}) {
    if (!isPlainObject(params)) {
      throw new TypeError('params must be a plain object');
    }
    const inputs = authorizationParams.call(this, params);
    const formInputs = Object.keys(inputs)
      .map((name) => `<input type="hidden" name="${name}" value="${inputs[name]}"/>`).join('\n');

    return `<!DOCTYPE html>
<head>
  <title>Requesting Authorization</title>
</head>
<body onload="javascript:document.forms[0].submit()">
  <form method="post" action="${this.issuer.authorization_endpoint}">
    ${formInputs}
  </form>
</body>
</html>`;
  }

  /**
   * @name endSessionUrl
   * @api public
   */
  endSessionUrl(params = {}) {
    assertIssuerConfiguration(this.issuer, 'end_session_endpoint');

    const {
      0: postLogout,
      length,
    } = this.post_logout_redirect_uris || [];

    const {
      post_logout_redirect_uri = length === 1 ? postLogout : undefined,
    } = params;

    let hint = params.id_token_hint;

    if (hint instanceof TokenSet) {
      if (!hint.id_token) {
        throw new TypeError('id_token not present in TokenSet');
      }
      hint = hint.id_token;
    }

    const target = url.parse(this.issuer.end_session_endpoint, true);
    target.search = null;
    target.query = {
      ...params,
      ...target.query,
      ...{
        post_logout_redirect_uri,
        id_token_hint: hint,
      },
    };

    Object.entries(target.query).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        delete target.query[key];
      }
    });

    return url.format(target);
  }

  /**
   * @name callbackParams
   * @api public
   */
  callbackParams(input) { // eslint-disable-line class-methods-use-this
    const isIncomingMessage = input instanceof stdhttp.IncomingMessage
      || (input && input.method && input.url);
    const isString = typeof input === 'string';

    if (!isString && !isIncomingMessage) {
      throw new TypeError('#callbackParams only accepts string urls, http.IncomingMessage or a lookalike');
    }

    if (isIncomingMessage) {
      switch (input.method) {
        case 'GET':
          return pickCb(url.parse(input.url, true).query);
        case 'POST':
          if (input.body === undefined) {
            throw new TypeError('incoming message body missing, include a body parser prior to this method call');
          }
          switch (typeof input.body) {
            case 'object':
            case 'string':
              if (Buffer.isBuffer(input.body)) {
                return pickCb(querystring.parse(input.body.toString('utf-8')));
              }
              if (typeof input.body === 'string') {
                return pickCb(querystring.parse(input.body));
              }

              return pickCb(input.body);
            default:
              throw new TypeError('invalid IncomingMessage body object');
          }
        default:
          throw new TypeError('invalid IncomingMessage method');
      }
    } else {
      return pickCb(url.parse(input, true).query);
    }
  }

  /**
   * @name callback
   * @api public
   */
  async callback(
    redirectUri,
    parameters,
    checks = {},
    { exchangeBody, clientAssertionPayload } = {},
  ) {
    let params = pickCb(parameters);

    if (checks.jarm && !('response' in parameters)) {
      throw new RPError({
        message: 'expected a JARM response',
        checks,
        params,
      });
    } else if ('response' in parameters) {
      const decrypted = await this.decryptJARM(params.response);
      params = await this.validateJARM(decrypted);
    }

    if (this.default_max_age && !checks.max_age) {
      checks.max_age = this.default_max_age;
    }

    if (params.state && !checks.state) {
      throw new TypeError('checks.state argument is missing');
    }

    if (!params.state && checks.state) {
      throw new RPError({
        message: 'state missing from the response',
        checks,
        params,
      });
    }

    if (checks.state !== params.state) {
      throw new RPError({
        printf: ['state mismatch, expected %s, got: %s', checks.state, params.state],
        checks,
        params,
      });
    }

    if (params.error) {
      throw new OPError(params);
    }

    const RESPONSE_TYPE_REQUIRED_PARAMS = {
      code: ['code'],
      id_token: ['id_token'],
      token: ['access_token', 'token_type'],
    };

    if (checks.response_type) {
      for (const type of checks.response_type.split(' ')) { // eslint-disable-line no-restricted-syntax
        if (type === 'none') {
          if (params.code || params.id_token || params.access_token) {
            throw new RPError({
              message: 'unexpected params encountered for "none" response',
              checks,
              params,
            });
          }
        } else {
          for (const param of RESPONSE_TYPE_REQUIRED_PARAMS[type]) { // eslint-disable-line no-restricted-syntax, max-len
            if (!params[param]) {
              throw new RPError({
                message: `${param} missing from response`,
                checks,
                params,
              });
            }
          }
        }
      }
    }

    if (params.id_token) {
      const tokenset = new TokenSet(params);
      await this.decryptIdToken(tokenset);
      await this.validateIdToken(tokenset, checks.nonce, 'authorization', checks.max_age, checks.state);

      if (!params.code) {
        return tokenset;
      }
    }

    if (params.code) {
      const tokenset = await this.grant({
        ...exchangeBody,
        grant_type: 'authorization_code',
        code: params.code,
        redirect_uri: redirectUri,
        code_verifier: checks.code_verifier,
      }, { clientAssertionPayload });

      await this.decryptIdToken(tokenset);
      await this.validateIdToken(tokenset, checks.nonce, 'token', checks.max_age);

      if (params.session_state) {
        tokenset.session_state = params.session_state;
      }

      return tokenset;
    }

    return new TokenSet(params);
  }

  /**
   * @name oauthCallback
   * @api public
   */
  async oauthCallback(
    redirectUri,
    parameters,
    checks = {},
    { exchangeBody, clientAssertionPayload } = {},
  ) {
    let params = pickCb(parameters);

    if (checks.jarm && !('response' in parameters)) {
      throw new RPError({
        message: 'expected a JARM response',
        checks,
        params,
      });
    } else if ('response' in parameters) {
      const decrypted = await this.decryptJARM(params.response);
      params = await this.validateJARM(decrypted);
    }

    if (params.state && !checks.state) {
      throw new TypeError('checks.state argument is missing');
    }

    if (!params.state && checks.state) {
      throw new RPError({
        message: 'state missing from the response',
        checks,
        params,
      });
    }

    if (checks.state !== params.state) {
      throw new RPError({
        printf: ['state mismatch, expected %s, got: %s', checks.state, params.state],
        checks,
        params,
      });
    }

    if (params.error) {
      throw new OPError(params);
    }

    const RESPONSE_TYPE_REQUIRED_PARAMS = {
      code: ['code'],
      token: ['access_token', 'token_type'],
    };

    if (checks.response_type) {
      for (const type of checks.response_type.split(' ')) { // eslint-disable-line no-restricted-syntax
        if (type === 'none') {
          if (params.code || params.id_token || params.access_token) {
            throw new RPError({
              message: 'unexpected params encountered for "none" response',
              checks,
              params,
            });
          }
        }

        if (RESPONSE_TYPE_REQUIRED_PARAMS[type]) {
          for (const param of RESPONSE_TYPE_REQUIRED_PARAMS[type]) { // eslint-disable-line no-restricted-syntax, max-len
            if (!params[param]) {
              throw new RPError({
                message: `${param} missing from response`,
                checks,
                params,
              });
            }
          }
        }
      }
    }

    if (params.code) {
      return this.grant({
        ...exchangeBody,
        grant_type: 'authorization_code',
        code: params.code,
        redirect_uri: redirectUri,
        code_verifier: checks.code_verifier,
      }, { clientAssertionPayload });
    }

    return new TokenSet(params);
  }

  /**
   * @name decryptIdToken
   * @api private
   */
  async decryptIdToken(token) {
    if (!this.id_token_encrypted_response_alg) {
      return token;
    }

    let idToken = token;

    if (idToken instanceof TokenSet) {
      if (!idToken.id_token) {
        throw new TypeError('id_token not present in TokenSet');
      }
      idToken = idToken.id_token;
    }

    const expectedAlg = this.id_token_encrypted_response_alg;
    const expectedEnc = this.id_token_encrypted_response_enc;

    const result = await this.decryptJWE(idToken, expectedAlg, expectedEnc);

    if (token instanceof TokenSet) {
      token.id_token = result;
      return token;
    }

    return result;
  }

  async validateJWTUserinfo(body) {
    const expectedAlg = this.userinfo_signed_response_alg;

    return this.validateJWT(body, expectedAlg, []);
  }

  /**
   * @name decryptJARM
   * @api private
   */
  async decryptJARM(response) {
    if (!this.authorization_encrypted_response_alg) {
      return response;
    }

    const expectedAlg = this.authorization_encrypted_response_alg;
    const expectedEnc = this.authorization_encrypted_response_enc;

    return this.decryptJWE(response, expectedAlg, expectedEnc);
  }

  /**
   * @name validateJARM
   * @api private
   */
  async validateJARM(response) {
    const expectedAlg = this.authorization_signed_response_alg;
    const { payload } = await this.validateJWT(response, expectedAlg, ['iss', 'exp', 'aud']);
    return pickCb(payload);
  }

  /**
   * @name decryptJWTUserinfo
   * @api private
   */
  async decryptJWTUserinfo(body) {
    if (!this.userinfo_encrypted_response_alg) {
      return body;
    }

    const expectedAlg = this.userinfo_encrypted_response_alg;
    const expectedEnc = this.userinfo_encrypted_response_enc;

    return this.decryptJWE(body, expectedAlg, expectedEnc);
  }

  /**
   * @name decryptJWE
   * @api private
   */
  async decryptJWE(jwe, expectedAlg, expectedEnc = 'A128CBC-HS256') {
    const header = JSON.parse(base64url.decode(jwe.split('.')[0]));

    if (header.alg !== expectedAlg) {
      throw new RPError({
        printf: ['unexpected JWE alg received, expected %s, got: %s', expectedAlg, header.alg],
        jwt: jwe,
      });
    }

    if (header.enc !== expectedEnc) {
      throw new RPError({
        printf: ['unexpected JWE enc received, expected %s, got: %s', expectedEnc, header.enc],
        jwt: jwe,
      });
    }

    let keyOrStore;

    if (expectedAlg.match(/^(?:RSA|ECDH)/)) {
      keyOrStore = instance(this).get('keystore');
    } else {
      keyOrStore = await this.joseSecret(expectedAlg === 'dir' ? expectedEnc : expectedAlg);
    }

    const payload = jose.JWE.decrypt(jwe, keyOrStore);
    return payload.toString('utf8');
  }

  /**
   * @name validateIdToken
   * @api private
   */
  async validateIdToken(tokenSet, nonce, returnedBy, maxAge, state) {
    let idToken = tokenSet;

    const expectedAlg = this.id_token_signed_response_alg;

    const isTokenSet = idToken instanceof TokenSet;

    if (isTokenSet) {
      if (!idToken.id_token) {
        throw new TypeError('id_token not present in TokenSet');
      }
      idToken = idToken.id_token;
    }

    idToken = String(idToken);

    const timestamp = now();
    const { protected: header, payload, key } = await this.validateJWT(idToken, expectedAlg);

    if (maxAge || (maxAge !== null && this.require_auth_time)) {
      if (!payload.auth_time) {
        throw new RPError({
          message: 'missing required JWT property auth_time',
          jwt: idToken,
        });
      }
      if (!Number.isInteger(payload.auth_time)) {
        throw new RPError({
          message: 'JWT auth_time claim must be a JSON number integer',
          jwt: idToken,
        });
      }
    }

    if (maxAge && (payload.auth_time + maxAge < timestamp - this[CLOCK_TOLERANCE])) {
      throw new RPError({
        printf: ['too much time has elapsed since the last End-User authentication, max_age %i, auth_time: %i, now %i', maxAge, payload.auth_time, timestamp - this[CLOCK_TOLERANCE]],
        jwt: idToken,
      });
    }

    if (nonce !== null && (payload.nonce || nonce !== undefined) && payload.nonce !== nonce) {
      throw new RPError({
        printf: ['nonce mismatch, expected %s, got: %s', nonce, payload.nonce],
        jwt: idToken,
      });
    }

    if (returnedBy === 'authorization') {
      if (!payload.at_hash && tokenSet.access_token) {
        throw new RPError({
          message: 'missing required property at_hash',
          jwt: idToken,
        });
      }

      if (!payload.c_hash && tokenSet.code) {
        throw new RPError({
          message: 'missing required property c_hash',
          jwt: idToken,
        });
      }

      const fapi = this.constructor.name === 'FAPIClient';

      if (fapi) {
        if (payload.iat < timestamp - 3600) {
          throw new RPError({
            printf: ['JWT issued too far in the past, now %i, iat %i', timestamp, payload.iat],
            jwt: idToken,
          });
        }

        if (!payload.s_hash && (tokenSet.state || state)) {
          throw new RPError({
            message: 'missing required property s_hash',
            jwt: idToken,
          });
        }
      }


      if (payload.s_hash) {
        if (!state) {
          throw new TypeError('cannot verify s_hash, "checks.state" property not provided');
        }

        try {
          tokenHash.validate({ claim: 's_hash', source: 'state' }, payload.s_hash, state, header.alg, key && key.crv);
        } catch (err) {
          throw new RPError({ message: err.message, jwt: idToken });
        }
      }
    }

    if (tokenSet.access_token && payload.at_hash !== undefined) {
      try {
        tokenHash.validate({ claim: 'at_hash', source: 'access_token' }, payload.at_hash, tokenSet.access_token, header.alg, key && key.crv);
      } catch (err) {
        throw new RPError({ message: err.message, jwt: idToken });
      }
    }

    if (tokenSet.code && payload.c_hash !== undefined) {
      try {
        tokenHash.validate({ claim: 'c_hash', source: 'code' }, payload.c_hash, tokenSet.code, header.alg, key && key.crv);
      } catch (err) {
        throw new RPError({ message: err.message, jwt: idToken });
      }
    }

    return tokenSet;
  }

  /**
   * @name validateJWT
   * @api private
   */
  async validateJWT(jwt, expectedAlg, required = ['iss', 'sub', 'aud', 'exp', 'iat']) {
    const isSelfIssued = this.issuer.issuer === 'https://self-issued.me';
    const timestamp = now();
    let header;
    let payload;
    try {
      ({ header, payload } = jose.JWT.decode(jwt, { complete: true }));
    } catch (err) {
      throw new RPError({
        printf: ['failed to decode JWT (%s: %s)', err.name, err.message],
        jwt,
      });
    }

    if (header.alg !== expectedAlg) {
      throw new RPError({
        printf: ['unexpected JWT alg received, expected %s, got: %s', expectedAlg, header.alg],
        jwt,
      });
    }

    if (isSelfIssued) {
      required = [...required, 'sub_jwk']; // eslint-disable-line no-param-reassign
    }

    required.forEach(verifyPresence.bind(undefined, payload, jwt));

    if (payload.iss !== undefined) {
      let expectedIss = this.issuer.issuer;

      if (aadIssValidation) {
        expectedIss = this.issuer.issuer.replace('{tenantid}', payload.tid);
      }

      if (payload.iss !== expectedIss) {
        throw new RPError({
          printf: ['unexpected iss value, expected %s, got: %s', expectedIss, payload.iss],
          jwt,
        });
      }
    }

    if (payload.iat !== undefined) {
      if (!Number.isInteger(payload.iat)) {
        throw new RPError({
          message: 'JWT iat claim must be a JSON number integer',
          jwt,
        });
      }
    }

    if (payload.nbf !== undefined) {
      if (!Number.isInteger(payload.nbf)) {
        throw new RPError({
          message: 'JWT nbf claim must be a JSON number integer',
          jwt,
        });
      }
      if (payload.nbf > timestamp + this[CLOCK_TOLERANCE]) {
        throw new RPError({
          printf: ['JWT not active yet, now %i, nbf %i', timestamp + this[CLOCK_TOLERANCE], payload.nbf],
          jwt,
        });
      }
    }

    if (payload.exp !== undefined) {
      if (!Number.isInteger(payload.exp)) {
        throw new RPError({
          message: 'JWT exp claim must be a JSON number integer',
          jwt,
        });
      }
      if (timestamp - this[CLOCK_TOLERANCE] >= payload.exp) {
        throw new RPError({
          printf: ['JWT expired, now %i, exp %i', timestamp - this[CLOCK_TOLERANCE], payload.exp],
          jwt,
        });
      }
    }

    if (payload.aud !== undefined) {
      if (Array.isArray(payload.aud)) {
        if (payload.aud.length > 1 && !payload.azp) {
          throw new RPError({
            message: 'missing required JWT property azp',
            jwt,
          });
        }

        if (!payload.aud.includes(this.client_id)) {
          throw new RPError({
            printf: ['aud is missing the client_id, expected %s to be included in %j', this.client_id, payload.aud],
            jwt,
          });
        }
      } else if (payload.aud !== this.client_id) {
        throw new RPError({
          printf: ['aud mismatch, expected %s, got: %s', this.client_id, payload.aud],
          jwt,
        });
      }
    }

    if (payload.azp !== undefined) {
      let { additionalAuthorizedParties } = instance(this).get('options') || {};

      if (typeof additionalAuthorizedParties === 'string') {
        additionalAuthorizedParties = [this.client_id, additionalAuthorizedParties];
      } else if (Array.isArray(additionalAuthorizedParties)) {
        additionalAuthorizedParties = [this.client_id, ...additionalAuthorizedParties];
      } else {
        additionalAuthorizedParties = [this.client_id];
      }

      if (!additionalAuthorizedParties.includes(payload.azp)) {
        throw new RPError({
          printf: ['azp mismatch, got: %s', payload.azp],
          jwt,
        });
      }
    }

    let key;

    if (isSelfIssued) {
      try {
        assert(isPlainObject(payload.sub_jwk));
        key = jose.JWK.asKey(payload.sub_jwk);
        assert.equal(key.type, 'public');
      } catch (err) {
        throw new RPError({
          message: 'failed to use sub_jwk claim as an asymmetric JSON Web Key',
          jwt,
        });
      }
      if (key.thumbprint !== payload.sub) {
        throw new RPError({
          message: 'failed to match the subject with sub_jwk',
          jwt,
        });
      }
    } else if (header.alg.startsWith('HS')) {
      key = await this.joseSecret();
    } else if (header.alg !== 'none') {
      key = await this.issuer.queryKeyStore(header);
    }

    if (!key && header.alg === 'none') {
      return { protected: header, payload };
    }

    try {
      return jose.JWS.verify(jwt, key, { complete: true });
    } catch (err) {
      throw new RPError({
        message: 'failed to validate JWT signature',
        jwt,
      });
    }
  }

  /**
   * @name refresh
   * @api public
   */
  async refresh(refreshToken, { exchangeBody, clientAssertionPayload } = {}) {
    let token = refreshToken;

    if (token instanceof TokenSet) {
      if (!token.refresh_token) {
        throw new TypeError('refresh_token not present in TokenSet');
      }
      token = token.refresh_token;
    }

    const tokenset = await this.grant({
      ...exchangeBody,
      grant_type: 'refresh_token',
      refresh_token: String(token),
    }, { clientAssertionPayload });

    if (tokenset.id_token) {
      await this.decryptIdToken(tokenset);
      await this.validateIdToken(tokenset, null, 'token', null);
    }

    return tokenset;
  }

  async requestResource(
    resourceUrl,
    accessToken,
    {
      method,
      headers,
      body,
      tokenType = accessToken instanceof TokenSet ? accessToken.token_type : 'Bearer',
    } = {},
  ) {
    if (accessToken instanceof TokenSet) {
      if (!accessToken.access_token) {
        throw new TypeError('access_token not present in TokenSet');
      }
      accessToken = accessToken.access_token; // eslint-disable-line no-param-reassign
    }

    const requestOpts = {
      headers: {
        Authorization: authorizationHeaderValue(accessToken, tokenType),
        ...headers,
      },
      body,
    };

    const mTLS = !!this.tls_client_certificate_bound_access_tokens;

    return request.call(this, {
      ...requestOpts,
      encoding: null,
      method,
      url: resourceUrl,
    }, { mTLS });
  }

  /**
   * @name userinfo
   * @api public
   */
  async userinfo(accessToken, {
    verb = 'GET', via = 'header', tokenType, params,
  } = {}) {
    // TODO: in v4.x remove verb in favour of method
    assertIssuerConfiguration(this.issuer, 'userinfo_endpoint');
    const options = {
      tokenType,
      method: String(verb).toUpperCase(),
    };

    if (options.method !== 'GET' && options.method !== 'POST') {
      throw new TypeError('#userinfo() verb can only be POST or a GET');
    }

    if (via === 'query' && options.method !== 'GET') {
      throw new TypeError('userinfo endpoints will only parse query strings for GET requests');
    } else if (via === 'body' && options.method !== 'POST') {
      throw new TypeError('can only send body on POST');
    }

    const jwt = !!(this.userinfo_signed_response_alg
      || this.userinfo_encrypted_response_alg);

    if (jwt) {
      options.headers = { Accept: 'application/jwt' };
    } else {
      options.headers = { Accept: 'application/json' };
    }

    const mTLS = !!this.tls_client_certificate_bound_access_tokens;

    let targetUrl;
    if (mTLS && this.issuer.mtls_endpoint_aliases) {
      targetUrl = this.issuer.mtls_endpoint_aliases.userinfo_endpoint;
    }

    targetUrl = new url.URL(targetUrl || this.issuer.userinfo_endpoint);

    // when via is not header we clear the Authorization header and add either
    // query string parameters or urlencoded body access_token parameter
    if (via === 'query') {
      options.headers.Authorization = undefined;
      targetUrl.searchParams.append('access_token', accessToken instanceof TokenSet ? accessToken.access_token : accessToken);
    } else if (via === 'body') {
      options.headers.Authorization = undefined;
      options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      options.body = new url.URLSearchParams();
      options.body.append('access_token', accessToken instanceof TokenSet ? accessToken.access_token : accessToken);
    }

    // handle additional parameters, GET via querystring, POST via urlencoded body
    if (params) {
      if (options.method === 'GET') {
        Object.entries(params).forEach(([key, value]) => {
          targetUrl.searchParams.append(key, value);
        });
      } else if (options.body) { // POST && via body
        Object.entries(params).forEach(([key, value]) => {
          options.body.append(key, value);
        });
      } else { // POST && via header
        options.body = new url.URLSearchParams();
        options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        Object.entries(params).forEach(([key, value]) => {
          options.body.append(key, value);
        });
      }
    }

    if (options.body) {
      options.body = options.body.toString();
    }

    const response = await this.requestResource(targetUrl, accessToken, options);

    let parsed = processResponse(response, { bearer: true });

    if (jwt) {
      if (!JWT_CONTENT.test(response.headers['content-type'])) {
        throw new RPError({
          message: 'expected application/jwt response from the userinfo_endpoint',
          response,
        });
      }

      const body = response.body.toString();
      const userinfo = await this.decryptJWTUserinfo(body);
      if (!this.userinfo_signed_response_alg) {
        try {
          parsed = JSON.parse(userinfo);
          assert(isPlainObject(parsed));
        } catch (err) {
          throw new RPError({
            message: 'failed to parse userinfo JWE payload as JSON',
            jwt: userinfo,
          });
        }
      } else {
        ({ payload: parsed } = await this.validateJWTUserinfo(userinfo));
      }
    } else {
      try {
        parsed = JSON.parse(response.body);
      } catch (error) {
        const parseError = new ParseError(
          error, response.statusCode, response.request.gotOptions, response.body,
        );
        Object.defineProperty(parseError, 'response', { value: response });
        throw parseError;
      }
    }

    if (accessToken instanceof TokenSet && accessToken.id_token) {
      const expectedSub = accessToken.claims().sub;
      if (parsed.sub !== expectedSub) {
        throw new RPError({
          printf: ['userinfo sub mismatch, expected %s, got: %s', expectedSub, parsed.sub],
          body: parsed,
          jwt: accessToken.id_token,
        });
      }
    }

    return parsed;
  }

  /**
   * @name derivedKey
   * @api private
   */
  async derivedKey(len) {
    const cacheKey = `${len}_key`;
    if (instance(this).has(cacheKey)) {
      return instance(this).get(cacheKey);
    }

    const derivedBuffer = crypto.createHash('sha256')
      .update(this.client_secret)
      .digest()
      .slice(0, len / 8);

    const key = jose.JWK.asKey({ k: base64url.encode(derivedBuffer), kty: 'oct' });
    instance(this).set(cacheKey, key);

    return key;
  }

  /**
   * @name joseSecret
   * @api private
   */
  async joseSecret(alg) {
    if (!this.client_secret) {
      throw new TypeError('client_secret is required');
    }
    if (/^A(\d{3})(?:GCM)?KW$/.test(alg)) {
      return this.derivedKey(parseInt(RegExp.$1, 10));
    }

    if (/^A(\d{3})(?:GCM|CBC-HS(\d{3}))$/.test(alg)) {
      return this.derivedKey(parseInt(RegExp.$2 || RegExp.$1, 10));
    }

    if (instance(this).has('jose_secret')) {
      return instance(this).get('jose_secret');
    }

    const key = jose.JWK.asKey({ k: base64url.encode(this.client_secret), kty: 'oct' });
    instance(this).set('jose_secret', key);

    return key;
  }

  /**
   * @name grant
   * @api public
   */
  async grant(body, { clientAssertionPayload } = {}) {
    assertIssuerConfiguration(this.issuer, 'token_endpoint');
    const response = await authenticatedPost.call(
      this,
      'token',
      {
        form: true,
        body,
        json: true,
      },
      { clientAssertionPayload },
    );
    const responseBody = processResponse(response);

    return new TokenSet(responseBody);
  }

  /**
   * @name deviceAuthorization
   * @api public
   */
  async deviceAuthorization(params = {}, { exchangeBody, clientAssertionPayload } = {}) {
    assertIssuerConfiguration(this.issuer, 'device_authorization_endpoint');
    assertIssuerConfiguration(this.issuer, 'token_endpoint');

    const body = authorizationParams.call(this, {
      client_id: this.client_id,
      redirect_uri: null,
      response_type: null,
      ...params,
    });

    const response = await authenticatedPost.call(
      this,
      'device_authorization',
      {
        form: true,
        body,
        json: true,
      },
      { clientAssertionPayload, endpointAuthMethod: 'token' },
    );
    const responseBody = processResponse(response);

    return new DeviceFlowHandle({
      client: this,
      exchangeBody,
      clientAssertionPayload,
      response: responseBody,
      maxAge: params.max_age,
    });
  }

  /**
   * @name revoke
   * @api public
   */
  async revoke(token, hint, { revokeBody, clientAssertionPayload } = {}) {
    assertIssuerConfiguration(this.issuer, 'revocation_endpoint');
    if (hint !== undefined && typeof hint !== 'string') {
      throw new TypeError('hint must be a string');
    }

    const body = { ...revokeBody, token };

    if (hint) {
      body.token_type_hint = hint;
    }

    const response = await authenticatedPost.call(
      this,
      'revocation', {
        body,
        form: true,
      }, { clientAssertionPayload },
    );
    processResponse(response, { body: false });
  }

  /**
   * @name introspect
   * @api public
   */
  async introspect(token, hint, { introspectBody, clientAssertionPayload } = {}) {
    assertIssuerConfiguration(this.issuer, 'introspection_endpoint');
    if (hint !== undefined && typeof hint !== 'string') {
      throw new TypeError('hint must be a string');
    }

    const body = { ...introspectBody, token };
    if (hint) {
      body.token_type_hint = hint;
    }

    const response = await authenticatedPost.call(
      this,
      'introspection',
      { body, form: true, json: true },
      { clientAssertionPayload },
    );

    const responseBody = processResponse(response);

    return responseBody;
  }

  /**
   * @name fetchDistributedClaims
   * @api public
   */
  async fetchDistributedClaims(claims, tokens = {}) {
    if (!isPlainObject(claims)) {
      throw new TypeError('claims argument must be a plain object');
    }

    if (!isPlainObject(claims._claim_sources)) {
      return claims;
    }

    if (!isPlainObject(claims._claim_names)) {
      return claims;
    }

    const distributedSources = Object.entries(claims._claim_sources)
      .filter(([, value]) => value && value.endpoint);

    await Promise.all(distributedSources.map(async ([sourceName, def]) => {
      try {
        const requestOpts = {
          headers: {
            Accept: 'application/jwt',
            Authorization: authorizationHeaderValue(def.access_token || tokens[sourceName]),
          },
        };

        const response = await request.call(this, {
          ...requestOpts,
          method: 'GET',
          url: def.endpoint,
        });
        const body = processResponse(response, { bearer: true });

        const decoded = await claimJWT.call(this, 'distributed', body);
        delete claims._claim_sources[sourceName];
        Object.entries(claims._claim_names).forEach(
          assignClaim(claims, decoded, sourceName, false),
        );
      } catch (err) {
        err.src = sourceName;
        throw err;
      }
    }));

    cleanUpClaims(claims);
    return claims;
  }

  /**
   * @name unpackAggregatedClaims
   * @api public
   */
  async unpackAggregatedClaims(claims) {
    if (!isPlainObject(claims)) {
      throw new TypeError('claims argument must be a plain object');
    }

    if (!isPlainObject(claims._claim_sources)) {
      return claims;
    }

    if (!isPlainObject(claims._claim_names)) {
      return claims;
    }

    const aggregatedSources = Object.entries(claims._claim_sources)
      .filter(([, value]) => value && value.JWT);

    await Promise.all(aggregatedSources.map(async ([sourceName, def]) => {
      try {
        const decoded = await claimJWT.call(this, 'aggregated', def.JWT);
        delete claims._claim_sources[sourceName];
        Object.entries(claims._claim_names).forEach(assignClaim(claims, decoded, sourceName));
      } catch (err) {
        err.src = sourceName;
        throw err;
      }
    }));

    cleanUpClaims(claims);
    return claims;
  }

  /**
   * @name register
   * @api public
   */
  static async register(metadata, options = {}) {
    const { initialAccessToken, jwks, ...clientOptions } = options;

    assertIssuerConfiguration(this.issuer, 'registration_endpoint');

    if (jwks !== undefined && !(metadata.jwks || metadata.jwks_uri)) {
      const keystore = getKeystore.call(this, jwks);
      metadata.jwks = keystore.toJWKS(false);
    }

    const response = await request.call(this, {
      headers: initialAccessToken ? {
        Authorization: authorizationHeaderValue(initialAccessToken),
      } : undefined,
      json: true,
      body: metadata,
      url: this.issuer.registration_endpoint,
      method: 'POST',
    });
    const responseBody = processResponse(response, { statusCode: 201, bearer: true });

    return new this(responseBody, jwks, clientOptions);
  }

  /**
   * @name metadata
   * @api public
   */
  get metadata() {
    const copy = {};
    instance(this).get('metadata').forEach((value, key) => {
      copy[key] = value;
    });
    return copy;
  }

  /**
   * @name fromUri
   * @api public
   */
  static async fromUri(registrationClientUri, registrationAccessToken, jwks, clientOptions) {
    const response = await request.call(this, {
      method: 'GET',
      url: registrationClientUri,
      json: true,
      headers: { Authorization: authorizationHeaderValue(registrationAccessToken) },
    });
    const responseBody = processResponse(response, { bearer: true });

    return new this(responseBody, jwks, clientOptions);
  }

  /**
   * @name requestObject
   * @api public
   */
  async requestObject(requestObject = {}, algorithms = {}) {
    if (!isPlainObject(requestObject)) {
      throw new TypeError('requestObject must be a plain object');
    }

    defaults(algorithms, {
      sign: this.request_object_signing_alg,
      encrypt: {
        alg: this.request_object_encryption_alg,
        enc: this.request_object_encryption_enc || 'A128CBC-HS256',
      },
    }, {
      sign: 'none',
    });

    let signed;
    let key;

    const alg = algorithms.sign;
    const header = { alg, typ: 'JWT' };
    const payload = JSON.stringify(defaults({}, requestObject, {
      iss: this.client_id,
      aud: this.issuer.issuer,
      client_id: this.client_id,
      jti: random(),
      iat: now(),
      exp: now() + 300,
    }));

    if (alg === 'none') {
      signed = [
        base64url.encode(JSON.stringify(header)),
        base64url.encode(payload),
        '',
      ].join('.');
    } else {
      const symmetric = alg.startsWith('HS');
      if (symmetric) {
        key = await this.joseSecret();
      } else {
        const keystore = instance(this).get('keystore');

        if (!keystore) {
          throw new TypeError(`no keystore present for client, cannot sign using alg ${alg}`);
        }
        key = keystore.get({ alg, use: 'sig' });
        if (!key) {
          throw new TypeError(`no key to sign with found for alg ${alg}`);
        }
      }

      signed = jose.JWS.sign(payload, key, {
        ...header,
        kid: symmetric ? undefined : key.kid,
      });
    }

    if (!algorithms.encrypt.alg) {
      return signed;
    }

    const fields = { alg: algorithms.encrypt.alg, enc: algorithms.encrypt.enc, cty: 'JWT' };

    if (fields.alg.match(/^(RSA|ECDH)/)) {
      [key] = await this.issuer.queryKeyStore({
        alg: fields.alg,
        enc: fields.enc,
        use: 'enc',
      }, { allowMulti: true });
    } else {
      key = await this.joseSecret(fields.alg === 'dir' ? fields.enc : fields.alg);
    }

    return jose.JWE.encrypt(signed, key, {
      ...fields,
      kid: key.kty === 'oct' ? undefined : key.kid,
    });
  }


  /**
   * @name issuer
   * @api public
   */
  static get issuer() {
    return issuer;
  }


  /**
   * @name issuer
   * @api public
   */
  get issuer() { // eslint-disable-line class-methods-use-this
    return issuer;
  }

  /* istanbul ignore next */
  [inspect.custom]() {
    return `${this.constructor.name} ${inspect(this.metadata, {
      depth: Infinity,
      colors: process.stdout.isTTY,
      compact: false,
      sorted: true,
    })}`;
  }
};

// TODO: remove in 4.x
BaseClient.prototype.resource = deprecate(
  /* istanbul ignore next */
  async function resource(resourceUrl, accessToken, options) {
    let token = accessToken;
    const opts = merge({
      verb: 'GET',
      via: 'header',
    }, options);

    if (token instanceof TokenSet) {
      if (!token.access_token) {
        throw new TypeError('access_token not present in TokenSet');
      }
      opts.tokenType = opts.tokenType || token.token_type;
      token = token.access_token;
    }

    const verb = String(opts.verb).toUpperCase();
    let requestOpts;

    switch (opts.via) {
      case 'query':
        if (verb !== 'GET') {
          throw new TypeError('resource servers should only parse query strings for GET requests');
        }
        requestOpts = { query: { access_token: token } };
        break;
      case 'body':
        if (verb !== 'POST') {
          throw new TypeError('can only send body on POST');
        }
        requestOpts = { form: true, body: { access_token: token } };
        break;
      default:
        requestOpts = {
          headers: {
            Authorization: authorizationHeaderValue(token, opts.tokenType),
          },
        };
    }

    if (opts.params) {
      if (verb === 'POST') {
        defaultsDeep(requestOpts, { body: opts.params });
      } else {
        defaultsDeep(requestOpts, { query: opts.params });
      }
    }

    if (opts.headers) {
      defaultsDeep(requestOpts, { headers: opts.headers });
    }

    const mTLS = !!this.tls_client_certificate_bound_access_tokens;

    return request.call(this, {
      ...requestOpts,
      encoding: null,
      method: verb,
      url: resourceUrl,
    }, { mTLS });
  }, 'client.resource() is deprecated, use client.requestResource() instead, see docs for API details',
);

module.exports.BaseClient = BaseClient;


/***/ }),
/* 861 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const PassThrough = __webpack_require__(413).PassThrough;
const zlib = __webpack_require__(761);
const mimicResponse = __webpack_require__(89);

module.exports = response => {
	// TODO: Use Array#includes when targeting Node.js 6
	if (['gzip', 'deflate'].indexOf(response.headers['content-encoding']) === -1) {
		return response;
	}

	const unzip = zlib.createUnzip();
	const stream = new PassThrough();

	mimicResponse(response, stream);

	unzip.on('error', err => {
		if (err.code === 'Z_BUF_ERROR') {
			stream.end();
			return;
		}

		stream.emit('error', err);
	});

	response.pipe(unzip).pipe(stream);

	return stream;
};


/***/ }),
/* 862 */,
/* 863 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var arrayLikeKeys = __webpack_require__(389),
    baseKeys = __webpack_require__(351),
    isArrayLike = __webpack_require__(146);

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

module.exports = keys;


/***/ }),
/* 864 */,
/* 865 */,
/* 866 */,
/* 867 */,
/* 868 */,
/* 869 */,
/* 870 */
/***/ (function(module) {

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

module.exports = stackGet;


/***/ }),
/* 871 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var root = __webpack_require__(824);

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

module.exports = coreJsData;


/***/ }),
/* 872 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { generateKeyPairSync, generateKeyPair: async } = __webpack_require__(417)
const { promisify } = __webpack_require__(669)

const {
  THUMBPRINT_MATERIAL, JWK_MEMBERS, PUBLIC_MEMBERS,
  PRIVATE_MEMBERS, KEY_MANAGEMENT_DECRYPT, KEY_MANAGEMENT_ENCRYPT
} = __webpack_require__(771)
const { keyObjectSupported } = __webpack_require__(915)
const { createPublicKey, createPrivateKey } = __webpack_require__(727)

const Key = __webpack_require__(228)

const generateKeyPair = promisify(async)

const RSA_PUBLIC = new Set(['e', 'n'])
Object.freeze(RSA_PUBLIC)
const RSA_PRIVATE = new Set([...RSA_PUBLIC, 'd', 'p', 'q', 'dp', 'dq', 'qi'])
Object.freeze(RSA_PRIVATE)

// RSA Key Type
class RSAKey extends Key {
  constructor (...args) {
    super(...args)
    this[JWK_MEMBERS]()
    Object.defineProperties(this, {
      kty: {
        value: 'RSA',
        enumerable: true
      },
      length: {
        get () {
          Object.defineProperty(this, 'length', {
            value: Buffer.byteLength(this.n, 'base64') * 8,
            configurable: false
          })

          return this.length
        },
        configurable: true
      }
    })
  }

  static get [PUBLIC_MEMBERS] () {
    return RSA_PUBLIC
  }

  static get [PRIVATE_MEMBERS] () {
    return RSA_PRIVATE
  }

  // https://tc39.github.io/ecma262/#sec-ordinaryownpropertykeys no need for any special
  // JSON.stringify handling in V8
  [THUMBPRINT_MATERIAL] () {
    return { e: this.e, kty: 'RSA', n: this.n }
  }

  [KEY_MANAGEMENT_ENCRYPT] () {
    return this.algorithms('wrapKey')
  }

  [KEY_MANAGEMENT_DECRYPT] () {
    return this.algorithms('unwrapKey')
  }

  static async generate (len = 2048, privat = true) {
    if (!Number.isSafeInteger(len) || len < 512 || len % 8 !== 0 || (('electron' in process.versions) && len % 128 !== 0)) {
      throw new TypeError('invalid bit length')
    }

    let privateKey, publicKey

    if (keyObjectSupported) {
      ({ privateKey, publicKey } = await generateKeyPair('rsa', { modulusLength: len }))
      return privat ? privateKey : publicKey
    }

    ({ privateKey, publicKey } = await generateKeyPair('rsa', {
      modulusLength: len,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    }))

    if (privat) {
      return createPrivateKey(privateKey)
    } else {
      return createPublicKey(publicKey)
    }
  }

  static generateSync (len = 2048, privat = true) {
    if (!Number.isSafeInteger(len) || len < 512 || len % 8 !== 0 || (('electron' in process.versions) && len % 128 !== 0)) {
      throw new TypeError('invalid bit length')
    }

    let privateKey, publicKey

    if (keyObjectSupported) {
      ({ privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: len }))
      return privat ? privateKey : publicKey
    }

    ({ privateKey, publicKey } = generateKeyPairSync('rsa', {
      modulusLength: len,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    }))

    if (privat) {
      return createPrivateKey(privateKey)
    } else {
      return createPublicKey(publicKey)
    }
  }
}

module.exports = RSAKey


/***/ }),
/* 873 */,
/* 874 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(422);
/**
 * @constant
 * To generate the UUID
 * @returns The UUID string
 */
exports.generateUUID = function () {
    var uuid = "";
    for (var j = 0; j < 32; j++) {
        if (j === 8 || j === 12 || j === 16 || j === 20) {
            uuid += "-";
        }
        uuid += Math.floor(Math.random() * 16).toString(16);
    }
    return uuid;
};
/**
 * @constant
 * To get the request header from the request
 * @param {RequestInfo} request - The request object or the url string
 * @param {FetchOptions|undefined} options - The request options object
 * @param {string} key - The header key string
 * @returns A header value for the given key from the request
 */
exports.getRequestHeader = function (request, options, key) {
    var value = null;
    if (typeof Request !== "undefined" && request instanceof Request) {
        value = request.headers.get(key);
    }
    else if (typeof options !== "undefined" && options.headers !== undefined) {
        if (typeof Headers !== "undefined" && options.headers instanceof Headers) {
            value = options.headers.get(key);
        }
        else if (options.headers instanceof Array) {
            var headers = options.headers;
            for (var i = 0, l = headers.length; i < l; i++) {
                if (headers[i][0] === key) {
                    value = headers[i][1];
                    break;
                }
            }
        }
        else if (options.headers[key] !== undefined) {
            value = options.headers[key];
        }
    }
    return value;
};
/**
 * @constant
 * To set the header value to the given request
 * @param {RequestInfo} request - The request object or the url string
 * @param {FetchOptions|undefined} options - The request options object
 * @param {string} key - The header key string
 * @param {string } value - The header value string
 * @returns Nothing
 */
exports.setRequestHeader = function (request, options, key, value) {
    var _a, _b;
    if (typeof Request !== "undefined" && request instanceof Request) {
        request.headers.set(key, value);
    }
    else if (typeof options !== "undefined") {
        if (options.headers === undefined) {
            options.headers = new Headers((_a = {},
                _a[key] = value,
                _a));
        }
        else {
            if (typeof Headers !== "undefined" && options.headers instanceof Headers) {
                options.headers.set(key, value);
            }
            else if (options.headers instanceof Array) {
                var i = 0;
                var l = options.headers.length;
                for (; i < l; i++) {
                    var header = options.headers[i];
                    if (header[0] === key) {
                        header[1] = value;
                        break;
                    }
                }
                if (i === l) {
                    options.headers.push([key, value]);
                }
            }
            else {
                Object.assign(options.headers, (_b = {}, _b[key] = value, _b));
            }
        }
    }
};
/**
 * @constant
 * To append the header value to the given request
 * @param {RequestInfo} request - The request object or the url string
 * @param {FetchOptions|undefined} options - The request options object
 * @param {string} key - The header key string
 * @param {string } value - The header value string
 * @returns Nothing
 */
exports.appendRequestHeader = function (request, options, key, value) {
    var _a, _b;
    if (typeof Request !== "undefined" && request instanceof Request) {
        request.headers.append(key, value);
    }
    else if (typeof options !== "undefined") {
        if (options.headers === undefined) {
            options.headers = new Headers((_a = {},
                _a[key] = value,
                _a));
        }
        else {
            if (typeof Headers !== "undefined" && options.headers instanceof Headers) {
                options.headers.append(key, value);
            }
            else if (options.headers instanceof Array) {
                options.headers.push([key, value]);
            }
            else if (options.headers === undefined) {
                options.headers = (_b = {}, _b[key] = value, _b);
            }
            else if (options.headers[key] === undefined) {
                options.headers[key] = value;
            }
            else {
                options.headers[key] += ", " + value;
            }
        }
    }
};
/**
 * @constant
 * To clone the request with the new url
 * @param {string} url - The new url string
 * @param {Request} request - The request object
 * @returns A promise that resolves to request object
 */
exports.cloneRequestWithNewUrl = function (newUrl, request) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    var body, _a, method, headers, referrer, referrerPolicy, mode, credentials, cache, redirect, integrity, keepalive, signal;
    return tslib_1.__generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!request.headers.get("Content-Type")) return [3 /*break*/, 2];
                return [4 /*yield*/, request.blob()];
            case 1:
                _a = _b.sent();
                return [3 /*break*/, 4];
            case 2: return [4 /*yield*/, Promise.resolve(undefined)];
            case 3:
                _a = _b.sent();
                _b.label = 4;
            case 4:
                body = _a;
                method = request.method, headers = request.headers, referrer = request.referrer, referrerPolicy = request.referrerPolicy, mode = request.mode, credentials = request.credentials, cache = request.cache, redirect = request.redirect, integrity = request.integrity, keepalive = request.keepalive, signal = request.signal;
                return [2 /*return*/, new Request(newUrl, { method: method, headers: headers, body: body, referrer: referrer, referrerPolicy: referrerPolicy, mode: mode, credentials: credentials, cache: cache, redirect: redirect, integrity: integrity, keepalive: keepalive, signal: signal })];
        }
    });
}); };
//# sourceMappingURL=MiddlewareUtil.js.map

/***/ }),
/* 875 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var assignValue = __webpack_require__(363),
    baseAssignValue = __webpack_require__(772);

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject(source, props, object, customizer) {
  var isNew = !object;
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : undefined;

    if (newValue === undefined) {
      newValue = source[key];
    }
    if (isNew) {
      baseAssignValue(object, key, newValue);
    } else {
      assignValue(object, key, newValue);
    }
  }
  return object;
}

module.exports = copyObject;


/***/ }),
/* 876 */,
/* 877 */,
/* 878 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var getNative = __webpack_require__(319);

/* Built-in method references that are verified to be native. */
var nativeCreate = getNative(Object, 'create');

module.exports = nativeCreate;


/***/ }),
/* 879 */
/***/ (function(module) {

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

module.exports = getValue;


/***/ }),
/* 880 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(422);
var RequestMethod_1 = __webpack_require__(819);
var MiddlewareControl_1 = __webpack_require__(5);
var MiddlewareUtil_1 = __webpack_require__(874);
var RetryHandlerOptions_1 = __webpack_require__(848);
var TelemetryHandlerOptions_1 = __webpack_require__(343);
/**
 * @class
 * @implements Middleware
 * Class for RetryHandler
 */
var RetryHandler = /** @class */ (function () {
    /**
     * @public
     * @constructor
     * To create an instance of RetryHandler
     * @param {RetryHandlerOptions} [options = new RetryHandlerOptions()] - The retry handler options value
     * @returns An instance of RetryHandler
     */
    function RetryHandler(options) {
        if (options === void 0) { options = new RetryHandlerOptions_1.RetryHandlerOptions(); }
        this.options = options;
    }
    /**
     *
     * @private
     * To check whether the response has the retry status code
     * @param {Response} response - The response object
     * @returns Whether the response has retry status code or not
     */
    RetryHandler.prototype.isRetry = function (response) {
        return RetryHandler.RETRY_STATUS_CODES.indexOf(response.status) !== -1;
    };
    /**
     * @private
     * To check whether the payload is buffered or not
     * @param {RequestInfo} request - The url string or the request object value
     * @param {FetchOptions} options - The options of a request
     * @returns Whether the payload is buffered or not
     */
    RetryHandler.prototype.isBuffered = function (request, options) {
        var method = typeof request === "string" ? options.method : request.method;
        var isPutPatchOrPost = method === RequestMethod_1.RequestMethod.PUT || method === RequestMethod_1.RequestMethod.PATCH || method === RequestMethod_1.RequestMethod.POST;
        if (isPutPatchOrPost) {
            var isStream = MiddlewareUtil_1.getRequestHeader(request, options, "Content-Type") === "application/octet-stream";
            if (isStream) {
                return false;
            }
        }
        return true;
    };
    /**
     * @private
     * To get the delay for a retry
     * @param {Response} response - The response object
     * @param {number} retryAttempts - The current attempt count
     * @param {number} delay - The delay value in seconds
     * @returns A delay for a retry
     */
    RetryHandler.prototype.getDelay = function (response, retryAttempts, delay) {
        var getRandomness = function () { return Number(Math.random().toFixed(3)); };
        var retryAfter = response.headers !== undefined ? response.headers.get(RetryHandler.RETRY_AFTER_HEADER) : null;
        var newDelay;
        if (retryAfter !== null) {
            // tslint:disable: prefer-conditional-expression
            if (Number.isNaN(Number(retryAfter))) {
                newDelay = Math.round((new Date(retryAfter).getTime() - Date.now()) / 1000);
            }
            else {
                newDelay = Number(retryAfter);
            }
            // tslint:enable: prefer-conditional-expression
        }
        else {
            // Adding randomness to avoid retrying at a same
            newDelay = retryAttempts >= 2 ? this.getExponentialBackOffTime(retryAttempts) + delay + getRandomness() : delay + getRandomness();
        }
        return Math.min(newDelay, this.options.getMaxDelay() + getRandomness());
    };
    /**
     * @private
     * To get an exponential back off value
     * @param {number} attempts - The current attempt count
     * @returns An exponential back off value
     */
    RetryHandler.prototype.getExponentialBackOffTime = function (attempts) {
        return Math.round((1 / 2) * (Math.pow(2, attempts) - 1));
    };
    /**
     * @private
     * @async
     * To add delay for the execution
     * @param {number} delaySeconds - The delay value in seconds
     * @returns Nothing
     */
    RetryHandler.prototype.sleep = function (delaySeconds) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var delayMilliseconds;
            return tslib_1.__generator(this, function (_a) {
                delayMilliseconds = delaySeconds * 1000;
                return [2 /*return*/, new Promise(function (resolve) { return setTimeout(resolve, delayMilliseconds); })];
            });
        });
    };
    RetryHandler.prototype.getOptions = function (context) {
        var options;
        if (context.middlewareControl instanceof MiddlewareControl_1.MiddlewareControl) {
            options = context.middlewareControl.getMiddlewareOptions(this.options.constructor);
        }
        if (typeof options === "undefined") {
            options = Object.assign(new RetryHandlerOptions_1.RetryHandlerOptions(), this.options);
        }
        return options;
    };
    /**
     * @private
     * @async
     * To execute the middleware with retries
     * @param {Context} context - The context object
     * @param {number} retryAttempts - The current attempt count
     * @param {RetryHandlerOptions} options - The retry middleware options instance
     * @returns A Promise that resolves to nothing
     */
    RetryHandler.prototype.executeWithRetry = function (context, retryAttempts, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var delay, error_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.nextMiddleware.execute(context)];
                    case 1:
                        _a.sent();
                        if (!(retryAttempts < options.maxRetries && this.isRetry(context.response) && this.isBuffered(context.request, context.options) && options.shouldRetry(options.delay, retryAttempts, context.request, context.options, context.response))) return [3 /*break*/, 4];
                        ++retryAttempts;
                        MiddlewareUtil_1.setRequestHeader(context.request, context.options, RetryHandler.RETRY_ATTEMPT_HEADER, retryAttempts.toString());
                        delay = this.getDelay(context.response, retryAttempts, options.delay);
                        return [4 /*yield*/, this.sleep(delay)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.executeWithRetry(context, retryAttempts, options)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4: return [2 /*return*/];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_1 = _a.sent();
                        throw error_1;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @public
     * @async
     * To execute the current middleware
     * @param {Context} context - The context object of the request
     * @returns A Promise that resolves to nothing
     */
    RetryHandler.prototype.execute = function (context) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var retryAttempts, options, error_2;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        retryAttempts = 0;
                        options = this.getOptions(context);
                        TelemetryHandlerOptions_1.TelemetryHandlerOptions.updateFeatureUsageFlag(context, TelemetryHandlerOptions_1.FeatureUsageFlag.RETRY_HANDLER_ENABLED);
                        return [4 /*yield*/, this.executeWithRetry(context, retryAttempts, options)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_2 = _a.sent();
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @public
     * To set the next middleware in the chain
     * @param {Middleware} next - The middleware instance
     * @returns Nothing
     */
    RetryHandler.prototype.setNext = function (next) {
        this.nextMiddleware = next;
    };
    /**
     * @private
     * @static
     * A list of status codes that needs to be retried
     */
    RetryHandler.RETRY_STATUS_CODES = [
        429,
        503,
        504,
    ];
    /**
     * @private
     * @static
     * A member holding the name of retry attempt header
     */
    RetryHandler.RETRY_ATTEMPT_HEADER = "Retry-Attempt";
    /**
     * @private
     * @static
     * A member holding the name of retry after header
     */
    RetryHandler.RETRY_AFTER_HEADER = "Retry-After";
    return RetryHandler;
}());
exports.RetryHandler = RetryHandler;
//# sourceMappingURL=RetryHandler.js.map

/***/ }),
/* 881 */,
/* 882 */,
/* 883 */
/***/ (function(module) {

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

module.exports = arrayPush;


/***/ }),
/* 884 */,
/* 885 */,
/* 886 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(422);
var Version_1 = __webpack_require__(450);
var MiddlewareControl_1 = __webpack_require__(5);
var MiddlewareUtil_1 = __webpack_require__(874);
var TelemetryHandlerOptions_1 = __webpack_require__(343);
/**
 * @class
 * @implements Middleware
 * Class for TelemetryHandler
 */
var TelemetryHandler = /** @class */ (function () {
    function TelemetryHandler() {
    }
    /**
     * @public
     * @async
     * To execute the current middleware
     * @param {Context} context - The context object of the request
     * @returns A Promise that resolves to nothing
     */
    TelemetryHandler.prototype.execute = function (context) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var clientRequestId, sdkVersionValue, options, featureUsage, error_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        clientRequestId = MiddlewareUtil_1.getRequestHeader(context.request, context.options, TelemetryHandler.CLIENT_REQUEST_ID_HEADER);
                        if (clientRequestId === null) {
                            clientRequestId = MiddlewareUtil_1.generateUUID();
                            MiddlewareUtil_1.setRequestHeader(context.request, context.options, TelemetryHandler.CLIENT_REQUEST_ID_HEADER, clientRequestId);
                        }
                        sdkVersionValue = TelemetryHandler.PRODUCT_NAME + "/" + Version_1.PACKAGE_VERSION;
                        options = void 0;
                        if (context.middlewareControl instanceof MiddlewareControl_1.MiddlewareControl) {
                            options = context.middlewareControl.getMiddlewareOptions(TelemetryHandlerOptions_1.TelemetryHandlerOptions);
                        }
                        if (typeof options !== "undefined") {
                            featureUsage = options.getFeatureUsage();
                            sdkVersionValue += " (" + TelemetryHandler.FEATURE_USAGE_STRING + "=" + featureUsage + ")";
                        }
                        MiddlewareUtil_1.appendRequestHeader(context.request, context.options, TelemetryHandler.SDK_VERSION_HEADER, sdkVersionValue);
                        return [4 /*yield*/, this.nextMiddleware.execute(context)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_1 = _a.sent();
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @public
     * To set the next middleware in the chain
     * @param {Middleware} next - The middleware instance
     * @returns Nothing
     */
    TelemetryHandler.prototype.setNext = function (next) {
        this.nextMiddleware = next;
    };
    /**
     * @private
     * @static
     * A member holding the name of the client request id header
     */
    TelemetryHandler.CLIENT_REQUEST_ID_HEADER = "client-request-id";
    /**
     * @private
     * @static
     * A member holding the name of the sdk version header
     */
    TelemetryHandler.SDK_VERSION_HEADER = "SdkVersion";
    /**
     * @private
     * @static
     * A member holding the language prefix for the sdk version header value
     */
    TelemetryHandler.PRODUCT_NAME = "graph-js";
    /**
     * @private
     * @static
     * A member holding the key for the feature usage metrics
     */
    TelemetryHandler.FEATURE_USAGE_STRING = "featureUsage";
    return TelemetryHandler;
}());
exports.TelemetryHandler = TelemetryHandler;
//# sourceMappingURL=TelemetryHandler.js.map

/***/ }),
/* 887 */,
/* 888 */,
/* 889 */
/***/ (function(module, __unusedexports, __webpack_require__) {

/* eslint-disable camelcase */
const { format } = __webpack_require__(669);

const assign = __webpack_require__(249);
const makeError = __webpack_require__(741);

function OPError({
  error_description,
  error,
  error_uri,
  session_state,
  state,
  scope,
}, response) {
  OPError.super.call(this, !error_description ? error : `${error} (${error_description})`);

  assign(
    this,
    { error },
    (error_description && { error_description }),
    (error_uri && { error_uri }),
    (state && { state }),
    (scope && { scope }),
    (session_state && { session_state }),
  );

  if (response) {
    Object.defineProperty(this, 'response', {
      value: response,
    });
  }
}

makeError(OPError);

function RPError(...args) {
  if (typeof args[0] === 'string') {
    RPError.super.call(this, format(...args));
  } else {
    const {
      message, printf, response, ...rest
    } = args[0];
    if (printf) {
      RPError.super.call(this, format(...printf));
    } else {
      RPError.super.call(this, message);
    }
    assign(this, rest);
    if (response) {
      Object.defineProperty(this, 'response', {
        value: response,
      });
    }
  }
}

makeError(RPError);

module.exports = {
  OPError,
  RPError,
};


/***/ }),
/* 890 */,
/* 891 */,
/* 892 */,
/* 893 */,
/* 894 */
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var pad_string_1 = __webpack_require__(542);
function encode(input, encoding) {
    if (encoding === void 0) { encoding = "utf8"; }
    if (Buffer.isBuffer(input)) {
        return fromBase64(input.toString("base64"));
    }
    return fromBase64(Buffer.from(input, encoding).toString("base64"));
}
;
function decode(base64url, encoding) {
    if (encoding === void 0) { encoding = "utf8"; }
    return Buffer.from(toBase64(base64url), "base64").toString(encoding);
}
function toBase64(base64url) {
    base64url = base64url.toString();
    return pad_string_1.default(base64url)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");
}
function fromBase64(base64) {
    return base64
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
}
function toBuffer(base64url) {
    return Buffer.from(toBase64(base64url), "base64");
}
var base64url = encode;
base64url.encode = encode;
base64url.decode = decode;
base64url.toBase64 = toBase64;
base64url.fromBase64 = fromBase64;
base64url.toBuffer = toBuffer;
exports.default = base64url;


/***/ }),
/* 895 */,
/* 896 */
/***/ (function(module) {

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

module.exports = stackHas;


/***/ }),
/* 897 */,
/* 898 */,
/* 899 */,
/* 900 */,
/* 901 */,
/* 902 */,
/* 903 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var assocIndexOf = __webpack_require__(820);

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

module.exports = listCacheHas;


/***/ }),
/* 904 */,
/* 905 */,
/* 906 */
/***/ (function(module) {

/** Used to detect hot functions by number of calls within a span of milliseconds. */
var HOT_COUNT = 800,
    HOT_SPAN = 16;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeNow = Date.now;

/**
 * Creates a function that'll short out and invoke `identity` instead
 * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
 * milliseconds.
 *
 * @private
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new shortable function.
 */
function shortOut(func) {
  var count = 0,
      lastCalled = 0;

  return function() {
    var stamp = nativeNow(),
        remaining = HOT_SPAN - (stamp - lastCalled);

    lastCalled = stamp;
    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }
    return func.apply(undefined, arguments);
  };
}

module.exports = shortOut;


/***/ }),
/* 907 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var baseAssignValue = __webpack_require__(772),
    eq = __webpack_require__(338);

/**
 * This function is like `assignValue` except that it doesn't assign
 * `undefined` values.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignMergeValue(object, key, value) {
  if ((value !== undefined && !eq(object[key], value)) ||
      (value === undefined && !(key in object))) {
    baseAssignValue(object, key, value);
  }
}

module.exports = assignMergeValue;


/***/ }),
/* 908 */,
/* 909 */,
/* 910 */,
/* 911 */,
/* 912 */,
/* 913 */,
/* 914 */,
/* 915 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { diffieHellman, KeyObject, sign, verify } = __webpack_require__(417)

const [major, minor] = process.version.substr(1).split('.').map(x => parseInt(x, 10))

module.exports = {
  oaepHashSupported: major > 12 || (major === 12 && minor >= 9),
  keyObjectSupported: !!KeyObject && major >= 12,
  edDSASupported: !!sign && !!verify,
  dsaEncodingSupported: major > 13 || (major === 13 && minor >= 2) || (major === 12 && minor >= 16),
  improvedDH: !!diffieHellman
}


/***/ }),
/* 916 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const EventEmitter = __webpack_require__(614);
const getStream = __webpack_require__(145);
const is = __webpack_require__(534);
const PCancelable = __webpack_require__(557);
const requestAsEventEmitter = __webpack_require__(584);
const {HTTPError, ParseError, ReadError} = __webpack_require__(774);
const {options: mergeOptions} = __webpack_require__(821);
const {reNormalize} = __webpack_require__(523);

const asPromise = options => {
	const proxy = new EventEmitter();

	const promise = new PCancelable((resolve, reject, onCancel) => {
		const emitter = requestAsEventEmitter(options);

		onCancel(emitter.abort);

		emitter.on('response', async response => {
			proxy.emit('response', response);

			const stream = is.null(options.encoding) ? getStream.buffer(response) : getStream(response, options);

			let data;
			try {
				data = await stream;
			} catch (error) {
				reject(new ReadError(error, options));
				return;
			}

			const limitStatusCode = options.followRedirect ? 299 : 399;

			response.body = data;

			try {
				for (const [index, hook] of Object.entries(options.hooks.afterResponse)) {
					// eslint-disable-next-line no-await-in-loop
					response = await hook(response, updatedOptions => {
						updatedOptions = reNormalize(mergeOptions(options, {
							...updatedOptions,
							retry: 0,
							throwHttpErrors: false
						}));

						// Remove any further hooks for that request, because we we'll call them anyway.
						// The loop continues. We don't want duplicates (asPromise recursion).
						updatedOptions.hooks.afterResponse = options.hooks.afterResponse.slice(0, index);

						return asPromise(updatedOptions);
					});
				}
			} catch (error) {
				reject(error);
				return;
			}

			const {statusCode} = response;

			if (options.json && response.body) {
				try {
					response.body = JSON.parse(response.body);
				} catch (error) {
					if (statusCode >= 200 && statusCode < 300) {
						const parseError = new ParseError(error, statusCode, options, data);
						Object.defineProperty(parseError, 'response', {value: response});
						reject(parseError);
						return;
					}
				}
			}

			if (statusCode !== 304 && (statusCode < 200 || statusCode > limitStatusCode)) {
				const error = new HTTPError(response, options);
				Object.defineProperty(error, 'response', {value: response});
				if (emitter.retry(error) === false) {
					if (options.throwHttpErrors) {
						reject(error);
						return;
					}

					resolve(response);
				}

				return;
			}

			resolve(response);
		});

		emitter.once('error', reject);
		[
			'request',
			'redirect',
			'uploadProgress',
			'downloadProgress'
		].forEach(event => emitter.on(event, (...args) => proxy.emit(event, ...args)));
	});

	promise.on = (name, fn) => {
		proxy.on(name, fn);
		return promise;
	};

	return promise;
};

module.exports = asPromise;


/***/ }),
/* 917 */,
/* 918 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var assignValue = __webpack_require__(363),
    castPath = __webpack_require__(929),
    isIndex = __webpack_require__(160),
    isObject = __webpack_require__(988),
    toKey = __webpack_require__(503);

/**
 * The base implementation of `_.set`.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {Array|string} path The path of the property to set.
 * @param {*} value The value to set.
 * @param {Function} [customizer] The function to customize path creation.
 * @returns {Object} Returns `object`.
 */
function baseSet(object, path, value, customizer) {
  if (!isObject(object)) {
    return object;
  }
  path = castPath(path, object);

  var index = -1,
      length = path.length,
      lastIndex = length - 1,
      nested = object;

  while (nested != null && ++index < length) {
    var key = toKey(path[index]),
        newValue = value;

    if (index != lastIndex) {
      var objValue = nested[key];
      newValue = customizer ? customizer(objValue, key, nested) : undefined;
      if (newValue === undefined) {
        newValue = isObject(objValue)
          ? objValue
          : (isIndex(path[index + 1]) ? [] : {});
      }
    }
    assignValue(nested, key, newValue);
    nested = nested[key];
  }
  return object;
}

module.exports = baseSet;


/***/ }),
/* 919 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const generateIV = __webpack_require__(456)
const base64url = __webpack_require__(44)

module.exports = (JWA, JWK) => {
  ['A128GCMKW', 'A192GCMKW', 'A256GCMKW'].forEach((jwaAlg) => {
    const encAlg = jwaAlg.substr(0, 7)
    const size = parseInt(jwaAlg.substr(1, 3), 10)
    const encrypt = JWA.encrypt.get(encAlg)
    const decrypt = JWA.decrypt.get(encAlg)

    if (encrypt && decrypt) {
      JWA.keyManagementEncrypt.set(jwaAlg, (key, payload) => {
        const iv = generateIV(jwaAlg)
        const { ciphertext, tag } = encrypt(key, payload, { iv })
        return {
          wrapped: ciphertext,
          header: { tag: base64url.encodeBuffer(tag), iv: base64url.encodeBuffer(iv) }
        }
      })
      JWA.keyManagementDecrypt.set(jwaAlg, decrypt)
      JWK.oct.wrapKey[jwaAlg] = JWK.oct.unwrapKey[jwaAlg] = key => (key.use === 'enc' || key.use === undefined) && key.length === size
    }
  })
}


/***/ }),
/* 920 */
/***/ (function(module) {

module.exports = a => !!a && a.constructor === Object


/***/ }),
/* 921 */,
/* 922 */,
/* 923 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var isObject = __webpack_require__(988),
    isPrototype = __webpack_require__(653),
    nativeKeysIn = __webpack_require__(23);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeysIn(object) {
  if (!isObject(object)) {
    return nativeKeysIn(object);
  }
  var isProto = isPrototype(object),
      result = [];

  for (var key in object) {
    if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = baseKeysIn;


/***/ }),
/* 924 */,
/* 925 */,
/* 926 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { deprecate, inspect } = __webpack_require__(669)

const isObject = __webpack_require__(920)
const { generate, generateSync } = __webpack_require__(104)
const { USES_MAPPING } = __webpack_require__(771)
const { None, isKey, asKey: importKey } = __webpack_require__(105)

const keyscore = (key, { alg, use, ops }) => {
  let score = 0

  if (alg && key.alg) {
    score++
  }

  if (use && key.use) {
    score++
  }

  if (ops && key.key_ops) {
    score++
  }

  return score
}

class KeyStore {
  constructor (...keys) {
    while (keys.some(Array.isArray)) {
      keys = keys.flat ? keys.flat() : keys.reduce((acc, val) => {
        if (Array.isArray(val)) {
          return [...acc, ...val]
        }

        acc.push(val)
        return acc
      }, [])
    }
    if (keys.some(k => !isKey(k) || k === None)) {
      throw new TypeError('all keys must be instances of a key instantiated by JWK.asKey')
    }

    this._keys = new Set(keys)
  }

  all ({ alg, kid, thumbprint, use, kty, key_ops: ops, x5t, 'x5t#S256': x5t256, crv } = {}) {
    if (ops !== undefined && (!Array.isArray(ops) || !ops.length || ops.some(x => typeof x !== 'string'))) {
      throw new TypeError('`key_ops` must be a non-empty array of strings')
    }

    const search = { alg, use, ops }
    return [...this._keys]
      .filter((key) => {
        let candidate = true

        if (candidate && kid !== undefined && key.kid !== kid) {
          candidate = false
        }

        if (candidate && thumbprint !== undefined && key.thumbprint !== thumbprint) {
          candidate = false
        }

        if (candidate && x5t !== undefined && key.x5t !== x5t) {
          candidate = false
        }

        if (candidate && x5t256 !== undefined && key['x5t#S256'] !== x5t256) {
          candidate = false
        }

        if (candidate && kty !== undefined && key.kty !== kty) {
          candidate = false
        }

        if (candidate && crv !== undefined && (key.crv !== crv)) {
          candidate = false
        }

        if (alg !== undefined && !key.algorithms().has(alg)) {
          candidate = false
        }

        if (candidate && use !== undefined && (key.use !== undefined && key.use !== use)) {
          candidate = false
        }

        // TODO:
        if (candidate && ops !== undefined && (key.key_ops !== undefined || key.use !== undefined)) {
          let keyOps
          if (key.key_ops) {
            keyOps = new Set(key.key_ops)
          } else {
            keyOps = USES_MAPPING[key.use]
          }
          if (ops.some(x => !keyOps.has(x))) {
            candidate = false
          }
        }

        return candidate
      })
      .sort((first, second) => keyscore(second, search) - keyscore(first, search))
  }

  get (...args) {
    return this.all(...args)[0]
  }

  add (key) {
    if (!isKey(key) || key === None) {
      throw new TypeError('key must be an instance of a key instantiated by JWK.asKey')
    }

    this._keys.add(key)
  }

  remove (key) {
    if (!isKey(key)) {
      throw new TypeError('key must be an instance of a key instantiated by JWK.asKey')
    }

    this._keys.delete(key)
  }

  toJWKS (priv = false) {
    return {
      keys: [...this._keys.values()].map(
        key => key.toJWK(priv && (key.private || (key.secret && key.k)))
      )
    }
  }

  async generate (...args) {
    this._keys.add(await generate(...args))
  }

  generateSync (...args) {
    this._keys.add(generateSync(...args))
  }

  get size () {
    return this._keys.size
  }

  /* c8 ignore next 8 */
  [inspect.custom] () {
    return `${this.constructor.name} ${inspect(this.toJWKS(false), {
      depth: Infinity,
      colors: process.stdout.isTTY,
      compact: false,
      sorted: true
    })}`
  }

  * [Symbol.iterator] () {
    for (const key of this._keys) {
      yield key
    }
  }
}

function asKeyStore (jwks, { ignoreErrors = false, calculateMissingRSAPrimes = false } = {}) {
  if (!isObject(jwks) || !Array.isArray(jwks.keys) || jwks.keys.some(k => !isObject(k) || !('kty' in k))) {
    throw new TypeError('jwks must be a JSON Web Key Set formatted object')
  }

  const keys = jwks.keys.map((jwk) => {
    try {
      return importKey(jwk, { calculateMissingRSAPrimes })
    } catch (err) {
      if (!ignoreErrors) {
        throw err
      }
    }
  }).filter(Boolean)

  return new KeyStore(...keys)
}

Object.defineProperty(KeyStore, 'fromJWKS', {
  value: deprecate(jwks => asKeyStore(jwks, { calculateMissingRSAPrimes: true }), 'JWKS.KeyStore.fromJWKS() is deprecated, use JWKS.asKeyStore() instead'),
  enumerable: false
})

module.exports = { KeyStore, asKeyStore }


/***/ }),
/* 927 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var baseProperty = __webpack_require__(509),
    basePropertyDeep = __webpack_require__(352),
    isKey = __webpack_require__(748),
    toKey = __webpack_require__(503);

/**
 * Creates a function that returns the value at `path` of a given object.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 * @example
 *
 * var objects = [
 *   { 'a': { 'b': 2 } },
 *   { 'a': { 'b': 1 } }
 * ];
 *
 * _.map(objects, _.property('a.b'));
 * // => [2, 1]
 *
 * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
 * // => [1, 2]
 */
function property(path) {
  return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
}

module.exports = property;


/***/ }),
/* 928 */,
/* 929 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var isArray = __webpack_require__(143),
    isKey = __webpack_require__(748),
    stringToPath = __webpack_require__(440),
    toString = __webpack_require__(428);

/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @param {Object} [object] The object to query keys on.
 * @returns {Array} Returns the cast property path array.
 */
function castPath(value, object) {
  if (isArray(value)) {
    return value;
  }
  return isKey(value, object) ? [value] : stringToPath(toString(value));
}

module.exports = castPath;


/***/ }),
/* 930 */,
/* 931 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const decode = __webpack_require__(150)
const sign = __webpack_require__(331)
const verify = __webpack_require__(745)
const profiles = __webpack_require__(167)

module.exports = {
  decode,
  sign,
  verify,
  ...profiles
}


/***/ }),
/* 932 */,
/* 933 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const base64url = __webpack_require__(575);
const assign = __webpack_require__(249);

const now = __webpack_require__(416);

class TokenSet {
  /**
   * @name constructor
   * @api public
   */
  constructor(values) {
    assign(this, values);
  }

  /**
   * @name expires_in=
   * @api public
   */
  set expires_in(value) { // eslint-disable-line camelcase
    this.expires_at = now() + Number(value);
  }

  /**
   * @name expires_in
   * @api public
   */
  get expires_in() { // eslint-disable-line camelcase
    return Math.max.apply(null, [this.expires_at - now(), 0]);
  }

  /**
   * @name expired
   * @api public
   */
  expired() {
    return this.expires_in === 0;
  }

  /**
   * @name claims
   * @api public
   */
  claims() {
    if (!this.id_token) {
      throw new TypeError('id_token not present in TokenSet');
    }

    return JSON.parse(base64url.decode(this.id_token.split('.')[1]));
  }
}

module.exports = TokenSet;


/***/ }),
/* 934 */
/***/ (function(module) {

module.exports = {
  sign: new Map(),
  verify: new Map(),
  keyManagementEncrypt: new Map(),
  keyManagementDecrypt: new Map(),
  encrypt: new Map(),
  decrypt: new Map()
}


/***/ }),
/* 935 */,
/* 936 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var nativeCreate = __webpack_require__(878);

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

module.exports = hashGet;


/***/ }),
/* 937 */
/***/ (function(module) {

module.exports = require("net");

/***/ }),
/* 938 */,
/* 939 */,
/* 940 */,
/* 941 */,
/* 942 */,
/* 943 */,
/* 944 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { STATUS_CODES } = __webpack_require__(605);
const { format } = __webpack_require__(669);

const { OPError } = __webpack_require__(889);

const REGEXP = /(\w+)=("[^"]*")/g;
const throwAuthenticateErrors = (response) => {
  const params = {};
  try {
    while ((REGEXP.exec(response.headers['www-authenticate'])) !== null) {
      if (RegExp.$1 && RegExp.$2) {
        params[RegExp.$1] = RegExp.$2.slice(1, -1);
      }
    }
  } catch (err) {}

  if (params.error) {
    throw new OPError(params, response);
  }
};

const isStandardBodyError = (response) => {
  let result = false;
  try {
    let jsonbody;
    if (typeof response.body !== 'object' || Buffer.isBuffer(response.body)) {
      jsonbody = JSON.parse(response.body);
    } else {
      jsonbody = response.body;
    }
    result = typeof jsonbody.error === 'string' && jsonbody.error.length;
    if (result) response.body = jsonbody;
  } catch (err) {}

  return result;
};

function processResponse(response, { statusCode = 200, body = true, bearer = false } = {}) {
  if (response.statusCode !== statusCode) {
    if (bearer) {
      throwAuthenticateErrors(response);
    }

    if (isStandardBodyError(response)) {
      throw new OPError(response.body, response);
    }

    throw new OPError({
      error: format('expected %i %s, got: %i %s', statusCode, STATUS_CODES[statusCode], response.statusCode, STATUS_CODES[response.statusCode]),
    }, response);
  }

  if (body && !response.body) {
    throw new OPError({
      error: format('expected %i %s with body but no body was returned', statusCode, STATUS_CODES[statusCode]),
    }, response);
  }

  return response.body;
}


module.exports = processResponse;


/***/ }),
/* 945 */
/***/ (function(module) {

/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */
function setCacheHas(value) {
  return this.__data__.has(value);
}

module.exports = setCacheHas;


/***/ }),
/* 946 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";


const EventEmitter = __webpack_require__(614);
const urlLib = __webpack_require__(835);
const normalizeUrl = __webpack_require__(53);
const getStream = __webpack_require__(16);
const CachePolicy = __webpack_require__(154);
const Response = __webpack_require__(93);
const lowercaseKeys = __webpack_require__(784);
const cloneResponse = __webpack_require__(325);
const Keyv = __webpack_require__(303);

class CacheableRequest {
	constructor(request, cacheAdapter) {
		if (typeof request !== 'function') {
			throw new TypeError('Parameter `request` must be a function');
		}

		this.cache = new Keyv({
			uri: typeof cacheAdapter === 'string' && cacheAdapter,
			store: typeof cacheAdapter !== 'string' && cacheAdapter,
			namespace: 'cacheable-request'
		});

		return this.createCacheableRequest(request);
	}

	createCacheableRequest(request) {
		return (opts, cb) => {
			let url;
			if (typeof opts === 'string') {
				url = normalizeUrlObject(urlLib.parse(opts));
				opts = {};
			} else if (opts instanceof urlLib.URL) {
				url = normalizeUrlObject(urlLib.parse(opts.toString()));
				opts = {};
			} else {
				const [pathname, ...searchParts] = (opts.path || '').split('?');
				const search = searchParts.length > 0 ?
					`?${searchParts.join('?')}` :
					'';
				url = normalizeUrlObject({ ...opts, pathname, search });
			}

			opts = {
				headers: {},
				method: 'GET',
				cache: true,
				strictTtl: false,
				automaticFailover: false,
				...opts,
				...urlObjectToRequestOptions(url)
			};
			opts.headers = lowercaseKeys(opts.headers);

			const ee = new EventEmitter();
			const normalizedUrlString = normalizeUrl(
				urlLib.format(url),
				{
					stripWWW: false,
					removeTrailingSlash: false,
					stripAuthentication: false
				}
			);
			const key = `${opts.method}:${normalizedUrlString}`;
			let revalidate = false;
			let madeRequest = false;

			const makeRequest = opts => {
				madeRequest = true;
				let requestErrored = false;
				let requestErrorCallback;

				const requestErrorPromise = new Promise(resolve => {
					requestErrorCallback = () => {
						if (!requestErrored) {
							requestErrored = true;
							resolve();
						}
					};
				});

				const handler = response => {
					if (revalidate && !opts.forceRefresh) {
						response.status = response.statusCode;
						const revalidatedPolicy = CachePolicy.fromObject(revalidate.cachePolicy).revalidatedPolicy(opts, response);
						if (!revalidatedPolicy.modified) {
							const headers = revalidatedPolicy.policy.responseHeaders();
							response = new Response(revalidate.statusCode, headers, revalidate.body, revalidate.url);
							response.cachePolicy = revalidatedPolicy.policy;
							response.fromCache = true;
						}
					}

					if (!response.fromCache) {
						response.cachePolicy = new CachePolicy(opts, response, opts);
						response.fromCache = false;
					}

					let clonedResponse;
					if (opts.cache && response.cachePolicy.storable()) {
						clonedResponse = cloneResponse(response);

						(async () => {
							try {
								const bodyPromise = getStream.buffer(response);

								await Promise.race([
									requestErrorPromise,
									new Promise(resolve => response.once('end', resolve))
								]);

								if (requestErrored) {
									return;
								}

								const body = await bodyPromise;

								const value = {
									cachePolicy: response.cachePolicy.toObject(),
									url: response.url,
									statusCode: response.fromCache ? revalidate.statusCode : response.statusCode,
									body
								};

								let ttl = opts.strictTtl ? response.cachePolicy.timeToLive() : undefined;
								if (opts.maxTtl) {
									ttl = ttl ? Math.min(ttl, opts.maxTtl) : opts.maxTtl;
								}

								await this.cache.set(key, value, ttl);
							} catch (error) {
								ee.emit('error', new CacheableRequest.CacheError(error));
							}
						})();
					} else if (opts.cache && revalidate) {
						(async () => {
							try {
								await this.cache.delete(key);
							} catch (error) {
								ee.emit('error', new CacheableRequest.CacheError(error));
							}
						})();
					}

					ee.emit('response', clonedResponse || response);
					if (typeof cb === 'function') {
						cb(clonedResponse || response);
					}
				};

				try {
					const req = request(opts, handler);
					req.once('error', requestErrorCallback);
					req.once('abort', requestErrorCallback);
					ee.emit('request', req);
				} catch (error) {
					ee.emit('error', new CacheableRequest.RequestError(error));
				}
			};

			(async () => {
				const get = async opts => {
					await Promise.resolve();

					const cacheEntry = opts.cache ? await this.cache.get(key) : undefined;
					if (typeof cacheEntry === 'undefined') {
						return makeRequest(opts);
					}

					const policy = CachePolicy.fromObject(cacheEntry.cachePolicy);
					if (policy.satisfiesWithoutRevalidation(opts) && !opts.forceRefresh) {
						const headers = policy.responseHeaders();
						const response = new Response(cacheEntry.statusCode, headers, cacheEntry.body, cacheEntry.url);
						response.cachePolicy = policy;
						response.fromCache = true;

						ee.emit('response', response);
						if (typeof cb === 'function') {
							cb(response);
						}
					} else {
						revalidate = cacheEntry;
						opts.headers = policy.revalidationHeaders(opts);
						makeRequest(opts);
					}
				};

				const errorHandler = error => ee.emit('error', new CacheableRequest.CacheError(error));
				this.cache.once('error', errorHandler);
				ee.on('response', () => this.cache.removeListener('error', errorHandler));

				try {
					await get(opts);
				} catch (error) {
					if (opts.automaticFailover && !madeRequest) {
						makeRequest(opts);
					}

					ee.emit('error', new CacheableRequest.CacheError(error));
				}
			})();

			return ee;
		};
	}
}

function urlObjectToRequestOptions(url) {
	const options = { ...url };
	options.path = `${url.pathname || '/'}${url.search || ''}`;
	delete options.pathname;
	delete options.search;
	return options;
}

function normalizeUrlObject(url) {
	// If url was parsed by url.parse or new URL:
	// - hostname will be set
	// - host will be hostname[:port]
	// - port will be set if it was explicit in the parsed string
	// Otherwise, url was from request options:
	// - hostname or host may be set
	// - host shall not have port encoded
	return {
		protocol: url.protocol,
		auth: url.auth,
		hostname: url.hostname || url.host || 'localhost',
		port: url.port,
		pathname: url.pathname,
		search: url.search
	};
}

CacheableRequest.RequestError = class extends Error {
	constructor(error) {
		super(error.message);
		this.name = 'RequestError';
		Object.assign(this, error);
	}
};

CacheableRequest.CacheError = class extends Error {
	constructor(error) {
		super(error.message);
		this.name = 'CacheError';
		Object.assign(this, error);
	}
};

module.exports = CacheableRequest;


/***/ }),
/* 947 */,
/* 948 */,
/* 949 */,
/* 950 */,
/* 951 */,
/* 952 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const {Readable} = __webpack_require__(413);

module.exports = input => (
	new Readable({
		read() {
			this.push(input);
			this.push(null);
		}
	})
);


/***/ }),
/* 953 */,
/* 954 */,
/* 955 */,
/* 956 */,
/* 957 */,
/* 958 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const tls_1 = __webpack_require__(818);
const deferToConnect = (socket, fn) => {
    let listeners;
    if (typeof fn === 'function') {
        const connect = fn;
        listeners = { connect };
    }
    else {
        listeners = fn;
    }
    const hasConnectListener = typeof listeners.connect === 'function';
    const hasSecureConnectListener = typeof listeners.secureConnect === 'function';
    const hasCloseListener = typeof listeners.close === 'function';
    const onConnect = () => {
        if (hasConnectListener) {
            listeners.connect();
        }
        if (socket instanceof tls_1.TLSSocket && hasSecureConnectListener) {
            if (socket.authorized) {
                listeners.secureConnect();
            }
            else if (!socket.authorizationError) {
                socket.once('secureConnect', listeners.secureConnect);
            }
        }
        if (hasCloseListener) {
            socket.once('close', listeners.close);
        }
    };
    if (socket.writable && !socket.connecting) {
        onConnect();
    }
    else if (socket.connecting) {
        socket.once('connect', onConnect);
    }
    else if (socket.destroyed && hasCloseListener) {
        listeners.close(socket._hadError);
    }
};
exports.default = deferToConnect;
// For CommonJS default export support
module.exports = deferToConnect;
module.exports.default = deferToConnect;


/***/ }),
/* 959 */,
/* 960 */,
/* 961 */,
/* 962 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const EC_CURVES = __webpack_require__(449)
const IVLENGTHS = __webpack_require__(651)
const JWA = __webpack_require__(934)
const JWK = __webpack_require__(723)
const KEYLENGTHS = __webpack_require__(994)
const OKP_CURVES = __webpack_require__(461)
const ECDH_DERIVE_LENGTHS = __webpack_require__(563)

module.exports = {
  EC_CURVES,
  ECDH_DERIVE_LENGTHS,
  IVLENGTHS,
  JWA,
  JWK,
  KEYLENGTHS,
  OKP_CURVES
}


/***/ }),
/* 963 */,
/* 964 */,
/* 965 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { createSign, createVerify } = __webpack_require__(417)

const { KEYOBJECT } = __webpack_require__(771)
const resolveNodeAlg = __webpack_require__(165)
const { asInput } = __webpack_require__(727)

const sign = (nodeAlg, { [KEYOBJECT]: keyObject }, payload) => {
  return createSign(nodeAlg).update(payload).sign(asInput(keyObject, false))
}

const verify = (nodeAlg, { [KEYOBJECT]: keyObject }, payload, signature) => {
  return createVerify(nodeAlg).update(payload).verify(asInput(keyObject, true), signature)
}

const LENGTHS = {
  RS256: 0,
  RS384: 624,
  RS512: 752
}

module.exports = (JWA, JWK) => {
  ['RS256', 'RS384', 'RS512'].forEach((jwaAlg) => {
    const nodeAlg = resolveNodeAlg(jwaAlg)
    JWA.sign.set(jwaAlg, sign.bind(undefined, nodeAlg))
    JWA.verify.set(jwaAlg, verify.bind(undefined, nodeAlg))
    JWK.RSA.sign[jwaAlg] = key => key.private && JWK.RSA.verify[jwaAlg](key)
    JWK.RSA.verify[jwaAlg] = key => (key.use === 'sig' || key.use === undefined) && key.length >= LENGTHS[jwaAlg]
  })
}


/***/ }),
/* 966 */
/***/ (function(module, __unusedexports, __webpack_require__) {

"use strict";

const {PassThrough} = __webpack_require__(413);

module.exports = options => {
	options = Object.assign({}, options);

	const {array} = options;
	let {encoding} = options;
	const buffer = encoding === 'buffer';
	let objectMode = false;

	if (array) {
		objectMode = !(encoding || buffer);
	} else {
		encoding = encoding || 'utf8';
	}

	if (buffer) {
		encoding = null;
	}

	let len = 0;
	const ret = [];
	const stream = new PassThrough({objectMode});

	if (encoding) {
		stream.setEncoding(encoding);
	}

	stream.on('data', chunk => {
		ret.push(chunk);

		if (objectMode) {
			len = ret.length;
		} else {
			len += chunk.length;
		}
	});

	stream.getBufferedValue = () => {
		if (array) {
			return ret;
		}

		return buffer ? Buffer.concat(ret, len) : ret.join('');
	};

	stream.getBufferedLength = () => len;

	return stream;
};


/***/ }),
/* 967 */,
/* 968 */,
/* 969 */,
/* 970 */,
/* 971 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var arrayLikeKeys = __webpack_require__(389),
    baseKeysIn = __webpack_require__(923),
    isArrayLike = __webpack_require__(146);

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn(object) {
  return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
}

module.exports = keysIn;


/***/ }),
/* 972 */,
/* 973 */
/***/ (function(module) {

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

module.exports = freeGlobal;


/***/ }),
/* 974 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var baseIsMatch = __webpack_require__(255),
    getMatchData = __webpack_require__(517),
    matchesStrictComparable = __webpack_require__(2);

/**
 * The base implementation of `_.matches` which doesn't clone `source`.
 *
 * @private
 * @param {Object} source The object of property values to match.
 * @returns {Function} Returns the new spec function.
 */
function baseMatches(source) {
  var matchData = getMatchData(source);
  if (matchData.length == 1 && matchData[0][2]) {
    return matchesStrictComparable(matchData[0][0], matchData[0][1]);
  }
  return function(object) {
    return object === source || baseIsMatch(object, source, matchData);
  };
}

module.exports = baseMatches;


/***/ }),
/* 975 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const isObject = __webpack_require__(920)
let validateCrit = __webpack_require__(462)

const { JWEInvalid } = __webpack_require__(688)

validateCrit = validateCrit.bind(undefined, JWEInvalid)

const compactSerializer = (final, [recipient]) => {
  return `${final.protected}.${recipient.encrypted_key}.${final.iv}.${final.ciphertext}.${final.tag}`
}
compactSerializer.validate = (protectedHeader, unprotectedHeader, aad, { 0: { header }, length }) => {
  if (length !== 1 || aad || unprotectedHeader || header) {
    throw new JWEInvalid('JWE Compact Serialization doesn\'t support multiple recipients, JWE unprotected headers or AAD')
  }
  validateCrit(protectedHeader, unprotectedHeader, protectedHeader ? protectedHeader.crit : undefined)
}

const flattenedSerializer = (final, [recipient]) => {
  const { header, encrypted_key: encryptedKey } = recipient

  return {
    ...(final.protected ? { protected: final.protected } : undefined),
    ...(final.unprotected ? { unprotected: final.unprotected } : undefined),
    ...(header ? { header } : undefined),
    ...(encryptedKey ? { encrypted_key: encryptedKey } : undefined),
    ...(final.aad ? { aad: final.aad } : undefined),
    iv: final.iv,
    ciphertext: final.ciphertext,
    tag: final.tag
  }
}
flattenedSerializer.validate = (protectedHeader, unprotectedHeader, aad, { 0: { header }, length }) => {
  if (length !== 1) {
    throw new JWEInvalid('Flattened JWE JSON Serialization doesn\'t support multiple recipients')
  }
  validateCrit(protectedHeader, { ...unprotectedHeader, ...header }, protectedHeader ? protectedHeader.crit : undefined)
}

const generalSerializer = (final, recipients) => {
  const result = {
    ...(final.protected ? { protected: final.protected } : undefined),
    ...(final.unprotected ? { unprotected: final.unprotected } : undefined),
    recipients: recipients.map(({ header, encrypted_key: encryptedKey, generatedHeader }) => {
      if (!header && !encryptedKey && !generatedHeader) {
        return false
      }

      return {
        ...(header || generatedHeader ? { header: { ...header, ...generatedHeader } } : undefined),
        ...(encryptedKey ? { encrypted_key: encryptedKey } : undefined)
      }
    }).filter(Boolean),
    ...(final.aad ? { aad: final.aad } : undefined),
    iv: final.iv,
    ciphertext: final.ciphertext,
    tag: final.tag
  }

  if (!result.recipients.length) {
    delete result.recipients
  }

  return result
}
generalSerializer.validate = (protectedHeader, unprotectedHeader, aad, recipients) => {
  recipients.forEach(({ header }) => {
    validateCrit(protectedHeader, { ...header, ...unprotectedHeader }, protectedHeader ? protectedHeader.crit : undefined)
  })
}

const isJSON = (input) => {
  return isObject(input) &&
    typeof input.ciphertext === 'string' &&
    typeof input.iv === 'string' &&
    typeof input.tag === 'string' &&
    (input.unprotected === undefined || isObject(input.unprotected)) &&
    (input.protected === undefined || typeof input.protected === 'string') &&
    (input.aad === undefined || typeof input.aad === 'string')
}

const isSingleRecipient = (input) => {
  return (input.encrypted_key === undefined || typeof input.encrypted_key === 'string') &&
    (input.header === undefined || isObject(input.header))
}

const isValidRecipient = (recipient) => {
  return isObject(recipient) && typeof recipient.encrypted_key === 'string' && (recipient.header === undefined || isObject(recipient.header))
}

const isMultiRecipient = (input) => {
  if (Array.isArray(input.recipients) && input.recipients.every(isValidRecipient)) {
    return true
  }

  return false
}

const detect = (input) => {
  if (typeof input === 'string' && input.split('.').length === 5) {
    return 'compact'
  }

  if (isJSON(input)) {
    if (isMultiRecipient(input)) {
      return 'general'
    }

    if (isSingleRecipient(input)) {
      return 'flattened'
    }
  }

  throw new JWEInvalid('JWE malformed or invalid serialization')
}

module.exports = {
  compact: compactSerializer,
  flattened: flattenedSerializer,
  general: generalSerializer,
  detect
}


/***/ }),
/* 976 */,
/* 977 */,
/* 978 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const Encrypt = __webpack_require__(259)
const decrypt = __webpack_require__(65)

// TODO: in v2.x swap unprotectedHeader and aad
const single = (serialization, cleartext, key, protectedHeader, unprotectedHeader, aad) => {
  return new Encrypt(cleartext, protectedHeader, unprotectedHeader, aad)
    .recipient(key)
    .encrypt(serialization)
}

module.exports.Encrypt = Encrypt
module.exports.encrypt = single.bind(undefined, 'compact')
module.exports.encrypt.flattened = single.bind(undefined, 'flattened')
module.exports.encrypt.general = single.bind(undefined, 'general')

module.exports.decrypt = decrypt


/***/ }),
/* 979 */,
/* 980 */,
/* 981 */,
/* 982 */,
/* 983 */,
/* 984 */,
/* 985 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var Symbol = __webpack_require__(498);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

module.exports = getRawTag;


/***/ }),
/* 986 */
/***/ (function(module, __unusedexports, __webpack_require__) {

var ListCache = __webpack_require__(670),
    Map = __webpack_require__(654),
    MapCache = __webpack_require__(121);

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof ListCache) {
    var pairs = data.__data__;
    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new MapCache(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}

module.exports = stackSet;


/***/ }),
/* 987 */,
/* 988 */
/***/ (function(module) {

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

module.exports = isObject;


/***/ }),
/* 989 */,
/* 990 */,
/* 991 */,
/* 992 */,
/* 993 */,
/* 994 */
/***/ (function(module) {

module.exports = new Map([
  ['A128CBC-HS256', 256],
  ['A128GCM', 128],
  ['A192CBC-HS384', 384],
  ['A192GCM', 192],
  ['A256CBC-HS512', 512],
  ['A256GCM', 256]
])


/***/ }),
/* 995 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const isObject = __webpack_require__(920)
let validateCrit = __webpack_require__(462)
const { JWSInvalid } = __webpack_require__(688)

validateCrit = validateCrit.bind(undefined, JWSInvalid)

const compactSerializer = (payload, [recipient]) => {
  return `${recipient.protected}.${payload}.${recipient.signature}`
}
compactSerializer.validate = (jws, { 0: { unprotectedHeader, protectedHeader }, length }) => {
  if (length !== 1 || unprotectedHeader) {
    throw new JWSInvalid('JWS Compact Serialization doesn\'t support multiple recipients or JWS unprotected headers')
  }
  validateCrit(protectedHeader, unprotectedHeader, protectedHeader ? protectedHeader.crit : undefined)
}

const flattenedSerializer = (payload, [recipient]) => {
  const { header, signature, protected: prot } = recipient

  return {
    payload,
    ...prot ? { protected: prot } : undefined,
    ...header ? { header } : undefined,
    signature
  }
}
flattenedSerializer.validate = (jws, { 0: { unprotectedHeader, protectedHeader }, length }) => {
  if (length !== 1) {
    throw new JWSInvalid('Flattened JWS JSON Serialization doesn\'t support multiple recipients')
  }
  validateCrit(protectedHeader, unprotectedHeader, protectedHeader ? protectedHeader.crit : undefined)
}

const generalSerializer = (payload, recipients) => {
  return {
    payload,
    signatures: recipients.map(({ header, signature, protected: prot }) => {
      return {
        ...prot ? { protected: prot } : undefined,
        ...header ? { header } : undefined,
        signature
      }
    })
  }
}
generalSerializer.validate = (jws, recipients) => {
  recipients.forEach(({ protectedHeader, unprotectedHeader }) => {
    validateCrit(protectedHeader, unprotectedHeader, protectedHeader ? protectedHeader.crit : undefined)
  })
}

const isJSON = (input) => {
  return isObject(input) && (typeof input.payload === 'string' || Buffer.isBuffer(input.payload))
}

const isValidRecipient = (recipient) => {
  return isObject(recipient) && typeof recipient.signature === 'string' &&
    (recipient.header === undefined || isObject(recipient.header)) &&
    (recipient.protected === undefined || typeof recipient.protected === 'string')
}

const isMultiRecipient = (input) => {
  if (Array.isArray(input.signatures) && input.signatures.every(isValidRecipient)) {
    return true
  }

  return false
}

const detect = (input) => {
  if (typeof input === 'string' && input.split('.').length === 3) {
    return 'compact'
  }

  if (isJSON(input)) {
    if (isMultiRecipient(input)) {
      return 'general'
    }

    if (isValidRecipient(input)) {
      return 'flattened'
    }
  }

  throw new JWSInvalid('JWS malformed or invalid serialization')
}

module.exports = {
  compact: compactSerializer,
  flattened: flattenedSerializer,
  general: generalSerializer,
  detect
}


/***/ }),
/* 996 */
/***/ (function(module) {

module.exports = function () {
  this.seq().obj(
    this.key('algorithm').objid(),
    this.key('parameters').optional().any()
  )
}


/***/ }),
/* 997 */
/***/ (function(module, __unusedexports, __webpack_require__) {

const { deprecate } = __webpack_require__(669)

const deprecation = deprecate(() => {}, '"P-256K" EC curve name is deprecated')

module.exports = {
  name: 'secp256k1',
  rename (value) {
    if (value !== 'secp256k1') {
      deprecation()
    }
    module.exports.name = value
  }
}


/***/ })
/******/ ],
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ 	"use strict";
/******/ 
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	!function() {
/******/ 		__webpack_require__.nmd = function(module) {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			Object.defineProperty(module, 'loaded', {
/******/ 				enumerable: true,
/******/ 				get: function() { return module.l; }
/******/ 			});
/******/ 			Object.defineProperty(module, 'id', {
/******/ 				enumerable: true,
/******/ 				get: function() { return module.i; }
/******/ 			});
/******/ 			return module;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ }
);