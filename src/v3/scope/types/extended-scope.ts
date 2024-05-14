/* tslint:disable */
/* eslint-disable */
import { ExaminationState } from './examination-state';
export interface ExtendedScope {
  /**
   * App ID
   */
  app_id: string;

  /**
   * Case ID
   */
  case_id: string;

  /**
   * UNIX timestamp in seconds - set by server
   */
  created_at: number;

  /**
   * EMPAIA app description
   */
  ead: {};

  /**
   * Examination ID
   */
  examination_id: string;

  /**
   * State of the scopes examination
   */
  examination_state: ExaminationState;

  /**
   * Scope ID
   */
  id: string;

  /**
   * User ID
   */
  user_id: string;
}
