/* tslint:disable */
/* eslint-disable */
import { JobCreatorType } from './job-creator-type';
import { JobMode } from './job-mode';
export interface PostJob {

  /**
   * Whether this job uses a container or not (postprocessing only)
   */
  containerized?: boolean;

  /**
   * ID of the scope or user, that created the job
   */
  creator_id: string;

  /**
   * The type of creator that created the job. This can be a scope or a user (only for WBS v1)
   */
  creator_type: JobCreatorType;

  /**
   * The mode of the job corresponding to a mode in the EAD
   */
  mode?: JobMode;
}
