/* tslint:disable */
/* eslint-disable */
import { PrimitiveType } from './primitive-type';
export interface PrimitiveQuery {
  /**
   * List of creator Ids
   */
  creators?: Array<string> | null;

  /**
   * List of job Ids
   */
  jobs?: Array<string> | null;

  /**
   * List of Primitive Ids (must be of type UUID4)
   */
  primitives?: Array<any> | null;

  /**
   * List of reference Ids. IMPORTANT NOTE: Can be null, if primitives without reference should be included!
   */
  references?: Array<string | null> | null;

  /**
   * List of primitive types
   */
  types?: Array<PrimitiveType> | null;
}
