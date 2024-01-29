import {EmpationAPIOptions, RawAPI, RawOptions} from "../../base";
import {ScopesAPI} from "../../scope";
import {RootAPI} from "../../root";
import Scopes from "../scope/scopes";
import Apps from "./apps";
import Cases from "./cases";
import Examinations from "./examinations";
import {JwtToken} from "../../utils";

export default class Root extends RootAPI {
    static apiPath = '/v3';

    //interface
    protected raw: RawAPI;
    scopes: Scopes;
    version: string;

    //custom
    apps: Apps;
    cases: Cases;
    examinations: Examinations;

    protected _userId: string;

    constructor(options: EmpationAPIOptions) {
        super(options);
        this.version = "v3";
        this.raw = new RawAPI(this.apiUrl + Root.apiPath);
        this.scopes = new Scopes(this);

        this.apps = new Apps(this);
        this.cases = new Cases(this);
        this.examinations = new Examinations(this);
    }

    get userId(): string {
        return this._userId;
    }

    async use(userId: string): Promise<void> {
        this._userId = userId;
        this.raiseEvent('context');
    }

    async rawQuery(endpoint: string, options: RawOptions={}): Promise<any> {
        this.requires('this.userId', this._userId);
        options = options || {};
        options.headers = options.headers || {};
        options.headers["User-Id"] = this._userId;
        return this.raw.http(endpoint, options);
    }

    async from(token: JwtToken): Promise<void> {
        await this.use(token.sub);
    }

    reset(): void {
        //todo clear all cached data
        // ... delete this.examinations.data;

        this._userId = undefined;
        this.scopes.reset();
        this.raiseEvent('reset');
    }
}
