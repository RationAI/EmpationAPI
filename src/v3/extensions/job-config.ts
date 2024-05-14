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

  // used only in tests
  use(configDataType: string): void {
    this.configDataType = configDataType;
  }

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

  async getJobConfig(appId: string): Promise<object | false> {
    const item = await this.fetchJobConfigItem(appId);
    if (item) {
      return JSON.parse(item.value);
    }
    return false;
  }

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

  async deleteJobConfig(appId: string): Promise<boolean> {
    const existingConfig = await this.fetchJobConfigItem(appId);
    if (!existingConfig) {
      return false;
    }
    await this.context.delete(existingConfig.id);
    return true;
  }
}
