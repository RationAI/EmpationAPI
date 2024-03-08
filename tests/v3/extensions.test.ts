/** @jest-environment setup-polly-jest/jest-environment-node */
import { CaseSearchParams } from "../../src/v3/extensions/types/case-search-params";
import {polly} from "../polly";
import {defaultComparisonUser, defaultTestUser, setInterceptedUser, setupIntercept} from "../setup";
import { getV3TypeChecker } from "./checker";
import {getRoot, getScope} from "./setup";


describe('extensions tests', () => {
    const pollyCtx = polly();
    beforeEach(() => setupIntercept(pollyCtx))

    it('fetch case hierarchy', async () => {

        const root = await getRoot()

        root.cases.caseExplorer.use("\\w+.\\w*-?[0-9]{4}_([0-9]*)([0-9]{2}).*");
        const hierarchy = await root.cases.caseExplorer.hierarchy(["year", "id_part_1", "id_part_2"])

        const {CaseHierarchy} = getV3TypeChecker()
        CaseHierarchy.check(hierarchy)
    });

    it('search one case', async () => {

      const root = await getRoot()

      root.cases.caseExplorer.use("\\w+.\\w*-?[0-9]{4}_([0-9]*)([0-9]{2}).*");

      const searchParams: CaseSearchParams[] = [
        {
          key: "year",
          value: "2024",
        },
        {
          key: "id_part_1",
          value: "156",
        },
        {
          key: "id_part_2",
          value: "84",
        },
      ]
      const searchResult = await root.cases.caseExplorer.search(searchParams)

      const {Case} = getV3TypeChecker()
      searchResult.forEach((resultItem) => Case.check(resultItem))
  });
  it('search for invalid year, expect no case in result', async () => {

    const root = await getRoot()

    root.cases.caseExplorer.use("\\w+.\\w*-?[0-9]{4}_([0-9]*)([0-9]{2}).*");

    const searchParams: CaseSearchParams[] = [
      {
        key: "year",
        value: "1969",
      },
    ]
    const searchResult = await root.cases.caseExplorer.search(searchParams)

    const {Case} = getV3TypeChecker()
    searchResult.forEach((resultItem) => Case.check(resultItem))
    expect(searchResult).toEqual([]);
  });
});
