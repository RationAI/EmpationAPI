/* tslint:disable */
/* eslint-disable */
import { BoolPrimitive } from './bool-primitive';
import { FloatPrimitive } from './float-primitive';
import { IntegerPrimitive } from './integer-primitive';
import { StringPrimitive } from './string-primitive';

export type Primitive =
  | IntegerPrimitive
  | FloatPrimitive
  | BoolPrimitive
  | StringPrimitive;
