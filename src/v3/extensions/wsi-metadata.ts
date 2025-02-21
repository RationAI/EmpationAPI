import GlobalStorage from '../rationai/global-storage';
import { GlobalItem } from '../rationai/types/global-item';
import { GlobalItemReferenceType } from '../rationai/types/global-item-reference-type';
import { MaskMetadata } from './types/mask-metadata';
import { Shader, SlideMetadata } from './types/slide-metadata';
import { TemplateType } from './types/template-type';
import { withoutDates } from './utils';

export default class WsiMetadata {
  protected context: GlobalStorage;
  protected data: GlobalItem | null = null;

  private defaultSlideMetadata: SlideMetadata = { visualization: {} };
  private defaultMaskMetadata: MaskMetadata = {};

  constructor(context: GlobalStorage) {
    this.context = context;
  }

  // Slide

  /**
   * Fetch global item containing metadata of WSI.
   * @param wsiId ID of WSI
   * @param isSlide Specify if WSI is a slide or a mask
   */
  private async getWsiMetadataItem(
    wsiId: string,
    isSlide: boolean = true,
  ): Promise<GlobalItem> {
    let metadata = (await this.context.query({ references: [wsiId] })).find(
      (p) => p.data_type === `${isSlide ? 'slide' : 'mask'}_metadata`,
    );
    if (!metadata) {
      metadata = await this.createWsiMetadataItem(
        wsiId,
        isSlide ? this.defaultSlideMetadata : this.defaultMaskMetadata,
      );
    }
    return metadata;
  }

  /**
   * Create global item containing metadata of WSI.
   * @param wsiId ID of WSI
   * @param value Metadata of WSI
   * @param isSlide Specify if WSI is a slide or a mask
   */
  private async createWsiMetadataItem(
    wsiId: string,
    value: any,
    isSlide: boolean = true,
  ): Promise<GlobalItem> {
    return await this.context.createValue(
      value,
      `Metadata of ${isSlide ? 'slide' : 'mask'} ${wsiId}`,
      undefined,
      wsiId,
      GlobalItemReferenceType.WSI,
      `${isSlide ? 'slide' : 'mask'}_metadata`,
    );
  }

  /**
   * Get metadata of slide WSI.
   * @param slideId ID of slide WSI
   */
  async getSlideMetadata(slideId: string): Promise<SlideMetadata> {
    return JSON.parse((await this.getWsiMetadataItem(slideId)).value as string);
  }

  /**
   * Update metadata of slide WSI.
   * @param slideId ID of slide WSI
   * @param value New metadata of WSI
   */
  async updateSlideMetadata(
    slideId: string,
    value: SlideMetadata,
  ): Promise<SlideMetadata | false> {
    const metadataItem = await this.getWsiMetadataItem(slideId);
    try {
      const updatedItem = await this.context.update(metadataItem.id, {
        ...metadataItem,
        value: JSON.stringify(value),
      });
      return JSON.parse(updatedItem.value);
    } catch (e) {
      return false;
    }
  }

  /**
   * Helper method generating shader config for user-created xOpat visualisations
   * @param shaders Array of shaders
   */
  private async getShadersConfig(shaders: Shader[]): Promise<object> {
    const shadersConfig: Record<string, any> = {};
    for (let i = 0; i < shaders.length; i++) {
      const shaderTemp = await this.context.visTemplates.getTemplate(
        TemplateType.Shader,
        shaders[i].shaderTemplate,
      );
      shadersConfig[shaders[i].id] = {
        ...shaderTemp,
        name: shaders[i].name || shaders[i].id,
        dataReferences: shaders[i].dataRefs,
      };
    }
    return shadersConfig;
  }

  /**
   * Fetch user-created xOpat visualisations of a slide
   * @param slideId ID of a slide
   */
  async getVisualizations(slideId: string): Promise<any> {
    const slideVis = (await this.getSlideMetadata(slideId)).visualization;
    const visualizations = {
      params: slideVis.paramsTemplate
        ? (await this.context.visTemplates.getTemplate(
            TemplateType.Params,
            slideVis.paramsTemplate,
          )) || undefined
        : undefined,
      data: slideVis.data,
      background: {
        ...(slideVis.background
          ? await this.context.visTemplates.getTemplate(
              TemplateType.Background,
              slideVis.background?.template,
            )
          : {}),
        data: slideVis.background && slideVis.background.dataRef,
      },
      visualizations:
        slideVis.visualizations &&
        (await Promise.all(
          slideVis.visualizations.map(async (vis) => {
            return {
              ...(await this.context.visTemplates.getTemplate(
                TemplateType.Visualization,
                vis.visTemplate,
              )),
              name: vis.name,
              shaders: await this.getShadersConfig(vis.shaders),
            };
          }),
        )),
    };
    return visualizations;
  }

  // MASK

  /**
   * Get metadata of mask WSI.
   * @param slideId ID of mask WSI
   */
  async getMaskMetadata(maskId: string): Promise<MaskMetadata> {
    return JSON.parse(
      (await this.getWsiMetadataItem(maskId, false)).value as string,
    );
  }
}
