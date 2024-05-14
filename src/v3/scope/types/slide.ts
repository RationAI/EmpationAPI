/* tslint:disable */
/* eslint-disable */
import { TagMapping } from './tag-mapping';
export interface Slide {
  /**
   * Block
   */
  block: string | null;

  /**
   * Case ID
   */
  case_id: string;

  /**
   * Timestamp (milliseconds) when the slide was created
   */
  created_at: number;

  /**
   * Flag indicating whether the underlying slide files and mappings have been deleted
   */
  deleted: boolean | null;

  /**
   * ID
   */
  id: string;

  /**
   * Local ID provided by AP-LIS
   */
  local_id: string | null;

  /**
   * Base URL of Medical Data Service instance that generated empaia_id
   */
  mds_url: string | null;

  /**
   * Stain Mapping
   */
  stain: TagMapping | null;

  /**
   * Tissue Mapping
   */
  tissue: TagMapping | null;

  /**
   * Slide
   */
  type?: any;

  /**
   * Timestamp (milliseconds) when the slide was last updated
   */
  updated_at: number;
}
