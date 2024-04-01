/* tslint:disable */
/* eslint-disable */

export interface AnnotPresetObject {
  presets: AnnotPreset[];
}

export interface AnnotPreset {

  /**
   * UUID of given preset
   */
  id: string;

  /**
   * Hex color string in format #ffffff
   */
  color: string;

  /**
   * FactoryID of preset
   */
  factoryID: string;

  /**
   * PresetID of preset
   */
  presetID: string;

  /**
   * Metadata object of preset, keys are generated randomly because user can create 2 fields with the same name.
   */
  meta: {
    [key: string]: {
      name: string;
      value: string;
    }
  }

  /**
   * Date of creation in epoch time, used during update with merge strategy
   */
  createdAt?: number;
}