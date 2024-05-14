/* tslint:disable */
/* eslint-disable */
import { AppInput } from './app-input';
import { ProprocessingTriggerCreatorType } from './proprocessing-trigger-creator-type';
export interface ExtendedPreprocessingTrigger {
  /**
   * Corresponding app
   */
  app: AppInput;

  /**
   * Creator ID
   */
  creator_id: string;

  /**
   * Creator Type
   */
  creator_type: ProprocessingTriggerCreatorType;

  /**
   * Preprocessing Trigger ID
   */
  id: string;

  /**
   * Portal App ID
   */
  portal_app_id: string;

  /**
   * Stain Type
   */
  stain: string;

  /**
   * Tissue Type
   */
  tissue: string;
}
