import { RootAPI, RootContext } from '../../root';
import CaseExplorer from '../extensions/case-explorer';
import WsiExplorer from '../extensions/wsi-explorer';
import Root from './root';
import { Case } from './types/case';
import { CaseList } from './types/case-list';
import { SlideList } from './types/slide-list';

export default class Cases extends RootContext {
  protected context: RootAPI;
  protected data: CaseList | null = null;

  caseExplorer: CaseExplorer;
  wsiExplorer: WsiExplorer;

  constructor(context: Root) {
    super();
    this.context = context;

    this.caseExplorer = new CaseExplorer(this);
    this.wsiExplorer = new WsiExplorer(this);
  }

  async list(): Promise<CaseList> {
    if (!this.data) {
      this.data = (await this.context.rawQuery('/cases')) as CaseList;
    }
    return this.data;
  }

  async get(caseId: string): Promise<Case> {
    return await this.context.rawQuery(`/cases/${caseId}`);
  }

  async slides(caseId: string): Promise<SlideList> {
    return await this.context.rawQuery(`/cases/${caseId}/slides`);
  }
}
