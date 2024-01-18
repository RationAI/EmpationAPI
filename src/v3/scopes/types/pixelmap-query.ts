/* tslint:disable */
/* eslint-disable */
import { PixelmapType } from './pixelmap-type';
export interface PixelmapQuery {

  /**
   * List of creator Ids
   */
  creators?: (Array<string> | null);

  /**
   * List of job Ids
   */
  jobs?: (Array<string> | null);

  /**
   * List of Pixelmap Ids (must be of type UUID4)
   */
  pixelmaps?: (Array<any> | null);

  /**
   * List of reference Ids.
   */
  references?: (Array<string> | null);

  /**
   * List of pixelmap types
   */
  types?: (Array<PixelmapType> | null);
}
