/** @jest-environment setup-polly-jest/jest-environment-node */
import { CaseSearchParams } from '../../src/v3/extensions/types/case-search-params';
import { SlideMetadata } from '../../src/v3/extensions/types/slide-metadata';
import { AnnotPreset } from '../../src/v3/extensions/types/annot-preset';
import { polly } from '../polly';
import { setupIntercept } from '../setup';
import { getV3TypeChecker } from './checker';
import { getRationAI, getRoot, getScope } from './setup';
import { sleep } from '../../src';

describe('extensions tests', () => {
  const pollyCtx = polly();
  beforeEach(() => setupIntercept(pollyCtx));

  it('fetch case hierarchy', async () => {
    const root = await getRoot();

    root.cases.caseExplorer.use('\\w+.\\w*-?[0-9]{4}_([0-9]*)([0-9]{2}).*', [
      'year',
      'id_part_1',
      'id_part_2',
    ]);
    const hierarchy = await root.cases.caseExplorer.hierarchy();

    const { CaseHierarchy } = getV3TypeChecker();
    CaseHierarchy.check(hierarchy);
  });

  it('search one case', async () => {
    const root = await getRoot();

    root.cases.caseExplorer.use('\\w+.\\w*-?[0-9]{4}_([0-9]*)([0-9]{2}).*', [
      'year',
      'id_part_1',
      'id_part_2',
    ]);

    const searchParams: CaseSearchParams[] = [
      {
        key: 'year',
        value: '2024',
      },
      {
        key: 'id_part_1',
        value: '156',
      },
      {
        key: 'id_part_2',
        value: '84',
      },
    ];
    const searchResult = await root.cases.caseExplorer.search(searchParams);

    const { Case } = getV3TypeChecker();
    searchResult.forEach((resultItem) => Case.check(resultItem));
  });
  it('search for invalid year, expect no case in result', async () => {
    const root = await getRoot();

    root.cases.caseExplorer.use('\\w+.\\w*-?[0-9]{4}_([0-9]*)([0-9]{2}).*', [
      'year',
      'id_part_1',
      'id_part_2',
    ]);

    const searchParams: CaseSearchParams[] = [
      {
        key: 'year',
        value: '1969',
      },
    ];
    const searchResult = await root.cases.caseExplorer.search(searchParams);

    const { Case } = getV3TypeChecker();
    searchResult.forEach((resultItem) => Case.check(resultItem));
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

    const slideId = '8c5608f3-a824-485c-b791-2a640405d87b';

    const newMetadata: SlideMetadata = {
      visualization: {
        paramsTemplate: 'params',
        background: {
          dataRef: 0,
          template: 'default',
        },
        data: [
          '8c5608f3-a824-485c-b791-2a640405d87b',
          'eabd1f58-357a-48ed-880b-833217e59915',
        ],
        visualizations: [
          {
            name: 'Test visualization',
            visTemplate: 'visualization',
            shaders: [
              {
                shaderTemplate: 'heatmap',
                id: 'heatmap_shader',
                name: 'heatmap_shader',
                dataRefs: [1],
              },
            ],
          },
        ],
      },
    };

    const slideMetadata =
      await rationAI.globalStorage.wsiMetadata.updateSlideMetadata(
        slideId,
        newMetadata,
      );

    console.log(slideMetadata);

    const slideVis =
      await rationAI.globalStorage.wsiMetadata.getVisualizations(slideId);

    console.log(slideVis);
  });

  it('annotation presets', async () => {
    const rationai = await getRationAI();
    rationai.globalStorage.annotPresets.use('annot_presets_test');

    // clear global items that might have been left behind from previous tests
    const items = await rationai.globalStorage.query({
      data_types: ['annot_presets_test'],
    });
    await Promise.all(
      items.map(async (item) => await rationai.globalStorage.delete(item.id)),
    );

    const newPresets: AnnotPreset[] = [
      {
        id: '4bc771a4-0aa6-4e60-adf8-f5386398a2b3',
        color: '#003fff',
        factoryID: 'polygon',
        presetID: 'Ignore*',
        meta: {
          category: {
            name: 'Category',
            value: 'Ignore*',
          },
          k1700645671744: {
            name: 'cancer',
            value: 'ano',
          },
          k1700645680488: {
            name: 'no cancer',
            value: 'neco',
          },
        },
      },
      {
        id: 'b2a1576c-45a5-4551-9bc4-cb50ddad8ff2',
        color: '#7f00ff',
        factoryID: 'rect',
        presetID: 'Ignore*',
        meta: {
          category: {
            name: 'Category',
            value: 'Ignore*',
          },
        },
      },
    ];

    const currentPresets =
      await rationai.globalStorage.annotPresets.getAnnotPresets();
    expect(currentPresets.presets).toEqual([]);

    const updatedPresets =
      await rationai.globalStorage.annotPresets.updateAnnotPresets(
        newPresets,
        currentPresets.lastModifiedAt,
      );

    expect(updatedPresets.presets).toEqual(newPresets);
    expect(updatedPresets.successfulUpdate).toEqual(true);

    await rationai.globalStorage.annotPresets.deleteAnnotPresets();

    const currentPresets2 =
      await rationai.globalStorage.annotPresets.getAnnotPresets();
    expect(currentPresets2.presets).toEqual([]);

    await rationai.globalStorage.annotPresets.deleteAnnotPresets();
  });

  it('annotation presets parallel update', async () => {
    const rationai = await getRationAI();
    rationai.globalStorage.annotPresets.use('annot_presets_test2');

    // clear global items that might have been left behind from previous tests
    const items = await rationai.globalStorage.query({
      data_types: ['annot_presets_test2'],
    });
    await Promise.all(
      items.map(async (item) => await rationai.globalStorage.delete(item.id)),
    );

    // fetch presets
    const emptyPresets =
      await rationai.globalStorage.annotPresets.getAnnotPresets();
    expect(emptyPresets.presets).toEqual([]);

    await sleep(2000);
    console.log('base preset');

    //UPDATE 1
    const basePreset: AnnotPreset[] = [
      {
        id: '4wc771a4-0aa6-4e60-adf8-f5386398a2b3',
        color: '#003fff',
        factoryID: 'polygon',
        presetID: 'Ignore*',
        meta: {
          category: {
            name: 'Category',
            value: 'Ignore*',
          },
        },
        createdAt: emptyPresets.lastModifiedAt + 5,
      },
    ];
    const currentPresets =
      await rationai.globalStorage.annotPresets.updateAnnotPresets(
        basePreset,
        emptyPresets.lastModifiedAt,
      );
    expect(currentPresets.presets).toEqual(basePreset);
    expect(currentPresets.successfulUpdate).toEqual(true);

    await sleep(2000);
    console.log('1st update starting');

    //PARALLEL UPDATE 1
    const creationDate1 = currentPresets.lastModifiedAt + 10;
    const newPresets1: AnnotPreset[] = [
      ...basePreset,
      {
        id: '4bc771a4-0aa6-4e60-adf8-f5386398a2b3',
        color: '#003fff',
        factoryID: 'polygon',
        presetID: 'Ignore*',
        meta: {
          category: {
            name: 'Category',
            value: 'Ignore*',
          },
          k1700645671744: {
            name: 'cancer',
            value: 'ano',
          },
          k1700645680488: {
            name: 'no cancer',
            value: 'neco',
          },
        },
        createdAt: creationDate1,
      },
    ];
    const updatedPresets1 =
      await rationai.globalStorage.annotPresets.updateAnnotPresets(
        newPresets1,
        currentPresets.lastModifiedAt,
      );
    expect(updatedPresets1.presets).toEqual([...newPresets1]);
    expect(updatedPresets1.successfulUpdate).toEqual(true);

    await sleep(2000);
    console.log('2nd update starting');

    //PARALLEL UPDATE 2
    const creationDate2 = currentPresets.lastModifiedAt + 15;
    const newPresets2 = [
      ...basePreset,
      {
        id: 'b2a1576c-45a5-4551-9bc4-cb50ddad8ff2',
        color: '#7f00ff',
        factoryID: 'rect',
        presetID: 'Ignore*',
        meta: {
          category: {
            name: 'Category',
            value: 'Ignore*',
          },
        },
        createdAt: creationDate2,
      },
    ];
    const updatedPresets2 =
      await rationai.globalStorage.annotPresets.updateAnnotPresets(
        newPresets2,
        currentPresets.lastModifiedAt,
      );
    expect(updatedPresets2.presets).toEqual([
      ...updatedPresets1.presets,
      newPresets2[1],
    ]);
    expect(updatedPresets2.successfulUpdate).toEqual(false);

    await sleep(2000);
    console.log('3rd update starting');

    //PARALLEL UPDATE 3 - contains one old item, thats been meanwhile deleted, also modifying old item (color change)
    const creationDate3 = currentPresets.lastModifiedAt + 100;
    const newPresets3 = [
      {
        id: '4wc771a4-0aa6-4e60-adf8-f5386398a2b3',
        color: '#000000',
        factoryID: 'polygon',
        presetID: 'Ignore*',
        meta: {
          category: {
            name: 'Category',
            value: 'Ignore*',
          },
        },
        createdAt: emptyPresets.lastModifiedAt + 5,
      },
      {
        id: 'b3a1576c-45a5-4551-9bc4-cb50ddad8ff2',
        color: '#7f00ff',
        factoryID: 'rect',
        presetID: 'Ignore*',
        meta: {
          category: {
            name: 'Category',
            value: 'Ignore*',
          },
        },
        createdAt: currentPresets.lastModifiedAt - 100,
      },
      {
        id: 'b4a1576c-45a5-4551-9bc4-cb50ddad8ff2',
        color: '#7f00ff',
        factoryID: 'rect',
        presetID: 'Ignore*',
        meta: {
          category: {
            name: 'Category',
            value: 'Ignore*',
          },
        },
        createdAt: creationDate3,
      },
    ];
    const updatedPresets3 =
      await rationai.globalStorage.annotPresets.updateAnnotPresets(
        newPresets3,
        currentPresets.lastModifiedAt,
      );
    console.log(updatedPresets3.presets);
    expect(updatedPresets3.presets).toEqual([
      ...updatedPresets2.presets,
      newPresets3[2],
    ]);
    expect(updatedPresets3.successfulUpdate).toEqual(false);

    await rationai.globalStorage.annotPresets.deleteAnnotPresets();

    const currentPresets2 =
      await rationai.globalStorage.annotPresets.getAnnotPresets();
    expect(currentPresets2.presets).toEqual([]);

    await rationai.globalStorage.annotPresets.deleteAnnotPresets();
  });

  it('app job config', async () => {
    const root = await getRoot();

    const items1 = await root.rationai.globalStorage.query({
      data_types: ['app_job_config_test'],
    });
    await Promise.all(
      items1.map(
        async (item) => await root.rationai.globalStorage.delete(item.id),
      ),
    );

    const appId = 'b6a43f9a-83d6-45f2-b141-bd287053f8ff';
    const config = {
      appId: appId,
      modes: {
        preproccesing: {
          inputs: {
            analyzed_scan: {
              _layer_loc: 'background',
              lossless: false,
              protocol: '`{"type":"leav3","slide":"${data}"}`',
            },
          },
          outputs: {
            prediction_mask: {
              name: 'Cancer prediction',
              type: 'heatmap',
              visible: 1,
              protocol: '`{"type":"leav3","pixelmap":"${data}"}`',
              params: {
                opacity: 0.5,
              },
            },
          },
        },
      },
    };

    const jobConfigApi = root.rationai.globalStorage.jobConfig;

    jobConfigApi.use('app_job_config_test');
    const createdConfigItem = await jobConfigApi.createJobConfig(appId, config);
    const getConfig = await jobConfigApi.getJobConfig(appId);

    expect(getConfig).toEqual(config);

    await jobConfigApi.deleteJobConfig(appId);

    const getConfig2 = await jobConfigApi.getJobConfig(appId);

    expect(getConfig2).toEqual(false);
  });
});
