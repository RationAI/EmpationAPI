import { RootContext } from '../../root';
import Root from './root';
import { WorkbenchServiceApiV3CustomModelsExaminationsExamination } from './types/workbench-service-api-v-3-custom-models-examinations-examination';
import { ExaminationQuery } from './types/examination-query';
import { ExaminationList } from './types/examination-list';
import { ScopeTokenAndScopeId } from './types/scope-token-and-scope-id';

export default class Examinations extends RootContext {
  protected context: Root;
  protected data: ExaminationList | null = null;

  constructor(context: Root) {
    super();
    this.context = context;
  }

  async create(
    caseId: string,
    appId: string,
  ): Promise<WorkbenchServiceApiV3CustomModelsExaminationsExamination> {
    const self = this.context;
    self.requires('caseId', caseId);
    return self.rawQuery('/examinations', {
      method: 'PUT',
      body: {
        case_id: caseId,
        app_id: appId,
      },
    });
  }

  async query(
    query: ExaminationQuery,
    skip?: number | undefined,
    limit?: number | undefined,
  ): Promise<ExaminationList> {
    const self = this.context;
    return self.rawQuery(`/examinations/query`, {
      method: 'PUT',
      body: query,
      query: { skip, limit },
    });
  }

  async get(
    examinationId: string,
  ): Promise<WorkbenchServiceApiV3CustomModelsExaminationsExamination> {
    const self = this.context;
    self.requires('examinationId', examinationId);
    return self.rawQuery(`/examinations/${examinationId}`);
  }

  async scope(examinationId: string): Promise<ScopeTokenAndScopeId> {
    const self = this.context;
    self.requires('examinationId', examinationId);
    return self.rawQuery(`/examinations/${examinationId}/scope`, {
      method: 'PUT',
    });
  }
}
