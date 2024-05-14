import GlobalStorage from '../rationai/global-storage';
import { GlobalItem } from '../rationai/types/global-item';
import { GlobalItemReferenceType } from '../rationai/types/global-item-reference-type';

export default class JobConfig {
  protected context: GlobalStorage;
  protected data: object | null = null;

  protected configDataType: string = 'app_job_config';

  constructor(context: GlobalStorage) {
    this.context = context;
  }

  /**
   * Configure JobConfig class with data type. Data type is used to filter global items.
   * @param configDataType Data type of global items used to store job configs.
   */
  use(configDataType: string): void {
    this.configDataType = configDataType;
  }

  /**
   * Fetch global item containing job config of an App.
   * @param appId ID of App
   */
  private async fetchJobConfigItem(
    appId: string,
  ): Promise<GlobalItem | undefined> {
    return (
      await this.context.query({
        references: [appId],
        data_types: [this.configDataType],
      })
    ).find(Boolean);
  }

  /**
   * Get job config of an App.
   * @param appId ID of App
   */
  async getJobConfig(appId: string): Promise<object | false> {
    const item = await this.fetchJobConfigItem(appId);
    if (item) {
      return JSON.parse(item.value);
    }
    return false;
  }

  /**
   * Get job config of an App.
   * @param appId ID of App
   * @param value Job config of an App
   */
  async createJobConfig(appId: string, value: object): Promise<object | false> {
    const existingConfig = await this.fetchJobConfigItem(appId);
    if (existingConfig) {
      return false;
    }
    return await this.context.createValue(
      value,
      `Job config of App`,
      undefined,
      appId,
      GlobalItemReferenceType.JOB,
      this.configDataType,
    );
  }

  /**
   * Delete job config of an App.
   * @param appId ID of App
   */
  async deleteJobConfig(appId: string): Promise<boolean> {
    const existingConfig = await this.fetchJobConfigItem(appId);
    if (!existingConfig) {
      return false;
    }
    await this.context.delete(existingConfig.id);
    return true;
  }
}
