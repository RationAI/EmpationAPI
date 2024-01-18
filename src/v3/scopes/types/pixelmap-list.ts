/* tslint:disable */
/* eslint-disable */
import { ContinuousPixelmap } from './continuous-pixelmap';
import { DiscretePixelmap } from './discrete-pixelmap';
import { NominalPixelmap } from './nominal-pixelmap';
export interface PixelmapList {

  /**
   * Count of all items
   */
  item_count: number;

  /**
   * List of items
   */
  items: Array<(ContinuousPixelmap | DiscretePixelmap | NominalPixelmap)>;
}
