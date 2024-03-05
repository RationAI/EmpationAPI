import {RootAPI, RootContext} from "../../root";
import CaseExplorer from "../extensions/case-explorer";
import Root from "./root";
import { Case } from "./types/case";
import {CaseList} from "./types/case-list";
import { SlideList } from "./types/slide-list";

export default class Cases extends RootContext {
    protected context: RootAPI;
    protected data: CaseList;

    explorer: CaseExplorer;

    constructor(context: Root) {
        super();
        this.context = context;

        this.explorer = new CaseExplorer(this);
    }

    async list(cached = true): Promise<CaseList> {
        return this.data = (cached && this.data) || await this.context.rawQuery('/cases');
    }

    async get(caseId: string): Promise<Case> {
        return await this.context.rawQuery(`/cases/${caseId}`);
    }

    async slides(caseId: string): Promise<SlideList> {
        return await this.context.rawQuery(`/cases/${caseId}/slides`);
    }
}
