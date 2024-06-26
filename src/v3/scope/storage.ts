import { ScopeContext } from '../../scope';
import Scope from './scope';
import { AppUiStorage } from './types/app-ui-storage';

export default class Storage extends ScopeContext {
  protected context: Scope;
  protected data: AppUiStorage | null = null;

  constructor(context: Scope) {
    super();
    this.context = context;
  }

  async getRaw(): Promise<AppUiStorage> {
    if (!this.data) {
      this.data = await this.context.rawQuery('/app-ui-storage/user');
    }
    return this.data as AppUiStorage;
  }

  async flush(): Promise<AppUiStorage | null> {
    if (!this.data) return null;

    return (await this.context.rawQuery('/app-ui-storage/user', {
      method: 'PUT',
      body: this.data,
    })) as AppUiStorage;
  }

  async get(key: string): Promise<any> {
    const data = await this.getRaw();
    if (typeof data.content[key] === 'string') {
      return JSON.parse(data.content[key] as string);
    }

    return data.content[key];
  }

  async set(key: string, value: any, flush?: boolean): Promise<void> {
    const valueRaw = JSON.stringify(value);
    const dataRaw = await this.getRaw();
    dataRaw.content[key] = valueRaw;
    this.data = dataRaw;

    if (flush) {
      this.flush();
    }
  }

  async erase(): Promise<void> {
    this.data = { content: {} };
    this.flush();
  }
}
