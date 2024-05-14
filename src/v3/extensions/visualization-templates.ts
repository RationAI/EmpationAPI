import GlobalStorage from '../rationai/global-storage';
import { GlobalItem } from '../rationai/types/global-item';
import { TemplateType } from './types/template-type';

const templatesGlobalItemDataType = 'vis_templates';

export default class VisualizationTemplates {
  protected context: GlobalStorage;
  protected data: object | null = null;

  constructor(context: GlobalStorage) {
    this.context = context;
  }

  /**
   * Fetch global item containing template.
   * @param type Type of the template (backgroung, params, shader, visualization)
   * @param name Name of the template
   */
  async fetchTemplateItem(
    type: TemplateType,
    name: string,
  ): Promise<GlobalItem | undefined> {
    return (
      await this.context.query({
        references: [null],
        data_types: [`${templatesGlobalItemDataType}_${type}`],
      })
    ).find((item) => item.name === name);
  }

  /**
   * Fetch template.
   * @param type Type of the template (backgroung, params, shader, visualization)
   * @param name Name of the template
   */
  async getTemplate(type: TemplateType, name: string): Promise<object | false> {
    const tmpl = await this.fetchTemplateItem(type, name);
    if (tmpl) {
      return JSON.parse(tmpl.value);
    }
    return false;
  }

  /**
   * Create new template.
   * @param type Type of the template (background, params, shader, visualization)
   * @param name Name of the template
   * @param value Value of the template
   */
  async createTemplate(
    type: TemplateType,
    name: string,
    value: object,
  ): Promise<object | false> {
    const existingTmpl = await this.fetchTemplateItem(type, name);
    if (existingTmpl) {
      return false;
    }
    return await this.context.createValue(
      value,
      `${name}`,
      undefined,
      undefined,
      undefined,
      `${templatesGlobalItemDataType}_${type}`,
    );
  }

  /**
   * Delete template.
   * @param type Type of the template (backgroung, params, shader, visualization)
   * @param name Name of the template
   */
  async deleteTemplate(type: TemplateType, name: string): Promise<boolean> {
    const existingTmpl = await this.fetchTemplateItem(type, name);
    if (!existingTmpl) {
      return false;
    }
    await this.context.delete(existingTmpl.id);
    return true;
  }
}
