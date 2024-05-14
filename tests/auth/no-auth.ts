/**
 * Usage: no auth set up. It is enough to return object with access_token=false prop.
 */

import { AuthOptions, AuthResult } from '../auth';

export default async function noAuth(
  options: AuthOptions,
): Promise<AuthResult> {
  return { access_token: false } as AuthResult;
}
