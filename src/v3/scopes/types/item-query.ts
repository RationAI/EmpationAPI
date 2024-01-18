/* tslint:disable */
/* eslint-disable */
import { Viewport } from './viewport';
export interface ItemQuery {

  /**
   * Resolution range in npp (nanometer per pixel) to filter annotations (only used for annotations)
   */
  npp_viewing?: (Array<number> | null);

  /**
   * List of reference Ids
   */
  references?: (Array<string> | null);

  /**
   * The viewport (only used for annotations: only annotations within are returned)
   */
  viewport?: (Viewport | null);
}
