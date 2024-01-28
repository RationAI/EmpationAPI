/** @jest-environment setup-polly-jest/jest-environment-node */
import auth, {AuthResult} from "../auth";
import {polly} from "../polly";
import {JwtToken, parseJwtToken, ScopeToken, sleep} from "../../src/utils";
import {getEnv} from "../setup";
import {Root} from "../../src/v3/root/root";

describe('scopes api', () => {
    let authData: AuthResult = null,
        api: Root = null;
    const pollyCtx = polly();

    beforeEach(async () => {
        authData = await auth();
        if (authData) {
            const interceptor = (req, res) => {
                //override missing auth
                req.headers['Authorization'] = req.headers['Authorization'] || `Bearer ${authData.access_token}`;
            };
            pollyCtx.polly.server.any().on('request', interceptor);
        }

        api = new Root({
            workbenchApiUrl: getEnv('TEST_WB_URL')
        });

        const token = parseJwtToken(authData.access_token) as JwtToken;
        await api.from(token);
    });

    it('fetch default scope', async () => {
        const cases = await api.cases.list();
        await api.scopes.use(cases.items[0].id);
        console.log(api.scopes.scopeToken)

        const token = parseJwtToken(api.scopes.scopeToken) as ScopeToken;
        const expires = token.exp*1000 - Date.now();

        console.log("Waiting token exp", expires/1000)

        //await expire token should also not fail ... :)
        //await sleep(expires+100);

        const scope = await api.scopes.rawQuery("");
        console.log(scope);

    });

});
