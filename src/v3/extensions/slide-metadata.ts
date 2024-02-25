import { ScopeContext } from "../../scope";
import Scopes from "../scope/scopes";
import { MaskMetadata } from "./types/mask-metadata";
import { SlideMetadata } from "./types/slide-metadata";

export default class Primitives extends ScopeContext {
    protected context: Scopes;
    protected data: [];

    constructor(context: Scopes) {
        super();
        this.context = context;
    }

    async slideMeta(slideId: string): Promise<SlideMetadata> {
      const metadataPrimitive = (await this.context.primitives.query({references: [slideId]})).find((p) => p.name === `Metadata of slide ${slideId}`)

      return JSON.parse(metadataPrimitive.value as string)
    }

    async maskMeta(maskId: string): Promise<MaskMetadata> {
      const metadataPrimitive = (await this.context.primitives.query({references: [maskId]})).find((p) => p.name === `Metadata of mask ${maskId}`)

      return JSON.parse(metadataPrimitive.value as string)
    }

}
