/* tslint:disable */
/* eslint-disable */
export interface SlidePixelSizeNm {

  /**
   * Pixel size in horizontal direction in nm (finest level, level=0)
   */
  'x': number;

  /**
   * Pixel size in vertical direction in nm (finest level, level=0)
   */
  'y': number;

  /**
   * Distance of layers in a Z-Stack in nm
   */
  'z': (number | null);
}
