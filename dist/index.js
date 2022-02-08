require('./sourcemap-register.js');/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 9725:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ClientCredentialsAuthProvider = void 0;
const openid_client_1 = __nccwpck_require__(3140);
class ClientCredentialsAuthProvider {
    constructor(tenant, clientId, clientSecret, scopes = [ClientCredentialsAuthProvider.defaultScope]) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.scopes = scopes;
        this.cachedToken = null;
        this.authClient = openid_client_1.Issuer.discover(`https://login.microsoftonline.com/${tenant}/v2.0/.well-known/openid-configuration`).then((issuer) => {
            const client = new issuer.Client({
                client_id: clientId,
                client_secret: clientSecret,
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
                throw Error("Failed to acquire an authentication token.");
            }
            return this.cachedToken.access_token;
        });
    }
    acquireNewToken() {
        return __awaiter(this, void 0, void 0, function* () {
            this.cachedToken = yield (yield this.authClient).grant({
                grant_type: "client_credentials",
                client_id: this.clientId,
                client_secret: this.clientSecret,
                scope: this.scopes.join(" "),
            });
        });
    }
}
exports.ClientCredentialsAuthProvider = ClientCredentialsAuthProvider;
ClientCredentialsAuthProvider.defaultScope = "https://graph.microsoft.com/.default";


/***/ }),

/***/ 3109:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Polyfill for graph client
const microsoft_graph_client_1 = __nccwpck_require__(9989);
const auth_1 = __nccwpck_require__(9725);
const core = __nccwpck_require__(2186);
const fs = __nccwpck_require__(5747);
const path = __nccwpck_require__(5622);
const fsPromises = __nccwpck_require__(5747).promises;
global.fetch = __nccwpck_require__(467);
function run() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const folder = core.getInput('folder');
            const files = core.getInput('files');
            const tenant = core.getInput('tenant');
            const clientId = core.getInput('clientId');
            const clientSecret = core.getInput('clientSecret');
            core.info('Deploy custom policy GitHub Action v5b started.');
            if (clientId === 'test') {
                core.info('GitHub Action test successfully completed.');
                return;
            }
            if (clientId === null || clientId === undefined || clientId === '') {
                core.setFailed("The 'clientId' parameter is missing.");
            }
            if (folder === null || folder === undefined || folder === '') {
                core.setFailed("The 'folder' parameter is missing.");
            }
            if (files === null || files === undefined || files === '') {
                core.setFailed("The 'files' parameter is missing.");
            }
            if (tenant === null || tenant === undefined || tenant === '') {
                core.setFailed("The 'tenant' parameter is missing.");
            }
            if (clientSecret === null || clientSecret === undefined || clientSecret === '') {
                core.setFailed(`The 'clientSecret' parameter is missing.`);
            }
            const client = microsoft_graph_client_1.Client.initWithMiddleware({
                authProvider: new auth_1.ClientCredentialsAuthProvider(tenant, clientId, clientSecret),
                defaultVersion: 'beta'
            });
            // Create an array of policy files
            const filesArray = files.split(",");
            for (const f of filesArray) {
                const file = path.join(folder, f.trim());
                if (file.length > 0 && fs.existsSync(file)) {
                    core.info(`Uploading policy file ${file} ...`);
                    // Get the policy name
                    let policyName = '';
                    const data = yield fsPromises.readFile(file);
                    const result = data.toString().match(/(?<=\bPolicyId=")[^"]*/gm);
                    if (result && result.length > 0)
                        policyName = result[0];
                    // Upload the policy
                    const fileStream = fs.createReadStream(file);
                    const response = yield client
                        .api(`trustFramework/policies/${policyName}/$value`)
                        .putStream(fileStream);
                    core.info(`Uploading policy file ${file} task is completed.`);
                }
                else {
                    core.warning(`Policy file ${file} not found.`);
                }
            }
        }
        catch (error) {
            const errorText = (_a = error.message) !== null && _a !== void 0 ? _a : error;
            core.setFailed(errorText);
        }
    });
}
run();
// import * as core from '@actions/core'
// import {wait} from './wait'
// async function run(): Promise<void> {
//   try {
//     const ms: string = core.getInput('milliseconds')
//     core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true
//     core.debug(new Date().toTimeString())
//     await wait(parseInt(ms, 10))
//     core.debug(new Date().toTimeString())
//     core.setOutput('time', new Date().toTimeString())
//   } catch (error) {
//     core.setFailed(error.message)
//   }
// }
// run()


/***/ }),

/***/ 7351:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.issue = exports.issueCommand = void 0;
const os = __importStar(__nccwpck_require__(2087));
const utils_1 = __nccwpck_require__(5278);
/**
 * Commands
 *
 * Command Format:
 *   ::name key=value,key=value::message
 *
 * Examples:
 *   ::warning::This is the message
 *   ::set-env name=MY_VAR::some value
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
            let first = true;
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        if (first) {
                            first = false;
                        }
                        else {
                            cmdStr += ',';
                        }
                        cmdStr += `${key}=${escapeProperty(val)}`;
                    }
                }
            }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
    }
}
function escapeData(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A');
}
function escapeProperty(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C');
}
//# sourceMappingURL=command.js.map

/***/ }),

/***/ 2186:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getState = exports.saveState = exports.group = exports.endGroup = exports.startGroup = exports.info = exports.notice = exports.warning = exports.error = exports.debug = exports.isDebug = exports.setFailed = exports.setCommandEcho = exports.setOutput = exports.getBooleanInput = exports.getMultilineInput = exports.getInput = exports.addPath = exports.setSecret = exports.exportVariable = exports.ExitCode = void 0;
const command_1 = __nccwpck_require__(7351);
const file_command_1 = __nccwpck_require__(717);
const utils_1 = __nccwpck_require__(5278);
const os = __importStar(__nccwpck_require__(2087));
const path = __importStar(__nccwpck_require__(5622));
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
 * @param val the value of the variable. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exportVariable(name, val) {
    const convertedVal = utils_1.toCommandValue(val);
    process.env[name] = convertedVal;
    const filePath = process.env['GITHUB_ENV'] || '';
    if (filePath) {
        const delimiter = '_GitHubActionsFileCommandDelimeter_';
        const commandValue = `${name}<<${delimiter}${os.EOL}${convertedVal}${os.EOL}${delimiter}`;
        file_command_1.issueCommand('ENV', commandValue);
    }
    else {
        command_1.issueCommand('set-env', { name }, convertedVal);
    }
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
    const filePath = process.env['GITHUB_PATH'] || '';
    if (filePath) {
        file_command_1.issueCommand('PATH', inputPath);
    }
    else {
        command_1.issueCommand('add-path', {}, inputPath);
    }
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.
 * Unless trimWhitespace is set to false in InputOptions, the value is also trimmed.
 * Returns an empty string if the value is not defined.
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
    if (options && options.trimWhitespace === false) {
        return val;
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Gets the values of an multiline input.  Each value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string[]
 *
 */
function getMultilineInput(name, options) {
    const inputs = getInput(name, options)
        .split('\n')
        .filter(x => x !== '');
    return inputs;
}
exports.getMultilineInput = getMultilineInput;
/**
 * Gets the input value of the boolean type in the YAML 1.2 "core schema" specification.
 * Support boolean input list: `true | True | TRUE | false | False | FALSE` .
 * The return value is also in boolean type.
 * ref: https://yaml.org/spec/1.2/spec.html#id2804923
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   boolean
 */
function getBooleanInput(name, options) {
    const trueValue = ['true', 'True', 'TRUE'];
    const falseValue = ['false', 'False', 'FALSE'];
    const val = getInput(name, options);
    if (trueValue.includes(val))
        return true;
    if (falseValue.includes(val))
        return false;
    throw new TypeError(`Input does not meet YAML 1.2 "Core Schema" specification: ${name}\n` +
        `Support boolean input list: \`true | True | TRUE | false | False | FALSE\``);
}
exports.getBooleanInput = getBooleanInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setOutput(name, value) {
    process.stdout.write(os.EOL);
    command_1.issueCommand('set-output', { name }, value);
}
exports.setOutput = setOutput;
/**
 * Enables or disables the echoing of commands into stdout for the rest of the step.
 * Echoing is disabled by default if ACTIONS_STEP_DEBUG is not set.
 *
 */
function setCommandEcho(enabled) {
    command_1.issue('echo', enabled ? 'on' : 'off');
}
exports.setCommandEcho = setCommandEcho;
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
 * Gets whether Actions Step Debug is on or not
 */
function isDebug() {
    return process.env['RUNNER_DEBUG'] === '1';
}
exports.isDebug = isDebug;
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
 * @param message error issue message. Errors will be converted to string via toString()
 * @param properties optional properties to add to the annotation.
 */
function error(message, properties = {}) {
    command_1.issueCommand('error', utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
}
exports.error = error;
/**
 * Adds a warning issue
 * @param message warning issue message. Errors will be converted to string via toString()
 * @param properties optional properties to add to the annotation.
 */
function warning(message, properties = {}) {
    command_1.issueCommand('warning', utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
}
exports.warning = warning;
/**
 * Adds a notice issue
 * @param message notice issue message. Errors will be converted to string via toString()
 * @param properties optional properties to add to the annotation.
 */
function notice(message, properties = {}) {
    command_1.issueCommand('notice', utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
}
exports.notice = notice;
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
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

/***/ 717:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

// For internal use, subject to change.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.issueCommand = void 0;
// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
const fs = __importStar(__nccwpck_require__(5747));
const os = __importStar(__nccwpck_require__(2087));
const utils_1 = __nccwpck_require__(5278);
function issueCommand(command, message) {
    const filePath = process.env[`GITHUB_${command}`];
    if (!filePath) {
        throw new Error(`Unable to find environment variable for file command ${command}`);
    }
    if (!fs.existsSync(filePath)) {
        throw new Error(`Missing file at path: ${filePath}`);
    }
    fs.appendFileSync(filePath, `${utils_1.toCommandValue(message)}${os.EOL}`, {
        encoding: 'utf8'
    });
}
exports.issueCommand = issueCommand;
//# sourceMappingURL=file-command.js.map

/***/ }),

/***/ 5278:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.toCommandProperties = exports.toCommandValue = void 0;
/**
 * Sanitizes an input into a string so it can be passed into issueCommand safely
 * @param input input to sanitize into a string
 */
function toCommandValue(input) {
    if (input === null || input === undefined) {
        return '';
    }
    else if (typeof input === 'string' || input instanceof String) {
        return input;
    }
    return JSON.stringify(input);
}
exports.toCommandValue = toCommandValue;
/**
 *
 * @param annotationProperties
 * @returns The command properties to send with the actual annotation command
 * See IssueCommandProperties: https://github.com/actions/runner/blob/main/src/Runner.Worker/ActionCommandManager.cs#L646
 */
function toCommandProperties(annotationProperties) {
    if (!Object.keys(annotationProperties).length) {
        return {};
    }
    return {
        title: annotationProperties.title,
        line: annotationProperties.startLine,
        endLine: annotationProperties.endLine,
        col: annotationProperties.startColumn,
        endColumn: annotationProperties.endColumn
    };
}
exports.toCommandProperties = toCommandProperties;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 5226:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Client = void 0;
var tslib_1 = __nccwpck_require__(7331);
/**
 * @module Client
 */
var Constants_1 = __nccwpck_require__(6078);
var CustomAuthenticationProvider_1 = __nccwpck_require__(2013);
var GraphRequest_1 = __nccwpck_require__(1844);
var HTTPClient_1 = __nccwpck_require__(6255);
var HTTPClientFactory_1 = __nccwpck_require__(113);
var ValidatePolyFilling_1 = __nccwpck_require__(5195);
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
        ValidatePolyFilling_1.validatePolyFilling();
        for (var key in clientOptions) {
            if (Object.prototype.hasOwnProperty.call(clientOptions, key)) {
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
            httpClient = new (HTTPClient_1.HTTPClient.bind.apply(HTTPClient_1.HTTPClient, tslib_1.__spreadArray([void 0], [].concat(clientOptions.middleware))))();
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
            if (Object.prototype.hasOwnProperty.call(options, i)) {
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
        return new Client(clientOptions);
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

/***/ 6078:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GRAPH_URLS = exports.GRAPH_BASE_URL = exports.GRAPH_API_VERSION = void 0;
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
/**
 * To hold list of the service root endpoints for Microsoft Graph and Graph Explorer for each national cloud.
 * Set(iterable:Object) is not supported in Internet Explorer. The consumer is recommended to use a suitable polyfill.
 */
exports.GRAPH_URLS = new Set(["graph.microsoft.com", "graph.microsoft.us", "dod-graph.microsoft.us", "graph.microsoft.de", "microsoftgraph.chinacloudapi.cn", "canary.graph.microsoft.com"]);
//# sourceMappingURL=Constants.js.map

/***/ }),

/***/ 2013:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CustomAuthenticationProvider = void 0;
var tslib_1 = __nccwpck_require__(7331);
/**
 * @module CustomAuthenticationProvider
 */
var GraphClientError_1 = __nccwpck_require__(1938);
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
                        _this.provider(function (error, accessToken) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                            var invalidTokenMessage, err;
                            return tslib_1.__generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!accessToken) return [3 /*break*/, 1];
                                        resolve(accessToken);
                                        return [3 /*break*/, 3];
                                    case 1:
                                        if (!error) {
                                            invalidTokenMessage = "Access token is undefined or empty.\
						Please provide a valid token.\
						For more help - https://github.com/microsoftgraph/msgraph-sdk-javascript/blob/dev/docs/CustomAuthenticationProvider.md";
                                            error = new GraphClientError_1.GraphClientError(invalidTokenMessage);
                                        }
                                        return [4 /*yield*/, GraphClientError_1.GraphClientError.setGraphClientError(error)];
                                    case 2:
                                        err = _a.sent();
                                        reject(err);
                                        _a.label = 3;
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); });
                    })];
            });
        });
    };
    return CustomAuthenticationProvider;
}());
exports.CustomAuthenticationProvider = CustomAuthenticationProvider;
//# sourceMappingURL=CustomAuthenticationProvider.js.map

/***/ }),

/***/ 1938:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GraphClientError = void 0;
var tslib_1 = __nccwpck_require__(7331);
/**
 * @module GraphClientError
 */
/**
 * @class
 * Create GraphClientError object to handle client-side errors
 * encountered within the JavaScript Client SDK.
 * Whereas GraphError Class should be used to handle errors in the response from the Graph API.
 */
var GraphClientError = /** @class */ (function (_super) {
    tslib_1.__extends(GraphClientError, _super);
    /**
     * @public
     * @constructor
     * Creates an instance of GraphClientError
     * @param {string} message? - Error message
     * @returns An instance of GraphClientError
     */
    function GraphClientError(message) {
        var _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, GraphClientError.prototype);
        return _this;
    }
    /**
     * @public
     * @static
     * @async
     * To set the GraphClientError object
     * @param {any} - The error returned encountered by the Graph JavaScript Client SDK while processing request
     * @returns GraphClientError object set to the error passed
     */
    GraphClientError.setGraphClientError = function (error) {
        var graphClientError;
        if (error instanceof Error) {
            graphClientError = error;
        }
        else {
            graphClientError = new GraphClientError();
            graphClientError.customError = error;
        }
        return graphClientError;
    };
    return GraphClientError;
}(Error));
exports.GraphClientError = GraphClientError;
//# sourceMappingURL=GraphClientError.js.map

/***/ }),

/***/ 9260:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GraphError = void 0;
var tslib_1 = __nccwpck_require__(7331);
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
var GraphError = /** @class */ (function (_super) {
    tslib_1.__extends(GraphError, _super);
    /**
     * @public
     * @constructor
     * Creates an instance of GraphError
     * @param {number} [statusCode = -1] - The status code of the error
     * @returns An instance of GraphError
     */
    function GraphError(statusCode, message, baseError) {
        if (statusCode === void 0) { statusCode = -1; }
        var _this = _super.call(this, message || (baseError && baseError.message)) || this;
        // https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(_this, GraphError.prototype);
        _this.statusCode = statusCode;
        _this.code = null;
        _this.requestId = null;
        _this.date = new Date();
        _this.body = null;
        _this.stack = baseError ? baseError.stack : _this.stack;
        return _this;
    }
    return GraphError;
}(Error));
exports.GraphError = GraphError;
//# sourceMappingURL=GraphError.js.map

/***/ }),

/***/ 6851:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GraphErrorHandler = void 0;
var tslib_1 = __nccwpck_require__(7331);
/**
 * @module GraphErrorHandler
 */
var GraphError_1 = __nccwpck_require__(9260);
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
        var gError = new GraphError_1.GraphError(statusCode, "", error);
        if (error.name !== undefined) {
            gError.code = error.name;
        }
        gError.body = error.toString();
        gError.date = new Date();
        return gError;
    };
    /**
     * @private
     * @static
     * @async
     * Populates the GraphError instance from the Error returned by graph service
     * @param {GraphAPIErrorResponse} graphError - The error possibly returned by graph service or some native error
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
    GraphErrorHandler.constructErrorFromResponse = function (graphError, statusCode) {
        var error = graphError.error;
        var gError = new GraphError_1.GraphError(statusCode, error.message);
        gError.code = error.code;
        if (error.innerError !== undefined) {
            gError.requestId = error.innerError["request-id"];
            gError.date = new Date(error.innerError.date);
        }
        gError.body = JSON.stringify(error);
        return gError;
    };
    /**
     * @public
     * @static
     * @async
     * To get the GraphError object
     * Reference - https://docs.microsoft.com/en-us/graph/errors
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
                else if (error instanceof Error) {
                    gError = GraphErrorHandler.constructError(error, statusCode);
                }
                else {
                    gError = new GraphError_1.GraphError(statusCode);
                    gError.body = error; // if a custom error is passed which is not instance of Error object or a graph API response
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

/***/ 1844:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GraphRequest = void 0;
var tslib_1 = __nccwpck_require__(7331);
/**
 * @module GraphRequest
 */
var GraphClientError_1 = __nccwpck_require__(1938);
var GraphErrorHandler_1 = __nccwpck_require__(6851);
var GraphRequestUtil_1 = __nccwpck_require__(8784);
var GraphResponseHandler_1 = __nccwpck_require__(3298);
var MiddlewareControl_1 = __nccwpck_require__(6559);
var RequestMethod_1 = __nccwpck_require__(2635);
var ResponseType_1 = __nccwpck_require__(6903);
/**
 * @class
 * A Class representing GraphRequest
 */
var GraphRequest = /** @class */ (function () {
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
                    _this.parseQueryParameter(queryParam);
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
            otherURLQueryOptions: [],
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
            console.log(url);
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
                if (Object.prototype.hasOwnProperty.call(urlComponents.oDataQueryParams, property)) {
                    query.push(property + "=" + urlComponents.oDataQueryParams[property]);
                }
            }
        }
        if (Object.keys(urlComponents.otherURLQueryParams).length !== 0) {
            for (var property in urlComponents.otherURLQueryParams) {
                if (Object.prototype.hasOwnProperty.call(urlComponents.otherURLQueryParams, property)) {
                    query.push(property + "=" + urlComponents.otherURLQueryParams[property]);
                }
            }
        }
        if (urlComponents.otherURLQueryOptions.length !== 0) {
            for (var _i = 0, _a = urlComponents.otherURLQueryOptions; _i < _a.length; _i++) {
                var str = _a[_i];
                query.push(str);
            }
        }
        return query.length > 0 ? "?" + query.join("&") : "";
    };
    /**
     * @private
     * Parses the query parameters to set the urlComponents property of the GraphRequest object
     * @param {string|KeyValuePairObjectStringNumber} queryDictionaryOrString - The query parameter
     * @returns The same GraphRequest instance that is being called with
     */
    GraphRequest.prototype.parseQueryParameter = function (queryDictionaryOrString) {
        if (typeof queryDictionaryOrString === "string") {
            if (queryDictionaryOrString.charAt(0) === "?") {
                queryDictionaryOrString = queryDictionaryOrString.substring(1);
            }
            if (queryDictionaryOrString.indexOf("&") !== -1) {
                var queryParams = queryDictionaryOrString.split("&");
                for (var _i = 0, queryParams_2 = queryParams; _i < queryParams_2.length; _i++) {
                    var str = queryParams_2[_i];
                    this.parseQueryParamenterString(str);
                }
            }
            else {
                this.parseQueryParamenterString(queryDictionaryOrString);
            }
        }
        else if (queryDictionaryOrString.constructor === Object) {
            for (var key in queryDictionaryOrString) {
                if (Object.prototype.hasOwnProperty.call(queryDictionaryOrString, key)) {
                    this.setURLComponentsQueryParamater(key, queryDictionaryOrString[key]);
                }
            }
        }
        return this;
    };
    /**
     * @private
     * Parses the query parameter of string type to set the urlComponents property of the GraphRequest object
     * @param {string} queryParameter - the query parameters
     * returns nothing
     */
    GraphRequest.prototype.parseQueryParamenterString = function (queryParameter) {
        /* The query key-value pair must be split on the first equals sign to avoid errors in parsing nested query parameters.
                 Example-> "/me?$expand=home($select=city)" */
        if (this.isValidQueryKeyValuePair(queryParameter)) {
            var indexOfFirstEquals = queryParameter.indexOf("=");
            var paramKey = queryParameter.substring(0, indexOfFirstEquals);
            var paramValue = queryParameter.substring(indexOfFirstEquals + 1);
            this.setURLComponentsQueryParamater(paramKey, paramValue);
        }
        else {
            /* Push values which are not of key-value structure.
            Example-> Handle an invalid input->.query(test), .query($select($select=name)) and let the Graph API respond with the error in the URL*/
            this.urlComponents.otherURLQueryOptions.push(queryParameter);
        }
    };
    /**
     * @private
     * Sets values into the urlComponents property of GraphRequest object.
     * @param {string} paramKey - the query parameter key
     * @param {string} paramValue - the query paramter value
     * @returns nothing
     */
    GraphRequest.prototype.setURLComponentsQueryParamater = function (paramKey, paramValue) {
        if (GraphRequestUtil_1.oDataQueryNames.indexOf(paramKey) !== -1) {
            var currentValue = this.urlComponents.oDataQueryParams[paramKey];
            var isValueAppendable = currentValue && (paramKey === "$expand" || paramKey === "$select" || paramKey === "$orderby");
            this.urlComponents.oDataQueryParams[paramKey] = isValueAppendable ? currentValue + "," + paramValue : paramValue;
        }
        else {
            this.urlComponents.otherURLQueryParams[paramKey] = paramValue;
        }
    };
    /**
     * @private
     * Check if the query parameter string has a valid key-value structure
     * @param {string} queryString - the query parameter string. Example -> "name=value"
     * #returns true if the query string has a valid key-value structure else false
     */
    GraphRequest.prototype.isValidQueryKeyValuePair = function (queryString) {
        var indexofFirstEquals = queryString.indexOf("=");
        if (indexofFirstEquals === -1) {
            return false;
        }
        var indexofOpeningParanthesis = queryString.indexOf("(");
        if (indexofOpeningParanthesis !== -1 && queryString.indexOf("(") < indexofFirstEquals) {
            // Example -> .query($select($expand=true));
            return false;
        }
        return true;
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
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var rawResponse, middlewareControl, customHosts, context_1, response, error_1, statusCode, gError;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        middlewareControl = new MiddlewareControl_1.MiddlewareControl(this._middlewareOptions);
                        this.updateRequestOptions(options);
                        customHosts = (_a = this.config) === null || _a === void 0 ? void 0 : _a.customHosts;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 6]);
                        return [4 /*yield*/, this.httpClient.sendRequest({
                                request: request,
                                options: options,
                                middlewareControl: middlewareControl,
                                customHosts: customHosts,
                            })];
                    case 2:
                        context_1 = _b.sent();
                        rawResponse = context_1.response;
                        return [4 /*yield*/, GraphResponseHandler_1.GraphResponseHandler.getResponse(rawResponse, this._responseType, callback)];
                    case 3:
                        response = _b.sent();
                        return [2 /*return*/, response];
                    case 4:
                        error_1 = _b.sent();
                        if (error_1 instanceof GraphClientError_1.GraphClientError) {
                            throw error_1;
                        }
                        statusCode = void 0;
                        if (rawResponse) {
                            statusCode = rawResponse.status;
                        }
                        return [4 /*yield*/, GraphErrorHandler_1.GraphErrorHandler.getError(error_1, statusCode, callback)];
                    case 5:
                        gError = _b.sent();
                        throw gError;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @private
     * Checks if the content-type is present in the _headers property. If not present, defaults the content-type to application/json
     * @param none
     * @returns nothing
     */
    GraphRequest.prototype.setHeaderContentType = function () {
        if (!this._headers) {
            this.header("Content-Type", "application/json");
            return;
        }
        var headerKeys = Object.keys(this._headers);
        for (var _i = 0, headerKeys_1 = headerKeys; _i < headerKeys_1.length; _i++) {
            var headerKey = headerKeys_1[_i];
            if (headerKey.toLowerCase() === "content-type") {
                return;
            }
        }
        // Default the content-type to application/json in case the content-type is not present in the header
        this.header("Content-Type", "application/json");
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
     * @param {KeyValuePairObjectStringNumber | HeadersInit} headers - The request headers
     * @returns The same GraphRequest instance that is being called with
     */
    GraphRequest.prototype.headers = function (headers) {
        for (var key in headers) {
            if (Object.prototype.hasOwnProperty.call(headers, key)) {
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
            if (Object.prototype.hasOwnProperty.call(options, key)) {
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
     * @returns The same GraphRequest instance that is being called with, after adding the properties for $select query
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
     * @returns The same GraphRequest instance that is being called with, after adding the properties for $expand query
     */
    GraphRequest.prototype.expand = function (properties) {
        this.addCsvQueryParameter("$expand", properties, arguments);
        return this;
    };
    /**
     * @public
     * To add properties for orderby OData Query param
     * @param {string|string[]} properties - The Properties value
     * @returns The same GraphRequest instance that is being called with, after adding the properties for $orderby query
     */
    GraphRequest.prototype.orderby = function (properties) {
        this.addCsvQueryParameter("$orderby", properties, arguments);
        return this;
    };
    /**
     * @public
     * To add query string for filter OData Query param. The request URL accepts only one $filter Odata Query option and its value is set to the most recently passed filter query string.
     * @param {string} filterStr - The filter query string
     * @returns The same GraphRequest instance that is being called with, after adding the $filter query
     */
    GraphRequest.prototype.filter = function (filterStr) {
        this.urlComponents.oDataQueryParams.$filter = filterStr;
        return this;
    };
    /**
     * @public
     * To add criterion for search OData Query param. The request URL accepts only one $search Odata Query option and its value is set to the most recently passed search criterion string.
     * @param {string} searchStr - The search criterion string
     * @returns The same GraphRequest instance that is being called with, after adding the $search query criteria
     */
    GraphRequest.prototype.search = function (searchStr) {
        this.urlComponents.oDataQueryParams.$search = searchStr;
        return this;
    };
    /**
     * @public
     * To add number for top OData Query param. The request URL accepts only one $top Odata Query option and its value is set to the most recently passed number value.
     * @param {number} n - The number value
     * @returns The same GraphRequest instance that is being called with, after adding the number for $top query
     */
    GraphRequest.prototype.top = function (n) {
        this.urlComponents.oDataQueryParams.$top = n;
        return this;
    };
    /**
     * @public
     * To add number for skip OData Query param. The request URL accepts only one $skip Odata Query option and its value is set to the most recently passed number value.
     * @param {number} n - The number value
     * @returns The same GraphRequest instance that is being called with, after adding the number for the $skip query
     */
    GraphRequest.prototype.skip = function (n) {
        this.urlComponents.oDataQueryParams.$skip = n;
        return this;
    };
    /**
     * @public
     * To add token string for skipToken OData Query param. The request URL accepts only one $skipToken Odata Query option and its value is set to the most recently passed token value.
     * @param {string} token - The token value
     * @returns The same GraphRequest instance that is being called with, after adding the token string for $skipToken query option
     */
    GraphRequest.prototype.skipToken = function (token) {
        this.urlComponents.oDataQueryParams.$skipToken = token;
        return this;
    };
    /**
     * @public
     * To add boolean for count OData Query param. The URL accepts only one $count Odata Query option and its value is set to the most recently passed boolean value.
     * @param {boolean} isCount - The count boolean
     * @returns The same GraphRequest instance that is being called with, after adding the boolean value for the $count query option
     */
    GraphRequest.prototype.count = function (isCount) {
        if (isCount === void 0) { isCount = true; }
        this.urlComponents.oDataQueryParams.$count = isCount.toString();
        return this;
    };
    /**
     * @public
     * Appends query string to the urlComponent
     * @param {string|KeyValuePairObjectStringNumber} queryDictionaryOrString - The query value
     * @returns The same GraphRequest instance that is being called with, after appending the query string to the url component
     */
    /*
     * Accepts .query("displayName=xyz")
     *     and .select({ name: "value" })
     */
    GraphRequest.prototype.query = function (queryDictionaryOrString) {
        return this.parseQueryParameter(queryDictionaryOrString);
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
            var url, options, response;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = this.buildFullUrl();
                        options = {
                            method: RequestMethod_1.RequestMethod.GET,
                        };
                        return [4 /*yield*/, this.send(url, options, callback)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response];
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
            var url, options, className;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = this.buildFullUrl();
                        options = {
                            method: RequestMethod_1.RequestMethod.POST,
                            body: GraphRequestUtil_1.serializeContent(content),
                        };
                        className = content && content.constructor && content.constructor.name;
                        if (className === "FormData") {
                            // Content-Type headers should not be specified in case the of FormData type content
                            options.headers = {};
                        }
                        else {
                            this.setHeaderContentType();
                            options.headers = this._headers;
                        }
                        return [4 /*yield*/, this.send(url, options, callback)];
                    case 1: return [2 /*return*/, _a.sent()];
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
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.post(content, callback)];
                    case 1: return [2 /*return*/, _a.sent()];
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
            var url, options;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = this.buildFullUrl();
                        this.setHeaderContentType();
                        options = {
                            method: RequestMethod_1.RequestMethod.PUT,
                            body: GraphRequestUtil_1.serializeContent(content),
                        };
                        return [4 /*yield*/, this.send(url, options, callback)];
                    case 1: return [2 /*return*/, _a.sent()];
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
            var url, options;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = this.buildFullUrl();
                        this.setHeaderContentType();
                        options = {
                            method: RequestMethod_1.RequestMethod.PATCH,
                            body: GraphRequestUtil_1.serializeContent(content),
                        };
                        return [4 /*yield*/, this.send(url, options, callback)];
                    case 1: return [2 /*return*/, _a.sent()];
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
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.patch(content, callback)];
                    case 1: return [2 /*return*/, _a.sent()];
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
            var url, options;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = this.buildFullUrl();
                        options = {
                            method: RequestMethod_1.RequestMethod.DELETE,
                        };
                        return [4 /*yield*/, this.send(url, options, callback)];
                    case 1: return [2 /*return*/, _a.sent()];
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
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.delete(callback)];
                    case 1: return [2 /*return*/, _a.sent()];
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
            var url, options;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = this.buildFullUrl();
                        options = {
                            method: RequestMethod_1.RequestMethod.GET,
                        };
                        this.responseType(ResponseType_1.ResponseType.STREAM);
                        return [4 /*yield*/, this.send(url, options, callback)];
                    case 1: return [2 /*return*/, _a.sent()];
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
            var url, options;
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
                        return [4 /*yield*/, this.send(url, options, callback)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return GraphRequest;
}());
exports.GraphRequest = GraphRequest;
//# sourceMappingURL=GraphRequest.js.map

/***/ }),

/***/ 8784:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isCustomHost = exports.isGraphURL = exports.serializeContent = exports.urlJoin = exports.oDataQueryNames = void 0;
/**
 * @module GraphRequestUtil
 */
var Constants_1 = __nccwpck_require__(6078);
var GraphClientError_1 = __nccwpck_require__(1938);
/**
 * To hold list of OData query params
 */
exports.oDataQueryNames = ["$select", "$expand", "$orderby", "$filter", "$top", "$skip", "$skipToken", "$count"];
/**
 * To construct the URL by appending the segments with "/"
 * @param {string[]} urlSegments - The array of strings
 * @returns The constructed URL string
 */
var urlJoin = function (urlSegments) {
    var removePostSlash = function (s) { return s.replace(/\/+$/, ""); };
    var removePreSlash = function (s) { return s.replace(/^\/+/, ""); };
    var joiner = function (pre, cur) { return [removePostSlash(pre), removePreSlash(cur)].join("/"); };
    var parts = Array.prototype.slice.call(urlSegments);
    return parts.reduce(joiner);
};
exports.urlJoin = urlJoin;
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
var serializeContent = function (content) {
    var className = content && content.constructor && content.constructor.name;
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
exports.serializeContent = serializeContent;
/**
 * Checks if the url is one of the service root endpoints for Microsoft Graph and Graph Explorer.
 * @param {string} url - The url to be verified
 * @returns {boolean} - Returns true if the url is a Graph URL
 */
var isGraphURL = function (url) {
    return isValidEndpoint(url);
};
exports.isGraphURL = isGraphURL;
/**
 * Checks if the url is for one of the custom hosts provided during client initialization
 * @param {string} url - The url to be verified
 * @param {Set} customHosts - The url to be verified
 * @returns {boolean} - Returns true if the url is a for a custom host
 */
var isCustomHost = function (url, customHosts) {
    customHosts.forEach(function (host) { return isCustomHostValid(host); });
    return isValidEndpoint(url, customHosts);
};
exports.isCustomHost = isCustomHost;
/**
 * Checks if the url is for one of the provided hosts.
 * @param {string} url - The url to be verified
 * @param {Set<string>} allowedHosts - A set of hosts.
 * @returns {boolean} - Returns true is for one of the provided endpoints.
 */
var isValidEndpoint = function (url, allowedHosts) {
    if (allowedHosts === void 0) { allowedHosts = Constants_1.GRAPH_URLS; }
    // Valid Graph URL pattern - https://graph.microsoft.com/{version}/{resource}?{query-parameters}
    // Valid Graph URL example - https://graph.microsoft.com/v1.0/
    url = url.toLowerCase();
    if (url.indexOf("https://") !== -1) {
        url = url.replace("https://", "");
        // Find where the host ends
        var startofPortNoPos = url.indexOf(":");
        var endOfHostStrPos = url.indexOf("/");
        var hostName = "";
        if (endOfHostStrPos !== -1) {
            if (startofPortNoPos !== -1 && startofPortNoPos < endOfHostStrPos) {
                hostName = url.substring(0, startofPortNoPos);
                return allowedHosts.has(hostName);
            }
            // Parse out the host
            hostName = url.substring(0, endOfHostStrPos);
            return allowedHosts.has(hostName);
        }
    }
    return false;
};
/**
 * Throws error if the string is not a valid host/hostname and contains other url parts.
 * @param {string} url - The host to be verified
 */
var isCustomHostValid = function (host) {
    if (host.indexOf("/") !== -1) {
        throw new GraphClientError_1.GraphClientError("Please add only hosts or hostnames to the CustomHosts config. If the url is `http://example.com:3000/`, host is `example:3000`");
    }
};
//# sourceMappingURL=GraphRequestUtil.js.map

/***/ }),

/***/ 3298:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GraphResponseHandler = exports.DocumentType = void 0;
var tslib_1 = __nccwpck_require__(7331);
var ResponseType_1 = __nccwpck_require__(6903);
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
            var responseValue, contentType, _a, mimeType;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (rawResponse.status === 204) {
                            // NO CONTENT
                            return [2 /*return*/, Promise.resolve()];
                        }
                        contentType = rawResponse.headers.get("Content-type");
                        _a = responseType;
                        switch (_a) {
                            case ResponseType_1.ResponseType.ARRAYBUFFER: return [3 /*break*/, 1];
                            case ResponseType_1.ResponseType.BLOB: return [3 /*break*/, 3];
                            case ResponseType_1.ResponseType.DOCUMENT: return [3 /*break*/, 5];
                            case ResponseType_1.ResponseType.JSON: return [3 /*break*/, 7];
                            case ResponseType_1.ResponseType.STREAM: return [3 /*break*/, 9];
                            case ResponseType_1.ResponseType.TEXT: return [3 /*break*/, 11];
                        }
                        return [3 /*break*/, 13];
                    case 1: return [4 /*yield*/, rawResponse.arrayBuffer()];
                    case 2:
                        responseValue = _b.sent();
                        return [3 /*break*/, 24];
                    case 3: return [4 /*yield*/, rawResponse.blob()];
                    case 4:
                        responseValue = _b.sent();
                        return [3 /*break*/, 24];
                    case 5: return [4 /*yield*/, GraphResponseHandler.parseDocumentResponse(rawResponse, DocumentType.TEXT_XML)];
                    case 6:
                        responseValue = _b.sent();
                        return [3 /*break*/, 24];
                    case 7: return [4 /*yield*/, rawResponse.json()];
                    case 8:
                        responseValue = _b.sent();
                        return [3 /*break*/, 24];
                    case 9: return [4 /*yield*/, Promise.resolve(rawResponse.body)];
                    case 10:
                        responseValue = _b.sent();
                        return [3 /*break*/, 24];
                    case 11: return [4 /*yield*/, rawResponse.text()];
                    case 12:
                        responseValue = _b.sent();
                        return [3 /*break*/, 24];
                    case 13:
                        if (!(contentType !== null)) return [3 /*break*/, 22];
                        mimeType = contentType.split(";")[0];
                        if (!new RegExp(ContentTypeRegexStr.DOCUMENT).test(mimeType)) return [3 /*break*/, 15];
                        return [4 /*yield*/, GraphResponseHandler.parseDocumentResponse(rawResponse, mimeType)];
                    case 14:
                        responseValue = _b.sent();
                        return [3 /*break*/, 21];
                    case 15:
                        if (!new RegExp(ContentTypeRegexStr.IMAGE).test(mimeType)) return [3 /*break*/, 16];
                        responseValue = rawResponse.blob();
                        return [3 /*break*/, 21];
                    case 16:
                        if (!(mimeType === ContentType.TEXT_PLAIN)) return [3 /*break*/, 18];
                        return [4 /*yield*/, rawResponse.text()];
                    case 17:
                        responseValue = _b.sent();
                        return [3 /*break*/, 21];
                    case 18:
                        if (!(mimeType === ContentType.APPLICATION_JSON)) return [3 /*break*/, 20];
                        return [4 /*yield*/, rawResponse.json()];
                    case 19:
                        responseValue = _b.sent();
                        return [3 /*break*/, 21];
                    case 20:
                        responseValue = Promise.resolve(rawResponse.body);
                        _b.label = 21;
                    case 21: return [3 /*break*/, 23];
                    case 22:
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
                        _b.label = 23;
                    case 23: return [3 /*break*/, 24];
                    case 24: return [2 /*return*/, responseValue];
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
            var response;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
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
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return GraphResponseHandler;
}());
exports.GraphResponseHandler = GraphResponseHandler;
//# sourceMappingURL=GraphResponseHandler.js.map

/***/ }),

/***/ 6255:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HTTPClient = void 0;
var tslib_1 = __nccwpck_require__(7331);
/**
 * @class
 * Class representing HTTPClient
 */
var HTTPClient = /** @class */ (function () {
    /**
     * @public
     * @constructor
     * Creates an instance of a HTTPClient
     * @param {...Middleware} middleware - The first middleware of the middleware chain or a sequence of all the Middleware handlers
     */
    function HTTPClient() {
        var middleware = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            middleware[_i] = arguments[_i];
        }
        if (!middleware || !middleware.length) {
            var error = new Error();
            error.name = "InvalidMiddlewareChain";
            error.message = "Please provide a default middleware chain or custom middleware chain";
            throw error;
        }
        this.setMiddleware.apply(this, middleware);
    }
    /**
     * @private
     * Processes the middleware parameter passed to set this.middleware property
     * The calling function should validate if middleware is not undefined or not empty.
     * @param {...Middleware} middleware - The middleware passed
     * @returns Nothing
     */
    HTTPClient.prototype.setMiddleware = function () {
        var middleware = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            middleware[_i] = arguments[_i];
        }
        if (middleware.length > 1) {
            this.parseMiddleWareArray(middleware);
        }
        else {
            this.middleware = middleware[0];
        }
    };
    /**
     * @private
     * Processes the middleware array to construct the chain
     * and sets this.middleware property to the first middlware handler of the array
     * The calling function should validate if middleware is not undefined or not empty
     * @param {Middleware[]} middlewareArray - The array of middleware handlers
     * @returns Nothing
     */
    HTTPClient.prototype.parseMiddleWareArray = function (middlewareArray) {
        middlewareArray.forEach(function (element, index) {
            if (index < middlewareArray.length - 1) {
                element.setNext(middlewareArray[index + 1]);
            }
        });
        this.middleware = middlewareArray[0];
    };
    /**
     * @public
     * @async
     * To send the request through the middleware chain
     * @param {Context} context - The context of a request
     * @returns A promise that resolves to the Context
     */
    HTTPClient.prototype.sendRequest = function (context) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var error;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
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
                }
            });
        });
    };
    return HTTPClient;
}());
exports.HTTPClient = HTTPClient;
//# sourceMappingURL=HTTPClient.js.map

/***/ }),

/***/ 113:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HTTPClientFactory = void 0;
var tslib_1 = __nccwpck_require__(7331);
/**
 * @module HTTPClientFactory
 */
var HTTPClient_1 = __nccwpck_require__(6255);
var AuthenticationHandler_1 = __nccwpck_require__(431);
var HTTPMessageHandler_1 = __nccwpck_require__(7185);
var RedirectHandlerOptions_1 = __nccwpck_require__(1573);
var RetryHandlerOptions_1 = __nccwpck_require__(3089);
var RedirectHandler_1 = __nccwpck_require__(7373);
var RetryHandler_1 = __nccwpck_require__(4822);
var TelemetryHandler_1 = __nccwpck_require__(567);
/**
 * @private
 * To check whether the environment is node or not
 * @returns A boolean representing the environment is node or not
 */
var isNodeEnvironment = function () {
    return typeof process === "object" && "function" === "function";
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
     * @property {...Middleware} middleware - The first middleware of the middleware chain or a sequence of all the Middleware handlers
     * @returns A HTTPClient instance
     */
    HTTPClientFactory.createWithMiddleware = function () {
        var middleware = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            middleware[_i] = arguments[_i];
        }
        // Middleware should not empty or undefined. This is check is present in the HTTPClient constructor.
        return new (HTTPClient_1.HTTPClient.bind.apply(HTTPClient_1.HTTPClient, tslib_1.__spreadArray([void 0], middleware)))();
    };
    return HTTPClientFactory;
}());
exports.HTTPClientFactory = HTTPClientFactory;
//# sourceMappingURL=HTTPClientFactory.js.map

/***/ }),

/***/ 6872:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=IAuthProvider.js.map

/***/ }),

/***/ 8792:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=IAuthProviderCallback.js.map

/***/ }),

/***/ 544:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=IAuthenticationProvider.js.map

/***/ }),

/***/ 5791:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=IAuthenticationProviderOptions.js.map

/***/ }),

/***/ 1124:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=IClientOptions.js.map

/***/ }),

/***/ 9942:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=IContext.js.map

/***/ }),

/***/ 8123:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=IFetchOptions.js.map

/***/ }),

/***/ 3481:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=IGraphRequestCallback.js.map

/***/ }),

/***/ 9044:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=IOptions.js.map

/***/ }),

/***/ 2635:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RequestMethod = void 0;
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

/***/ 6903:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ResponseType = void 0;
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

/***/ 5195:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.validatePolyFilling = void 0;
/**
 * @constant
 * @function
 * Validates availability of Promise and fetch in global context
 * @returns The true in case the Promise and fetch available, otherwise throws error
 */
var validatePolyFilling = function () {
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
exports.validatePolyFilling = validatePolyFilling;
//# sourceMappingURL=ValidatePolyFilling.js.map

/***/ }),

/***/ 3533:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PACKAGE_VERSION = void 0;
// THIS FILE IS AUTO GENERATED
// ANY CHANGES WILL BE LOST DURING BUILD
/**
 * @module Version
 */
exports.PACKAGE_VERSION = "3.0.0";
//# sourceMappingURL=Version.js.map

/***/ }),

/***/ 3291:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BatchRequestContent = void 0;
var tslib_1 = __nccwpck_require__(7331);
/**
 * @module BatchRequestContent
 */
var RequestMethod_1 = __nccwpck_require__(2635);
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
                         * @see{@https://tools.ietf.org/html/rfc7578#section-4.4}
                         * TODO- Setting/Defaulting of content-type header to the correct value
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

/***/ 5070:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BatchResponseContent = void 0;
var tslib_1 = __nccwpck_require__(7331);
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

/***/ 9989:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
var tslib_1 = __nccwpck_require__(7331);
tslib_1.__exportStar(__nccwpck_require__(3291), exports);
tslib_1.__exportStar(__nccwpck_require__(5070), exports);
tslib_1.__exportStar(__nccwpck_require__(431), exports);
tslib_1.__exportStar(__nccwpck_require__(7185), exports);
tslib_1.__exportStar(__nccwpck_require__(1977), exports);
tslib_1.__exportStar(__nccwpck_require__(4822), exports);
tslib_1.__exportStar(__nccwpck_require__(7373), exports);
tslib_1.__exportStar(__nccwpck_require__(567), exports);
tslib_1.__exportStar(__nccwpck_require__(6989), exports);
tslib_1.__exportStar(__nccwpck_require__(4589), exports);
tslib_1.__exportStar(__nccwpck_require__(2184), exports);
tslib_1.__exportStar(__nccwpck_require__(3089), exports);
tslib_1.__exportStar(__nccwpck_require__(1573), exports);
tslib_1.__exportStar(__nccwpck_require__(2452), exports);
tslib_1.__exportStar(__nccwpck_require__(3561), exports);
tslib_1.__exportStar(__nccwpck_require__(290), exports);
tslib_1.__exportStar(__nccwpck_require__(5348), exports);
tslib_1.__exportStar(__nccwpck_require__(9064), exports);
tslib_1.__exportStar(__nccwpck_require__(7676), exports);
tslib_1.__exportStar(__nccwpck_require__(6926), exports);
tslib_1.__exportStar(__nccwpck_require__(8703), exports);
tslib_1.__exportStar(__nccwpck_require__(9415), exports);
tslib_1.__exportStar(__nccwpck_require__(8703), exports);
tslib_1.__exportStar(__nccwpck_require__(7942), exports);
tslib_1.__exportStar(__nccwpck_require__(2264), exports);
tslib_1.__exportStar(__nccwpck_require__(8452), exports);
tslib_1.__exportStar(__nccwpck_require__(4989), exports);
tslib_1.__exportStar(__nccwpck_require__(5226), exports);
tslib_1.__exportStar(__nccwpck_require__(2013), exports);
tslib_1.__exportStar(__nccwpck_require__(9260), exports);
tslib_1.__exportStar(__nccwpck_require__(1938), exports);
tslib_1.__exportStar(__nccwpck_require__(1844), exports);
tslib_1.__exportStar(__nccwpck_require__(6872), exports);
tslib_1.__exportStar(__nccwpck_require__(544), exports);
tslib_1.__exportStar(__nccwpck_require__(5791), exports);
tslib_1.__exportStar(__nccwpck_require__(8792), exports);
tslib_1.__exportStar(__nccwpck_require__(1124), exports);
tslib_1.__exportStar(__nccwpck_require__(9942), exports);
tslib_1.__exportStar(__nccwpck_require__(8123), exports);
tslib_1.__exportStar(__nccwpck_require__(3481), exports);
tslib_1.__exportStar(__nccwpck_require__(9044), exports);
tslib_1.__exportStar(__nccwpck_require__(6903), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 431:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthenticationHandler = void 0;
var tslib_1 = __nccwpck_require__(7331);
/**
 * @module AuthenticationHandler
 */
var GraphRequestUtil_1 = __nccwpck_require__(8784);
var MiddlewareControl_1 = __nccwpck_require__(6559);
var MiddlewareUtil_1 = __nccwpck_require__(497);
var AuthenticationHandlerOptions_1 = __nccwpck_require__(4589);
var TelemetryHandlerOptions_1 = __nccwpck_require__(2452);
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
            var url, options, authenticationProvider, authenticationProviderOptions, token, bearerKey;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = typeof context.request === "string" ? context.request : context.request.url;
                        if (!(GraphRequestUtil_1.isGraphURL(url) || (context.customHosts && GraphRequestUtil_1.isCustomHost(url, context.customHosts)))) return [3 /*break*/, 2];
                        options = void 0;
                        if (context.middlewareControl instanceof MiddlewareControl_1.MiddlewareControl) {
                            options = context.middlewareControl.getMiddlewareOptions(AuthenticationHandlerOptions_1.AuthenticationHandlerOptions);
                        }
                        authenticationProvider = void 0;
                        authenticationProviderOptions = void 0;
                        if (options) {
                            authenticationProvider = options.authenticationProvider;
                            authenticationProviderOptions = options.authenticationProviderOptions;
                        }
                        if (!authenticationProvider) {
                            authenticationProvider = this.authenticationProvider;
                        }
                        return [4 /*yield*/, authenticationProvider.getAccessToken(authenticationProviderOptions)];
                    case 1:
                        token = _a.sent();
                        bearerKey = "Bearer " + token;
                        MiddlewareUtil_1.appendRequestHeader(context.request, context.options, AuthenticationHandler.AUTHORIZATION_HEADER, bearerKey);
                        TelemetryHandlerOptions_1.TelemetryHandlerOptions.updateFeatureUsageFlag(context, TelemetryHandlerOptions_1.FeatureUsageFlag.AUTHENTICATION_HANDLER_ENABLED);
                        return [3 /*break*/, 3];
                    case 2:
                        if (context.options.headers) {
                            delete context.options.headers[AuthenticationHandler.AUTHORIZATION_HEADER];
                        }
                        _a.label = 3;
                    case 3: return [4 /*yield*/, this.nextMiddleware.execute(context)];
                    case 4: return [2 /*return*/, _a.sent()];
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

/***/ 5348:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ChaosHandler = void 0;
var tslib_1 = __nccwpck_require__(7331);
var MiddlewareControl_1 = __nccwpck_require__(6559);
var MiddlewareUtil_1 = __nccwpck_require__(497);
var ChaosHandlerData_1 = __nccwpck_require__(9820);
var ChaosHandlerOptions_1 = __nccwpck_require__(3561);
var ChaosStrategy_1 = __nccwpck_require__(290);
/**
 * Class representing ChaosHandler
 * @class
 * Class
 * @implements Middleware
 */
var ChaosHandler = /** @class */ (function () {
    /**
     * @public
     * @constructor
     * To create an instance of Testing Handler
     * @param {ChaosHandlerOptions} [options = new ChaosHandlerOptions()] - The testing handler options instance
     * @param manualMap - The Map passed by user containing url-statusCode info
     * @returns An instance of Testing Handler
     */
    function ChaosHandler(options, manualMap) {
        if (options === void 0) { options = new ChaosHandlerOptions_1.ChaosHandlerOptions(); }
        this.options = options;
        this.manualMap = manualMap;
    }
    /**
     * Generates responseHeader
     * @private
     * @param {ChaosHandlerOptions} chaosHandlerOptions - The ChaosHandlerOptions object
     * @param {string} requestID - request id
     * @param {string} requestDate - date of the request
     * @returns response Header
     */
    ChaosHandler.prototype.createResponseHeaders = function (chaosHandlerOptions, requestID, requestDate) {
        var responseHeader = chaosHandlerOptions.headers ? new Headers(chaosHandlerOptions.headers) : new Headers();
        responseHeader.append("Cache-Control", "no-store");
        responseHeader.append("request-id", requestID);
        responseHeader.append("client-request-id", requestID);
        responseHeader.append("x-ms-ags-diagnostic", "");
        responseHeader.append("Date", requestDate);
        responseHeader.append("Strict-Transport-Security", "");
        if (chaosHandlerOptions.statusCode === 429) {
            // throttling case has to have a timeout scenario
            responseHeader.append("retry-after", "3");
        }
        return responseHeader;
    };
    /**
     * Generates responseBody
     * @private
     * @param {ChaosHandlerOptions} options - The ChaosHandlerOptions object
     * @param {string} requestID - request id
     * @param {string} requestDate - date of the request
     *  * @returns response body
     */
    ChaosHandler.prototype.createResponseBody = function (chaosHandlerOptions, requestID, requestDate) {
        if (chaosHandlerOptions.responseBody) {
            return chaosHandlerOptions.responseBody;
        }
        var body;
        if (chaosHandlerOptions.statusCode >= 400) {
            var codeMessage = ChaosHandlerData_1.httpStatusCode[chaosHandlerOptions.statusCode];
            var errMessage = chaosHandlerOptions.statusMessage;
            body = {
                error: {
                    code: codeMessage,
                    message: errMessage,
                    innerError: {
                        "request-id": requestID,
                        date: requestDate,
                    },
                },
            };
        }
        else {
            body = {};
        }
        return body;
    };
    /**
     * creates a response
     * @private
     * @param {ChaosHandlerOptions} ChaosHandlerOptions - The ChaosHandlerOptions object
     * @param {Context} context - Contains the context of the request
     */
    ChaosHandler.prototype.createResponse = function (chaosHandlerOptions, context) {
        var requestURL = context.request;
        var requestID = MiddlewareUtil_1.generateUUID();
        var requestDate = new Date();
        var responseHeader = this.createResponseHeaders(chaosHandlerOptions, requestID, requestDate.toString());
        var responseBody = this.createResponseBody(chaosHandlerOptions, requestID, requestDate.toString());
        var init = { url: requestURL, status: chaosHandlerOptions.statusCode, statusText: chaosHandlerOptions.statusMessage, headers: responseHeader };
        context.response = new Response(typeof responseBody === "string" ? responseBody : JSON.stringify(responseBody), init);
    };
    /**
     * Decides whether to send the request to the graph or not
     * @private
     * @param {ChaosHandlerOptions} chaosHandlerOptions - A ChaosHandlerOptions object
     * @param {Context} context - Contains the context of the request
     * @returns nothing
     */
    ChaosHandler.prototype.sendRequest = function (chaosHandlerOptions, context) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.setStatusCode(chaosHandlerOptions, context.request, context.options.method);
                        if (!((chaosHandlerOptions.chaosStrategy === ChaosStrategy_1.ChaosStrategy.MANUAL && !this.nextMiddleware) || Math.floor(Math.random() * 100) < chaosHandlerOptions.chaosPercentage)) return [3 /*break*/, 1];
                        this.createResponse(chaosHandlerOptions, context);
                        return [3 /*break*/, 3];
                    case 1:
                        if (!this.nextMiddleware) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.nextMiddleware.execute(context)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fetches a random status code for the RANDOM mode from the predefined array
     * @private
     * @param {string} requestMethod - the API method for the request
     * @returns a random status code from a given set of status codes
     */
    ChaosHandler.prototype.getRandomStatusCode = function (requestMethod) {
        var statusCodeArray = ChaosHandlerData_1.methodStatusCode[requestMethod];
        return statusCodeArray[Math.floor(Math.random() * statusCodeArray.length)];
    };
    /**
     * To fetch the relative URL out of the complete URL using a predefined regex pattern
     * @private
     * @param {string} urlMethod - the complete URL
     * @returns the string as relative URL
     */
    ChaosHandler.prototype.getRelativeURL = function (urlMethod) {
        var pattern = /https?:\/\/graph\.microsoft\.com\/[^/]+(.+?)(\?|$)/;
        var relativeURL;
        if (pattern.exec(urlMethod) !== null) {
            relativeURL = pattern.exec(urlMethod)[1];
        }
        return relativeURL;
    };
    /**
     * To fetch the status code from the map(if needed), then returns response by calling createResponse
     * @private
     * @param {ChaosHandlerOptions} ChaosHandlerOptions - The ChaosHandlerOptions object
     * @param {string} requestURL - the URL for the request
     * @param {string} requestMethod - the API method for the request
     */
    ChaosHandler.prototype.setStatusCode = function (chaosHandlerOptions, requestURL, requestMethod) {
        var _this = this;
        if (chaosHandlerOptions.chaosStrategy === ChaosStrategy_1.ChaosStrategy.MANUAL) {
            if (chaosHandlerOptions.statusCode === undefined) {
                // manual mode with no status code, can be a global level or request level without statusCode
                var relativeURL_1 = this.getRelativeURL(requestURL);
                if (this.manualMap.get(relativeURL_1) !== undefined) {
                    // checking Manual Map for exact match
                    if (this.manualMap.get(relativeURL_1).get(requestMethod) !== undefined) {
                        chaosHandlerOptions.statusCode = this.manualMap.get(relativeURL_1).get(requestMethod);
                    }
                    // else statusCode would be undefined
                }
                else {
                    // checking for regex match if exact match doesn't work
                    this.manualMap.forEach(function (value, key) {
                        var regexURL = new RegExp(key + "$");
                        if (regexURL.test(relativeURL_1)) {
                            if (_this.manualMap.get(key).get(requestMethod) !== undefined) {
                                chaosHandlerOptions.statusCode = _this.manualMap.get(key).get(requestMethod);
                            }
                            // else statusCode would be undefined
                        }
                    });
                }
                // Case of redirection or request url not in map ---> statusCode would be undefined
            }
        }
        else {
            // Handling the case of Random here
            chaosHandlerOptions.statusCode = this.getRandomStatusCode(requestMethod);
            // else statusCode would be undefined
        }
    };
    /**
     * To get the options for execution of the middleware
     * @private
     * @param {Context} context - The context object
     * @returns options for middleware execution
     */
    ChaosHandler.prototype.getOptions = function (context) {
        var options;
        if (context.middlewareControl instanceof MiddlewareControl_1.MiddlewareControl) {
            options = context.middlewareControl.getMiddlewareOptions(ChaosHandlerOptions_1.ChaosHandlerOptions);
        }
        if (typeof options === "undefined") {
            options = Object.assign(new ChaosHandlerOptions_1.ChaosHandlerOptions(), this.options);
        }
        return options;
    };
    /**
     * To execute the current middleware
     * @public
     * @async
     * @param {Context} context - The context object of the request
     * @returns A Promise that resolves to nothing
     */
    ChaosHandler.prototype.execute = function (context) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var chaosHandlerOptions;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        chaosHandlerOptions = this.getOptions(context);
                        return [4 /*yield*/, this.sendRequest(chaosHandlerOptions, context)];
                    case 1: return [2 /*return*/, _a.sent()];
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
    ChaosHandler.prototype.setNext = function (next) {
        this.nextMiddleware = next;
    };
    return ChaosHandler;
}());
exports.ChaosHandler = ChaosHandler;
//# sourceMappingURL=ChaosHandler.js.map

/***/ }),

/***/ 7185:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HTTPMessageHandler = void 0;
var tslib_1 = __nccwpck_require__(7331);
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
            var _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = context;
                        return [4 /*yield*/, fetch(context.request, context.options)];
                    case 1:
                        _a.response = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return HTTPMessageHandler;
}());
exports.HTTPMessageHandler = HTTPMessageHandler;
//# sourceMappingURL=HTTPMessageHandler.js.map

/***/ }),

/***/ 1977:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=IMiddleware.js.map

/***/ }),

/***/ 6559:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MiddlewareControl = void 0;
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
    MiddlewareControl.prototype.setMiddlewareOptions = function (fn, option) {
        this.middlewareOptions.set(fn, option);
    };
    return MiddlewareControl;
}());
exports.MiddlewareControl = MiddlewareControl;
//# sourceMappingURL=MiddlewareControl.js.map

/***/ }),

/***/ 6989:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MiddlewareFactory = void 0;
var AuthenticationHandler_1 = __nccwpck_require__(431);
var HTTPMessageHandler_1 = __nccwpck_require__(7185);
var RedirectHandlerOptions_1 = __nccwpck_require__(1573);
var RetryHandlerOptions_1 = __nccwpck_require__(3089);
var RedirectHandler_1 = __nccwpck_require__(7373);
var RetryHandler_1 = __nccwpck_require__(4822);
var TelemetryHandler_1 = __nccwpck_require__(567);
/**
 * @private
 * To check whether the environment is node or not
 * @returns A boolean representing the environment is node or not
 */
var isNodeEnvironment = function () {
    return typeof process === "object" && "function" === "function";
};
/**
 * @class
 * Class containing function(s) related to the middleware pipelines.
 */
var MiddlewareFactory = /** @class */ (function () {
    function MiddlewareFactory() {
    }
    /**
     * @public
     * @static
     * Returns the default middleware chain an array with the  middleware handlers
     * @param {AuthenticationProvider} authProvider - The authentication provider instance
     * @returns an array of the middleware handlers of the default middleware chain
     */
    MiddlewareFactory.getDefaultMiddlewareChain = function (authProvider) {
        var middleware = [];
        var authenticationHandler = new AuthenticationHandler_1.AuthenticationHandler(authProvider);
        var retryHandler = new RetryHandler_1.RetryHandler(new RetryHandlerOptions_1.RetryHandlerOptions());
        var telemetryHandler = new TelemetryHandler_1.TelemetryHandler();
        var httpMessageHandler = new HTTPMessageHandler_1.HTTPMessageHandler();
        middleware.push(authenticationHandler);
        middleware.push(retryHandler);
        if (isNodeEnvironment()) {
            var redirectHandler = new RedirectHandler_1.RedirectHandler(new RedirectHandlerOptions_1.RedirectHandlerOptions());
            middleware.push(redirectHandler);
        }
        middleware.push(telemetryHandler);
        middleware.push(httpMessageHandler);
        return middleware;
    };
    return MiddlewareFactory;
}());
exports.MiddlewareFactory = MiddlewareFactory;
//# sourceMappingURL=MiddlewareFactory.js.map

/***/ }),

/***/ 497:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.cloneRequestWithNewUrl = exports.appendRequestHeader = exports.setRequestHeader = exports.getRequestHeader = exports.generateUUID = void 0;
var tslib_1 = __nccwpck_require__(7331);
/**
 * @constant
 * To generate the UUID
 * @returns The UUID string
 */
var generateUUID = function () {
    var uuid = "";
    for (var j = 0; j < 32; j++) {
        if (j === 8 || j === 12 || j === 16 || j === 20) {
            uuid += "-";
        }
        uuid += Math.floor(Math.random() * 16).toString(16);
    }
    return uuid;
};
exports.generateUUID = generateUUID;
/**
 * @constant
 * To get the request header from the request
 * @param {RequestInfo} request - The request object or the url string
 * @param {FetchOptions|undefined} options - The request options object
 * @param {string} key - The header key string
 * @returns A header value for the given key from the request
 */
var getRequestHeader = function (request, options, key) {
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
exports.getRequestHeader = getRequestHeader;
/**
 * @constant
 * To set the header value to the given request
 * @param {RequestInfo} request - The request object or the url string
 * @param {FetchOptions|undefined} options - The request options object
 * @param {string} key - The header key string
 * @param {string } value - The header value string
 * @returns Nothing
 */
var setRequestHeader = function (request, options, key, value) {
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
exports.setRequestHeader = setRequestHeader;
/**
 * @constant
 * To append the header value to the given request
 * @param {RequestInfo} request - The request object or the url string
 * @param {FetchOptions|undefined} options - The request options object
 * @param {string} key - The header key string
 * @param {string } value - The header value string
 * @returns Nothing
 */
var appendRequestHeader = function (request, options, key, value) {
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
exports.appendRequestHeader = appendRequestHeader;
/**
 * @constant
 * To clone the request with the new url
 * @param {string} url - The new url string
 * @param {Request} request - The request object
 * @returns A promise that resolves to request object
 */
var cloneRequestWithNewUrl = function (newUrl, request) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
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
exports.cloneRequestWithNewUrl = cloneRequestWithNewUrl;
//# sourceMappingURL=MiddlewareUtil.js.map

/***/ }),

/***/ 7373:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RedirectHandler = void 0;
var tslib_1 = __nccwpck_require__(7331);
var RequestMethod_1 = __nccwpck_require__(2635);
var MiddlewareControl_1 = __nccwpck_require__(6559);
var MiddlewareUtil_1 = __nccwpck_require__(497);
var RedirectHandlerOptions_1 = __nccwpck_require__(1573);
var TelemetryHandlerOptions_1 = __nccwpck_require__(2452);
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
            var response, redirectUrl;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.nextMiddleware.execute(context)];
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
                            delete context.options.headers[RedirectHandler.AUTHORIZATION_HEADER];
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
    RedirectHandler.prototype.execute = function (context) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var redirectCount, options;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        redirectCount = 0;
                        options = this.getOptions(context);
                        context.options.redirect = RedirectHandler.MANUAL_REDIRECT;
                        TelemetryHandlerOptions_1.TelemetryHandlerOptions.updateFeatureUsageFlag(context, TelemetryHandlerOptions_1.FeatureUsageFlag.REDIRECT_HANDLER_ENABLED);
                        return [4 /*yield*/, this.executeWithRedirect(context, redirectCount, options)];
                    case 1: return [2 /*return*/, _a.sent()];
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
        308, // Moved Permanently
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

/***/ 4822:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RetryHandler = void 0;
var tslib_1 = __nccwpck_require__(7331);
var RequestMethod_1 = __nccwpck_require__(2635);
var MiddlewareControl_1 = __nccwpck_require__(6559);
var MiddlewareUtil_1 = __nccwpck_require__(497);
var RetryHandlerOptions_1 = __nccwpck_require__(3089);
var TelemetryHandlerOptions_1 = __nccwpck_require__(2452);
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
            if (Number.isNaN(Number(retryAfter))) {
                newDelay = Math.round((new Date(retryAfter).getTime() - Date.now()) / 1000);
            }
            else {
                newDelay = Number(retryAfter);
            }
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
            var delay;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.nextMiddleware.execute(context)];
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
            var retryAttempts, options;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        retryAttempts = 0;
                        options = this.getOptions(context);
                        TelemetryHandlerOptions_1.TelemetryHandlerOptions.updateFeatureUsageFlag(context, TelemetryHandlerOptions_1.FeatureUsageFlag.RETRY_HANDLER_ENABLED);
                        return [4 /*yield*/, this.executeWithRetry(context, retryAttempts, options)];
                    case 1: return [2 /*return*/, _a.sent()];
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
        504, // Gateway timeout
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

/***/ 567:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TelemetryHandler = void 0;
var tslib_1 = __nccwpck_require__(7331);
/**
 * @module TelemetryHandler
 */
var GraphRequestUtil_1 = __nccwpck_require__(8784);
var Version_1 = __nccwpck_require__(3533);
var MiddlewareControl_1 = __nccwpck_require__(6559);
var MiddlewareUtil_1 = __nccwpck_require__(497);
var TelemetryHandlerOptions_1 = __nccwpck_require__(2452);
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
            var url, clientRequestId, sdkVersionValue, options, featureUsage;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = typeof context.request === "string" ? context.request : context.request.url;
                        if (GraphRequestUtil_1.isGraphURL(url) || (context.customHosts && GraphRequestUtil_1.isCustomHost(url, context.customHosts))) {
                            clientRequestId = MiddlewareUtil_1.getRequestHeader(context.request, context.options, TelemetryHandler.CLIENT_REQUEST_ID_HEADER);
                            if (!clientRequestId) {
                                clientRequestId = MiddlewareUtil_1.generateUUID();
                                MiddlewareUtil_1.setRequestHeader(context.request, context.options, TelemetryHandler.CLIENT_REQUEST_ID_HEADER, clientRequestId);
                            }
                            sdkVersionValue = TelemetryHandler.PRODUCT_NAME + "/" + Version_1.PACKAGE_VERSION;
                            options = void 0;
                            if (context.middlewareControl instanceof MiddlewareControl_1.MiddlewareControl) {
                                options = context.middlewareControl.getMiddlewareOptions(TelemetryHandlerOptions_1.TelemetryHandlerOptions);
                            }
                            if (options) {
                                featureUsage = options.getFeatureUsage();
                                sdkVersionValue += " (" + TelemetryHandler.FEATURE_USAGE_STRING + "=" + featureUsage + ")";
                            }
                            MiddlewareUtil_1.appendRequestHeader(context.request, context.options, TelemetryHandler.SDK_VERSION_HEADER, sdkVersionValue);
                        }
                        else {
                            // Remove telemetry headers if present during redirection.
                            delete context.options.headers[TelemetryHandler.CLIENT_REQUEST_ID_HEADER];
                            delete context.options.headers[TelemetryHandler.SDK_VERSION_HEADER];
                        }
                        return [4 /*yield*/, this.nextMiddleware.execute(context)];
                    case 1: return [2 /*return*/, _a.sent()];
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

/***/ 4589:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthenticationHandlerOptions = void 0;
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

/***/ 9820:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.httpStatusCode = exports.methodStatusCode = void 0;
/**
 * @module ChaosHandlerData
 */
/**
 * Contains RequestMethod to corresponding array of possible status codes, used for Random mode
 */
exports.methodStatusCode = {
    GET: [429, 500, 502, 503, 504],
    POST: [429, 500, 502, 503, 504, 507],
    PUT: [429, 500, 502, 503, 504, 507],
    PATCH: [429, 500, 502, 503, 504],
    DELETE: [429, 500, 502, 503, 504, 507],
};
/**
 * Contains statusCode to statusMessage map
 */
exports.httpStatusCode = {
    100: "Continue",
    101: "Switching Protocols",
    102: "Processing",
    103: "Early Hints",
    200: "OK",
    201: "Created",
    202: "Accepted",
    203: "Non-Authoritative Information",
    204: "No Content",
    205: "Reset Content",
    206: "Partial Content",
    207: "Multi-Status",
    208: "Already Reported",
    226: "IM Used",
    300: "Multiple Choices",
    301: "Moved Permanently",
    302: "Found",
    303: "See Other",
    304: "Not Modified",
    305: "Use Proxy",
    307: "Temporary Redirect",
    308: "Permanent Redirect",
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Failed",
    413: "Payload Too Large",
    414: "URI Too Long",
    415: "Unsupported Media Type",
    416: "Range Not Satisfiable",
    417: "Expectation Failed",
    421: "Misdirected Request",
    422: "Unprocessable Entity",
    423: "Locked",
    424: "Failed Dependency",
    425: "Too Early",
    426: "Upgrade Required",
    428: "Precondition Required",
    429: "Too Many Requests",
    431: "Request Header Fields Too Large",
    451: "Unavailable For Legal Reasons",
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported",
    506: "Variant Also Negotiates",
    507: "Insufficient Storage",
    508: "Loop Detected",
    510: "Not Extended",
    511: "Network Authentication Required",
};
//# sourceMappingURL=ChaosHandlerData.js.map

/***/ }),

/***/ 3561:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ChaosHandlerOptions = void 0;
/**
 * @module ChaosHandlerOptions
 */
var ChaosStrategy_1 = __nccwpck_require__(290);
/**
 * Class representing ChaosHandlerOptions
 * @class
 * Class
 * @implements MiddlewareOptions
 */
var ChaosHandlerOptions = /** @class */ (function () {
    /**
     * @public
     * @constructor
     * To create an instance of Testing Handler Options
     * @param {ChaosStrategy} ChaosStrategy - Specifies the startegy used for the Testing Handler -> RAMDOM/MANUAL
     * @param {string} statusMessage - The Message to be returned in the response
     * @param {number?} statusCode - The statusCode to be returned in the response
     * @param {number?} chaosPercentage - The percentage of randomness/chaos in the handler
     * @param {any?} responseBody - The response body to be returned in the response
     * @returns An instance of ChaosHandlerOptions
     */
    function ChaosHandlerOptions(chaosStrategy, statusMessage, statusCode, chaosPercentage, responseBody, headers) {
        if (chaosStrategy === void 0) { chaosStrategy = ChaosStrategy_1.ChaosStrategy.RANDOM; }
        if (statusMessage === void 0) { statusMessage = "Some error Happened"; }
        this.chaosStrategy = chaosStrategy;
        this.statusCode = statusCode;
        this.statusMessage = statusMessage;
        this.chaosPercentage = chaosPercentage !== undefined ? chaosPercentage : 10;
        this.responseBody = responseBody;
        this.headers = headers;
        if (this.chaosPercentage > 100) {
            throw new Error("Error Pecentage can not be more than 100");
        }
    }
    return ChaosHandlerOptions;
}());
exports.ChaosHandlerOptions = ChaosHandlerOptions;
//# sourceMappingURL=ChaosHandlerOptions.js.map

/***/ }),

/***/ 290:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ChaosStrategy = void 0;
/**
 * @module ChaosStrategy
 */
/**
 * Strategy used for Testing Handler
 * @enum
 */
var ChaosStrategy;
(function (ChaosStrategy) {
    ChaosStrategy[ChaosStrategy["MANUAL"] = 0] = "MANUAL";
    ChaosStrategy[ChaosStrategy["RANDOM"] = 1] = "RANDOM";
})(ChaosStrategy = exports.ChaosStrategy || (exports.ChaosStrategy = {}));
//# sourceMappingURL=ChaosStrategy.js.map

/***/ }),

/***/ 2184:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=IMiddlewareOptions.js.map

/***/ }),

/***/ 1573:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RedirectHandlerOptions = void 0;
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
        if (shouldRedirect === void 0) { shouldRedirect = RedirectHandlerOptions.defaultShouldRetry; }
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
    RedirectHandlerOptions.defaultShouldRetry = function () { return true; };
    return RedirectHandlerOptions;
}());
exports.RedirectHandlerOptions = RedirectHandlerOptions;
//# sourceMappingURL=RedirectHandlerOptions.js.map

/***/ }),

/***/ 3089:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RetryHandlerOptions = void 0;
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
        if (shouldRetry === void 0) { shouldRetry = RetryHandlerOptions.defaultShouldRetry; }
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
    RetryHandlerOptions.defaultShouldRetry = function () { return true; };
    return RetryHandlerOptions;
}());
exports.RetryHandlerOptions = RetryHandlerOptions;
//# sourceMappingURL=RetryHandlerOptions.js.map

/***/ }),

/***/ 2452:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TelemetryHandlerOptions = exports.FeatureUsageFlag = void 0;
var MiddlewareControl_1 = __nccwpck_require__(6559);
/**
 * @enum
 * @property {number} NONE - The hexadecimal flag value for nothing enabled
 * @property {number} REDIRECT_HANDLER_ENABLED - The hexadecimal flag value for redirect handler enabled
 * @property {number} RETRY_HANDLER_ENABLED - The hexadecimal flag value for retry handler enabled
 * @property {number} AUTHENTICATION_HANDLER_ENABLED - The hexadecimal flag value for the authentication handler enabled
 */
var FeatureUsageFlag;
(function (FeatureUsageFlag) {
    /* eslint-disable  @typescript-eslint/naming-convention */
    FeatureUsageFlag[FeatureUsageFlag["NONE"] = 0] = "NONE";
    FeatureUsageFlag[FeatureUsageFlag["REDIRECT_HANDLER_ENABLED"] = 1] = "REDIRECT_HANDLER_ENABLED";
    FeatureUsageFlag[FeatureUsageFlag["RETRY_HANDLER_ENABLED"] = 2] = "RETRY_HANDLER_ENABLED";
    FeatureUsageFlag[FeatureUsageFlag["AUTHENTICATION_HANDLER_ENABLED"] = 4] = "AUTHENTICATION_HANDLER_ENABLED";
    /* eslint-enable  @typescript-eslint/naming-convention */
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
        this.featureUsage = this.featureUsage | flag;
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

/***/ 9415:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FileUpload = void 0;
var GraphClientError_1 = __nccwpck_require__(1938);
/**
 * @class
 * Class used for creating LargeFileUploadTask fileobject.
 * This class accepts files of type ArrayBuffer, Blob, Buffer.
 */
var FileUpload = /** @class */ (function () {
    /**
     * @public
     * @constructor
     * @param {ArrayBuffer | Blob | Buffer} content - The file to be uploaded
     * @param {string} name - The name of the file to be uploaded
     * @param {number} size - The total size of the file to be uploaded
     * @returns An instance of the FileUpload class
     */
    function FileUpload(content, name, size) {
        this.content = content;
        this.name = name;
        this.size = size;
        if (!content || !name || !size) {
            throw new GraphClientError_1.GraphClientError("Please provide the Readable Stream content, name of the file and size of the file");
        }
    }
    /**
     * @public
     * Slices the file content to the given range
     * @param {Range} range - The range value
     * @returns The sliced file part
     */
    FileUpload.prototype.sliceFile = function (range) {
        return this.content.slice(range.minValue, range.maxValue + 1);
    };
    return FileUpload;
}());
exports.FileUpload = FileUpload;
//# sourceMappingURL=FileUpload.js.map

/***/ }),

/***/ 8703:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StreamUpload = void 0;
var tslib_1 = __nccwpck_require__(7331);
var GraphClientError_1 = __nccwpck_require__(1938);
/**
 * @class
 * FileObject class for Readable Stream upload
 */
var StreamUpload = /** @class */ (function () {
    function StreamUpload(content, name, size) {
        this.content = content;
        this.name = name;
        this.size = size;
        if (!content || !name || !size) {
            throw new GraphClientError_1.GraphClientError("Please provide the Readable Stream content, name of the file and size of the file");
        }
    }
    /**
     * @public
     * Slices the file content to the given range
     * @param {Range} range - The range value
     * @returns The sliced file part
     */
    StreamUpload.prototype.sliceFile = function (range) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var rangeSize, bufs, previousRangeMin, previousRangeMax, _a, _b, slicedChunk;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        rangeSize = range.maxValue - range.minValue + 1;
                        bufs = [];
                        /**
                         * The sliceFile reads the first `rangeSize` number of bytes from the stream.
                         * The previousSlice property is used to seek the range of bytes in the previous slice.
                         * Suppose, the sliceFile reads bytes from `10 - 20` from the stream but the upload of this slice fails.
                         * When the user resumes, the stream will have bytes from position 21.
                         * The previousSlice.Range is used to compare if the requested range is cached in the previousSlice property or present in the Readable Stream.
                         */
                        if (this.previousSlice) {
                            if (range.minValue < this.previousSlice.range.minValue) {
                                throw new GraphClientError_1.GraphClientError("An error occurred while uploading the stream. Please restart the stream upload from the first byte of the file.");
                            }
                            if (range.minValue < this.previousSlice.range.maxValue) {
                                previousRangeMin = this.previousSlice.range.minValue;
                                previousRangeMax = this.previousSlice.range.maxValue;
                                // Check if the requested range is same as previously sliced range
                                if (range.minValue === previousRangeMin && range.maxValue === previousRangeMax) {
                                    return [2 /*return*/, this.previousSlice.fileSlice];
                                }
                                /**
                                 * The following check considers a possibility
                                 * of an upload failing after some of the bytes of the previous slice
                                 * were successfully uploaded.
                                 * Example - Previous slice range - `10 - 20`. Current requested range is `15 - 20`.
                                 */
                                if (range.maxValue === previousRangeMax) {
                                    return [2 /*return*/, this.previousSlice.fileSlice.slice(range.minValue, range.maxValue + 1)];
                                }
                                /**
                                 * If an upload fails after some of the bytes of the previous slice
                                 * were successfully uploaded and the new Range.Maximum is greater than the previous Range.Maximum
                                 * Example - Previous slice range - `10 - 20`. Current requested range is `15 - 25`,
                                 * then read the bytes from position 15 to 20 from previousSlice.fileSlice and read bytes from position 21 to 25 from the Readable Stream
                                 */
                                bufs.push(this.previousSlice.fileSlice.slice(range.minValue, previousRangeMax + 1));
                                rangeSize = range.maxValue - previousRangeMax;
                            }
                        }
                        if (!(this.content && this.content.readable)) return [3 /*break*/, 4];
                        if (!(this.content.readableLength >= rangeSize)) return [3 /*break*/, 1];
                        bufs.push(this.content.read(rangeSize));
                        return [3 /*break*/, 3];
                    case 1:
                        _b = (_a = bufs).push;
                        return [4 /*yield*/, this.readNBytesFromStream(rangeSize)];
                    case 2:
                        _b.apply(_a, [_c.sent()]);
                        _c.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4: throw new GraphClientError_1.GraphClientError("Stream is not readable.");
                    case 5:
                        slicedChunk = Buffer.concat(bufs);
                        this.previousSlice = { fileSlice: slicedChunk, range: range };
                        return [2 /*return*/, slicedChunk];
                }
            });
        });
    };
    /**
     * @private
     * Reads the specified byte size from the stream
     * @param {number} size - The size of bytes to be read
     * @returns Buffer with the given length of data.
     */
    StreamUpload.prototype.readNBytesFromStream = function (size) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var chunks = [];
            var remainder = size;
            var length = 0;
            _this.content.on("end", function () {
                if (remainder > 0) {
                    return reject(new GraphClientError_1.GraphClientError("Stream ended before reading required range size"));
                }
            });
            _this.content.on("readable", function () {
                /**
                 * (chunk = this.content.read(size)) can return null if size of stream is less than 'size' parameter.
                 * Read the remainder number of bytes from the stream iteratively as they are available.
                 */
                var chunk;
                while (length < size && (chunk = _this.content.read(remainder)) !== null) {
                    length += chunk.length;
                    chunks.push(chunk);
                    if (remainder > 0) {
                        remainder = size - length;
                    }
                }
                if (length === size) {
                    return resolve(Buffer.concat(chunks));
                }
                if (!_this.content || !_this.content.readable) {
                    return reject(new GraphClientError_1.GraphClientError("Error encountered while reading the stream during the upload"));
                }
            });
        });
    };
    return StreamUpload;
}());
exports.StreamUpload = StreamUpload;
//# sourceMappingURL=StreamUpload.js.map

/***/ }),

/***/ 2264:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=IUploadEventHandlers.js.map

/***/ }),

/***/ 8452:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Range = void 0;
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

/***/ 7942:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UploadResult = void 0;
/**
 * Class representing a successful file upload result
 */
var UploadResult = /** @class */ (function () {
    /**
     * @public
     * @param {responseBody} responsebody - The response body from the completed upload response
     * @param {location} location - The location value from the headers from the completed upload response
     */
    function UploadResult(responseBody, location) {
        // Response body or the location parameter can be undefined.
        this._location = location;
        this._responseBody = responseBody;
    }
    Object.defineProperty(UploadResult.prototype, "location", {
        /**
         * @public
         * Get of the location value.
         * Location value is looked up in the response header
         */
        get: function () {
            return this._location;
        },
        /**
         * @public
         * Set the location value
         * Location value is looked up in the response header
         */
        set: function (location) {
            this._location = location;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(UploadResult.prototype, "responseBody", {
        /**
         * @public
         * Get The response body from the completed upload response
         */
        get: function () {
            return this._responseBody;
        },
        /**
         * @public
         * Set the response body from the completed upload response
         */
        set: function (responseBody) {
            this._responseBody = responseBody;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * @public
     * @param {responseBody} responseBody - The response body from the completed upload response
     * @param {responseHeaders} responseHeaders - The headers from the completed upload response
     */
    UploadResult.CreateUploadResult = function (responseBody, responseHeaders) {
        return new UploadResult(responseBody, responseHeaders.get("location"));
    };
    return UploadResult;
}());
exports.UploadResult = UploadResult;
//# sourceMappingURL=UploadResult.js.map

/***/ }),

/***/ 9064:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LargeFileUploadTask = void 0;
var tslib_1 = __nccwpck_require__(7331);
/**
 * @module LargeFileUploadTask
 */
var GraphClientError_1 = __nccwpck_require__(1938);
var GraphResponseHandler_1 = __nccwpck_require__(3298);
var ResponseType_1 = __nccwpck_require__(6903);
var Range_1 = __nccwpck_require__(8452);
var UploadResult_1 = __nccwpck_require__(7942);
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
        if (!file.sliceFile) {
            throw new GraphClientError_1.GraphClientError("Please pass the FileUpload object, StreamUpload object or any custom implementation of the FileObject interface");
        }
        else {
            this.file = file;
        }
        this.file = file;
        if (!options.rangeSize) {
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
            var session, largeFileUploadSession;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, client
                            .api(requestUrl)
                            .headers(headers)
                            .post(payload)];
                    case 1:
                        session = _a.sent();
                        largeFileUploadSession = {
                            url: session.uploadUrl,
                            expiry: new Date(session.expirationDateTime),
                            isCancelled: false,
                        };
                        return [2 /*return*/, largeFileUploadSession];
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
     * @deprecated This function has been moved into FileObject interface.
     * @public
     * Slices the file content to the given range
     * @param {Range} range - The range value
     * @returns The sliced ArrayBuffer or Blob
     */
    LargeFileUploadTask.prototype.sliceFile = function (range) {
        console.warn("The LargeFileUploadTask.sliceFile() function has been deprecated and moved into the FileObject interface.");
        if (this.file.content instanceof ArrayBuffer || this.file.content instanceof Blob || this.file.content instanceof Buffer) {
            return this.file.content.slice(range.minValue, range.maxValue + 1);
        }
        throw new GraphClientError_1.GraphClientError("The LargeFileUploadTask.sliceFile() function expects only Blob, ArrayBuffer or Buffer file content. Please note that the sliceFile() function is deprecated.");
    };
    /**
     * @public
     * @async
     * Uploads file to the server in a sequential order by slicing the file
     * @returns The promise resolves to uploaded response
     */
    LargeFileUploadTask.prototype.upload = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var uploadEventHandlers, nextRange, err, fileSlice, rawResponse, responseBody, uploadResult, res;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        uploadEventHandlers = this.options && this.options.uploadEventHandlers;
                        _a.label = 1;
                    case 1:
                        if (!!this.uploadSession.isCancelled) return [3 /*break*/, 5];
                        nextRange = this.getNextRange();
                        if (nextRange.maxValue === -1) {
                            err = new Error("Task with which you are trying to upload is already completed, Please check for your uploaded file");
                            err.name = "Invalid Session";
                            throw err;
                        }
                        return [4 /*yield*/, this.file.sliceFile(nextRange)];
                    case 2:
                        fileSlice = _a.sent();
                        return [4 /*yield*/, this.uploadSliceGetRawResponse(fileSlice, nextRange, this.file.size)];
                    case 3:
                        rawResponse = _a.sent();
                        if (!rawResponse) {
                            throw new GraphClientError_1.GraphClientError("Something went wrong! Large file upload slice response is null.");
                        }
                        return [4 /*yield*/, GraphResponseHandler_1.GraphResponseHandler.getResponse(rawResponse)];
                    case 4:
                        responseBody = _a.sent();
                        /**
                         * (rawResponse.status === 201) -> This condition is applicable for OneDrive, PrintDocument and Outlook APIs.
                         * (rawResponse.status === 200 && responseBody.id) -> This additional condition is applicable only for OneDrive API.
                         */
                        if (rawResponse.status === 201 || (rawResponse.status === 200 && responseBody.id)) {
                            uploadResult = UploadResult_1.UploadResult.CreateUploadResult(responseBody, rawResponse.headers);
                            return [2 /*return*/, uploadResult];
                        }
                        res = {
                            expirationDateTime: responseBody.expirationDateTime || responseBody.ExpirationDateTime,
                            nextExpectedRanges: responseBody.NextExpectedRanges || responseBody.nextExpectedRanges,
                        };
                        this.updateTaskStatus(res);
                        if (uploadEventHandlers && uploadEventHandlers.progress) {
                            uploadEventHandlers.progress(nextRange, uploadEventHandlers.extraCallbackParam);
                        }
                        return [3 /*break*/, 1];
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
     * @returns The response body of the upload slice result
     */
    LargeFileUploadTask.prototype.uploadSlice = function (fileSlice, range, totalSize) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client
                            .api(this.uploadSession.url)
                            .headers({
                            "Content-Length": "" + (range.maxValue - range.minValue + 1),
                            "Content-Range": "bytes " + range.minValue + "-" + range.maxValue + "/" + totalSize,
                        })
                            .put(fileSlice)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * @public
     * @async
     * Uploads given slice to the server
     * @param {unknown} fileSlice - The file slice
     * @param {Range} range - The range value
     * @param {number} totalSize - The total size of a complete file
     * @returns The raw response of the upload slice result
     */
    LargeFileUploadTask.prototype.uploadSliceGetRawResponse = function (fileSlice, range, totalSize) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client
                            .api(this.uploadSession.url)
                            .headers({
                            "Content-Length": "" + (range.maxValue - range.minValue + 1),
                            "Content-Range": "bytes " + range.minValue + "-" + range.maxValue + "/" + totalSize,
                        })
                            .responseType(ResponseType_1.ResponseType.RAW)
                            .put(fileSlice)];
                    case 1: return [2 /*return*/, _a.sent()];
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
            var cancelResponse;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client
                            .api(this.uploadSession.url)
                            .responseType(ResponseType_1.ResponseType.RAW)
                            .delete()];
                    case 1:
                        cancelResponse = _a.sent();
                        if (cancelResponse.status === 204) {
                            this.uploadSession.isCancelled = true;
                        }
                        return [2 /*return*/, cancelResponse];
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
            var response;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client.api(this.uploadSession.url).get()];
                    case 1:
                        response = _a.sent();
                        this.updateTaskStatus(response);
                        return [2 /*return*/, response];
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
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getStatus()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.upload()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * @public
     * @async
     * Get the upload session information
     * @returns The large file upload session
     */
    LargeFileUploadTask.prototype.getUploadSession = function () {
        return this.uploadSession;
    };
    return LargeFileUploadTask;
}());
exports.LargeFileUploadTask = LargeFileUploadTask;
//# sourceMappingURL=LargeFileUploadTask.js.map

/***/ }),

/***/ 7676:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OneDriveLargeFileUploadTask = void 0;
var tslib_1 = __nccwpck_require__(7331);
/**
 * @module OneDriveLargeFileUploadTask
 */
var GraphClientError_1 = __nccwpck_require__(1938);
var FileUpload_1 = __nccwpck_require__(9415);
var LargeFileUploadTask_1 = __nccwpck_require__(9064);
var OneDriveLargeFileUploadTaskUtil_1 = __nccwpck_require__(6926);
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
        // we choose to encode each component of the file path separately because when encoding full URI
        // with encodeURI, special characters like # or % in the file name doesn't get encoded as desired
        return "/me/drive/root:" + path
            .split("/")
            .map(function (p) { return encodeURIComponent(p); })
            .join("/") + encodeURIComponent(fileName) + ":/createUploadSession";
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
            var name, content, size, b, fileObj;
            return tslib_1.__generator(this, function (_a) {
                if (!client || !file || !options) {
                    throw new GraphClientError_1.GraphClientError("Please provide the Graph client instance, file object and OneDriveLargeFileUploadOptions value");
                }
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
                fileObj = new FileUpload_1.FileUpload(content, name, size);
                return [2 /*return*/, this.createTaskWithFileObject(client, fileObj, options)];
            });
        });
    };
    /**
     * @public
     * @static
     * @async
     * Creates a OneDriveLargeFileUploadTask
     * @param {Client} client - The GraphClient instance
     * @param {FileObject} file - FileObject instance
     * @param {OneDriveLargeFileUploadOptions} options - The options for upload task
     * @returns The promise that will be resolves to OneDriveLargeFileUploadTask instance
     */
    OneDriveLargeFileUploadTask.createTaskWithFileObject = function (client, fileObject, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var requestUrl, uploadSessionPayload, session, rangeSize;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!client || !fileObject || !options) {
                            throw new GraphClientError_1.GraphClientError("Please provide the Graph client instance, FileObject interface implementation and OneDriveLargeFileUploadOptions value");
                        }
                        requestUrl = OneDriveLargeFileUploadTask.constructCreateSessionUrl(options.fileName, options.path);
                        uploadSessionPayload = {
                            fileName: options.fileName,
                            conflictBehavior: options.conflictBehavior,
                        };
                        return [4 /*yield*/, OneDriveLargeFileUploadTask.createUploadSession(client, requestUrl, uploadSessionPayload)];
                    case 1:
                        session = _a.sent();
                        rangeSize = OneDriveLargeFileUploadTaskUtil_1.getValidRangeSize(options.rangeSize);
                        return [2 /*return*/, new OneDriveLargeFileUploadTask(client, fileObject, session, {
                                rangeSize: rangeSize,
                                uploadEventHandlers: options.uploadEventHandlers,
                            })];
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
     * @param {string} conflictBehavior - Conflict behaviour option. Default is 'rename'
     * @returns The promise that resolves to LargeFileUploadSession
     */
    OneDriveLargeFileUploadTask.createUploadSession = function (client, requestUrl, payloadOptions) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var payload;
            return tslib_1.__generator(this, function (_a) {
                payload = {
                    item: {
                        "@microsoft.graph.conflictBehavior": (payloadOptions === null || payloadOptions === void 0 ? void 0 : payloadOptions.conflictBehavior) || "rename",
                        name: payloadOptions === null || payloadOptions === void 0 ? void 0 : payloadOptions.fileName,
                    },
                };
                return [2 /*return*/, _super.createUploadSession.call(this, client, requestUrl, payload)];
            });
        });
    };
    /**
     * @public
     * Commits upload session to end uploading
     * @param {string} requestUrl - The URL to commit the upload session
     * @param {string} conflictBehavior - Conflict behaviour option. Default is 'rename'
     * @returns The promise resolves to committed response
     */
    OneDriveLargeFileUploadTask.prototype.commit = function (requestUrl, conflictBehavior) {
        if (conflictBehavior === void 0) { conflictBehavior = "rename"; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var payload;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        payload = {
                            name: this.file.name,
                            "@microsoft.graph.conflictBehavior": conflictBehavior,
                            "@microsoft.graph.sourceUrl": this.uploadSession.url,
                        };
                        return [4 /*yield*/, this.client.api(requestUrl).put(payload)];
                    case 1: return [2 /*return*/, _a.sent()];
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

/***/ 6926:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getValidRangeSize = void 0;
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
var getValidRangeSize = function (rangeSize) {
    if (rangeSize === void 0) { rangeSize = DEFAULT_FILE_SIZE; }
    var sixtyMB = 60 * 1024 * 1024;
    if (rangeSize > sixtyMB) {
        rangeSize = sixtyMB;
    }
    return roundTo320KB(rangeSize);
};
exports.getValidRangeSize = getValidRangeSize;
//# sourceMappingURL=OneDriveLargeFileUploadTaskUtil.js.map

/***/ }),

/***/ 4989:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PageIterator = void 0;
var tslib_1 = __nccwpck_require__(7331);
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
     * @param {GraphRequestOptions} requestOptions - The request options
     * @returns An instance of a PageIterator
     */
    function PageIterator(client, pageCollection, callback, requestOptions) {
        this.client = client;
        this.collection = pageCollection.value;
        this.nextLink = pageCollection["@odata.nextLink"];
        this.deltaLink = pageCollection["@odata.deltaLink"];
        this.callback = callback;
        this.complete = false;
        this.requestOptions = requestOptions;
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
            var graphRequest, response;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        graphRequest = this.client.api(this.nextLink);
                        if (this.requestOptions) {
                            if (this.requestOptions.headers) {
                                graphRequest = graphRequest.headers(this.requestOptions.headers);
                            }
                            if (this.requestOptions.middlewareOptions) {
                                graphRequest = graphRequest.middlewareOptions(this.requestOptions.middlewareOptions);
                            }
                            if (this.requestOptions.options) {
                                graphRequest = graphRequest.options(this.requestOptions.options);
                            }
                        }
                        return [4 /*yield*/, graphRequest.get()];
                    case 1:
                        response = _a.sent();
                        this.collection = response.value;
                        this.nextLink = response["@odata.nextLink"];
                        this.deltaLink = response["@odata.deltaLink"];
                        return [2 /*return*/];
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
            var advance;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
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
                        return [2 /*return*/];
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
                return [2 /*return*/, this.iterate()];
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

/***/ 7331:
/***/ ((module) => {

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
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
var __spreadArray;
var __await;
var __asyncGenerator;
var __asyncDelegator;
var __asyncValues;
var __makeTemplateObject;
var __importStar;
var __importDefault;
var __classPrivateFieldGet;
var __classPrivateFieldSet;
var __createBinding;
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
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };

    __extends = function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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

    __exportStar = function(m, o) {
        for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
    };

    __createBinding = Object.create ? (function(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
    }) : (function(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
    });

    __values = function (o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
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

    /** @deprecated */
    __spread = function () {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    };

    /** @deprecated */
    __spreadArrays = function () {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    };

    __spreadArray = function (to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
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

    var __setModuleDefault = Object.create ? (function(o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
        o["default"] = v;
    };

    __importStar = function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    };

    __importDefault = function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };

    __classPrivateFieldGet = function (receiver, state, kind, f) {
        if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
        return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
    };

    __classPrivateFieldSet = function (receiver, state, value, kind, f) {
        if (kind === "m") throw new TypeError("Private method is not writable");
        if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
        return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
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
    exporter("__createBinding", __createBinding);
    exporter("__values", __values);
    exporter("__read", __read);
    exporter("__spread", __spread);
    exporter("__spreadArrays", __spreadArrays);
    exporter("__spreadArray", __spreadArray);
    exporter("__await", __await);
    exporter("__asyncGenerator", __asyncGenerator);
    exporter("__asyncDelegator", __asyncDelegator);
    exporter("__asyncValues", __asyncValues);
    exporter("__makeTemplateObject", __makeTemplateObject);
    exporter("__importStar", __importStar);
    exporter("__importDefault", __importDefault);
    exporter("__classPrivateFieldGet", __classPrivateFieldGet);
    exporter("__classPrivateFieldSet", __classPrivateFieldSet);
});


/***/ }),

/***/ 9436:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { define } = __nccwpck_require__(3998)
const base = __nccwpck_require__(3318)
const constants = __nccwpck_require__(998)
const decoders = __nccwpck_require__(2975)
const encoders = __nccwpck_require__(2246)

module.exports = {
  base,
  constants,
  decoders,
  define,
  encoders
}


/***/ }),

/***/ 3998:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { inherits } = __nccwpck_require__(1669)
const encoders = __nccwpck_require__(2246)
const decoders = __nccwpck_require__(2975)

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

/***/ 8424:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { inherits } = __nccwpck_require__(1669)

const { Reporter } = __nccwpck_require__(3026)

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

/***/ 3318:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { Reporter } = __nccwpck_require__(3026)
const { DecoderBuffer, EncoderBuffer } = __nccwpck_require__(8424)
const Node = __nccwpck_require__(8674)

module.exports = {
  DecoderBuffer,
  EncoderBuffer,
  Node,
  Reporter
}


/***/ }),

/***/ 8674:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { strict: assert } = __nccwpck_require__(2357)

const { Reporter } = __nccwpck_require__(3026)
const { DecoderBuffer, EncoderBuffer } = __nccwpck_require__(8424)

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

/***/ 3026:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

const { inherits } = __nccwpck_require__(1669)

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

/***/ 6018:
/***/ ((__unused_webpack_module, exports) => {

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

/***/ 998:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

module.exports = {
  der: __nccwpck_require__(6018)
}


/***/ }),

/***/ 4798:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

/* global BigInt */
const { inherits } = __nccwpck_require__(1669)

const { DecoderBuffer } = __nccwpck_require__(8424)
const Node = __nccwpck_require__(8674)

// Import DER constants
const der = __nccwpck_require__(6018)

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

/***/ 2975:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

module.exports = {
  der: __nccwpck_require__(4798),
  pem: __nccwpck_require__(3956)
}


/***/ }),

/***/ 3956:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { inherits } = __nccwpck_require__(1669)

const DERDecoder = __nccwpck_require__(4798)

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

/***/ 846:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

/* global BigInt */
const { inherits } = __nccwpck_require__(1669)

const Node = __nccwpck_require__(8674)
const der = __nccwpck_require__(6018)

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

/***/ 2246:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

module.exports = {
  der: __nccwpck_require__(846),
  pem: __nccwpck_require__(6217)
}


/***/ }),

/***/ 6217:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { inherits } = __nccwpck_require__(1669)

const DEREncoder = __nccwpck_require__(846)

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

/***/ 7678:
/***/ ((module, exports) => {

"use strict";

/// <reference lib="es2018"/>
/// <reference lib="dom"/>
/// <reference types="node"/>
Object.defineProperty(exports, "__esModule", ({ value: true }));
const typedArrayTypeNames = [
    'Int8Array',
    'Uint8Array',
    'Uint8ClampedArray',
    'Int16Array',
    'Uint16Array',
    'Int32Array',
    'Uint32Array',
    'Float32Array',
    'Float64Array',
    'BigInt64Array',
    'BigUint64Array'
];
function isTypedArrayName(name) {
    return typedArrayTypeNames.includes(name);
}
const objectTypeNames = [
    'Function',
    'Generator',
    'AsyncGenerator',
    'GeneratorFunction',
    'AsyncGeneratorFunction',
    'AsyncFunction',
    'Observable',
    'Array',
    'Buffer',
    'Object',
    'RegExp',
    'Date',
    'Error',
    'Map',
    'Set',
    'WeakMap',
    'WeakSet',
    'ArrayBuffer',
    'SharedArrayBuffer',
    'DataView',
    'Promise',
    'URL',
    'HTMLElement',
    ...typedArrayTypeNames
];
function isObjectTypeName(name) {
    return objectTypeNames.includes(name);
}
const primitiveTypeNames = [
    'null',
    'undefined',
    'string',
    'number',
    'bigint',
    'boolean',
    'symbol'
];
function isPrimitiveTypeName(name) {
    return primitiveTypeNames.includes(name);
}
// eslint-disable-next-line @typescript-eslint/ban-types
function isOfType(type) {
    return (value) => typeof value === type;
}
const { toString } = Object.prototype;
const getObjectType = (value) => {
    const objectTypeName = toString.call(value).slice(8, -1);
    if (/HTML\w+Element/.test(objectTypeName) && is.domElement(value)) {
        return 'HTMLElement';
    }
    if (isObjectTypeName(objectTypeName)) {
        return objectTypeName;
    }
    return undefined;
};
const isObjectOfType = (type) => (value) => getObjectType(value) === type;
function is(value) {
    if (value === null) {
        return 'null';
    }
    switch (typeof value) {
        case 'undefined':
            return 'undefined';
        case 'string':
            return 'string';
        case 'number':
            return 'number';
        case 'boolean':
            return 'boolean';
        case 'function':
            return 'Function';
        case 'bigint':
            return 'bigint';
        case 'symbol':
            return 'symbol';
        default:
    }
    if (is.observable(value)) {
        return 'Observable';
    }
    if (is.array(value)) {
        return 'Array';
    }
    if (is.buffer(value)) {
        return 'Buffer';
    }
    const tagType = getObjectType(value);
    if (tagType) {
        return tagType;
    }
    if (value instanceof String || value instanceof Boolean || value instanceof Number) {
        throw new TypeError('Please don\'t use object wrappers for primitive types');
    }
    return 'Object';
}
is.undefined = isOfType('undefined');
is.string = isOfType('string');
const isNumberType = isOfType('number');
is.number = (value) => isNumberType(value) && !is.nan(value);
is.bigint = isOfType('bigint');
// eslint-disable-next-line @typescript-eslint/ban-types
is.function_ = isOfType('function');
is.null_ = (value) => value === null;
is.class_ = (value) => is.function_(value) && value.toString().startsWith('class ');
is.boolean = (value) => value === true || value === false;
is.symbol = isOfType('symbol');
is.numericString = (value) => is.string(value) && !is.emptyStringOrWhitespace(value) && !Number.isNaN(Number(value));
is.array = (value, assertion) => {
    if (!Array.isArray(value)) {
        return false;
    }
    if (!is.function_(assertion)) {
        return true;
    }
    return value.every(assertion);
};
is.buffer = (value) => { var _a, _b, _c, _d; return (_d = (_c = (_b = (_a = value) === null || _a === void 0 ? void 0 : _a.constructor) === null || _b === void 0 ? void 0 : _b.isBuffer) === null || _c === void 0 ? void 0 : _c.call(_b, value)) !== null && _d !== void 0 ? _d : false; };
is.nullOrUndefined = (value) => is.null_(value) || is.undefined(value);
is.object = (value) => !is.null_(value) && (typeof value === 'object' || is.function_(value));
is.iterable = (value) => { var _a; return is.function_((_a = value) === null || _a === void 0 ? void 0 : _a[Symbol.iterator]); };
is.asyncIterable = (value) => { var _a; return is.function_((_a = value) === null || _a === void 0 ? void 0 : _a[Symbol.asyncIterator]); };
is.generator = (value) => is.iterable(value) && is.function_(value.next) && is.function_(value.throw);
is.asyncGenerator = (value) => is.asyncIterable(value) && is.function_(value.next) && is.function_(value.throw);
is.nativePromise = (value) => isObjectOfType('Promise')(value);
const hasPromiseAPI = (value) => {
    var _a, _b;
    return is.function_((_a = value) === null || _a === void 0 ? void 0 : _a.then) &&
        is.function_((_b = value) === null || _b === void 0 ? void 0 : _b.catch);
};
is.promise = (value) => is.nativePromise(value) || hasPromiseAPI(value);
is.generatorFunction = isObjectOfType('GeneratorFunction');
is.asyncGeneratorFunction = (value) => getObjectType(value) === 'AsyncGeneratorFunction';
is.asyncFunction = (value) => getObjectType(value) === 'AsyncFunction';
// eslint-disable-next-line no-prototype-builtins, @typescript-eslint/ban-types
is.boundFunction = (value) => is.function_(value) && !value.hasOwnProperty('prototype');
is.regExp = isObjectOfType('RegExp');
is.date = isObjectOfType('Date');
is.error = isObjectOfType('Error');
is.map = (value) => isObjectOfType('Map')(value);
is.set = (value) => isObjectOfType('Set')(value);
is.weakMap = (value) => isObjectOfType('WeakMap')(value);
is.weakSet = (value) => isObjectOfType('WeakSet')(value);
is.int8Array = isObjectOfType('Int8Array');
is.uint8Array = isObjectOfType('Uint8Array');
is.uint8ClampedArray = isObjectOfType('Uint8ClampedArray');
is.int16Array = isObjectOfType('Int16Array');
is.uint16Array = isObjectOfType('Uint16Array');
is.int32Array = isObjectOfType('Int32Array');
is.uint32Array = isObjectOfType('Uint32Array');
is.float32Array = isObjectOfType('Float32Array');
is.float64Array = isObjectOfType('Float64Array');
is.bigInt64Array = isObjectOfType('BigInt64Array');
is.bigUint64Array = isObjectOfType('BigUint64Array');
is.arrayBuffer = isObjectOfType('ArrayBuffer');
is.sharedArrayBuffer = isObjectOfType('SharedArrayBuffer');
is.dataView = isObjectOfType('DataView');
is.directInstanceOf = (instance, class_) => Object.getPrototypeOf(instance) === class_.prototype;
is.urlInstance = (value) => isObjectOfType('URL')(value);
is.urlString = (value) => {
    if (!is.string(value)) {
        return false;
    }
    try {
        new URL(value); // eslint-disable-line no-new
        return true;
    }
    catch (_a) {
        return false;
    }
};
// TODO: Use the `not` operator with a type guard here when it's available.
// Example: `is.truthy = (value: unknown): value is (not false | not 0 | not '' | not undefined | not null) => Boolean(value);`
is.truthy = (value) => Boolean(value);
// Example: `is.falsy = (value: unknown): value is (not true | 0 | '' | undefined | null) => Boolean(value);`
is.falsy = (value) => !value;
is.nan = (value) => Number.isNaN(value);
is.primitive = (value) => is.null_(value) || isPrimitiveTypeName(typeof value);
is.integer = (value) => Number.isInteger(value);
is.safeInteger = (value) => Number.isSafeInteger(value);
is.plainObject = (value) => {
    // From: https://github.com/sindresorhus/is-plain-obj/blob/main/index.js
    if (toString.call(value) !== '[object Object]') {
        return false;
    }
    const prototype = Object.getPrototypeOf(value);
    return prototype === null || prototype === Object.getPrototypeOf({});
};
is.typedArray = (value) => isTypedArrayName(getObjectType(value));
const isValidLength = (value) => is.safeInteger(value) && value >= 0;
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
is.domElement = (value) => {
    return is.object(value) &&
        value.nodeType === NODE_TYPE_ELEMENT &&
        is.string(value.nodeName) &&
        !is.plainObject(value) &&
        DOM_PROPERTIES_TO_CHECK.every(property => property in value);
};
is.observable = (value) => {
    var _a, _b, _c, _d;
    if (!value) {
        return false;
    }
    // eslint-disable-next-line no-use-extend-native/no-use-extend-native
    if (value === ((_b = (_a = value)[Symbol.observable]) === null || _b === void 0 ? void 0 : _b.call(_a))) {
        return true;
    }
    if (value === ((_d = (_c = value)['@@observable']) === null || _d === void 0 ? void 0 : _d.call(_c))) {
        return true;
    }
    return false;
};
is.nodeStream = (value) => is.object(value) && is.function_(value.pipe) && !is.observable(value);
is.infinite = (value) => value === Infinity || value === -Infinity;
const isAbsoluteMod2 = (remainder) => (value) => is.integer(value) && Math.abs(value % 2) === remainder;
is.evenInteger = isAbsoluteMod2(0);
is.oddInteger = isAbsoluteMod2(1);
is.emptyArray = (value) => is.array(value) && value.length === 0;
is.nonEmptyArray = (value) => is.array(value) && value.length > 0;
is.emptyString = (value) => is.string(value) && value.length === 0;
// TODO: Use `not ''` when the `not` operator is available.
is.nonEmptyString = (value) => is.string(value) && value.length > 0;
const isWhiteSpaceString = (value) => is.string(value) && !/\S/.test(value);
is.emptyStringOrWhitespace = (value) => is.emptyString(value) || isWhiteSpaceString(value);
is.emptyObject = (value) => is.object(value) && !is.map(value) && !is.set(value) && Object.keys(value).length === 0;
// TODO: Use `not` operator here to remove `Map` and `Set` from type guard:
// - https://github.com/Microsoft/TypeScript/pull/29317
is.nonEmptyObject = (value) => is.object(value) && !is.map(value) && !is.set(value) && Object.keys(value).length > 0;
is.emptySet = (value) => is.set(value) && value.size === 0;
is.nonEmptySet = (value) => is.set(value) && value.size > 0;
is.emptyMap = (value) => is.map(value) && value.size === 0;
is.nonEmptyMap = (value) => is.map(value) && value.size > 0;
const predicateOnArray = (method, predicate, values) => {
    if (!is.function_(predicate)) {
        throw new TypeError(`Invalid predicate: ${JSON.stringify(predicate)}`);
    }
    if (values.length === 0) {
        throw new TypeError('Invalid number of values');
    }
    return method.call(values, predicate);
};
is.any = (predicate, ...values) => {
    const predicates = is.array(predicate) ? predicate : [predicate];
    return predicates.some(singlePredicate => predicateOnArray(Array.prototype.some, singlePredicate, values));
};
is.all = (predicate, ...values) => predicateOnArray(Array.prototype.every, predicate, values);
const assertType = (condition, description, value, options = {}) => {
    if (!condition) {
        const { multipleValues } = options;
        const valuesMessage = multipleValues ?
            `received values of types ${[
                ...new Set(value.map(singleValue => `\`${is(singleValue)}\``))
            ].join(', ')}` :
            `received value of type \`${is(value)}\``;
        throw new TypeError(`Expected value which is \`${description}\`, ${valuesMessage}.`);
    }
};
exports.assert = {
    // Unknowns.
    undefined: (value) => assertType(is.undefined(value), 'undefined', value),
    string: (value) => assertType(is.string(value), 'string', value),
    number: (value) => assertType(is.number(value), 'number', value),
    bigint: (value) => assertType(is.bigint(value), 'bigint', value),
    // eslint-disable-next-line @typescript-eslint/ban-types
    function_: (value) => assertType(is.function_(value), 'Function', value),
    null_: (value) => assertType(is.null_(value), 'null', value),
    class_: (value) => assertType(is.class_(value), "Class" /* class_ */, value),
    boolean: (value) => assertType(is.boolean(value), 'boolean', value),
    symbol: (value) => assertType(is.symbol(value), 'symbol', value),
    numericString: (value) => assertType(is.numericString(value), "string with a number" /* numericString */, value),
    array: (value, assertion) => {
        const assert = assertType;
        assert(is.array(value), 'Array', value);
        if (assertion) {
            value.forEach(assertion);
        }
    },
    buffer: (value) => assertType(is.buffer(value), 'Buffer', value),
    nullOrUndefined: (value) => assertType(is.nullOrUndefined(value), "null or undefined" /* nullOrUndefined */, value),
    object: (value) => assertType(is.object(value), 'Object', value),
    iterable: (value) => assertType(is.iterable(value), "Iterable" /* iterable */, value),
    asyncIterable: (value) => assertType(is.asyncIterable(value), "AsyncIterable" /* asyncIterable */, value),
    generator: (value) => assertType(is.generator(value), 'Generator', value),
    asyncGenerator: (value) => assertType(is.asyncGenerator(value), 'AsyncGenerator', value),
    nativePromise: (value) => assertType(is.nativePromise(value), "native Promise" /* nativePromise */, value),
    promise: (value) => assertType(is.promise(value), 'Promise', value),
    generatorFunction: (value) => assertType(is.generatorFunction(value), 'GeneratorFunction', value),
    asyncGeneratorFunction: (value) => assertType(is.asyncGeneratorFunction(value), 'AsyncGeneratorFunction', value),
    // eslint-disable-next-line @typescript-eslint/ban-types
    asyncFunction: (value) => assertType(is.asyncFunction(value), 'AsyncFunction', value),
    // eslint-disable-next-line @typescript-eslint/ban-types
    boundFunction: (value) => assertType(is.boundFunction(value), 'Function', value),
    regExp: (value) => assertType(is.regExp(value), 'RegExp', value),
    date: (value) => assertType(is.date(value), 'Date', value),
    error: (value) => assertType(is.error(value), 'Error', value),
    map: (value) => assertType(is.map(value), 'Map', value),
    set: (value) => assertType(is.set(value), 'Set', value),
    weakMap: (value) => assertType(is.weakMap(value), 'WeakMap', value),
    weakSet: (value) => assertType(is.weakSet(value), 'WeakSet', value),
    int8Array: (value) => assertType(is.int8Array(value), 'Int8Array', value),
    uint8Array: (value) => assertType(is.uint8Array(value), 'Uint8Array', value),
    uint8ClampedArray: (value) => assertType(is.uint8ClampedArray(value), 'Uint8ClampedArray', value),
    int16Array: (value) => assertType(is.int16Array(value), 'Int16Array', value),
    uint16Array: (value) => assertType(is.uint16Array(value), 'Uint16Array', value),
    int32Array: (value) => assertType(is.int32Array(value), 'Int32Array', value),
    uint32Array: (value) => assertType(is.uint32Array(value), 'Uint32Array', value),
    float32Array: (value) => assertType(is.float32Array(value), 'Float32Array', value),
    float64Array: (value) => assertType(is.float64Array(value), 'Float64Array', value),
    bigInt64Array: (value) => assertType(is.bigInt64Array(value), 'BigInt64Array', value),
    bigUint64Array: (value) => assertType(is.bigUint64Array(value), 'BigUint64Array', value),
    arrayBuffer: (value) => assertType(is.arrayBuffer(value), 'ArrayBuffer', value),
    sharedArrayBuffer: (value) => assertType(is.sharedArrayBuffer(value), 'SharedArrayBuffer', value),
    dataView: (value) => assertType(is.dataView(value), 'DataView', value),
    urlInstance: (value) => assertType(is.urlInstance(value), 'URL', value),
    urlString: (value) => assertType(is.urlString(value), "string with a URL" /* urlString */, value),
    truthy: (value) => assertType(is.truthy(value), "truthy" /* truthy */, value),
    falsy: (value) => assertType(is.falsy(value), "falsy" /* falsy */, value),
    nan: (value) => assertType(is.nan(value), "NaN" /* nan */, value),
    primitive: (value) => assertType(is.primitive(value), "primitive" /* primitive */, value),
    integer: (value) => assertType(is.integer(value), "integer" /* integer */, value),
    safeInteger: (value) => assertType(is.safeInteger(value), "integer" /* safeInteger */, value),
    plainObject: (value) => assertType(is.plainObject(value), "plain object" /* plainObject */, value),
    typedArray: (value) => assertType(is.typedArray(value), "TypedArray" /* typedArray */, value),
    arrayLike: (value) => assertType(is.arrayLike(value), "array-like" /* arrayLike */, value),
    domElement: (value) => assertType(is.domElement(value), "HTMLElement" /* domElement */, value),
    observable: (value) => assertType(is.observable(value), 'Observable', value),
    nodeStream: (value) => assertType(is.nodeStream(value), "Node.js Stream" /* nodeStream */, value),
    infinite: (value) => assertType(is.infinite(value), "infinite number" /* infinite */, value),
    emptyArray: (value) => assertType(is.emptyArray(value), "empty array" /* emptyArray */, value),
    nonEmptyArray: (value) => assertType(is.nonEmptyArray(value), "non-empty array" /* nonEmptyArray */, value),
    emptyString: (value) => assertType(is.emptyString(value), "empty string" /* emptyString */, value),
    nonEmptyString: (value) => assertType(is.nonEmptyString(value), "non-empty string" /* nonEmptyString */, value),
    emptyStringOrWhitespace: (value) => assertType(is.emptyStringOrWhitespace(value), "empty string or whitespace" /* emptyStringOrWhitespace */, value),
    emptyObject: (value) => assertType(is.emptyObject(value), "empty object" /* emptyObject */, value),
    nonEmptyObject: (value) => assertType(is.nonEmptyObject(value), "non-empty object" /* nonEmptyObject */, value),
    emptySet: (value) => assertType(is.emptySet(value), "empty set" /* emptySet */, value),
    nonEmptySet: (value) => assertType(is.nonEmptySet(value), "non-empty set" /* nonEmptySet */, value),
    emptyMap: (value) => assertType(is.emptyMap(value), "empty map" /* emptyMap */, value),
    nonEmptyMap: (value) => assertType(is.nonEmptyMap(value), "non-empty map" /* nonEmptyMap */, value),
    // Numbers.
    evenInteger: (value) => assertType(is.evenInteger(value), "even integer" /* evenInteger */, value),
    oddInteger: (value) => assertType(is.oddInteger(value), "odd integer" /* oddInteger */, value),
    // Two arguments.
    directInstanceOf: (instance, class_) => assertType(is.directInstanceOf(instance, class_), "T" /* directInstanceOf */, instance),
    inRange: (value, range) => assertType(is.inRange(value, range), "in range" /* inRange */, value),
    // Variadic functions.
    any: (predicate, ...values) => {
        return assertType(is.any(predicate, ...values), "predicate returns truthy for any value" /* any */, values, { multipleValues: true });
    },
    all: (predicate, ...values) => assertType(is.all(predicate, ...values), "predicate returns truthy for all values" /* all */, values, { multipleValues: true })
};
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
Object.defineProperties(exports.assert, {
    class: {
        value: exports.assert.class_
    },
    function: {
        value: exports.assert.function_
    },
    null: {
        value: exports.assert.null_
    }
});
exports.default = is;
// For CommonJS default export support
module.exports = is;
module.exports.default = is;
module.exports.assert = exports.assert;


/***/ }),

/***/ 8097:
/***/ ((module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const defer_to_connect_1 = __nccwpck_require__(6214);
const util_1 = __nccwpck_require__(1669);
const nodejsMajorVersion = Number(process.versions.node.split('.')[0]);
const timer = (request) => {
    if (request.timings) {
        return request.timings;
    }
    const timings = {
        start: Date.now(),
        socket: undefined,
        lookup: undefined,
        connect: undefined,
        secureConnect: undefined,
        upload: undefined,
        response: undefined,
        end: undefined,
        error: undefined,
        abort: undefined,
        phases: {
            wait: undefined,
            dns: undefined,
            tcp: undefined,
            tls: undefined,
            request: undefined,
            firstByte: undefined,
            download: undefined,
            total: undefined
        }
    };
    request.timings = timings;
    const handleError = (origin) => {
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
    handleError(request);
    const onAbort = () => {
        timings.abort = Date.now();
        // Let the `end` response event be responsible for setting the total phase,
        // unless the Node.js major version is >= 13.
        if (!timings.response || nodejsMajorVersion >= 13) {
            timings.phases.total = Date.now() - timings.start;
        }
    };
    request.prependOnceListener('abort', onAbort);
    const onSocket = (socket) => {
        timings.socket = Date.now();
        timings.phases.wait = timings.socket - timings.start;
        if (util_1.types.isProxy(socket)) {
            return;
        }
        const lookupListener = () => {
            timings.lookup = Date.now();
            timings.phases.dns = timings.lookup - timings.socket;
        };
        socket.prependOnceListener('lookup', lookupListener);
        defer_to_connect_1.default(socket, {
            connect: () => {
                timings.connect = Date.now();
                if (timings.lookup === undefined) {
                    socket.removeListener('lookup', lookupListener);
                    timings.lookup = timings.connect;
                    timings.phases.dns = timings.lookup - timings.socket;
                }
                timings.phases.tcp = timings.connect - timings.lookup;
                // This callback is called before flushing any data,
                // so we don't need to set `timings.phases.request` here.
            },
            secureConnect: () => {
                timings.secureConnect = Date.now();
                timings.phases.tls = timings.secureConnect - timings.connect;
            }
        });
    };
    if (request.socket) {
        onSocket(request.socket);
    }
    else {
        request.prependOnceListener('socket', onSocket);
    }
    const onUpload = () => {
        var _a;
        timings.upload = Date.now();
        timings.phases.request = timings.upload - ((_a = timings.secureConnect) !== null && _a !== void 0 ? _a : timings.connect);
    };
    const writableFinished = () => {
        if (typeof request.writableFinished === 'boolean') {
            return request.writableFinished;
        }
        // Node.js doesn't have `request.writableFinished` property
        return request.finished && request.outputSize === 0 && (!request.socket || request.socket.writableLength === 0);
    };
    if (writableFinished()) {
        onUpload();
    }
    else {
        request.prependOnceListener('finish', onUpload);
    }
    request.prependOnceListener('response', (response) => {
        timings.response = Date.now();
        timings.phases.firstByte = timings.response - timings.upload;
        response.timings = timings;
        handleError(response);
        response.prependOnceListener('end', () => {
            timings.end = Date.now();
            timings.phases.download = timings.end - timings.response;
            timings.phases.total = timings.end - timings.start;
        });
        response.prependOnceListener('aborted', onAbort);
    });
    return timings;
};
exports.default = timer;
// For CommonJS default export support
module.exports = timer;
module.exports.default = timer;


/***/ }),

/***/ 1231:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";

const indentString = __nccwpck_require__(8043);
const cleanStack = __nccwpck_require__(7972);

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

/***/ 2286:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";

const {
	V4MAPPED,
	ADDRCONFIG,
	ALL,
	promises: {
		Resolver: AsyncResolver
	},
	lookup: dnsLookup
} = __nccwpck_require__(881);
const {promisify} = __nccwpck_require__(1669);
const os = __nccwpck_require__(2087);

const kCacheableLookupCreateConnection = Symbol('cacheableLookupCreateConnection');
const kCacheableLookupInstance = Symbol('cacheableLookupInstance');
const kExpires = Symbol('expires');

const supportsALL = typeof ALL === 'number';

const verifyAgent = agent => {
	if (!(agent && typeof agent.createConnection === 'function')) {
		throw new Error('Expected an Agent instance as the first argument');
	}
};

const map4to6 = entries => {
	for (const entry of entries) {
		if (entry.family === 6) {
			continue;
		}

		entry.address = `::ffff:${entry.address}`;
		entry.family = 6;
	}
};

const getIfaceInfo = () => {
	let has4 = false;
	let has6 = false;

	for (const device of Object.values(os.networkInterfaces())) {
		for (const iface of device) {
			if (iface.internal) {
				continue;
			}

			if (iface.family === 'IPv6') {
				has6 = true;
			} else {
				has4 = true;
			}

			if (has4 && has6) {
				return {has4, has6};
			}
		}
	}

	return {has4, has6};
};

const isIterable = map => {
	return Symbol.iterator in map;
};

const ttl = {ttl: true};
const all = {all: true};

class CacheableLookup {
	constructor({
		cache = new Map(),
		maxTtl = Infinity,
		fallbackDuration = 3600,
		errorTtl = 0.15,
		resolver = new AsyncResolver(),
		lookup = dnsLookup
	} = {}) {
		this.maxTtl = maxTtl;
		this.errorTtl = errorTtl;

		this._cache = cache;
		this._resolver = resolver;
		this._dnsLookup = promisify(lookup);

		if (this._resolver instanceof AsyncResolver) {
			this._resolve4 = this._resolver.resolve4.bind(this._resolver);
			this._resolve6 = this._resolver.resolve6.bind(this._resolver);
		} else {
			this._resolve4 = promisify(this._resolver.resolve4.bind(this._resolver));
			this._resolve6 = promisify(this._resolver.resolve6.bind(this._resolver));
		}

		this._iface = getIfaceInfo();

		this._pending = {};
		this._nextRemovalTime = false;
		this._hostnamesToFallback = new Set();

		if (fallbackDuration < 1) {
			this._fallback = false;
		} else {
			this._fallback = true;

			const interval = setInterval(() => {
				this._hostnamesToFallback.clear();
			}, fallbackDuration * 1000);

			/* istanbul ignore next: There is no `interval.unref()` when running inside an Electron renderer */
			if (interval.unref) {
				interval.unref();
			}
		}

		this.lookup = this.lookup.bind(this);
		this.lookupAsync = this.lookupAsync.bind(this);
	}

	set servers(servers) {
		this.clear();

		this._resolver.setServers(servers);
	}

	get servers() {
		return this._resolver.getServers();
	}

	lookup(hostname, options, callback) {
		if (typeof options === 'function') {
			callback = options;
			options = {};
		} else if (typeof options === 'number') {
			options = {
				family: options
			};
		}

		if (!callback) {
			throw new Error('Callback must be a function.');
		}

		// eslint-disable-next-line promise/prefer-await-to-then
		this.lookupAsync(hostname, options).then(result => {
			if (options.all) {
				callback(null, result);
			} else {
				callback(null, result.address, result.family, result.expires, result.ttl);
			}
		}, callback);
	}

	async lookupAsync(hostname, options = {}) {
		if (typeof options === 'number') {
			options = {
				family: options
			};
		}

		let cached = await this.query(hostname);

		if (options.family === 6) {
			const filtered = cached.filter(entry => entry.family === 6);

			if (options.hints & V4MAPPED) {
				if ((supportsALL && options.hints & ALL) || filtered.length === 0) {
					map4to6(cached);
				} else {
					cached = filtered;
				}
			} else {
				cached = filtered;
			}
		} else if (options.family === 4) {
			cached = cached.filter(entry => entry.family === 4);
		}

		if (options.hints & ADDRCONFIG) {
			const {_iface} = this;
			cached = cached.filter(entry => entry.family === 6 ? _iface.has6 : _iface.has4);
		}

		if (cached.length === 0) {
			const error = new Error(`cacheableLookup ENOTFOUND ${hostname}`);
			error.code = 'ENOTFOUND';
			error.hostname = hostname;

			throw error;
		}

		if (options.all) {
			return cached;
		}

		return cached[0];
	}

	async query(hostname) {
		let cached = await this._cache.get(hostname);

		if (!cached) {
			const pending = this._pending[hostname];

			if (pending) {
				cached = await pending;
			} else {
				const newPromise = this.queryAndCache(hostname);
				this._pending[hostname] = newPromise;

				try {
					cached = await newPromise;
				} finally {
					delete this._pending[hostname];
				}
			}
		}

		cached = cached.map(entry => {
			return {...entry};
		});

		return cached;
	}

	async _resolve(hostname) {
		const wrap = async promise => {
			try {
				return await promise;
			} catch (error) {
				if (error.code === 'ENODATA' || error.code === 'ENOTFOUND') {
					return [];
				}

				throw error;
			}
		};

		// ANY is unsafe as it doesn't trigger new queries in the underlying server.
		const [A, AAAA] = await Promise.all([
			this._resolve4(hostname, ttl),
			this._resolve6(hostname, ttl)
		].map(promise => wrap(promise)));

		let aTtl = 0;
		let aaaaTtl = 0;
		let cacheTtl = 0;

		const now = Date.now();

		for (const entry of A) {
			entry.family = 4;
			entry.expires = now + (entry.ttl * 1000);

			aTtl = Math.max(aTtl, entry.ttl);
		}

		for (const entry of AAAA) {
			entry.family = 6;
			entry.expires = now + (entry.ttl * 1000);

			aaaaTtl = Math.max(aaaaTtl, entry.ttl);
		}

		if (A.length > 0) {
			if (AAAA.length > 0) {
				cacheTtl = Math.min(aTtl, aaaaTtl);
			} else {
				cacheTtl = aTtl;
			}
		} else {
			cacheTtl = aaaaTtl;
		}

		return {
			entries: [
				...A,
				...AAAA
			],
			cacheTtl
		};
	}

	async _lookup(hostname) {
		try {
			const entries = await this._dnsLookup(hostname, {
				all: true
			});

			return {
				entries,
				cacheTtl: 0
			};
		} catch (_) {
			return {
				entries: [],
				cacheTtl: 0
			};
		}
	}

	async _set(hostname, data, cacheTtl) {
		if (this.maxTtl > 0 && cacheTtl > 0) {
			cacheTtl = Math.min(cacheTtl, this.maxTtl) * 1000;
			data[kExpires] = Date.now() + cacheTtl;

			try {
				await this._cache.set(hostname, data, cacheTtl);
			} catch (error) {
				this.lookupAsync = async () => {
					const cacheError = new Error('Cache Error. Please recreate the CacheableLookup instance.');
					cacheError.cause = error;

					throw cacheError;
				};
			}

			if (isIterable(this._cache)) {
				this._tick(cacheTtl);
			}
		}
	}

	async queryAndCache(hostname) {
		if (this._hostnamesToFallback.has(hostname)) {
			return this._dnsLookup(hostname, all);
		}

		let query = await this._resolve(hostname);

		if (query.entries.length === 0 && this._fallback) {
			query = await this._lookup(hostname);

			if (query.entries.length !== 0) {
				// Use `dns.lookup(...)` for that particular hostname
				this._hostnamesToFallback.add(hostname);
			}
		}

		const cacheTtl = query.entries.length === 0 ? this.errorTtl : query.cacheTtl;
		await this._set(hostname, query.entries, cacheTtl);

		return query.entries;
	}

	_tick(ms) {
		const nextRemovalTime = this._nextRemovalTime;

		if (!nextRemovalTime || ms < nextRemovalTime) {
			clearTimeout(this._removalTimeout);

			this._nextRemovalTime = ms;

			this._removalTimeout = setTimeout(() => {
				this._nextRemovalTime = false;

				let nextExpiry = Infinity;

				const now = Date.now();

				for (const [hostname, entries] of this._cache) {
					const expires = entries[kExpires];

					if (now >= expires) {
						this._cache.delete(hostname);
					} else if (expires < nextExpiry) {
						nextExpiry = expires;
					}
				}

				if (nextExpiry !== Infinity) {
					this._tick(nextExpiry - now);
				}
			}, ms);

			/* istanbul ignore next: There is no `timeout.unref()` when running inside an Electron renderer */
			if (this._removalTimeout.unref) {
				this._removalTimeout.unref();
			}
		}
	}

	install(agent) {
		verifyAgent(agent);

		if (kCacheableLookupCreateConnection in agent) {
			throw new Error('CacheableLookup has been already installed');
		}

		agent[kCacheableLookupCreateConnection] = agent.createConnection;
		agent[kCacheableLookupInstance] = this;

		agent.createConnection = (options, callback) => {
			if (!('lookup' in options)) {
				options.lookup = this.lookup;
			}

			return agent[kCacheableLookupCreateConnection](options, callback);
		};
	}

	uninstall(agent) {
		verifyAgent(agent);

		if (agent[kCacheableLookupCreateConnection]) {
			if (agent[kCacheableLookupInstance] !== this) {
				throw new Error('The agent is not owned by this CacheableLookup instance');
			}

			agent.createConnection = agent[kCacheableLookupCreateConnection];

			delete agent[kCacheableLookupCreateConnection];
			delete agent[kCacheableLookupInstance];
		}
	}

	updateInterfaceInfo() {
		const {_iface} = this;

		this._iface = getIfaceInfo();

		if ((_iface.has4 && !this._iface.has4) || (_iface.has6 && !this._iface.has6)) {
			this._cache.clear();
		}
	}

	clear(hostname) {
		if (hostname) {
			this._cache.delete(hostname);
			return;
		}

		this._cache.clear();
	}
}

module.exports = CacheableLookup;
module.exports.default = CacheableLookup;


/***/ }),

/***/ 4340:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";

const {PassThrough: PassThroughStream} = __nccwpck_require__(2413);

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

/***/ 7040:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";

const {constants: BufferConstants} = __nccwpck_require__(4293);
const pump = __nccwpck_require__(8341);
const bufferStream = __nccwpck_require__(4340);

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
			// Don't retrieve an oversized buffer.
			if (error && stream.getBufferedLength() <= BufferConstants.MAX_LENGTH) {
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

/***/ 8116:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const EventEmitter = __nccwpck_require__(8614);
const urlLib = __nccwpck_require__(8835);
const normalizeUrl = __nccwpck_require__(7952);
const getStream = __nccwpck_require__(7040);
const CachePolicy = __nccwpck_require__(1002);
const Response = __nccwpck_require__(9004);
const lowercaseKeys = __nccwpck_require__(9662);
const cloneResponse = __nccwpck_require__(1312);
const Keyv = __nccwpck_require__(1531);

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

/***/ 7972:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";

const os = __nccwpck_require__(2087);

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

/***/ 1312:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const PassThrough = __nccwpck_require__(2413).PassThrough;
const mimicResponse = __nccwpck_require__(2610);

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

/***/ 2391:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";

const {Transform, PassThrough} = __nccwpck_require__(2413);
const zlib = __nccwpck_require__(8761);
const mimicResponse = __nccwpck_require__(3877);

module.exports = response => {
	const contentEncoding = (response.headers['content-encoding'] || '').toLowerCase();

	if (!['gzip', 'deflate', 'br'].includes(contentEncoding)) {
		return response;
	}

	// TODO: Remove this when targeting Node.js 12.
	const isBrotli = contentEncoding === 'br';
	if (isBrotli && typeof zlib.createBrotliDecompress !== 'function') {
		response.destroy(new Error('Brotli is not supported on Node.js < 12'));
		return response;
	}

	let isEmpty = true;

	const checker = new Transform({
		transform(data, _encoding, callback) {
			isEmpty = false;

			callback(null, data);
		},

		flush(callback) {
			callback();
		}
	});

	const finalStream = new PassThrough({
		autoDestroy: false,
		destroy(error, callback) {
			response.destroy();

			callback(error);
		}
	});

	const decompressStream = isBrotli ? zlib.createBrotliDecompress() : zlib.createUnzip();

	decompressStream.once('error', error => {
		if (isEmpty && !response.readable) {
			finalStream.end();
			return;
		}

		finalStream.destroy(error);
	});

	mimicResponse(response, finalStream);
	response.pipe(checker).pipe(decompressStream).pipe(finalStream);

	return finalStream;
};


/***/ }),

/***/ 3877:
/***/ ((module) => {

"use strict";


// We define these manually to ensure they're always copied
// even if they would move up the prototype chain
// https://nodejs.org/api/http.html#http_class_http_incomingmessage
const knownProperties = [
	'aborted',
	'complete',
	'headers',
	'httpVersion',
	'httpVersionMinor',
	'httpVersionMajor',
	'method',
	'rawHeaders',
	'rawTrailers',
	'setTimeout',
	'socket',
	'statusCode',
	'statusMessage',
	'trailers',
	'url'
];

module.exports = (fromStream, toStream) => {
	if (toStream._readableState.autoDestroy) {
		throw new Error('The second stream must have the `autoDestroy` option set to `false`');
	}

	const fromProperties = new Set(Object.keys(fromStream).concat(knownProperties));

	const properties = {};

	for (const property of fromProperties) {
		// Don't overwrite existing properties.
		if (property in toStream) {
			continue;
		}

		properties[property] = {
			get() {
				const value = fromStream[property];
				const isFunction = typeof value === 'function';

				return isFunction ? value.bind(fromStream) : value;
			},
			set(value) {
				fromStream[property] = value;
			},
			enumerable: true,
			configurable: false
		};
	}

	Object.defineProperties(toStream, properties);

	fromStream.once('aborted', () => {
		toStream.destroy();

		toStream.emit('aborted');
	});

	fromStream.once('close', () => {
		if (fromStream.complete) {
			if (toStream.readable) {
				toStream.once('end', () => {
					toStream.emit('close');
				});
			} else {
				toStream.emit('close');
			}
		} else {
			toStream.emit('close');
		}
	});

	return toStream;
};


/***/ }),

/***/ 6214:
/***/ ((module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
function isTLSSocket(socket) {
    return socket.encrypted;
}
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
        if (isTLSSocket(socket) && hasSecureConnectListener) {
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

/***/ 1205:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var once = __nccwpck_require__(1223);

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

/***/ 6457:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const types_1 = __nccwpck_require__(4597);
function createRejection(error, ...beforeErrorGroups) {
    const promise = (async () => {
        if (error instanceof types_1.RequestError) {
            try {
                for (const hooks of beforeErrorGroups) {
                    if (hooks) {
                        for (const hook of hooks) {
                            // eslint-disable-next-line no-await-in-loop
                            error = await hook(error);
                        }
                    }
                }
            }
            catch (error_) {
                error = error_;
            }
        }
        throw error;
    })();
    const returnPromise = () => promise;
    promise.json = returnPromise;
    promise.text = returnPromise;
    promise.buffer = returnPromise;
    promise.on = returnPromise;
    return promise;
}
exports.default = createRejection;


/***/ }),

/***/ 6056:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const events_1 = __nccwpck_require__(8614);
const is_1 = __nccwpck_require__(7678);
const PCancelable = __nccwpck_require__(9072);
const types_1 = __nccwpck_require__(4597);
const parse_body_1 = __nccwpck_require__(8220);
const core_1 = __nccwpck_require__(94);
const proxy_events_1 = __nccwpck_require__(3021);
const get_buffer_1 = __nccwpck_require__(4500);
const is_response_ok_1 = __nccwpck_require__(9298);
const proxiedRequestEvents = [
    'request',
    'response',
    'redirect',
    'uploadProgress',
    'downloadProgress'
];
function asPromise(normalizedOptions) {
    let globalRequest;
    let globalResponse;
    const emitter = new events_1.EventEmitter();
    const promise = new PCancelable((resolve, reject, onCancel) => {
        const makeRequest = (retryCount) => {
            const request = new core_1.default(undefined, normalizedOptions);
            request.retryCount = retryCount;
            request._noPipe = true;
            onCancel(() => request.destroy());
            onCancel.shouldReject = false;
            onCancel(() => reject(new types_1.CancelError(request)));
            globalRequest = request;
            request.once('response', async (response) => {
                var _a;
                response.retryCount = retryCount;
                if (response.request.aborted) {
                    // Canceled while downloading - will throw a `CancelError` or `TimeoutError` error
                    return;
                }
                // Download body
                let rawBody;
                try {
                    rawBody = await get_buffer_1.default(request);
                    response.rawBody = rawBody;
                }
                catch (_b) {
                    // The same error is caught below.
                    // See request.once('error')
                    return;
                }
                if (request._isAboutToError) {
                    return;
                }
                // Parse body
                const contentEncoding = ((_a = response.headers['content-encoding']) !== null && _a !== void 0 ? _a : '').toLowerCase();
                const isCompressed = ['gzip', 'deflate', 'br'].includes(contentEncoding);
                const { options } = request;
                if (isCompressed && !options.decompress) {
                    response.body = rawBody;
                }
                else {
                    try {
                        response.body = parse_body_1.default(response, options.responseType, options.parseJson, options.encoding);
                    }
                    catch (error) {
                        // Fallback to `utf8`
                        response.body = rawBody.toString();
                        if (is_response_ok_1.isResponseOk(response)) {
                            request._beforeError(error);
                            return;
                        }
                    }
                }
                try {
                    for (const [index, hook] of options.hooks.afterResponse.entries()) {
                        // @ts-expect-error TS doesn't notice that CancelableRequest is a Promise
                        // eslint-disable-next-line no-await-in-loop
                        response = await hook(response, async (updatedOptions) => {
                            const typedOptions = core_1.default.normalizeArguments(undefined, {
                                ...updatedOptions,
                                retry: {
                                    calculateDelay: () => 0
                                },
                                throwHttpErrors: false,
                                resolveBodyOnly: false
                            }, options);
                            // Remove any further hooks for that request, because we'll call them anyway.
                            // The loop continues. We don't want duplicates (asPromise recursion).
                            typedOptions.hooks.afterResponse = typedOptions.hooks.afterResponse.slice(0, index);
                            for (const hook of typedOptions.hooks.beforeRetry) {
                                // eslint-disable-next-line no-await-in-loop
                                await hook(typedOptions);
                            }
                            const promise = asPromise(typedOptions);
                            onCancel(() => {
                                promise.catch(() => { });
                                promise.cancel();
                            });
                            return promise;
                        });
                    }
                }
                catch (error) {
                    request._beforeError(new types_1.RequestError(error.message, error, request));
                    return;
                }
                if (!is_response_ok_1.isResponseOk(response)) {
                    request._beforeError(new types_1.HTTPError(response));
                    return;
                }
                globalResponse = response;
                resolve(request.options.resolveBodyOnly ? response.body : response);
            });
            const onError = (error) => {
                if (promise.isCanceled) {
                    return;
                }
                const { options } = request;
                if (error instanceof types_1.HTTPError && !options.throwHttpErrors) {
                    const { response } = error;
                    resolve(request.options.resolveBodyOnly ? response.body : response);
                    return;
                }
                reject(error);
            };
            request.once('error', onError);
            const previousBody = request.options.body;
            request.once('retry', (newRetryCount, error) => {
                var _a, _b;
                if (previousBody === ((_a = error.request) === null || _a === void 0 ? void 0 : _a.options.body) && is_1.default.nodeStream((_b = error.request) === null || _b === void 0 ? void 0 : _b.options.body)) {
                    onError(error);
                    return;
                }
                makeRequest(newRetryCount);
            });
            proxy_events_1.default(request, emitter, proxiedRequestEvents);
        };
        makeRequest(0);
    });
    promise.on = (event, fn) => {
        emitter.on(event, fn);
        return promise;
    };
    const shortcut = (responseType) => {
        const newPromise = (async () => {
            // Wait until downloading has ended
            await promise;
            const { options } = globalResponse.request;
            return parse_body_1.default(globalResponse, responseType, options.parseJson, options.encoding);
        })();
        Object.defineProperties(newPromise, Object.getOwnPropertyDescriptors(promise));
        return newPromise;
    };
    promise.json = () => {
        const { headers } = globalRequest.options;
        if (!globalRequest.writableFinished && headers.accept === undefined) {
            headers.accept = 'application/json';
        }
        return shortcut('json');
    };
    promise.buffer = () => shortcut('buffer');
    promise.text = () => shortcut('text');
    return promise;
}
exports.default = asPromise;
__exportStar(__nccwpck_require__(4597), exports);


/***/ }),

/***/ 1048:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const is_1 = __nccwpck_require__(7678);
const normalizeArguments = (options, defaults) => {
    if (is_1.default.null_(options.encoding)) {
        throw new TypeError('To get a Buffer, set `options.responseType` to `buffer` instead');
    }
    is_1.assert.any([is_1.default.string, is_1.default.undefined], options.encoding);
    is_1.assert.any([is_1.default.boolean, is_1.default.undefined], options.resolveBodyOnly);
    is_1.assert.any([is_1.default.boolean, is_1.default.undefined], options.methodRewriting);
    is_1.assert.any([is_1.default.boolean, is_1.default.undefined], options.isStream);
    is_1.assert.any([is_1.default.string, is_1.default.undefined], options.responseType);
    // `options.responseType`
    if (options.responseType === undefined) {
        options.responseType = 'text';
    }
    // `options.retry`
    const { retry } = options;
    if (defaults) {
        options.retry = { ...defaults.retry };
    }
    else {
        options.retry = {
            calculateDelay: retryObject => retryObject.computedValue,
            limit: 0,
            methods: [],
            statusCodes: [],
            errorCodes: [],
            maxRetryAfter: undefined
        };
    }
    if (is_1.default.object(retry)) {
        options.retry = {
            ...options.retry,
            ...retry
        };
        options.retry.methods = [...new Set(options.retry.methods.map(method => method.toUpperCase()))];
        options.retry.statusCodes = [...new Set(options.retry.statusCodes)];
        options.retry.errorCodes = [...new Set(options.retry.errorCodes)];
    }
    else if (is_1.default.number(retry)) {
        options.retry.limit = retry;
    }
    if (is_1.default.undefined(options.retry.maxRetryAfter)) {
        options.retry.maxRetryAfter = Math.min(
        // TypeScript is not smart enough to handle `.filter(x => is.number(x))`.
        // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
        ...[options.timeout.request, options.timeout.connect].filter(is_1.default.number));
    }
    // `options.pagination`
    if (is_1.default.object(options.pagination)) {
        if (defaults) {
            options.pagination = {
                ...defaults.pagination,
                ...options.pagination
            };
        }
        const { pagination } = options;
        if (!is_1.default.function_(pagination.transform)) {
            throw new Error('`options.pagination.transform` must be implemented');
        }
        if (!is_1.default.function_(pagination.shouldContinue)) {
            throw new Error('`options.pagination.shouldContinue` must be implemented');
        }
        if (!is_1.default.function_(pagination.filter)) {
            throw new TypeError('`options.pagination.filter` must be implemented');
        }
        if (!is_1.default.function_(pagination.paginate)) {
            throw new Error('`options.pagination.paginate` must be implemented');
        }
    }
    // JSON mode
    if (options.responseType === 'json' && options.headers.accept === undefined) {
        options.headers.accept = 'application/json';
    }
    return options;
};
exports.default = normalizeArguments;


/***/ }),

/***/ 8220:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const types_1 = __nccwpck_require__(4597);
const parseBody = (response, responseType, parseJson, encoding) => {
    const { rawBody } = response;
    try {
        if (responseType === 'text') {
            return rawBody.toString(encoding);
        }
        if (responseType === 'json') {
            return rawBody.length === 0 ? '' : parseJson(rawBody.toString());
        }
        if (responseType === 'buffer') {
            return rawBody;
        }
        throw new types_1.ParseError({
            message: `Unknown body type '${responseType}'`,
            name: 'Error'
        }, response);
    }
    catch (error) {
        throw new types_1.ParseError(error, response);
    }
};
exports.default = parseBody;


/***/ }),

/***/ 4597:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CancelError = exports.ParseError = void 0;
const core_1 = __nccwpck_require__(94);
/**
An error to be thrown when server response code is 2xx, and parsing body fails.
Includes a `response` property.
*/
class ParseError extends core_1.RequestError {
    constructor(error, response) {
        const { options } = response.request;
        super(`${error.message} in "${options.url.toString()}"`, error, response.request);
        this.name = 'ParseError';
    }
}
exports.ParseError = ParseError;
/**
An error to be thrown when the request is aborted with `.cancel()`.
*/
class CancelError extends core_1.RequestError {
    constructor(request) {
        super('Promise was canceled', {}, request);
        this.name = 'CancelError';
    }
    get isCanceled() {
        return true;
    }
}
exports.CancelError = CancelError;
__exportStar(__nccwpck_require__(94), exports);


/***/ }),

/***/ 3462:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.retryAfterStatusCodes = void 0;
exports.retryAfterStatusCodes = new Set([413, 429, 503]);
const calculateRetryDelay = ({ attemptCount, retryOptions, error, retryAfter }) => {
    if (attemptCount > retryOptions.limit) {
        return 0;
    }
    const hasMethod = retryOptions.methods.includes(error.options.method);
    const hasErrorCode = retryOptions.errorCodes.includes(error.code);
    const hasStatusCode = error.response && retryOptions.statusCodes.includes(error.response.statusCode);
    if (!hasMethod || (!hasErrorCode && !hasStatusCode)) {
        return 0;
    }
    if (error.response) {
        if (retryAfter) {
            if (retryOptions.maxRetryAfter === undefined || retryAfter > retryOptions.maxRetryAfter) {
                return 0;
            }
            return retryAfter;
        }
        if (error.response.statusCode === 413) {
            return 0;
        }
    }
    const noise = Math.random() * 100;
    return ((2 ** (attemptCount - 1)) * 1000) + noise;
};
exports.default = calculateRetryDelay;


/***/ }),

/***/ 94:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UnsupportedProtocolError = exports.ReadError = exports.TimeoutError = exports.UploadError = exports.CacheError = exports.HTTPError = exports.MaxRedirectsError = exports.RequestError = exports.setNonEnumerableProperties = exports.knownHookEvents = exports.withoutBody = exports.kIsNormalizedAlready = void 0;
const util_1 = __nccwpck_require__(1669);
const stream_1 = __nccwpck_require__(2413);
const fs_1 = __nccwpck_require__(5747);
const url_1 = __nccwpck_require__(8835);
const http = __nccwpck_require__(8605);
const http_1 = __nccwpck_require__(8605);
const https = __nccwpck_require__(7211);
const http_timer_1 = __nccwpck_require__(8097);
const cacheable_lookup_1 = __nccwpck_require__(2286);
const CacheableRequest = __nccwpck_require__(8116);
const decompressResponse = __nccwpck_require__(2391);
// @ts-expect-error Missing types
const http2wrapper = __nccwpck_require__(4645);
const lowercaseKeys = __nccwpck_require__(9662);
const is_1 = __nccwpck_require__(7678);
const get_body_size_1 = __nccwpck_require__(4564);
const is_form_data_1 = __nccwpck_require__(40);
const proxy_events_1 = __nccwpck_require__(3021);
const timed_out_1 = __nccwpck_require__(2454);
const url_to_options_1 = __nccwpck_require__(8026);
const options_to_url_1 = __nccwpck_require__(9219);
const weakable_map_1 = __nccwpck_require__(7288);
const get_buffer_1 = __nccwpck_require__(4500);
const dns_ip_version_1 = __nccwpck_require__(4993);
const is_response_ok_1 = __nccwpck_require__(9298);
const deprecation_warning_1 = __nccwpck_require__(397);
const normalize_arguments_1 = __nccwpck_require__(1048);
const calculate_retry_delay_1 = __nccwpck_require__(3462);
let globalDnsCache;
const kRequest = Symbol('request');
const kResponse = Symbol('response');
const kResponseSize = Symbol('responseSize');
const kDownloadedSize = Symbol('downloadedSize');
const kBodySize = Symbol('bodySize');
const kUploadedSize = Symbol('uploadedSize');
const kServerResponsesPiped = Symbol('serverResponsesPiped');
const kUnproxyEvents = Symbol('unproxyEvents');
const kIsFromCache = Symbol('isFromCache');
const kCancelTimeouts = Symbol('cancelTimeouts');
const kStartedReading = Symbol('startedReading');
const kStopReading = Symbol('stopReading');
const kTriggerRead = Symbol('triggerRead');
const kBody = Symbol('body');
const kJobs = Symbol('jobs');
const kOriginalResponse = Symbol('originalResponse');
const kRetryTimeout = Symbol('retryTimeout');
exports.kIsNormalizedAlready = Symbol('isNormalizedAlready');
const supportsBrotli = is_1.default.string(process.versions.brotli);
exports.withoutBody = new Set(['GET', 'HEAD']);
exports.knownHookEvents = [
    'init',
    'beforeRequest',
    'beforeRedirect',
    'beforeError',
    'beforeRetry',
    // Promise-Only
    'afterResponse'
];
function validateSearchParameters(searchParameters) {
    // eslint-disable-next-line guard-for-in
    for (const key in searchParameters) {
        const value = searchParameters[key];
        if (!is_1.default.string(value) && !is_1.default.number(value) && !is_1.default.boolean(value) && !is_1.default.null_(value) && !is_1.default.undefined(value)) {
            throw new TypeError(`The \`searchParams\` value '${String(value)}' must be a string, number, boolean or null`);
        }
    }
}
function isClientRequest(clientRequest) {
    return is_1.default.object(clientRequest) && !('statusCode' in clientRequest);
}
const cacheableStore = new weakable_map_1.default();
const waitForOpenFile = async (file) => new Promise((resolve, reject) => {
    const onError = (error) => {
        reject(error);
    };
    // Node.js 12 has incomplete types
    if (!file.pending) {
        resolve();
    }
    file.once('error', onError);
    file.once('ready', () => {
        file.off('error', onError);
        resolve();
    });
});
const redirectCodes = new Set([300, 301, 302, 303, 304, 307, 308]);
const nonEnumerableProperties = [
    'context',
    'body',
    'json',
    'form'
];
exports.setNonEnumerableProperties = (sources, to) => {
    // Non enumerable properties shall not be merged
    const properties = {};
    for (const source of sources) {
        if (!source) {
            continue;
        }
        for (const name of nonEnumerableProperties) {
            if (!(name in source)) {
                continue;
            }
            properties[name] = {
                writable: true,
                configurable: true,
                enumerable: false,
                // @ts-expect-error TS doesn't see the check above
                value: source[name]
            };
        }
    }
    Object.defineProperties(to, properties);
};
/**
An error to be thrown when a request fails.
Contains a `code` property with error class code, like `ECONNREFUSED`.
*/
class RequestError extends Error {
    constructor(message, error, self) {
        var _a;
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.name = 'RequestError';
        this.code = error.code;
        if (self instanceof Request) {
            Object.defineProperty(this, 'request', {
                enumerable: false,
                value: self
            });
            Object.defineProperty(this, 'response', {
                enumerable: false,
                value: self[kResponse]
            });
            Object.defineProperty(this, 'options', {
                // This fails because of TS 3.7.2 useDefineForClassFields
                // Ref: https://github.com/microsoft/TypeScript/issues/34972
                enumerable: false,
                value: self.options
            });
        }
        else {
            Object.defineProperty(this, 'options', {
                // This fails because of TS 3.7.2 useDefineForClassFields
                // Ref: https://github.com/microsoft/TypeScript/issues/34972
                enumerable: false,
                value: self
            });
        }
        this.timings = (_a = this.request) === null || _a === void 0 ? void 0 : _a.timings;
        // Recover the original stacktrace
        if (is_1.default.string(error.stack) && is_1.default.string(this.stack)) {
            const indexOfMessage = this.stack.indexOf(this.message) + this.message.length;
            const thisStackTrace = this.stack.slice(indexOfMessage).split('\n').reverse();
            const errorStackTrace = error.stack.slice(error.stack.indexOf(error.message) + error.message.length).split('\n').reverse();
            // Remove duplicated traces
            while (errorStackTrace.length !== 0 && errorStackTrace[0] === thisStackTrace[0]) {
                thisStackTrace.shift();
            }
            this.stack = `${this.stack.slice(0, indexOfMessage)}${thisStackTrace.reverse().join('\n')}${errorStackTrace.reverse().join('\n')}`;
        }
    }
}
exports.RequestError = RequestError;
/**
An error to be thrown when the server redirects you more than ten times.
Includes a `response` property.
*/
class MaxRedirectsError extends RequestError {
    constructor(request) {
        super(`Redirected ${request.options.maxRedirects} times. Aborting.`, {}, request);
        this.name = 'MaxRedirectsError';
    }
}
exports.MaxRedirectsError = MaxRedirectsError;
/**
An error to be thrown when the server response code is not 2xx nor 3xx if `options.followRedirect` is `true`, but always except for 304.
Includes a `response` property.
*/
class HTTPError extends RequestError {
    constructor(response) {
        super(`Response code ${response.statusCode} (${response.statusMessage})`, {}, response.request);
        this.name = 'HTTPError';
    }
}
exports.HTTPError = HTTPError;
/**
An error to be thrown when a cache method fails.
For example, if the database goes down or there's a filesystem error.
*/
class CacheError extends RequestError {
    constructor(error, request) {
        super(error.message, error, request);
        this.name = 'CacheError';
    }
}
exports.CacheError = CacheError;
/**
An error to be thrown when the request body is a stream and an error occurs while reading from that stream.
*/
class UploadError extends RequestError {
    constructor(error, request) {
        super(error.message, error, request);
        this.name = 'UploadError';
    }
}
exports.UploadError = UploadError;
/**
An error to be thrown when the request is aborted due to a timeout.
Includes an `event` and `timings` property.
*/
class TimeoutError extends RequestError {
    constructor(error, timings, request) {
        super(error.message, error, request);
        this.name = 'TimeoutError';
        this.event = error.event;
        this.timings = timings;
    }
}
exports.TimeoutError = TimeoutError;
/**
An error to be thrown when reading from response stream fails.
*/
class ReadError extends RequestError {
    constructor(error, request) {
        super(error.message, error, request);
        this.name = 'ReadError';
    }
}
exports.ReadError = ReadError;
/**
An error to be thrown when given an unsupported protocol.
*/
class UnsupportedProtocolError extends RequestError {
    constructor(options) {
        super(`Unsupported protocol "${options.url.protocol}"`, {}, options);
        this.name = 'UnsupportedProtocolError';
    }
}
exports.UnsupportedProtocolError = UnsupportedProtocolError;
const proxiedRequestEvents = [
    'socket',
    'connect',
    'continue',
    'information',
    'upgrade',
    'timeout'
];
class Request extends stream_1.Duplex {
    constructor(url, options = {}, defaults) {
        super({
            // This must be false, to enable throwing after destroy
            // It is used for retry logic in Promise API
            autoDestroy: false,
            // It needs to be zero because we're just proxying the data to another stream
            highWaterMark: 0
        });
        this[kDownloadedSize] = 0;
        this[kUploadedSize] = 0;
        this.requestInitialized = false;
        this[kServerResponsesPiped] = new Set();
        this.redirects = [];
        this[kStopReading] = false;
        this[kTriggerRead] = false;
        this[kJobs] = [];
        this.retryCount = 0;
        // TODO: Remove this when targeting Node.js >= 12
        this._progressCallbacks = [];
        const unlockWrite = () => this._unlockWrite();
        const lockWrite = () => this._lockWrite();
        this.on('pipe', (source) => {
            source.prependListener('data', unlockWrite);
            source.on('data', lockWrite);
            source.prependListener('end', unlockWrite);
            source.on('end', lockWrite);
        });
        this.on('unpipe', (source) => {
            source.off('data', unlockWrite);
            source.off('data', lockWrite);
            source.off('end', unlockWrite);
            source.off('end', lockWrite);
        });
        this.on('pipe', source => {
            if (source instanceof http_1.IncomingMessage) {
                this.options.headers = {
                    ...source.headers,
                    ...this.options.headers
                };
            }
        });
        const { json, body, form } = options;
        if (json || body || form) {
            this._lockWrite();
        }
        if (exports.kIsNormalizedAlready in options) {
            this.options = options;
        }
        else {
            try {
                // @ts-expect-error Common TypeScript bug saying that `this.constructor` is not accessible
                this.options = this.constructor.normalizeArguments(url, options, defaults);
            }
            catch (error) {
                // TODO: Move this to `_destroy()`
                if (is_1.default.nodeStream(options.body)) {
                    options.body.destroy();
                }
                this.destroy(error);
                return;
            }
        }
        (async () => {
            var _a;
            try {
                if (this.options.body instanceof fs_1.ReadStream) {
                    await waitForOpenFile(this.options.body);
                }
                const { url: normalizedURL } = this.options;
                if (!normalizedURL) {
                    throw new TypeError('Missing `url` property');
                }
                this.requestUrl = normalizedURL.toString();
                decodeURI(this.requestUrl);
                await this._finalizeBody();
                await this._makeRequest();
                if (this.destroyed) {
                    (_a = this[kRequest]) === null || _a === void 0 ? void 0 : _a.destroy();
                    return;
                }
                // Queued writes etc.
                for (const job of this[kJobs]) {
                    job();
                }
                // Prevent memory leak
                this[kJobs].length = 0;
                this.requestInitialized = true;
            }
            catch (error) {
                if (error instanceof RequestError) {
                    this._beforeError(error);
                    return;
                }
                // This is a workaround for https://github.com/nodejs/node/issues/33335
                if (!this.destroyed) {
                    this.destroy(error);
                }
            }
        })();
    }
    static normalizeArguments(url, options, defaults) {
        var _a, _b, _c, _d, _e;
        const rawOptions = options;
        if (is_1.default.object(url) && !is_1.default.urlInstance(url)) {
            options = { ...defaults, ...url, ...options };
        }
        else {
            if (url && options && options.url !== undefined) {
                throw new TypeError('The `url` option is mutually exclusive with the `input` argument');
            }
            options = { ...defaults, ...options };
            if (url !== undefined) {
                options.url = url;
            }
            if (is_1.default.urlInstance(options.url)) {
                options.url = new url_1.URL(options.url.toString());
            }
        }
        // TODO: Deprecate URL options in Got 12.
        // Support extend-specific options
        if (options.cache === false) {
            options.cache = undefined;
        }
        if (options.dnsCache === false) {
            options.dnsCache = undefined;
        }
        // Nice type assertions
        is_1.assert.any([is_1.default.string, is_1.default.undefined], options.method);
        is_1.assert.any([is_1.default.object, is_1.default.undefined], options.headers);
        is_1.assert.any([is_1.default.string, is_1.default.urlInstance, is_1.default.undefined], options.prefixUrl);
        is_1.assert.any([is_1.default.object, is_1.default.undefined], options.cookieJar);
        is_1.assert.any([is_1.default.object, is_1.default.string, is_1.default.undefined], options.searchParams);
        is_1.assert.any([is_1.default.object, is_1.default.string, is_1.default.undefined], options.cache);
        is_1.assert.any([is_1.default.object, is_1.default.number, is_1.default.undefined], options.timeout);
        is_1.assert.any([is_1.default.object, is_1.default.undefined], options.context);
        is_1.assert.any([is_1.default.object, is_1.default.undefined], options.hooks);
        is_1.assert.any([is_1.default.boolean, is_1.default.undefined], options.decompress);
        is_1.assert.any([is_1.default.boolean, is_1.default.undefined], options.ignoreInvalidCookies);
        is_1.assert.any([is_1.default.boolean, is_1.default.undefined], options.followRedirect);
        is_1.assert.any([is_1.default.number, is_1.default.undefined], options.maxRedirects);
        is_1.assert.any([is_1.default.boolean, is_1.default.undefined], options.throwHttpErrors);
        is_1.assert.any([is_1.default.boolean, is_1.default.undefined], options.http2);
        is_1.assert.any([is_1.default.boolean, is_1.default.undefined], options.allowGetBody);
        is_1.assert.any([is_1.default.string, is_1.default.undefined], options.localAddress);
        is_1.assert.any([dns_ip_version_1.isDnsLookupIpVersion, is_1.default.undefined], options.dnsLookupIpVersion);
        is_1.assert.any([is_1.default.object, is_1.default.undefined], options.https);
        is_1.assert.any([is_1.default.boolean, is_1.default.undefined], options.rejectUnauthorized);
        if (options.https) {
            is_1.assert.any([is_1.default.boolean, is_1.default.undefined], options.https.rejectUnauthorized);
            is_1.assert.any([is_1.default.function_, is_1.default.undefined], options.https.checkServerIdentity);
            is_1.assert.any([is_1.default.string, is_1.default.object, is_1.default.array, is_1.default.undefined], options.https.certificateAuthority);
            is_1.assert.any([is_1.default.string, is_1.default.object, is_1.default.array, is_1.default.undefined], options.https.key);
            is_1.assert.any([is_1.default.string, is_1.default.object, is_1.default.array, is_1.default.undefined], options.https.certificate);
            is_1.assert.any([is_1.default.string, is_1.default.undefined], options.https.passphrase);
            is_1.assert.any([is_1.default.string, is_1.default.buffer, is_1.default.array, is_1.default.undefined], options.https.pfx);
        }
        is_1.assert.any([is_1.default.object, is_1.default.undefined], options.cacheOptions);
        // `options.method`
        if (is_1.default.string(options.method)) {
            options.method = options.method.toUpperCase();
        }
        else {
            options.method = 'GET';
        }
        // `options.headers`
        if (options.headers === (defaults === null || defaults === void 0 ? void 0 : defaults.headers)) {
            options.headers = { ...options.headers };
        }
        else {
            options.headers = lowercaseKeys({ ...(defaults === null || defaults === void 0 ? void 0 : defaults.headers), ...options.headers });
        }
        // Disallow legacy `url.Url`
        if ('slashes' in options) {
            throw new TypeError('The legacy `url.Url` has been deprecated. Use `URL` instead.');
        }
        // `options.auth`
        if ('auth' in options) {
            throw new TypeError('Parameter `auth` is deprecated. Use `username` / `password` instead.');
        }
        // `options.searchParams`
        if ('searchParams' in options) {
            if (options.searchParams && options.searchParams !== (defaults === null || defaults === void 0 ? void 0 : defaults.searchParams)) {
                let searchParameters;
                if (is_1.default.string(options.searchParams) || (options.searchParams instanceof url_1.URLSearchParams)) {
                    searchParameters = new url_1.URLSearchParams(options.searchParams);
                }
                else {
                    validateSearchParameters(options.searchParams);
                    searchParameters = new url_1.URLSearchParams();
                    // eslint-disable-next-line guard-for-in
                    for (const key in options.searchParams) {
                        const value = options.searchParams[key];
                        if (value === null) {
                            searchParameters.append(key, '');
                        }
                        else if (value !== undefined) {
                            searchParameters.append(key, value);
                        }
                    }
                }
                // `normalizeArguments()` is also used to merge options
                (_a = defaults === null || defaults === void 0 ? void 0 : defaults.searchParams) === null || _a === void 0 ? void 0 : _a.forEach((value, key) => {
                    // Only use default if one isn't already defined
                    if (!searchParameters.has(key)) {
                        searchParameters.append(key, value);
                    }
                });
                options.searchParams = searchParameters;
            }
        }
        // `options.username` & `options.password`
        options.username = (_b = options.username) !== null && _b !== void 0 ? _b : '';
        options.password = (_c = options.password) !== null && _c !== void 0 ? _c : '';
        // `options.prefixUrl` & `options.url`
        if (is_1.default.undefined(options.prefixUrl)) {
            options.prefixUrl = (_d = defaults === null || defaults === void 0 ? void 0 : defaults.prefixUrl) !== null && _d !== void 0 ? _d : '';
        }
        else {
            options.prefixUrl = options.prefixUrl.toString();
            if (options.prefixUrl !== '' && !options.prefixUrl.endsWith('/')) {
                options.prefixUrl += '/';
            }
        }
        if (is_1.default.string(options.url)) {
            if (options.url.startsWith('/')) {
                throw new Error('`input` must not start with a slash when using `prefixUrl`');
            }
            options.url = options_to_url_1.default(options.prefixUrl + options.url, options);
        }
        else if ((is_1.default.undefined(options.url) && options.prefixUrl !== '') || options.protocol) {
            options.url = options_to_url_1.default(options.prefixUrl, options);
        }
        if (options.url) {
            if ('port' in options) {
                delete options.port;
            }
            // Make it possible to change `options.prefixUrl`
            let { prefixUrl } = options;
            Object.defineProperty(options, 'prefixUrl', {
                set: (value) => {
                    const url = options.url;
                    if (!url.href.startsWith(value)) {
                        throw new Error(`Cannot change \`prefixUrl\` from ${prefixUrl} to ${value}: ${url.href}`);
                    }
                    options.url = new url_1.URL(value + url.href.slice(prefixUrl.length));
                    prefixUrl = value;
                },
                get: () => prefixUrl
            });
            // Support UNIX sockets
            let { protocol } = options.url;
            if (protocol === 'unix:') {
                protocol = 'http:';
                options.url = new url_1.URL(`http://unix${options.url.pathname}${options.url.search}`);
            }
            // Set search params
            if (options.searchParams) {
                // eslint-disable-next-line @typescript-eslint/no-base-to-string
                options.url.search = options.searchParams.toString();
            }
            // Protocol check
            if (protocol !== 'http:' && protocol !== 'https:') {
                throw new UnsupportedProtocolError(options);
            }
            // Update `username`
            if (options.username === '') {
                options.username = options.url.username;
            }
            else {
                options.url.username = options.username;
            }
            // Update `password`
            if (options.password === '') {
                options.password = options.url.password;
            }
            else {
                options.url.password = options.password;
            }
        }
        // `options.cookieJar`
        const { cookieJar } = options;
        if (cookieJar) {
            let { setCookie, getCookieString } = cookieJar;
            is_1.assert.function_(setCookie);
            is_1.assert.function_(getCookieString);
            /* istanbul ignore next: Horrible `tough-cookie` v3 check */
            if (setCookie.length === 4 && getCookieString.length === 0) {
                setCookie = util_1.promisify(setCookie.bind(options.cookieJar));
                getCookieString = util_1.promisify(getCookieString.bind(options.cookieJar));
                options.cookieJar = {
                    setCookie,
                    getCookieString: getCookieString
                };
            }
        }
        // `options.cache`
        const { cache } = options;
        if (cache) {
            if (!cacheableStore.has(cache)) {
                cacheableStore.set(cache, new CacheableRequest(((requestOptions, handler) => {
                    const result = requestOptions[kRequest](requestOptions, handler);
                    // TODO: remove this when `cacheable-request` supports async request functions.
                    if (is_1.default.promise(result)) {
                        // @ts-expect-error
                        // We only need to implement the error handler in order to support HTTP2 caching.
                        // The result will be a promise anyway.
                        result.once = (event, handler) => {
                            if (event === 'error') {
                                result.catch(handler);
                            }
                            else if (event === 'abort') {
                                // The empty catch is needed here in case when
                                // it rejects before it's `await`ed in `_makeRequest`.
                                (async () => {
                                    try {
                                        const request = (await result);
                                        request.once('abort', handler);
                                    }
                                    catch (_a) { }
                                })();
                            }
                            else {
                                /* istanbul ignore next: safety check */
                                throw new Error(`Unknown HTTP2 promise event: ${event}`);
                            }
                            return result;
                        };
                    }
                    return result;
                }), cache));
            }
        }
        // `options.cacheOptions`
        options.cacheOptions = { ...options.cacheOptions };
        // `options.dnsCache`
        if (options.dnsCache === true) {
            if (!globalDnsCache) {
                globalDnsCache = new cacheable_lookup_1.default();
            }
            options.dnsCache = globalDnsCache;
        }
        else if (!is_1.default.undefined(options.dnsCache) && !options.dnsCache.lookup) {
            throw new TypeError(`Parameter \`dnsCache\` must be a CacheableLookup instance or a boolean, got ${is_1.default(options.dnsCache)}`);
        }
        // `options.timeout`
        if (is_1.default.number(options.timeout)) {
            options.timeout = { request: options.timeout };
        }
        else if (defaults && options.timeout !== defaults.timeout) {
            options.timeout = {
                ...defaults.timeout,
                ...options.timeout
            };
        }
        else {
            options.timeout = { ...options.timeout };
        }
        // `options.context`
        if (!options.context) {
            options.context = {};
        }
        // `options.hooks`
        const areHooksDefault = options.hooks === (defaults === null || defaults === void 0 ? void 0 : defaults.hooks);
        options.hooks = { ...options.hooks };
        for (const event of exports.knownHookEvents) {
            if (event in options.hooks) {
                if (is_1.default.array(options.hooks[event])) {
                    // See https://github.com/microsoft/TypeScript/issues/31445#issuecomment-576929044
                    options.hooks[event] = [...options.hooks[event]];
                }
                else {
                    throw new TypeError(`Parameter \`${event}\` must be an Array, got ${is_1.default(options.hooks[event])}`);
                }
            }
            else {
                options.hooks[event] = [];
            }
        }
        if (defaults && !areHooksDefault) {
            for (const event of exports.knownHookEvents) {
                const defaultHooks = defaults.hooks[event];
                if (defaultHooks.length > 0) {
                    // See https://github.com/microsoft/TypeScript/issues/31445#issuecomment-576929044
                    options.hooks[event] = [
                        ...defaults.hooks[event],
                        ...options.hooks[event]
                    ];
                }
            }
        }
        // DNS options
        if ('family' in options) {
            deprecation_warning_1.default('"options.family" was never documented, please use "options.dnsLookupIpVersion"');
        }
        // HTTPS options
        if (defaults === null || defaults === void 0 ? void 0 : defaults.https) {
            options.https = { ...defaults.https, ...options.https };
        }
        if ('rejectUnauthorized' in options) {
            deprecation_warning_1.default('"options.rejectUnauthorized" is now deprecated, please use "options.https.rejectUnauthorized"');
        }
        if ('checkServerIdentity' in options) {
            deprecation_warning_1.default('"options.checkServerIdentity" was never documented, please use "options.https.checkServerIdentity"');
        }
        if ('ca' in options) {
            deprecation_warning_1.default('"options.ca" was never documented, please use "options.https.certificateAuthority"');
        }
        if ('key' in options) {
            deprecation_warning_1.default('"options.key" was never documented, please use "options.https.key"');
        }
        if ('cert' in options) {
            deprecation_warning_1.default('"options.cert" was never documented, please use "options.https.certificate"');
        }
        if ('passphrase' in options) {
            deprecation_warning_1.default('"options.passphrase" was never documented, please use "options.https.passphrase"');
        }
        if ('pfx' in options) {
            deprecation_warning_1.default('"options.pfx" was never documented, please use "options.https.pfx"');
        }
        // Other options
        if ('followRedirects' in options) {
            throw new TypeError('The `followRedirects` option does not exist. Use `followRedirect` instead.');
        }
        if (options.agent) {
            for (const key in options.agent) {
                if (key !== 'http' && key !== 'https' && key !== 'http2') {
                    throw new TypeError(`Expected the \`options.agent\` properties to be \`http\`, \`https\` or \`http2\`, got \`${key}\``);
                }
            }
        }
        options.maxRedirects = (_e = options.maxRedirects) !== null && _e !== void 0 ? _e : 0;
        // Set non-enumerable properties
        exports.setNonEnumerableProperties([defaults, rawOptions], options);
        return normalize_arguments_1.default(options, defaults);
    }
    _lockWrite() {
        const onLockedWrite = () => {
            throw new TypeError('The payload has been already provided');
        };
        this.write = onLockedWrite;
        this.end = onLockedWrite;
    }
    _unlockWrite() {
        this.write = super.write;
        this.end = super.end;
    }
    async _finalizeBody() {
        const { options } = this;
        const { headers } = options;
        const isForm = !is_1.default.undefined(options.form);
        const isJSON = !is_1.default.undefined(options.json);
        const isBody = !is_1.default.undefined(options.body);
        const hasPayload = isForm || isJSON || isBody;
        const cannotHaveBody = exports.withoutBody.has(options.method) && !(options.method === 'GET' && options.allowGetBody);
        this._cannotHaveBody = cannotHaveBody;
        if (hasPayload) {
            if (cannotHaveBody) {
                throw new TypeError(`The \`${options.method}\` method cannot be used with a body`);
            }
            if ([isBody, isForm, isJSON].filter(isTrue => isTrue).length > 1) {
                throw new TypeError('The `body`, `json` and `form` options are mutually exclusive');
            }
            if (isBody &&
                !(options.body instanceof stream_1.Readable) &&
                !is_1.default.string(options.body) &&
                !is_1.default.buffer(options.body) &&
                !is_form_data_1.default(options.body)) {
                throw new TypeError('The `body` option must be a stream.Readable, string or Buffer');
            }
            if (isForm && !is_1.default.object(options.form)) {
                throw new TypeError('The `form` option must be an Object');
            }
            {
                // Serialize body
                const noContentType = !is_1.default.string(headers['content-type']);
                if (isBody) {
                    // Special case for https://github.com/form-data/form-data
                    if (is_form_data_1.default(options.body) && noContentType) {
                        headers['content-type'] = `multipart/form-data; boundary=${options.body.getBoundary()}`;
                    }
                    this[kBody] = options.body;
                }
                else if (isForm) {
                    if (noContentType) {
                        headers['content-type'] = 'application/x-www-form-urlencoded';
                    }
                    this[kBody] = (new url_1.URLSearchParams(options.form)).toString();
                }
                else {
                    if (noContentType) {
                        headers['content-type'] = 'application/json';
                    }
                    this[kBody] = options.stringifyJson(options.json);
                }
                const uploadBodySize = await get_body_size_1.default(this[kBody], options.headers);
                // See https://tools.ietf.org/html/rfc7230#section-3.3.2
                // A user agent SHOULD send a Content-Length in a request message when
                // no Transfer-Encoding is sent and the request method defines a meaning
                // for an enclosed payload body.  For example, a Content-Length header
                // field is normally sent in a POST request even when the value is 0
                // (indicating an empty payload body).  A user agent SHOULD NOT send a
                // Content-Length header field when the request message does not contain
                // a payload body and the method semantics do not anticipate such a
                // body.
                if (is_1.default.undefined(headers['content-length']) && is_1.default.undefined(headers['transfer-encoding'])) {
                    if (!cannotHaveBody && !is_1.default.undefined(uploadBodySize)) {
                        headers['content-length'] = String(uploadBodySize);
                    }
                }
            }
        }
        else if (cannotHaveBody) {
            this._lockWrite();
        }
        else {
            this._unlockWrite();
        }
        this[kBodySize] = Number(headers['content-length']) || undefined;
    }
    async _onResponseBase(response) {
        const { options } = this;
        const { url } = options;
        this[kOriginalResponse] = response;
        if (options.decompress) {
            response = decompressResponse(response);
        }
        const statusCode = response.statusCode;
        const typedResponse = response;
        typedResponse.statusMessage = typedResponse.statusMessage ? typedResponse.statusMessage : http.STATUS_CODES[statusCode];
        typedResponse.url = options.url.toString();
        typedResponse.requestUrl = this.requestUrl;
        typedResponse.redirectUrls = this.redirects;
        typedResponse.request = this;
        typedResponse.isFromCache = response.fromCache || false;
        typedResponse.ip = this.ip;
        typedResponse.retryCount = this.retryCount;
        this[kIsFromCache] = typedResponse.isFromCache;
        this[kResponseSize] = Number(response.headers['content-length']) || undefined;
        this[kResponse] = response;
        response.once('end', () => {
            this[kResponseSize] = this[kDownloadedSize];
            this.emit('downloadProgress', this.downloadProgress);
        });
        response.once('error', (error) => {
            // Force clean-up, because some packages don't do this.
            // TODO: Fix decompress-response
            response.destroy();
            this._beforeError(new ReadError(error, this));
        });
        response.once('aborted', () => {
            this._beforeError(new ReadError({
                name: 'Error',
                message: 'The server aborted pending request',
                code: 'ECONNRESET'
            }, this));
        });
        this.emit('downloadProgress', this.downloadProgress);
        const rawCookies = response.headers['set-cookie'];
        if (is_1.default.object(options.cookieJar) && rawCookies) {
            let promises = rawCookies.map(async (rawCookie) => options.cookieJar.setCookie(rawCookie, url.toString()));
            if (options.ignoreInvalidCookies) {
                promises = promises.map(async (p) => p.catch(() => { }));
            }
            try {
                await Promise.all(promises);
            }
            catch (error) {
                this._beforeError(error);
                return;
            }
        }
        if (options.followRedirect && response.headers.location && redirectCodes.has(statusCode)) {
            // We're being redirected, we don't care about the response.
            // It'd be best to abort the request, but we can't because
            // we would have to sacrifice the TCP connection. We don't want that.
            response.resume();
            if (this[kRequest]) {
                this[kCancelTimeouts]();
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete this[kRequest];
                this[kUnproxyEvents]();
            }
            const shouldBeGet = statusCode === 303 && options.method !== 'GET' && options.method !== 'HEAD';
            if (shouldBeGet || !options.methodRewriting) {
                // Server responded with "see other", indicating that the resource exists at another location,
                // and the client should request it from that location via GET or HEAD.
                options.method = 'GET';
                if ('body' in options) {
                    delete options.body;
                }
                if ('json' in options) {
                    delete options.json;
                }
                if ('form' in options) {
                    delete options.form;
                }
                this[kBody] = undefined;
                delete options.headers['content-length'];
            }
            if (this.redirects.length >= options.maxRedirects) {
                this._beforeError(new MaxRedirectsError(this));
                return;
            }
            try {
                // Do not remove. See https://github.com/sindresorhus/got/pull/214
                const redirectBuffer = Buffer.from(response.headers.location, 'binary').toString();
                // Handles invalid URLs. See https://github.com/sindresorhus/got/issues/604
                const redirectUrl = new url_1.URL(redirectBuffer, url);
                const redirectString = redirectUrl.toString();
                decodeURI(redirectString);
                // Redirecting to a different site, clear sensitive data.
                if (redirectUrl.hostname !== url.hostname || redirectUrl.port !== url.port) {
                    if ('host' in options.headers) {
                        delete options.headers.host;
                    }
                    if ('cookie' in options.headers) {
                        delete options.headers.cookie;
                    }
                    if ('authorization' in options.headers) {
                        delete options.headers.authorization;
                    }
                    if (options.username || options.password) {
                        options.username = '';
                        options.password = '';
                    }
                }
                else {
                    redirectUrl.username = options.username;
                    redirectUrl.password = options.password;
                }
                this.redirects.push(redirectString);
                options.url = redirectUrl;
                for (const hook of options.hooks.beforeRedirect) {
                    // eslint-disable-next-line no-await-in-loop
                    await hook(options, typedResponse);
                }
                this.emit('redirect', typedResponse, options);
                await this._makeRequest();
            }
            catch (error) {
                this._beforeError(error);
                return;
            }
            return;
        }
        if (options.isStream && options.throwHttpErrors && !is_response_ok_1.isResponseOk(typedResponse)) {
            this._beforeError(new HTTPError(typedResponse));
            return;
        }
        response.on('readable', () => {
            if (this[kTriggerRead]) {
                this._read();
            }
        });
        this.on('resume', () => {
            response.resume();
        });
        this.on('pause', () => {
            response.pause();
        });
        response.once('end', () => {
            this.push(null);
        });
        this.emit('response', response);
        for (const destination of this[kServerResponsesPiped]) {
            if (destination.headersSent) {
                continue;
            }
            // eslint-disable-next-line guard-for-in
            for (const key in response.headers) {
                const isAllowed = options.decompress ? key !== 'content-encoding' : true;
                const value = response.headers[key];
                if (isAllowed) {
                    destination.setHeader(key, value);
                }
            }
            destination.statusCode = statusCode;
        }
    }
    async _onResponse(response) {
        try {
            await this._onResponseBase(response);
        }
        catch (error) {
            /* istanbul ignore next: better safe than sorry */
            this._beforeError(error);
        }
    }
    _onRequest(request) {
        const { options } = this;
        const { timeout, url } = options;
        http_timer_1.default(request);
        this[kCancelTimeouts] = timed_out_1.default(request, timeout, url);
        const responseEventName = options.cache ? 'cacheableResponse' : 'response';
        request.once(responseEventName, (response) => {
            void this._onResponse(response);
        });
        request.once('error', (error) => {
            var _a;
            // Force clean-up, because some packages (e.g. nock) don't do this.
            request.destroy();
            // Node.js <= 12.18.2 mistakenly emits the response `end` first.
            (_a = request.res) === null || _a === void 0 ? void 0 : _a.removeAllListeners('end');
            error = error instanceof timed_out_1.TimeoutError ? new TimeoutError(error, this.timings, this) : new RequestError(error.message, error, this);
            this._beforeError(error);
        });
        this[kUnproxyEvents] = proxy_events_1.default(request, this, proxiedRequestEvents);
        this[kRequest] = request;
        this.emit('uploadProgress', this.uploadProgress);
        // Send body
        const body = this[kBody];
        const currentRequest = this.redirects.length === 0 ? this : request;
        if (is_1.default.nodeStream(body)) {
            body.pipe(currentRequest);
            body.once('error', (error) => {
                this._beforeError(new UploadError(error, this));
            });
        }
        else {
            this._unlockWrite();
            if (!is_1.default.undefined(body)) {
                this._writeRequest(body, undefined, () => { });
                currentRequest.end();
                this._lockWrite();
            }
            else if (this._cannotHaveBody || this._noPipe) {
                currentRequest.end();
                this._lockWrite();
            }
        }
        this.emit('request', request);
    }
    async _createCacheableRequest(url, options) {
        return new Promise((resolve, reject) => {
            // TODO: Remove `utils/url-to-options.ts` when `cacheable-request` is fixed
            Object.assign(options, url_to_options_1.default(url));
            // `http-cache-semantics` checks this
            // TODO: Fix this ignore.
            // @ts-expect-error
            delete options.url;
            let request;
            // This is ugly
            const cacheRequest = cacheableStore.get(options.cache)(options, async (response) => {
                // TODO: Fix `cacheable-response`
                response._readableState.autoDestroy = false;
                if (request) {
                    (await request).emit('cacheableResponse', response);
                }
                resolve(response);
            });
            // Restore options
            options.url = url;
            cacheRequest.once('error', reject);
            cacheRequest.once('request', async (requestOrPromise) => {
                request = requestOrPromise;
                resolve(request);
            });
        });
    }
    async _makeRequest() {
        var _a, _b, _c, _d, _e;
        const { options } = this;
        const { headers } = options;
        for (const key in headers) {
            if (is_1.default.undefined(headers[key])) {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete headers[key];
            }
            else if (is_1.default.null_(headers[key])) {
                throw new TypeError(`Use \`undefined\` instead of \`null\` to delete the \`${key}\` header`);
            }
        }
        if (options.decompress && is_1.default.undefined(headers['accept-encoding'])) {
            headers['accept-encoding'] = supportsBrotli ? 'gzip, deflate, br' : 'gzip, deflate';
        }
        // Set cookies
        if (options.cookieJar) {
            const cookieString = await options.cookieJar.getCookieString(options.url.toString());
            if (is_1.default.nonEmptyString(cookieString)) {
                options.headers.cookie = cookieString;
            }
        }
        for (const hook of options.hooks.beforeRequest) {
            // eslint-disable-next-line no-await-in-loop
            const result = await hook(options);
            if (!is_1.default.undefined(result)) {
                // @ts-expect-error Skip the type mismatch to support abstract responses
                options.request = () => result;
                break;
            }
        }
        if (options.body && this[kBody] !== options.body) {
            this[kBody] = options.body;
        }
        const { agent, request, timeout, url } = options;
        if (options.dnsCache && !('lookup' in options)) {
            options.lookup = options.dnsCache.lookup;
        }
        // UNIX sockets
        if (url.hostname === 'unix') {
            const matches = /(?<socketPath>.+?):(?<path>.+)/.exec(`${url.pathname}${url.search}`);
            if (matches === null || matches === void 0 ? void 0 : matches.groups) {
                const { socketPath, path } = matches.groups;
                Object.assign(options, {
                    socketPath,
                    path,
                    host: ''
                });
            }
        }
        const isHttps = url.protocol === 'https:';
        // Fallback function
        let fallbackFn;
        if (options.http2) {
            fallbackFn = http2wrapper.auto;
        }
        else {
            fallbackFn = isHttps ? https.request : http.request;
        }
        const realFn = (_a = options.request) !== null && _a !== void 0 ? _a : fallbackFn;
        // Cache support
        const fn = options.cache ? this._createCacheableRequest : realFn;
        // Pass an agent directly when HTTP2 is disabled
        if (agent && !options.http2) {
            options.agent = agent[isHttps ? 'https' : 'http'];
        }
        // Prepare plain HTTP request options
        options[kRequest] = realFn;
        delete options.request;
        // TODO: Fix this ignore.
        // @ts-expect-error
        delete options.timeout;
        const requestOptions = options;
        requestOptions.shared = (_b = options.cacheOptions) === null || _b === void 0 ? void 0 : _b.shared;
        requestOptions.cacheHeuristic = (_c = options.cacheOptions) === null || _c === void 0 ? void 0 : _c.cacheHeuristic;
        requestOptions.immutableMinTimeToLive = (_d = options.cacheOptions) === null || _d === void 0 ? void 0 : _d.immutableMinTimeToLive;
        requestOptions.ignoreCargoCult = (_e = options.cacheOptions) === null || _e === void 0 ? void 0 : _e.ignoreCargoCult;
        // If `dnsLookupIpVersion` is not present do not override `family`
        if (options.dnsLookupIpVersion !== undefined) {
            try {
                requestOptions.family = dns_ip_version_1.dnsLookupIpVersionToFamily(options.dnsLookupIpVersion);
            }
            catch (_f) {
                throw new Error('Invalid `dnsLookupIpVersion` option value');
            }
        }
        // HTTPS options remapping
        if (options.https) {
            if ('rejectUnauthorized' in options.https) {
                requestOptions.rejectUnauthorized = options.https.rejectUnauthorized;
            }
            if (options.https.checkServerIdentity) {
                requestOptions.checkServerIdentity = options.https.checkServerIdentity;
            }
            if (options.https.certificateAuthority) {
                requestOptions.ca = options.https.certificateAuthority;
            }
            if (options.https.certificate) {
                requestOptions.cert = options.https.certificate;
            }
            if (options.https.key) {
                requestOptions.key = options.https.key;
            }
            if (options.https.passphrase) {
                requestOptions.passphrase = options.https.passphrase;
            }
            if (options.https.pfx) {
                requestOptions.pfx = options.https.pfx;
            }
        }
        try {
            let requestOrResponse = await fn(url, requestOptions);
            if (is_1.default.undefined(requestOrResponse)) {
                requestOrResponse = fallbackFn(url, requestOptions);
            }
            // Restore options
            options.request = request;
            options.timeout = timeout;
            options.agent = agent;
            // HTTPS options restore
            if (options.https) {
                if ('rejectUnauthorized' in options.https) {
                    delete requestOptions.rejectUnauthorized;
                }
                if (options.https.checkServerIdentity) {
                    // @ts-expect-error - This one will be removed when we remove the alias.
                    delete requestOptions.checkServerIdentity;
                }
                if (options.https.certificateAuthority) {
                    delete requestOptions.ca;
                }
                if (options.https.certificate) {
                    delete requestOptions.cert;
                }
                if (options.https.key) {
                    delete requestOptions.key;
                }
                if (options.https.passphrase) {
                    delete requestOptions.passphrase;
                }
                if (options.https.pfx) {
                    delete requestOptions.pfx;
                }
            }
            if (isClientRequest(requestOrResponse)) {
                this._onRequest(requestOrResponse);
                // Emit the response after the stream has been ended
            }
            else if (this.writable) {
                this.once('finish', () => {
                    void this._onResponse(requestOrResponse);
                });
                this._unlockWrite();
                this.end();
                this._lockWrite();
            }
            else {
                void this._onResponse(requestOrResponse);
            }
        }
        catch (error) {
            if (error instanceof CacheableRequest.CacheError) {
                throw new CacheError(error, this);
            }
            throw new RequestError(error.message, error, this);
        }
    }
    async _error(error) {
        try {
            for (const hook of this.options.hooks.beforeError) {
                // eslint-disable-next-line no-await-in-loop
                error = await hook(error);
            }
        }
        catch (error_) {
            error = new RequestError(error_.message, error_, this);
        }
        this.destroy(error);
    }
    _beforeError(error) {
        if (this[kStopReading]) {
            return;
        }
        const { options } = this;
        const retryCount = this.retryCount + 1;
        this[kStopReading] = true;
        if (!(error instanceof RequestError)) {
            error = new RequestError(error.message, error, this);
        }
        const typedError = error;
        const { response } = typedError;
        void (async () => {
            if (response && !response.body) {
                response.setEncoding(this._readableState.encoding);
                try {
                    response.rawBody = await get_buffer_1.default(response);
                    response.body = response.rawBody.toString();
                }
                catch (_a) { }
            }
            if (this.listenerCount('retry') !== 0) {
                let backoff;
                try {
                    let retryAfter;
                    if (response && 'retry-after' in response.headers) {
                        retryAfter = Number(response.headers['retry-after']);
                        if (Number.isNaN(retryAfter)) {
                            retryAfter = Date.parse(response.headers['retry-after']) - Date.now();
                            if (retryAfter <= 0) {
                                retryAfter = 1;
                            }
                        }
                        else {
                            retryAfter *= 1000;
                        }
                    }
                    backoff = await options.retry.calculateDelay({
                        attemptCount: retryCount,
                        retryOptions: options.retry,
                        error: typedError,
                        retryAfter,
                        computedValue: calculate_retry_delay_1.default({
                            attemptCount: retryCount,
                            retryOptions: options.retry,
                            error: typedError,
                            retryAfter,
                            computedValue: 0
                        })
                    });
                }
                catch (error_) {
                    void this._error(new RequestError(error_.message, error_, this));
                    return;
                }
                if (backoff) {
                    const retry = async () => {
                        try {
                            for (const hook of this.options.hooks.beforeRetry) {
                                // eslint-disable-next-line no-await-in-loop
                                await hook(this.options, typedError, retryCount);
                            }
                        }
                        catch (error_) {
                            void this._error(new RequestError(error_.message, error, this));
                            return;
                        }
                        // Something forced us to abort the retry
                        if (this.destroyed) {
                            return;
                        }
                        this.destroy();
                        this.emit('retry', retryCount, error);
                    };
                    this[kRetryTimeout] = setTimeout(retry, backoff);
                    return;
                }
            }
            void this._error(typedError);
        })();
    }
    _read() {
        this[kTriggerRead] = true;
        const response = this[kResponse];
        if (response && !this[kStopReading]) {
            // We cannot put this in the `if` above
            // because `.read()` also triggers the `end` event
            if (response.readableLength) {
                this[kTriggerRead] = false;
            }
            let data;
            while ((data = response.read()) !== null) {
                this[kDownloadedSize] += data.length;
                this[kStartedReading] = true;
                const progress = this.downloadProgress;
                if (progress.percent < 1) {
                    this.emit('downloadProgress', progress);
                }
                this.push(data);
            }
        }
    }
    // Node.js 12 has incorrect types, so the encoding must be a string
    _write(chunk, encoding, callback) {
        const write = () => {
            this._writeRequest(chunk, encoding, callback);
        };
        if (this.requestInitialized) {
            write();
        }
        else {
            this[kJobs].push(write);
        }
    }
    _writeRequest(chunk, encoding, callback) {
        if (this[kRequest].destroyed) {
            // Probably the `ClientRequest` instance will throw
            return;
        }
        this._progressCallbacks.push(() => {
            this[kUploadedSize] += Buffer.byteLength(chunk, encoding);
            const progress = this.uploadProgress;
            if (progress.percent < 1) {
                this.emit('uploadProgress', progress);
            }
        });
        // TODO: What happens if it's from cache? Then this[kRequest] won't be defined.
        this[kRequest].write(chunk, encoding, (error) => {
            if (!error && this._progressCallbacks.length > 0) {
                this._progressCallbacks.shift()();
            }
            callback(error);
        });
    }
    _final(callback) {
        const endRequest = () => {
            // FIX: Node.js 10 calls the write callback AFTER the end callback!
            while (this._progressCallbacks.length !== 0) {
                this._progressCallbacks.shift()();
            }
            // We need to check if `this[kRequest]` is present,
            // because it isn't when we use cache.
            if (!(kRequest in this)) {
                callback();
                return;
            }
            if (this[kRequest].destroyed) {
                callback();
                return;
            }
            this[kRequest].end((error) => {
                if (!error) {
                    this[kBodySize] = this[kUploadedSize];
                    this.emit('uploadProgress', this.uploadProgress);
                    this[kRequest].emit('upload-complete');
                }
                callback(error);
            });
        };
        if (this.requestInitialized) {
            endRequest();
        }
        else {
            this[kJobs].push(endRequest);
        }
    }
    _destroy(error, callback) {
        var _a;
        this[kStopReading] = true;
        // Prevent further retries
        clearTimeout(this[kRetryTimeout]);
        if (kRequest in this) {
            this[kCancelTimeouts]();
            // TODO: Remove the next `if` when these get fixed:
            // - https://github.com/nodejs/node/issues/32851
            if (!((_a = this[kResponse]) === null || _a === void 0 ? void 0 : _a.complete)) {
                this[kRequest].destroy();
            }
        }
        if (error !== null && !is_1.default.undefined(error) && !(error instanceof RequestError)) {
            error = new RequestError(error.message, error, this);
        }
        callback(error);
    }
    get _isAboutToError() {
        return this[kStopReading];
    }
    /**
    The remote IP address.
    */
    get ip() {
        var _a;
        return (_a = this.socket) === null || _a === void 0 ? void 0 : _a.remoteAddress;
    }
    /**
    Indicates whether the request has been aborted or not.
    */
    get aborted() {
        var _a, _b, _c;
        return ((_b = (_a = this[kRequest]) === null || _a === void 0 ? void 0 : _a.destroyed) !== null && _b !== void 0 ? _b : this.destroyed) && !((_c = this[kOriginalResponse]) === null || _c === void 0 ? void 0 : _c.complete);
    }
    get socket() {
        var _a, _b;
        return (_b = (_a = this[kRequest]) === null || _a === void 0 ? void 0 : _a.socket) !== null && _b !== void 0 ? _b : undefined;
    }
    /**
    Progress event for downloading (receiving a response).
    */
    get downloadProgress() {
        let percent;
        if (this[kResponseSize]) {
            percent = this[kDownloadedSize] / this[kResponseSize];
        }
        else if (this[kResponseSize] === this[kDownloadedSize]) {
            percent = 1;
        }
        else {
            percent = 0;
        }
        return {
            percent,
            transferred: this[kDownloadedSize],
            total: this[kResponseSize]
        };
    }
    /**
    Progress event for uploading (sending a request).
    */
    get uploadProgress() {
        let percent;
        if (this[kBodySize]) {
            percent = this[kUploadedSize] / this[kBodySize];
        }
        else if (this[kBodySize] === this[kUploadedSize]) {
            percent = 1;
        }
        else {
            percent = 0;
        }
        return {
            percent,
            transferred: this[kUploadedSize],
            total: this[kBodySize]
        };
    }
    /**
    The object contains the following properties:

    - `start` - Time when the request started.
    - `socket` - Time when a socket was assigned to the request.
    - `lookup` - Time when the DNS lookup finished.
    - `connect` - Time when the socket successfully connected.
    - `secureConnect` - Time when the socket securely connected.
    - `upload` - Time when the request finished uploading.
    - `response` - Time when the request fired `response` event.
    - `end` - Time when the response fired `end` event.
    - `error` - Time when the request fired `error` event.
    - `abort` - Time when the request fired `abort` event.
    - `phases`
        - `wait` - `timings.socket - timings.start`
        - `dns` - `timings.lookup - timings.socket`
        - `tcp` - `timings.connect - timings.lookup`
        - `tls` - `timings.secureConnect - timings.connect`
        - `request` - `timings.upload - (timings.secureConnect || timings.connect)`
        - `firstByte` - `timings.response - timings.upload`
        - `download` - `timings.end - timings.response`
        - `total` - `(timings.end || timings.error || timings.abort) - timings.start`

    If something has not been measured yet, it will be `undefined`.

    __Note__: The time is a `number` representing the milliseconds elapsed since the UNIX epoch.
    */
    get timings() {
        var _a;
        return (_a = this[kRequest]) === null || _a === void 0 ? void 0 : _a.timings;
    }
    /**
    Whether the response was retrieved from the cache.
    */
    get isFromCache() {
        return this[kIsFromCache];
    }
    pipe(destination, options) {
        if (this[kStartedReading]) {
            throw new Error('Failed to pipe. The response has been emitted already.');
        }
        if (destination instanceof http_1.ServerResponse) {
            this[kServerResponsesPiped].add(destination);
        }
        return super.pipe(destination, options);
    }
    unpipe(destination) {
        if (destination instanceof http_1.ServerResponse) {
            this[kServerResponsesPiped].delete(destination);
        }
        super.unpipe(destination);
        return this;
    }
}
exports.default = Request;


/***/ }),

/***/ 4993:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.dnsLookupIpVersionToFamily = exports.isDnsLookupIpVersion = void 0;
const conversionTable = {
    auto: 0,
    ipv4: 4,
    ipv6: 6
};
exports.isDnsLookupIpVersion = (value) => {
    return value in conversionTable;
};
exports.dnsLookupIpVersionToFamily = (dnsLookupIpVersion) => {
    if (exports.isDnsLookupIpVersion(dnsLookupIpVersion)) {
        return conversionTable[dnsLookupIpVersion];
    }
    throw new Error('Invalid DNS lookup IP version');
};


/***/ }),

/***/ 4564:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const fs_1 = __nccwpck_require__(5747);
const util_1 = __nccwpck_require__(1669);
const is_1 = __nccwpck_require__(7678);
const is_form_data_1 = __nccwpck_require__(40);
const statAsync = util_1.promisify(fs_1.stat);
exports.default = async (body, headers) => {
    if (headers && 'content-length' in headers) {
        return Number(headers['content-length']);
    }
    if (!body) {
        return 0;
    }
    if (is_1.default.string(body)) {
        return Buffer.byteLength(body);
    }
    if (is_1.default.buffer(body)) {
        return body.length;
    }
    if (is_form_data_1.default(body)) {
        return util_1.promisify(body.getLength.bind(body))();
    }
    if (body instanceof fs_1.ReadStream) {
        const { size } = await statAsync(body.path);
        if (size === 0) {
            return undefined;
        }
        return size;
    }
    return undefined;
};


/***/ }),

/***/ 4500:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
// TODO: Update https://github.com/sindresorhus/get-stream
const getBuffer = async (stream) => {
    const chunks = [];
    let length = 0;
    for await (const chunk of stream) {
        chunks.push(chunk);
        length += Buffer.byteLength(chunk);
    }
    if (Buffer.isBuffer(chunks[0])) {
        return Buffer.concat(chunks, length);
    }
    return Buffer.from(chunks.join(''));
};
exports.default = getBuffer;


/***/ }),

/***/ 40:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const is_1 = __nccwpck_require__(7678);
exports.default = (body) => is_1.default.nodeStream(body) && is_1.default.function_(body.getBoundary);


/***/ }),

/***/ 9298:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isResponseOk = void 0;
exports.isResponseOk = (response) => {
    const { statusCode } = response;
    const limitStatusCode = response.request.options.followRedirect ? 299 : 399;
    return (statusCode >= 200 && statusCode <= limitStatusCode) || statusCode === 304;
};


/***/ }),

/***/ 9219:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
/* istanbul ignore file: deprecated */
const url_1 = __nccwpck_require__(8835);
const keys = [
    'protocol',
    'host',
    'hostname',
    'port',
    'pathname',
    'search'
];
exports.default = (origin, options) => {
    var _a, _b;
    if (options.path) {
        if (options.pathname) {
            throw new TypeError('Parameters `path` and `pathname` are mutually exclusive.');
        }
        if (options.search) {
            throw new TypeError('Parameters `path` and `search` are mutually exclusive.');
        }
        if (options.searchParams) {
            throw new TypeError('Parameters `path` and `searchParams` are mutually exclusive.');
        }
    }
    if (options.search && options.searchParams) {
        throw new TypeError('Parameters `search` and `searchParams` are mutually exclusive.');
    }
    if (!origin) {
        if (!options.protocol) {
            throw new TypeError('No URL protocol specified');
        }
        origin = `${options.protocol}//${(_b = (_a = options.hostname) !== null && _a !== void 0 ? _a : options.host) !== null && _b !== void 0 ? _b : ''}`;
    }
    const url = new url_1.URL(origin);
    if (options.path) {
        const searchIndex = options.path.indexOf('?');
        if (searchIndex === -1) {
            options.pathname = options.path;
        }
        else {
            options.pathname = options.path.slice(0, searchIndex);
            options.search = options.path.slice(searchIndex + 1);
        }
        delete options.path;
    }
    for (const key of keys) {
        if (options[key]) {
            url[key] = options[key].toString();
        }
    }
    return url;
};


/***/ }),

/***/ 3021:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
function default_1(from, to, events) {
    const fns = {};
    for (const event of events) {
        fns[event] = (...args) => {
            to.emit(event, ...args);
        };
        from.on(event, fns[event]);
    }
    return () => {
        for (const event of events) {
            from.off(event, fns[event]);
        }
    };
}
exports.default = default_1;


/***/ }),

/***/ 2454:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TimeoutError = void 0;
const net = __nccwpck_require__(1631);
const unhandle_1 = __nccwpck_require__(1593);
const reentry = Symbol('reentry');
const noop = () => { };
class TimeoutError extends Error {
    constructor(threshold, event) {
        super(`Timeout awaiting '${event}' for ${threshold}ms`);
        this.event = event;
        this.name = 'TimeoutError';
        this.code = 'ETIMEDOUT';
    }
}
exports.TimeoutError = TimeoutError;
exports.default = (request, delays, options) => {
    if (reentry in request) {
        return noop;
    }
    request[reentry] = true;
    const cancelers = [];
    const { once, unhandleAll } = unhandle_1.default();
    const addTimeout = (delay, callback, event) => {
        var _a;
        const timeout = setTimeout(callback, delay, delay, event);
        (_a = timeout.unref) === null || _a === void 0 ? void 0 : _a.call(timeout);
        const cancel = () => {
            clearTimeout(timeout);
        };
        cancelers.push(cancel);
        return cancel;
    };
    const { host, hostname } = options;
    const timeoutHandler = (delay, event) => {
        request.destroy(new TimeoutError(delay, event));
    };
    const cancelTimeouts = () => {
        for (const cancel of cancelers) {
            cancel();
        }
        unhandleAll();
    };
    request.once('error', error => {
        cancelTimeouts();
        // Save original behavior
        /* istanbul ignore next */
        if (request.listenerCount('error') === 0) {
            throw error;
        }
    });
    request.once('close', cancelTimeouts);
    once(request, 'response', (response) => {
        once(response, 'end', cancelTimeouts);
    });
    if (typeof delays.request !== 'undefined') {
        addTimeout(delays.request, timeoutHandler, 'request');
    }
    if (typeof delays.socket !== 'undefined') {
        const socketTimeoutHandler = () => {
            timeoutHandler(delays.socket, 'socket');
        };
        request.setTimeout(delays.socket, socketTimeoutHandler);
        // `request.setTimeout(0)` causes a memory leak.
        // We can just remove the listener and forget about the timer - it's unreffed.
        // See https://github.com/sindresorhus/got/issues/690
        cancelers.push(() => {
            request.removeListener('timeout', socketTimeoutHandler);
        });
    }
    once(request, 'socket', (socket) => {
        var _a;
        const { socketPath } = request;
        /* istanbul ignore next: hard to test */
        if (socket.connecting) {
            const hasPath = Boolean(socketPath !== null && socketPath !== void 0 ? socketPath : net.isIP((_a = hostname !== null && hostname !== void 0 ? hostname : host) !== null && _a !== void 0 ? _a : '') !== 0);
            if (typeof delays.lookup !== 'undefined' && !hasPath && typeof socket.address().address === 'undefined') {
                const cancelTimeout = addTimeout(delays.lookup, timeoutHandler, 'lookup');
                once(socket, 'lookup', cancelTimeout);
            }
            if (typeof delays.connect !== 'undefined') {
                const timeConnect = () => addTimeout(delays.connect, timeoutHandler, 'connect');
                if (hasPath) {
                    once(socket, 'connect', timeConnect());
                }
                else {
                    once(socket, 'lookup', (error) => {
                        if (error === null) {
                            once(socket, 'connect', timeConnect());
                        }
                    });
                }
            }
            if (typeof delays.secureConnect !== 'undefined' && options.protocol === 'https:') {
                once(socket, 'connect', () => {
                    const cancelTimeout = addTimeout(delays.secureConnect, timeoutHandler, 'secureConnect');
                    once(socket, 'secureConnect', cancelTimeout);
                });
            }
        }
        if (typeof delays.send !== 'undefined') {
            const timeRequest = () => addTimeout(delays.send, timeoutHandler, 'send');
            /* istanbul ignore next: hard to test */
            if (socket.connecting) {
                once(socket, 'connect', () => {
                    once(request, 'upload-complete', timeRequest());
                });
            }
            else {
                once(request, 'upload-complete', timeRequest());
            }
        }
    });
    if (typeof delays.response !== 'undefined') {
        once(request, 'upload-complete', () => {
            const cancelTimeout = addTimeout(delays.response, timeoutHandler, 'response');
            once(request, 'response', cancelTimeout);
        });
    }
    return cancelTimeouts;
};


/***/ }),

/***/ 1593:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
// When attaching listeners, it's very easy to forget about them.
// Especially if you do error handling and set timeouts.
// So instead of checking if it's proper to throw an error on every timeout ever,
// use this simple tool which will remove all listeners you have attached.
exports.default = () => {
    const handlers = [];
    return {
        once(origin, event, fn) {
            origin.once(event, fn);
            handlers.push({ origin, event, fn });
        },
        unhandleAll() {
            for (const handler of handlers) {
                const { origin, event, fn } = handler;
                origin.removeListener(event, fn);
            }
            handlers.length = 0;
        }
    };
};


/***/ }),

/***/ 8026:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const is_1 = __nccwpck_require__(7678);
exports.default = (url) => {
    // Cast to URL
    url = url;
    const options = {
        protocol: url.protocol,
        hostname: is_1.default.string(url.hostname) && url.hostname.startsWith('[') ? url.hostname.slice(1, -1) : url.hostname,
        host: url.host,
        hash: url.hash,
        search: url.search,
        pathname: url.pathname,
        href: url.href,
        path: `${url.pathname || ''}${url.search || ''}`
    };
    if (is_1.default.string(url.port) && url.port.length > 0) {
        options.port = Number(url.port);
    }
    if (url.username || url.password) {
        options.auth = `${url.username || ''}:${url.password || ''}`;
    }
    return options;
};


/***/ }),

/***/ 7288:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class WeakableMap {
    constructor() {
        this.weakMap = new WeakMap();
        this.map = new Map();
    }
    set(key, value) {
        if (typeof key === 'object') {
            this.weakMap.set(key, value);
        }
        else {
            this.map.set(key, value);
        }
    }
    get(key) {
        if (typeof key === 'object') {
            return this.weakMap.get(key);
        }
        return this.map.get(key);
    }
    has(key) {
        if (typeof key === 'object') {
            return this.weakMap.has(key);
        }
        return this.map.has(key);
    }
}
exports.default = WeakableMap;


/***/ }),

/***/ 4337:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.defaultHandler = void 0;
const is_1 = __nccwpck_require__(7678);
const as_promise_1 = __nccwpck_require__(6056);
const create_rejection_1 = __nccwpck_require__(6457);
const core_1 = __nccwpck_require__(94);
const deep_freeze_1 = __nccwpck_require__(285);
const errors = {
    RequestError: as_promise_1.RequestError,
    CacheError: as_promise_1.CacheError,
    ReadError: as_promise_1.ReadError,
    HTTPError: as_promise_1.HTTPError,
    MaxRedirectsError: as_promise_1.MaxRedirectsError,
    TimeoutError: as_promise_1.TimeoutError,
    ParseError: as_promise_1.ParseError,
    CancelError: as_promise_1.CancelError,
    UnsupportedProtocolError: as_promise_1.UnsupportedProtocolError,
    UploadError: as_promise_1.UploadError
};
// The `delay` package weighs 10KB (!)
const delay = async (ms) => new Promise(resolve => {
    setTimeout(resolve, ms);
});
const { normalizeArguments } = core_1.default;
const mergeOptions = (...sources) => {
    let mergedOptions;
    for (const source of sources) {
        mergedOptions = normalizeArguments(undefined, source, mergedOptions);
    }
    return mergedOptions;
};
const getPromiseOrStream = (options) => options.isStream ? new core_1.default(undefined, options) : as_promise_1.default(options);
const isGotInstance = (value) => ('defaults' in value && 'options' in value.defaults);
const aliases = [
    'get',
    'post',
    'put',
    'patch',
    'head',
    'delete'
];
exports.defaultHandler = (options, next) => next(options);
const callInitHooks = (hooks, options) => {
    if (hooks) {
        for (const hook of hooks) {
            hook(options);
        }
    }
};
const create = (defaults) => {
    // Proxy properties from next handlers
    defaults._rawHandlers = defaults.handlers;
    defaults.handlers = defaults.handlers.map(fn => ((options, next) => {
        // This will be assigned by assigning result
        let root;
        const result = fn(options, newOptions => {
            root = next(newOptions);
            return root;
        });
        if (result !== root && !options.isStream && root) {
            const typedResult = result;
            const { then: promiseThen, catch: promiseCatch, finally: promiseFianlly } = typedResult;
            Object.setPrototypeOf(typedResult, Object.getPrototypeOf(root));
            Object.defineProperties(typedResult, Object.getOwnPropertyDescriptors(root));
            // These should point to the new promise
            // eslint-disable-next-line promise/prefer-await-to-then
            typedResult.then = promiseThen;
            typedResult.catch = promiseCatch;
            typedResult.finally = promiseFianlly;
        }
        return result;
    }));
    // Got interface
    const got = ((url, options = {}, _defaults) => {
        var _a, _b;
        let iteration = 0;
        const iterateHandlers = (newOptions) => {
            return defaults.handlers[iteration++](newOptions, iteration === defaults.handlers.length ? getPromiseOrStream : iterateHandlers);
        };
        // TODO: Remove this in Got 12.
        if (is_1.default.plainObject(url)) {
            const mergedOptions = {
                ...url,
                ...options
            };
            core_1.setNonEnumerableProperties([url, options], mergedOptions);
            options = mergedOptions;
            url = undefined;
        }
        try {
            // Call `init` hooks
            let initHookError;
            try {
                callInitHooks(defaults.options.hooks.init, options);
                callInitHooks((_a = options.hooks) === null || _a === void 0 ? void 0 : _a.init, options);
            }
            catch (error) {
                initHookError = error;
            }
            // Normalize options & call handlers
            const normalizedOptions = normalizeArguments(url, options, _defaults !== null && _defaults !== void 0 ? _defaults : defaults.options);
            normalizedOptions[core_1.kIsNormalizedAlready] = true;
            if (initHookError) {
                throw new as_promise_1.RequestError(initHookError.message, initHookError, normalizedOptions);
            }
            return iterateHandlers(normalizedOptions);
        }
        catch (error) {
            if (options.isStream) {
                throw error;
            }
            else {
                return create_rejection_1.default(error, defaults.options.hooks.beforeError, (_b = options.hooks) === null || _b === void 0 ? void 0 : _b.beforeError);
            }
        }
    });
    got.extend = (...instancesOrOptions) => {
        const optionsArray = [defaults.options];
        let handlers = [...defaults._rawHandlers];
        let isMutableDefaults;
        for (const value of instancesOrOptions) {
            if (isGotInstance(value)) {
                optionsArray.push(value.defaults.options);
                handlers.push(...value.defaults._rawHandlers);
                isMutableDefaults = value.defaults.mutableDefaults;
            }
            else {
                optionsArray.push(value);
                if ('handlers' in value) {
                    handlers.push(...value.handlers);
                }
                isMutableDefaults = value.mutableDefaults;
            }
        }
        handlers = handlers.filter(handler => handler !== exports.defaultHandler);
        if (handlers.length === 0) {
            handlers.push(exports.defaultHandler);
        }
        return create({
            options: mergeOptions(...optionsArray),
            handlers,
            mutableDefaults: Boolean(isMutableDefaults)
        });
    };
    // Pagination
    const paginateEach = (async function* (url, options) {
        // TODO: Remove this `@ts-expect-error` when upgrading to TypeScript 4.
        // Error: Argument of type 'Merge<Options, PaginationOptions<T, R>> | undefined' is not assignable to parameter of type 'Options | undefined'.
        // @ts-expect-error
        let normalizedOptions = normalizeArguments(url, options, defaults.options);
        normalizedOptions.resolveBodyOnly = false;
        const pagination = normalizedOptions.pagination;
        if (!is_1.default.object(pagination)) {
            throw new TypeError('`options.pagination` must be implemented');
        }
        const all = [];
        let { countLimit } = pagination;
        let numberOfRequests = 0;
        while (numberOfRequests < pagination.requestLimit) {
            if (numberOfRequests !== 0) {
                // eslint-disable-next-line no-await-in-loop
                await delay(pagination.backoff);
            }
            // @ts-expect-error FIXME!
            // TODO: Throw when result is not an instance of Response
            // eslint-disable-next-line no-await-in-loop
            const result = (await got(undefined, undefined, normalizedOptions));
            // eslint-disable-next-line no-await-in-loop
            const parsed = await pagination.transform(result);
            const current = [];
            for (const item of parsed) {
                if (pagination.filter(item, all, current)) {
                    if (!pagination.shouldContinue(item, all, current)) {
                        return;
                    }
                    yield item;
                    if (pagination.stackAllItems) {
                        all.push(item);
                    }
                    current.push(item);
                    if (--countLimit <= 0) {
                        return;
                    }
                }
            }
            const optionsToMerge = pagination.paginate(result, all, current);
            if (optionsToMerge === false) {
                return;
            }
            if (optionsToMerge === result.request.options) {
                normalizedOptions = result.request.options;
            }
            else if (optionsToMerge !== undefined) {
                normalizedOptions = normalizeArguments(undefined, optionsToMerge, normalizedOptions);
            }
            numberOfRequests++;
        }
    });
    got.paginate = paginateEach;
    got.paginate.all = (async (url, options) => {
        const results = [];
        for await (const item of paginateEach(url, options)) {
            results.push(item);
        }
        return results;
    });
    // For those who like very descriptive names
    got.paginate.each = paginateEach;
    // Stream API
    got.stream = ((url, options) => got(url, { ...options, isStream: true }));
    // Shortcuts
    for (const method of aliases) {
        got[method] = ((url, options) => got(url, { ...options, method }));
        got.stream[method] = ((url, options) => {
            return got(url, { ...options, method, isStream: true });
        });
    }
    Object.assign(got, errors);
    Object.defineProperty(got, 'defaults', {
        value: defaults.mutableDefaults ? defaults : deep_freeze_1.default(defaults),
        writable: defaults.mutableDefaults,
        configurable: defaults.mutableDefaults,
        enumerable: true
    });
    got.mergeOptions = mergeOptions;
    return got;
};
exports.default = create;
__exportStar(__nccwpck_require__(2613), exports);


/***/ }),

/***/ 3061:
/***/ (function(module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const url_1 = __nccwpck_require__(8835);
const create_1 = __nccwpck_require__(4337);
const defaults = {
    options: {
        method: 'GET',
        retry: {
            limit: 2,
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
                504,
                521,
                522,
                524
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
            ],
            maxRetryAfter: undefined,
            calculateDelay: ({ computedValue }) => computedValue
        },
        timeout: {},
        headers: {
            'user-agent': 'got (https://github.com/sindresorhus/got)'
        },
        hooks: {
            init: [],
            beforeRequest: [],
            beforeRedirect: [],
            beforeRetry: [],
            beforeError: [],
            afterResponse: []
        },
        cache: undefined,
        dnsCache: undefined,
        decompress: true,
        throwHttpErrors: true,
        followRedirect: true,
        isStream: false,
        responseType: 'text',
        resolveBodyOnly: false,
        maxRedirects: 10,
        prefixUrl: '',
        methodRewriting: true,
        ignoreInvalidCookies: false,
        context: {},
        // TODO: Set this to `true` when Got 12 gets released
        http2: false,
        allowGetBody: false,
        https: undefined,
        pagination: {
            transform: (response) => {
                if (response.request.options.responseType === 'json') {
                    return response.body;
                }
                return JSON.parse(response.body);
            },
            paginate: response => {
                if (!Reflect.has(response.headers, 'link')) {
                    return false;
                }
                const items = response.headers.link.split(',');
                let next;
                for (const item of items) {
                    const parsed = item.split(';');
                    if (parsed[1].includes('next')) {
                        next = parsed[0].trimStart().trim();
                        next = next.slice(1, -1);
                        break;
                    }
                }
                if (next) {
                    const options = {
                        url: new url_1.URL(next)
                    };
                    return options;
                }
                return false;
            },
            filter: () => true,
            shouldContinue: () => true,
            countLimit: Infinity,
            backoff: 0,
            requestLimit: 10000,
            stackAllItems: true
        },
        parseJson: (text) => JSON.parse(text),
        stringifyJson: (object) => JSON.stringify(object),
        cacheOptions: {}
    },
    handlers: [create_1.defaultHandler],
    mutableDefaults: false
};
const got = create_1.default(defaults);
exports.default = got;
// For CommonJS default export support
module.exports = got;
module.exports.default = got;
module.exports.__esModule = true; // Workaround for TS issue: https://github.com/sindresorhus/got/pull/1267
__exportStar(__nccwpck_require__(4337), exports);
__exportStar(__nccwpck_require__(6056), exports);


/***/ }),

/***/ 2613:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ 285:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const is_1 = __nccwpck_require__(7678);
function deepFreeze(object) {
    for (const value of Object.values(object)) {
        if (is_1.default.plainObject(value) || is_1.default.array(value)) {
            deepFreeze(value);
        }
    }
    return Object.freeze(object);
}
exports.default = deepFreeze;


/***/ }),

/***/ 397:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const alreadyWarned = new Set();
exports.default = (message) => {
    if (alreadyWarned.has(message)) {
        return;
    }
    alreadyWarned.add(message);
    // @ts-expect-error Missing types.
    process.emitWarning(`Got: ${message}`, {
        type: 'DeprecationWarning'
    });
};


/***/ }),

/***/ 1002:
/***/ ((module) => {

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

/***/ 9898:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";

const EventEmitter = __nccwpck_require__(8614);
const tls = __nccwpck_require__(4016);
const http2 = __nccwpck_require__(7565);
const QuickLRU = __nccwpck_require__(9273);

const kCurrentStreamsCount = Symbol('currentStreamsCount');
const kRequest = Symbol('request');
const kOriginSet = Symbol('cachedOriginSet');
const kGracefullyClosing = Symbol('gracefullyClosing');

const nameKeys = [
	// `http2.connect()` options
	'maxDeflateDynamicTableSize',
	'maxSessionMemory',
	'maxHeaderListPairs',
	'maxOutstandingPings',
	'maxReservedRemoteStreams',
	'maxSendHeaderBlockLength',
	'paddingStrategy',

	// `tls.connect()` options
	'localAddress',
	'path',
	'rejectUnauthorized',
	'minDHSize',

	// `tls.createSecureContext()` options
	'ca',
	'cert',
	'clientCertEngine',
	'ciphers',
	'key',
	'pfx',
	'servername',
	'minVersion',
	'maxVersion',
	'secureProtocol',
	'crl',
	'honorCipherOrder',
	'ecdhCurve',
	'dhparam',
	'secureOptions',
	'sessionIdContext'
];

const getSortedIndex = (array, value, compare) => {
	let low = 0;
	let high = array.length;

	while (low < high) {
		const mid = (low + high) >>> 1;

		/* istanbul ignore next */
		if (compare(array[mid], value)) {
			// This never gets called because we use descending sort. Better to have this anyway.
			low = mid + 1;
		} else {
			high = mid;
		}
	}

	return low;
};

const compareSessions = (a, b) => {
	return a.remoteSettings.maxConcurrentStreams > b.remoteSettings.maxConcurrentStreams;
};

// See https://tools.ietf.org/html/rfc8336
const closeCoveredSessions = (where, session) => {
	// Clients SHOULD NOT emit new requests on any connection whose Origin
	// Set is a proper subset of another connection's Origin Set, and they
	// SHOULD close it once all outstanding requests are satisfied.
	for (const coveredSession of where) {
		if (
			// The set is a proper subset when its length is less than the other set.
			coveredSession[kOriginSet].length < session[kOriginSet].length &&

			// And the other set includes all elements of the subset.
			coveredSession[kOriginSet].every(origin => session[kOriginSet].includes(origin)) &&

			// Makes sure that the session can handle all requests from the covered session.
			coveredSession[kCurrentStreamsCount] + session[kCurrentStreamsCount] <= session.remoteSettings.maxConcurrentStreams
		) {
			// This allows pending requests to finish and prevents making new requests.
			gracefullyClose(coveredSession);
		}
	}
};

// This is basically inverted `closeCoveredSessions(...)`.
const closeSessionIfCovered = (where, coveredSession) => {
	for (const session of where) {
		if (
			coveredSession[kOriginSet].length < session[kOriginSet].length &&
			coveredSession[kOriginSet].every(origin => session[kOriginSet].includes(origin)) &&
			coveredSession[kCurrentStreamsCount] + session[kCurrentStreamsCount] <= session.remoteSettings.maxConcurrentStreams
		) {
			gracefullyClose(coveredSession);
		}
	}
};

const getSessions = ({agent, isFree}) => {
	const result = {};

	// eslint-disable-next-line guard-for-in
	for (const normalizedOptions in agent.sessions) {
		const sessions = agent.sessions[normalizedOptions];

		const filtered = sessions.filter(session => {
			const result = session[Agent.kCurrentStreamsCount] < session.remoteSettings.maxConcurrentStreams;

			return isFree ? result : !result;
		});

		if (filtered.length !== 0) {
			result[normalizedOptions] = filtered;
		}
	}

	return result;
};

const gracefullyClose = session => {
	session[kGracefullyClosing] = true;

	if (session[kCurrentStreamsCount] === 0) {
		session.close();
	}
};

class Agent extends EventEmitter {
	constructor({timeout = 60000, maxSessions = Infinity, maxFreeSessions = 10, maxCachedTlsSessions = 100} = {}) {
		super();

		// A session is considered busy when its current streams count
		// is equal to or greater than the `maxConcurrentStreams` value.

		// A session is considered free when its current streams count
		// is less than the `maxConcurrentStreams` value.

		// SESSIONS[NORMALIZED_OPTIONS] = [];
		this.sessions = {};

		// The queue for creating new sessions. It looks like this:
		// QUEUE[NORMALIZED_OPTIONS][NORMALIZED_ORIGIN] = ENTRY_FUNCTION
		//
		// The entry function has `listeners`, `completed` and `destroyed` properties.
		// `listeners` is an array of objects containing `resolve` and `reject` functions.
		// `completed` is a boolean. It's set to true after ENTRY_FUNCTION is executed.
		// `destroyed` is a boolean. If it's set to true, the session will be destroyed if hasn't connected yet.
		this.queue = {};

		// Each session will use this timeout value.
		this.timeout = timeout;

		// Max sessions in total
		this.maxSessions = maxSessions;

		// Max free sessions in total
		// TODO: decreasing `maxFreeSessions` should close some sessions
		this.maxFreeSessions = maxFreeSessions;

		this._freeSessionsCount = 0;
		this._sessionsCount = 0;

		// We don't support push streams by default.
		this.settings = {
			enablePush: false
		};

		// Reusing TLS sessions increases performance.
		this.tlsSessionCache = new QuickLRU({maxSize: maxCachedTlsSessions});
	}

	static normalizeOrigin(url, servername) {
		if (typeof url === 'string') {
			url = new URL(url);
		}

		if (servername && url.hostname !== servername) {
			url.hostname = servername;
		}

		return url.origin;
	}

	normalizeOptions(options) {
		let normalized = '';

		if (options) {
			for (const key of nameKeys) {
				if (options[key]) {
					normalized += `:${options[key]}`;
				}
			}
		}

		return normalized;
	}

	_tryToCreateNewSession(normalizedOptions, normalizedOrigin) {
		if (!(normalizedOptions in this.queue) || !(normalizedOrigin in this.queue[normalizedOptions])) {
			return;
		}

		const item = this.queue[normalizedOptions][normalizedOrigin];

		// The entry function can be run only once.
		// BUG: The session may be never created when:
		// - the first condition is false AND
		// - this function is never called with the same arguments in the future.
		if (this._sessionsCount < this.maxSessions && !item.completed) {
			item.completed = true;

			item();
		}
	}

	getSession(origin, options, listeners) {
		return new Promise((resolve, reject) => {
			if (Array.isArray(listeners)) {
				listeners = [...listeners];

				// Resolve the current promise ASAP, we're just moving the listeners.
				// They will be executed at a different time.
				resolve();
			} else {
				listeners = [{resolve, reject}];
			}

			const normalizedOptions = this.normalizeOptions(options);
			const normalizedOrigin = Agent.normalizeOrigin(origin, options && options.servername);

			if (normalizedOrigin === undefined) {
				for (const {reject} of listeners) {
					reject(new TypeError('The `origin` argument needs to be a string or an URL object'));
				}

				return;
			}

			if (normalizedOptions in this.sessions) {
				const sessions = this.sessions[normalizedOptions];

				let maxConcurrentStreams = -1;
				let currentStreamsCount = -1;
				let optimalSession;

				// We could just do this.sessions[normalizedOptions].find(...) but that isn't optimal.
				// Additionally, we are looking for session which has biggest current pending streams count.
				for (const session of sessions) {
					const sessionMaxConcurrentStreams = session.remoteSettings.maxConcurrentStreams;

					if (sessionMaxConcurrentStreams < maxConcurrentStreams) {
						break;
					}

					if (session[kOriginSet].includes(normalizedOrigin)) {
						const sessionCurrentStreamsCount = session[kCurrentStreamsCount];

						if (
							sessionCurrentStreamsCount >= sessionMaxConcurrentStreams ||
							session[kGracefullyClosing] ||
							// Unfortunately the `close` event isn't called immediately,
							// so `session.destroyed` is `true`, but `session.closed` is `false`.
							session.destroyed
						) {
							continue;
						}

						// We only need set this once.
						if (!optimalSession) {
							maxConcurrentStreams = sessionMaxConcurrentStreams;
						}

						// We're looking for the session which has biggest current pending stream count,
						// in order to minimalize the amount of active sessions.
						if (sessionCurrentStreamsCount > currentStreamsCount) {
							optimalSession = session;
							currentStreamsCount = sessionCurrentStreamsCount;
						}
					}
				}

				if (optimalSession) {
					/* istanbul ignore next: safety check */
					if (listeners.length !== 1) {
						for (const {reject} of listeners) {
							const error = new Error(
								`Expected the length of listeners to be 1, got ${listeners.length}.\n` +
								'Please report this to https://github.com/szmarczak/http2-wrapper/'
							);

							reject(error);
						}

						return;
					}

					listeners[0].resolve(optimalSession);
					return;
				}
			}

			if (normalizedOptions in this.queue) {
				if (normalizedOrigin in this.queue[normalizedOptions]) {
					// There's already an item in the queue, just attach ourselves to it.
					this.queue[normalizedOptions][normalizedOrigin].listeners.push(...listeners);

					// This shouldn't be executed here.
					// See the comment inside _tryToCreateNewSession.
					this._tryToCreateNewSession(normalizedOptions, normalizedOrigin);
					return;
				}
			} else {
				this.queue[normalizedOptions] = {};
			}

			// The entry must be removed from the queue IMMEDIATELY when:
			// 1. the session connects successfully,
			// 2. an error occurs.
			const removeFromQueue = () => {
				// Our entry can be replaced. We cannot remove the new one.
				if (normalizedOptions in this.queue && this.queue[normalizedOptions][normalizedOrigin] === entry) {
					delete this.queue[normalizedOptions][normalizedOrigin];

					if (Object.keys(this.queue[normalizedOptions]).length === 0) {
						delete this.queue[normalizedOptions];
					}
				}
			};

			// The main logic is here
			const entry = () => {
				const name = `${normalizedOrigin}:${normalizedOptions}`;
				let receivedSettings = false;

				try {
					const session = http2.connect(origin, {
						createConnection: this.createConnection,
						settings: this.settings,
						session: this.tlsSessionCache.get(name),
						...options
					});
					session[kCurrentStreamsCount] = 0;
					session[kGracefullyClosing] = false;

					const isFree = () => session[kCurrentStreamsCount] < session.remoteSettings.maxConcurrentStreams;
					let wasFree = true;

					session.socket.once('session', tlsSession => {
						this.tlsSessionCache.set(name, tlsSession);
					});

					session.once('error', error => {
						// Listeners are empty when the session successfully connected.
						for (const {reject} of listeners) {
							reject(error);
						}

						// The connection got broken, purge the cache.
						this.tlsSessionCache.delete(name);
					});

					session.setTimeout(this.timeout, () => {
						// Terminates all streams owned by this session.
						// TODO: Maybe the streams should have a "Session timed out" error?
						session.destroy();
					});

					session.once('close', () => {
						if (receivedSettings) {
							// 1. If it wasn't free then no need to decrease because
							//    it has been decreased already in session.request().
							// 2. `stream.once('close')` won't increment the count
							//    because the session is already closed.
							if (wasFree) {
								this._freeSessionsCount--;
							}

							this._sessionsCount--;

							// This cannot be moved to the stream logic,
							// because there may be a session that hadn't made a single request.
							const where = this.sessions[normalizedOptions];
							where.splice(where.indexOf(session), 1);

							if (where.length === 0) {
								delete this.sessions[normalizedOptions];
							}
						} else {
							// Broken connection
							const error = new Error('Session closed without receiving a SETTINGS frame');
							error.code = 'HTTP2WRAPPER_NOSETTINGS';

							for (const {reject} of listeners) {
								reject(error);
							}

							removeFromQueue();
						}

						// There may be another session awaiting.
						this._tryToCreateNewSession(normalizedOptions, normalizedOrigin);
					});

					// Iterates over the queue and processes listeners.
					const processListeners = () => {
						if (!(normalizedOptions in this.queue) || !isFree()) {
							return;
						}

						for (const origin of session[kOriginSet]) {
							if (origin in this.queue[normalizedOptions]) {
								const {listeners} = this.queue[normalizedOptions][origin];

								// Prevents session overloading.
								while (listeners.length !== 0 && isFree()) {
									// We assume `resolve(...)` calls `request(...)` *directly*,
									// otherwise the session will get overloaded.
									listeners.shift().resolve(session);
								}

								const where = this.queue[normalizedOptions];
								if (where[origin].listeners.length === 0) {
									delete where[origin];

									if (Object.keys(where).length === 0) {
										delete this.queue[normalizedOptions];
										break;
									}
								}

								// We're no longer free, no point in continuing.
								if (!isFree()) {
									break;
								}
							}
						}
					};

					// The Origin Set cannot shrink. No need to check if it suddenly became covered by another one.
					session.on('origin', () => {
						session[kOriginSet] = session.originSet;

						if (!isFree()) {
							// The session is full.
							return;
						}

						processListeners();

						// Close covered sessions (if possible).
						closeCoveredSessions(this.sessions[normalizedOptions], session);
					});

					session.once('remoteSettings', () => {
						// Fix Node.js bug preventing the process from exiting
						session.ref();
						session.unref();

						this._sessionsCount++;

						// The Agent could have been destroyed already.
						if (entry.destroyed) {
							const error = new Error('Agent has been destroyed');

							for (const listener of listeners) {
								listener.reject(error);
							}

							session.destroy();
							return;
						}

						session[kOriginSet] = session.originSet;

						{
							const where = this.sessions;

							if (normalizedOptions in where) {
								const sessions = where[normalizedOptions];
								sessions.splice(getSortedIndex(sessions, session, compareSessions), 0, session);
							} else {
								where[normalizedOptions] = [session];
							}
						}

						this._freeSessionsCount += 1;
						receivedSettings = true;

						this.emit('session', session);

						processListeners();
						removeFromQueue();

						// TODO: Close last recently used (or least used?) session
						if (session[kCurrentStreamsCount] === 0 && this._freeSessionsCount > this.maxFreeSessions) {
							session.close();
						}

						// Check if we haven't managed to execute all listeners.
						if (listeners.length !== 0) {
							// Request for a new session with predefined listeners.
							this.getSession(normalizedOrigin, options, listeners);
							listeners.length = 0;
						}

						// `session.remoteSettings.maxConcurrentStreams` might get increased
						session.on('remoteSettings', () => {
							processListeners();

							// In case the Origin Set changes
							closeCoveredSessions(this.sessions[normalizedOptions], session);
						});
					});

					// Shim `session.request()` in order to catch all streams
					session[kRequest] = session.request;
					session.request = (headers, streamOptions) => {
						if (session[kGracefullyClosing]) {
							throw new Error('The session is gracefully closing. No new streams are allowed.');
						}

						const stream = session[kRequest](headers, streamOptions);

						// The process won't exit until the session is closed or all requests are gone.
						session.ref();

						++session[kCurrentStreamsCount];

						if (session[kCurrentStreamsCount] === session.remoteSettings.maxConcurrentStreams) {
							this._freeSessionsCount--;
						}

						stream.once('close', () => {
							wasFree = isFree();

							--session[kCurrentStreamsCount];

							if (!session.destroyed && !session.closed) {
								closeSessionIfCovered(this.sessions[normalizedOptions], session);

								if (isFree() && !session.closed) {
									if (!wasFree) {
										this._freeSessionsCount++;

										wasFree = true;
									}

									const isEmpty = session[kCurrentStreamsCount] === 0;

									if (isEmpty) {
										session.unref();
									}

									if (
										isEmpty &&
										(
											this._freeSessionsCount > this.maxFreeSessions ||
											session[kGracefullyClosing]
										)
									) {
										session.close();
									} else {
										closeCoveredSessions(this.sessions[normalizedOptions], session);
										processListeners();
									}
								}
							}
						});

						return stream;
					};
				} catch (error) {
					for (const listener of listeners) {
						listener.reject(error);
					}

					removeFromQueue();
				}
			};

			entry.listeners = listeners;
			entry.completed = false;
			entry.destroyed = false;

			this.queue[normalizedOptions][normalizedOrigin] = entry;
			this._tryToCreateNewSession(normalizedOptions, normalizedOrigin);
		});
	}

	request(origin, options, headers, streamOptions) {
		return new Promise((resolve, reject) => {
			this.getSession(origin, options, [{
				reject,
				resolve: session => {
					try {
						resolve(session.request(headers, streamOptions));
					} catch (error) {
						reject(error);
					}
				}
			}]);
		});
	}

	createConnection(origin, options) {
		return Agent.connect(origin, options);
	}

	static connect(origin, options) {
		options.ALPNProtocols = ['h2'];

		const port = origin.port || 443;
		const host = origin.hostname || origin.host;

		if (typeof options.servername === 'undefined') {
			options.servername = host;
		}

		return tls.connect(port, host, options);
	}

	closeFreeSessions() {
		for (const sessions of Object.values(this.sessions)) {
			for (const session of sessions) {
				if (session[kCurrentStreamsCount] === 0) {
					session.close();
				}
			}
		}
	}

	destroy(reason) {
		for (const sessions of Object.values(this.sessions)) {
			for (const session of sessions) {
				session.destroy(reason);
			}
		}

		for (const entriesOfAuthority of Object.values(this.queue)) {
			for (const entry of Object.values(entriesOfAuthority)) {
				entry.destroyed = true;
			}
		}

		// New requests should NOT attach to destroyed sessions
		this.queue = {};
	}

	get freeSessions() {
		return getSessions({agent: this, isFree: true});
	}

	get busySessions() {
		return getSessions({agent: this, isFree: false});
	}
}

Agent.kCurrentStreamsCount = kCurrentStreamsCount;
Agent.kGracefullyClosing = kGracefullyClosing;

module.exports = {
	Agent,
	globalAgent: new Agent()
};


/***/ }),

/***/ 7167:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";

const http = __nccwpck_require__(8605);
const https = __nccwpck_require__(7211);
const resolveALPN = __nccwpck_require__(6624);
const QuickLRU = __nccwpck_require__(9273);
const Http2ClientRequest = __nccwpck_require__(9632);
const calculateServerName = __nccwpck_require__(1982);
const urlToOptions = __nccwpck_require__(2686);

const cache = new QuickLRU({maxSize: 100});
const queue = new Map();

const installSocket = (agent, socket, options) => {
	socket._httpMessage = {shouldKeepAlive: true};

	const onFree = () => {
		agent.emit('free', socket, options);
	};

	socket.on('free', onFree);

	const onClose = () => {
		agent.removeSocket(socket, options);
	};

	socket.on('close', onClose);

	const onRemove = () => {
		agent.removeSocket(socket, options);
		socket.off('close', onClose);
		socket.off('free', onFree);
		socket.off('agentRemove', onRemove);
	};

	socket.on('agentRemove', onRemove);

	agent.emit('free', socket, options);
};

const resolveProtocol = async options => {
	const name = `${options.host}:${options.port}:${options.ALPNProtocols.sort()}`;

	if (!cache.has(name)) {
		if (queue.has(name)) {
			const result = await queue.get(name);
			return result.alpnProtocol;
		}

		const {path, agent} = options;
		options.path = options.socketPath;

		const resultPromise = resolveALPN(options);
		queue.set(name, resultPromise);

		try {
			const {socket, alpnProtocol} = await resultPromise;
			cache.set(name, alpnProtocol);

			options.path = path;

			if (alpnProtocol === 'h2') {
				// https://github.com/nodejs/node/issues/33343
				socket.destroy();
			} else {
				const {globalAgent} = https;
				const defaultCreateConnection = https.Agent.prototype.createConnection;

				if (agent) {
					if (agent.createConnection === defaultCreateConnection) {
						installSocket(agent, socket, options);
					} else {
						socket.destroy();
					}
				} else if (globalAgent.createConnection === defaultCreateConnection) {
					installSocket(globalAgent, socket, options);
				} else {
					socket.destroy();
				}
			}

			queue.delete(name);

			return alpnProtocol;
		} catch (error) {
			queue.delete(name);

			throw error;
		}
	}

	return cache.get(name);
};

module.exports = async (input, options, callback) => {
	if (typeof input === 'string' || input instanceof URL) {
		input = urlToOptions(new URL(input));
	}

	if (typeof options === 'function') {
		callback = options;
		options = undefined;
	}

	options = {
		ALPNProtocols: ['h2', 'http/1.1'],
		...input,
		...options,
		resolveSocket: true
	};

	if (!Array.isArray(options.ALPNProtocols) || options.ALPNProtocols.length === 0) {
		throw new Error('The `ALPNProtocols` option must be an Array with at least one entry');
	}

	options.protocol = options.protocol || 'https:';
	const isHttps = options.protocol === 'https:';

	options.host = options.hostname || options.host || 'localhost';
	options.session = options.tlsSession;
	options.servername = options.servername || calculateServerName(options);
	options.port = options.port || (isHttps ? 443 : 80);
	options._defaultAgent = isHttps ? https.globalAgent : http.globalAgent;

	const agents = options.agent;

	if (agents) {
		if (agents.addRequest) {
			throw new Error('The `options.agent` object can contain only `http`, `https` or `http2` properties');
		}

		options.agent = agents[isHttps ? 'https' : 'http'];
	}

	if (isHttps) {
		const protocol = await resolveProtocol(options);

		if (protocol === 'h2') {
			if (agents) {
				options.agent = agents.http2;
			}

			return new Http2ClientRequest(options, callback);
		}
	}

	return http.request(options, callback);
};

module.exports.protocolCache = cache;


/***/ }),

/***/ 9632:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";

const http2 = __nccwpck_require__(7565);
const {Writable} = __nccwpck_require__(2413);
const {Agent, globalAgent} = __nccwpck_require__(9898);
const IncomingMessage = __nccwpck_require__(2575);
const urlToOptions = __nccwpck_require__(2686);
const proxyEvents = __nccwpck_require__(1818);
const isRequestPseudoHeader = __nccwpck_require__(1199);
const {
	ERR_INVALID_ARG_TYPE,
	ERR_INVALID_PROTOCOL,
	ERR_HTTP_HEADERS_SENT,
	ERR_INVALID_HTTP_TOKEN,
	ERR_HTTP_INVALID_HEADER_VALUE,
	ERR_INVALID_CHAR
} = __nccwpck_require__(7087);

const {
	HTTP2_HEADER_STATUS,
	HTTP2_HEADER_METHOD,
	HTTP2_HEADER_PATH,
	HTTP2_METHOD_CONNECT
} = http2.constants;

const kHeaders = Symbol('headers');
const kOrigin = Symbol('origin');
const kSession = Symbol('session');
const kOptions = Symbol('options');
const kFlushedHeaders = Symbol('flushedHeaders');
const kJobs = Symbol('jobs');

const isValidHttpToken = /^[\^`\-\w!#$%&*+.|~]+$/;
const isInvalidHeaderValue = /[^\t\u0020-\u007E\u0080-\u00FF]/;

class ClientRequest extends Writable {
	constructor(input, options, callback) {
		super({
			autoDestroy: false
		});

		const hasInput = typeof input === 'string' || input instanceof URL;
		if (hasInput) {
			input = urlToOptions(input instanceof URL ? input : new URL(input));
		}

		if (typeof options === 'function' || options === undefined) {
			// (options, callback)
			callback = options;
			options = hasInput ? input : {...input};
		} else {
			// (input, options, callback)
			options = {...input, ...options};
		}

		if (options.h2session) {
			this[kSession] = options.h2session;
		} else if (options.agent === false) {
			this.agent = new Agent({maxFreeSessions: 0});
		} else if (typeof options.agent === 'undefined' || options.agent === null) {
			if (typeof options.createConnection === 'function') {
				// This is a workaround - we don't have to create the session on our own.
				this.agent = new Agent({maxFreeSessions: 0});
				this.agent.createConnection = options.createConnection;
			} else {
				this.agent = globalAgent;
			}
		} else if (typeof options.agent.request === 'function') {
			this.agent = options.agent;
		} else {
			throw new ERR_INVALID_ARG_TYPE('options.agent', ['Agent-like Object', 'undefined', 'false'], options.agent);
		}

		if (options.protocol && options.protocol !== 'https:') {
			throw new ERR_INVALID_PROTOCOL(options.protocol, 'https:');
		}

		const port = options.port || options.defaultPort || (this.agent && this.agent.defaultPort) || 443;
		const host = options.hostname || options.host || 'localhost';

		// Don't enforce the origin via options. It may be changed in an Agent.
		delete options.hostname;
		delete options.host;
		delete options.port;

		const {timeout} = options;
		options.timeout = undefined;

		this[kHeaders] = Object.create(null);
		this[kJobs] = [];

		this.socket = null;
		this.connection = null;

		this.method = options.method || 'GET';
		this.path = options.path;

		this.res = null;
		this.aborted = false;
		this.reusedSocket = false;

		if (options.headers) {
			for (const [header, value] of Object.entries(options.headers)) {
				this.setHeader(header, value);
			}
		}

		if (options.auth && !('authorization' in this[kHeaders])) {
			this[kHeaders].authorization = 'Basic ' + Buffer.from(options.auth).toString('base64');
		}

		options.session = options.tlsSession;
		options.path = options.socketPath;

		this[kOptions] = options;

		// Clients that generate HTTP/2 requests directly SHOULD use the :authority pseudo-header field instead of the Host header field.
		if (port === 443) {
			this[kOrigin] = `https://${host}`;

			if (!(':authority' in this[kHeaders])) {
				this[kHeaders][':authority'] = host;
			}
		} else {
			this[kOrigin] = `https://${host}:${port}`;

			if (!(':authority' in this[kHeaders])) {
				this[kHeaders][':authority'] = `${host}:${port}`;
			}
		}

		if (timeout) {
			this.setTimeout(timeout);
		}

		if (callback) {
			this.once('response', callback);
		}

		this[kFlushedHeaders] = false;
	}

	get method() {
		return this[kHeaders][HTTP2_HEADER_METHOD];
	}

	set method(value) {
		if (value) {
			this[kHeaders][HTTP2_HEADER_METHOD] = value.toUpperCase();
		}
	}

	get path() {
		return this[kHeaders][HTTP2_HEADER_PATH];
	}

	set path(value) {
		if (value) {
			this[kHeaders][HTTP2_HEADER_PATH] = value;
		}
	}

	get _mustNotHaveABody() {
		return this.method === 'GET' || this.method === 'HEAD' || this.method === 'DELETE';
	}

	_write(chunk, encoding, callback) {
		// https://github.com/nodejs/node/blob/654df09ae0c5e17d1b52a900a545f0664d8c7627/lib/internal/http2/util.js#L148-L156
		if (this._mustNotHaveABody) {
			callback(new Error('The GET, HEAD and DELETE methods must NOT have a body'));
			/* istanbul ignore next: Node.js 12 throws directly */
			return;
		}

		this.flushHeaders();

		const callWrite = () => this._request.write(chunk, encoding, callback);
		if (this._request) {
			callWrite();
		} else {
			this[kJobs].push(callWrite);
		}
	}

	_final(callback) {
		if (this.destroyed) {
			return;
		}

		this.flushHeaders();

		const callEnd = () => {
			// For GET, HEAD and DELETE
			if (this._mustNotHaveABody) {
				callback();
				return;
			}

			this._request.end(callback);
		};

		if (this._request) {
			callEnd();
		} else {
			this[kJobs].push(callEnd);
		}
	}

	abort() {
		if (this.res && this.res.complete) {
			return;
		}

		if (!this.aborted) {
			process.nextTick(() => this.emit('abort'));
		}

		this.aborted = true;

		this.destroy();
	}

	_destroy(error, callback) {
		if (this.res) {
			this.res._dump();
		}

		if (this._request) {
			this._request.destroy();
		}

		callback(error);
	}

	async flushHeaders() {
		if (this[kFlushedHeaders] || this.destroyed) {
			return;
		}

		this[kFlushedHeaders] = true;

		const isConnectMethod = this.method === HTTP2_METHOD_CONNECT;

		// The real magic is here
		const onStream = stream => {
			this._request = stream;

			if (this.destroyed) {
				stream.destroy();
				return;
			}

			// Forwards `timeout`, `continue`, `close` and `error` events to this instance.
			if (!isConnectMethod) {
				proxyEvents(stream, this, ['timeout', 'continue', 'close', 'error']);
			}

			// Wait for the `finish` event. We don't want to emit the `response` event
			// before `request.end()` is called.
			const waitForEnd = fn => {
				return (...args) => {
					if (!this.writable && !this.destroyed) {
						fn(...args);
					} else {
						this.once('finish', () => {
							fn(...args);
						});
					}
				};
			};

			// This event tells we are ready to listen for the data.
			stream.once('response', waitForEnd((headers, flags, rawHeaders) => {
				// If we were to emit raw request stream, it would be as fast as the native approach.
				// Note that wrapping the raw stream in a Proxy instance won't improve the performance (already tested it).
				const response = new IncomingMessage(this.socket, stream.readableHighWaterMark);
				this.res = response;

				response.req = this;
				response.statusCode = headers[HTTP2_HEADER_STATUS];
				response.headers = headers;
				response.rawHeaders = rawHeaders;

				response.once('end', () => {
					if (this.aborted) {
						response.aborted = true;
						response.emit('aborted');
					} else {
						response.complete = true;

						// Has no effect, just be consistent with the Node.js behavior
						response.socket = null;
						response.connection = null;
					}
				});

				if (isConnectMethod) {
					response.upgrade = true;

					// The HTTP1 API says the socket is detached here,
					// but we can't do that so we pass the original HTTP2 request.
					if (this.emit('connect', response, stream, Buffer.alloc(0))) {
						this.emit('close');
					} else {
						// No listeners attached, destroy the original request.
						stream.destroy();
					}
				} else {
					// Forwards data
					stream.on('data', chunk => {
						if (!response._dumped && !response.push(chunk)) {
							stream.pause();
						}
					});

					stream.once('end', () => {
						response.push(null);
					});

					if (!this.emit('response', response)) {
						// No listeners attached, dump the response.
						response._dump();
					}
				}
			}));

			// Emits `information` event
			stream.once('headers', waitForEnd(
				headers => this.emit('information', {statusCode: headers[HTTP2_HEADER_STATUS]})
			));

			stream.once('trailers', waitForEnd((trailers, flags, rawTrailers) => {
				const {res} = this;

				// Assigns trailers to the response object.
				res.trailers = trailers;
				res.rawTrailers = rawTrailers;
			}));

			const {socket} = stream.session;
			this.socket = socket;
			this.connection = socket;

			for (const job of this[kJobs]) {
				job();
			}

			this.emit('socket', this.socket);
		};

		// Makes a HTTP2 request
		if (this[kSession]) {
			try {
				onStream(this[kSession].request(this[kHeaders]));
			} catch (error) {
				this.emit('error', error);
			}
		} else {
			this.reusedSocket = true;

			try {
				onStream(await this.agent.request(this[kOrigin], this[kOptions], this[kHeaders]));
			} catch (error) {
				this.emit('error', error);
			}
		}
	}

	getHeader(name) {
		if (typeof name !== 'string') {
			throw new ERR_INVALID_ARG_TYPE('name', 'string', name);
		}

		return this[kHeaders][name.toLowerCase()];
	}

	get headersSent() {
		return this[kFlushedHeaders];
	}

	removeHeader(name) {
		if (typeof name !== 'string') {
			throw new ERR_INVALID_ARG_TYPE('name', 'string', name);
		}

		if (this.headersSent) {
			throw new ERR_HTTP_HEADERS_SENT('remove');
		}

		delete this[kHeaders][name.toLowerCase()];
	}

	setHeader(name, value) {
		if (this.headersSent) {
			throw new ERR_HTTP_HEADERS_SENT('set');
		}

		if (typeof name !== 'string' || (!isValidHttpToken.test(name) && !isRequestPseudoHeader(name))) {
			throw new ERR_INVALID_HTTP_TOKEN('Header name', name);
		}

		if (typeof value === 'undefined') {
			throw new ERR_HTTP_INVALID_HEADER_VALUE(value, name);
		}

		if (isInvalidHeaderValue.test(value)) {
			throw new ERR_INVALID_CHAR('header content', name);
		}

		this[kHeaders][name.toLowerCase()] = value;
	}

	setNoDelay() {
		// HTTP2 sockets cannot be malformed, do nothing.
	}

	setSocketKeepAlive() {
		// HTTP2 sockets cannot be malformed, do nothing.
	}

	setTimeout(ms, callback) {
		const applyTimeout = () => this._request.setTimeout(ms, callback);

		if (this._request) {
			applyTimeout();
		} else {
			this[kJobs].push(applyTimeout);
		}

		return this;
	}

	get maxHeadersCount() {
		if (!this.destroyed && this._request) {
			return this._request.session.localSettings.maxHeaderListSize;
		}

		return undefined;
	}

	set maxHeadersCount(_value) {
		// Updating HTTP2 settings would affect all requests, do nothing.
	}
}

module.exports = ClientRequest;


/***/ }),

/***/ 2575:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";

const {Readable} = __nccwpck_require__(2413);

class IncomingMessage extends Readable {
	constructor(socket, highWaterMark) {
		super({
			highWaterMark,
			autoDestroy: false
		});

		this.statusCode = null;
		this.statusMessage = '';
		this.httpVersion = '2.0';
		this.httpVersionMajor = 2;
		this.httpVersionMinor = 0;
		this.headers = {};
		this.trailers = {};
		this.req = null;

		this.aborted = false;
		this.complete = false;
		this.upgrade = null;

		this.rawHeaders = [];
		this.rawTrailers = [];

		this.socket = socket;
		this.connection = socket;

		this._dumped = false;
	}

	_destroy(error) {
		this.req._request.destroy(error);
	}

	setTimeout(ms, callback) {
		this.req.setTimeout(ms, callback);
		return this;
	}

	_dump() {
		if (!this._dumped) {
			this._dumped = true;

			this.removeAllListeners('data');
			this.resume();
		}
	}

	_read() {
		if (this.req) {
			this.req._request.resume();
		}
	}
}

module.exports = IncomingMessage;


/***/ }),

/***/ 4645:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";

const http2 = __nccwpck_require__(7565);
const agent = __nccwpck_require__(9898);
const ClientRequest = __nccwpck_require__(9632);
const IncomingMessage = __nccwpck_require__(2575);
const auto = __nccwpck_require__(7167);

const request = (url, options, callback) => {
	return new ClientRequest(url, options, callback);
};

const get = (url, options, callback) => {
	// eslint-disable-next-line unicorn/prevent-abbreviations
	const req = new ClientRequest(url, options, callback);
	req.end();

	return req;
};

module.exports = {
	...http2,
	ClientRequest,
	IncomingMessage,
	...agent,
	request,
	get,
	auto
};


/***/ }),

/***/ 1982:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";

const net = __nccwpck_require__(1631);
/* istanbul ignore file: https://github.com/nodejs/node/blob/v13.0.1/lib/_http_agent.js */

module.exports = options => {
	let servername = options.host;
	const hostHeader = options.headers && options.headers.host;

	if (hostHeader) {
		if (hostHeader.startsWith('[')) {
			const index = hostHeader.indexOf(']');
			if (index === -1) {
				servername = hostHeader;
			} else {
				servername = hostHeader.slice(1, -1);
			}
		} else {
			servername = hostHeader.split(':', 1)[0];
		}
	}

	if (net.isIP(servername)) {
		return '';
	}

	return servername;
};


/***/ }),

/***/ 7087:
/***/ ((module) => {

"use strict";

/* istanbul ignore file: https://github.com/nodejs/node/blob/master/lib/internal/errors.js */

const makeError = (Base, key, getMessage) => {
	module.exports[key] = class NodeError extends Base {
		constructor(...args) {
			super(typeof getMessage === 'string' ? getMessage : getMessage(args));
			this.name = `${super.name} [${key}]`;
			this.code = key;
		}
	};
};

makeError(TypeError, 'ERR_INVALID_ARG_TYPE', args => {
	const type = args[0].includes('.') ? 'property' : 'argument';

	let valid = args[1];
	const isManyTypes = Array.isArray(valid);

	if (isManyTypes) {
		valid = `${valid.slice(0, -1).join(', ')} or ${valid.slice(-1)}`;
	}

	return `The "${args[0]}" ${type} must be ${isManyTypes ? 'one of' : 'of'} type ${valid}. Received ${typeof args[2]}`;
});

makeError(TypeError, 'ERR_INVALID_PROTOCOL', args => {
	return `Protocol "${args[0]}" not supported. Expected "${args[1]}"`;
});

makeError(Error, 'ERR_HTTP_HEADERS_SENT', args => {
	return `Cannot ${args[0]} headers after they are sent to the client`;
});

makeError(TypeError, 'ERR_INVALID_HTTP_TOKEN', args => {
	return `${args[0]} must be a valid HTTP token [${args[1]}]`;
});

makeError(TypeError, 'ERR_HTTP_INVALID_HEADER_VALUE', args => {
	return `Invalid value "${args[0]} for header "${args[1]}"`;
});

makeError(TypeError, 'ERR_INVALID_CHAR', args => {
	return `Invalid character in ${args[0]} [${args[1]}]`;
});


/***/ }),

/***/ 1199:
/***/ ((module) => {

"use strict";


module.exports = header => {
	switch (header) {
		case ':method':
		case ':scheme':
		case ':authority':
		case ':path':
			return true;
		default:
			return false;
	}
};


/***/ }),

/***/ 1818:
/***/ ((module) => {

"use strict";


module.exports = (from, to, events) => {
	for (const event of events) {
		from.on(event, (...args) => to.emit(event, ...args));
	}
};


/***/ }),

/***/ 2686:
/***/ ((module) => {

"use strict";

/* istanbul ignore file: https://github.com/nodejs/node/blob/a91293d4d9ab403046ab5eb022332e4e3d249bd3/lib/internal/url.js#L1257 */

module.exports = url => {
	const options = {
		protocol: url.protocol,
		hostname: typeof url.hostname === 'string' && url.hostname.startsWith('[') ? url.hostname.slice(1, -1) : url.hostname,
		host: url.host,
		hash: url.hash,
		search: url.search,
		pathname: url.pathname,
		href: url.href,
		path: `${url.pathname || ''}${url.search || ''}`
	};

	if (typeof url.port === 'string' && url.port.length !== 0) {
		options.port = Number(url.port);
	}

	if (url.username || url.password) {
		options.auth = `${url.username || ''}:${url.password || ''}`;
	}

	return options;
};


/***/ }),

/***/ 8043:
/***/ ((module) => {

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

/***/ 2973:
/***/ ((module) => {

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

/***/ 8207:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const oids = __nccwpck_require__(2967)

module.exports = function () {
  this.seq().obj(
    this.key('algorithm').objid(oids),
    this.key('parameters').optional().choice({ namedCurve: this.objid(oids), null: this.null_() })
  )
}


/***/ }),

/***/ 7707:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const oids = __nccwpck_require__(2967)

module.exports = function () {
  this.seq().obj(
    this.key('version').int(),
    this.key('privateKey').octstr(),
    this.key('parameters').explicit(0).optional().choice({ namedCurve: this.objid(oids) }),
    this.key('publicKey').explicit(1).optional().bitstr()
  )
}


/***/ }),

/***/ 6416:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const asn1 = __nccwpck_require__(9436)

const types = new Map()

const AlgorithmIdentifier = asn1.define('AlgorithmIdentifier', __nccwpck_require__(8207))
types.set('AlgorithmIdentifier', AlgorithmIdentifier)

const ECPrivateKey = asn1.define('ECPrivateKey', __nccwpck_require__(7707))
types.set('ECPrivateKey', ECPrivateKey)

const PrivateKeyInfo = asn1.define('PrivateKeyInfo', __nccwpck_require__(8570)(AlgorithmIdentifier))
types.set('PrivateKeyInfo', PrivateKeyInfo)

const PublicKeyInfo = asn1.define('PublicKeyInfo', __nccwpck_require__(5641)(AlgorithmIdentifier))
types.set('PublicKeyInfo', PublicKeyInfo)

const PrivateKey = asn1.define('PrivateKey', __nccwpck_require__(2624))
types.set('PrivateKey', PrivateKey)

const OneAsymmetricKey = asn1.define('OneAsymmetricKey', __nccwpck_require__(424)(AlgorithmIdentifier, PrivateKey))
types.set('OneAsymmetricKey', OneAsymmetricKey)

const RSAPrivateKey = asn1.define('RSAPrivateKey', __nccwpck_require__(9822))
types.set('RSAPrivateKey', RSAPrivateKey)

const RSAPublicKey = asn1.define('RSAPublicKey', __nccwpck_require__(9542))
types.set('RSAPublicKey', RSAPublicKey)

module.exports = types


/***/ }),

/***/ 2967:
/***/ ((module) => {

const oids = {
  '1 2 840 10045 3 1 7': 'P-256',
  '1 3 132 0 10': 'secp256k1',
  '1 3 132 0 34': 'P-384',
  '1 3 132 0 35': 'P-521',
  '1 2 840 10045 2 1': 'ecPublicKey',
  '1 2 840 113549 1 1 1': 'rsaEncryption',
  '1 3 101 110': 'X25519',
  '1 3 101 111': 'X448',
  '1 3 101 112': 'Ed25519',
  '1 3 101 113': 'Ed448'
}

module.exports = oids


/***/ }),

/***/ 424:
/***/ ((module) => {

module.exports = (AlgorithmIdentifier, PrivateKey) => function () {
  this.seq().obj(
    this.key('version').int(),
    this.key('algorithm').use(AlgorithmIdentifier),
    this.key('privateKey').use(PrivateKey)
  )
}


/***/ }),

/***/ 2624:
/***/ ((module) => {

module.exports = function () {
  this.octstr().contains().obj(
    this.key('privateKey').octstr()
  )
}


/***/ }),

/***/ 8570:
/***/ ((module) => {

module.exports = (AlgorithmIdentifier) => function () {
  this.seq().obj(
    this.key('version').int(),
    this.key('algorithm').use(AlgorithmIdentifier),
    this.key('privateKey').octstr()
  )
}


/***/ }),

/***/ 5641:
/***/ ((module) => {

module.exports = AlgorithmIdentifier => function () {
  this.seq().obj(
    this.key('algorithm').use(AlgorithmIdentifier),
    this.key('publicKey').bitstr()
  )
}


/***/ }),

/***/ 9822:
/***/ ((module) => {

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

/***/ 9542:
/***/ ((module) => {

module.exports = function () {
  this.seq().obj(
    this.key('n').int(),
    this.key('e').int()
  )
}


/***/ }),

/***/ 3385:
/***/ ((module) => {

let encode
let encodeBuffer
if (Buffer.isEncoding('base64url')) {
  encode = (input, encoding = 'utf8') => Buffer.from(input, encoding).toString('base64url')
  encodeBuffer = (buf) => buf.toString('base64url')
} else {
  const fromBase64 = (base64) => base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  encode = (input, encoding = 'utf8') => fromBase64(Buffer.from(input, encoding).toString('base64'))
  encodeBuffer = (buf) => fromBase64(buf.toString('base64'))
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

/***/ 5010:
/***/ ((module) => {

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

/***/ 3653:
/***/ ((module) => {

module.exports = obj => JSON.parse(JSON.stringify(obj))


/***/ }),

/***/ 4451:
/***/ ((module) => {

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

/***/ 7396:
/***/ ((module) => {

module.exports = (date) => Math.floor(date.getTime() / 1000)


/***/ }),

/***/ 3137:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { randomBytes } = __nccwpck_require__(6417)

const { IVLENGTHS } = __nccwpck_require__(5501)

module.exports = alg => randomBytes(IVLENGTHS.get(alg) / 8)


/***/ }),

/***/ 1308:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const errors = __nccwpck_require__(2973)
const Key = __nccwpck_require__(7841)
const importKey = __nccwpck_require__(3468)
const { KeyStore } = __nccwpck_require__(4998)

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

/***/ 6149:
/***/ ((module) => {

module.exports = (a = {}, b = {}) => {
  const keysA = Object.keys(a)
  const keysB = new Set(Object.keys(b))
  return !keysA.some((ka) => keysB.has(ka))
}


/***/ }),

/***/ 1805:
/***/ ((module) => {

module.exports = a => !!a && a.constructor === Object


/***/ }),

/***/ 8921:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { keyObjectSupported } = __nccwpck_require__(2457)

let createPublicKey
let createPrivateKey
let createSecretKey
let KeyObject
let asInput

if (keyObjectSupported) {
  ({ createPublicKey, createPrivateKey, createSecretKey, KeyObject } = __nccwpck_require__(6417))
  asInput = (input) => input
} else {
  const { EOL } = __nccwpck_require__(2087)

  const errors = __nccwpck_require__(2973)
  const isObject = __nccwpck_require__(1805)
  const asn1 = __nccwpck_require__(6416)
  const toInput = Symbol('toInput')

  const namedCurve = Symbol('namedCurve')

  asInput = (keyObject, needsPublic) => {
    if (keyObject instanceof KeyObject) {
      return keyObject[toInput](needsPublic)
    }

    return createSecretKey(keyObject)[toInput](needsPublic)
  }

  const pemToDer = pem => Buffer.from(pem.replace(/(?:-----(?:BEGIN|END)(?: (?:RSA|EC))? (?:PRIVATE|PUBLIC) KEY-----|\s)/g, ''), 'base64')
  const derToPem = (der, label) => `-----BEGIN ${label}-----${EOL}${(der.toString('base64').match(/.{1,64}/g) || []).join(EOL)}${EOL}-----END ${label}-----`
  const unsupported = (input) => {
    const label = typeof input === 'string' ? input : `OID ${input.join('.')}`
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
                  algorithm: 'rsaEncryption',
                  parameters: { type: 'null' }
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
                algorithm: 'rsaEncryption',
                parameters: { type: 'null' }
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
            const pkcs8 = PrivateKeyInfo.encode({
              version: 0,
              privateKey,
              algorithm: {
                algorithm: 'ecPublicKey',
                parameters: this._asn1.parameters
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
          const key = PublicKeyInfo.encode({
            algorithm: {
              algorithm: 'ecPublicKey',
              parameters: input._asn1.parameters
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
        switch (parsed.algorithm.algorithm) {
          case 'ecPublicKey': {
            keyObject = new KeyObject()
            keyObject._asn1 = parsed
            keyObject._asymmetricKeyType = 'ec'
            keyObject._type = 'public'
            keyObject._pem = PublicKeyInfo.encode(parsed, 'pem', { label: 'PUBLIC KEY' })

            break
          }
          case 'rsaEncryption': {
            type = 'pkcs1'
            keyObject = createPublicKey({ type, key: parsed.publicKey.data, format: 'der' })
            break
          }
          default:
            unsupported(parsed.algorithm.algorithm)
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
        switch (parsed.algorithm.algorithm) {
          case 'ecPublicKey': {
            type = 'sec1'
            keyObject = createPrivateKey({ type, key: parsed.privateKey, format: 'der' }, { [namedCurve]: parsed.algorithm.parameters.value })
            break
          }
          case 'rsaEncryption': {
            type = 'pkcs1'
            keyObject = createPrivateKey({ type, key: parsed.privateKey, format: 'der' })
            break
          }
          default:
            unsupported(parsed.algorithm.algorithm)
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

/***/ 9693:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { EOL } = __nccwpck_require__(2087)

const errors = __nccwpck_require__(2973)

const { keyObjectSupported } = __nccwpck_require__(2457)
const { createPublicKey } = __nccwpck_require__(8921)
const base64url = __nccwpck_require__(3385)
const asn1 = __nccwpck_require__(6416)
const computePrimes = __nccwpck_require__(3141)
const { OKP_CURVES, EC_CURVES } = __nccwpck_require__(5501)

const formatPem = (base64pem, descriptor) => `-----BEGIN ${descriptor} KEY-----${EOL}${(base64pem.match(/.{1,64}/g) || []).join(EOL)}${EOL}-----END ${descriptor} KEY-----`

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

      const { privateKey, algorithm: { parameters: { value: crv } } } = PrivateKeyInfo.decode(der)
      const { privateKey: d, publicKey } = ECPrivateKey.decode(privateKey)

      if (typeof publicKey === 'undefined') {
        if (keyObjectSupported) {
          return {
            ...keyObjectToJWK.ec.public(createPublicKey(keyObject)),
            d: base64url.encodeBuffer(d)
          }
        }

        throw new errors.JOSENotSupported('Private EC keys without the public key embedded are not supported in your Node.js runtime version')
      }

      const x = publicKey.data.slice(1, ((publicKey.data.length - 1) / 2) + 1)
      const y = publicKey.data.slice(((publicKey.data.length - 1) / 2) + 1)

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

      const { publicKey: { data: publicKey }, algorithm: { parameters: { value: crv } } } = PublicKeyInfo.decode(der)

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
        parameters: { type: 'namedCurve', value: jwk.crv },
        publicKey: concatEcPublicKey(jwk.x, jwk.y)
      }, 'pem', { label: 'EC PRIVATE KEY' })
    },
    public (jwk) {
      const PublicKeyInfo = asn1.get('PublicKeyInfo')

      return PublicKeyInfo.encode({
        algorithm: {
          algorithm: 'ecPublicKey',
          parameters: { type: 'namedCurve', value: jwk.crv }
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
        algorithm: { algorithm: jwk.crv }
      }, 'der')

      // TODO: WHYYY? https://github.com/indutny/asn1.js/issues/110
      b64.write('04', 12, 1, 'hex')

      return formatPem(b64.toString('base64'), 'PRIVATE')
    },
    public (jwk) {
      const PublicKeyInfo = asn1.get('PublicKeyInfo')

      return PublicKeyInfo.encode({
        algorithm: { algorithm: jwk.crv },
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

/***/ 125:
/***/ ((module) => {

module.exports = alg => `sha${alg.substr(2, 3)}`


/***/ }),

/***/ 3141:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { randomBytes } = __nccwpck_require__(6417)

const base64url = __nccwpck_require__(3385)
const errors = __nccwpck_require__(2973)

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
    const leastSignificantBit = b % TWO
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

/***/ 2457:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { diffieHellman, KeyObject, sign, verify } = __nccwpck_require__(6417)

const [major, minor] = process.version.substr(1).split('.').map(x => parseInt(x, 10))

module.exports = {
  oaepHashSupported: major > 12 || (major === 12 && minor >= 9),
  keyObjectSupported: !!KeyObject && major >= 12,
  edDSASupported: !!sign && !!verify,
  dsaEncodingSupported: major > 13 || (major === 13 && minor >= 2) || (major === 12 && minor >= 16),
  improvedDH: !!diffieHellman
}


/***/ }),

/***/ 7305:
/***/ ((module) => {

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

/***/ 820:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { timingSafeEqual: TSE } = __nccwpck_require__(6417)

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

/***/ 4520:
/***/ ((module) => {

const MAX_INT32 = Math.pow(2, 32)

module.exports = (value, buf = Buffer.allocUnsafe(8)) => {
  const high = Math.floor(value / MAX_INT32)
  const low = value % MAX_INT32

  buf.writeUInt32BE(high, 0)
  buf.writeUInt32BE(low, 4)
  return buf
}


/***/ }),

/***/ 530:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { JOSECritNotUnderstood, JWSInvalid } = __nccwpck_require__(2973)

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

/***/ 6425:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

module.exports = {
  JWE: __nccwpck_require__(2851),
  JWK: __nccwpck_require__(7894),
  JWKS: __nccwpck_require__(2896),
  JWS: __nccwpck_require__(6518),
  JWT: __nccwpck_require__(8138),
  errors: __nccwpck_require__(2973)
}


/***/ }),

/***/ 9651:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { createCipheriv, createDecipheriv, getCiphers } = __nccwpck_require__(6417)

const uint64be = __nccwpck_require__(4520)
const timingSafeEqual = __nccwpck_require__(820)
const { KEYOBJECT } = __nccwpck_require__(5010)
const { JWEInvalid, JWEDecryptionFailed } = __nccwpck_require__(2973)

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

  if (!macCheckPassed) {
    throw new JWEDecryptionFailed()
  }

  let cleartext
  try {
    const cipher = createDecipheriv(`aes-${size}-cbc`, encKey, iv)
    cleartext = Buffer.concat([cipher.update(ciphertext), cipher.final()])
  } catch (err) {}

  if (!cleartext) {
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

/***/ 1239:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { createCipheriv, createDecipheriv, getCiphers } = __nccwpck_require__(6417)

const { KEYOBJECT } = __nccwpck_require__(5010)
const { JWEInvalid, JWEDecryptionFailed } = __nccwpck_require__(2973)
const { asInput } = __nccwpck_require__(8921)

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

/***/ 7813:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const generateIV = __nccwpck_require__(3137)
const base64url = __nccwpck_require__(3385)

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

/***/ 477:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { createCipheriv, createDecipheriv, getCiphers } = __nccwpck_require__(6417)

const { KEYOBJECT } = __nccwpck_require__(5010)
const { asInput } = __nccwpck_require__(8921)

const checkInput = (data) => {
  if (data !== undefined && data.length % 8 !== 0) {
    throw new Error('invalid data length')
  }
}

const wrapKey = (alg, { [KEYOBJECT]: keyObject }, payload) => {
  const key = asInput(keyObject, false)
  const cipher = createCipheriv(alg, key, Buffer.alloc(8, 'a6', 'hex'))

  return { wrapped: Buffer.concat([cipher.update(payload), cipher.final()]) }
}

const unwrapKey = (alg, { [KEYOBJECT]: keyObject }, payload) => {
  const key = asInput(keyObject, false)
  checkInput(payload)
  const cipher = createDecipheriv(alg, key, Buffer.alloc(8, 'a6', 'hex'))

  return Buffer.concat([cipher.update(payload), cipher.final()])
}

module.exports = (JWA, JWK) => {
  ['A128KW', 'A192KW', 'A256KW'].forEach((jwaAlg) => {
    const size = parseInt(jwaAlg.substr(1, 3), 10)
    const alg = `aes${size}-wrap`
    if (getCiphers().includes(alg)) {
      JWA.keyManagementEncrypt.set(jwaAlg, wrapKey.bind(undefined, alg))
      JWA.keyManagementDecrypt.set(jwaAlg, unwrapKey.bind(undefined, alg))
      JWK.oct.wrapKey[jwaAlg] = JWK.oct.unwrapKey[jwaAlg] = key => (key.use === 'enc' || key.use === undefined) && key.length === size
    }
  })
}


/***/ }),

/***/ 4563:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { improvedDH } = __nccwpck_require__(2457)

if (improvedDH) {
  const { diffieHellman } = __nccwpck_require__(6417)

  const { KeyObject } = __nccwpck_require__(8921)
  const importKey = __nccwpck_require__(3468)

  module.exports = ({ keyObject: privateKey }, publicKey) => {
    if (!(publicKey instanceof KeyObject)) {
      ({ keyObject: publicKey } = importKey(publicKey))
    }

    return diffieHellman({ privateKey, publicKey })
  }
} else {
  const { createECDH, constants: { POINT_CONVERSION_UNCOMPRESSED } } = __nccwpck_require__(6417)

  const base64url = __nccwpck_require__(3385)

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

/***/ 1417:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { createHash } = __nccwpck_require__(6417)
const ecdhComputeSecret = __nccwpck_require__(4563)

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

/***/ 2652:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { improvedDH } = __nccwpck_require__(2457)
const { KEYLENGTHS } = __nccwpck_require__(5501)
const { generateSync } = __nccwpck_require__(9377)

const derive = __nccwpck_require__(1417)

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
  JWK.EC.deriveKey['ECDH-ES'] = key => (key.use === 'enc' || key.use === undefined) && key.crv !== 'secp256k1'

  if (improvedDH) {
    JWK.OKP.deriveKey['ECDH-ES'] = key => (key.use === 'enc' || key.use === undefined) && key.keyObject.asymmetricKeyType.startsWith('x')
  }
}


/***/ }),

/***/ 7668:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { improvedDH } = __nccwpck_require__(2457)
const { KEYOBJECT } = __nccwpck_require__(5010)
const { generateSync } = __nccwpck_require__(9377)
const { ECDH_DERIVE_LENGTHS } = __nccwpck_require__(5501)

const derive = __nccwpck_require__(1417)

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
      JWK.EC.deriveKey[jwaAlg] = key => (key.use === 'enc' || key.use === undefined) && key.crv !== 'secp256k1'

      if (improvedDH) {
        JWK.OKP.deriveKey[jwaAlg] = key => (key.use === 'enc' || key.use === undefined) && key.keyObject.asymmetricKeyType.startsWith('x')
      }
    }
  })
}
module.exports.wrapKey = wrapKey
module.exports.unwrapKey = unwrapKey


/***/ }),

/***/ 7634:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { sign: signOneShot, verify: verifyOneShot, createSign, createVerify, getCurves } = __nccwpck_require__(6417)

const { derToJose, joseToDer } = __nccwpck_require__(4451)
const { KEYOBJECT } = __nccwpck_require__(5010)
const resolveNodeAlg = __nccwpck_require__(125)
const { asInput } = __nccwpck_require__(8921)
const { dsaEncodingSupported } = __nccwpck_require__(2457)

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
    case 'secp256k1':
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

/***/ 8803:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { sign: signOneShot, verify: verifyOneShot } = __nccwpck_require__(6417)

const { KEYOBJECT } = __nccwpck_require__(5010)
const { edDSASupported } = __nccwpck_require__(2457)

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

/***/ 5866:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { createHmac } = __nccwpck_require__(6417)

const { KEYOBJECT } = __nccwpck_require__(5010)
const timingSafeEqual = __nccwpck_require__(820)
const resolveNodeAlg = __nccwpck_require__(125)
const { asInput } = __nccwpck_require__(8921)

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

/***/ 191:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { JWKKeySupport, JOSENotSupported } = __nccwpck_require__(2973)
const { KEY_MANAGEMENT_ENCRYPT, KEY_MANAGEMENT_DECRYPT } = __nccwpck_require__(5010)

const { JWA, JWK } = __nccwpck_require__(5501)

// sign, verify
__nccwpck_require__(5866)(JWA, JWK)
__nccwpck_require__(7634)(JWA, JWK)
__nccwpck_require__(8803)(JWA, JWK)
__nccwpck_require__(5172)(JWA, JWK)
__nccwpck_require__(6984)(JWA, JWK)
__nccwpck_require__(2638)(JWA)

// encrypt, decrypt
__nccwpck_require__(9651)(JWA, JWK)
__nccwpck_require__(1239)(JWA, JWK)

// wrapKey, unwrapKey
__nccwpck_require__(1029)(JWA, JWK)
__nccwpck_require__(477)(JWA, JWK)
__nccwpck_require__(7813)(JWA, JWK)

// deriveKey
__nccwpck_require__(4515)(JWA, JWK)
__nccwpck_require__(2652)(JWA, JWK)
__nccwpck_require__(7668)(JWA, JWK)

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

/***/ 2638:
/***/ ((module) => {

const sign = () => Buffer.from('')
const verify = (key, payload, signature) => !signature.length

module.exports = (JWA, JWK) => {
  JWA.sign.set('none', sign)
  JWA.verify.set('none', verify)
}


/***/ }),

/***/ 4515:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { pbkdf2Sync: pbkdf2, randomBytes } = __nccwpck_require__(6417)

const { KEYOBJECT } = __nccwpck_require__(5010)
const base64url = __nccwpck_require__(3385)

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

/***/ 1029:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { publicEncrypt, privateDecrypt, constants } = __nccwpck_require__(6417)

const { oaepHashSupported } = __nccwpck_require__(2457)
const { KEYOBJECT } = __nccwpck_require__(5010)
const { asInput } = __nccwpck_require__(8921)

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

/***/ 6984:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { createSign, createVerify } = __nccwpck_require__(6417)

const { KEYOBJECT } = __nccwpck_require__(5010)
const resolveNodeAlg = __nccwpck_require__(125)
const { asInput } = __nccwpck_require__(8921)

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

/***/ 5172:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const {
  createSign,
  createVerify,
  constants
} = __nccwpck_require__(6417)

const { KEYOBJECT } = __nccwpck_require__(5010)
const resolveNodeAlg = __nccwpck_require__(125)
const { asInput } = __nccwpck_require__(8921)

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

/***/ 3607:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { inflateRawSync } = __nccwpck_require__(8761)

const base64url = __nccwpck_require__(3385)
const getKey = __nccwpck_require__(1308)
const { KeyStore } = __nccwpck_require__(2896)
const errors = __nccwpck_require__(2973)
const { check, decrypt, keyManagementDecrypt } = __nccwpck_require__(191)
const JWK = __nccwpck_require__(7894)

const { createSecretKey } = __nccwpck_require__(8921)
const generateCEK = __nccwpck_require__(5242)
const validateHeaders = __nccwpck_require__(6904)
const { detect: resolveSerialization } = __nccwpck_require__(9817)

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

const validateAlgorithms = (algorithms, option) => {
  if (algorithms !== undefined && (!Array.isArray(algorithms) || algorithms.some(s => typeof s !== 'string' || !s))) {
    throw new TypeError(`"${option}" option must be an array of non-empty strings`)
  }

  if (!algorithms) {
    return undefined
  }

  return new Set(algorithms)
}

/*
 * @public
 */
const jweDecrypt = (skipValidateHeaders, serialization, jwe, key, { crit = [], complete = false, keyManagementAlgorithms, contentEncryptionAlgorithms } = {}) => {
  key = getKey(key, true)

  keyManagementAlgorithms = validateAlgorithms(keyManagementAlgorithms, 'keyManagementAlgorithms')
  contentEncryptionAlgorithms = validateAlgorithms(contentEncryptionAlgorithms, 'contentEncryptionAlgorithms')

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

    if (keyManagementAlgorithms && !keyManagementAlgorithms.has(alg)) {
      throw new errors.JOSEAlgNotWhitelisted('key management algorithm not whitelisted')
    }

    if (contentEncryptionAlgorithms && !contentEncryptionAlgorithms.has(enc)) {
      throw new errors.JOSEAlgNotWhitelisted('content encryption algorithm not whitelisted')
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
              return jweDecrypt(true, serialization, jwe, key, {
                crit,
                complete,
                contentEncryptionAlgorithms: contentEncryptionAlgorithms ? [...contentEncryptionAlgorithms] : undefined,
                keyManagementAlgorithms: keyManagementAlgorithms ? [...keyManagementAlgorithms] : undefined
              })
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
      return jweDecrypt(true, 'flattened', { ...root, ...recipient }, key, {
        crit,
        complete,
        contentEncryptionAlgorithms: contentEncryptionAlgorithms ? [...contentEncryptionAlgorithms] : undefined,
        keyManagementAlgorithms: keyManagementAlgorithms ? [...keyManagementAlgorithms] : undefined
      })
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

/***/ 9094:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { deflateRawSync } = __nccwpck_require__(8761)

const { KEYOBJECT } = __nccwpck_require__(5010)
const generateIV = __nccwpck_require__(3137)
const base64url = __nccwpck_require__(3385)
const getKey = __nccwpck_require__(1308)
const isObject = __nccwpck_require__(1805)
const { createSecretKey } = __nccwpck_require__(8921)
const deepClone = __nccwpck_require__(3653)
const importKey = __nccwpck_require__(3468)
const { JWEInvalid } = __nccwpck_require__(2973)
const { check, keyManagementEncrypt, encrypt } = __nccwpck_require__(191)

const serializers = __nccwpck_require__(9817)
const generateCEK = __nccwpck_require__(5242)
const validateHeaders = __nccwpck_require__(6904)

const PROCESS_RECIPIENT = Symbol('PROCESS_RECIPIENT')

class Encrypt {
  constructor (cleartext, protectedHeader, aad, unprotectedHeader) {
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
      aad = Buffer.concat([
        Buffer.from(final.protected || ''),
        Buffer.from('.'),
        Buffer.from(final.aad)
      ])
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

/***/ 5242:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { randomBytes } = __nccwpck_require__(6417)

const { createSecretKey } = __nccwpck_require__(8921)
const { KEYLENGTHS } = __nccwpck_require__(5501)
const Key = __nccwpck_require__(504)

module.exports = (alg) => {
  const keyLength = KEYLENGTHS.get(alg)

  if (!keyLength) {
    return new Key({ type: 'secret' })
  }

  return new Key(createSecretKey(randomBytes(keyLength / 8)), { use: 'enc', alg })
}


/***/ }),

/***/ 2851:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const Encrypt = __nccwpck_require__(9094)
const decrypt = __nccwpck_require__(3607)

const single = (serialization, cleartext, key, protectedHeader, aad, unprotectedHeader) => {
  return new Encrypt(cleartext, protectedHeader, aad, unprotectedHeader)
    .recipient(key)
    .encrypt(serialization)
}

module.exports.Encrypt = Encrypt
module.exports.encrypt = single.bind(undefined, 'compact')
module.exports.encrypt.flattened = single.bind(undefined, 'flattened')
module.exports.encrypt.general = single.bind(undefined, 'general')

module.exports.decrypt = decrypt


/***/ }),

/***/ 9817:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const isObject = __nccwpck_require__(1805)
let validateCrit = __nccwpck_require__(530)

const { JWEInvalid } = __nccwpck_require__(2973)

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

/***/ 6904:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const isDisjoint = __nccwpck_require__(6149)
const base64url = __nccwpck_require__(3385)
let validateCrit = __nccwpck_require__(530)
const { JWEInvalid, JOSENotSupported } = __nccwpck_require__(2973)

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

/***/ 9377:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const errors = __nccwpck_require__(2973)

const importKey = __nccwpck_require__(3468)

const RSAKey = __nccwpck_require__(3242)
const ECKey = __nccwpck_require__(3426)
const OKPKey = __nccwpck_require__(4510)
const OctKey = __nccwpck_require__(504)

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

/***/ 3468:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { createPublicKey, createPrivateKey, createSecretKey, KeyObject } = __nccwpck_require__(8921)
const base64url = __nccwpck_require__(3385)
const isObject = __nccwpck_require__(1805)
const { jwkToPem } = __nccwpck_require__(9693)
const errors = __nccwpck_require__(2973)

const RSAKey = __nccwpck_require__(3242)
const ECKey = __nccwpck_require__(3426)
const OKPKey = __nccwpck_require__(4510)
const OctKey = __nccwpck_require__(504)

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

const openSSHpublicKey = /^[a-zA-Z0-9-]+ AAAA(?:[0-9A-Za-z+/])+(?:==|=)?(?: .*)?$/

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


/***/ }),

/***/ 7894:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const Key = __nccwpck_require__(7841)
const None = __nccwpck_require__(8012)
const EmbeddedJWK = __nccwpck_require__(4902)
const EmbeddedX5C = __nccwpck_require__(303)
const importKey = __nccwpck_require__(3468)
const generate = __nccwpck_require__(9377)

module.exports = {
  ...generate,
  asKey: importKey,
  isKey: input => input instanceof Key,
  None,
  EmbeddedJWK,
  EmbeddedX5C
}


/***/ }),

/***/ 7841:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { strict: assert } = __nccwpck_require__(2357)
const { inspect } = __nccwpck_require__(1669)
const { EOL } = __nccwpck_require__(2087)

const { keyObjectSupported } = __nccwpck_require__(2457)
const { createPublicKey } = __nccwpck_require__(8921)
const { keyObjectToJWK } = __nccwpck_require__(9693)
const {
  THUMBPRINT_MATERIAL, PUBLIC_MEMBERS, PRIVATE_MEMBERS, JWK_MEMBERS, KEYOBJECT,
  USES_MAPPING, OPS, USES
} = __nccwpck_require__(5010)
const isObject = __nccwpck_require__(1805)
const thumbprint = __nccwpck_require__(2253)
const errors = __nccwpck_require__(2973)

const privateApi = Symbol('privateApi')
const { JWK } = __nccwpck_require__(5501)

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
            key: `-----BEGIN CERTIFICATE-----${EOL}${(cert.match(/.{1,64}/g) || []).join(EOL)}${EOL}-----END CERTIFICATE-----`, format: 'pem'
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
        ...(kid
          ? { value: kid }
          : {
              get () {
                Object.defineProperty(this, 'kid', { value: this.thumbprint, configurable: false })
                return this.kid
              },
              configurable: true
            })
      },
      ...(x5c
        ? {
            x5t: {
              enumerable: true,
              ...(x5t
                ? { value: x5t }
                : {
                    get () {
                      Object.defineProperty(this, 'x5t', { value: thumbprint.x5t(this.x5c[0]), configurable: false })
                      return this.x5t
                    },
                    configurable: true
                  })
            }
          }
        : undefined),
      ...(x5c
        ? {
            'x5t#S256': {
              enumerable: true,
              ...(x5t256
                ? { value: x5t256 }
                : {
                    get () {
                      Object.defineProperty(this, 'x5t#S256', { value: thumbprint['x5t#S256'](this.x5c[0]), configurable: false })
                      return this['x5t#S256']
                    },
                    configurable: true
                  })
            }
          }
        : undefined),
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

/***/ 3426:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { generateKeyPairSync, generateKeyPair: async } = __nccwpck_require__(6417)
const { promisify } = __nccwpck_require__(1669)

const {
  THUMBPRINT_MATERIAL, JWK_MEMBERS, PUBLIC_MEMBERS,
  PRIVATE_MEMBERS, KEY_MANAGEMENT_DECRYPT, KEY_MANAGEMENT_ENCRYPT
} = __nccwpck_require__(5010)
const { EC_CURVES } = __nccwpck_require__(5501)
const { keyObjectSupported } = __nccwpck_require__(2457)
const { createPublicKey, createPrivateKey } = __nccwpck_require__(8921)

const errors = __nccwpck_require__(2973)

const Key = __nccwpck_require__(7841)

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
    Object.defineProperty(this, 'kty', { value: 'EC', enumerable: true })
    if (!EC_CURVES.has(this.crv)) {
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

/***/ 4902:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { inspect } = __nccwpck_require__(1669)

const Key = __nccwpck_require__(7841)

class EmbeddedJWK extends Key {
  constructor () {
    super({ type: 'embedded' })
    Object.defineProperties(this, {
      kid: { value: undefined },
      kty: { value: undefined },
      thumbprint: { value: undefined },
      toJWK: { value: undefined },
      toPEM: { value: undefined }
    })
  }

  /* c8 ignore next 3 */
  [inspect.custom] () {
    return 'Embedded.JWK {}'
  }

  algorithms () {
    return new Set()
  }
}

module.exports = new EmbeddedJWK()


/***/ }),

/***/ 303:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { inspect } = __nccwpck_require__(1669)

const Key = __nccwpck_require__(7841)

class EmbeddedX5C extends Key {
  constructor () {
    super({ type: 'embedded' })
    Object.defineProperties(this, {
      kid: { value: undefined },
      kty: { value: undefined },
      thumbprint: { value: undefined },
      toJWK: { value: undefined },
      toPEM: { value: undefined }
    })
  }

  /* c8 ignore next 3 */
  [inspect.custom] () {
    return 'Embedded.X5C {}'
  }

  algorithms () {
    return new Set()
  }
}

module.exports = new EmbeddedX5C()


/***/ }),

/***/ 8012:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { inspect } = __nccwpck_require__(1669)

const Key = __nccwpck_require__(7841)

class NoneKey extends Key {
  constructor () {
    super({ type: 'unsecured' }, { alg: 'none' })
    Object.defineProperties(this, {
      kid: { value: undefined },
      kty: { value: undefined },
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

module.exports = new NoneKey()


/***/ }),

/***/ 504:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { randomBytes } = __nccwpck_require__(6417)

const { createSecretKey } = __nccwpck_require__(8921)
const base64url = __nccwpck_require__(3385)
const {
  THUMBPRINT_MATERIAL, PUBLIC_MEMBERS, PRIVATE_MEMBERS,
  KEY_MANAGEMENT_DECRYPT, KEY_MANAGEMENT_ENCRYPT, KEYOBJECT
} = __nccwpck_require__(5010)

const Key = __nccwpck_require__(7841)

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

/***/ 4510:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { generateKeyPairSync, generateKeyPair: async } = __nccwpck_require__(6417)
const { promisify } = __nccwpck_require__(1669)

const {
  THUMBPRINT_MATERIAL, JWK_MEMBERS, PUBLIC_MEMBERS,
  PRIVATE_MEMBERS, KEY_MANAGEMENT_DECRYPT, KEY_MANAGEMENT_ENCRYPT
} = __nccwpck_require__(5010)
const { OKP_CURVES } = __nccwpck_require__(5501)
const { edDSASupported } = __nccwpck_require__(2457)
const errors = __nccwpck_require__(2973)

const Key = __nccwpck_require__(7841)

const generateKeyPair = promisify(async)

const OKP_PUBLIC = new Set(['crv', 'x'])
Object.freeze(OKP_PUBLIC)
const OKP_PRIVATE = new Set([...OKP_PUBLIC, 'd'])
Object.freeze(OKP_PRIVATE)

// Octet string key pairs Key Type
class OKPKey extends Key {
  constructor (...args) {
    super(...args)
    this[JWK_MEMBERS]()
    Object.defineProperty(this, 'kty', { value: 'OKP', enumerable: true })
    if (!OKP_CURVES.has(this.crv)) {
      throw new errors.JOSENotSupported('unsupported OKP key curve')
    }
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

/***/ 3242:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { generateKeyPairSync, generateKeyPair: async } = __nccwpck_require__(6417)
const { promisify } = __nccwpck_require__(1669)

const {
  THUMBPRINT_MATERIAL, JWK_MEMBERS, PUBLIC_MEMBERS,
  PRIVATE_MEMBERS, KEY_MANAGEMENT_DECRYPT, KEY_MANAGEMENT_ENCRYPT
} = __nccwpck_require__(5010)
const { keyObjectSupported } = __nccwpck_require__(2457)
const { createPublicKey, createPrivateKey } = __nccwpck_require__(8921)

const Key = __nccwpck_require__(7841)

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

/***/ 2253:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { createHash } = __nccwpck_require__(6417)

const base64url = __nccwpck_require__(3385)

const x5t = (hash, cert) => base64url.encodeBuffer(createHash(hash).update(Buffer.from(cert, 'base64')).digest())

module.exports.kid = components => base64url.encodeBuffer(createHash('sha256').update(JSON.stringify(components)).digest())
module.exports.x5t = x5t.bind(undefined, 'sha1')
module.exports["x5t#S256"] = x5t.bind(undefined, 'sha256')


/***/ }),

/***/ 2896:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const KeyStore = __nccwpck_require__(4998)

module.exports = KeyStore


/***/ }),

/***/ 4998:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { inspect } = __nccwpck_require__(1669)

const isObject = __nccwpck_require__(1805)
const { generate, generateSync } = __nccwpck_require__(9377)
const { USES_MAPPING } = __nccwpck_require__(5010)
const { isKey, asKey: importKey } = __nccwpck_require__(7894)

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
      keys = keys.flat
        ? keys.flat()
        : keys.reduce((acc, val) => {
          if (Array.isArray(val)) {
            return [...acc, ...val]
          }

          acc.push(val)
          return acc
        }, [])
    }
    if (keys.some(k => !isKey(k) || !k.kty)) {
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
    if (!isKey(key) || !key.kty) {
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
      return undefined
    }
  }).filter(Boolean)

  return new KeyStore(...keys)
}

module.exports = { KeyStore, asKeyStore }


/***/ }),

/***/ 6518:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const Sign = __nccwpck_require__(1728)
const { verify } = __nccwpck_require__(9835)

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

/***/ 8104:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const isObject = __nccwpck_require__(1805)
let validateCrit = __nccwpck_require__(530)
const { JWSInvalid } = __nccwpck_require__(2973)

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
  let validateB64 = false
  recipients.forEach(({ protectedHeader, unprotectedHeader }) => {
    if (protectedHeader && !validateB64 && 'b64' in protectedHeader) {
      validateB64 = true
    }
    validateCrit(protectedHeader, unprotectedHeader, protectedHeader ? protectedHeader.crit : undefined)
  })

  if (validateB64) {
    const values = recipients.map(({ protectedHeader }) => protectedHeader && protectedHeader.b64)
    if (!values.every((actual, i, [expected]) => actual === expected)) {
      throw new JWSInvalid('the "b64" Header Parameter value MUST be the same for all recipients')
    }
  }
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

/***/ 1728:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const base64url = __nccwpck_require__(3385)
const isDisjoint = __nccwpck_require__(6149)
const isObject = __nccwpck_require__(1805)
const deepClone = __nccwpck_require__(3653)
const { JWSInvalid } = __nccwpck_require__(2973)
const { sign } = __nccwpck_require__(191)
const getKey = __nccwpck_require__(1308)

const serializers = __nccwpck_require__(8104)

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
  [PROCESS_RECIPIENT] (recipient, first) {
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

    if (first && joseHeader.protected.crit && joseHeader.protected.crit.includes('b64') && joseHeader.protected.b64 === false) {
      if (this._binary) {
        this._payload = base64url.decodeToBuffer(this._payload)
      } else {
        this._payload = base64url.decode(this._payload)
      }
    }

    const data = Buffer.concat([
      Buffer.from(recipient.protected || ''),
      Buffer.from('.'),
      Buffer.from(this._payload)
    ])

    recipient.signature = base64url.encodeBuffer(sign(alg, key, data))
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

    this._recipients.forEach((recipient, i) => {
      this[PROCESS_RECIPIENT](recipient, i === 0)
    })

    return serializer(this._payload, this._recipients)
  }
}

module.exports = Sign


/***/ }),

/***/ 9835:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { EOL } = __nccwpck_require__(2087)

const base64url = __nccwpck_require__(3385)
const isDisjoint = __nccwpck_require__(6149)
const isObject = __nccwpck_require__(1805)
let validateCrit = __nccwpck_require__(530)
const getKey = __nccwpck_require__(1308)
const { KeyStore } = __nccwpck_require__(2896)
const errors = __nccwpck_require__(2973)
const { check, verify } = __nccwpck_require__(191)
const JWK = __nccwpck_require__(7894)

const { detect: resolveSerialization } = __nccwpck_require__(8104)

validateCrit = validateCrit.bind(undefined, errors.JWSInvalid)
const SINGLE_RECIPIENT = new Set(['compact', 'flattened', 'preparsed'])

/*
 * @public
 */
const jwsVerify = (skipDisjointCheck, serialization, jws, key, { crit = [], complete = false, algorithms } = {}) => {
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
              return jwsVerify(true, serialization, jws, key, { crit, complete, algorithms: algorithms ? [...algorithms] : undefined })
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

    if (key === JWK.EmbeddedJWK) {
      if (!isObject(combinedHeader.jwk)) {
        throw new errors.JWSInvalid('JWS Header Parameter "jwk" must be a JSON object')
      }
      key = JWK.asKey(combinedHeader.jwk)
      if (key.type !== 'public') {
        throw new errors.JWSInvalid('JWS Header Parameter "jwk" must be a public key')
      }
    } else if (key === JWK.EmbeddedX5C) {
      if (!Array.isArray(combinedHeader.x5c) || !combinedHeader.x5c.length || combinedHeader.x5c.some(c => typeof c !== 'string' || !c)) {
        throw new errors.JWSInvalid('JWS Header Parameter "x5c" must be a JSON array of certificate value strings')
      }
      key = JWK.asKey(
        `-----BEGIN CERTIFICATE-----${EOL}${(combinedHeader.x5c[0].match(/.{1,64}/g) || []).join(EOL)}${EOL}-----END CERTIFICATE-----`,
        { x5c: combinedHeader.x5c }
      )
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

    if (combinedHeader.b64 === false) {
      payload = Buffer.from(payload)
    } else {
      payload = base64url.decodeToBuffer(payload)
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
      return jwsVerify(false, 'flattened', { ...root, ...recipient }, key, { crit, complete, algorithms: algorithms ? [...algorithms] : undefined })
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

/***/ 6743:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const base64url = __nccwpck_require__(3385)
const errors = __nccwpck_require__(2973)

module.exports = (token, { complete = false } = {}) => {
  if (typeof token !== 'string' || !token) {
    throw new TypeError('JWT must be a string')
  }

  const { 0: header, 1: payload, 2: signature, length } = token.split('.')

  if (length === 5) {
    throw new TypeError('encrypted JWTs cannot be decoded')
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

/***/ 8138:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const decode = __nccwpck_require__(6743)
const sign = __nccwpck_require__(6703)
const verify = __nccwpck_require__(4856)
const profiles = __nccwpck_require__(9547)

module.exports = {
  sign,
  verify,
  ...profiles
}

Object.defineProperty(module.exports, "decode", ({
  enumerable: false,
  configurable: true,
  value: decode
}))


/***/ }),

/***/ 9547:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { JWTClaimInvalid } = __nccwpck_require__(2973)
const secs = __nccwpck_require__(7305)
const epoch = __nccwpck_require__(7396)
const isObject = __nccwpck_require__(1805)

const verify = __nccwpck_require__(4856)
const {
  isString,
  isRequired,
  isTimestamp,
  isStringOrArrayOfStrings
} = __nccwpck_require__(3951)

const isPayloadRequired = isRequired.bind(undefined, JWTClaimInvalid)
const isPayloadString = isString.bind(undefined, JWTClaimInvalid)
const isOptionString = isString.bind(undefined, TypeError)

const defineLazyExportWithWarning = (obj, property, name, definition) => {
  Object.defineProperty(obj, property, {
    enumerable: true,
    configurable: true,
    value (...args) {
      process.emitWarning(
        `The ${name} API implements an IETF draft. Breaking draft implementations are included as minor versions of the jose library, therefore, the ~ semver operator should be used and close attention be payed to library changelog as well as the drafts themselves.`,
        'DraftWarning'
      )
      Object.defineProperty(obj, property, {
        enumerable: true,
        configurable: true,
        value: definition
      })
      return obj[property](...args)
    }
  })
}

const validateCommonOptions = (options, profile) => {
  if (!isObject(options)) {
    throw new TypeError('options must be an object')
  }

  if (!options.issuer) {
    throw new TypeError(`"issuer" option is required to validate ${profile}`)
  }

  if (!options.audience) {
    throw new TypeError(`"audience" option is required to validate ${profile}`)
  }
}

module.exports = {
  IdToken: {
    verify: (token, key, options = {}) => {
      validateCommonOptions(options, 'an ID Token')

      if ('maxAuthAge' in options) {
        isOptionString(options.maxAuthAge, 'options.maxAuthAge')
      }
      if ('nonce' in options) {
        isOptionString(options.nonce, 'options.nonce')
      }

      const unix = epoch(options.now || new Date())
      const result = verify(token, key, { ...options })
      const payload = options.complete ? result.payload : result

      if (Array.isArray(payload.aud) && payload.aud.length > 1) {
        isPayloadRequired(payload.azp, '"azp" claim', 'azp')
      }
      isPayloadRequired(payload.iat, '"iat" claim', 'iat')
      isPayloadRequired(payload.sub, '"sub" claim', 'sub')
      isPayloadRequired(payload.exp, '"exp" claim', 'exp')
      isTimestamp(payload.auth_time, 'auth_time', !!options.maxAuthAge)
      isPayloadString(payload.nonce, '"nonce" claim', 'nonce', !!options.nonce)
      isPayloadString(payload.acr, '"acr" claim', 'acr')
      isStringOrArrayOfStrings(payload.amr, 'amr')

      if (options.nonce && payload.nonce !== options.nonce) {
        throw new JWTClaimInvalid('unexpected "nonce" claim value', 'nonce', 'check_failed')
      }

      const tolerance = options.clockTolerance ? secs(options.clockTolerance) : 0

      if (options.maxAuthAge) {
        const maxAuthAgeSeconds = secs(options.maxAuthAge)
        if (payload.auth_time + maxAuthAgeSeconds < unix - tolerance) {
          throw new JWTClaimInvalid('"auth_time" claim timestamp check failed (too much time has elapsed since the last End-User authentication)', 'auth_time', 'check_failed')
        }
      }

      if (Array.isArray(payload.aud) && payload.aud.length > 1 && payload.azp !== options.audience) {
        throw new JWTClaimInvalid('unexpected "azp" claim value', 'azp', 'check_failed')
      }

      return result
    }
  },
  LogoutToken: {},
  AccessToken: {}
}

defineLazyExportWithWarning(module.exports.LogoutToken, 'verify', 'jose.JWT.LogoutToken.verify', (token, key, options = {}) => {
  validateCommonOptions(options, 'a Logout Token')

  const result = verify(token, key, { ...options })
  const payload = options.complete ? result.payload : result

  isPayloadRequired(payload.iat, '"iat" claim', 'iat')
  isPayloadRequired(payload.jti, '"jti" claim', 'jti')
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

  return result
})

defineLazyExportWithWarning(module.exports.AccessToken, 'verify', 'jose.JWT.AccessToken.verify', (token, key, options = {}) => {
  validateCommonOptions(options, 'a JWT Access Token')

  isOptionString(options.maxAuthAge, 'options.maxAuthAge')

  const unix = epoch(options.now || new Date())
  const typ = 'at+JWT'
  const result = verify(token, key, { ...options, typ })
  const payload = options.complete ? result.payload : result

  isPayloadRequired(payload.iat, '"iat" claim', 'iat')
  isPayloadRequired(payload.exp, '"exp" claim', 'exp')
  isPayloadRequired(payload.sub, '"sub" claim', 'sub')
  isPayloadRequired(payload.jti, '"jti" claim', 'jti')
  isPayloadString(payload.client_id, '"client_id" claim', 'client_id', true)
  isTimestamp(payload.auth_time, 'auth_time', !!options.maxAuthAge)
  isPayloadString(payload.acr, '"acr" claim', 'acr')
  isStringOrArrayOfStrings(payload.amr, 'amr')

  const tolerance = options.clockTolerance ? secs(options.clockTolerance) : 0

  if (options.maxAuthAge) {
    const maxAuthAgeSeconds = secs(options.maxAuthAge)
    if (payload.auth_time + maxAuthAgeSeconds < unix - tolerance) {
      throw new JWTClaimInvalid('"auth_time" claim timestamp check failed (too much time has elapsed since the last End-User authentication)', 'auth_time', 'check_failed')
    }
  }

  return result
})


/***/ }),

/***/ 3951:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { JWTClaimInvalid } = __nccwpck_require__(2973)

const isNotString = val => typeof val !== 'string' || val.length === 0
const isNotArrayOfStrings = val => !Array.isArray(val) || val.length === 0 || val.some(isNotString)
const isRequired = (Err, value, label, claim) => {
  if (value === undefined) {
    throw new Err(`${label} is missing`, claim, 'missing')
  }
}
const isString = (Err, value, label, claim, required = false) => {
  if (required) {
    isRequired(Err, value, label, claim)
  }

  if (value !== undefined && isNotString(value)) {
    throw new Err(`${label} must be a string`, claim, 'invalid')
  }
}
const isTimestamp = (value, label, required = false) => {
  if (required && value === undefined) {
    throw new JWTClaimInvalid(`"${label}" claim is missing`, label, 'missing')
  }

  if (value !== undefined && (typeof value !== 'number')) {
    throw new JWTClaimInvalid(`"${label}" claim must be a JSON numeric value`, label, 'invalid')
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

module.exports = {
  isNotArrayOfStrings,
  isRequired,
  isNotString,
  isString,
  isTimestamp,
  isStringOrArrayOfStrings
}


/***/ }),

/***/ 6703:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const isObject = __nccwpck_require__(1805)
const secs = __nccwpck_require__(7305)
const epoch = __nccwpck_require__(7396)
const getKey = __nccwpck_require__(1308)
const JWS = __nccwpck_require__(6518)

const isString = __nccwpck_require__(3951).isString.bind(undefined, TypeError)

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
    issuer, jti, kid = true, notBefore, subject, now
  } = options

  validateOptions({
    algorithm, audience, expiresIn, header, iat, issuer, jti, kid, notBefore, now, subject
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

/***/ 4856:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const isObject = __nccwpck_require__(1805)
const epoch = __nccwpck_require__(7396)
const secs = __nccwpck_require__(7305)
const getKey = __nccwpck_require__(1308)
const { bare: verify } = __nccwpck_require__(9835)
const { JWTClaimInvalid, JWTExpired } = __nccwpck_require__(2973)

const {
  isString,
  isNotString,
  isNotArrayOfStrings,
  isTimestamp,
  isStringOrArrayOfStrings
} = __nccwpck_require__(3951)
const decode = __nccwpck_require__(6743)

const isPayloadString = isString.bind(undefined, JWTClaimInvalid)
const isOptionString = isString.bind(undefined, TypeError)

const normalizeTyp = (value) => value.toLowerCase().replace(/^application\//, '')

const validateOptions = ({
  algorithms, audience, clockTolerance, complete = false, crit, ignoreExp = false,
  ignoreIat = false, ignoreNbf = false, issuer, jti, maxTokenAge, now = new Date(),
  subject, typ
}) => {
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
  isOptionString(jti, 'options.jti')
  isOptionString(clockTolerance, 'options.clockTolerance')
  isOptionString(typ, 'options.typ')

  if (issuer !== undefined && (isNotString(issuer) && isNotArrayOfStrings(issuer))) {
    throw new TypeError('options.issuer must be a string or an array of strings')
  }

  if (audience !== undefined && (isNotString(audience) && isNotArrayOfStrings(audience))) {
    throw new TypeError('options.audience must be a string or an array of strings')
  }

  if (algorithms !== undefined && isNotArrayOfStrings(algorithms)) {
    throw new TypeError('options.algorithms must be an array of strings')
  }

  if (!(now instanceof Date) || !now.getTime()) {
    throw new TypeError('options.now must be a valid Date object')
  }

  if (ignoreIat && maxTokenAge !== undefined) {
    throw new TypeError('options.ignoreIat and options.maxTokenAge cannot used together')
  }

  if (crit !== undefined && isNotArrayOfStrings(crit)) {
    throw new TypeError('options.crit must be an array of strings')
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
    maxTokenAge,
    now,
    subject,
    typ
  }
}

const validateTypes = ({ header, payload }, options) => {
  isPayloadString(header.alg, '"alg" header parameter', 'alg', true)

  isTimestamp(payload.iat, 'iat', !!options.maxTokenAge)
  isTimestamp(payload.exp, 'exp')
  isTimestamp(payload.nbf, 'nbf')
  isPayloadString(payload.jti, '"jti" claim', 'jti', !!options.jti)
  isStringOrArrayOfStrings(payload.iss, 'iss', !!options.issuer)
  isPayloadString(payload.sub, '"sub" claim', 'sub', !!options.subject)
  isStringOrArrayOfStrings(payload.aud, 'aud', !!options.audience)
  isPayloadString(header.typ, '"typ" header parameter', 'typ', !!options.typ)
}

const checkAudiencePresence = (audPayload, audOption) => {
  if (typeof audPayload === 'string') {
    return audOption.includes(audPayload)
  }

  // Each principal intended to process the JWT MUST
  // identify itself with a value in the audience claim
  audPayload = new Set(audPayload)
  return audOption.some(Set.prototype.has.bind(audPayload))
}

module.exports = (token, key, options = {}) => {
  if (!isObject(options)) {
    throw new TypeError('options must be an object')
  }

  const {
    algorithms, audience, clockTolerance, complete, crit, ignoreExp, ignoreIat, ignoreNbf, issuer,
    jti, maxTokenAge, now, subject, typ
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
  validateTypes(decoded, options)

  if (issuer && (typeof decoded.payload.iss !== 'string' || !(typeof issuer === 'string' ? [issuer] : issuer).includes(decoded.payload.iss))) {
    throw new JWTClaimInvalid('unexpected "iss" claim value', 'iss', 'check_failed')
  }

  if (subject && decoded.payload.sub !== subject) {
    throw new JWTClaimInvalid('unexpected "sub" claim value', 'sub', 'check_failed')
  }

  if (jti && decoded.payload.jti !== jti) {
    throw new JWTClaimInvalid('unexpected "jti" claim value', 'jti', 'check_failed')
  }

  if (audience && !checkAudiencePresence(decoded.payload.aud, typeof audience === 'string' ? [audience] : audience)) {
    throw new JWTClaimInvalid('unexpected "aud" claim value', 'aud', 'check_failed')
  }

  if (typ && normalizeTyp(decoded.header.typ) !== normalizeTyp(typ)) {
    throw new JWTClaimInvalid('unexpected "typ" JWT header value', 'typ', 'check_failed')
  }

  const tolerance = clockTolerance ? secs(clockTolerance) : 0

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

  return complete ? decoded : decoded.payload
}


/***/ }),

/***/ 760:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { getCurves } = __nccwpck_require__(6417)

const curves = new Set()

if (getCurves().includes('prime256v1')) {
  curves.add('P-256')
}

if (getCurves().includes('secp256k1')) {
  curves.add('secp256k1')
}

if (getCurves().includes('secp384r1')) {
  curves.add('P-384')
}

if (getCurves().includes('secp521r1')) {
  curves.add('P-521')
}

module.exports = curves


/***/ }),

/***/ 7168:
/***/ ((module) => {

module.exports = new Map()


/***/ }),

/***/ 5501:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const EC_CURVES = __nccwpck_require__(760)
const IVLENGTHS = __nccwpck_require__(9805)
const JWA = __nccwpck_require__(2430)
const JWK = __nccwpck_require__(5942)
const KEYLENGTHS = __nccwpck_require__(4358)
const OKP_CURVES = __nccwpck_require__(4720)
const ECDH_DERIVE_LENGTHS = __nccwpck_require__(7168)

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

/***/ 9805:
/***/ ((module) => {

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

/***/ 2430:
/***/ ((module) => {

module.exports = {
  sign: new Map(),
  verify: new Map(),
  keyManagementEncrypt: new Map(),
  keyManagementDecrypt: new Map(),
  encrypt: new Map(),
  decrypt: new Map()
}


/***/ }),

/***/ 5942:
/***/ ((module) => {

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

/***/ 4358:
/***/ ((module) => {

module.exports = new Map([
  ['A128CBC-HS256', 256],
  ['A128GCM', 128],
  ['A192CBC-HS384', 384],
  ['A192GCM', 192],
  ['A256CBC-HS512', 512],
  ['A256GCM', 256]
])


/***/ }),

/***/ 4720:
/***/ ((module) => {

const curves = new Set(['Ed25519'])

if (!('electron' in process.versions)) {
  curves.add('Ed448')
  curves.add('X25519')
  curves.add('X448')
}

module.exports = curves


/***/ }),

/***/ 2820:
/***/ ((__unused_webpack_module, exports) => {

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
        return Buffer.from(value.substring(8), 'base64')
      else
        return /^:/.test(value) ? value.substring(1) : value 
    }
    return value
  })
}


/***/ }),

/***/ 1531:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const EventEmitter = __nccwpck_require__(8614);
const JSONB = __nccwpck_require__(2820);

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

	get(key, opts) {
		const keyPrefixed = this._getKeyPrefix(key);
		const { store } = this.opts;
		return Promise.resolve()
			.then(() => store.get(keyPrefixed))
			.then(data => {
				return (typeof data === 'string') ? this.opts.deserialize(data) : data;
			})
			.then(data => {
				if (data === undefined) {
					return undefined;
				}

				if (typeof data.expires === 'number' && Date.now() > data.expires) {
					this.delete(key);
					return undefined;
				}

				return (opts && opts.raw) ? data : data.value;
			});
	}

	set(key, value, ttl) {
		const keyPrefixed = this._getKeyPrefix(key);
		if (typeof ttl === 'undefined') {
			ttl = this.opts.ttl;
		}

		if (ttl === 0) {
			ttl = undefined;
		}

		const { store } = this.opts;

		return Promise.resolve()
			.then(() => {
				const expires = (typeof ttl === 'number') ? (Date.now() + ttl) : null;
				value = { value, expires };
				return this.opts.serialize(value);
			})
			.then(value => store.set(keyPrefixed, value, ttl))
			.then(() => true);
	}

	delete(key) {
		const keyPrefixed = this._getKeyPrefix(key);
		const { store } = this.opts;
		return Promise.resolve()
			.then(() => store.delete(keyPrefixed));
	}

	clear() {
		const { store } = this.opts;
		return Promise.resolve()
			.then(() => store.clear());
	}
}

module.exports = Keyv;


/***/ }),

/***/ 9662:
/***/ ((module) => {

"use strict";

module.exports = object => {
	const result = {};

	for (const [key, value] of Object.entries(object)) {
		result[key.toLowerCase()] = value;
	}

	return result;
};


/***/ }),

/***/ 7129:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


// A linked list to keep track of recently-used-ness
const Yallist = __nccwpck_require__(665)

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

/***/ 1381:
/***/ ((module, exports) => {

"use strict";
// ISC @ Julien Fontanet



// ===================================================================

var construct = typeof Reflect !== "undefined" ? Reflect.construct : undefined;
var defineProperty = Object.defineProperty;

// -------------------------------------------------------------------

var captureStackTrace = Error.captureStackTrace;
if (captureStackTrace === undefined) {
  captureStackTrace = function captureStackTrace(error) {
    var container = new Error();

    defineProperty(error, "stack", {
      configurable: true,
      get: function getStack() {
        var stack = container.stack;

        // Replace property with value for faster future accesses.
        defineProperty(this, "stack", {
          configurable: true,
          value: stack,
          writable: true,
        });

        return stack;
      },
      set: function setStack(stack) {
        defineProperty(error, "stack", {
          configurable: true,
          value: stack,
          writable: true,
        });
      },
    });
  };
}

// -------------------------------------------------------------------

function BaseError(message) {
  if (message !== undefined) {
    defineProperty(this, "message", {
      configurable: true,
      value: message,
      writable: true,
    });
  }

  var cname = this.constructor.name;
  if (cname !== undefined && cname !== this.name) {
    defineProperty(this, "name", {
      configurable: true,
      value: cname,
      writable: true,
    });
  }

  captureStackTrace(this, this.constructor);
}

BaseError.prototype = Object.create(Error.prototype, {
  // See: https://github.com/JsCommunity/make-error/issues/4
  constructor: {
    configurable: true,
    value: BaseError,
    writable: true,
  },
});

// -------------------------------------------------------------------

// Sets the name of a function if possible (depends of the JS engine).
var setFunctionName = (function() {
  function setFunctionName(fn, name) {
    return defineProperty(fn, "name", {
      configurable: true,
      value: name,
    });
  }
  try {
    var f = function() {};
    setFunctionName(f, "foo");
    if (f.name === "foo") {
      return setFunctionName;
    }
  } catch (_) {}
})();

// -------------------------------------------------------------------

function makeError(constructor, super_) {
  if (super_ == null || super_ === Error) {
    super_ = BaseError;
  } else if (typeof super_ !== "function") {
    throw new TypeError("super_ should be a function");
  }

  var name;
  if (typeof constructor === "string") {
    name = constructor;
    constructor =
      construct !== undefined
        ? function() {
            return construct(super_, arguments, this.constructor);
          }
        : function() {
            super_.apply(this, arguments);
          };

    // If the name can be set, do it once and for all.
    if (setFunctionName !== undefined) {
      setFunctionName(constructor, name);
      name = undefined;
    }
  } else if (typeof constructor !== "function") {
    throw new TypeError("constructor should be either a string or a function");
  }

  // Also register the super constructor also as `constructor.super_` just
  // like Node's `util.inherits()`.
  //
  // eslint-disable-next-line dot-notation
  constructor.super_ = constructor["super"] = super_;

  var properties = {
    constructor: {
      configurable: true,
      value: constructor,
      writable: true,
    },
  };

  // If the name could not be set on the constructor, set it on the
  // prototype.
  if (name !== undefined) {
    properties.name = {
      configurable: true,
      value: name,
      writable: true,
    };
  }
  constructor.prototype = Object.create(super_.prototype, properties);

  return constructor;
}
exports = module.exports = makeError;
exports.BaseError = BaseError;


/***/ }),

/***/ 2610:
/***/ ((module) => {

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

/***/ 467:
/***/ ((module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Stream = _interopDefault(__nccwpck_require__(2413));
var http = _interopDefault(__nccwpck_require__(8605));
var Url = _interopDefault(__nccwpck_require__(8835));
var https = _interopDefault(__nccwpck_require__(7211));
var zlib = _interopDefault(__nccwpck_require__(8761));

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
	convert = __nccwpck_require__(2877).convert;
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
		if (!res) {
			res = /<meta[\s]+?content=(['"])(.+?)\1[\s]+?http-equiv=(['"])content-type\3/i.exec(str);
			if (res) {
				res.pop(); // drop last quote
			}
		}

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
						reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, 'no-redirect'));
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
							timeout: request.timeout,
							size: request.size
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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.default = exports;
exports.Headers = Headers;
exports.Request = Request;
exports.Response = Response;
exports.FetchError = FetchError;


/***/ }),

/***/ 7952:
/***/ ((module) => {

"use strict";


// https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
const DATA_URL_DEFAULT_MIME_TYPE = 'text/plain';
const DATA_URL_DEFAULT_CHARSET = 'us-ascii';

const testParameter = (name, filters) => {
	return filters.some(filter => filter instanceof RegExp ? filter.test(name) : filter === name);
};

const normalizeDataURL = (urlString, {stripHash}) => {
	const match = /^data:(?<type>[^,]*?),(?<data>[^#]*?)(?:#(?<hash>.*))?$/.exec(urlString);

	if (!match) {
		throw new Error(`Invalid URL: ${urlString}`);
	}

	let {type, data, hash} = match.groups;
	const mediaType = type.split(';');
	hash = stripHash ? '' : hash;

	let isBase64 = false;
	if (mediaType[mediaType.length - 1] === 'base64') {
		mediaType.pop();
		isBase64 = true;
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

	if (isBase64) {
		normalizedMediaType.push('base64');
	}

	if (normalizedMediaType.length !== 0 || (mimeType && mimeType !== DATA_URL_DEFAULT_MIME_TYPE)) {
		normalizedMediaType.unshift(mimeType);
	}

	return `data:${normalizedMediaType.join(';')},${isBase64 ? data.trim() : data}${hash ? `#${hash}` : ''}`;
};

const normalizeUrl = (urlString, options) => {
	options = {
		defaultProtocol: 'http:',
		normalizeProtocol: true,
		forceHttp: false,
		forceHttps: false,
		stripAuthentication: true,
		stripHash: false,
		stripTextFragment: true,
		stripWWW: true,
		removeQueryParameters: [/^utm_\w+/i],
		removeTrailingSlash: true,
		removeSingleSlash: true,
		removeDirectoryIndex: false,
		sortQueryParameters: true,
		...options
	};

	urlString = urlString.trim();

	// Data URL
	if (/^data:/i.test(urlString)) {
		return normalizeDataURL(urlString, options);
	}

	if (/^view-source:/i.test(urlString)) {
		throw new Error('`view-source:` is not supported as it is a non-standard protocol');
	}

	const hasRelativeProtocol = urlString.startsWith('//');
	const isRelativeUrl = !hasRelativeProtocol && /^\.*\//.test(urlString);

	// Prepend protocol
	if (!isRelativeUrl) {
		urlString = urlString.replace(/^(?!(?:\w+:)?\/\/)|^\/\//, options.defaultProtocol);
	}

	const urlObj = new URL(urlString);

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
	} else if (options.stripTextFragment) {
		urlObj.hash = urlObj.hash.replace(/#?:~:text.*?$/i, '');
	}

	// Remove duplicate slashes if not preceded by a protocol
	if (urlObj.pathname) {
		urlObj.pathname = urlObj.pathname.replace(/(?<!\b(?:[a-z][a-z\d+\-.]{1,50}:))\/{2,}/g, '/');
	}

	// Decode URI octets
	if (urlObj.pathname) {
		try {
			urlObj.pathname = decodeURI(urlObj.pathname);
		} catch (_) {}
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
		if (options.stripWWW && /^www\.(?!www\.)(?:[a-z\-\d]{1,63})\.(?:[a-z.\-\d]{2,63})$/.test(urlObj.hostname)) {
			// Each label should be max 63 at length (min: 1).
			// Source: https://en.wikipedia.org/wiki/Hostname#Restrictions_on_valid_host_names
			// Each TLD should be up to 63 characters long (min: 2).
			// It is technically possible to have a single character TLD, but none currently exist.
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

	if (options.removeQueryParameters === true) {
		urlObj.search = '';
	}

	// Sort query parameters
	if (options.sortQueryParameters) {
		urlObj.searchParams.sort();
	}

	if (options.removeTrailingSlash) {
		urlObj.pathname = urlObj.pathname.replace(/\/$/, '');
	}

	const oldUrlString = urlString;

	// Take advantage of many of the Node `url` normalizations
	urlString = urlObj.toString();

	if (!options.removeSingleSlash && urlObj.pathname === '/' && !oldUrlString.endsWith('/') && urlObj.hash === '') {
		urlString = urlString.replace(/\/$/, '');
	}

	// Remove ending `/` unless removeSingleSlash is false
	if ((options.removeTrailingSlash || urlObj.pathname === '/') && urlObj.hash === '' && options.removeSingleSlash) {
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


/***/ }),

/***/ 229:
/***/ ((module, exports, __nccwpck_require__) => {

"use strict";


var crypto = __nccwpck_require__(6417);

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
    _file: function(file) {
      write('file:');
      return this.dispatch([file.name, file.size, file.type, file.lastModfied]);
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
    _bigint: function(number){
      return write('bigint:' + number.toString());
    },
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
    _tlswrap: function() { return write('tlswrap'); },
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

/***/ 1270:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { strict: assert } = __nccwpck_require__(2357);
const { createHash } = __nccwpck_require__(6417);
const { format } = __nccwpck_require__(1669);

const shake256 = __nccwpck_require__(9811);

let encode;
if (Buffer.isEncoding('base64url')) {
  encode = (input) => input.toString('base64url');
} else {
  const fromBase64 = (base64) => base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  encode = (input) => fromBase64(input.toString('base64'));
}

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

/***/ 9811:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const crypto = __nccwpck_require__(6417);

const [major, minor] = process.version.substr(1).split('.').map((x) => parseInt(x, 10));
const xofOutputLength = major > 12 || (major === 12 && minor >= 8);
const shake256 = xofOutputLength && crypto.getHashes().includes('shake256');

module.exports = shake256;


/***/ }),

/***/ 1223:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var wrappy = __nccwpck_require__(2940)
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

/***/ 8300:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

/* eslint-disable max-classes-per-file */

const { inspect } = __nccwpck_require__(1669);
const stdhttp = __nccwpck_require__(8605);
const crypto = __nccwpck_require__(6417);
const { strict: assert } = __nccwpck_require__(2357);
const querystring = __nccwpck_require__(1191);
const url = __nccwpck_require__(8835);

const { ParseError } = __nccwpck_require__(3061);
const jose = __nccwpck_require__(6425);
const tokenHash = __nccwpck_require__(1270);

const base64url = __nccwpck_require__(1827);
const defaults = __nccwpck_require__(3098);
const { assertSigningAlgValuesSupport, assertIssuerConfiguration } = __nccwpck_require__(3217);
const pick = __nccwpck_require__(8857);
const isPlainObject = __nccwpck_require__(9862);
const processResponse = __nccwpck_require__(8576);
const TokenSet = __nccwpck_require__(9029);
const { OPError, RPError } = __nccwpck_require__(5061);
const now = __nccwpck_require__(8542);
const { random } = __nccwpck_require__(5421);
const request = __nccwpck_require__(2946);
const {
  CALLBACK_PROPERTIES, CLIENT_DEFAULTS, JWT_CONTENT, CLOCK_TOLERANCE,
} = __nccwpck_require__(7556);
const issuerRegistry = __nccwpck_require__(730);
const instance = __nccwpck_require__(6546);
const { authenticatedPost, resolveResponseType, resolveRedirectUri } = __nccwpck_require__(7619);
const DeviceFlowHandle = __nccwpck_require__(3979);

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
    { exchangeBody, clientAssertionPayload, DPoP } = {},
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
      }, { clientAssertionPayload, DPoP });

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
    { exchangeBody, clientAssertionPayload, DPoP } = {},
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
      }, { clientAssertionPayload, DPoP });
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
      if (typeof payload.auth_time !== 'number') {
        throw new RPError({
          message: 'JWT auth_time claim must be a JSON numeric value',
          jwt: idToken,
        });
      }
    }

    if (maxAge && (payload.auth_time + maxAge < timestamp - this[CLOCK_TOLERANCE])) {
      throw new RPError({
        printf: ['too much time has elapsed since the last End-User authentication, max_age %i, auth_time: %i, now %i', maxAge, payload.auth_time, timestamp - this[CLOCK_TOLERANCE]],
        now: timestamp,
        tolerance: this[CLOCK_TOLERANCE],
        auth_time: payload.auth_time,
        jwt: idToken,
      });
    }

    if (nonce !== null && (payload.nonce || nonce !== undefined) && payload.nonce !== nonce) {
      throw new RPError({
        printf: ['nonce mismatch, expected %s, got: %s', nonce, payload.nonce],
        jwt: idToken,
      });
    }

    const fapi = this.constructor.name === 'FAPIClient';

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

      if (fapi) {
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

    if (fapi && payload.iat < timestamp - 3600) {
      throw new RPError({
        printf: ['JWT issued too far in the past, now %i, iat %i', timestamp, payload.iat],
        now: timestamp,
        tolerance: this[CLOCK_TOLERANCE],
        iat: payload.iat,
        jwt: idToken,
      });
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
      if (typeof payload.iat !== 'number') {
        throw new RPError({
          message: 'JWT iat claim must be a JSON numeric value',
          jwt,
        });
      }
    }

    if (payload.nbf !== undefined) {
      if (typeof payload.nbf !== 'number') {
        throw new RPError({
          message: 'JWT nbf claim must be a JSON numeric value',
          jwt,
        });
      }
      if (payload.nbf > timestamp + this[CLOCK_TOLERANCE]) {
        throw new RPError({
          printf: ['JWT not active yet, now %i, nbf %i', timestamp + this[CLOCK_TOLERANCE], payload.nbf],
          now: timestamp,
          tolerance: this[CLOCK_TOLERANCE],
          nbf: payload.nbf,
          jwt,
        });
      }
    }

    if (payload.exp !== undefined) {
      if (typeof payload.exp !== 'number') {
        throw new RPError({
          message: 'JWT exp claim must be a JSON numeric value',
          jwt,
        });
      }
      if (timestamp - this[CLOCK_TOLERANCE] >= payload.exp) {
        throw new RPError({
          printf: ['JWT expired, now %i, exp %i', timestamp - this[CLOCK_TOLERANCE], payload.exp],
          now: timestamp,
          tolerance: this[CLOCK_TOLERANCE],
          exp: payload.exp,
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
      return {
        ...jose.JWS.verify(jwt, key, { complete: true }),
        payload,
      };
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
  async refresh(refreshToken, { exchangeBody, clientAssertionPayload, DPoP } = {}) {
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
    }, { clientAssertionPayload, DPoP });

    if (tokenset.id_token) {
      await this.decryptIdToken(tokenset);
      await this.validateIdToken(tokenset, null, 'token', null);

      if (refreshToken instanceof TokenSet && refreshToken.id_token) {
        const expectedSub = refreshToken.claims().sub;
        const actualSub = tokenset.claims().sub;
        if (actualSub !== expectedSub) {
          throw new RPError({
            printf: ['sub mismatch, expected %s, got: %s', expectedSub, actualSub],
            jwt: tokenset.id_token,
          });
        }
      }
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
      DPoP,
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
      responseType: 'buffer',
      method,
      url: resourceUrl,
    }, { mTLS, DPoP });
  }

  /**
   * @name userinfo
   * @api public
   */
  async userinfo(accessToken, {
    method = 'GET', via = 'header', tokenType, params, DPoP,
  } = {}) {
    assertIssuerConfiguration(this.issuer, 'userinfo_endpoint');
    const options = {
      tokenType,
      method: String(method).toUpperCase(),
      DPoP,
    };

    if (options.method !== 'GET' && options.method !== 'POST') {
      throw new TypeError('#userinfo() method can only be POST or a GET');
    }

    if (via === 'query' && options.method !== 'GET') {
      throw new TypeError('userinfo endpoints will only parse query strings for GET requests');
    } else if (via === 'body' && options.method !== 'POST') {
      throw new TypeError('can only send body on POST');
    }

    const jwt = !!(this.userinfo_signed_response_alg || this.userinfo_encrypted_response_alg);

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
        throw new ParseError(error, response);
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

    const hash = len <= 256 ? 'sha256' : len <= 384 ? 'sha384' : len <= 512 ? 'sha512' : false; // eslint-disable-line no-nested-ternary
    if (!hash) {
      throw new Error('unsupported symmetric encryption key derivation');
    }

    const derivedBuffer = crypto.createHash(hash)
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
  async grant(body, { clientAssertionPayload, DPoP } = {}) {
    assertIssuerConfiguration(this.issuer, 'token_endpoint');
    const response = await authenticatedPost.call(
      this,
      'token',
      {
        form: body,
        responseType: 'json',
      },
      { clientAssertionPayload, DPoP },
    );
    const responseBody = processResponse(response);

    return new TokenSet(responseBody);
  }

  /**
   * @name deviceAuthorization
   * @api public
   */
  async deviceAuthorization(params = {}, { exchangeBody, clientAssertionPayload, DPoP } = {}) {
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
        responseType: 'json',
        form: body,
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
      DPoP,
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

    const form = { ...revokeBody, token };

    if (hint) {
      form.token_type_hint = hint;
    }

    const response = await authenticatedPost.call(
      this,
      'revocation', {
        form,
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

    const form = { ...introspectBody, token };
    if (hint) {
      form.token_type_hint = hint;
    }

    const response = await authenticatedPost.call(
      this,
      'introspection',
      { form, responseType: 'json' },
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
      responseType: 'json',
      json: metadata,
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
      responseType: 'json',
      headers: { Authorization: authorizationHeaderValue(registrationAccessToken) },
    });
    const responseBody = processResponse(response, { bearer: true });

    return new this(responseBody, jwks, clientOptions);
  }

  /**
   * @name requestObject
   * @api public
   */
  async requestObject(requestObject = {}, {
    sign: signingAlgorithm = this.request_object_signing_alg || 'none',
    encrypt: {
      alg: eKeyManagement = this.request_object_encryption_alg,
      enc: eContentEncryption = this.request_object_encryption_enc || 'A128CBC-HS256',
    } = {},
  } = {}) {
    if (!isPlainObject(requestObject)) {
      throw new TypeError('requestObject must be a plain object');
    }

    let signed;
    let key;

    const fapi = this.constructor.name === 'FAPIClient';
    const unix = now();
    const header = { alg: signingAlgorithm, typ: 'oauth-authz-req+jwt' };
    const payload = JSON.stringify(defaults({}, requestObject, {
      iss: this.client_id,
      aud: this.issuer.issuer,
      client_id: this.client_id,
      jti: random(),
      iat: unix,
      exp: unix + 300,
      ...(fapi ? { nbf: unix } : undefined),
    }));

    if (signingAlgorithm === 'none') {
      signed = [
        base64url.encode(JSON.stringify(header)),
        base64url.encode(payload),
        '',
      ].join('.');
    } else {
      const symmetric = signingAlgorithm.startsWith('HS');
      if (symmetric) {
        key = await this.joseSecret();
      } else {
        const keystore = instance(this).get('keystore');

        if (!keystore) {
          throw new TypeError(`no keystore present for client, cannot sign using alg ${signingAlgorithm}`);
        }
        key = keystore.get({ alg: signingAlgorithm, use: 'sig' });
        if (!key) {
          throw new TypeError(`no key to sign with found for alg ${signingAlgorithm}`);
        }
      }

      signed = jose.JWS.sign(payload, key, {
        ...header,
        kid: symmetric ? undefined : key.kid,
      });
    }

    if (!eKeyManagement) {
      return signed;
    }

    const fields = { alg: eKeyManagement, enc: eContentEncryption, cty: 'oauth-authz-req+jwt' };

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

/**
 * @name validateJARM
 * @api private
 */
async function validateJARM(response) {
  const expectedAlg = this.authorization_signed_response_alg;
  const { payload } = await this.validateJWT(response, expectedAlg, ['iss', 'exp', 'aud']);
  return pickCb(payload);
}

Object.defineProperty(BaseClient.prototype, 'validateJARM', {
  enumerable: true,
  configurable: true,
  value(...args) {
    process.emitWarning(
      "The JARM API implements an OIDF implementer's draft. Breaking draft implementations are included as minor versions of the openid-client library, therefore, the ~ semver operator should be used and close attention be payed to library changelog as well as the drafts themselves.",
      'DraftWarning',
    );
    Object.defineProperty(BaseClient.prototype, 'validateJARM', {
      enumerable: true,
      configurable: true,
      value: validateJARM,
    });
    return this.validateJARM(...args);
  },
});

/**
 * @name dpopProof
 * @api private
 */
function dpopProof(payload, jwk) {
  if (!isPlainObject(payload)) {
    throw new TypeError('payload must be a plain object');
  }

  let key;
  try {
    key = jose.JWK.asKey(jwk);
    assert(key.type === 'private');
  } catch (err) {
    throw new TypeError('"DPoP" option must be an asymmetric private key to sign the DPoP Proof JWT with');
  }

  let { alg } = key;

  if (!alg && this.issuer.dpop_signing_alg_values_supported) {
    const algs = key.algorithms('sign');
    alg = this.issuer.dpop_signing_alg_values_supported.find((a) => algs.has(a));
  }

  if (!alg) {
    [alg] = key.algorithms('sign');
  }

  return jose.JWS.sign({
    iat: now(),
    jti: random(),
    ...payload,
  }, jwk, {
    alg,
    typ: 'dpop+jwt',
    jwk: pick(key, 'kty', 'crv', 'x', 'y', 'e', 'n'),
  });
}

Object.defineProperty(BaseClient.prototype, 'dpopProof', {
  enumerable: true,
  configurable: true,
  value(...args) {
    process.emitWarning(
      'The DPoP APIs implements an IETF draft. Breaking draft implementations are included as minor versions of the openid-client library, therefore, the ~ semver operator should be used and close attention be payed to library changelog as well as the drafts themselves.',
      'DraftWarning',
    );
    Object.defineProperty(BaseClient.prototype, 'dpopProof', {
      enumerable: true,
      configurable: true,
      value: dpopProof,
    });
    return this.dpopProof(...args);
  },
});

/**
 * @name pushedAuthorizationRequest
 * @api public
 */
async function pushedAuthorizationRequest(params = {}, { clientAssertionPayload } = {}) {
  assertIssuerConfiguration(this.issuer, 'pushed_authorization_request_endpoint');

  const body = {
    ...('request' in params ? params : authorizationParams.call(this, params)),
    client_id: this.client_id,
  };

  const response = await authenticatedPost.call(
    this,
    'pushed_authorization_request',
    {
      responseType: 'json',
      form: body,
    },
    { clientAssertionPayload, endpointAuthMethod: 'token' },
  );
  const responseBody = processResponse(response, { statusCode: 201 });

  if (!('expires_in' in responseBody)) {
    throw new RPError({
      message: 'expected expires_in in Pushed Authorization Successful Response',
      response,
    });
  }
  if (typeof responseBody.expires_in !== 'number') {
    throw new RPError({
      message: 'invalid expires_in value in Pushed Authorization Successful Response',
      response,
    });
  }
  if (!('request_uri' in responseBody)) {
    throw new RPError({
      message: 'expected request_uri in Pushed Authorization Successful Response',
      response,
    });
  }
  if (typeof responseBody.request_uri !== 'string') {
    throw new RPError({
      message: 'invalid request_uri value in Pushed Authorization Successful Response',
      response,
    });
  }

  return responseBody;
}

Object.defineProperty(BaseClient.prototype, 'pushedAuthorizationRequest', {
  enumerable: true,
  configurable: true,
  value(...args) {
    process.emitWarning(
      'The Pushed Authorization Requests APIs implements an IETF draft. Breaking draft implementations are included as minor versions of the openid-client library, therefore, the ~ semver operator should be used and close attention be payed to library changelog as well as the drafts themselves.',
      'DraftWarning',
    );
    Object.defineProperty(BaseClient.prototype, 'pushedAuthorizationRequest', {
      enumerable: true,
      configurable: true,
      value: pushedAuthorizationRequest,
    });
    return this.pushedAuthorizationRequest(...args);
  },
});

module.exports.BaseClient = BaseClient;


/***/ }),

/***/ 3979:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

/* eslint-disable camelcase */
const { inspect } = __nccwpck_require__(1669);

const { RPError, OPError } = __nccwpck_require__(5061);
const instance = __nccwpck_require__(6546);
const now = __nccwpck_require__(8542);
const { authenticatedPost } = __nccwpck_require__(7619);
const processResponse = __nccwpck_require__(8576);
const TokenSet = __nccwpck_require__(9029);

class DeviceFlowHandle {
  constructor({
    client, exchangeBody, clientAssertionPayload, response, maxAge, DPoP,
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
    instance(this).DPoP = DPoP;
    instance(this).maxAge = maxAge;
    instance(this).exchangeBody = exchangeBody;
    instance(this).clientAssertionPayload = clientAssertionPayload;
    instance(this).response = response;
    instance(this).interval = response.interval * 1000 || 5000;
  }

  abort() {
    instance(this).aborted = true;
  }

  async poll({ signal } = {}) {
    if ((signal && signal.aborted) || instance(this).aborted) {
      throw new RPError('polling aborted');
    }

    if (this.expired()) {
      throw new RPError('the device code %j has expired and the device authorization session has concluded', this.device_code);
    }

    await new Promise((resolve) => setTimeout(resolve, instance(this).interval));

    const response = await authenticatedPost.call(
      instance(this).client,
      'token',
      {
        form: {
          ...instance(this).exchangeBody,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
          device_code: this.device_code,
        },
        responseType: 'json',
      },
      { clientAssertionPayload: instance(this).clientAssertionPayload, DPoP: instance(this).DPoP },
    );

    let responseBody;
    try {
      responseBody = processResponse(response);
    } catch (err) {
      switch (err instanceof OPError && err.error) {
        case 'slow_down':
          instance(this).interval += 5000;
        case 'authorization_pending': // eslint-disable-line no-fallthrough
          return this.poll({ signal });
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

/***/ 5061:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

/* eslint-disable camelcase */
const { format } = __nccwpck_require__(1669);

const makeError = __nccwpck_require__(1381);

function OPError({
  error_description,
  error,
  error_uri,
  session_state,
  state,
  scope,
}, response) {
  OPError.super.call(this, !error_description ? error : `${error} (${error_description})`);

  Object.assign(
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
    Object.assign(this, rest);
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

/***/ 3217:
/***/ ((module) => {

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

/***/ 1827:
/***/ ((module) => {

let encode;
if (Buffer.isEncoding('base64url')) {
  encode = (input, encoding = 'utf8') => Buffer.from(input, encoding).toString('base64url');
} else {
  const fromBase64 = (base64) => base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  encode = (input, encoding = 'utf8') => fromBase64(Buffer.from(input, encoding).toString('base64'));
}

const decode = (input) => Buffer.from(input, 'base64');

module.exports.decode = decode;
module.exports.encode = encode;


/***/ }),

/***/ 7619:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const jose = __nccwpck_require__(6425);

const { assertIssuerConfiguration } = __nccwpck_require__(3217);
const { random } = __nccwpck_require__(5421);
const now = __nccwpck_require__(8542);
const request = __nccwpck_require__(2946);
const instance = __nccwpck_require__(6546);
const merge = __nccwpck_require__(2494);

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
      return { form: { client_id: this.client_id } };
    case 'client_secret_post':
      if (!this.client_secret) {
        throw new TypeError('client_secret_post client authentication method requires a client_secret');
      }
      return { form: { client_id: this.client_id, client_secret: this.client_secret } };
    case 'private_key_jwt':
    case 'client_secret_jwt': {
      const timestamp = now();

      const mTLS = endpoint === 'token' && this.tls_client_certificate_bound_access_tokens;
      const audience = [...new Set([
        this.issuer.issuer,
        this.issuer.token_endpoint,
        this.issuer[`${endpoint}_endpoint`],
        mTLS && this.issuer.mtls_endpoint_aliases
          ? this.issuer.mtls_endpoint_aliases.token_endpoint : undefined,
      ].filter(Boolean))];

      const assertion = await clientAssertion.call(this, endpoint, {
        iat: timestamp,
        exp: timestamp + 60,
        jti: random(),
        iss: this.client_id,
        sub: this.client_id,
        aud: audience,
        ...clientAssertionPayload,
      });

      return {
        form: {
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
  clientAssertionPayload, endpointAuthMethod = endpoint, DPoP,
} = {}) {
  const auth = await authFor.call(this, endpointAuthMethod, { clientAssertionPayload });
  const requestOpts = merge(opts, auth);

  const mTLS = this[`${endpointAuthMethod}_endpoint_auth_method`].includes('tls_client_auth')
    || (endpoint === 'token' && this.tls_client_certificate_bound_access_tokens);

  let targetUrl;
  if (mTLS && this.issuer.mtls_endpoint_aliases) {
    targetUrl = this.issuer.mtls_endpoint_aliases[`${endpoint}_endpoint`];
  }

  targetUrl = targetUrl || this.issuer[`${endpoint}_endpoint`];

  if ('form' in requestOpts) {
    for (const [key, value] of Object.entries(requestOpts.form)) { // eslint-disable-line no-restricted-syntax, max-len
      if (typeof value === 'undefined') {
        delete requestOpts.form[key];
      }
    }
  }

  return request.call(this, {
    ...requestOpts,
    method: 'POST',
    url: targetUrl,
  }, { mTLS, DPoP });
}

module.exports = {
  resolveResponseType,
  resolveRedirectUri,
  authFor,
  authenticatedPost,
};


/***/ }),

/***/ 7556:
/***/ ((module) => {

const OIDC_DISCOVERY = '/.well-known/openid-configuration';
const OAUTH2_DISCOVERY = '/.well-known/oauth-authorization-server';
const WEBFINGER = '/.well-known/webfinger';
const REL = 'http://openid.net/specs/connect/1.0/issuer';
const AAD_MULTITENANT_DISCOVERY = [
  `https://login.microsoftonline.com/common${OIDC_DISCOVERY}`,
  `https://login.microsoftonline.com/common/v2.0${OIDC_DISCOVERY}`,
  `https://login.microsoftonline.com/organizations/v2.0${OIDC_DISCOVERY}`,
  `https://login.microsoftonline.com/consumers/v2.0${OIDC_DISCOVERY}`,
];

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

/***/ 1004:
/***/ ((module) => {

module.exports = (obj) => JSON.parse(JSON.stringify(obj));


/***/ }),

/***/ 3098:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

/* eslint-disable no-restricted-syntax, no-continue */

const isPlainObject = __nccwpck_require__(9862);

function defaults(deep, target, ...sources) {
  for (const source of sources) {
    if (!isPlainObject(source)) {
      continue;
    }
    for (const [key, value] of Object.entries(source)) {
      /* istanbul ignore if */
      if (key === '__proto__' || key === 'constructor') {
        continue;
      }
      if (typeof target[key] === 'undefined' && typeof value !== 'undefined') {
        target[key] = value;
      }

      if (deep && isPlainObject(target[key]) && isPlainObject(value)) {
        defaults(true, target[key], value);
      }
    }
  }

  return target;
}

module.exports = defaults.bind(undefined, false);
module.exports.deep = defaults.bind(undefined, true);


/***/ }),

/***/ 5421:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { createHash, randomBytes } = __nccwpck_require__(6417);

const base64url = __nccwpck_require__(1827);

const random = (bytes = 32) => base64url.encode(randomBytes(bytes));

module.exports = {
  random,
  state: random,
  nonce: random,
  codeVerifier: random,
  codeChallenge: (codeVerifier) => base64url.encode(createHash('sha256').update(codeVerifier).digest()),
};


/***/ }),

/***/ 1797:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const url = __nccwpck_require__(8835);
const { strict: assert } = __nccwpck_require__(2357);

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

/***/ 9862:
/***/ ((module) => {

module.exports = (a) => !!a && a.constructor === Object;


/***/ }),

/***/ 2494:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

/* eslint-disable no-restricted-syntax, no-param-reassign, no-continue */

const isPlainObject = __nccwpck_require__(9862);

function merge(target, ...sources) {
  for (const source of sources) {
    if (!isPlainObject(source)) {
      continue;
    }
    for (const [key, value] of Object.entries(source)) {
      /* istanbul ignore if */
      if (key === '__proto__' || key === 'constructor') {
        continue;
      }
      if (isPlainObject(target[key]) && isPlainObject(value)) {
        target[key] = merge(target[key], value);
      } else if (typeof value !== 'undefined') {
        target[key] = value;
      }
    }
  }

  return target;
}

module.exports = merge;


/***/ }),

/***/ 8857:
/***/ ((module) => {

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

/***/ 8576:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { STATUS_CODES } = __nccwpck_require__(8605);
const { format } = __nccwpck_require__(1669);

const { OPError } = __nccwpck_require__(5061);

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

/***/ 2946:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const Got = __nccwpck_require__(3061);

const pkg = __nccwpck_require__(6710);

const { deep: defaultsDeep } = __nccwpck_require__(3098);
const isAbsoluteUrl = __nccwpck_require__(1797);
const { HTTP_OPTIONS } = __nccwpck_require__(7556);

let DEFAULT_HTTP_OPTIONS;
let got;

const setDefaults = (options) => {
  DEFAULT_HTTP_OPTIONS = defaultsDeep({}, options, DEFAULT_HTTP_OPTIONS);
  got = Got.extend(DEFAULT_HTTP_OPTIONS);
};

setDefaults({
  followRedirect: false,
  headers: { 'User-Agent': `${pkg.name}/${pkg.version} (${pkg.homepage})` },
  retry: 0,
  timeout: 3500,
  throwHttpErrors: false,
});

module.exports = async function request(options, { mTLS = false, DPoP } = {}) {
  const { url } = options;
  isAbsoluteUrl(url);
  const optsFn = this[HTTP_OPTIONS];
  let opts = options;

  if (DPoP && 'dpopProof' in this) {
    opts.headers = opts.headers || {};
    opts.headers.DPoP = this.dpopProof({
      htu: url,
      htm: options.method,
    }, DPoP);
  }

  if (optsFn) {
    opts = optsFn.call(this, defaultsDeep({}, opts, DEFAULT_HTTP_OPTIONS));
  }

  if (
    mTLS
    && (
      (!opts.key || !opts.cert)
      && (!opts.https || !((opts.https.key && opts.https.certificate) || opts.https.pfx))
    )
  ) {
    throw new TypeError('mutual-TLS certificate and key not set');
  }

  return got(opts);
};

module.exports.setDefaults = setDefaults;


/***/ }),

/***/ 8542:
/***/ ((module) => {

module.exports = () => Math.floor(Date.now() / 1000);


/***/ }),

/***/ 6546:
/***/ ((module) => {

const privateProps = new WeakMap();

module.exports = (ctx) => {
  if (!privateProps.has(ctx)) {
    privateProps.set(ctx, new Map([['metadata', new Map()]]));
  }
  return privateProps.get(ctx);
};


/***/ }),

/***/ 7416:
/***/ ((module) => {

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

/***/ 3140:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const Issuer = __nccwpck_require__(7213);
const { OPError, RPError } = __nccwpck_require__(5061);
const Registry = __nccwpck_require__(730);
const Strategy = __nccwpck_require__(2134);
const TokenSet = __nccwpck_require__(9029);
const { CLOCK_TOLERANCE, HTTP_OPTIONS } = __nccwpck_require__(7556);
const generators = __nccwpck_require__(5421);
const { setDefaults } = __nccwpck_require__(2946);

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

/***/ 7213:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

/* eslint-disable max-classes-per-file */

const { inspect } = __nccwpck_require__(1669);
const url = __nccwpck_require__(8835);

const AggregateError = __nccwpck_require__(1231);
const jose = __nccwpck_require__(6425);
const LRU = __nccwpck_require__(7129);
const objectHash = __nccwpck_require__(229);

const { RPError } = __nccwpck_require__(5061);
const getClient = __nccwpck_require__(8300);
const registry = __nccwpck_require__(730);
const processResponse = __nccwpck_require__(8576);
const webfingerNormalize = __nccwpck_require__(7416);
const instance = __nccwpck_require__(6546);
const request = __nccwpck_require__(2946);
const { assertIssuerConfiguration } = __nccwpck_require__(3217);
const {
  ISSUER_DEFAULTS, OIDC_DISCOVERY, OAUTH2_DISCOVERY, WEBFINGER, REL, AAD_MULTITENANT_DISCOVERY,
} = __nccwpck_require__(7556);

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

    const Client = getClient(this, aadIssValidation);

    Object.defineProperties(this, {
      Client: { value: Client },
      FAPIClient: { value: class FAPIClient extends Client {} },
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
        responseType: 'json',
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
      responseType: 'json',
      searchParams: { resource, rel: REL },
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
        responseType: 'json',
        url: uri,
      });
      const body = processResponse(response);
      return new Issuer({
        ...ISSUER_DEFAULTS,
        ...body,
        [AAD_MULTITENANT]: !!AAD_MULTITENANT_DISCOVERY.find(
          (discoveryURL) => uri.startsWith(discoveryURL),
        ),
      });
    }

    const pathnames = [];
    if (parsed.pathname.endsWith('/')) {
      pathnames.push(`${parsed.pathname}${OIDC_DISCOVERY.substring(1)}`);
    } else {
      pathnames.push(`${parsed.pathname}${OIDC_DISCOVERY}`);
    }
    if (parsed.pathname === '/') {
      pathnames.push(`${OAUTH2_DISCOVERY}`);
    } else {
      pathnames.push(`${OAUTH2_DISCOVERY}${parsed.pathname}`);
    }

    const errors = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const pathname of pathnames) {
      try {
        const wellKnownUri = url.format({ ...parsed, pathname });
        // eslint-disable-next-line no-await-in-loop
        const response = await request.call(this, {
          method: 'GET',
          responseType: 'json',
          url: wellKnownUri,
        });
        const body = processResponse(response);
        return new Issuer({
          ...ISSUER_DEFAULTS,
          ...body,
          [AAD_MULTITENANT]: !!AAD_MULTITENANT_DISCOVERY.find(
            (discoveryURL) => wellKnownUri.startsWith(discoveryURL),
          ),
        });
      } catch (err) {
        errors.push(err);
      }
    }

    const err = new AggregateError(errors);
    err.message = `Issuer.discover() failed.${err.message.split('\n')
      .filter((line) => !line.startsWith('        at')).join('\n')}`;
    throw err;
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

module.exports = Issuer;


/***/ }),

/***/ 730:
/***/ ((module) => {

const REGISTRY = new Map();

module.exports = REGISTRY;


/***/ }),

/***/ 2134:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

/* eslint-disable no-underscore-dangle */

const url = __nccwpck_require__(8835);
const { format } = __nccwpck_require__(1669);

const cloneDeep = __nccwpck_require__(1004);
const { RPError, OPError } = __nccwpck_require__(5061);
const { BaseClient } = __nccwpck_require__(8300);
const { random, codeChallenge } = __nccwpck_require__(5421);
const pick = __nccwpck_require__(8857);
const { resolveResponseType, resolveRedirectUri } = __nccwpck_require__(7619);

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
  usePKCE = true,
  extras = {},
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
  this._extras = cloneDeep(extras);

  if (!this._params.response_type) this._params.response_type = resolveResponseType.call(client);
  if (!this._params.redirect_uri) this._params.redirect_uri = resolveRedirectUri.call(client);
  if (!this._params.scope) this._params.scope = 'openid';

  if (this._usePKCE === true) {
    const supportedMethods = Array.isArray(this._issuer.code_challenge_methods_supported)
      ? this._issuer.code_challenge_methods_supported : false;

    if (supportedMethods && supportedMethods.includes('S256')) {
      this._usePKCE = 'S256';
    } else if (supportedMethods && supportedMethods.includes('plain')) {
      this._usePKCE = 'plain';
    } else if (supportedMethods) {
      throw new TypeError('neither code_challenge_method supported by the client is supported by the issuer');
    } else {
      this._usePKCE = 'S256';
    }
  } else if (typeof this._usePKCE === 'string' && !['plain', 'S256'].includes(this._usePKCE)) {
    throw new TypeError(`${this._usePKCE} is not valid/implemented PKCE code_challenge_method`);
  }

  this.name = url.parse(client.issuer.issuer).hostname;
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

      if (this._usePKCE && params.response_type.includes('code')) {
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

    const tokenset = await client.callback(opts.redirect_uri, reqParams, checks, this._extras);

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

/***/ 9029:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const base64url = __nccwpck_require__(1827);
const now = __nccwpck_require__(8542);

class TokenSet {
  /**
   * @name constructor
   * @api public
   */
  constructor(values) {
    Object.assign(this, values);
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

/***/ 9072:
/***/ ((module) => {

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
				if (!this._isCanceled || !onCancel.shouldReject) {
					this._isPending = false;
					resolve(value);
				}
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

		this._isCanceled = true;

		if (this._cancelHandlers.length > 0) {
			try {
				for (const handler of this._cancelHandlers) {
					handler();
				}
			} catch (error) {
				this._reject(error);
				return;
			}
		}

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

/***/ 8341:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var once = __nccwpck_require__(1223)
var eos = __nccwpck_require__(1205)
var fs = __nccwpck_require__(5747) // we only need fs to get the ReadStream and WriteStream prototypes

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

/***/ 9273:
/***/ ((module) => {

"use strict";


class QuickLRU {
	constructor(options = {}) {
		if (!(options.maxSize && options.maxSize > 0)) {
			throw new TypeError('`maxSize` must be a number greater than 0');
		}

		this.maxSize = options.maxSize;
		this.onEviction = options.onEviction;
		this.cache = new Map();
		this.oldCache = new Map();
		this._size = 0;
	}

	_set(key, value) {
		this.cache.set(key, value);
		this._size++;

		if (this._size >= this.maxSize) {
			this._size = 0;

			if (typeof this.onEviction === 'function') {
				for (const [key, value] of this.oldCache.entries()) {
					this.onEviction(key, value);
				}
			}

			this.oldCache = this.cache;
			this.cache = new Map();
		}
	}

	get(key) {
		if (this.cache.has(key)) {
			return this.cache.get(key);
		}

		if (this.oldCache.has(key)) {
			const value = this.oldCache.get(key);
			this.oldCache.delete(key);
			this._set(key, value);
			return value;
		}
	}

	set(key, value) {
		if (this.cache.has(key)) {
			this.cache.set(key, value);
		} else {
			this._set(key, value);
		}

		return this;
	}

	has(key) {
		return this.cache.has(key) || this.oldCache.has(key);
	}

	peek(key) {
		if (this.cache.has(key)) {
			return this.cache.get(key);
		}

		if (this.oldCache.has(key)) {
			return this.oldCache.get(key);
		}
	}

	delete(key) {
		const deleted = this.cache.delete(key);
		if (deleted) {
			this._size--;
		}

		return this.oldCache.delete(key) || deleted;
	}

	clear() {
		this.cache.clear();
		this.oldCache.clear();
		this._size = 0;
	}

	* keys() {
		for (const [key] of this) {
			yield key;
		}
	}

	* values() {
		for (const [, value] of this) {
			yield value;
		}
	}

	* [Symbol.iterator]() {
		for (const item of this.cache) {
			yield item;
		}

		for (const item of this.oldCache) {
			const [key] = item;
			if (!this.cache.has(key)) {
				yield item;
			}
		}
	}

	get size() {
		let oldCacheSize = 0;
		for (const key of this.oldCache.keys()) {
			if (!this.cache.has(key)) {
				oldCacheSize++;
			}
		}

		return Math.min(this._size + oldCacheSize, this.maxSize);
	}
}

module.exports = QuickLRU;


/***/ }),

/***/ 6624:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";

const tls = __nccwpck_require__(4016);

module.exports = (options = {}, connect = tls.connect) => new Promise((resolve, reject) => {
	let timeout = false;

	let socket;

	const callback = async () => {
		socket.off('timeout', onTimeout);
		socket.off('error', reject);

		if (options.resolveSocket) {
			resolve({alpnProtocol: socket.alpnProtocol, socket, timeout});

			if (timeout) {
				await Promise.resolve();
				socket.emit('timeout');
			}
		} else {
			socket.destroy();
			resolve({alpnProtocol: socket.alpnProtocol, timeout});
		}
	};

	const onTimeout = async () => {
		timeout = true;
		callback();
	};

	(async () => {
		try {
			socket = await connect(options, callback);

			socket.on('error', reject);
			socket.once('timeout', onTimeout);
		} catch (error) {
			reject(error);
		}
	})();
});


/***/ }),

/***/ 9004:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const Readable = __nccwpck_require__(2413).Readable;
const lowercaseKeys = __nccwpck_require__(9662);

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

/***/ 2940:
/***/ ((module) => {

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

/***/ 4091:
/***/ ((module) => {

"use strict";

module.exports = function (Yallist) {
  Yallist.prototype[Symbol.iterator] = function* () {
    for (let walker = this.head; walker; walker = walker.next) {
      yield walker.value
    }
  }
}


/***/ }),

/***/ 665:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

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

Yallist.prototype.splice = function (start, deleteCount, ...nodes) {
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

  for (var i = 0; i < nodes.length; i++) {
    walker = insert(this, walker, nodes[i])
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
  __nccwpck_require__(4091)(Yallist)
} catch (er) {}


/***/ }),

/***/ 2877:
/***/ ((module) => {

module.exports = eval("require")("encoding");


/***/ }),

/***/ 6710:
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"name":"openid-client","version":"4.7.4","description":"OpenID Connect Relying Party (RP, Client) implementation for Node.js runtime, supports passportjs","keywords":["auth","authentication","basic","certified","client","connect","dynamic","electron","hybrid","identity","implicit","oauth","oauth2","oidc","openid","passport","relying party","strategy"],"homepage":"https://github.com/panva/node-openid-client","repository":"panva/node-openid-client","funding":{"url":"https://github.com/sponsors/panva"},"license":"MIT","author":"Filip Skokan <panva.ip@gmail.com>","exports":{"import":"./lib/index.mjs","require":"./lib/index.js"},"main":"lib/index.js","types":"types/index.d.ts","files":["lib","types/index.d.ts"],"scripts":{"coverage":"nyc mocha test/**/*.test.js","lint":"eslint lib test","lint-fix":"eslint lib test --fix","lint-ts":"npx typescript@~3.6.0 --build types","test":"mocha test/**/*.test.js"},"nyc":{"reporter":["lcov","text-summary"]},"dependencies":{"aggregate-error":"^3.1.0","got":"^11.8.0","jose":"^2.0.5","lru-cache":"^6.0.0","make-error":"^1.3.6","object-hash":"^2.0.1","oidc-token-hash":"^5.0.1"},"devDependencies":{"@types/passport":"^1.0.4","base64url":"^3.0.1","chai":"^4.2.0","eslint":"^7.12.1","eslint-config-airbnb-base":"^14.2.0","eslint-plugin-import":"^2.22.1","mocha":"^8.2.0","nock":"^13.0.2","nyc":"^15.1.0","readable-mock-req":"^0.2.2","sinon":"^9.2.0","timekeeper":"^2.2.0"},"engines":{"node":"^10.19.0 || >=12.0.0 < 13 || >=13.7.0 < 14 || >= 14.2.0"},"standard-version":{"scripts":{"postchangelog":"sed -i \'\' -e \'s/### \\\\[/## [/g\' CHANGELOG.md"},"types":[{"type":"feat","section":"Features"},{"type":"fix","section":"Bug Fixes"},{"type":"chore","hidden":true},{"type":"docs","hidden":true},{"type":"style","hidden":true},{"type":"refactor","section":"Refactor","hidden":true},{"type":"perf","section":"Performance","hidden":false},{"type":"test","hidden":true}]}}');

/***/ }),

/***/ 2357:
/***/ ((module) => {

"use strict";
module.exports = require("assert");

/***/ }),

/***/ 4293:
/***/ ((module) => {

"use strict";
module.exports = require("buffer");

/***/ }),

/***/ 6417:
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ 881:
/***/ ((module) => {

"use strict";
module.exports = require("dns");

/***/ }),

/***/ 8614:
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),

/***/ 5747:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 8605:
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ 7565:
/***/ ((module) => {

"use strict";
module.exports = require("http2");

/***/ }),

/***/ 7211:
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ 1631:
/***/ ((module) => {

"use strict";
module.exports = require("net");

/***/ }),

/***/ 2087:
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),

/***/ 5622:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ 1191:
/***/ ((module) => {

"use strict";
module.exports = require("querystring");

/***/ }),

/***/ 2413:
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ 4016:
/***/ ((module) => {

"use strict";
module.exports = require("tls");

/***/ }),

/***/ 8835:
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),

/***/ 1669:
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ }),

/***/ 8761:
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __nccwpck_require__(3109);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=index.js.map