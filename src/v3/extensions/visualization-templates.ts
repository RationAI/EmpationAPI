import GlobalStorage from "../rationai/global-storage";
import { GlobalItem } from "../rationai/types/global-item";
import { TemplateType } from "./types/template-type";

const templatesGlobalItemDataType = "vis_templates"

export default class VisualizationTemplates {
    protected context: GlobalStorage;
    protected data: object | null = null;

    constructor(context: GlobalStorage) {
        this.context = context;
    }

    async fetchTemplateItem(type: TemplateType, name: string): Promise<GlobalItem | undefined> {
      return (await this.context.query({references: [null], data_types: [`${templatesGlobalItemDataType}_${type}`]})).find((item) => item.name === name)
    }

    async getTemplate(type: TemplateType, name: string): Promise<object | false> {
      const tmpl = await this.fetchTemplateItem(type, name)
      if (tmpl) {
        return JSON.parse(tmpl.value);
      }
      return false;
    }

    async createTemplate(type: TemplateType, name: string, value: object): Promise<object | false> {
      const existingTmpl = await this.fetchTemplateItem(type, name)
      if (existingTmpl) {
        return false;
      }
      return await this.context.createValue(value, `${name}`, undefined, undefined, undefined, `${templatesGlobalItemDataType}_${type}`)
    }

    async deleteTemplate(type: TemplateType, name: string): Promise<boolean> {
      const existingTmpl = await this.fetchTemplateItem(type, name)
      if (!existingTmpl) {
        return false;
      }
      await this.context.delete(existingTmpl.id);
      return true;
    }
}