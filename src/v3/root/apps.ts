import { RootAPI, RootContext } from '../../root';
import Root from './root';
import { AppList } from './types/app-list';
import { AppQuery } from './types/app-query';
import { AppOutput } from './types/app-output';

export default class Apps extends RootContext {
  protected context: RootAPI;
  protected data: AppList | null = null;
  private _defaultApp: AppOutput | null = null;

  constructor(context: Root) {
    super();
    this.context = context;
  }

  async list(): Promise<AppList> {
    return (this.data = (await this.context.rawQuery('/apps/query', {
      method: 'PUT',
      body: {
        apps: null,
        tissues: null,
        stains: null,
        job_modes: null,
      },
    })) as AppList);
  }

  async query(query: AppQuery): Promise<AppList> {
    return (this.data = (await this.context.rawQuery('/apps/query', {
      method: 'PUT',
      body: query,
    })) as AppList);
  }

  async default(): Promise<AppOutput> {
    if (!this.data) await this.list();
    for (let app of this.data!.items) {
      if (app.name_short === 'MAP3' && app.vendor_name === 'rationai') {
        this._defaultApp = app;
        break;
      }
    }
    if (!this._defaultApp)
      throw 'Default APP not present in the infrastructure! Was it imported?';
    return this._defaultApp;
  }
}
