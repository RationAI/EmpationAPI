/** @jest-environment setup-polly-jest/jest-environment-node */
import {polly} from "../polly";
import {parseJwtToken, ScopeToken, sleep} from "../../src";
import {getEnv} from "../env";
import Root from "../../src/v3/root/root";
import {getToken, setupIntercept} from "./setup";
import { getScope } from "./setup";


describe('scopes api', () => {
    const pollyCtx = polly();
    beforeEach(() => setupIntercept(pollyCtx));

    it('fetch default scope', async () => {

        const scope = await getScope()

        const currentScope = await scope.rawQuery("");
        console.log(currentScope);
    });

    it('fetch user storage for scope', async () => {
        const scope = await getScope()

        await scope.storage.erase()

        await scope.storage.set("num", 42)
        await scope.storage.set("num", 43)
        await scope.storage.set("str", "dsadad")
        await scope.storage.set("arr", [2,3,3,3])
        await scope.storage.set("obj", {a: "dsadasd", b: [1,1,1]})


        let appStorage = await scope.storage.getRaw()
        const obj = await scope.storage.get("obj")

        expect(appStorage).toEqual({
            content: { num: '43', str: '"dsadad"', arr: '[2,3,3,3]', obj: '{"a":"dsadasd","b":[1,1,1]}' }
          })
        expect(obj).toEqual({a: "dsadasd", b: [1,1,1]})

        // await scope.storage.erase()

        // appStorage = await scope.storage.getRaw()
        // expect(appStorage).toEqual({
        //    content: {}
        //})
    })
});
