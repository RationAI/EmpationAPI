/* tslint:disable */
/* eslint-disable */
import { ArrowAnnotation } from './arrow-annotation';
import { BoolPrimitive } from './bool-primitive';
import { CircleAnnotation } from './circle-annotation';
import { Class } from './class';
import { Collection } from './collection';
import { ContinuousPixelmap } from './continuous-pixelmap';
import { DiscretePixelmap } from './discrete-pixelmap';
import { FloatPrimitive } from './float-primitive';
import { IntegerPrimitive } from './integer-primitive';
import { LineAnnotation } from './line-annotation';
import { NominalPixelmap } from './nominal-pixelmap';
import { PointAnnotation } from './point-annotation';
import { PolygonAnnotation } from './polygon-annotation';
import { RectangleAnnotation } from './rectangle-annotation';
import { StringPrimitive } from './string-primitive';
export interface ItemQueryList {

  /**
   * Count of all items
   */
  item_count: number;

  /**
   * Items returned by item query
   */
  items: (Array<IntegerPrimitive> | Array<FloatPrimitive> | Array<BoolPrimitive> | Array<StringPrimitive> | Array<PointAnnotation> | Array<LineAnnotation> | Array<ArrowAnnotation> | Array<CircleAnnotation> | Array<RectangleAnnotation> | Array<PolygonAnnotation> | Array<Class> | Array<ContinuousPixelmap> | Array<DiscretePixelmap> | Array<NominalPixelmap> | Array<Collection>);
}
