/* tslint:disable */
/* eslint-disable */
import { AppUiCspConfiguration } from './app-ui-csp-configuration';
import { AppUiIframeConfiguration } from './app-ui-iframe-configuration';
import { AppUiTested } from './app-ui-tested';
export interface AppUiConfiguration {
  /**
   * CSP settings for App-UIs.
   */
  csp?: AppUiCspConfiguration | null;

  /**
   * Iframe settings for App-UIs.
   */
  iframe?: AppUiIframeConfiguration | null;

  /**
   * Tested combination of browser and OS for an App UI.
   */
  tested?: Array<AppUiTested> | null;
}
