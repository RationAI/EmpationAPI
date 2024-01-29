/**
 * Usage: no auth set up. It is enough to return object with missing access_token prop.
 */

import {AuthOptions, AuthResult} from "../auth";

export default async function noAuth(options: AuthOptions): Promise<AuthResult> {
    return {} as AuthResult;
}
