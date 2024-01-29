/** @jest-environment setup-polly-jest/jest-environment-node */
import {polly} from "../polly";

import {getEnv} from "../env";
import {getToken, setupIntercept} from "./setup";
import { V3 } from "../../src";

describe('base api', () => {
    const pollyCtx = polly();
    beforeEach(() => setupIntercept(pollyCtx));

    it('setUser', async () => {

        const api = new V3.Root({
            workbenchApiUrl: getEnv('TEST_WB_URL') || ""
        });

        const token = getToken();
        await api.from(token);
    });
});
