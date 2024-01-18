/* tslint:disable */
/* eslint-disable */
import { Job } from './job';

/**
 * Job query result.
 */
export interface JobList {

  /**
   * Number of Jobs as queried without skip and limit applied
   */
  item_count: number;

  /**
   * List of Job items as queried with skip and limit applied
   */
  items: Array<Job>;
}
