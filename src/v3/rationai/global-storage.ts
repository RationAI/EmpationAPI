import RationAI from './rationai';
import { GlobalItem } from './types/global-item';
import { GlobalStorageQuery } from './types/global-storage-query';
import { GlobalItemList } from './types/global-item-list';
import { PostGlobalItems } from './types/post-global-items';
import { GlobalItems } from './types/global-items';
import { GlobalItemReferenceType } from './types/global-item-reference-type';
import { PostGlobalItem } from './types/post-global-item';
import { GlobalDataCreatorType } from './types/global-data-creator-type';
import { PutGlobalItem } from './types/put-global-item';
import {GlobalItemBase} from "./types/global-item-base";
import {GlobalItemShallowList} from "./types/global-item-shallow-list";
import WsiMetadata from '../extensions/wsi-metadata';
import VisualizationTemplates from '../extensions/visualization-templates';
import AnnotPresets from '../extensions/annot-presets';
import JobConfig from '../extensions/job-config';

export default class GlobalStorage {
  protected context: RationAI;
  protected data: GlobalItem | null = null;

  wsiMetadata: WsiMetadata;
  visTemplates: VisualizationTemplates;
  annotPresets: AnnotPresets;
  jobConfig: JobConfig;

  constructor(context: RationAI) {
    this.context = context;
    this.wsiMetadata = new WsiMetadata(this);
    this.visTemplates = new VisualizationTemplates(this);
    this.annotPresets = new AnnotPresets(this);
    this.jobConfig = new JobConfig(this);
  }

  private valueCreator(
    value: any,
    name: string,
    description?: string,
    reference_id?: string,
    reference_type?: GlobalItemReferenceType,
    data_type?: string,
    id?: string,
  ): PostGlobalItem {
    value = JSON.stringify(value);

    return {
      name: name,
      description: description,
      creator_id: this.context.userId,
      creator_type: GlobalDataCreatorType.USER,
      reference_id: reference_id,
      reference_type: reference_type,
      type: 'string',
      value: value,
      data_type: data_type,
      id: id,
    } satisfies PostGlobalItem;
  }

  async get(itemId: string): Promise<GlobalItem> {
    const globalItem: GlobalItem = await this.context.rawQuery(
      `/global-storage/${itemId}`,
    );
    return globalItem;
  }

  async getValue(itemId: string): Promise<any> {
    const item = await this.get(itemId);
    if (item.type === 'string') {
      try {
        return JSON.parse(item.value);
      } catch {
        return item.value;
      }
    }
    return item.value;
  }

  async query(query: GlobalStorageQuery): Promise<GlobalItem[]> {
    const data: GlobalItemList = await this.context.rawQuery(
      `/global-storage/query`,
      {
        method: 'PUT',
        body: query,
      },
    );

    return data.items;
  }

  async shallowQuery(query: GlobalStorageQuery): Promise<GlobalItemBase[]> {
    const data: GlobalItemShallowList = await this.context.rawQuery(
        `/global-storage/query`,
        {
          method: 'PUT',
          body: query,
          query: {
            shallow: true
          }
        },
    );
    return data.items;
  }

  async create(items: PostGlobalItems): Promise<GlobalItems> {
    const createdItems: GlobalItems = await this.context.rawQuery(
      `/global-storage`,
      {
        method: 'POST',
        body: items,
      },
    );

    return createdItems;
  }

  async createValue(
    value: any,
    name: string,
    description?: string,
    reference_id?: string,
    reference_type?: GlobalItemReferenceType,
    data_type?: string,
  ): Promise<GlobalItem> {
    const newItem = this.valueCreator(
      value,
      name,
      description,
      reference_id,
      reference_type,
      data_type,
    );

    return (await this.create(newItem)) as GlobalItem;
  }

  async createValues(
    values: Array<{
      value: any;
      name: string;
      description?: string;
      reference_id?: string;
      reference_type?: GlobalItemReferenceType;
      data_type?: string;
    }>,
  ): Promise<GlobalItems> {
    const newItems = {
      items: values.map((item) =>
        this.valueCreator(
          item.value,
          item.name,
          item.description,
          item.reference_id,
          item.reference_type,
          item.data_type,
        ),
      ),
    }

    return (await this.create(newItems)) as GlobalItems;
  }

  async update(itemId: string, item: PutGlobalItem): Promise<GlobalItem> {
    const updatedItem: GlobalItem = await this.context.rawQuery(
      `/global-storage/${itemId}`,
      {
        method: 'PUT',
        body: item,
      },
    );
    return updatedItem;
  }

  async updateValue(itemId: string, value: any): Promise<GlobalItem> {
    const item: GlobalItem = await this.context.rawQuery(
      `/global-storage/${itemId}`,
    );
    item.value = JSON.stringify(value);
    const updatedItem: GlobalItem = await this.context.rawQuery(
      `/global-storage/${itemId}`,
      {
        method: 'PUT',
        body: item,
      },
    );
    return updatedItem;
  }

  async delete(itemId: string): Promise<void> {
    await this.context.rawQuery(`/global-storage/${itemId}`, {
      method: 'DELETE',
    });
  }
}
