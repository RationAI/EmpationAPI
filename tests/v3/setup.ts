import {V3} from "../../src";
import { getEnv } from "../env";
import {defaultTestUser, getToken} from "../setup";
import {Case} from "../../src/v3/root/types/case";

let rootApis: Map<string, V3.Root> = new Map<string, V3.Root>();

// TODO: tests must also write setInterceptedUser() in order to work - must be specified twice, reduce!
export async function getRoot(userName=defaultTestUser): Promise<V3.Root> {
    let rootApi = rootApis[userName];
    if (!rootApi) {
        rootApis[userName] = rootApi = new V3.Root({
            workbenchApiUrl: getEnv('TEST_WB_URL')!
        })
        await rootApi.from(await getToken(userName));
    }
    return rootApi;
}

export async function getScope(userName=defaultTestUser, caseIndex=0): Promise<V3.Scopes> {
    const root = await getRoot(userName);
    const cases = await root.cases.list();

    await root.scopes.use(cases.items[caseIndex].id);
    return root.scopes;
}

export async function getScopeCase(userName=defaultTestUser, caseIndex=0): Promise<Case> {
    const root = await getRoot(userName);
    return (await root.cases.list()).items[caseIndex];
}
