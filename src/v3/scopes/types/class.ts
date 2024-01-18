/* tslint:disable */
/* eslint-disable */
import { ClassReferenceType } from './class-reference-type';
import { DataCreatorType } from './data-creator-type';
export interface Class {

  /**
   * Creator ID
   */
  creator_id: string;

  /**
   * Creator type
   */
  creator_type: DataCreatorType;

  /**
   * ID of type UUID4 (only needed in post if external Ids enabled)
   */
  id?: (string | null);

  /**
   * Flag to mark a class as immutable
   */
  is_locked?: (boolean | null);

  /**
   * ID of type UUID4 - ID of referenced annotation
   */
  reference_id: string;

  /**
   * Reference type (must be "annotation")
   */
  reference_type: ClassReferenceType;

  /**
   * Item of type "class"
   */
  type: any;

  /**
   * Either a value from EMPAIA App Description or a permitted global class value
   */
  value: string;
}
