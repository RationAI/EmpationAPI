import {RawAPI, ScopesAPI, BaseAPI} from "../../api";

export class V3Scopes extends ScopesAPI {
    static apiPath = '/v3/scopes';

    raw: RawAPI;

    token: string;

    constructor(context: BaseAPI) {
        super(context);
        this.raw = new RawAPI(this.context.apiUrl + V3Scopes.apiPath);
    }

    async use(caseId: string, examinationId: string | undefined): Promise<void> {
        //todo if examination does not exist create default,
        // try to minimize the amount of examinations created this way
        // keep these open if possible
        // retrieve scope token + ensure it gets refreshed & used,
        //   make raw api more generic to ensure the token is easily used,
    }
}
