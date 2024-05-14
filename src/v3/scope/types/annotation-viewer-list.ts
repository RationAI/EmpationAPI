/* tslint:disable */
/* eslint-disable */
export interface AnnotationViewerList {
  /**
   * List of annotation Ids
   */
  annotations: Array<string>;

  /**
   * Centroids of all annotations with higher resolution (lower npp_created / npp_viewing values) than specified by npp_viewing in the query.
   */
  low_npp_centroids: Array<Array<number>>;
}
