import {AbstractAPI, ConnectionErrorEventArgs, EmpationAPIOptions, RawAPI, RawOptions} from "./base";
import {ScopesAPI} from "./scope";

export abstract class RootContext {
    protected abstract context: RootAPI;
    protected abstract data: any;
}

export interface RootAPIOptions {
    anonymousUserId: string;
    workbenchApiUrl: string;
    apiUrl: string;
    apiRootPath: string;
    maxRetryCount: number;
    nextRetryInMs: number | Array<number>;
}

// BaseAPI implements AbstractAPI over /v[version]
export abstract class RootAPI extends AbstractAPI {

    // RawAPI implements access to the http endpoints
    protected abstract raw: RawAPI;
    // ScopesAPI implements AbstractAPI over /v[version]/scopes
    abstract scopes: ScopesAPI;

    // Properties
    abstract version: string;
    abstract rootURI: string;
    options: RootAPIOptions;
    cached: object;

    protected constructor(options: EmpationAPIOptions) {
        super();

        if (!options.workbenchApiUrl) {
            throw "WB Api url is required!";
        }

        let apiUrl;
        if (!options.apiRootPath) {
            apiUrl = options.workbenchApiUrl;
        } else if (!options.apiRootPath.startsWith("/")) {
            apiUrl = `${options.workbenchApiUrl}/${options.apiRootPath}`;
        } else {
            apiUrl = `${options.workbenchApiUrl}${options.apiRootPath}`;
        }
        if (apiUrl.endsWith('/')) {
            apiUrl = apiUrl.slice(0, -1);
        }

        this.options = {
            apiUrl,
            workbenchApiUrl: options.workbenchApiUrl,
            anonymousUserId: options.anonymousUserId || 'anonymous',
            apiRootPath: options.apiRootPath || "",
            maxRetryCount: typeof options.maxRetryCount === "undefined" ? 4 : options.maxRetryCount,
            nextRetryInMs: options.nextRetryInMs || [5000, 10000, 20000, 30000],
        };
        this.cached = {};
    }

    /**
     * Change the User actor for the API. Note: the api will
     * reset it's whole state.
     * @param userId
     * @protected
     */
    abstract use(userId: string): Promise<void>;

    /**
     * Change the User actor for the API. Note: the api will
     * reset it's whole state.
     * @param token setup context from object
     */
    abstract from(token: string): Promise<void>;

    abstract reset(): void;

    abstract rawQuery(endpoint: string, options?: RawOptions): Promise<any>;
}




