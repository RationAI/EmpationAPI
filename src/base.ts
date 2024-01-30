import {EventSource} from "./events";
import { STATUS_CODES } from './status-codes';
import {Logger} from "./utils";

export interface EmpationAPIOptions {
    workbenchApiUrl: string;
    apiRootPath?: string;
    maxRetryCount?: number;
    nextRetryInMs?: number | Array<number>;
}

type ResponseType = "json" | "blob" | "text";

export interface RawOptions {
    body?: object | string;
    query?: any;
    method?: string;
    headers?: object;
    responseType?: ResponseType;
}

//https://gist.github.com/TooTallNate/4fd641f820e1325695487dfd883e5285
function httpErrorToName(code): string {
    const suffix = (code / 100 | 0) === 4 || (code / 100 | 0) === 5 ? 'error' : '';
    let name = ` ${String(STATUS_CODES[code] || `HTTP Code ${code}`).replace(/error$/i, '')} ${suffix}`;
    return name.split(" ").reduce((acc, c) => acc
        + (c ? (c.charAt(0).toUpperCase() + c.slice(1)) : ""));
}

export class HTTPError extends Error {

    statusCode: number;
    [key: string]: any

    public constructor(code: number, message: string, extras?: Record<string, any>) {
        super(message || STATUS_CODES[code] || `HTTP Code ${code}`);
        if (arguments.length >= 3 && extras) {
            // noinspection TypeScriptValidateTypes
            Object.assign(this, extras);
        }
        this.name = httpErrorToName(code);
        this.statusCode = code;
    }
}

export interface HttpQueueItem extends RawOptions {
    url: string
}

export interface ConnectionErrorEventArgs {
    queue: Array<HttpQueueItem>;
    retryCount: number;
    maxRetryCount: number;
    nextRetryInMs: number;
}

export type ConnectionErrorEvent = (args: ConnectionErrorEventArgs) => void | Promise<void>;

export interface RawApiOptions {
    errorHandler: ConnectionErrorEvent;
    maxRetryCount?: number;
    nextRetryInMs?: number | Array<number>;
}

export class RawAPI {
    public url: string;
    private _queue: Array<HttpQueueItem> = [];
    private _handler: ConnectionErrorEvent;
    private _retryRoutine: NodeJS.Timeout;

    private _maxRetryCount;
    private _timeout: number | Array<number>;

    constructor(url: string, options: RawApiOptions) {
        this.url = url;
        this._handler = options.errorHandler;
        this._maxRetryCount = typeof options.maxRetryCount === "undefined" ? 4 : options.maxRetryCount;
        this._timeout = options.nextRetryInMs || [5000, 10000, 20000, 30000];
    }

    private _parseQueryParams(params) {
        if (params) {
            if (typeof params === "string") return params;

            //cleanup plain objects
            if (params.constructor === Object || params.constructor === undefined) {
                for (let k in params) {
                    const v = params[k];
                    if (v === null || v === undefined) delete params[k];
                }

            }
            return `?${new URLSearchParams(params)}`;
        }
        return "";
    }

    private _setRetryIn(retryCount, retryTimeout) {
        if (retryCount >= this._maxRetryCount) {
            Logger.error("Automated retry failed: maxRetryCount exceeded!");
        } else {
            this._retryRoutine = setTimeout(this._replay.bind(this, retryCount), retryTimeout);
        }
        this._handler({
            queue: this._queue,
            retryCount: retryCount,
            maxRetryCount: this._maxRetryCount,
            nextRetryInMs: retryTimeout
        });
    }

    private _recordFailed(url: string, options: RawOptions, retryCount, retryTimeout) {
        if (this._queue.length < 1) {
            this._setRetryIn(retryCount, retryTimeout);
        }
        this._queue.push({url, ...options});
    }

    private async _replay(retryCount=0) {
        if (this._queue.length < 1) {
            return;
        }
        if (this._retryRoutine) {
            clearTimeout(this._retryRoutine);
            this._retryRoutine = null;
        }
        try {
            const item = this._queue[0];
            await this._fetch(item.url, item);
            this._queue.shift();
        } catch (e) {
            retryCount++;
            // index 0 == 1st replay attempt
            Logger.warn("Replay attempt ", retryCount, " failed: ", e);
            const retryTimeout = Array.isArray(this._timeout) ?
                this._timeout[Math.min(this._timeout.length-1, retryCount)] : this._timeout;
            this._setRetryIn(retryCount, retryTimeout);
            throw e;
        }
        await this._replay();
    }

    private async _fetch(url: string, options: RawOptions | HttpQueueItem): Promise<any> {
        const response = await fetch(url, {
            method: options.method,
            headers: options.headers,
            body: options.body
        } as RequestInit);

        let result;
        try {
            result = await response[options.responseType]();
        } catch (e) {
            throw new HTTPError(500,
                `Failed to parse response data. Original status: ${response.status} | ${response.statusText}`,
                {
                    url: url,
                    error: e
                });
        }

        if (!response.ok) {
            console.log("NOK", response)
            throw new HTTPError(response.status, response.statusText, result);
        }
        return result;
    }

    async http(endpoint: string, options: RawOptions): Promise<any> {
        const hasBody = !!options.body;
        options.method = options.method || (hasBody ? "POST" : "GET");
        if (!endpoint.startsWith('/')) {
            endpoint = `/${endpoint}`;
        }
        options.query = this._parseQueryParams(options.query);
        options.headers = options.headers || {};
        options.headers['Content-Type'] = "application/json";
        options.responseType = options.responseType || "json";
        if (options.body && typeof options.body !== "string") {
            options.body = JSON.stringify(options.body);
        } else options.body = null;

        let err = null;
        try {
            return await this._fetch(this.url + endpoint + options.query, options);
        } catch (e) {
            err = e;
        }

        if (Array.isArray(this._timeout) && this._timeout.length < 1) this._timeout = [5000];
        else if (!this._timeout) this._timeout = 5000;
        const timeout = Array.isArray(this._timeout) ? this._timeout[0] : this._timeout;
        this._recordFailed(this.url + endpoint + options.query, options, 0, timeout);

        if (err) throw err;
    }
}

//todo consider implementing 'observe' method that registers and watches certain property list..
export class AbstractAPI extends EventSource {
    //todo try figuring out how to print the class name too
    //https://stackoverflow.com/questions/280389/how-do-you-find-out-the-caller-function-in-javascript
    private getCallerName() {
        // Get stack array
        const orig = Error.prepareStackTrace;
        Error.prepareStackTrace = (error, stack) => stack;
        const { stack } = new Error();
        Error.prepareStackTrace = orig;

        const caller = stack[2];
        return caller ? caller : 'unknown context';
    }

    requires(name, value): void {
        if (!value) {
            throw `ArgumentError[${this.getCallerName()}] ${name} is missing - required property!`
        }
    }

    /**
     * @event 'connection-error'
     * @param args
     */
    raiseConnectionError(args: ConnectionErrorEventArgs): void {
        this.raiseEvent('connection-error', args);
    }
}
