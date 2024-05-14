/* tslint:disable */
/* eslint-disable */
import { JobCreatorType } from './job-creator-type';
import { JobMode } from './job-mode';
import { JobStatus } from './job-status';
import { JobValidationStatus } from './job-validation-status';

/**
 * This describes the actual job and is a superset of the job-request, adding status parameters that are added
 * after the job has been created, such as the access-token, but also status-information and references to the created
 * output.
 */
export interface Job {
  /**
   * The ID of the app to start, including the exact version of the app
   */
  app_id?: string | null;

  /**
   * Whether this job uses a container or not (postprocessing only)
   */
  containerized?: boolean;

  /**
   * Time when the job was created
   */
  created_at: number;

  /**
   * ID of the scope or user, that created the job
   */
  creator_id: string;

  /**
   * The type of creator that created the job. This can be a scope or a user (only for WBS v1)
   */
  creator_type: JobCreatorType;

  /**
   * Time when the job was completed or when it failed
   */
  ended_at?: number | null;

  /**
   * Optional error message in case the job failed
   */
  error_message?: string | null;

  /**
   * The unique ID of the job, set by the database
   */
  id: string;

  /**
   * Optional error message in case the input validation failed
   */
  input_validation_error_message?: string | null;

  /**
   * Validation status for the job inputs
   */
  input_validation_status?: JobValidationStatus;

  /**
   * Data references to input parameters, added after job creation
   */
  inputs: {
    [key: string]: string;
  };

  /**
   * The mode of the job corresponding to a mode in the EAD
   */
  mode?: JobMode;

  /**
   * Optional error message in case the output validation failed
   */
  output_validation_error_message?: string | null;

  /**
   * Validation status for the job outputs
   */
  output_validation_status?: JobValidationStatus;

  /**
   * Data references to output values, added when the job is being executed
   */
  outputs: {
    [key: string]: string;
  };

  /**
   * The progress of the job between 0.0 and 1.0
   */
  progress?: number | null;

  /**
   * Time in seconds the job is running (if status RUNNING) or was running (if status COMPLETED)
   */
  runtime?: number | null;

  /**
   * Time when execution of the job was started
   */
  started_at?: number | null;

  /**
   * The current status of the job
   */
  status: JobStatus;
}
