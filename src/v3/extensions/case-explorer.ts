import Cases from "../root/cases";
import { Case } from "../root/types/case";
import { CaseExplorerResults } from "./types/case-explorer-results";
import { CaseHierarchy } from "./types/case-hierarchy-result";
import { CaseSearchParams } from "./types/case-search-params";
import { getDayFromEpochTime, getMonthFromEpochTime, getYearFromEpochTime, groupBy, matchStringOnTokens } from "./utils";

export default class CaseExplorer {
    protected context: Cases;
    protected caseHierarchy: CaseHierarchy | null = null;
    protected caseTissues: string[] = [];
    protected caseStains: string[] = []; 

    identifierSeparator: string = "";

    constructor(context: Cases) {
        this.context = context;
    }

    use(identifierSeparator: string): void {
      if (this.identifierSeparator === identifierSeparator) return;
      this.identifierSeparator = identifierSeparator;
    }

    private getCaseValue(key: string, cs: Case) {
      switch(key) {
        case "year": {
          return this.getCaseYear(cs)
        }
        case "month": {
          return this.getCaseMonth(cs)
        }
        case "day": {
          return this.getCaseDay(cs)
        }
        case "description": {
          return this.getCaseDescription(cs)
        }
        case "tissues": {
          return this.getCaseTissues(cs)
        }
        case "stains": {
          return this.getCaseStains(cs)
        }
        default: {
          if(key.slice(0, 8) === "id_part_" && !isNaN(Number(key.slice(8)))) {
            return this.getCaseIdentifierPart(cs, Number(key.slice(8)))
          }
          throw `KeyError[CaseExplorer] \"${key}\" is not supported!`
        }
      }
    }

    private evaluateCaseValue(key: string, evalValue: string | string[], cs: Case) {
      const caseValue = this.getCaseValue(key, cs)
      switch(key) {
        case "year": {
          return this.evaulateCaseYear(caseValue as string, evalValue as string)
        }
        case "month": {
          return this.evaulateCaseMonth(caseValue as string, evalValue as string)
        }
        case "day": {
          return this.evaulateCaseDay(caseValue as string, evalValue as string)
        }
        case "description": {
          return this.evaluateCaseDescription(caseValue as string, evalValue as string)
        }
        case "tissues": {
          return this.evaluateCaseTissues(caseValue as string[], evalValue as string[])
        }
        case "stains": {
          return this.evaluateCaseStains(caseValue as string[], evalValue as string[])
        }
        default: {
          // any invalid key will be caught in getCaseValue call
          return this.evaulateCaseIdentifierPart(caseValue as string, evalValue as string)
        }
      }
    }

    private getCaseYear(cs: Case): string {
      return getYearFromEpochTime(cs.created_at).toString()
    }
    private getCaseMonth(cs: Case): string {
      return getMonthFromEpochTime(cs.created_at).toString()
    }
    private getCaseDay(cs: Case): string {
      return getDayFromEpochTime(cs.created_at).toString()
    }
    private getCaseIdentifierPart(cs: Case, partIdx: number): string {
      if(!this.identifierSeparator) {
        throw `ArgumentError[CaseExplorer] identifierSeparator is missing - required property!`
      }
      const parts = new RegExp(this.identifierSeparator).exec(cs.local_id || "")
      if(!parts) 
        return "OTHER"
      if(partIdx < 1 || partIdx >= parts.length)
        throw `KeyError[CaseExplorer] invalid key \"id_part_<index>\", group index is not valid!`
      return parts[partIdx]
    }
    private getCaseDescription(cs: Case): string {
      return cs.description || ""
    }
    private getCaseTissues(cs: Case): string[] {
      return Object.keys(cs.tissues)
    }
    private getCaseStains(cs: Case): string[] {
      return Object.keys(cs.stains)
    }

    private evaulateCaseYear(value: string, evalValue: string): boolean {
      return value === evalValue;
    }
    private evaulateCaseMonth(value: string, evalValue: string): boolean {
      return value === evalValue;
    }
    private evaulateCaseDay(value: string, evalValue: string): boolean {
      return value === evalValue;
    }
    private evaulateCaseIdentifierPart(value: string, evalValue: string): boolean {
      return value === evalValue;
    }
    private evaluateCaseDescription(value: string, evalValue: string): boolean {
      return matchStringOnTokens(value, evalValue)
    }
    private evaluateCaseTissues(value: string[], evalValue: string[]): boolean {
      // ALL searched tissues are present in case
      return evalValue.every((tissue) => Object.keys(value).includes(tissue))

      // SOME searched tissues are present in case
      // return evalValue.some((tissue) => Object.keys(value).includes(tissue))
    }
    private evaluateCaseStains(value: string[], evalValue: string[]): boolean {
      // ALL searched stains are present in case
      return evalValue.every((stain) => Object.keys(value).includes(stain))

      // SOME searched stains are present in case
      // return evalValue.some((stain) => Object.keys(value).includes(stain))
    }

    private hierarchyLevel(keys: string[], keyIdx: number, cases: Case[], name?: string): CaseHierarchy {
      if (keyIdx >= keys.length) {
        return { levelName: name, lastLevel: true, items: cases}
      }
      // grouping by array values(tissues, stains) is not expected, but works by grouping on first value of array
      const groups = groupBy(cases, (cs) => {
        const value = this.getCaseValue(keys[keyIdx], cs);
        if(Array.isArray(value)) {
          return value[0] || "";
        }
        return value;
      })

      const items = Object.keys(groups).map((name) => {
        if(name === "OTHER") {
          return this.hierarchyLevel(keys, keys.length, groups[name], name);
        }
        return this.hierarchyLevel(keys, keyIdx + 1, groups[name], name);
      })

      return { levelName: name, lastLevel: false, items: items };
    }

    async hierarchy(keys: string[]): Promise<CaseHierarchy> {
      if(!this.caseHierarchy) {
        const cases = (await this.context.list()).items;
        this.caseHierarchy = this.hierarchyLevel(keys, 0, cases);
      }
      return this.caseHierarchy;
    }

    async search(query: CaseSearchParams[]): Promise<Case[]> {
      let filteredCases = (await this.context.list()).items;
      query.forEach(({key, value}) => filteredCases = filteredCases.filter((cs) => this.evaluateCaseValue(key, value, cs)));

      return filteredCases;
    }

    async tissues(localization: string = "EN"): Promise<string[]> {
      if(!this.caseTissues) {
        const cases = (await this.context.list()).items;

        const allTissues: Set<string> = new Set();
        cases.forEach((c) => Object.values(c.tissues).map((tissue: any) => tissue[localization]).forEach((t) => allTissues.add(t)));
        this.caseTissues = [...allTissues];
      }
      return this.caseTissues;
    }

    async stains(localization: string = "EN"): Promise<string[]> {
      if(!this.caseStains) {
        const cases = (await this.context.list()).items;

        const allStains: Set<string> = new Set();
        cases.forEach((c) => Object.values(c.stains).map((stain: any) => stain[localization]).forEach((t) => allStains.add(t)));
        this.caseStains = [...allStains];
      }
      return this.caseTissues;
    }
}
