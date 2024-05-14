import { EventSource } from './events';
import { STATUS_CODES } from './status-codes';

export interface EmpationAPIOptions {
  anonymousUserId?: string;
  workbenchApiUrl: string;
  apiRootPath?: string;
}

type ResponseType = 'json' | 'blob' | 'text';

export interface RawOptions {
  body?: object | string;
  query?: any;
  method?: string;
  headers?: { [key: string]: string };
  responseType?: ResponseType;
}

//https://gist.github.com/TooTallNate/4fd641f820e1325695487dfd883e5285
function httpErrorToName(code: number): string {
  const suffix =
    ((code / 100) | 0) === 4 || ((code / 100) | 0) === 5 ? 'error' : '';
  let name = ` ${String(STATUS_CODES[code as keyof typeof STATUS_CODES] || `HTTP Code ${code}`).replace(/error$/i, '')} ${suffix}`;
  return name
    .split(' ')
    .reduce(
      (acc, c) => acc + (c ? c.charAt(0).toUpperCase() + c.slice(1) : ''),
    );
}

export class HTTPError extends Error {
  statusCode: number;
  [key: string]: any;

  public constructor(
    code: number,
    message: string,
    extras?: Record<string, any>,
  ) {
    super(
      message ||
        STATUS_CODES[code as keyof typeof STATUS_CODES] ||
        `HTTP Code ${code}`,
    );
    if (arguments.length >= 3 && extras) {
      // noinspection TypeScriptValidateTypes
      Object.assign(this, extras);
    }
    this.name = httpErrorToName(code);
    this.statusCode = code;
  }
}

export interface RawApiOptions {}

export class RawAPI {
  public url: string;
  public options: RawOptions;
  constructor(url: string, options: RawApiOptions = {}) {
    this.url = url;
    this.options = options;
  }

  private _parseQueryParams(params: string | { [key: string]: string }) {
    if (params) {
      if (typeof params === 'string') return params;

      //cleanup plain objects
      if (params.constructor === Object || params.constructor === undefined) {
        for (let k in params) {
          const v = params[k];
          if (v === null || v === undefined) delete params[k];
        }
      }
      return `?${new URLSearchParams(params)}`;
    }
    return '';
  }

  private async _fetch(url: string, options: RawOptions): Promise<any> {
    const response = await fetch(url, {
      method: options.method,
      headers: options.headers,
      body: options.body,
    } as RequestInit);

    let result;
    try {
      result = await response[options.responseType || 'json']();
    } catch (e) {
      throw new HTTPError(
        500,
        `Failed to parse response data. Original status: ${response.status} | ${response.statusText}`,
        {
          url: url,
          error: e,
        },
      );
    }

    if (!response.ok) {
      throw new HTTPError(response.status, response.statusText, result);
    }
    return result;
  }

  async http(endpoint: string, options: RawOptions): Promise<any> {
    const hasBody = !!options.body;
    options.method = options.method || (hasBody ? 'POST' : 'GET');
    if (!endpoint.startsWith('/')) {
      endpoint = `/${endpoint}`;
    }
    options.query = this._parseQueryParams(options.query);
    options.headers = options.headers || {};
    options.headers['Content-Type'] = 'application/json';
    if (options.body && typeof options.body !== 'string') {
      options.body = JSON.stringify(options.body);
    } else options.body = undefined;

    return await this._fetch(this.url + endpoint + options.query, options);
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

    const caller = stack?.[2];
    return caller ? caller : 'unknown context';
  }

  requires(name: string, value: any): void {
    if (!value) {
      throw `ArgumentError[${this.getCallerName()}] ${name} is missing - required property!`;
    }
  }
}
