import {getEnv} from "./setup";

export interface AuthOptions {
    authModule: string;
    client: string;
    secret: string;
    user: string;
    userSecret: string;
    url: string;
}


export interface AuthResult {
    access_token: string;
    expires_in: number;
    refresh_expires_in: number;
    refresh_token: string;
    session_state: string;
    scope: string;
}

/**
 * @return polly instance namespace: usage
 *   const polly = await auth();
 *   ... do some setup ...
 *   polly.polly.server.all().on('request', interceptor);
 *   ... and polly.auth contains the AuthResult item
 */
export default async function auth() {
    const defaults: AuthOptions = {
        authModule: getEnv('AUTH_MODULE', 'direct-access-grant'),
        client: getEnv('AUTH_CLIENT', 'WBC_CLIENT'),
        secret: getEnv('AUTH_CLIENT_SECRET', undefined),
        user: getEnv('AUTH_USER'),
        userSecret: getEnv('AUTH_USER_SECRET'),
        url: getEnv('AUTH_URL')
    }

    if (!defaults.authModule || defaults.authModule === "none" || defaults.authModule === "false") return false;

    const handler = await import(`./auth/${defaults.authModule}`);
    if (!handler) {
        throw `Invalid authntication: module ${defaults.authModule} does not exist!`;
    }

    //required to be default export
    return  await handler.default(defaults);
}
