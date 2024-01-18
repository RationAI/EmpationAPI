/* tslint:disable */
/* eslint-disable */
import { AnnotationReferenceType } from './annotation-reference-type';
import { DataCreatorType } from './data-creator-type';
export interface PostRectangleAnnotation {

  /**
   * Centroid of the annotation
   */
  centroid?: (Array<number> | null);

  /**
   * Creator ID
   */
  creator_id: string;

  /**
   * Creator type
   */
  creator_type: DataCreatorType;

  /**
   * Annotation description
   */
  description?: (string | null);

  /**
   * Rectangle height (must be > 0)
   */
  height: number;

  /**
   * ID of type UUID4 (only needed in post if external Ids enabled)
   */
  id?: (string | null);

  /**
   * Annotation name
   */
  name: string;

  /**
   * Resolution in npp (nanometer per pixel) used to indicate on which layer the annotation is created
   */
  npp_created: number;

  /**
   * Recommended viewing resolution range in npp (nanometer per pixel) - Can be set by app
   */
  npp_viewing?: (Array<number> | null);

  /**
   * ID of referenced Slide
   */
  reference_id: string;

  /**
   * Reference type (must be "wsi")
   */
  reference_type: AnnotationReferenceType;

  /**
   * Rectangle annotation
   */
  type: any;

  /**
   * Point coordinates of upper left corner of the rectangle (must be >= 0)
   */
  upper_left: Array<number>;

  /**
   * Rectangle width (must be > 0)
   */
  width: number;
}
