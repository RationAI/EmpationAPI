/** @jest-environment setup-polly-jest/jest-environment-node */
import {polly} from "../polly";

import {getEnv} from "../env";
import {getRoot} from "./setup";
import {getToken, setupIntercept} from "../setup";
import { V3 } from "../../src";
import { getV3TypeChecker } from "./checker";


describe('base api', () => {
    const pollyCtx = polly();
    beforeEach(() => setupIntercept(pollyCtx));

    it('setUser', async () => {

        const api = new V3.Root({
            workbenchApiUrl: getEnv('TEST_WB_URL') || ""
        });

        await api.from(await getToken());
    });

    it('list cases', async () => {

        const api = await getRoot()

        const cases = await api.cases.list()

        const {CaseList, Case} = getV3TypeChecker()

        CaseList.check(cases)
        cases.items.forEach((caseObj) => Case.check(caseObj))
    });

    it('get case by ID', async () => {

        const api = await getRoot()

        const caseObj = await api.cases.get('77945443-8124-4449-acb6-24ef77b331bd')

        const {Case} = getV3TypeChecker()

        Case.check(caseObj)
    });

    it('get case slides', async () => {

        const api = await getRoot()

        const slides = await api.cases.slides('77945443-8124-4449-acb6-24ef77b331bd')

        const {SlideList, Slide} = getV3TypeChecker()

        SlideList.check(slides)
        slides.items.forEach((slide) => Slide.check(slide))
    });

    it('get slide info', async () => {

        const api = await getRoot()

        const info = await api.slides.slideInfo('8c5608f3-a824-485c-b791-2a640405d87b')
        console.log(info)

        const {SlideInfo} = getV3TypeChecker()

        SlideInfo.check(info)
    });
});
