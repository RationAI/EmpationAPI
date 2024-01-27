/* tslint:disable */
/* eslint-disable */
import { SlideExtent } from './slide-extent';
export interface SlideLevel {

  /**
   * Downsample factor for this level
   */
  downsample_factor: number;

  /**
   * Image extent for this level
   */
  extent: SlideExtent;
}
