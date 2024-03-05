/** @jest-environment setup-polly-jest/jest-environment-node */
import { HTTPError } from "../../src";
import { SlideMetadataT } from "../../src/v3/extensions/types/slide-metadata";
import { DataCreatorType } from "../../src/v3/scope/types/data-creator-type";
import { PostPrimitive } from "../../src/v3/scope/types/post-primitive";
import { PrimitiveQuery } from "../../src/v3/scope/types/primitive-query";
import { PrimitiveReferenceType } from "../../src/v3/scope/types/primitive-reference-type";
import { PrimitiveType } from "../../src/v3/scope/types/primitive-type";
import {polly} from "../polly";
import {defaultComparisonUser, defaultTestUser, setInterceptedUser, setupIntercept} from "../setup";
import {getRoot, getScope, getScopeCase} from "./setup";
import {V3} from "../../src";
import {Case} from "../../src/v3/root/types/case";
import {DataCreatorType} from "../../src/v3/scope/types/data-creator-type";


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
            const createdPrimitive = await scope.primitives.create( i < 3 ? 2 : "some string", "test primitive", "desc", "12345678", PrimitiveReferenceType.Wsi);
            createdIds.push(createdPrimitive.id!)
        }

        const query: PrimitiveQuery = {
            creators: [scope.scopeContext.scope_id],
            references: ["12345678"],
            types: [PrimitiveType.Integer]
        }

        const data = await scope.primitives.query(query);

        createdIds.forEach(async (id) => await scope.primitives.delete(id));

        expect(data.length).toEqual(3)
        data.forEach((p) => expect(p.value).toEqual(2))

        // switch user
        setInterceptedUser(defaultComparisonUser);
        const scope2 = await getScope(defaultTestUser);

        const query2: PrimitiveQuery = {
            creators: [scope2.scopeContext.scope_id],
            references: ["12345678"],
            types: [PrimitiveType.Integer]
        }

        const data2 = await scope2.primitives.query(query2);

        expect(data2.length).toEqual(0)
    })

    it('query primitives unique references', async () => {
        setInterceptedUser(defaultTestUser);
        const scope = await getScope(defaultTestUser);

        const createdPrimitive = await scope.primitives.create(42, "primitive referencing wsi", "desc", "8c5608f3-a824-485c-b791-2a640405d87b", PrimitiveReferenceType.Wsi)

        const query: PrimitiveQuery = {
            creators: [scope.scopeContext.scope_id],
            types: [PrimitiveType.Integer]
        }

        const data = await scope.primitives.queryUniqueReferences(query);

        await scope.primitives.delete(createdPrimitive.id!);

        expect(data.wsi?.length).toEqual(1)
        expect(data.wsi?.[0]).toEqual("8c5608f3-a824-485c-b791-2a640405d87b")
    })

    it('delete primitive', async () => {
        setInterceptedUser(defaultTestUser);
        const scope = await getScope(defaultTestUser);

        const createdPrimitive = await scope.primitives.create(42, "number")
        try {
            await scope.primitives.get(createdPrimitive.id!)
        } catch (e) {
            expect(e.name).toEqual("NotFoundError")
        }
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

    it('annotations shared across users', async () => {
        setInterceptedUser(defaultTestUser);
        const root: V3.Root = await getRoot(defaultTestUser);
        const cases = await root.cases.list();
        let caseIndex = cases.items.findIndex(c => c.slides_count > 0);
        if (caseIndex < 0) caseIndex = 0;
        const scope: V3.Scopes = await getScope(defaultTestUser, caseIndex);

        const defaultCase: Case = await getScopeCase(defaultTestUser, caseIndex);
        const caseSlides = await root.cases.slides(defaultCase.id);

        console.log("Runs with case ID ", caseIndex);

        if (caseSlides.item_count < 1) {
            console.warn("Skipping test: no slides are available with the default case!");
            return;
        }
        const slide = caseSlides.items[0];

        const annotation = {
            "items": [
                {
                    "name": "Annotation Name",
                    "description": "Annotation Description",
                    // "creator_id": scope.scopeContext.scope_id,
                    // "creator_type": "scope",
                    "creator_id": scope.context.userId,
                    "creator_type": DataCreatorType.User,
                    "reference_id": slide.id,
                    "reference_type": "wsi",
                    "npp_created": 499,
                    "npp_viewing": [
                        499,
                        7984
                    ],
                    "centroid": [
                        100,
                        100
                    ],
                    "type": "point",
                    "coordinates": [
                        100,
                        200
                    ]
                }
            ]
        };

        const response = await scope.annotations.upload(annotation);

        console.log("ORIGIN", scope.scopeContext.scope_id, response);
        setInterceptedUser(defaultComparisonUser);
        const otherScope = await getScope(defaultComparisonUser);
        const otherUserCanSee = await otherScope.rawQuery('/annotations/query', {
            method: "QUERY",
            body: {
                annotations: [response.items[0].id]
            }
        });
        console.log("OTHER", otherScope.scopeContext.scope_id, otherUserCanSee);

        expect(otherUserCanSee.items[0]).toMatchObject(annotation.items[0]);

        otherUserCanSee.items[0].npp_created = 69;
        const response2 = await scope.annotations.update(otherUserCanSee.items[0].id, otherUserCanSee);
        annotation.items[0].npp_created = 69;
        expect(response2).toMatchObject(annotation.items[0]);
    })
});
