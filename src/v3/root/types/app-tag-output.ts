/* tslint:disable */
/* eslint-disable */
import { TextTranslation } from './text-translation';
export interface AppTagOutput {
  /**
   * Tag name. See definitions for valid tag names.
   */
  name: string;
  tag_translations: Array<TextTranslation>;
}
