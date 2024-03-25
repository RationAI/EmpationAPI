/* tslint:disable */

import { CaseCreatorType } from "src/v3/root/types/case-creator-type";
import { PreprocessingProgress } from "src/v3/root/types/preprocessing-progress";
import { WorkbenchServiceModelsV3ExaminationExamination } from "src/v3/root/types/workbench-service-models-v-3-examination-examination";

/* eslint-disable */
export interface CaseH {
  
  /**
   * List of all blocks of slides in case
   */
  blocks: Array<string>;

  /**
   * Timestamp (milliseconds) when the case was created
   */
  created_at: number;

  /**
   * Creator ID
   */
  creator_id: string;

  /**
   * Creator type
   */
  creator_type: CaseCreatorType;

  /**
   * Flag indicating whether the case and all underlying slide files and mappings have been deleted
   */
  deleted: (boolean | null);

  /**
   * Case description
   */
  description: (string | null);

  /**
   * Examinations in case
   */
  examinations: Array<WorkbenchServiceModelsV3ExaminationExamination>;

  /**
   * ID
   */
  id: string;

  /**
   * Local ID provided by AP-LIS
   */
  local_id: (string | null);

  /**
   * Base URL of Medical Data Service instance that generated empaia_id
   */
  mds_url: (string | null);

  /**
   * Progress of the preprocessing jobs running within the case
   */
  preprocessing_progress: PreprocessingProgress;

  /**
   * Number of slides in case
   */
  slides_count: number;

  /**
   * List of all stains of all slides in case
   */
  stains: {
};

  /**
   * List of tissue of all slides in case
   */
  tissues: {
};

  /**
   * Timestamp (milliseconds) when the case was last updated
   */
  updated_at: number;

  pathInHierarchy: string;
};
