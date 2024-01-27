/* tslint:disable */
/* eslint-disable */
import { DataCreatorType } from './data-creator-type';
import { DiscretePixelmapElementType } from './discrete-pixelmap-element-type';
import { NumberClassMapping } from './number-class-mapping';
import { PixelmapLevel } from './pixelmap-level';
import { PixelmapReferenceType } from './pixelmap-reference-type';
export interface DiscretePixelmap {

  /**
   * A dict that maps the index values of the channels to fully qualified class names to express the semantic         meaning of that channel.
   */
  channel_class_mapping?: (Array<NumberClassMapping> | null);

  /**
   * number of channels the Pixelmap contains (must be > 0)
   */
  channel_count: number;

  /**
   * UNIX timestamp in seconds - set by server
   */
  created_at: number;

  /**
   * Creator ID
   */
  creator_id: string;

  /**
   * Creator type
   */
  creator_type: DataCreatorType;

  /**
   * Pixelmap description
   */
  description?: (string | null);

  /**
   * A dict that maps numeric values to fully qualified class names to express the semantic meaning of the values         in all channels. Note: only one mapping for all channels, make sure that the encoding does not overlap.
   */
  element_class_mapping?: (Array<NumberClassMapping> | null);

  /**
   * the type of the scalar elements in the Pixelmap. If the Pixelmap has multiple channels (a depth>1), they all         have the same element type.
   */
  element_type: DiscretePixelmapElementType;

  /**
   * ID of type UUID4 (only needed in post if external Ids enabled)
   */
  id?: (string | null);

  /**
   * Meta data describing which WSI levels will receive Pixelmap tiles and in which region (position_min_x,         position_min_y, position_max_x, position_max_y) of the given level the Pixelmap tiles will be written.         This meta data serves as a hint for viewers to not request non-existing tiles outside these regions.         If a certain level will not receive Pixelmap data, it should not be added to the list.
   */
  levels: Array<PixelmapLevel>;

  /**
   * The maximum value of the Pixelmap pixel element data
   */
  max_value: number;

  /**
   * The minimum value of the Pixelmap pixel element data
   */
  min_value: number;

  /**
   * Pixelmap name
   */
  name: string;
  neutral_value?: (number | null);

  /**
   * ID of referenced Slide
   */
  reference_id: string;

  /**
   * Reference type (must be "wsi")
   */
  reference_type: PixelmapReferenceType;

  /**
   * The width and height of each tile (only squares allowed, 256 <= tilesize <= 2048).
   */
  tilesize: number;

  /**
   * Discrete Pixelmap type
   */
  type: any;

  /**
   * UNIX timestamp in seconds - set by server
   */
  updated_at: number;
}
