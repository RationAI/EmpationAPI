/* tslint:disable */
/* eslint-disable */

/**
 * Current status of a Job
 */
export enum JobStatus {
  None = 'NONE',
  Assembly = 'ASSEMBLY',
  Ready = 'READY',
  Scheduled = 'SCHEDULED',
  Running = 'RUNNING',
  Completed = 'COMPLETED',
  Failed = 'FAILED',
  Timeout = 'TIMEOUT',
  Error = 'ERROR',
  Incomplete = 'INCOMPLETE',
}
