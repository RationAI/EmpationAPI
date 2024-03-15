/** @jest-environment setup-polly-jest/jest-environment-node */
import { CaseSearchParams } from "../../src/v3/extensions/types/case-search-params";
import { SlideMetadata } from "../../src/v3/extensions/types/slide-metadata";
import { TemplateType } from "../../src/v3/extensions/types/template-type";
import {polly} from "../polly";
import {defaultComparisonUser, defaultTestUser, setInterceptedUser, setupIntercept} from "../setup";
import { getV3TypeChecker } from "./checker";
import {getRationAI, getRoot, getScope} from "./setup";


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
  it('slide visualizations', async () => {
    const rationAI = await getRationAI();

    // create vis templates
    /* await rationAI.globalStorage.visTemplates.createTemplate(TemplateType.Background, "default", {
      "lossless": false
    })
    await rationAI.globalStorage.visTemplates.createTemplate(TemplateType.Params, "params", {
      "locale": "en",
      "activeBackgroundIndex": 0,
      "activeVisualizationIndex": 0
    })
    await rationAI.globalStorage.visTemplates.createTemplate(TemplateType.Shader, "heatmap", { 
      "name": "Heatmap",
      "type": "heatmap", 
      "visible": 1, 
      "params": {}
    })
    await rationAI.globalStorage.visTemplates.createTemplate(TemplateType.Visualization, "visualization", {
      "name": "Layer",
      "lossless": true,
      "shaders": []
    }) */

    const slideId = "8c5608f3-a824-485c-b791-2a640405d87b"

    const newMetadata: SlideMetadata = {
      visualization: {
        paramsTemplate: "params",
        background: {
          dataRef: 0,
          template: "default",
        },
        data: ["8c5608f3-a824-485c-b791-2a640405d87b", "eabd1f58-357a-48ed-880b-833217e59915"],
        visualizations: [
          {
            name: "Test visualization",
            visTemplate: "visualization",
            shaders: [
              {
                shaderTemplate: "heatmap",
                id: "heatmap_shader",
                name: "heatmap_shader",
                dataRefs: [1],
              }
            ]
          }
        ]
      }
    }

    const slideMetadata = await rationAI.globalStorage.wsiMetadata.updateSlideMetadata(slideId, newMetadata);

    console.log(slideMetadata);

    const slideVis = await rationAI.globalStorage.wsiMetadata.getVisualizations(slideId);

    console.log(slideVis);
  })
});
