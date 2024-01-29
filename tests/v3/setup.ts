import auth, {AuthResult} from "../auth";
import {JwtToken, parseJwtToken} from "../../src";
import { Root } from "../../src/v3/root/root";
import { getEnv } from "../env";
import { Scopes } from "../../src/v3/scope/scopes";

let rootApi: Root;

export async function getRoot(): Promise<Root> {
    if (!rootApi) {
        rootApi = new Root({
            workbenchApiUrl: getEnv('TEST_WB_URL')!
        })

        await rootApi.from(getToken());
    }

    return rootApi;
}

export async function getScope(): Promise<Scopes> {
    const root = await getRoot();

    const cases = await root.cases.list();

    await root.scopes.use(cases.items[0].id);

    return root.scopes;
}

let token = undefined,
    expires: number = null,
    authData: AuthResult = null;

async function doAuth() {
    authData = await auth();
    console.log("AUTH ATTEMPT");
    if (authData.access_token) {
        token = parseJwtToken(authData.access_token) as JwtToken;
        expires = token.exp * 1000;
    }
}

export function getToken(): JwtToken {
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
