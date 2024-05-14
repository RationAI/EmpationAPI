/* tslint:disable */
/* eslint-disable */
import { Case } from '../../root/types/case';
import { CaseHierarchy } from './case-hierarchy-result';

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
