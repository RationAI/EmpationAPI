/* tslint:disable */
/* eslint-disable */
import { GlobalItem } from './global-item';
export interface GlobalItemList {

  /**
   * Count of all items
   */
  item_count: number;

  /**
   * List of items
   */
  items: Array<(GlobalItem)>;
}