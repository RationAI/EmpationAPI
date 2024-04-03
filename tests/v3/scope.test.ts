/** @jest-environment setup-polly-jest/jest-environment-node */
import { DataCreatorType } from "../../src/v3/scope/types/data-creator-type";
import {polly} from "../polly";
import {defaultComparisonUser, defaultTestUser, setInterceptedUser, setupIntercept} from "../setup";
import {getRoot, getScope, getScopeCase} from "./setup";
import {V3} from "../../src";
import {Case} from "../../src/v3/root/types/case";


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

    it('primitives shared across users', async () => {
        setInterceptedUser(defaultTestUser);
        const scope = await getScope(defaultTestUser);

        const primitive = {
            name: "Some name",
            creator_id: scope.scopeContext?.scope_id,
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

        await scope.rawQuery(`/primitives/${response.id}`, {
            method: "DELETE",
        })

        expect(otherUserCanSee).toEqual({
            ...primitive,
            id: response.id,
            is_locked: false,
            description: null,
            reference_id: null,
            reference_type: null
        })
    })

    it('test jobs', async () => {
        setInterceptedUser(defaultTestUser);
        const root = await getRoot(defaultTestUser);
        const cases = await root.cases.list();

       try {
           const apps = await root.rawQuery(`/apps/query`, {
               method: "PUT",
               body: {
                   tissues: [
                       "PROSTATE"
                   ]
               }
           })
           console.log(apps);

           root.scopes.addHandler('init', e => {
               console.log(e.examination);
           });

           const app = apps.items.filter(x => x.portal_app_id === "8463ae9b-97dc-4b0f-a5ba-8453fac7c23e")[0];
           await root.scopes.use(cases.items[0].id, app.app_id);
           const scope =  root.scopes;



           const data = await scope.rawQuery(`/jobs`, {
               method: "GET"
           })
           let jobId;
           console.log(data);
           if (!data.items.length) {
               const job = {
                   "creator_id": scope.scopeContext?.scope_id || "",
                   "creator_type": "SCOPE",
                   "mode": "STANDALONE",
                   "containerized": true
               }
               const data = await scope.rawQuery(`/jobs`, {
                   method: "POST",
                   body: job
               })
               console.log("Job created", data);
               jobId = data.id;
           } else {
               jobId = data.items[0].id;
           }

           //add inputs
           // const data = await scope.rawQuery(`/jobs/${jobId}/inputs/${input-key-name}`, {
           //         method: "PUT",
           //         body: job
           //     })

           //run job
           const run = await scope.rawQuery(`/jobs/${jobId}/run`, {
               method: "PUT",
           });
           console.log(run);

           //finalize job: can be executed only within the container if containerized
           // REPORTS cannot be finalized - only when examination is closed
           // const fin = await scope.rawQuery(`/jobs/${jobId}/finalize`, {
           //     method: "PUT",
           // });
           // console.log(fin);

       } catch (e) {
           console.log("TEST EXIT: ", e);
           throw e;
       }
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

        console.log("ORIGIN", scope.scopeContext?.scope_id, response);
        setInterceptedUser(defaultComparisonUser);
        const otherScope = await getScope(defaultComparisonUser);
        const otherUserCanSee = await otherScope.rawQuery('/annotations/query', {
            method: "QUERY",
            body: {
                annotations: [response.items[0].id]
            }
        });
        console.log("OTHER", otherScope.scopeContext?.scope_id, otherUserCanSee);

        expect(otherUserCanSee.items[0]).toMatchObject(annotation.items[0]);

        otherUserCanSee.items[0].npp_created = 69;
        const response2 = await scope.annotations.update(otherUserCanSee.items[0].id, otherUserCanSee);
        annotation.items[0].npp_created = 69;
        expect(response2).toMatchObject(annotation.items[0]);
    })
});
