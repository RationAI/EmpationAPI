/* tslint:disable */
/* eslint-disable */
import { JobMode } from './job-mode';
export interface AppQuery {
  /**
   * List of app IDs
   */
  apps?: Array<string> | null;

  /**
   * List of job models
   */
  job_modes?: Array<JobMode> | null;

  /**
   * Filter option for stain types
   */
  stains?: Array<string> | null;

  /**
   * Filter option for tissue types
   */
  tissues?: Array<string> | null;
}
