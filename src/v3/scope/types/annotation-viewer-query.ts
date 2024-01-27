/* tslint:disable */
/* eslint-disable */
import { AnnotationType } from './annotation-type';
import { Viewport } from './viewport';
export interface AnnotationViewerQuery {

  /**
   * List of class values.
   */
  class_values?: (Array<(string | null)> | null);

  /**
   * List of creator Ids
   */
  creators?: (Array<string> | null);

  /**
   * List of job Ids the annotations must be locked for. IMPORTANT NOTE: Can be a list with null as single value, if annotations not locked in any job should be returned!
   */
  jobs?: (Array<string> | Array<null> | null);

  /**
   * Resolution range in npp (nanometer per pixel) to filter annotations
   */
  npp_viewing?: (Array<number> | null);

  /**
   * List of reference Ids
   */
  references?: (Array<string> | null);

  /**
   * List of annotation types
   */
  types?: (Array<AnnotationType> | null);

  /**
   * The viewport (only annotations within are returned)
   */
  viewport?: (Viewport | null);
}
