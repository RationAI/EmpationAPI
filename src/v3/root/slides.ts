import {RootAPI, RootContext} from "../../root";
import Root from "./root";
import { Case } from "./types/case";
import { Slide } from "./types/slide";
import { SlideInfo } from "./types/slide-info";

export default class Slides extends RootContext {
    protected context: RootAPI;
    protected data: Slide[];

    constructor(context: Root) {
        super();
        this.context = context;
    }

    async slideInfo(slideId: string): Promise<SlideInfo> {
        return await this.context.rawQuery(`/slides/${slideId}/info`)
    }

    async slideThumbnail(slideId: string, maxWidth: number, maxHeight: number, format?: string): Promise<string> {
        return await this.context.rawQuery(`/slides/${slideId}/thumbnail/max_size/${maxWidth}/${maxHeight}`, {
            query: {
                image_format: format
            }
        })
    }

    async slideLabel(slideId: string, maxWidth: number, maxHeight: number, format?: string): Promise<string> {
        return await this.context.rawQuery(`/slides/${slideId}/label/max_size/${maxWidth}/${maxHeight}`, {
            query: {
                image_format: format
            }
        })
    }
}
