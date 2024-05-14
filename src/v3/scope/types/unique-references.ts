/* tslint:disable */
/* eslint-disable */
export interface UniqueReferences {
  /**
   * List of unique referenced annotation IDs (type UUID4)
   */
  annotation?: Array<string> | null;

  /**
   * List of unique referenced collection IDs (type UUID4)
   */
  collection?: Array<string> | null;

  /**
   * If true: there are items matching the filter criteria without a reference
   */
  contains_items_without_reference?: boolean | null;

  /**
   * List of unique referenced WSI IDs (type string)
   */
  wsi?: Array<string> | null;
}
