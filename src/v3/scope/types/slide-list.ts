/* tslint:disable */
/* eslint-disable */
import { Slide } from './slide';
export interface SlideList {

  /**
   * Number of slides (not affected by skip/limit pagination)
   */
  item_count: number;

  /**
   * List of slides (affected by skip/limit pagination)
   */
  items: Array<Slide>;
}
