import {AbstractAPI, EmpationAPIOptions, RawAPI, RawOptions} from "./base";
import {ScopesAPI} from "./scope";
import {JwtToken} from "./utils";

export abstract class RootContext {
    protected abstract context: RootAPI;
    protected abstract data: any;
}

// BaseAPI implements AbstractAPI over /v[version]
export abstract class RootAPI extends AbstractAPI {

    // RawAPI implements access to the http endpoints
    protected abstract raw: RawAPI;
    // ScopesAPI implements AbstractAPI over /v[version]/scopes
    abstract scopes: ScopesAPI;

    // Properties
    abstract version: string;
    options: EmpationAPIOptions;
    apiUrl: string;
    cached: object;

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
    abstract from(token: JwtToken): Promise<void>;

    abstract reset(): void;

    abstract rawQuery(endpoint: string, options?: RawOptions): Promise<any>;
}




