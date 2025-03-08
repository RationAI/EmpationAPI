import {JobState} from "./job-config";
import Root from "../root/root";
import {Case} from "../root/types/case";

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

    getJobsForViewing = async (caseObj: Case) => {
        console.log(`Fetching job info: ${caseObj.local_id || caseObj.id}`);
        const examinations = (
            await this.rootAPI.examinations.query({
                cases: [caseObj.id],
            })
        ).items;

        const globalStorageJobsConfig = this.rootAPI.rationai.globalStorage.jobConfig;
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
                const jobsWithOutputs = await Promise.all(
                    jobs.map(async (job) => await globalStorageJobsConfig.getJobOutputs(job, scope)),
                );
                validJobs = validJobs.concat(
                    globalStorageJobsConfig.getJobStatesFromJobs(jobsWithOutputs, appConfig, examination),
                );
            }
            // else TODO: provide default visualization for non-existing configs
        }
        return validJobs;
    };
}
