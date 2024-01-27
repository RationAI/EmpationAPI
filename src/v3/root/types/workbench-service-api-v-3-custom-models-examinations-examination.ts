/* tslint:disable */
/* eslint-disable */
import { AppInput } from './app-input';
import { ExaminationCreatorType } from './examination-creator-type';
import { ExaminationState } from './examination-state';
import { Job } from './job';
export interface WorkbenchServiceApiV3CustomModelsExaminationsExamination {

  /**
   * Defines the API compatibility
   */
  api_version: 'v2' | 'v3';

  /**
   * App of this examination
   */
  app: AppInput;

  /**
   * App ID
   */
  app_id: string;

  /**
   * Case ID
   */
  case_id: string;

  /**
   * Timestamp (milliseconds) when the examination was created
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
   * ID
   */
  id: string;

  /**
   * List of job IDs in examination
   */
  jobs: Array<Job>;

  /**
   * Number of jobs (including finished) in examination
   */
  jobs_count: number;

  /**
   * Number of finished jobs in examination
   */
  jobs_count_finished: number;

  /**
   * Examination state
   */
  state: ExaminationState;

  /**
   * Timestamp (milliseconds) when the examination was last updated
   */
  updated_at: number;
}
