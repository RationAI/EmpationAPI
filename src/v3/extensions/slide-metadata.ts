import Primitives from "../scope/primitives";
import { Primitive } from "../scope/types/primitive";
import { PrimitiveReferenceType } from "../scope/types/primitive-reference-type";
import { MaskMetadata } from "./types/mask-metadata";
import { Shader, SlideMetadataT } from "./types/slide-metadata";

export default class SlideMetadata {
    protected context: Primitives;
    protected data: [];

    constructor(context: Primitives) {
        this.context = context;
    }

    // WSI

    private async getSlideMetaPrimitive(slideId: string, creator: string): Promise<Primitive> {
      let metaPrimitive = (await this.context.query({ creators: [creator], references: [slideId]})).find((p) => p.name === `Metadata of slide ${slideId}`);
      if (!metaPrimitive) {
        metaPrimitive =  await this.createSlideMetaPrimitive(slideId, { visualization: [] })
      }
      return metaPrimitive
    }

    private async createSlideMetaPrimitive(slideId: string, value: any): Promise<Primitive> {
      return await this.context.create("value in description", `Metadata of slide ${slideId}`, JSON.stringify(value), slideId, PrimitiveReferenceType.Wsi)
    }

    async getSlideMeta(slideId: string, creator: string): Promise<SlideMetadataT> {
      return JSON.parse((await this.getSlideMetaPrimitive(slideId, creator)).description as string)
    }

    async updateSlideMeta(slideId: string, value: SlideMetadataT, creator: string): Promise<SlideMetadataT> {
      const metaPrimitive = await this.getSlideMetaPrimitive(slideId, creator);
      await this.context.delete(metaPrimitive.id);
      return JSON.parse((await this.createSlideMetaPrimitive(slideId, value)).description as string);
    }

    private async getShadersConfig(shaders: Shader[]): Promise<object> {
      const shadersConfig = {}
      for (let i = 0; i < shaders.length; i++) {
        const shaderTemp = (await import(`../../../assets/visualizations_templates/shaders/${shaders[i].shaderTemplate}.json`)).default;
        shadersConfig[shaders[i].id] = {
          ...shaderTemp,
                name: shaders[i].name || shaders[i].id,
                dataReferences: shaders[i].dataRefs,
        }
      }
      return shadersConfig;
    }

    async getVisualizations(slideId: string, creator: string): Promise<any> {
      const slideVis = (await this.getSlideMeta(slideId, creator)).visualization;
      const visualizations = {
        params: (await import(`../../../assets/visualizations_templates/params/${slideVis.paramsTemplate}.json`)).default,
        data: slideVis.data,
        background: {
          ...(await import(`../../../assets/visualizations_templates/background/${slideVis.background.template}.json`)).default,
          data: slideVis.background.dataRef,
        },
        visualizations: await Promise.all(slideVis.visualizations.map(async (vis) => {
          return ({
            ...(await import(`../../../assets/visualizations_templates/visualizations/${vis.visTemplate}.json`)).default,
            name: vis.name,
            shaders: await this.getShadersConfig(vis.shaders),
          })
        }))
      }
      return visualizations;
    }

    // MASK

    async maskMeta(maskId: string): Promise<MaskMetadata> {
      const metadataPrimitive = (await this.context.query({ references: [maskId]})).find((p) => p.name === `Metadata of mask ${maskId}`)

      return JSON.parse(metadataPrimitive.value as string)
    }

}
