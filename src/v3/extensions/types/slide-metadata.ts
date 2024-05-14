/* tslint:disable */
/* eslint-disable */

export interface Shader {
  shaderTemplate: string;
  id: string;
  name?: string;
  dataRefs: number[];
}

export interface Background {
  template: string;
  dataRef: number;
}

export interface SlideMetaVisualization {
  visTemplate: string;
  name: string;
  shaders: Shader[];
}

export interface SlideMetaVisualizations {
  paramsTemplate?: string;
  data?: string[];
  background?: Background;
  visualizations?: SlideMetaVisualization[];
}

export interface SlideMetadata {
  /**
   * Visualizations.
   */
  visualization: SlideMetaVisualizations;
}
