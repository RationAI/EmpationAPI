/* tslint:disable */
/* eslint-disable */
import { ArrowAnnotation } from './arrow-annotation';
import { BoolPrimitive } from './bool-primitive';
import { CircleAnnotation } from './circle-annotation';
import { Class } from './class';
import { CollectionItemType } from './collection-item-type';
import { CollectionReferenceType } from './collection-reference-type';
import { ContinuousPixelmap } from './continuous-pixelmap';
import { DataCreatorType } from './data-creator-type';
import { DiscretePixelmap } from './discrete-pixelmap';
import { FloatPrimitive } from './float-primitive';
import { IdObject } from './id-object';
import { IntegerPrimitive } from './integer-primitive';
import { LineAnnotation } from './line-annotation';
import { NominalPixelmap } from './nominal-pixelmap';
import { PointAnnotation } from './point-annotation';
import { PolygonAnnotation } from './polygon-annotation';
import { RectangleAnnotation } from './rectangle-annotation';
import { SlideItem } from './slide-item';
import { StringPrimitive } from './string-primitive';
export interface Collection {

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
   * Flag to mark a collection as immutable
   */
  is_locked?: (boolean | null);

  /**
   * The number of items in the collection
   */
  item_count?: (number | null);

  /**
   * Ids of items in collection
   */
  item_ids?: (Array<string> | null);

  /**
   * Item type of collection
   */
  item_type: CollectionItemType;

  /**
   * Items of the collection
   */
  items?: (Array<PointAnnotation> | Array<LineAnnotation> | Array<ArrowAnnotation> | Array<CircleAnnotation> | Array<RectangleAnnotation> | Array<PolygonAnnotation> | Array<Class> | Array<IntegerPrimitive> | Array<FloatPrimitive> | Array<BoolPrimitive> | Array<StringPrimitive> | Array<ContinuousPixelmap> | Array<DiscretePixelmap> | Array<NominalPixelmap> | Array<SlideItem> | Array<IdObject> | Array<Collection> | null);

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
