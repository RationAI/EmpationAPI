/* tslint:disable */
/* eslint-disable */
import { ArrowAnnotation } from './arrow-annotation';
import { CircleAnnotation } from './circle-annotation';
import { LineAnnotation } from './line-annotation';
import { PointAnnotation } from './point-annotation';
import { PolygonAnnotation } from './polygon-annotation';
import { RectangleAnnotation } from './rectangle-annotation';
export interface AnnotationListResponse {

  /**
   * Count of all items
   */
  item_count: number;

  /**
   * List of items
   */
  items: Array<(PointAnnotation | LineAnnotation | ArrowAnnotation | CircleAnnotation | RectangleAnnotation | PolygonAnnotation)>;
}
