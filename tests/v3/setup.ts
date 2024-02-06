import auth, {AuthResult} from "../auth";
import {JwtToken, V3, parseJwtToken} from "../../src";
import { getEnv } from "../env";

let rootApi: V3.Root;

export async function getRoot(): Promise<V3.Root> {
    if (!rootApi) {
        rootApi = new V3.Root({
            workbenchApiUrl: getEnv('TEST_WB_URL')!
        })

        await rootApi.from(getToken());
    }

    return rootApi;
}

export async function getScope(): Promise<V3.Scopes> {
    const root = await getRoot();

    const cases = await root.cases.list();

    await root.scopes.use(cases.items[0].id);

    return root.scopes;
}

let token: string,
    expires: number,
    authData: AuthResult;

async function doAuth() {
    authData = await auth();
    console.log("AUTH ATTEMPT");
    if (authData.access_token) {
        token = authData.access_token;
        expires = parseJwtToken(token).exp * 1000;
    }
}

export function getToken(): string {
    return token;
}

export async function setupIntercept(polly, tryAuth=true) {

    if (authData) {
        if (!authData.access_token) {
            console.info("Authentication disabled.");
            return;
        }

        const interceptor = async (req, res) => {
            if (expires - Date.now() < 5000) {
                await doAuth();
            }

            //override missing auth
            req.headers['Authorization'] = req.headers['Authorization'] || `Bearer ${authData.access_token}`;
        };
        polly.polly.server.any().on('request', interceptor);
    } else if (tryAuth) {
        await doAuth();
        await setupIntercept(polly, false);
    } else {
        throw "Could not initiate authentication!";
    }
}
