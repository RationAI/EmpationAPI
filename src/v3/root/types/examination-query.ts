/* tslint:disable */
/* eslint-disable */
import { ExaminationCreatorType } from './examination-creator-type';
export interface ExaminationQuery {
  /**
   * App IDs
   */
  apps?: Array<string> | null;

  /**
   * Case IDs
   */
  cases?: Array<string> | null;

  /**
   * Examination Creator Type
   */
  creator_types?: Array<ExaminationCreatorType> | null;

  /**
   * Creator IDs
   */
  creators?: Array<string> | null;

  /**
   * Job IDs
   */
  jobs?: Array<string> | null;

  /**
   * Scope IDs
   */
  scopes?: Array<string> | null;
}
