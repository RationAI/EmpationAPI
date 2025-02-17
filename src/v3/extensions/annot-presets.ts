import { HTTPError } from '../../../src/base';
import GlobalStorage from '../rationai/global-storage';
import { GlobalItem } from '../rationai/types/global-item';
import { AnnotPreset, AnnotPresetObject } from './types/annot-preset';
import { GlobalItemBase } from '../rationai/types/global-item-base';
import { GlobalStringItem } from '../rationai/types/global-string-item';
import { withoutDates } from './utils';

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

type ParsedAnnotPresetItem = Omit<GlobalStringItem, 'value'> & {
  value: { presets: AnnotPreset[] };
};

export default class AnnotPresets {
  protected context: GlobalStorage;
  protected data: { [id: string]: ParsedAnnotPresetItem } = {};

  protected presetCollectionDataType: string = 'annot_collection';
  protected presetDataType: string = 'annot_preset';

  constructor(context: GlobalStorage) {
    this.context = context;
  }

  /**
   * Configure AnnotPresets class with data type. Data type is used to filter global items.
   * @param presetCollectionDataType Data type of global items used to store annotation presets.
   */
  use(presetCollectionDataType: string): void {
    this.presetCollectionDataType = presetCollectionDataType;
  }

  /**
   * Fetch item containing annotation presets.
   * @param fresh Force fresh fetch of global item, otherwise cached version might be used
   * @param id Item id to look for, otherwise fetch first item
   */
  private async fetchPresetCollection(
    fresh: boolean = false,
    id: string | null = null,
  ): Promise<ParsedAnnotPresetItem> {
    if (!this.data[id ?? '0'] || fresh) {
      let presetsItem = (
        await this.context.query({
          item_ids: id ? [id] : undefined,
          references: [null],
          data_types: [this.presetCollectionDataType],
        })
      )?.[0];
      let presetsItemParsed: ParsedAnnotPresetItem;
      if (!presetsItem && !id) {
        presetsItem = await this.createPresetCollection();
        presetsItemParsed = { ...presetsItem, value: { presets: [] } };
      } else {
        if (!presetsItem) {
          presetsItem = (
            await this.context.query({
              references: [null],
              data_types: [this.presetCollectionDataType],
            })
          )?.[0];
          if (!presetsItem) {
            presetsItem = await this.createPresetCollection();
          }
        }
        const presetsIds = JSON.parse(presetsItem.value) as string[];
        const presets =
          presetsIds.length > 0
            ? await this.context.query({
                item_ids: presetsIds,
                references: [null],
                data_types: [this.presetDataType],
              })
            : [];
        const valuesWithIds = presets.map((v) => ({
          ...JSON.parse(v.value),
          id: v.id,
          presetID: v.name,
        }));
        presetsItemParsed = {
          ...presetsItem,
          value: { presets: valuesWithIds },
        };
      }
      this.data[!id ? '0' : presetsItem.id] = presetsItemParsed;
    }
    return this.data[id ?? '0'];
  }

  /**
   * Create global item containing annotation presets.
   * @param value Annotation preset
   */
  private async createPresetCollection(): Promise<GlobalItem> {
    return await this.context.createValue(
      [],
      `Global annotation presets`,
      undefined,
      undefined,
      undefined,
      this.presetCollectionDataType,
    );
  }

  /**
   * Create annotation collection.
   * @param name Name of the collection
   * @param description Description of the collection
   */
  async createAnnotCollection(
    name: string,
    description: string | undefined,
  ): Promise<void> {
    await this.context.createValue(
      [],
      name,
      description,
      undefined,
      undefined,
      this.presetCollectionDataType,
    );
  }

  async listAnnotationPresets(): Promise<GlobalItemBase[]> {
    return await this.context.shallowQuery({
      references: [null],
      data_types: [this.presetCollectionDataType],
    });
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
      presets: presetItem.value.presets,
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
    const remotePresets = remotePresetsItem.value.presets;

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
      const newPresetsValues: AnnotPreset[] = [];
      const existingPresets =
        remotePresets.length > 0
          ? await this.context.query({
              item_ids: remotePresets.map((v) => v.id),
              references: [null],
              data_types: [this.presetDataType],
            })
          : [];

      const updatedPresets = await localPresets.reduce(
        async (accPromise, preset) => {
          const acc = await accPromise;
          const existingPreset = existingPresets.find(
            (v) => v.id === preset.id,
          );
          if (existingPreset) {
            if (existingPreset.value === JSON.stringify(preset)) {
              acc.push(existingPreset);
              return acc;
            }
            const updatedPreset = await this.context.update(preset.id, {
              ...withoutDates(existingPreset),
              value: JSON.stringify(preset),
            });
            acc.push(updatedPreset);
          } else {
            newPresetsValues.push(preset);
          }
          return acc;
        },
        Promise.resolve([] as GlobalStringItem[]),
      );

      const newPresets = await this.context.createValues(
        newPresetsValues.map((preset) => ({
          value: preset,
          name: preset.presetID,
          description: undefined,
          reference_id: undefined,
          reference_type: undefined,
          data_type: this.presetDataType,
        })),
      );
      if ('items' in newPresets) {
        updatedPresets.push(...newPresets['items']);
      } else {
        updatedPresets.push(newPresets as GlobalStringItem);
      }

      const updatedItem = await this.context.update(remotePresetsItem.id, {
        ...withoutDates(remotePresetsItem),
        value: JSON.stringify(updatedPresets.map((v) => v.id)),
      });
      return {
        presets: localPresets,
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
    delete this.data[id ?? '0'];
  }
}
