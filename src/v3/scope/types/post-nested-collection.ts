/* tslint:disable */
/* eslint-disable */
import { CollectionReferenceType } from './collection-reference-type';
import { DataCreatorType } from './data-creator-type';
import { PostArrowCollection } from './post-arrow-collection';
import { PostBoolCollection } from './post-bool-collection';
import { PostCirceCollection } from './post-circe-collection';
import { PostClassCollection } from './post-class-collection';
import { PostContinuousPixelmapCollection } from './post-continuous-pixelmap-collection';
import { PostDiscretePixelmapCollection } from './post-discrete-pixelmap-collection';
import { PostFloatCollection } from './post-float-collection';
import { PostIdCollection } from './post-id-collection';
import { PostIntegerCollection } from './post-integer-collection';
import { PostLineCollection } from './post-line-collection';
import { PostNominalPixelmapCollection } from './post-nominal-pixelmap-collection';
import { PostPointCollection } from './post-point-collection';
import { PostPolygonCollection } from './post-polygon-collection';
import { PostRectangleCollection } from './post-rectangle-collection';
import { PostSlideCollection } from './post-slide-collection';
import { PostStringCollection } from './post-string-collection';
export interface PostNestedCollection {
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
  description?: string | null;

  /**
   * ID of type UUID4 (only needed in post if external Ids enabled)
   */
  id?: string | null;

  /**
   * Item type of collection
   */
  item_type: any;

  /**
   * List of items
   */
  items?: Array<
    | PostPointCollection
    | PostLineCollection
    | PostArrowCollection
    | PostCirceCollection
    | PostRectangleCollection
    | PostPolygonCollection
    | PostClassCollection
    | PostIntegerCollection
    | PostFloatCollection
    | PostBoolCollection
    | PostStringCollection
    | PostContinuousPixelmapCollection
    | PostDiscretePixelmapCollection
    | PostNominalPixelmapCollection
    | PostSlideCollection
    | PostIdCollection
    | PostNestedCollection
  > | null;

  /**
   * Collection name
   */
  name?: string | null;

  /**
   * Id of the object referenced by this collection
   */
  reference_id?: string | null;

  /**
   * Refrence type
   */
  reference_type?: CollectionReferenceType | null;

  /**
   * Collection type
   */
  type: any;
}
