/** @jest-environment setup-polly-jest/jest-environment-node */
import {polly} from "../polly";
import {parseJwtToken, ScopeToken, sleep} from "../../src";
import {getEnv} from "../env";
import {Root} from "../../src/v3/root/root";
import {getToken, setupIntercept} from "../setup";

describe('scopes api', () => {
    const pollyCtx = polly();
    beforeEach(() => setupIntercept(pollyCtx));

    it('fetch default scope', async () => {

        const api = new Root({
            workbenchApiUrl: getEnv('TEST_WB_URL')
        });
        await api.from(getToken());

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
