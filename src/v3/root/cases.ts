import { RootAPI, RootContext } from '../../root';
import CaseExplorer from '../extensions/case-explorer';
import WsiExplorer from '../extensions/wsi-explorer';
import Root from './root';
import { Case } from './types/case';
import { CaseList } from './types/case-list';
import { SlideList } from './types/slide-list';
import JobExplorer from "../extensions/job-explorer";

export default class Cases extends RootContext {
  protected context: RootAPI;
  protected data: CaseList | null = null;

  caseExplorer: CaseExplorer;
  wsiExplorer: WsiExplorer;
  jobExplorer: JobExplorer;

  constructor(context: Root) {
    super();
    this.context = context;

    this.caseExplorer = new CaseExplorer(this, context.integration);
    this.wsiExplorer = new WsiExplorer(this, context.integration);
    this.jobExplorer = new JobExplorer(context);
  }

  private async getCaseList(deleted: boolean): Promise<CaseList> {
    const data = (await this.context.rawQuery('/cases')) as CaseList;
    const validEntries = {
      items: data.items.filter((item) => item.deleted === deleted),
    } as CaseList;
    validEntries.item_count = validEntries.items.length;
    return validEntries;
  }

  async list(): Promise<CaseList> {
    if (!this.data) {
      this.data = await this.getCaseList(false);
    }
    return this.data;
  }

  async listDeleted(): Promise<CaseList> {
    return await this.getCaseList(true);
  }

  async get(caseId: string): Promise<Case> {
    return await this.context.rawQuery(`/cases/${caseId}`);
  }

  async slides(caseId: string): Promise<SlideList> {
    return await this.context.rawQuery(`/cases/${caseId}/slides`);
  }
}
