/* tslint:disable */
/* eslint-disable */
import { SlideColor } from './slide-color';
export interface SlideChannel {

  /**
   * RGBA-value of the image channel
   */
  color: SlideColor;

  /**
   * Channel ID
   */
  id: number;

  /**
   * Dedicated channel name
   */
  name: string;
}
