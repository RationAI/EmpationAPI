/* tslint:disable */
/* eslint-disable */
import { GlobalItemType } from './global-item-type';
export interface GlobalStorageQuery {
  /**
   * List of creator Ids
   */
  creators?: Array<string> | null;

  /**
   * List of Global item Ids (must be of type UUID4)
   */
  item_ids?: Array<any> | null;

  /**
   * List of reference Ids. IMPORTANT NOTE: Can be null, if global items without reference should be included!
   */
  references?: Array<string | null> | null;

  /**
   * List of global item 'value' field types (now we have just a string)
   */
  types?: Array<GlobalItemType> | null;

  /**
   * List of global item data types
   */
  data_types?: Array<string> | null;
}
