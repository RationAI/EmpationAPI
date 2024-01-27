/* tslint:disable */
/* eslint-disable */
import { SlideChannel } from './slide-channel';
import { SlideExtent } from './slide-extent';
import { SlideLevel } from './slide-level';
import { SlidePixelSizeNm } from './slide-pixel-size-nm';
export interface SlideInfo {

  /**
   * Color depth (bitness) of each channel
   */
  channel_depth?: (number | null);

  /**
   * List of channels
   */
  channels?: (Array<SlideChannel> | null);

  /**
   * Image extent (finest level, level=0)
   */
  extent: SlideExtent;

  /**
   * Slide format identifier
   */
  format?: string;

  /**
   * Slide ID
   */
  id: string;
  levels: Array<SlideLevel>;

  /**
   * Number of levels in image pyramid
   */
  num_levels: number;

  /**
   * Pixel size in nm  (finest level, level=0)
   */
  pixel_size_nm: SlidePixelSizeNm;

  /**
   * Flag indicating if the raw slide can be downloaded
   */
  raw_download?: boolean;

  /**
   * Tile extent
   */
  tile_extent: SlideExtent;
}
