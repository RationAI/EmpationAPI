/* tslint:disable */

import { Case } from "src/v3/root/types/case";

/* eslint-disable */
interface CaseCustom {

  pathInHierarchy: string;
}

export type CaseH = Case & CaseCustom;
