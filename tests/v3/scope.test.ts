/** @jest-environment setup-polly-jest/jest-environment-node */
import { HTTPError } from "../../src";
import { DataCreatorType } from "../../src/v3/scope/types/data-creator-type";
import { PostPrimitive } from "../../src/v3/scope/types/post-primitive";
import { PrimitiveQuery } from "../../src/v3/scope/types/primitive-query";
import { PrimitiveType } from "../../src/v3/scope/types/primitive-type";
import {polly} from "../polly";
import {defaultComparisonUser, defaultTestUser, setInterceptedUser, setupIntercept} from "../setup";
import {getScope} from "./setup";


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

    it('test different scopes actually differ', async () => {
        setInterceptedUser(defaultTestUser);
        const scope = await getScope(defaultTestUser);
        setInterceptedUser(defaultComparisonUser);
        const otherScope = await getScope(defaultComparisonUser);

        expect(typeof scope.context.userId).toBe("string");
        expect(typeof otherScope.context.userId).toBe("string");

        expect(scope.context.userId).not.toEqual(otherScope.context.userId);
    })

    // PRIMITIVES
    it('numerical primitive, create/get/delete', async () => {
        setInterceptedUser(defaultTestUser);
        const scope = await getScope(defaultTestUser);

        const value = 42

        const createdPrimitive = await scope.primitives.create(value, "test primitive", "desc")
        
        const received = await scope.primitives.get(createdPrimitive.id!)

        await scope.primitives.delete(createdPrimitive.id!)

        expect(received).toEqual(value)
    })

    it('stringified object primitive, create/get/delete', async () => {
        setInterceptedUser(defaultTestUser);
        const scope = await getScope(defaultTestUser);

        const value = {
            key: "dsasd",
            value: 321321321,
            somethin: true,
            nested: {
                key: "dsada",
                value: 21,
            }
        }

        const createdPrimitive = await scope.primitives.create(value, "test primitive", "desc")
        
        const received = await scope.primitives.get(createdPrimitive.id!)

        await scope.primitives.delete(createdPrimitive.id!)

        expect(received).toEqual(value)
    })

    it('raw create and get', async () => {
        setInterceptedUser(defaultTestUser);
        const scope = await getScope(defaultTestUser);

        const primitive: PostPrimitive = {
            name: "test primitive",
            creator_id: scope.scopeContext.scope_id,
            creator_type: DataCreatorType.Scope,
            type: 'bool',
            value: false,
        };

        const createdPrimitive = await scope.primitives.createRaw(primitive)
        
        const received = await scope.primitives.getRaw(createdPrimitive.id!)

        await scope.primitives.delete(createdPrimitive.id!)

        expect(received).toEqual({
            ...createdPrimitive,
            id: createdPrimitive.id,
            is_locked: false,
            description: null,
            reference_id: null,
            reference_type: null
        })
    })

    it('query primitives', async () => {
        setInterceptedUser(defaultTestUser);
        const scope = await getScope(defaultTestUser);

        const createdIds: string[] = []

        for (let i = 0; i < 6; i = i + 1) {
            const createdPrimitive = await scope.primitives.create( i < 3 ? 2 : "some string", "test primitive", "desc");
            createdIds.push(createdPrimitive.id!)
        }

        const query: PrimitiveQuery = {
            creators: [scope.scopeContext.scope_id],
            references: [null],
            types: [PrimitiveType.Integer, PrimitiveType.String, PrimitiveType.Bool]
        }

        const data = await scope.primitives.query(query);

        createdIds.forEach(async (id) => await scope.primitives.delete(id));
    })

    it('primitives shared across users', async () => {
        setInterceptedUser(defaultTestUser);
        const scope = await getScope(defaultTestUser);

        const primitive = {
            name: "Some name",
            creator_id: scope.scopeContext.scope_id,
            creator_type: 'scope',
            type: 'integer',
            value: 42,
        };

        const response = await scope.rawQuery('/primitives', {
            method: "POST",
            body: primitive
        });

        setInterceptedUser(defaultComparisonUser);
        const otherScope = await getScope(defaultComparisonUser);
        const otherUserCanSee = await otherScope.rawQuery(`/primitives/${response.id}`)

        await scope.primitives.delete(response.id)

        expect(otherUserCanSee).toEqual({
            ...primitive,
            id: response.id,
            is_locked: false,
            description: null,
            reference_id: null,
            reference_type: null
        })
    })
});
