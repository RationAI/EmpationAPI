import auth, {AuthResult} from "./auth";
import {JwtToken, parseJwtToken} from "../src";

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
