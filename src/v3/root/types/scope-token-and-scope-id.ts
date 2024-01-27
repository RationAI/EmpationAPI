/* tslint:disable */
/* eslint-disable */
export interface ScopeTokenAndScopeId {

  /**
   * AccessToken based on JSON Web Tokens. It can be created and passed around to validate requests
   */
  access_token: string;

  /**
   * The ID of the scope corresponding to the token
   */
  scope_id: string;
}
