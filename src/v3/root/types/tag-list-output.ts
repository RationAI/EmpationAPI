/* tslint:disable */
/* eslint-disable */
import { AppTagOutput } from './app-tag-output';
export interface TagListOutput {

  /**
   * List of analysis
   */
  analysis: Array<AppTagOutput>;

  /**
   * List of market clearances / certifications
   */
  clearances: Array<AppTagOutput>;

  /**
   * List of indications
   */
  indications: Array<AppTagOutput>;

  /**
   * List of stains
   */
  stains: Array<AppTagOutput>;

  /**
   * List of tissues
   */
  tissues: Array<AppTagOutput>;
}
