import {RootAPI, RootContext} from "../../root";
import Root from "./root";
import {CaseList} from "./types/case-list";

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
}
