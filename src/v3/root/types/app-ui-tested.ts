/* tslint:disable */
/* eslint-disable */
import { Browser } from './browser';
import { Os } from './os';
export interface AppUiTested {

  /**
   * App UI tested for browser
   */
  browser: Browser;

  /**
   * App UI tested on operating system
   */
  os: Os;

  /**
   * App UI tested for browser version
   */
  version: string;
}
