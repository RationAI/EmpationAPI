/* tslint:disable */
/* eslint-disable */
import { ExaminationCreatorType } from './examination-creator-type';
import { ExaminationState } from './examination-state';
export interface WorkbenchServiceModelsV3ExaminationExamination {

  /**
   * App ID
   */
  app_id: string;

  /**
   * Case ID
   */
  case_id: string;

  /**
   * UNIX timestamp in seconds - set by server
   */
  created_at: number;

  /**
   * Creator ID
   */
  creator_id: string;

  /**
   * Creator Type
   */
  creator_type: ExaminationCreatorType;

  /**
   * Examination ID
   */
  id: string;

  /**
   * Jobs in this examination
   */
  jobs: Array<string>;

  /**
   * Examination state
   */
  state: ExaminationState;

  /**
   * UNIX timestamp in seconds - set by server
   */
  updated_at: number;
}
