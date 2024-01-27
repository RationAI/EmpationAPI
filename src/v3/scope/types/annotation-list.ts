/* tslint:disable */
/* eslint-disable */
import { ArrowAnnotation } from './arrow-annotation';
import { CircleAnnotation } from './circle-annotation';
import { LineAnnotation } from './line-annotation';
import { PointAnnotation } from './point-annotation';
import { PolygonAnnotation } from './polygon-annotation';
import { RectangleAnnotation } from './rectangle-annotation';
export interface AnnotationList {

  /**
   * Count of all items
   */
  item_count: number;

  /**
   * List of items
   */
  items: Array<(PointAnnotation | LineAnnotation | ArrowAnnotation | CircleAnnotation | RectangleAnnotation | PolygonAnnotation)>;

  /**
   * Centroids of all annotations with higher resolution (lower npp_created / npp_viewing values) than specified by npp_viewing in the query.
   */
  low_npp_centroids?: (Array<Array<number>> | null);
}
