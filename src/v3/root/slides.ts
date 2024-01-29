import {RootAPI, RootContext} from "../../root";
import Root from "./root";
import { Case } from "./types/case";
import {CaseList} from "./types/case-list";
import { Slide } from "./types/slide";

export default class Slides extends RootContext {
    protected context: RootAPI;
    protected data: Slide[];

    constructor(context: Root) {
        super();
        this.context = context;
    }
}
