/* tslint:disable */
/* eslint-disable */
import { AnnotationReferenceType } from './annotation-reference-type';
import { DataCreatorType } from './data-creator-type';
export interface PostCircleAnnotation {
  /**
   * Point coordinates of center (must be >= 0)
   */
  center: Array<number>;

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
   * Radius (must be > 0)
   */
  radius: number;

  /**
   * ID of referenced Slide
   */
  reference_id: string;

  /**
   * Reference type (must be "wsi")
   */
  reference_type: AnnotationReferenceType;

  /**
   * Circle annotation
   */
  type: any;
}
