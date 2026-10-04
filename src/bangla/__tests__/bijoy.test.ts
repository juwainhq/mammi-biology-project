import { describe, expect, it } from 'vitest';
import fixture from '../__fixtures__/reference.json';
import {
  bijoyToUnicode,
  toCanonical,
  detectScript,
  isEnglishLikeToken,
  reorderBijoyOrderedUnicode,
  toBengaliDigits,
  toLatinDigits,
  unicodeToBijoy,
} from '../bijoy';

type Ref = { unicode: string; bijoy: string; roundTrip: string };
const refs = fixture as Ref[];

describe('bijoy -> unicode (parity with the reference converter implementation)', () => {
  it('matches the reference implementation for every corpus string', () => {
    for (const row of refs) {
      expect(bijoyToUnicode(row.bijoy, { protectEnglish: false }), row.bijoy).toBe(row.roundTrip);
    }
  });

  it('converts the classic samples correctly', () => {
    expect(bijoyToUnicode('Avwg evsjvq Mvb MvB')).toBe(toCanonical('আমি বাংলায় গান গাই'));
    expect(bijoyToUnicode('‡Kvl')).toBe(toCanonical('কোষ'));
    expect(bijoyToUnicode('weÁvb')).toBe(toCanonical('বিজ্ঞান'));
    expect(bijoyToUnicode('cÖkœ')).toBe(toCanonical('প্রশ্ন'));
    expect(bijoyToUnicode('‡Kb')).toBe(toCanonical('কেন'));
    expect(bijoyToUnicode('‡M‡jv')).toBe(toCanonical('গেলো'));
    expect(bijoyToUnicode('m¤ú~Y©')).toBe(toCanonical('সম্পূর্ণ'));
    expect(bijoyToUnicode('DËi')).toBe(toCanonical('উত্তর'));
    expect(bijoyToUnicode('bvB‡Uªv‡Rb')).toBe(toCanonical('নাইট্রোজেন'));
    expect(bijoyToUnicode(unicodeToBijoy('নাইট্রোজেন'))).toBe(toCanonical('নাইট্রোজেন'));
    expect(bijoyToUnicode('10% Drcv`b †e‡o‡Q|')).toBe(toCanonical('১০% উৎপাদন বেড়েছে।'));
  });

  it('protects English and scientific tokens by default', () => {
    expect(bijoyToUnicode('DNA I RNA')).toBe(toCanonical('DNA ও RNA'));
    expect(bijoyToUnicode('ATP n‡Z ADP nq')).toBe(toCanonical('ATP হতে ADP হয়'));
    expect(bijoyToUnicode('GLb pH gvb 7.4')).toBe(toCanonical('এখন pH মান ৭.৪'));
    expect(bijoyToUnicode('GLb pH gvb 7.4', { convertDigits: false })).toBe(toCanonical('এখন pH মান 7.4'));
    expect(bijoyToUnicode('protein Gi MVb')).toBe(toCanonical('protein এর গঠন'));
    expect(bijoyToUnicode('DNA Ges RNA', { convertDigits: false })).toBe(toCanonical('DNA এবং RNA'));
  });

  it('detects Bijoy-looking text', () => {
    expect(detectScript('Avwg evsjvq Mvb MvB').script).toBe('bijoy');
    expect(detectScript('আমি বাংলায় গান গাই').script).toBe('unicode');
    expect(detectScript('The cell is the unit of life').script).toBe('english');
    expect(detectScript('protein I DNA Gi MVb')).toBeTruthy();
    expect(detectScript('The cell is the unit of life').banglaChars).toBe(0);
  });

  it('classifies English-like tokens sensibly', () => {
    expect(isEnglishLikeToken('DNA')).toBe(true);
    expect(isEnglishLikeToken('pH')).toBe(true);
    expect(isEnglishLikeToken('protein')).toBe(true);
    expect(isEnglishLikeToken('Avgvi')).toBe(false);
    expect(isEnglishLikeToken('K')).toBe(false);
    expect(isEnglishLikeToken('A')).toBe(false);
  });
});

describe('unicode -> bijoy', () => {
  it('produces the expected legacy code points', () => {
    expect(unicodeToBijoy('আমার')).toBe('Avgvi');
    expect(unicodeToBijoy('কোষ')).toBe('‡Kvl');
    expect(unicodeToBijoy('কেন')).toBe('‡Kb');
    expect(unicodeToBijoy('সম্পূর্ণ')).toBe('m¤ú~Y©');
  });

  it('round-trips every corpus string', () => {
    for (const row of refs) {
      expect(bijoyToUnicode(unicodeToBijoy(row.unicode), { protectEnglish: false })).toBe(
        row.roundTrip,
      );
    }
  });

  it('keeps English words and numbers', () => {
    expect(unicodeToBijoy('DNA এবং RNA এর গঠন')).toBe('DNA Ges RNA Gi MVb');
    expect(unicodeToBijoy('১০০% সঠিক')).toBe('100% mwVK');
  });
});

describe('live Bijoy typing reorder', () => {
  it('moves a pre-kar typed before its consonant into logical order', () => {
    expect(reorderBijoyOrderedUnicode('ে')).toBe(toCanonical('ে'));
    expect(reorderBijoyOrderedUnicode('েক')).toBe(toCanonical('কে'));
    expect(reorderBijoyOrderedUnicode('েকন')).toBe(toCanonical('কেন'));
    expect(reorderBijoyOrderedUnicode('েকৗ')).toBe(toCanonical('কৌ'));
  });
});

describe('digit helpers', () => {
  it('converts both ways', () => {
    expect(toBengaliDigits('2024')).toBe(toCanonical('২০২৪'));
    expect(toLatinDigits('২০২৪')).toBe('2024');
  });
});
