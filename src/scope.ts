import { AbstractAPI, RawAPI, RawOptions } from './base';

export abstract class ScopeContext {
  protected abstract context: ScopeAPI;
  protected abstract data: any;
}

/**
 * Scope Binds Examination and User.
 */
export abstract class ScopeAPI extends AbstractAPI {
  protected abstract raw: RawAPI;

  /**
   * Change the active Scope for the API. Note: the scope state will reset.
   * @param caseId case id - manages the active scope
   * @param appId manages the active scope through examination<user, app>
   *          if undefined, the examination is managed internally
   */
  abstract use(caseId: string, appId?: string): Promise<void>;

  /**
   * Change the active Scope for the API. Note: the scope state will reset.
   * @param examination setup context from object
   */
  abstract from(examination: object): Promise<void>;

  abstract reset(): void;

  abstract rawQuery(endpoint: string, options?: RawOptions): Promise<any>;
}
