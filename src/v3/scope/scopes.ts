import {ScopesAPI} from "../../scope";
import {RawAPI, RawOptions} from "../../base";
import {ScopeTokenAndScopeId} from "../root/types/scope-token-and-scope-id";
import {
    WorkbenchServiceApiV3CustomModelsExaminationsExamination
} from "../root/types/workbench-service-api-v-3-custom-models-examinations-examination";
import {Root} from "../root/root";


export class Scopes extends ScopesAPI {
    static apiPath = '/v3/scopes';

    // Interface
    raw: RawAPI;
    context: Root;

    // Additional
    scopeContext: ScopeTokenAndScopeId;
    private defaultExaminationId: string;

    constructor(context: Root) {
        super();
        this.context = context;
        this.raw = new RawAPI(this.context.apiUrl + Scopes.apiPath);
    }

    async use(caseId: string, appId: string = undefined): Promise<void> {
        //todo consider caching

        this.requires("root::userId", this.context.userId);

        const findExamination = async (appId: string):
            Promise<WorkbenchServiceApiV3CustomModelsExaminationsExamination> => {

            let examinations = await this.context.examinations.query({
                apps: [appId],
                creators: [this.context.userId]
            });
            if (examinations.item_count > 0) {
                examination = examinations.items.find(ex => ex.state === "OPEN");
            }
            return examination ? examination : await this.context.examinations.create(caseId, appId);
        }


        let examination;
        if (appId) {
            examination = await findExamination(appId);
        } else if (this.defaultExaminationId) {
            examination = await this.context.examinations.get(this.defaultExaminationId);
        }

        if (!examination) {
            let app = await this.context.apps.default();
            examination = await findExamination(app.app_id);
            this.defaultExaminationId = examination.id;
        }

        await this.from(examination);
    }

    get scopeToken() {
        return this.scopeContext?.access_token;
    }

    async from(examination: WorkbenchServiceApiV3CustomModelsExaminationsExamination) {
        this.scopeContext = await this.context.examinations.scope(examination.id);
        this.raiseEvent('context');
    }

    reset(): void {
        //todo clear all cached data
        this.raiseEvent('reset');
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
