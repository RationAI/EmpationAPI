/** @jest-environment setup-polly-jest/jest-environment-node */
import { CaseSearchParams } from "../../src/v3/extensions/types/case-search-params";
import { SlideMetadataT } from "../../src/v3/extensions/types/slide-metadata";
import {polly} from "../polly";
import {defaultComparisonUser, defaultTestUser, setInterceptedUser, setupIntercept} from "../setup";
import { getV3TypeChecker } from "./checker";
import {getRoot, getScope} from "./setup";


describe('extensions tests', () => {
    const pollyCtx = polly();
    beforeEach(() => setupIntercept(pollyCtx))

    it('fetch case hierarchy', async () => {

        const root = await getRoot()

        root.cases.caseExplorer.use("\\w+.\\w*-?[0-9]{4}_([0-9]*)([0-9]{2}).*");
        const hierarchy = await root.cases.caseExplorer.hierarchy(["year", "id_part_1", "id_part_2"])

        const {CaseHierarchy} = getV3TypeChecker()
        CaseHierarchy.check(hierarchy)
    });

    it('search one case', async () => {

      const root = await getRoot()

      root.cases.caseExplorer.use("\\w+.\\w*-?[0-9]{4}_([0-9]*)([0-9]{2}).*");

      const searchParams: CaseSearchParams[] = [
        {
          key: "year",
          value: "2024",
        },
        {
          key: "id_part_1",
          value: "156",
        },
        {
          key: "id_part_2",
          value: "84",
        },
      ]
      const searchResult = await root.cases.caseExplorer.search(searchParams)

      const {Case} = getV3TypeChecker()
      searchResult.forEach((resultItem) => Case.check(resultItem))
  });
  it('search for invalid year, expect no case in result', async () => {

    const root = await getRoot()

    root.cases.caseExplorer.use("\\w+.\\w*-?[0-9]{4}_([0-9]*)([0-9]{2}).*");

    const searchParams: CaseSearchParams[] = [
      {
        key: "year",
        value: "1969",
      },
    ]
    const searchResult = await root.cases.caseExplorer.search(searchParams)

    const {Case} = getV3TypeChecker()
    searchResult.forEach((resultItem) => Case.check(resultItem))
    expect(searchResult).toEqual([]);
  });

  it('create/update metadata of slide', async () => {
    setInterceptedUser(defaultTestUser);
    const scope = await getScope(defaultTestUser);

    const slideMetadata: SlideMetadataT = {
      visualization: {
        paramsTemplate: "params",
        data: ['8c5608f3-a824-485c-b791-2a640405d87b', 'eabd1f58-357a-48ed-880b-833217e59915'],
        background: {
          template: "default",
          dataRef: 0,
        },
        visualizations: [
          {
            visTemplate: "visualization",
            name: "Test visualization",
            shaders: [
              {
                id: "shader_1",
                name: "Heatmap shader",
                shaderTemplate: "heatmap",
                dataRefs: [1],
              }
            ]
          }
        ]
      }
    }

    const createdSlideMetadata = await scope.primitives.slideMetadata.updateSlideMeta('8c5608f3-a824-485c-b791-2a640405d87b', slideMetadata, scope.scopeContext.scope_id);

    console.log(createdSlideMetadata);

    const slideVis = await scope.primitives.slideMetadata.getVisualizations('8c5608f3-a824-485c-b791-2a640405d87b', scope.scopeContext.scope_id);
    console.log(slideVis);
  })
});
