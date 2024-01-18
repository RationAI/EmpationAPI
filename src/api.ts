import {EventSource} from "./events";

export interface EmpationAPIOptions {
    workbenchApiUrl: string;
    apiRootPath?: string;
}

export interface RawOptions {
    body?: any;
    method?: string;
    headers?: any;
}

export class RawAPI {

    url: string;

    constructor(url) {
        this.url = url;
    }

    async http(endpoint: string, options: RawOptions={}): Promise<any> {
        const method = options.method || (options.body ? "POST" : "GET");
        if (!endpoint.startsWith('/')) {
            endpoint = `/${endpoint}`;
        }
        return fetch(this.url + endpoint, {
            method: method,
            headers: options.headers,
            body: options.body
        });
    }
}

export abstract class BaseAPI extends EventSource {

    //todo consider implementing 'observe' method that registers and watches certain property list..
    abstract raw: RawAPI;
    abstract scopes: ScopesAPI;

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
}

/**
 * Scope Binds Examination and User.
 */
export abstract class ScopesAPI extends EventSource {

    abstract raw: RawAPI;
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
    abstract use(caseId: string, examinationId: string | undefined): Promise<void>;
}



