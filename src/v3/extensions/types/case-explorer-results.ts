/* tslint:disable */
/* eslint-disable */
import { Case } from "src/v3/root/types/case";
import { CaseHierarchy } from "./case-hierarchy-result";

export interface CaseExplorerResults {

  /**
   * Result of last case search.
   */
  searchResult?: Case[];

  /**
   * Last generated hierarchy.
   */
  hierarchyResult?: CaseHierarchy;
}
