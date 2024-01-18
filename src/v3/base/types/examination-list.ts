/* tslint:disable */
/* eslint-disable */
import { WorkbenchServiceApiV3CustomModelsExaminationsExamination } from './workbench-service-api-v-3-custom-models-examinations-examination';
export interface ExaminationList {

  /**
   * Number of examinations (not affected by skip/limit pagination) in case
   */
  item_count: number;

  /**
   * List of examinations (affected by skip/limit pagination) in case
   */
  items: Array<WorkbenchServiceApiV3CustomModelsExaminationsExamination>;
}
