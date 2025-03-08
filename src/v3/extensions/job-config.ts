import GlobalStorage from '../rationai/global-storage';
import { GlobalItem } from '../rationai/types/global-item';
import { GlobalItemReferenceType } from '../rationai/types/global-item-reference-type';
import {JobStatus} from "../scope/types/job-status";
import {Job} from "../scope/types/job";
import {Scope} from "../";
import {StringPrimitive} from "../scope/types/string-primitive";
import {
  WorkbenchServiceApiV3CustomModelsExaminationsExamination
} from "../root/types/workbench-service-api-v-3-custom-models-examinations-examination";


export const PROCESSING_STATES = [
  JobStatus.Assembly,
  JobStatus.Running,
  JobStatus.Scheduled,
];
export const COMPLETED_STATES = [JobStatus.Completed];
export const ERROR_STATES = [
  JobStatus.Failed,
  JobStatus.Timeout,
  JobStatus.Error,
  JobStatus.Incomplete,
];
export const READY_STATES = [JobStatus.Ready];
export const NONE_STATES = [JobStatus.None];

export type Visualization = {
  shaders: object;
  name: string;
};

export type VisualizationConfig = {
  params?: object;
  data: string[];
  background?: object;
  visualizations?: Visualization[];
  plugins?: object;
};

export type JobState = {
  caseId: string;
  appId: string;
  id: string;
  status: string;
  inputs: string[];
  outputs: string[];
  visualization?: Visualization;
  background?: object;
  name?: string;
  description?: string;
};



export default class JobConfig {
  protected context: GlobalStorage;
  protected data: object | null = null;

  protected configDataType: string = 'app_job_config';

  constructor(context: GlobalStorage) {
    this.context = context;
  }

  /**
   * Configure JobConfig class with data type. Data type is used to filter global items.
   * @param configDataType Data type of global items used to store job configs.
   */
  use(configDataType: string): void {
    this.configDataType = configDataType;
  }

  /**
   * Fetch global item containing job config of an App.
   * @param appId ID of App
   */
  private async fetchJobConfigItem(
    appId: string,
  ): Promise<GlobalItem | undefined> {
    return (
      await this.context.query({
        references: [appId],
        data_types: [this.configDataType],
      })
    ).find(Boolean);
  }

  /**
   * Get job config of an App.
   * @param appId ID of App
   */
  async getJobConfig(appId: string): Promise<object | false> {
    const item = await this.fetchJobConfigItem(appId);
    if (item) {
      return JSON.parse(item.value);
    }
    return false;
  }

  /**
   * Get job config of an App.
   * @param appId ID of App
   * @param value Job config of an App
   */
  async createJobConfig(appId: string, value: object): Promise<object | false> {
    const existingConfig = await this.fetchJobConfigItem(appId);
    if (existingConfig) {
      return false;
    }
    return await this.context.createValue(
      value,
      `Job config of App`,
      undefined,
      appId,
      GlobalItemReferenceType.JOB,
      this.configDataType,
    );
  }

  /**
   * Delete job config of an App.
   * @param appId ID of App
   */
  async deleteJobConfig(appId: string): Promise<boolean> {
    const existingConfig = await this.fetchJobConfigItem(appId);
    if (!existingConfig) {
      return false;
    }
    await this.context.delete(existingConfig.id);
    return true;
  }

  /**
   *
   * @param job
   * @param scope
   */
  async getJobOutputs(job: Job, scope: Scope) {
    const jobOutputs = await Promise.all(
        Object.entries(job.outputs).map(async ([outputKey, primitiveID]) => {
          try {
            const primitiveWithOutputID = (await scope.rawQuery(
                `/primitives/${primitiveID}`,
            )) as StringPrimitive;
            return [outputKey, primitiveWithOutputID.value] as [string, string];
          } catch {
            return [outputKey, 'processing'] as [string, string];
          }
        }),
    );
    job.outputs = Object.fromEntries(jobOutputs);
    return job;
  };

  getJobStatesFromJobs (
      jobs: Job[],
      appConfig: Record<string, any>,
      examination: WorkbenchServiceApiV3CustomModelsExaminationsExamination,
  ) {
    const jobStates: JobState[] = [];
    jobs.forEach((job) => {
      const inputs =
          appConfig['modes'][job.mode?.toLowerCase() || 'preprocessing'][
              'inputs'
              ] ?? {};
      const outputs =
          appConfig['modes'][job.mode?.toLowerCase() || 'preprocessing'][
              'outputs'
              ] ?? {};
      const inputKeys = Object.keys(inputs);
      const outputKeys = Object.keys(outputs);
      const inputIds = inputKeys.map((key) => job.inputs[key]);
      const outputIds = outputKeys.map((key) => job.outputs[key]);
      let status;
      let visualization: Visualization | undefined;
      let background;
      if (ERROR_STATES.includes(job.status)) {
        status = 'error';
      } else if (COMPLETED_STATES.includes(job.status)) {
        status = 'completed';
        visualization = {
          name: `${appConfig['name'] || 'Job'} output`,
          shaders: Object.fromEntries(
              outputKeys.map((key, idx) => [
                key,
                {
                  ...outputs[key],
                  _layer_loc: undefined,
                  dataReferences: [inputKeys.length + idx],
                },
              ]),
          ),
        };
        background = inputKeys.map((key, idx) => ({
          ...inputs[key],
          _layer_loc: undefined,
          dataReference: idx,
        }));
      } else if (PROCESSING_STATES.includes(job.status)) {
        status = 'processing';
      } else if (READY_STATES.includes(job.status)) {
        status = 'ready';
      } else if (NONE_STATES.includes(job.status)) {
        status = 'none';
      } else {
        status = 'unknown';
      }

      jobStates.push({
        caseId: examination.case_id,
        appId: examination.app_id,
        id: job.id,
        status: status,
        inputs: inputIds,
        outputs: outputIds,
        visualization: visualization,
        background: background,
        name: appConfig['name'],
        description: appConfig['description'],
      });
    });

    return jobStates;
  };
}
