/** @jest-environment setup-polly-jest/jest-environment-node */
import auth, {AuthResult} from "../auth";
import { polly } from "../polly";
import {V3Api} from "../../src/v3/base/base";
import {parseJwtToken} from "../../src/utils";
import {getEnv} from "../setup";

describe('base api', () => {
    let authData: AuthResult = null;
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
    });

    it('setUser', async () => {
        const api = new V3Api({
            workbenchApiUrl: getEnv('TEST_WB_URL')
        });

        const token = parseJwtToken(authData.access_token);

        await api.useUser(token.sub);
        console.log(api.cases);
    });

});
