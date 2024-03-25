import {EmpationAPIOptions, RawAPI, RawOptions} from "../../base";
import {RootAPI} from "../../root";
import Scopes from "../scope/scopes";
import Apps from "./apps";
import Cases from "./cases";
import Examinations from "./examinations";
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

    constructor(options: EmpationAPIOptions) {
        super(options);
        this.version = "v3";
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

    async rawQuery(endpoint: string, options: RawOptions={}): Promise<any> {
        await super.rawQuery(endpoint, options);
        options = options || {};
        options.headers = options.headers || {};
        options.headers["User-Id"] = this.userId;
        if (this.accessToken) {
            options.headers['Authorization'] = options.headers['Authorization'] || `Bearer ${this.rawToken}`;
        }
        return this.raw.http(endpoint, options);
    }
}
