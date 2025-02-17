import Cases from '../root/cases';
import { Slide } from '../root/types/slide';
import { matchStringOnSeparatorGroup } from './utils';
import { AuthIntegration } from '../integration';

export default class WsiExplorer {
  protected context: Cases;
  protected lastCaseId: string | null = null;
  protected data: Slide[] | null = null;
  protected slidesData: Slide[] | null = null;
  protected masksData: Slide[] | null = null;
  protected integration: AuthIntegration;

  maskIdentifierSeparator: string = '';
  maskIdentifierValue: string = '';

  constructor(context: Cases, integration: AuthIntegration) {
    this.context = context;
    this.integration = integration;
  }

  /**
   * Configure WsiExplorer with regex identifying the local_id part and value this part should contain to distiguish masks and slides.
   * @param maskIdentifierSeparator Regex specifying part of local_id that should identify the WSI type
   * @param maskIdentifierValue Value the local_id part of WSI should have to identify the WSI as mask
   */
  use(maskIdentifierSeparator: string, maskIdentifierValue: string): void {
    this.maskIdentifierSeparator = maskIdentifierSeparator;
    this.maskIdentifierValue = maskIdentifierValue;
  }

  /**
   * Fetch all WSIs of case
   * @param caseId ID of case
   */
  private async getAllSlides(caseId: string): Promise<Slide[]> {
    if (this.lastCaseId !== caseId || !this.data) {
      this.data = (await this.context.slides(caseId)).items;
    }
    return this.data;
  }

  /**
   * Fetch all actual slides of case
   * @param caseId ID of case
   */
  async slides(caseId: string): Promise<Slide[]> {
    if (this.lastCaseId !== caseId || !this.slidesData) {
      this.slidesData = (await this.getAllSlides(caseId)).filter((slide) => {
        return !matchStringOnSeparatorGroup(
          slide.local_id || '',
          this.maskIdentifierSeparator,
          1,
          this.maskIdentifierValue,
        );
      });
    }
    return this.slidesData;
  }

  /**
   * Fetch all masks of a case
   * @param caseId ID of case
   */
  async masks(caseId: string): Promise<Slide[]> {
    if (this.lastCaseId !== caseId || !this.masksData) {
      this.masksData = (await this.getAllSlides(caseId)).filter((slide) => {
        return matchStringOnSeparatorGroup(
          slide.local_id || '',
          this.maskIdentifierSeparator,
          1,
          this.maskIdentifierValue,
        );
      });
    }
    return this.masksData;
  }
}
