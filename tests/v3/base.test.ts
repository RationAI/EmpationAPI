/** @jest-environment setup-polly-jest/jest-environment-node */
import {polly} from "../polly";

import {Root} from "../../src/v3/root/root";
import {getEnv} from "../env";
import {getToken, setupIntercept} from "./setup";

describe('base api', () => {
    const pollyCtx = polly();
    beforeEach(() => setupIntercept(pollyCtx));

    it('setUser', async () => {

        const api = new Root({
            workbenchApiUrl: getEnv('TEST_WB_URL') || ""
        });

        const token = getToken();
        await api.from(token);
    });
});
