import {RawAPI, RawOptions} from "../../base";
import { parseJwtToken} from "../../utils";
import { RationAIAPI } from "../../rationai";
import Root from "../root/root";
import GlobalStorage from "./global-storage";

export default class RationAI extends RationAIAPI {
    static apiPath = '/v3/rationai';

    //interface
    raw: RawAPI;
    context: Root;

    //custom
    globalStorage: GlobalStorage;

    protected _userId: string;
    protected _accessToken: string | null = null;

    constructor(context: Root) {
      super();
      this.context = context;
      this._userId = this.context.userId;
      this.raw = new RawAPI(this.context.options.apiUrl + RationAI.apiPath, {
          errorHandler: this.raiseConnectionError.bind(this),
          maxRetryCount: this.context.options.maxRetryCount,
          nextRetryInMs: this.context.options.nextRetryInMs
      });
      this.globalStorage = new GlobalStorage(this);
  }

    get userId(): string {
        return this._userId;
    }

    async use(userId: string): Promise<void> {
        if (!userId || userId.length > 50) throw "Invalid User ID! Must be valid string shorter than 50 characters!";
        if (this._userId === userId) return;
        this._userId = userId;
        this.raiseEvent('init');
    }

    async rawQuery(endpoint: string, options: RawOptions={}): Promise<any> {
        this.requires('this.userId', this._userId);
        options = options || {};
        options.headers = options.headers || {};
        options.headers["User-Id"] = this._userId;
        if (this._accessToken) {
            options.headers['Authorization'] = options.headers['Authorization'] || `Bearer ${this._accessToken}`;
        }
        return this.raw.http(endpoint, options);
    }

    async from(token: string): Promise<void> {
        this._accessToken = token;
        const tokenSub = parseJwtToken(token).sub;
        await this.use(tokenSub);
    }

    reset(): void {
        this._userId = this.context.options.anonymousUserId;
        this.raiseEvent('reset');
    }
}
