/** @jest-environment setup-polly-jest/jest-environment-node */
import auth, {AuthResult} from "../auth";
import {polly} from "../polly";
import {parseJwtToken} from "../../src/utils";
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

        const token = parseJwtToken(authData.access_token);
        await api.from(token);
    });

    it('fetch default scope', async () => {
        const cases = await api.cases.list();
        await api.scopes.use(cases.items[0].id);
        console.log(api.scopes.scopeToken)
    });

});
