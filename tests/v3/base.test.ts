/** @jest-environment setup-polly-jest/jest-environment-node */
import { polly } from '../polly';

import { getEnv } from '../env';
import { getRoot } from './setup';
import { getToken, setupIntercept } from '../setup';
import { V3 } from '../../src';
import { getV3TypeChecker } from './checker';
import { Slide } from '../../src/v3/root/types/slide';

describe('base api', () => {
  const pollyCtx = polly();
  beforeEach(() => setupIntercept(pollyCtx));

  it('setUser', async () => {
    const api = new V3.Root({
      workbenchApiUrl: getEnv('TEST_WB_URL') || '',
    });

    await api.from(await getToken());
  });

  it('list cases', async () => {
    const api = await getRoot();

    const cases = await api.cases.list();

    const { CaseList, Case } = getV3TypeChecker();

    CaseList.check(cases);
    cases.items.forEach((caseObj) => Case.check(caseObj));
  });

  it('get case by ID', async () => {
    const api = await getRoot();
    const cases = await api.cases.list();
    if (cases.item_count > 0) {
      const caseObj = await api.cases.get(cases.items[0].id);
      const { Case } = getV3TypeChecker();

      Case.check(caseObj);

      expect(caseObj).toEqual(cases.items[0])
    }
  });

  it('get case slides', async () => {
    const { SlideList, Slide } = getV3TypeChecker();

    const api = await getRoot();
    const cases = await api.cases.list();
    let slides: Slide[] = []
    if (cases.item_count > 0) {
      const slideList = (await api.cases.slides(
        cases.items[0].id,
      ));

      SlideList.check(slideList);
      slides = slideList.items;
    }

    slides.forEach((slide) => Slide.check(slide));
  });

  it('get slide info', async () => {
    const api = await getRoot();
    const cases = await api.cases.list();
    if (cases.item_count > 0) {
      const slides = (await api.cases.slides(
        cases.items[0].id,
      )).items;
      if (slides.length > 0) {
        const info = await api.slides.slideInfo(
          slides[0].id,
        );
    
        const { SlideInfo } = getV3TypeChecker();
    
        SlideInfo.check(info);
      }
      
    }
  });
});
