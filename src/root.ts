import { AbstractAPI, EmpationAPIOptions, RawAPI, RawOptions } from './base';
import { ScopeAPI } from './scope';
import {
  getJwtTokenExpiresTimeout,
  JwtTokenBase,
  parseJwtToken,
} from './utils';

export abstract class RootContext {
  protected abstract context: RootAPI;
  protected abstract data: any;
}

export interface RootAPIOptions {
  anonymousUserId: string;
  workbenchApiUrl: string;
  apiUrl: string;
  apiRootPath: string;
}

// BaseAPI implements AbstractAPI over /v[version]
export abstract class RootAPI extends AbstractAPI {
  // RawAPI implements access to the http endpoints
  protected abstract raw: RawAPI;
  // default ScopeAPI implements AbstractAPI over /v[version]/scopes
  protected abstract defaultScopeKey: string;

  // Map of ScopeAPI, that implement AbstractAPI over /v[version]/scopes, allows keeping multiple scopes open at once
  abstract scopes: Map<string, ScopeAPI>;

  // Properties
  abstract version: string;
  abstract rootURI: string;
  options: RootAPIOptions;
  cached: object;
  accessToken: JwtTokenBase | null = null;

  private _userId: string;
  private _tokenExpires: number = 0;
  private _rawToken: string = '';

  protected constructor(options: EmpationAPIOptions) {
    super();

    if (!options.workbenchApiUrl) {
      throw 'WB Api url is required!';
    }

    let apiUrl;
    if (!options.apiRootPath) {
      apiUrl = options.workbenchApiUrl;
    } else if (!options.apiRootPath.startsWith('/')) {
      apiUrl = `${options.workbenchApiUrl}/${options.apiRootPath}`;
    } else {
      apiUrl = `${options.workbenchApiUrl}${options.apiRootPath}`;
    }
    if (apiUrl.endsWith('/')) {
      apiUrl = apiUrl.slice(0, -1);
    }
    this.options = {
      apiUrl,
      workbenchApiUrl: options.workbenchApiUrl,
      anonymousUserId: options.anonymousUserId || 'anonymous',
      apiRootPath: options.apiRootPath || '',
    };
    this._userId = this.options.anonymousUserId;
    this.cached = {};
  }

  /**
   * Change the User actor for the API. Note: the api will
   * reset it's whole state.
   * @param token setup context from object
   * @param withEvent
   */
  from(token: string, withEvent = true): void {
    if (!token) {
      return this.reset();
    }
    this._rawToken = token;
    withEvent = withEvent && !this.accessToken; //fire event only when we configure new session
    this.accessToken = parseJwtToken(token) as JwtTokenBase;
    const tokenTimeout = getJwtTokenExpiresTimeout(this.accessToken);
    this._tokenExpires = Date.now() + tokenTimeout / 2;
    let userId = this.accessToken.sub;
    if (!userId)
      throw 'Invalid User ID! Must be valid string shorter than 50 characters!';
    if (userId.length > 50) {
      console.warn(
        'User ID exceeded 50 characters! Using User ID shortened to first 50 characters!',
      );
      userId = userId.slice(0, 50);
    }
    if (this.userId === userId) return;
    this._userId = userId;
    if (withEvent) this.raiseEvent('init');
  }

  /**
   * Change the User actor for the API, without providing token. Used in no-token configuration. Note: the api will
   * reset it's whole state.
   * @param token setup context from object
   * @param withEvent
   */
  use(userId: string, withEvent = true): void {
    withEvent = withEvent && !this._userId; //fire event only when we configure new session
    this.reset();
    if (!userId || userId.length > 50)
      throw 'Invalid User ID! Must be valid string shorter than 50 characters!';
    this._userId = userId;
    if (withEvent) this.raiseEvent('init_no_token');
  }

  reset(): void {
    this._rawToken = '';
    this._tokenExpires = 0;
    this.accessToken = null;
    this._userId = this.options.anonymousUserId;
    this.defaultScopeKey = '';
    this.scopes.forEach((scp) => scp.reset());
    this.scopes.clear();
    this.raiseEvent('reset');
  }

  get userId(): string {
    return this._userId;
  }

  get rawToken(): string {
    return this._rawToken;
  }

  async rawQuery(endpoint: string, options?: RawOptions): Promise<any> {
    if (!this._userId) {
      throw "User must be configured to access Empaia API: either provide a valid 'anonymous' user ID through env variables, or configure the Root API with a valid token.";
    }

    if (this._tokenExpires > 0 && Date.now() > this._tokenExpires) {
      const eventObject = { newToken: '' };
      /**
       * @event token-refresh
       * Awaiting event. Provide newToken value in the event handler argument params object
       * for the root API to consume.
       */
      await this.raiseEventAwaiting('token-refresh', eventObject);
      this.from(eventObject.newToken);
    }
  }
}
