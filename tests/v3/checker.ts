import CaseListTI from "../../src/v3/root/types/case-list-ti";
import CaseTI from "../../src/v3/root/types/case-ti";
import CaseCreatorTypeTI from "../../src/v3/root/types/case-creator-type-ti";
import PreprocessingProgressTI from "../../src/v3/root/types/preprocessing-progress-ti";
import WorkbenchServiceModelsTI from "../../src/v3/root/types/workbench-service-models-v-3-examination-examination-ti";
import ExaminationCreatorTypeTI from "../../src/v3/root/types/examination-creator-type-ti";
import ExaminationStateTI from "../../src/v3/root/types/examination-state-ti";
import SlideTI from "../../src/v3/root/types/slide-ti";
import TagMappingTI from "../../src/v3/root/types/tag-mapping-ti";
import SlideInfoTI from "../../src/v3/root/types/slide-info-ti";
import SlideChannelTI from "../../src/v3/root/types/slide-channel-ti";
import SlideExtentTI from "../../src/v3/root/types/slide-extent-ti";
import SlideLevelTI from "../../src/v3/root/types/slide-level-ti";
import SlidePixelSizeNmTI from "../../src/v3/root/types/slide-pixel-size-nm-ti";
import SlideColorTI from "../../src/v3/root/types/slide-color-ti";
import SlideListTI from "../../src/v3/root/types/slide-list-ti";
import CaseHierarchyTI from "../../src/v3/extensions/types/case-hierarchy-result-ti"
import { ICheckerSuite, createCheckers } from "ts-interface-checker";

export function getV3TypeChecker(): ICheckerSuite {

  const checker = createCheckers(CaseListTI, CaseTI, CaseCreatorTypeTI, PreprocessingProgressTI, WorkbenchServiceModelsTI, ExaminationCreatorTypeTI, 
    ExaminationStateTI, SlideTI, TagMappingTI, SlideInfoTI, SlideChannelTI, SlideExtentTI, SlideLevelTI, SlidePixelSizeNmTI, SlideColorTI, SlideListTI,
    CaseHierarchyTI);

  return checker;
}