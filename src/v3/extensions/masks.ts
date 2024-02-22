import Cases from "../root/cases";
import { Case } from "../root/types/case";
import { CaseExplorerResults } from "./types/case-explorer-results";
import { CaseHierarchy } from "./types/case-hierarchy-result";
import { CaseSearchParams } from "./types/case-search-params";
import { getDayFromEpochTime, getMonthFromEpochTime, getYearFromEpochTime, groupBy, matchStringOnTokens } from "./utils";

export default class Masks {
    protected context: Cases;
    protected data: CaseExplorerResults;

    identifierSeparator: string;
    identifierValue: string;

    constructor(context: Cases) {
        this.context = context;
    }

    use(identifierSeparator: string, value: string): void {
      if (this.identifierSeparator === identifierSeparator) return;
      this.identifierSeparator = identifierSeparator;
    }

}
