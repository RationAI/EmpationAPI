import {RootAPI, RootContext} from "../../root";
import Root from "./root";
import { Case } from "./types/case";
import {CaseList} from "./types/case-list";
import { Slide } from "./types/slide";

export default class Cases extends RootContext {
    protected context: RootAPI;
    protected data: CaseList;

    constructor(context: Root) {
        super();
        this.context = context;
    }

    async list(): Promise<CaseList> {
        return this.data = await this.context.rawQuery('/cases') as CaseList;
    }

    async get(caseId: string): Promise<Case> {
        return await this.context.rawQuery(`/cases/${caseId}`)
    }

    async slides(caseId: string): Promise<Slide[]> {
        return await this.context.rawQuery(`/cases/${caseId}/slides`)
    }
}
