/* tslint:disable */
/* eslint-disable */
import { CollectionItemType } from './collection-item-type';
export interface CollectionQuery {

  /**
   * List of creator Ids
   */
  creators?: (Array<string> | null);

  /**
   * List of item types
   */
  item_types?: (Array<CollectionItemType> | null);

  /**
   * List of job Ids
   */
  jobs?: (Array<string> | null);

  /**
   * List of reference Ids
   */
  references?: (Array<string> | null);
}
