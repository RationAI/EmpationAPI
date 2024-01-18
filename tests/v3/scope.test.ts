/** @jest-environment setup-polly-jest/jest-environment-node */
import auth, {AuthResult} from "../auth";
import {polly} from "../polly";
import {BaseAPI, V3Api} from "../../src";
import {parseJwtToken} from "../../src/utils";
import {getEnv} from "../setup";

describe('scopes api', () => {
    let authData: AuthResult = null,
        api: BaseAPI = null;
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

        api = new V3Api({
            workbenchApiUrl: getEnv('TEST_WB_URL')
        });
        const token = parseJwtToken(authData.access_token);
        await api.useUser(token.sub);
    });

    it('fetch default scope', async () => {
        console.log(api.cases);

        await api.scopes.use(api.cases.items[0].id);
        console.log(api.scopes);
    });

});
