/* tslint:disable */
/* eslint-disable */
export interface ClassQuery {
  /**
   * List of Class Ids (must be of type UUID4)
   */
  classes?: Array<any> | null;

  /**
   * List of creator Ids
   */
  creators?: Array<string> | null;

  /**
   * List of job Ids
   */
  jobs?: Array<string> | null;

  /**
   * List of annotation Ids (UUID type 4)
   */
  references?: Array<string> | null;
}
