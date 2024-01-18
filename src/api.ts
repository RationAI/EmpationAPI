import {EventSource} from "./events";
import {
    WorkbenchServiceApiV3CustomModelsExaminationsExamination
} from "./v3/base/types/workbench-service-api-v-3-custom-models-examinations-examination";
import {ExaminationQuery} from "./v3/base/types/examination-query";
import {ExaminationList} from "./v3/base/types/examination-list";
import {ScopeTokenAndScopeId} from "./v3/base/types/scope-token-and-scope-id";
import {Case} from "./v3/base/types/case";
import {CaseList} from "./v3/base/types/case-list";

export interface EmpationAPIOptions {
    workbenchApiUrl: string;
    apiRootPath?: string;
}

export interface RawOptions {
    body?: object;
    query?: string | string[][] | Record<string, string>;
    method?: string;
    headers?: object;
}

export class RawAPI {

    url: string;

    constructor(url) {
        this.url = url;
    }

    async http(endpoint: string, options: RawOptions): Promise<any> {
        const hasBody = !!options.body;
        const method = options.method || (hasBody ? "POST" : "GET");
        if (!endpoint.startsWith('/')) {
            endpoint = `/${endpoint}`;
        }
        let queryParams = '';
        if (options.query) {
            queryParams = `?${new URLSearchParams(options.query)}`;
        }
        const initParams = {
            method: method,
            headers: options.headers,
            body: hasBody ? JSON.stringify(options.body) : null
        } as RequestInit;
        const url = this.url + endpoint + queryParams;
        const response = await fetch(url, initParams);
        let result;
        try {
            result = await response.json();
        } catch (e) {
            throw `Raw HTTP: '${url}': failed to parse response data. Status: ${response.status} | ${response.statusText}`;
        }

        //todo consider better parsing of the reponse error
        if (!response.ok) {
            throw `Raw HTTP: '${url}': ${result.detail[0]?.msg}`;
        }
        return result;
    }
}

class AbstractAPI extends EventSource {
    //todo try figuring out how to print the class name too
    //https://stackoverflow.com/questions/280389/how-do-you-find-out-the-caller-function-in-javascript
    private getCallerName() {
        // Get stack array
        const orig = Error.prepareStackTrace;
        Error.prepareStackTrace = (error, stack) => stack;
        const { stack } = new Error();
        Error.prepareStackTrace = orig;

        const caller = stack[2];
        return caller ? caller : 'unknown context';
    }

    protected requires(name, value): void {
        if (!value) {
            throw `ArgumentError[${this.getCallerName()}] ${name} is missing - required property!`
        }
    }
}

export abstract class BaseAPI extends AbstractAPI {

    //todo consider implementing 'observe' method that registers and watches certain property list..
    protected abstract raw: RawAPI;
    abstract scopes: ScopesAPI;
    abstract cases: CaseList;

    options: EmpationAPIOptions;
    apiUrl: string;

    protected constructor(options: EmpationAPIOptions) {
        super();

        if (!options.workbenchApiUrl) {
            throw "WB Api url is required!";
        }

        this.options = options;
        if (!options.apiRootPath) {
            this.apiUrl = options.workbenchApiUrl;
        } else if (!options.apiRootPath.startsWith("/")) {
            this.apiUrl = `${options.workbenchApiUrl}/${options.apiRootPath}`;
        } else {
            this.apiUrl = `${options.workbenchApiUrl}${options.apiRootPath}`;
        }
        if (this.apiUrl.endsWith('/')) {
            this.apiUrl = this.apiUrl.slice(0, -1);
        }
    }

    /**
     * Change the User actor for the API. Note: the api will
     * reset it's whole state.
     * @param userId
     * @protected
     */
    abstract useUser(userId: string): Promise<void>;

    abstract rawQuery(endpoint: string, options?: RawOptions): Promise<any>;

    abstract crateExamination(caseId: string, appId?: string): Promise<WorkbenchServiceApiV3CustomModelsExaminationsExamination>;

    abstract queryExamination(query: ExaminationQuery, skip, limit): Promise<ExaminationList>;

    abstract getExamination(examinationId?: string): Promise<ExaminationList>;

    abstract getScopeForExamination(examinationId: string): Promise<ScopeTokenAndScopeId>;


}


/**
 * Scope Binds Examination and User.
 */
export abstract class ScopesAPI extends AbstractAPI {

    protected abstract raw: RawAPI;
    protected context: BaseAPI;

    protected constructor(context: BaseAPI) {
        super();
        this.context = context;
    }

    /**
     * Change the active Scope for the API. Note: the scope state will reset.
     * @param caseId case id - manages the active scope
     * @param examinationId examination id - manages the active scope
     *          if undefined, the examination is managed internally
     * @protected
     */
    abstract use(caseId: string, examinationId?: string): Promise<void>;

    abstract rawQuery(endpoint: string, options?: RawOptions): Promise<any>;
}



