/** @jest-environment setup-polly-jest/jest-environment-node */
import {polly} from "../polly";

import {getEnv} from "../env";
import {getRoot, getToken, setupIntercept} from "./setup";
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

    it('list cases', async () => {

        const api = await getRoot()

        const cases = await api.cases.list()

        expect(cases).toEqual({
            items: [
                {
                    id: '77945443-8124-4449-acb6-24ef77b331bd',
                    mds_url: 'https://mds-xopat.dyn.cloud.e-infra.cz/',
                    local_id: 'Test',
                    creator_id: 'bb2ce4c1-fdcd-4d5b-99eb-04a03e54a6e4',
                    creator_type: 'USER',
                    description: 'T',
                    created_at: 1706105775,
                    updated_at: 1706105775,
                    slides_count: 1,
                    tissues: {},
                    blocks: [],
                    stains: {},
                    preprocessing_progress: 'none',
                    examinations: [
                        {
                            case_id: '77945443-8124-4449-acb6-24ef77b331bd',
                            app_id: '4e485b74-413e-477d-8e09-2c38ae57e582',
                            creator_id: 'bb2ce4c1-fdcd-4d5b-99eb-04a03e54a6e4',
                            creator_type: 'USER',
                            id: '3105c554-903b-4288-863c-4ced776ff9fb',
                            state: 'OPEN',
                            created_at: 1706370277,
                            updated_at: 1706370277,
                            jobs: []
                        }
                    ],
                    deleted: null
                  }
            ],
            item_count: 1
          })
    });

    it('get case by ID', async () => {

        const api = await getRoot()

        const caseObj = await api.cases.get('77945443-8124-4449-acb6-24ef77b331bd')

        expect(caseObj).toEqual({
            id: '77945443-8124-4449-acb6-24ef77b331bd',
            mds_url: 'https://mds-xopat.dyn.cloud.e-infra.cz/',
            local_id: 'Test',
            creator_id: 'bb2ce4c1-fdcd-4d5b-99eb-04a03e54a6e4',
            creator_type: 'USER',
            description: 'T',
            created_at: 1706105775,
            updated_at: 1706105775,
            slides_count: 1,
            tissues: {},
            blocks: [],
            stains: {},
            preprocessing_progress: 'none',
            examinations: [
                {
                case_id: '77945443-8124-4449-acb6-24ef77b331bd',
                app_id: '4e485b74-413e-477d-8e09-2c38ae57e582',
                creator_id: 'bb2ce4c1-fdcd-4d5b-99eb-04a03e54a6e4',
                creator_type: 'USER',
                id: '3105c554-903b-4288-863c-4ced776ff9fb',
                state: 'OPEN',
                created_at: 1706370277,
                updated_at: 1706370277,
                jobs: []
                }
            ],
            deleted: null
        })
    });

    it('get case slides', async () => {

        const api = await getRoot()

        const slides = await api.cases.slides('77945443-8124-4449-acb6-24ef77b331bd')

        expect(slides).toEqual({
            items: [
                {
                    id: "8c5608f3-a824-485c-b791-2a640405d87b",
                    mds_url: "https://mds-xopat.dyn.cloud.e-infra.cz/",
                    local_id: "7747a222-fcfc-58ad-ae24-b76faaca9e86",
                    type: "slide",
                    tissue: null,
                    stain: null,
                    block: null,
                    case_id: "77945443-8124-4449-acb6-24ef77b331bd",
                    created_at: 1706106065,
                    updated_at: 1706106065,
                    deleted: null
                }
            ],
            item_count: 1
          })
    });

    it('get slide info', async () => {

        const api = await getRoot()

        const info = await api.slides.slideInfo('8c5608f3-a824-485c-b791-2a640405d87b')
        console.log(JSON.stringify(info))

        expect(info).toEqual({
            "id": "8c5608f3-a824-485c-b791-2a640405d87b",
            "channels": [
              {
                "id": 0,
                "name": "Red",
                "color": {
                  "r": 255,
                  "g": 0,
                  "b": 0,
                  "a": 0
                }
              },
              {
                "id": 1,
                "name": "Green",
                "color": {
                  "r": 0,
                  "g": 255,
                  "b": 0,
                  "a": 0
                }
              },
              {
                "id": 2,
                "name": "Blue",
                "color": {
                  "r": 0,
                  "g": 0,
                  "b": 255,
                  "a": 0
                }
              }
            ],
            "channel_depth": 8,
            "extent": {
              "x": 139343,
              "y": 54452,
              "z": 1
            },
            "num_levels": 3,
            "pixel_size_nm": {
              "x": 263.077,
              "y": 263.077,
              "z": null
            },
            "tile_extent": {
              "x": 256,
              "y": 256,
              "z": 1
            },
            "levels": [
              {
                "extent": {
                  "x": 139343,
                  "y": 54452,
                  "z": 1
                },
                "downsample_factor": 1
              },
              {
                "extent": {
                  "x": 34835,
                  "y": 13613,
                  "z": 1
                },
                "downsample_factor": 4.000043060140663
              },
              {
                "extent": {
                  "x": 8708,
                  "y": 3403,
                  "z": 1
                },
                "downsample_factor": 16.00144899370722
              }
            ],
            "format": null,
            "raw_download": false
          })
    
    });

});
