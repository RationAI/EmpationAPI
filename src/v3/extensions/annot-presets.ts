import { HTTPError } from '../../../src/base';
import GlobalStorage from '../rationai/global-storage';
import { GlobalItem } from '../rationai/types/global-item';
import { AnnotPreset, AnnotPresetObject } from './types/annot-preset';
import { GlobalItemBase } from '../rationai/types/global-item-base';

type AnnotPresetGetResult = {
  presets: AnnotPreset[];
  lastModifiedAt: number;
  id: string;
};

type AnnotPresetUpdateResult = {
  presets: AnnotPreset[];
  successfulUpdate: boolean;
  lastModifiedAt: number;
};

export default class AnnotPresets {
  protected context: GlobalStorage;
  protected data: GlobalItem | null = null;

  protected presetDataType: string = 'annot_presets';

  constructor(context: GlobalStorage) {
    this.context = context;
  }

  /**
   * Configure AnnotPresets class with data type. Data type is used to filter global items.
   * @param presetDataType Data type of global items used to store annotation presets.
   */
  use(presetDataType: string): void {
    this.presetDataType = presetDataType;
  }

  /**
   * Fetch item containing annotation presets.
   * @param fresh Force fresh fetch of global item, otherwise cached version might be used
   * @param id Item id to look for, otherwise fetch first item
   */
  private async fetchPresetCollection(
    fresh: boolean = false,
    id: string | null = null,
  ): Promise<GlobalItem> {
    if (!this.data || fresh) {
      let presetsItem = (
        await this.context.query({
          item_ids: id ? [id] : undefined,
          references: [null],
          data_types: [this.presetDataType],
        })
      ).find((item) => true);
      if (!presetsItem) {
        presetsItem = await this.createPresetCollection({ presets: [] });
      }
      this.data = presetsItem;
    }
    return this.data;
  }

  /**
   * Create global item containing annotation presets.
   * @param value Annotation preset
   */
  private async createPresetCollection(
    value: AnnotPresetObject,
  ): Promise<GlobalItem> {
    return await this.context.createValue(
      value,
      `Global annotation presets`,
      undefined,
      undefined,
      undefined,
      this.presetDataType,
    );
  }

  /**
   * Create annotation collection.
   * @param name Name of the collection
   * @param description Description of the collection
   */
  async createAnnotCollection(name: string, description: string | undefined): Promise<void> {
    await this.context.createValue(
      { presets: []},
      name,
      description,
      undefined,
      undefined,
      this.presetDataType,
    );
  }

  async listAnnotationPresets(): Promise<GlobalItemBase[]> {
    return await this.context.shallowQuery({
      references: [null],
      data_types: [this.presetDataType]
    })
  }

  /**
   * Get annotation presets.
   * @param fresh Force fresh fetch
   * @param id Item id to look for, otherwise fetch first item
   */
  async getAnnotPresets(
    fresh: boolean = false,
    id: string | null = null,
  ): Promise<AnnotPresetGetResult> {
    const presetItem = await this.fetchPresetCollection(fresh, id);
    return {
      presets: (JSON.parse(presetItem.value as string) as AnnotPresetObject)
        .presets,
      lastModifiedAt: presetItem.modified_at,
      id: presetItem.id,
    };
  }

  /**
   * Helper function to merge annotation presets during parallel updates.
   */
  private mergePresets(
    primaryArr: AnnotPreset[],
    secondaryArr: AnnotPreset[],
    localVersion: number,
  ): AnnotPreset[] {
    const newArr = [...primaryArr];
    // item from secondary array is pushed only if item with the same id is not present in primary array, and createdAt date is bigger than localVersion date, meaning item is new
    secondaryArr.forEach((secItem) =>
      newArr.some((primItem) => primItem.id === secItem.id) ||
      !secItem.createdAt ||
      secItem.createdAt <= localVersion
        ? null
        : newArr.push(secItem),
    );
    return newArr;
  }

  /**
   * Update annotation presets.
   * @param value New presets
   * @param localVersion Local version of presets (modified_at attribute of global item)
   * @param failOnParallelUpdate Force update fail if local version is outdated
   * @param id Item id to look for, otherwise fetch first item
   */
  async updateAnnotPresets(
    value: AnnotPreset[],
    localVersion: number,
    failOnParallelUpdate: boolean = false,
    id: string | null = null,
  ): Promise<AnnotPresetUpdateResult> {
    // fetch fresh presets
    const remotePresetsItem = await this.fetchPresetCollection(true, id);
    const remotePresets = (
      JSON.parse(remotePresetsItem.value as string) as AnnotPresetObject
    ).presets;

    let localPresets = value;
    let successfulUpdate = true;

    if (remotePresetsItem.modified_at !== localVersion) {
      if (failOnParallelUpdate) {
        return {
          presets: remotePresets,
          successfulUpdate: false,
          lastModifiedAt: remotePresetsItem.modified_at,
        };
      }
      localPresets = this.mergePresets(
        remotePresets,
        localPresets,
        localVersion,
      );
      successfulUpdate = false;
    }

    try {
      const updatedItem = await this.context.update(remotePresetsItem.id, {
        ...remotePresetsItem,
        value: JSON.stringify({ presets: localPresets }),
      });
      const updatedPresets = (
        JSON.parse(updatedItem.value) as AnnotPresetObject
      ).presets;
      return {
        presets: updatedPresets,
        successfulUpdate: successfulUpdate,
        lastModifiedAt: updatedItem.modified_at,
      };
    } catch (e) {
      if ((e as HTTPError).statusCode === 409) {
        const retryAttempt = await this.updateAnnotPresets(
          localPresets,
          remotePresetsItem.modified_at,
          undefined,
          id,
        );
        return { ...retryAttempt, successfulUpdate: successfulUpdate };
      }
      throw e;
    }
  }

  /**
   * Delete annotation presets.
   * @param id Item id to look for, otherwise fetch first item
   */
  async deleteAnnotPresets(id: string | null = null): Promise<void> {
    const presetsItem = await this.fetchPresetCollection(true, id);
    await this.context.delete(presetsItem.id);
    this.data = null;
  }
}
