import Cases from "../root/cases";
import { Case } from "../root/types/case";
import { CaseExplorerResults } from "./types/case-explorer-results";
import { CaseHierarchy } from "./types/case-hierarchy-result";
import { getDayFromEpochTime, getMonthFromEpochTime, getYearFromEpochTime, groupBy, matchStringOnTokens } from "./utils";

interface SearchParam {
  key: string,
  value: string,
}

export default class CaseExplorer {
    protected context: Cases;
    protected data: CaseExplorerResults;

    identifierSeparator: string;

    constructor(context: Cases) {
        this.context = context;
    }

    use(identifierSeparator: string): void {
      if (this.identifierSeparator === identifierSeparator) return;
      this.identifierSeparator = identifierSeparator;
    }

    getCaseValue(key: string, cs: Case) {
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

    evaluateCaseValue(key: string, evalValue: string | string[], cs: Case) {
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

    getCaseYear(cs: Case): string {
      return getYearFromEpochTime(cs.created_at).toString()
    }
    getCaseMonth(cs: Case): string {
      return getMonthFromEpochTime(cs.created_at).toString()
    }
    getCaseDay(cs: Case): string {
      return getDayFromEpochTime(cs.created_at).toString()
    }
    getCaseIdentifierPart(cs: Case, partIdx: number): string {
      if(!this.identifierSeparator) {
        throw `ArgumentError[CaseExplorer] identifierSeparator is missing - required property!`
      }
      const parts = new RegExp(this.identifierSeparator).exec(cs.local_id)
      if(partIdx < 1 || partIdx >= parts.length)
        throw `KeyError[CaseExplorer] invalid key \"id_part_<index>\", group index is not valid!`
      return parts[partIdx]
    }
    getCaseDescription(cs: Case): string {
      return cs.description
    }
    getCaseTissues(cs: Case): string[] {
      return Object.keys(cs.tissues)
    }
    getCaseStains(cs: Case): string[] {
      return Object.keys(cs.stains)
    }

    evaulateCaseYear(value: string, evalValue: string): boolean {
      return value === evalValue;
    }
    evaulateCaseMonth(value: string, evalValue: string): boolean {
      return value === evalValue;
    }
    evaulateCaseDay(value: string, evalValue: string): boolean {
      return value === evalValue;
    }
    evaulateCaseIdentifierPart(value: string, evalValue: string): boolean {
      return value === evalValue;
    }
    evaluateCaseDescription(value: string, evalValue: string): boolean {
      return matchStringOnTokens(value, evalValue)
    }
    evaluateCaseTissues(value: string[], evalValue: string[]): boolean {
      // ALL searched tissues are present in case
      return evalValue.every((tissue) => Object.keys(value).includes(tissue))

      // SOME searched tissues are present in case
      // return evalValue.some((tissue) => Object.keys(value).includes(tissue))
    }
    evaluateCaseStains(value: string[], evalValue: string[]): boolean {
      // ALL searched stains are present in case
      return evalValue.every((stain) => Object.keys(value).includes(stain))

      // SOME searched stains are present in case
      // return evalValue.some((stain) => Object.keys(value).includes(stain))
    }

    private hierarchyLevel(keys: string[], keyIdx: number, cases: Case[], name?: string): CaseHierarchy {
      if (keyIdx >= keys.length) {
        return { levelName: name, lastLevel: true, items: cases}
      }
      const groups = groupBy(cases, (cs) => this.getCaseValue(keys[keyIdx], cs) as string)

      return { levelName: name, lastLevel: false, items: Object.keys(groups).map((name) => this.hierarchyLevel(keys, keyIdx + 1, groups[name], name)) }
    }

    async hierarchy(keys: string[]): Promise<CaseHierarchy> {
      const cases = (await this.context.list()).items

      return this.hierarchyLevel(keys, 0, cases)
    }

    async search(query: SearchParam[]): Promise<Case[]> {
      const cases = (await this.context.list()).items
      let filteredCases;
      query.forEach(({key, value}) => filteredCases = filteredCases.filter((cs) => this.evaluateCaseValue(key, value, cs)))

      return filteredCases
    }
}
