import {EmpationAPIOptions, RawAPI, ScopesAPI, BaseAPI, RawOptions} from "../../api";
import {V3Scopes} from "../scopes/scopes";
import {Case} from "./types/case";
import {ExaminationList} from "./types/examination-list";
import {ExaminationQuery} from "./types/examination-query";
import {
    WorkbenchServiceApiV3CustomModelsExaminationsExamination
} from "./types/workbench-service-api-v-3-custom-models-examinations-examination";
import {ScopeTokenAndScopeId} from "./types/scope-token-and-scope-id";
import {CaseList} from "./types/case-list";

//todo consider implementing cacheable interface - any query can be cached...
// maybe through a service worker
export class V3Api extends BaseAPI {
    static apiPath = '/v3';

    scopes: ScopesAPI;

    cases: CaseList;

    protected userId: string;
    protected raw: RawAPI;

    constructor(options: EmpationAPIOptions) {
        super(options);
        this.raw = new RawAPI(this.apiUrl + V3Api.apiPath);
        this.scopes = new V3Scopes(this);
    }

    async useUser(userId: string): Promise<void> {
        this.userId = userId;
        await this.refreshCases();
    }

    async getScopeForExamination(examinationId: string): Promise<ScopeTokenAndScopeId> {
        this.requires('examinationId', examinationId);
        return this.rawQuery(`/examinations/${examinationId}/scope`, {
            method: 'PUT'
        });
    }

    async crateExamination(caseId: string, appId: string = null): Promise<WorkbenchServiceApiV3CustomModelsExaminationsExamination> {
        this.requires('caseId', caseId);
        return this.rawQuery('/examinations', {
            method: 'PUT',
            body: {
                case_id: caseId,
                app_id: appId
            }
        });
    }

    async queryExamination(query: ExaminationQuery, skip, limit): Promise<ExaminationList> {
        return undefined;
    }

    async getExamination(examinationId: string): Promise<ExaminationList> {
        this.requires('examinationId', examinationId);
        return this.rawQuery(`/examinations/${examinationId}`);
    }

    async rawQuery(endpoint: string, options: RawOptions={}): Promise<any> {
        this.requires('this.userId', this.userId);
        options = options || {};
        options.headers = options.headers || {};
        options.headers["User-Id"] = this.userId;
        return this.raw.http(endpoint, options);
    }

    protected async refreshCases(): Promise<void> {
        this.cases = await this.rawQuery('/cases');
    }
}
