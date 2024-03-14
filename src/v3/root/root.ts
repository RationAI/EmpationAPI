import {EmpationAPIOptions, RawAPI, RawOptions} from "../../base";
import {RootAPI} from "../../root";
import Scopes from "../scope/scopes";
import Apps from "./apps";
import Cases from "./cases";
import Examinations from "./examinations";
import { parseJwtToken} from "../../utils";
import Slides from "./slides";
import RationAI from "../rationai/rationai";

export default class Root extends RootAPI {
    static apiPath = '/v3';

    //interface
    protected raw: RawAPI;
    scopes: Scopes;
    rationai: RationAI;
    version: string;
    rootURI: string;

    //custom
    apps: Apps;
    cases: Cases;
    examinations: Examinations;
    slides: Slides;

    protected _userId: string;
    protected _accessToken: string | null = null;

    constructor(options: EmpationAPIOptions) {
        super(options);
        this.version = "v3";
        this._userId = this.options.anonymousUserId;
        this.rootURI = this.options.apiUrl + Root.apiPath;
        this.raw = new RawAPI(this.rootURI, {
            errorHandler: this.raiseConnectionError.bind(this),
            maxRetryCount: this.options.maxRetryCount,
            nextRetryInMs: this.options.nextRetryInMs
        });
        this.scopes = new Scopes(this);
        this.rationai = new RationAI(this);

        this.apps = new Apps(this);
        this.cases = new Cases(this);
        this.examinations = new Examinations(this);
        this.slides = new Slides(this);
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
        //todo clear all cached data
        // ... delete this.examinations.data;

        this._userId = this.options.anonymousUserId;
        this.scopes.reset();
        this.raiseEvent('reset');
    }
}
