/* tslint:disable */
/* eslint-disable */
import { GlobalDataCreatorType } from './global-data-creator-type';
import { GlobalItemReferenceType } from './global-item-reference-type';
export interface PostGlobalStringItem {

  /**
   * Id of the creator of this global item
   */
  creator_id: string;

  /**
   * Creator type
   */
  creator_type: GlobalDataCreatorType;

  /**
   * Global item description
   */
  description?: (string | null);

  /**
   * ID of type UUID4 (only needed in post if external Ids enabled)
   */
  id?: (string | null);

  /**
   * Global item name
   */
  name: string;

  /**
   * Id of the object referenced by this global item
   */
  reference_id?: (string | null);

  /**
   * Reference type
   */
  reference_type?: (GlobalItemReferenceType | null);

  /**
   * String type
   */
  type: any;

  /**
   * String value
   */
  value: string;

  /**
   * Data type
   */
  data_type?: (string | null);
}
