import {EmpationAPIOptions, RawAPI, RawOptions} from "../../base";
import {RootAPI} from "../../root";
import Scopes from "../scope/scopes";
import Apps from "./apps";
import Cases from "./cases";
import Examinations from "./examinations";
import Slides from "./slides";
import RationAI from "../rationai/rationai";
import { WorkbenchServiceApiV3CustomModelsExaminationsExamination } from "./types/workbench-service-api-v-3-custom-models-examinations-examination";

export default class Root extends RootAPI {
    static apiPath = '/v3';

    //interface
    protected raw: RawAPI;
    defaultScope: Scopes;
    rationai: RationAI;
    version: string;
    rootURI: string;
    
    scopes: Map<string, Scopes>;

    //custom
    apps: Apps;
    cases: Cases;
    examinations: Examinations;
    slides: Slides;

    constructor(options: EmpationAPIOptions) {
        super(options);
        this.version = "v3";
        this.rootURI = this.options.apiUrl + Root.apiPath;
        this.raw = new RawAPI(this.rootURI);
        this.defaultScope = new Scopes(this);
        this.rationai = new RationAI(this);

        this.apps = new Apps(this);
        this.cases = new Cases(this);
        this.examinations = new Examinations(this);
        this.slides = new Slides(this);

        this.scopes = new Map<string, Scopes>();
    }

    private async newScope(examination: WorkbenchServiceApiV3CustomModelsExaminationsExamination) {
        const scope = new Scopes(this);
        await scope.from(examination);
        this.scopes.set(examination.id, scope);

        return scope;
    }

    async getScope(examination: WorkbenchServiceApiV3CustomModelsExaminationsExamination) {
        return this.scopes.get(examination.id) || await this.newScope(examination);
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
