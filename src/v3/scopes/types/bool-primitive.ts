/* tslint:disable */
/* eslint-disable */
import { DataCreatorType } from './data-creator-type';
import { PrimitiveReferenceType } from './primitive-reference-type';
export interface BoolPrimitive {

  /**
   * Id of the creator of this primitive
   */
  creator_id: string;

  /**
   * Creator type
   */
  creator_type: DataCreatorType;

  /**
   * Primitive description
   */
  description?: (string | null);

  /**
   * ID of type UUID4 (only needed in post if external Ids enabled)
   */
  id?: (string | null);

  /**
   * Flag to mark a primitive as immutable
   */
  is_locked?: (boolean | null);

  /**
   * Primitive name
   */
  name: string;

  /**
   * Id of the object referenced by this primitive
   */
  reference_id?: (string | null);

  /**
   * Reference type
   */
  reference_type?: (PrimitiveReferenceType | null);

  /**
   * Bool type
   */
  type: any;

  /**
   * Bool value
   */
  value: boolean;
}
