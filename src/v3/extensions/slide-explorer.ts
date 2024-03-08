import Cases from "../root/cases";
import { Slide } from "../root/types/slide";
import { matchStringOnSeparatorGroup } from "./utils";

export default class SlideExplorer {
    protected context: Cases;
    protected data: Slide[] | null = null;
    protected slidesData: Slide[] | null = null;
    protected masksData: Slide[] | null = null;

    maskIdentifierSeparator: string = "";
    maskIdentifierValue: string = "";

    constructor(context: Cases) {
        this.context = context;
    }

    use(maskIdentifierSeparator: string, maskIdentifierValue: string): void {
      this.maskIdentifierSeparator = maskIdentifierSeparator;
      this.maskIdentifierValue = maskIdentifierValue;
    }

    private async getAllSlides(caseId: string): Promise<Slide[]> {
      if (!this.data) {
        this.data = (await this.context.slides(caseId)).items;
      }
      return this.data
    }

    async actualSlides(caseId: string): Promise<Slide[]> {
      if (!this.slidesData) {
        this.slidesData = (await this.getAllSlides(caseId)).filter((slide) => { 
          return !matchStringOnSeparatorGroup(slide.local_id || "", this.maskIdentifierSeparator, 1, this.maskIdentifierValue);
        })
      }
      return this.slidesData;
    }

    async masks(caseId: string): Promise<Slide[]> {
      if (!this.masksData) {
        this.masksData = (await this.getAllSlides(caseId)).filter((slide) => { 
          return matchStringOnSeparatorGroup(slide.local_id || "", this.maskIdentifierSeparator, 1, this.maskIdentifierValue);
        })
      }
      return this.masksData;
    }
}
