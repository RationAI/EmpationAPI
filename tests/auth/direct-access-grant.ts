/**
 * Usage: provide direct access grant via username and password
 * This is considered insecure and used only for testing purposes
 * !IMPORTANT! ensure the given client has been enabled direct access
 */

import {AuthOptions, AuthResult} from "../auth";

export default async function oidcDirectAccessGrant(options: AuthOptions): Promise<AuthResult> {
    console.log("Using OIDC Direct access grant! Note that this method must be explicitly enabled for the given client!");

    const url = options.url; //must be the token url
    if (!url) {
        throw `Invalid AUTH URL: not configured: '${url}'`;
    }
    const formData = new FormData();
    formData.append('client_id', options.client);
    if (options.secret) formData.append('client_secret', options.secret);

    formData.append('username', options.user);
    formData.append('password', options.userSecret);
    formData.append('grant_type', "password");

    const response = await fetch(url, {
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': '*/*',
            'Bypass-Interceptor': 'true'
        },
        body: new URLSearchParams({
            client_id: options.client,
            username: options.user,
            password: options.userSecret,
            grant_type: "password"
        })
    });

    if (response.status === 403 || response.status === 401) {
        const data = await response.text();
        throw `Could not authenticate via direct access grant! Does the client allow this method? Response: '${data}'`;
    }

    if (response.ok) {
        const parsed = await response.json() as AuthResult;
        if (parsed.hasOwnProperty('access_token')) {
            return parsed;
        }
        throw `Authentication response is missing 'access_token' data!. Response: '${JSON.stringify(parsed)}'`;
    }
    const data = await response.text();
    throw `Could not authenticate via direct access grant! Unknown error. Response: '${data}'`;
}
