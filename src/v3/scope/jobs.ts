import { ScopeContext } from "../../scope";
import Scopes from "./scopes";
import { Job } from "./types/job";
import { JobList } from "./types/job-list";

export default class Jobs extends ScopeContext {
    protected context: Scopes;
    protected data: Job[] | null = null;

    constructor(context: Scopes) {
        super();
        this.context = context;
    }

    async getJobs(): Promise<Job[]> {
        return (await this.context.rawQuery('/jobs') as JobList).items
    }

    async get(jobId: string): Promise<Job> {
            return await this.context.rawQuery(`/jobs/${jobId}`) as Job;
    }
}
