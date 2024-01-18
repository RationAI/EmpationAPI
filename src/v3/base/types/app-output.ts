/* tslint:disable */
/* eslint-disable */
import { TagListOutput } from './tag-list-output';
export interface AppOutput {

  /**
   * App ID
   */
  app_id: string;

  /**
   * App version
   */
  app_version: string;

  /**
   * App has an App UI Frontend, that can be embedded in an iframe
   */
  has_frontend: boolean;

  /**
   * App short name taken from the EAD
   */
  name_short: string;

  /**
   * Portal App ID
   */
  portal_app_id: string;

  /**
   * Indicates if app is intended for research use only
   */
  research_only: boolean;

  /**
   * App description taken from store
   */
  store_description: (string | null);

  /**
   * URL to app documentation
   */
  store_docs_url: (string | null);

  /**
   * URL to app image icon
   */
  store_icon_url: (string | null);

  /**
   * Url of the portal app preview after hover
   */
  store_preview_after_url: (string | null);

  /**
   * Url of the portal app preview before hover
   */
  store_preview_before_url: (string | null);

  /**
   * URL to app in store
   */
  store_url: (string | null);
  tags: (TagListOutput | null);

  /**
   * Name of the app vendor
   */
  vendor_name: string;
}
