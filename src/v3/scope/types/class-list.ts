/* tslint:disable */
/* eslint-disable */
import { Class } from './class';
export interface ClassList {
  /**
   * Count of all items
   */
  item_count: number;

  /**
   * List of items
   */
  items: Array<Class>;

  /**
   * List of unique class values (for classes matching given filter criteria when returned by query)
   */
  unique_class_values?: Array<string> | null;
}
