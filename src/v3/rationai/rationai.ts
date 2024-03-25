import {RawOptions} from "../../base";
import Root from "../root/root";
import GlobalStorage from "./global-storage";

export default class RationAI {
    static relativeApiPath = '/rationai';

    context: Root;

    //custom
    globalStorage: GlobalStorage;

    constructor(context: Root) {
      this.context = context;
      this.globalStorage = new GlobalStorage(this);
    }

    get userId(): string {
        return this.context.userId;
    }

    async rawQuery(endpoint: string, options: RawOptions={}): Promise<any> {
        return this.context.rawQuery(`${RationAI.relativeApiPath}${endpoint}`, options);
    }
}
