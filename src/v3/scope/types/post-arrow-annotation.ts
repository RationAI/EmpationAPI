/* tslint:disable */
/* eslint-disable */
import { AnnotationReferenceType } from './annotation-reference-type';
import { DataCreatorType } from './data-creator-type';
export interface PostArrowAnnotation {
  /**
   * Centroid of the annotation
   */
  centroid?: Array<number> | null;

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
  description?: string | null;

  /**
   * Point coordinates of arrow head (must be >= 0)
   */
  head: Array<number>;

  /**
   * ID of type UUID4 (only needed in post if external Ids enabled)
   */
  id?: string | null;

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
  npp_viewing?: Array<number> | null;

  /**
   * ID of referenced Slide
   */
  reference_id: string;

  /**
   * Reference type (must be "wsi")
   */
  reference_type: AnnotationReferenceType;

  /**
   * Point coordinates of arrow tail (must be >= 0)
   */
  tail: Array<number>;

  /**
   * Arrow annotation
   */
  type: any;
}
