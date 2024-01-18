/* tslint:disable */
/* eslint-disable */
import { BoolPrimitive } from './bool-primitive';
import { FloatPrimitive } from './float-primitive';
import { IntegerPrimitive } from './integer-primitive';
import { StringPrimitive } from './string-primitive';
export interface PrimitiveList {

  /**
   * Count of all items
   */
  item_count: number;

  /**
   * List of items
   */
  items: Array<(IntegerPrimitive | FloatPrimitive | BoolPrimitive | StringPrimitive)>;
}
