/* tslint:disable */
/* eslint-disable */
import { CollectionReferenceType } from './collection-reference-type';
import { DataCreatorType } from './data-creator-type';
import { PostClass } from './post-class';
export interface PostClassCollection {

  /**
   * Creator Id
   */
  creator_id: string;

  /**
   * Creator type
   */
  creator_type: DataCreatorType;

  /**
   * Collection description
   */
  description?: (string | null);

  /**
   * ID of type UUID4 (only needed in post if external Ids enabled)
   */
  id?: (string | null);

  /**
   * Item type of collection
   */
  item_type: any;

  /**
   * List of classes
   */
  items?: (Array<PostClass> | null);

  /**
   * Collection name
   */
  name?: (string | null);

  /**
   * Id of the object referenced by this collection
   */
  reference_id?: (string | null);

  /**
   * Refrence type
   */
  reference_type?: (CollectionReferenceType | null);

  /**
   * Collection type
   */
  type: any;
}
