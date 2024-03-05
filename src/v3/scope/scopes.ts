import {ScopesAPI} from "../../scope";
import {RawAPI, RawOptions} from "../../base";
import {ScopeTokenAndScopeId} from "../root/types/scope-token-and-scope-id";
import {
    WorkbenchServiceApiV3CustomModelsExaminationsExamination
} from "../root/types/workbench-service-api-v-3-custom-models-examinations-examination";
import Root from "../root/root";
import Storage from "./storage";
import {parseJwtToken, ScopeToken} from "../../utils";
import Annotations from "./annotations";


export default class Scopes extends ScopesAPI {
    static apiPath = '/v3/scopes';

    // Interface
    raw: RawAPI;
    context: Root;
    storage: Storage;
    annotations: Annotations;

    // Additional
    scopeContext: ScopeTokenAndScopeId;
    private _defaultExaminationId: string;
    private _activeExaminationId: string;
    private _tokenRefetchInterval: NodeJS.Timeout;

    constructor(context: Root) {
        super();
        this.context = context;
        this.raw = new RawAPI(this.context.apiUrl + Scopes.apiPath, {
            errorHandler: this.raiseConnectionError.bind(this),
            maxRetryCount: this.context.options.maxRetryCount,
            nextRetryInMs: this.context.options.nextRetryInMs
        });
        this.storage = new Storage(this);
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
        } else if (this._defaultExaminationId) {
            examination = await this.context.examinations.get(this._defaultExaminationId);
        }

        if (!examination) {
            let app = await this.context.apps.default();
            examination = await findExamination(app.app_id);
            this._defaultExaminationId = examination.id;
        }

        await this.from(examination);
    }

    get scopeToken(): string {
        return this.scopeContext?.access_token;
    }

    async from(examination: WorkbenchServiceApiV3CustomModelsExaminationsExamination): Promise<void> {
        this.reset();
        this.scopeContext = await this.context.examinations.scope(examination.id);
        this._activeExaminationId = examination.id;
        const token = parseJwtToken(this.scopeContext.access_token) as ScopeToken;
        //timeout with 20 seconds slack OR 280 secs
        const timeout = token.exp*1e3 - Date.now() - 20e3 || 280e3;
        this._tokenRefetchInterval = setInterval(async () => {
            this.scopeContext = await this.context.examinations.scope(examination.id);
        }, timeout);
        this.raiseEvent('init');
    }

    reset(): void {
        this._activeExaminationId = null;
        this.scopeContext = null;
        if (this._tokenRefetchInterval) {
            clearInterval(this._tokenRefetchInterval);
            this._tokenRefetchInterval = null;
            //todo clear all cached data
            this.raiseEvent('reset');
        }
    }

    async rawQuery(endpoint: string, options?: RawOptions): Promise<any> {
        this.requires('this.scopeContext', this.scopeContext);
        options = options || {};
        options.headers = options.headers || {};
        options.headers["Authorization"] = `Bearer ${this.scopeContext.access_token}`;
        if (endpoint && !endpoint.startsWith('/')) {
            endpoint = `/${endpoint}`;
        }

        try {
            return await this.raw.http(`/${this.scopeContext.scope_id}${endpoint}`, options);
        } catch (e) {
            if (e.statusCode === 401) {
                this.scopeContext = await this.context.examinations.scope(this._activeExaminationId);
                return await this.raw.http(`/${this.scopeContext.scope_id}${endpoint}`, options);
            }

            throw e;
        }
    }
}
