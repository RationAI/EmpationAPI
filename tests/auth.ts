import { getEnv, getUserName, getUserPassword } from './env';

export interface AuthOptions {
  authModule: string;
  client: string;
  secret?: string;
  user: string;
  userSecret: string;
  url: string;
}

// If access_token = false, then auth is disabled
export interface AuthResult {
  access_token: string | false;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  session_state: string;
  scope: string;
}

export type AuthData = {
  client_id: string;
  username: string;
  password: string;
  grant_type: string;
  client_secret?: string;
};

/**
 * @param userName user name from ENV to perform auth as
 * @return polly instance namespace: usage
 *   const polly = await auth();
 *   ... do some setup ...
 *   polly.polly.server.all().on('request', interceptor);
 *   ... and polly.auth contains the AuthResult item
 */
export default async function auth(userName: string) {
  const defaults: AuthOptions = {
    authModule: getEnv('AUTH_MODULE', 'direct-access-grant')!,
    client: getEnv('AUTH_CLIENT', 'WBC_CLIENT')!,
    secret: getEnv('AUTH_CLIENT_SECRET', undefined),
    user: getUserName(userName),
    userSecret: getUserPassword(userName),
    url: getEnv('AUTH_URL')!,
  };

  if (
    !defaults.authModule ||
    defaults.authModule === 'none' ||
    defaults.authModule === 'false'
  )
    return false;

  const handler = await import(`./auth/${defaults.authModule}`);
  if (!handler) {
    throw `Invalid authentication: module ${defaults.authModule} does not exist!`;
  }

  //required to be default export
  return await handler.default(defaults);
}
