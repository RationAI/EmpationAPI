/* tslint:disable */
/* eslint-disable */
export interface PixelmapLevel {
  /**
   * Largest x index of all tiles in the PixelmapLevel. Tiles to the right side of the index cannot be created.             Is used by viewers to avoid unnecessary requests for sparse data.
   */
  position_max_x?: number | null;

  /**
   * Largest y index of all tiles in the PixelmapLevel. Tiles below the index cannot be created. Is used by             viewers to avoid unnecessary requests for sparse data.
   */
  position_max_y?: number | null;

  /**
   * Smallest x index of all tiles in the PixelmapLevel. Tiles to the left side of the index cannot be created.             Is used by viewers to avoid unnecessary requests for sparse data.
   */
  position_min_x?: number | null;

  /**
   * Smallest y index of all tiles in the PixelmapLevel. Tiles above the index cannot be created. Is used by             viewers to avoid unnecessary requests for sparse data.
   */
  position_min_y?: number | null;

  /**
   * refers to a WSI level
   */
  slide_level: number;
}
