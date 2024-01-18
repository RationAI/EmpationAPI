/* tslint:disable */
/* eslint-disable */
import { AppUiConfigSrcPolicies } from './app-ui-config-src-policies';
export interface AppUiCspConfiguration {

  /**
   * CSP font-src setting for App-UIs.
   */
  font_src?: (AppUiConfigSrcPolicies | null);

  /**
   * CSP script-src setting for App-UIs.
   */
  script_src?: (AppUiConfigSrcPolicies | null);

  /**
   * CSP style-src setting for App-UIs.
   */
  style_src?: (AppUiConfigSrcPolicies | null);
}
