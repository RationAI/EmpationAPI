import { ScopeAPI } from '../../scope';
import { RawAPI, RawOptions } from '../../base';
import { ScopeTokenAndScopeId } from '../root/types/scope-token-and-scope-id';
import { WorkbenchServiceApiV3CustomModelsExaminationsExamination } from '../root/types/workbench-service-api-v-3-custom-models-examinations-examination';
import Root from '../root/root';
import Storage from './storage';
import {
  getJwtTokenExpiresTimeout,
  parseJwtToken,
  ScopeToken,
} from '../../utils';
import Annotations from './annotations';
import Collections from './collections';
import Jobs from './jobs';
import Pixelmaps from "./pixelmaps";

export default class Scope extends ScopeAPI {
  static apiPath = '/v3/scopes';

  // Interface
  raw: RawAPI;
  context: Root;
  storage: Storage;
  annotations: Annotations;
  collections: Collections;
  jobs: Jobs;
  pixelmaps: Pixelmaps;

  // Additional
  scopeContext: ScopeTokenAndScopeId | null = null;
  private _defaultExaminationId: string = '';
  private _tokenRefetchInterval: NodeJS.Timeout | null = null;

  activeExaminationId: string = '';
  activeCaseId: string = '';
  activeAppId: string = '';

  constructor(context: Root) {
    super();
    this.context = context;
    this.raw = new RawAPI(this.context.options.apiUrl + Scope.apiPath);
    this.storage = new Storage(this);
    this.annotations = new Annotations(this);
    this.collections = new Collections(this);
    this.jobs = new Jobs(this);
    this.pixelmaps = new Pixelmaps(this);
  }

  async use(
    caseId: string,
    appId: string | undefined = undefined,
  ): Promise<void> {
    //todo consider caching

    this.requires('root::userId', this.context.userId);

    const findExamination = async (
      appId: string,
    ): Promise<WorkbenchServiceApiV3CustomModelsExaminationsExamination> => {
      let examinations = await this.context.examinations.query({
        apps: [appId],
        creators: [this.context.userId],
      });
      if (examinations.item_count > 0) {
        let examination = examinations.items.find((ex) => ex.state === 'OPEN');
        if (examination) return examination;
      }
      return await this.context.examinations.create(caseId, appId);
    };

    let examination;
    if (appId) {
      examination = await findExamination(appId);
    } else if (this._defaultExaminationId) {
      examination = await this.context.examinations.get(
        this._defaultExaminationId,
      );
    }

    if (!examination) {
      let app = await this.context.apps.default();
      examination = await findExamination(app.app_id);
      this._defaultExaminationId = examination.id;
    }

    await this.from(examination);
  }

  get scopeToken(): string | undefined {
    return this.scopeContext?.access_token;
  }

  async from(
    examination: WorkbenchServiceApiV3CustomModelsExaminationsExamination,
  ): Promise<void> {
    this.reset();
    this.scopeContext = await this.context.examinations.scope(examination.id);
    this.activeCaseId = examination.case_id;
    this.activeAppId = examination.app_id;
    this.activeExaminationId = examination.id;
    const token = parseJwtToken(this.scopeContext.access_token) as ScopeToken;
    const timeout = getJwtTokenExpiresTimeout(token);
    this._tokenRefetchInterval = setInterval(async () => {
      this.scopeContext = await this.context.examinations.scope(examination.id);
    }, timeout);
    this.raiseEvent('init');
  }

  reset(): void {
    this.activeExaminationId = '';
    this.scopeContext = null;
    if (this._tokenRefetchInterval) {
      clearInterval(this._tokenRefetchInterval);
      this._tokenRefetchInterval = null;
      //todo clear all cached data
      this.raiseEvent('reset');
    }
  }

  async rawQuery(endpoint: string, options?: RawOptions): Promise<any> {
    this.requires('this.scopeContext', this.scopeContext);
    options = options || {};
    options.headers = options.headers || {};
    options.headers['Authorization'] =
      `Bearer ${this.scopeContext?.access_token}`;
    if (endpoint && !endpoint.startsWith('/')) {
      endpoint = `/${endpoint}`;
    }

    try {
      return await this.raw.http(
        `/${this.scopeContext?.scope_id}${endpoint}`,
        options,
      );
    } catch (e) {
      if (e.statusCode === 401) {
        this.scopeContext = await this.context.examinations.scope(
          this.activeExaminationId,
        );
        return await this.raw.http(
          `/${this.scopeContext.scope_id}${endpoint}`,
          options,
        );
      }

      throw e;
    }
  }
}
