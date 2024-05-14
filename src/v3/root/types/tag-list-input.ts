/* tslint:disable */
/* eslint-disable */
import { AppTagInput } from './app-tag-input';
export interface TagListInput {
  /**
   * List of analysis
   */
  analysis?: Array<AppTagInput>;

  /**
   * List of market clearances / certifications
   */
  clearances?: Array<AppTagInput>;

  /**
   * List of indications
   */
  indications?: Array<AppTagInput>;

  /**
   * List of stains
   */
  stains?: Array<AppTagInput>;

  /**
   * List of tissues
   */
  tissues?: Array<AppTagInput>;
}
