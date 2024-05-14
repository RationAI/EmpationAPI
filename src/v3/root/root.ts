import { EmpationAPIOptions, RawAPI, RawOptions } from '../../base';
import { RootAPI } from '../../root';
import Scope from '../scope/scope';
import Apps from './apps';
import Cases from './cases';
import Examinations from './examinations';
import Slides from './slides';
import RationAI from '../rationai/rationai';
import { WorkbenchServiceApiV3CustomModelsExaminationsExamination } from './types/workbench-service-api-v-3-custom-models-examinations-examination';

export default class Root extends RootAPI {
  static apiPath = '/v3';

  //interface
  protected raw: RawAPI;
  protected defaultScopeKey: string = '';
  rationai: RationAI;
  version: string;
  rootURI: string;

  scopes: Map<string, Scope>;

  //custom
  apps: Apps;
  cases: Cases;
  examinations: Examinations;
  slides: Slides;

  constructor(options: EmpationAPIOptions) {
    super(options);
    this.version = 'v3';
    this.rootURI = this.options.apiUrl + Root.apiPath;
    this.raw = new RawAPI(this.rootURI);
    this.rationai = new RationAI(this);

    this.apps = new Apps(this);
    this.cases = new Cases(this);
    this.examinations = new Examinations(this);
    this.slides = new Slides(this);

    this.scopes = new Map<string, Scope>();
  }

  get defaultScope(): Scope | undefined {
    return this.scopes.get(this.defaultScopeKey);
  }

  private async newScopeFrom(
    examination: WorkbenchServiceApiV3CustomModelsExaminationsExamination,
  ) {
    const scope = new Scope(this);
    await scope.from(examination);
    this.scopes.set(examination.id, scope);
    if (this.defaultScopeKey === '') this.defaultScopeKey = examination.id;
    return scope;
  }

  private async newScopeUse(caseId: string, appId?: string) {
    const scope = new Scope(this);
    await scope.use(caseId, appId);
    this.scopes.set(scope.activeExaminationId, scope);
    if (this.defaultScopeKey === '')
      this.defaultScopeKey = scope.activeExaminationId;
    return scope;
  }

  async getScopeFrom(
    examination: WorkbenchServiceApiV3CustomModelsExaminationsExamination,
  ) {
    return (
      this.scopes.get(examination.id) || (await this.newScopeFrom(examination))
    );
  }

  async getScopeUse(caseId: string, appId?: string) {
    const matchingScopes = [...this.scopes.values()].filter(
      (scp) =>
        scp.activeCaseId === caseId &&
        (appId ? scp.activeAppId === appId : true),
    );
    return matchingScopes.length > 0
      ? matchingScopes[0]
      : await this.newScopeUse(caseId, appId);
  }

  async rawQuery(endpoint: string, options: RawOptions = {}): Promise<any> {
    await super.rawQuery(endpoint, options);
    options = options || {};
    options.headers = options.headers || {};
    options.headers['User-Id'] = this.userId;
    if (this.accessToken) {
      options.headers['Authorization'] =
        options.headers['Authorization'] || `Bearer ${this.rawToken}`;
    }
    return this.raw.http(endpoint, options);
  }
}
