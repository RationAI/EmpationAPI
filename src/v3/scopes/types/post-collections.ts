/* tslint:disable */
/* eslint-disable */
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
import { PostNestedCollection } from './post-nested-collection';
import { PostNominalPixelmapCollection } from './post-nominal-pixelmap-collection';
import { PostPointCollection } from './post-point-collection';
import { PostPolygonCollection } from './post-polygon-collection';
import { PostRectangleCollection } from './post-rectangle-collection';
import { PostSlideCollection } from './post-slide-collection';
import { PostStringCollection } from './post-string-collection';
export interface PostCollections {

  /**
   * List of items
   */
  items?: (Array<(PostPointCollection | PostLineCollection | PostArrowCollection | PostCirceCollection | PostRectangleCollection | PostPolygonCollection | PostClassCollection | PostIntegerCollection | PostFloatCollection | PostBoolCollection | PostStringCollection | PostContinuousPixelmapCollection | PostDiscretePixelmapCollection | PostNominalPixelmapCollection | PostSlideCollection | PostIdCollection | PostNestedCollection)> | null);
}
