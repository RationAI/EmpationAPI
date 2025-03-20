import { JobState } from './job-config';
import Root from '../root/root';
import { Case } from '../root/types/case';

/**
 * Get all jobs for a given case
 */
export default class JobExplorer {
  protected rootAPI: Root;
  protected data: object | null = null;

  protected configDataType: string = 'app_job_config';

  constructor(rootAPI: Root) {
    this.rootAPI = rootAPI;
  }

  /**
   * Get all jobs formatted for viewing for a given case
   * @param caseObj Case object or case ID
   * @param usedSlide Only return jobs that used this slide (optional)
   * @returns Array of jobs
   */
  getJobsForViewing = async (caseObj: Case | string, usedSlide?: string) => {
    let caseId: string;
    if (typeof caseObj === 'string') {
      caseId = caseObj;
      console.log(`Fetching job info: ${caseObj}`);
    } else {
      caseId = caseObj.id;
      console.log(`Fetching job info: ${caseObj.local_id || caseObj.id}`);
    }
    const examinations = (
      await this.rootAPI.examinations.query({
        cases: [caseId],
      })
    ).items;

    const globalStorageJobsConfig =
      this.rootAPI.rationai.globalStorage.jobConfig;
    let validJobs: JobState[] = [];
    for (let i = 0; i < examinations.length; i = i + 1) {
      const examination = examinations[i];
      const appConfig =
        await this.rootAPI.rationai.globalStorage.jobConfig.getJobConfig(
          examination.app_id,
        );
      if (appConfig) {
        const scope = await this.rootAPI.getScopeFrom(examination);
        const jobs = await scope.jobs.getJobs();
        const jobsWithOutputs = (
          await Promise.all(
            jobs.map(
              async (job) =>
                await globalStorageJobsConfig.getJobOutputs(job, scope),
            ),
          )
        ).filter((job) => !usedSlide || usedSlide === job.inputs.my_wsi);
        validJobs = validJobs.concat(
          globalStorageJobsConfig.getJobStatesFromJobs(
            jobsWithOutputs,
            appConfig,
            examination,
          ),
        );
      }
      // else TODO: provide default visualization for non-existing configs
    }
    return validJobs;
  };
}
