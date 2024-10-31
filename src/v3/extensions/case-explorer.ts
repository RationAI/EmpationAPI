import Cases from '../root/cases';
import { Case } from '../root/types/case';
import { CaseH } from './types/case-h';
import { CaseHierarchy } from './types/case-hierarchy-result';
import { CaseSearchParams } from './types/case-search-params';
import {
  getDayFromEpochTime,
  getMonthFromEpochTime,
  getYearFromEpochTime,
  groupBy,
  matchStringOnTokens,
} from './utils';
import {AuthIntegration} from "../integration";

export type CaseTissuesStains = {
  name: string;
  locName: string;
};

export type HierarchyNameOverrides = {
  [key: string]: {
    [key: string]: string;
  };
};

export default class CaseExplorer {
  protected context: Cases;
  protected customCases: CaseH[] | null = null;
  protected caseHierarchy: CaseHierarchy | null = null;
  protected caseTissues: CaseTissuesStains[] | null = null;
  protected caseStains: CaseTissuesStains[] | null = null;
  protected integration: AuthIntegration;

  identifierSeparator: string = '';
  hierarchySpec: string[] = [];
  hierarchyNameOverrides: HierarchyNameOverrides = {};

  constructor(context: Cases, integration: AuthIntegration) {
    this.context = context;
    this.integration = integration;
  }

  /**
   * Configure CaseExplorer.
   * @param identifierSeparator Regex matching local_id and its parts.
   * @param hierarchySpec Array of hierarchy keys defining hierarchy.
   * @param hierarchyNameOverrides Override specific values of specific keys to use as names in hierarchy.
   */
  use(
    identifierSeparator: string,
    hierarchySpec: string[],
    hierarchyNameOverrides: HierarchyNameOverrides = {},
  ): void {
    this.hierarchySpec = hierarchySpec;
    this.identifierSeparator = identifierSeparator;
    this.hierarchyNameOverrides = hierarchyNameOverrides;
  }

  /**
   * Returns cases extended with path in the specified hierarchy.
   */
  private async getCustomCases() {
    if (!this.customCases) {
      this.customCases = (await this.context.list()).items.map((caseObj) => {
        return {
          ...caseObj,
          pathInHierarchy: this.getCaseHierarchyPath(caseObj),
        };
      });
    }
    return this.customCases;
  }

  /**
   * Returns case's path in the specified hierarchy.
   * @param caseObj EMPAIA Case.
   */
  getCaseHierarchyPath(caseObj: Case) {
    if (!this.identifierSeparator || !this.hierarchySpec) {
      throw `ArgumentError[CaseExplorer] identifierSeparator or hierarchySpec is missing - required property!`;
    }
    let pathFinished = false;
    return this.hierarchySpec.reduce((prev, curr) => {
      const val = this.getCaseValue(curr, caseObj);

      const returnVal = pathFinished ? prev : `${prev}/${val}`;
      if (val === 'OTHER') {
        pathFinished = true;
      }
      return returnVal;
    }, '');
  }

  /**
   * Returns single case.
   * @param caseId ID of a case.
   */
  async getCase(caseId: string): Promise<CaseH> {
    let caseObj: Case | undefined;
    if (this.customCases) {
      caseObj = this.customCases.find((cs) => cs.id === caseId);
    }

    if (!caseObj) {
      caseObj = await this.context.get(caseId);
    }

    return { ...caseObj, pathInHierarchy: this.getCaseHierarchyPath(caseObj) };
  }

  /**
   * Returns case's value, can be a simple attribute, or some derived value.
   * @param key Key specifying value that can be extracted from a case.
   * @param cs Case object.
   */
  private getCaseValue(key: string, cs: Case) {
    switch (key) {
      case 'year': {
        return this.getCaseYear(cs);
      }
      case 'month': {
        return this.getCaseMonth(cs);
      }
      case 'day': {
        return this.getCaseDay(cs);
      }
      case 'description': {
        return this.getCaseDescription(cs);
      }
      case 'tissues': {
        return this.getCaseTissues(cs);
      }
      case 'stains': {
        return this.getCaseStains(cs);
      }
      default: {
        if (key.slice(0, 8) === 'id_part_' && !isNaN(Number(key.slice(8)))) {
          return this.getCaseIdentifierPart(cs, Number(key.slice(8)));
        }
        throw `KeyError[CaseExplorer] \"${key}\" is not supported!`;
      }
    }
  }

  /**
   * Evaluates case's value against a provided value.
   * @param key Key specifying value that can be extracted from a case.
   * @param evalValue Value for comparison/evaluation.
   * @param cs Case object.
   */
  private evaluateCaseValue(
    key: string,
    evalValue: string | string[],
    cs: Case,
  ) {
    const caseValue = this.getCaseValue(key, cs);
    switch (key) {
      case 'year': {
        return this.evaulateCaseYear(caseValue as string, evalValue as string);
      }
      case 'month': {
        return this.evaulateCaseMonth(caseValue as string, evalValue as string);
      }
      case 'day': {
        return this.evaulateCaseDay(caseValue as string, evalValue as string);
      }
      case 'description': {
        return this.evaluateCaseDescription(
          caseValue as string,
          evalValue as string,
        );
      }
      case 'tissues': {
        return this.evaluateCaseTissues(
          caseValue as string[],
          evalValue as string | string[],
        );
      }
      case 'stains': {
        return this.evaluateCaseStains(
          caseValue as string[],
          evalValue as string | string[],
        );
      }
      default: {
        // any invalid key will be caught in getCaseValue call
        return this.evaulateCaseIdentifierPart(
          caseValue as string,
          evalValue as string,
        );
      }
    }
  }

  private getCaseYear(cs: Case): string {
    return getYearFromEpochTime(cs.created_at).toString();
  }
  private getCaseMonth(cs: Case): string {
    return getMonthFromEpochTime(cs.created_at).toString();
  }
  private getCaseDay(cs: Case): string {
    return getDayFromEpochTime(cs.created_at).toString();
  }
  private getCaseIdentifierPart(cs: Case, partIdx: number): string {
    if (!this.identifierSeparator) {
      throw `ArgumentError[CaseExplorer] identifierSeparator is missing - required property!`;
    }
    const parts = new RegExp(this.identifierSeparator).exec(cs.local_id || '');
    if (!parts) return 'OTHER';
    if (partIdx < 1 || partIdx >= parts.length)
      throw `KeyError[CaseExplorer] invalid key \"id_part_<index>\", group index is not valid!`;
    return parts[partIdx];
  }
  private getCaseDescription(cs: Case): string {
    return cs.description || '';
  }
  private getCaseTissues(cs: Case): string[] {
    return Object.keys(cs.tissues);
  }
  private getCaseStains(cs: Case): string[] {
    return Object.keys(cs.stains);
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
  private evaulateCaseIdentifierPart(
    value: string,
    evalValue: string,
  ): boolean {
    return value === evalValue;
  }
  private evaluateCaseDescription(value: string, evalValue: string): boolean {
    return matchStringOnTokens(value, evalValue);
  }
  private evaluateCaseTissues(
    value: string[],
    evalValue: string | string[],
  ): boolean {
    if (!(evalValue instanceof Array)) {
      evalValue = [evalValue];
    }
    // ALL searched tissues are present in case
    return evalValue.every((tissue) => value.includes(tissue));

    // SOME searched tissues are present in case
    // return evalValue.some((tissue) => value.includes(tissue))
  }
  private evaluateCaseStains(
    value: string[],
    evalValue: string | string[],
  ): boolean {
    if (!(evalValue instanceof Array)) {
      evalValue = [evalValue];
    }
    // ALL searched stains are present in case
    return evalValue.every((stain) => value.includes(stain));

    // SOME searched stains are present in case
    // return evalValue.some((stain) => value.includes(stain))
  }

  /**
   * Recursively constructs a hierarchy by single levels
   */
  private hierarchyLevel(
    keys: string[],
    keyIdx: number,
    cases: Case[],
    currentHierarchyPath: string,
    name?: string,
  ): CaseHierarchy {
    if (keyIdx >= keys.length) {
      return {
        levelName: name,
        lastLevel: true,
        items: cases.map((caseObj) => {
          return { ...caseObj, pathInHierarchy: currentHierarchyPath };
        }),
      };
    }
    // grouping by array values(tissues, stains) is not expected, but works by grouping on first value of array
    const groups = groupBy(cases, (cs) => {
      const value = this.getCaseValue(keys[keyIdx], cs);
      if (Array.isArray(value)) {
        return value[0] || '';
      }
      return value;
    });

    const items = Object.keys(groups).map((name) => {
      const overrideName =
        this.hierarchyNameOverrides[keys[keyIdx]]?.[name] || name;
      if (name === 'OTHER') {
        return this.hierarchyLevel(
          keys,
          keys.length,
          groups[name],
          `${currentHierarchyPath}/${overrideName}`,
          overrideName,
        );
      }
      return this.hierarchyLevel(
        keys,
        keyIdx + 1,
        groups[name],
        `${currentHierarchyPath}/${overrideName}`,
        overrideName,
      );
    });

    return { levelName: name, lastLevel: false, items: items };
  }

  /**
   * Constructs a hierarchy based on spec configured in the CaseExplorer class.
   */
  async hierarchy(): Promise<CaseHierarchy> {
    if (!this.caseHierarchy) {
      const cases = await this.getCustomCases();
      this.caseHierarchy = this.hierarchyLevel(
        this.hierarchySpec,
        0,
        cases,
        '',
      );
    }
    return this.caseHierarchy;
  }

  /**
   * Search cases.
   * @param query Search query.
   */
  async search(query: CaseSearchParams[]): Promise<CaseH[]> {
    let filteredCases = await this.getCustomCases();
    query.forEach(
      ({ key, value }) =>
        (filteredCases = filteredCases.filter((cs) =>
          this.evaluateCaseValue(key, value, cs),
        )),
    );

    return filteredCases;
  }

  /**
   * Get all tissues in available cases.
   * @param localization Language of tissue names.
   */
  async tissues(localization: string = 'EN'): Promise<CaseTissuesStains[]> {
    if (!this.caseTissues) {
      const cases = await this.getCustomCases();

      const allTissues: CaseTissuesStains[] = [];
      cases.forEach((c) =>
        Object.entries(c.tissues)
          .map(([tisName, tisValue]: [string, any]) => ({
            name: tisName,
            locName: tisValue[localization],
          }))
          .forEach((t) => allTissues.push(t)),
      );
      this.caseTissues = [
        ...new Map(
          allTissues.map((t) => [JSON.stringify([t.name, t.locName]), t]),
        ).values(),
      ];
    }
    return this.caseTissues;
  }

  /**
   * Get all stains in available cases.
   * @param localization Language of stains names.
   */
  async stains(localization: string = 'EN'): Promise<CaseTissuesStains[]> {
    if (!this.caseStains) {
      const cases = await this.getCustomCases();

      const allStains: CaseTissuesStains[] = [];
      cases.forEach((c) =>
        Object.entries(c.stains)
          .map(([stnName, stnValue]: [string, any]) => ({
            name: stnName,
            locName: stnValue[localization],
          }))
          .forEach((s) => allStains.push(s)),
      );
      this.caseStains = [
        ...new Map(
          allStains.map((s) => [JSON.stringify([s.name, s.locName]), s]),
        ).values(),
      ];
    }
    return this.caseStains;
  }
}
