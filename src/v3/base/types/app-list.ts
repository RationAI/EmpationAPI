/* tslint:disable */
/* eslint-disable */
import { AppOutput } from './app-output';
export interface AppList {

  /**
   * Number of apps (not affected by skip/limit pagination)
   */
  item_count: number;

  /**
   * List of apps (affected by skip/limit pagination)
   */
  items: Array<AppOutput>;
}
