/**
 * Usage: provide direct access grant via username and password
 * This is considered insecure and used only for testing purposes
 * !IMPORTANT! ensure the given client has been enabled direct access
 */

import { AuthOptions, AuthResult } from '../auth';

export default async function oidcDirectAccessGrant(
  options: AuthOptions,
): Promise<AuthResult> {
  console.log(
    'Using OIDC Client Credentials grant! Note that this method must be explicitly enabled for the given client!',
  );

  const url = options.url; //must be the token url
  if (!url) {
    throw `Invalid AUTH URL: not configured: '${url}'`;
  }

  if (!options.secret) {
    throw `Client credentials flow must have client secret set!`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: '*/*',
      'Bypass-Interceptor': 'true',
    },
    body: new URLSearchParams({
      client_id: options.client,
      client_secret: options.secret,
      grant_type: 'client_credentials',
    }),
  });

  if (response.status === 403 || response.status === 401) {
    const data = await response.text();
    throw `Could not authenticate via direct access grant! Does the client allow this method? Response: '${data}'`;
  }

  if (response.ok) {
    const parsed = (await response.json()) as AuthResult;
    if (parsed.hasOwnProperty('access_token')) {
      console.log('Authenticated.');
      return parsed;
    }
    throw `Authentication response is missing 'access_token' data!. Response: '${JSON.stringify(parsed)}'`;
  }
  const data = await response.text();
  throw `Could not authenticate via direct access grant! Unknown error. Response: '${data}'`;
}
