/* tslint:disable */
/* eslint-disable */
import { Case } from './case';
export interface CaseList {
  /**
   * Total number of cases accessible by user (number is not affected by skip/limit pagination)
   */
  item_count: number;

  /**
   * List of cases accessible by user (list content is affected by skip/limit pagination)
   */
  items: Array<Case>;
}
