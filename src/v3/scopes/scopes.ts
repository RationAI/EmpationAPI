import {RawAPI, ScopesAPI, BaseAPI, RawOptions} from "../../api";
import {
    WorkbenchServiceApiV3CustomModelsExaminationsExamination
} from "../base/types/workbench-service-api-v-3-custom-models-examinations-examination";
import {ScopeTokenAndScopeId} from "../base/types/scope-token-and-scope-id";

//todo consider autocaching enabled (e.g. check last updated prop...)
export class V3Scopes extends ScopesAPI {
    static apiPath = '/v3/scopes';

    raw: RawAPI;
    scopeContext: ScopeTokenAndScopeId;

    private defaultExaminationId: string;

    constructor(context: BaseAPI) {
        super(context);
        this.raw = new RawAPI(this.context.apiUrl + V3Scopes.apiPath);
    }

    async use(caseId: string, examinationId: string = undefined): Promise<void> {
        //todo consider caching

        //todo unfortunatelly app id cannot be null -> we need to have an app for a scope :(
        let data;

        //supports 'default' examination
        if (!examinationId) {
            if (!this.defaultExaminationId) {
                data = await this.context.crateExamination(caseId) as WorkbenchServiceApiV3CustomModelsExaminationsExamination;
                this.defaultExaminationId = data.id;
                console.log(data);
            } else {
                // data = await this.context.getExamination(this.defaultExaminationId);
            }
            examinationId = this.defaultExaminationId;
        } else {
            // data = await this.context.getExamination(examinationId);
        }

        console.log("USECAL",examinationId);
        this.scopeContext = await this.context.getScopeForExamination(examinationId);
    }

    rawQuery(endpoint: string, options?: RawOptions): Promise<any> {
        this.requires('this.scopeContext', this.scopeContext);
        options = options || {};
        options.headers = options.headers || {};
        options.headers["Authorization"] = this.scopeContext.access_token;
        if (!endpoint.startsWith('/')) {
            endpoint = `/${endpoint}`;
        }
        return this.raw.http(`/${this.scopeContext.scope_id}${endpoint}`, options);
    }
}
