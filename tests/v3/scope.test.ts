/** @jest-environment setup-polly-jest/jest-environment-node */
import {polly} from "../polly";

import {setupIntercept} from "./setup";
import { getScope } from "./setup";

describe('scopes api', () => {
    const pollyCtx = polly();
    beforeEach(() => setupIntercept(pollyCtx))

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

        await scope.storage.erase()

        appStorage = await scope.storage.getRaw()
        expect(appStorage).toEqual({
            content: {}
        })
    })

    it('primitives', async () => {
        const scope = await getScope()
        const primitive = await scope.rawQuery('/primitives', {
            method: "POST",
            body: { 
                name: "Some name",
                creator_id: scope.scopeContext.scope_id,
                creator_type: 'scope',
                type: 'integer',
                value: 42,
            }   
        })

        const result = await scope.rawQuery(`/primitives/${primitive.id}`)

        expect(result).toEqual({
            id: primitive.id,
            name: 'Some name',
            type: 'integer',
            value: 42,
            is_locked: false,
            creator_id: scope.scopeContext.scope_id,
            description: null,
            creator_type: 'scope',
            reference_id: null,
            reference_type: null
          })
    })
});
