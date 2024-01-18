import {EmpationAPIOptions, RawAPI, ScopesAPI, BaseAPI} from "../../api";
import {V3Scopes} from "../scopes/scopes";
import {Case} from "./types/case";

export class V3Api extends BaseAPI {
    static apiPath = '/v3';

    raw: RawAPI;
    scopes: ScopesAPI;

    cases: Array<Case>;

    protected userId: string;

    constructor(options: EmpationAPIOptions) {
        super(options);
        this.raw = new RawAPI(this.apiUrl + V3Api.apiPath);
        this.scopes = new V3Scopes(this);
    }

    async useUser(userId: string): Promise<void> {
        this.userId = userId;
        await this.refreshCases();
    }

    protected async refreshCases(): Promise<void> {
        this.cases = await this.raw.http('/cases', {
            headers: {
                'User-Id': this.userId
            }
        }).then(r => r.json());
    }
}
