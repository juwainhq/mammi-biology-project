/*
 * Bangla text utilities: Bijoy (SutonnyMJ / ANSI) <-> Unicode conversion, script detection and
 * Unicode normalisation helpers.
 *
 * The conversion tables (./bijoyTables.ts) and the re-ordering algorithm below are a TypeScript
 * port of the long-standing open-source "Bangla Converter" by S. M. Mahbub Murshed, maintained and
 * published by Woliul Hasan (https://github.com/hmwoliul/bangla-converter, Apache-2.0).
 * See NOTICE for attribution. It is a real encoding conversion — never a font switch.
 */

import {
  BIJOY_KEYBOARD_TABLE,
  BIJOY_TO_UNICODE_TABLE,
  UNICODE_TO_BIJOY_TABLE,
} from './bijoyTables';

/* ------------------------------------------------------------------ *
 * Character classes (Bengali block)
 * ------------------------------------------------------------------ */

const PRE_KAR = new Set(['ি', 'ৈ', 'ে']);
const POST_KAR = new Set(['া', 'ো', 'ৌ', 'ৗ', 'ু', 'ূ', 'ী', 'ৃ']);
const BANJONBORNO = new Set(
  'কখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমশষসহযরলয়ৎংঃঁ'.split(''),
);
const HASANT = '\u09CD';

export const isBanglaPreKar = (c: string): boolean => PRE_KAR.has(c);
export const isBanglaPostKar = (c: string): boolean => POST_KAR.has(c);
export const isBanglaKar = (c: string): boolean => PRE_KAR.has(c) || POST_KAR.has(c);
export const isBanglaBanjonborno = (c: string): boolean => BANJONBORNO.has(c);
export const isBanglaHalant = (c: string): boolean => c === HASANT;

const isSpace = (c: string): boolean => c === ' ' || c === '\t' || c === '\n' || c === '\r';

/** True when the codepoint belongs to the Bengali Unicode block (or is a Bengali digit/punct). */
export function isBanglaCodePoint(cp: number): boolean {
  return cp >= 0x0980 && cp <= 0x09ff;
}

export function hasBangla(text: string): boolean {
  for (const ch of text) {
    if (isBanglaCodePoint(ch.codePointAt(0) as number)) return true;
  }
  return false;
}

export function countBangla(text: string): number {
  let n = 0;
  for (const ch of text) if (isBanglaCodePoint(ch.codePointAt(0) as number)) n++;
  return n;
}

/* ------------------------------------------------------------------ *
 * Unicode normalisation
 *
 * Unicode's canonical composition explicitly *excludes* the Bengali nukta
 * forms, so NFC turns য় into য + ় (U+09AF U+09BC). Both spellings occur in
 * the wild (and in OCR output), so every entry point normalises explicitly.
 * ------------------------------------------------------------------ */

/**
 * Canonical form used everywhere inside the app: NFC-normalised, plus the Bengali nukta letters
 * (য় ড় ঢ়) kept as single precomposed codepoints. Unicode's canonical composition excludes those
 * three letters, so plain NFC would rewrite them as য+় / ড+় / ঢ+়; the precomposed spelling is what
 * Bengali keyboards (Avro/Bijoy), Microsoft Word and Bangladeshi publishers emit, and it renders
 * without ambiguity in every Bangla font, so we settle on it as the app-wide normal form.
 */
export const toCanonical = (text: string): string => composeNukta(text.normalize('NFC'));

/** Composed form where য়/ড়/ঢ় are single codepoints — required for table lookups. */
export function composeNukta(text: string): string {
  return text
    .replace(/\u09AF\u09BC/g, '\u09DF') // য়
    .replace(/\u09A1\u09BC/g, '\u09DC') // ড়
    .replace(/\u09A2\u09BC/g, '\u09DD'); // ঢ়
}

/* ------------------------------------------------------------------ *
 * Table lookups
 * ------------------------------------------------------------------ */

type Pair = readonly [string, string];

/*
 * IMPORTANT: the tables must be applied in their original map order, not sorted by length.
 * The classic tables rely on ordering (e.g. the Unicode→Bijoy map rewrites a right double quote
 * before any entry can introduce one), so sorting changes results.
 */
const BIJOY_TO_UNICODE_ORDERED = BIJOY_TO_UNICODE_TABLE;
const UNICODE_TO_BIJOY_ORDERED = UNICODE_TO_BIJOY_TABLE;

const replaceAll = (text: string, needle: string, value: string): string =>
  text.split(needle).join(value);

const applyTable = (text: string, table: ReadonlyArray<Pair>): string => {
  let out = text;
  for (const [from, to] of table) {
    if (from.length > 0 && out.includes(from)) out = replaceAll(out, from, to);
  }
  return out;
};

/* ------------------------------------------------------------------ *
 * Re-ordering: Bijoy byte order -> Unicode logical order
 * ------------------------------------------------------------------ */

/** Port of ReArrangeUnicodeConvertedText(). */
export function rearrangeUnicodeConvertedText(input: string): string {
  let str = input;
  for (let i = 0; i < str.length; i++) {
    if (
      i > 0 &&
      str.charAt(i) === HASANT &&
      (isBanglaKar(str.charAt(i - 1)) || ['ং', 'ঃ', 'ঁ'].includes(str.charAt(i - 1))) &&
      i < str.length - 1
    ) {
      const temp =
        str.substring(0, i - 1) +
        str.charAt(i) +
        str.charAt(i + 1) +
        str.charAt(i - 1) +
        str.substring(i + 2);
      str = temp;
    }
    if (
      i > 0 &&
      i < str.length - 1 &&
      str.charAt(i) === HASANT &&
      str.charAt(i - 1) === 'র' &&
      str.charAt(i - 2) !== HASANT &&
      isBanglaKar(str.charAt(i + 1))
    ) {
      const temp =
        str.substring(0, i - 1) +
        str.charAt(i + 1) +
        str.charAt(i - 1) +
        str.charAt(i) +
        str.substring(i + 2);
      str = temp;
    }
    if (
      i < str.length - 1 &&
      str.charAt(i) === 'র' &&
      isBanglaHalant(str.charAt(i + 1)) &&
      !isBanglaHalant(str.charAt(i - 1))
    ) {
      let j = 1;
      for (;;) {
        if (i - j < 0) break;
        if (isBanglaBanjonborno(str.charAt(i - j)) && isBanglaHalant(str.charAt(i - j - 1))) j += 2;
        else if (j === 1 && isBanglaKar(str.charAt(i - j))) j++;
        else break;
      }
      const temp =
        str.substring(0, i - j) +
        str.charAt(i) +
        str.charAt(i + 1) +
        str.substring(i - j, i) +
        str.substring(i + 2);
      str = temp;
      i += 1;
      continue;
    }
    if (i < str.length - 1 && isBanglaPreKar(str.charAt(i)) && !isSpace(str.charAt(i + 1))) {
      let head = str.substring(0, i);
      let j = 1;
      while (isBanglaBanjonborno(str.charAt(i + j))) {
        if (isBanglaHalant(str.charAt(i + j + 1))) j += 2;
        else break;
      }
      head += str.substring(i + 1, i + j + 1);
      let l = 0;
      if (str.charAt(i) === 'ে' && str.charAt(i + j + 1) === 'া') {
        head += 'ো';
        l = 1;
      } else if (str.charAt(i) === 'ে' && str.charAt(i + j + 1) === 'ৗ') {
        head += 'ৌ';
        l = 1;
      } else {
        head += str.charAt(i);
      }
      head += str.substring(i + j + l + 1);
      str = head;
      i += j;
    }
    if (i < str.length - 1 && str.charAt(i) === 'ঁ' && isBanglaPostKar(str.charAt(i + 1))) {
      const temp =
        str.substring(0, i) + str.charAt(i + 1) + str.charAt(i) + str.substring(i + 2);
      str = temp;
    }
  }
  return str;
}

/* ------------------------------------------------------------------ *
 * Re-ordering: Unicode logical order -> Bijoy byte order
 * ------------------------------------------------------------------ */

/** Port of ReArrangeUnicodeText(). */
export function rearrangeUnicodeText(input: string): string {
  let str = input;
  let barrier = 0;
  for (let i = 0; i < str.length; i++) {
    if (i < str.length && isBanglaPreKar(str.charAt(i))) {
      let j = 1;
      while (isBanglaBanjonborno(str.charAt(i - j))) {
        if (i - j < 0) break;
        if (i - j <= barrier) break;
        if (isBanglaHalant(str.charAt(i - j - 1))) j += 2;
        else break;
      }
      const temp =
        str.substring(0, i - j) + str.charAt(i) + str.substring(i - j, i) + str.substring(i + 1);
      str = temp;
      barrier = i + 1;
      continue;
    }
    if (
      i < str.length - 1 &&
      isBanglaHalant(str.charAt(i)) &&
      str.charAt(i - 1) === 'র' &&
      !isBanglaHalant(str.charAt(i - 2))
    ) {
      let j = 1;
      let foundPreKar = 0;
      for (;;) {
        if (isBanglaBanjonborno(str.charAt(i + j)) && isBanglaHalant(str.charAt(i + j + 1))) j += 2;
        else if (isBanglaBanjonborno(str.charAt(i + j)) && isBanglaPreKar(str.charAt(i + j + 1))) {
          foundPreKar = 1;
          break;
        } else break;
      }
      const temp =
        str.substring(0, i - 1) +
        str.substring(i + j + 1, i + j + foundPreKar + 1) +
        str.substring(i + 1, i + j + 1) +
        str.charAt(i - 1) +
        str.charAt(i) +
        str.substring(i + j + foundPreKar + 1);
      str = temp;
      i += j + foundPreKar;
      barrier = i + 1;
      continue;
    }
  }
  return str;
}

/* ------------------------------------------------------------------ *
 * Public conversion API
 * ------------------------------------------------------------------ */

export interface ConvertOptions {
  /**
   * Keep clearly-English / scientific tokens (DNA, RNA, ATP, pH, MCQ, protein, ...) untouched.
   * Bijoy text stores Bangla glyphs in Latin code points, so a Latin-only token is ambiguous; when
   * this is enabled (the default) tokens that look like English or scientific terminology are
   * preserved. Turning it off reproduces the classic converter byte-for-byte.
   */
  protectEnglish?: boolean;
  /** Extra exact tokens to keep as-is (case-insensitive). */
  keepTokens?: string[];
  /** Convert ASCII digits to Bengali digits (the legacy Bijoy behaviour). Default true. */
  convertDigits?: boolean;
}

/** Acronyms / formulas that must never be mangled. */
const ACRONYMS = [
  'DNA', 'RNA', 'ATP', 'ADP', 'AMP', 'NAD', 'NADP', 'FAD', 'MRNA', 'TRNA', 'RRNA',
  'PH', 'HSC', 'SSC', 'MCQ', 'CQ', 'COVID', 'HIV', 'AIDS', 'ECG', 'MRI', 'CT', 'II', 'III',
];

/** Common English / scientific words that occur inside Bangla HSC Biology questions. */
const ENGLISH_WORDS = [
  'a', 'an', 'the', 'and', 'or', 'of', 'in', 'on', 'to', 'for', 'with', 'without', 'from', 'by',
  'cell', 'cells', 'tissue', 'organ', 'nucleus', 'cytoplasm', 'membrane', 'mitochondria',
  'ribosome', 'chloroplast', 'chromosome', 'gene', 'genes', 'genetic', 'protein', 'proteins',
  'enzyme', 'enzymes', 'hormone', 'hormones', 'blood', 'plasma', 'serum', 'neuron', 'nerve',
  'heart', 'lung', 'lungs', 'kidney', 'liver', 'stomach', 'intestine', 'muscle', 'bone', 'brain',
  'plant', 'plants', 'animal', 'animals', 'bacteria', 'virus', 'fungus', 'protozoa', 'insect',
  'photosynthesis', 'respiration', 'transpiration', 'diffusion', 'osmosis', 'mitosis', 'meiosis',
  'energy', 'water', 'oxygen', 'carbon', 'hydrogen', 'nitrogen', 'calcium', 'iron', 'iodine',
  'acid', 'base', 'salt', 'vitamin', 'mineral', 'carbohydrate', 'lipid', 'glucose', 'sucrose',
  'starch', 'glycogen', 'antibody', 'antigen', 'vaccine', 'immunity', 'digestion', 'excretion',
  'secretion', 'circulation', 'reproduction', 'fertilisation', 'fertilization', 'embryo',
  'species', 'genus', 'family', 'order', 'class', 'phylum', 'kingdom', 'taxonomy', 'ecology',
  'ecosystem', 'biome', 'population', 'community', 'habitat', 'niche', 'pollution', 'biodiversity',
  'diagram', 'figure', 'table', 'graph', 'chart', 'example', 'answer', 'question', 'marks',
];

const ACRONYM_SET = new Set(ACRONYMS);
const WORD_SET = new Set(ENGLISH_WORDS);
const asciiLetters = (token: string): string => token.replace(/[^A-Za-z]/g, '');

/** Does this token look like English / a scientific term rather than a Bijoy glyph sequence? */
export function isEnglishLikeToken(token: string, extraKeep?: Set<string>): boolean {
  if (!token || !/^[A-Za-z][A-Za-z0-9%]*$/.test(token)) return false;
  const letters = asciiLetters(token);
  if (!letters) return false;
  // A single letter is hopelessly ambiguous (Bijoy: K=ক, A=অ, I=ও): treat it as Bijoy unless the
  // caller explicitly whitelisted it.
  if (token.length === 1 && !extraKeep?.has(token.toLowerCase())) return false;
  const lower = token.toLowerCase();
  if (extraKeep?.has(lower)) return true;
  if (ACRONYM_SET.has(token.toUpperCase()) && token.length <= 6) return true;
  // ALL-CAPS acronym with a vowel (DNA, RNA, ATP, MCQ, HSC)
  if (/^[A-Z0-9]+$/.test(token) && token.length >= 2 && token.length <= 6 && /[AEIOUY]/.test(letters)) {
    return true;
  }
  if (token.length >= 2 && WORD_SET.has(lower)) return true;
  return false;
}

/** Candidate Latin tokens inside legacy text (protected when they look like English). */
const LATIN_TOKEN = /[A-Za-z][A-Za-z0-9%]*/g;

/**
 * Convert legacy Bijoy (SutonnyMJ / ANSI) text to Unicode Bangla.
 * The result is always NFC-normalised Unicode — the canonical internal representation.
 */
export function bijoyToUnicode(input: string, options: ConvertOptions = {}): string {
  const { protectEnglish = true, keepTokens = [], convertDigits = true } = options;
  if (!input) return '';
  const keep = new Set(keepTokens.map((t) => t.toLowerCase()));

  const convertChunk = (chunk: string): string => {
    if (!chunk) return '';
    let line = composeNukta(chunk);
    line = applyTable(line, BIJOY_TO_UNICODE_ORDERED);
    line = rearrangeUnicodeConvertedText(line);
    line = replaceAll(line, 'অা', 'আ');
    return line;
  };

  if (!protectEnglish) return toCanonical(convertChunk(input));

  // Walk the string; flush a "to be converted" chunk whenever a protected token is found so that
  // re-ordering still sees the full surrounding context of the legacy text.
  let out = '';
  let chunkStart = 0;
  const flush = (end: number): void => {
    if (end > chunkStart) out += convertChunk(input.slice(chunkStart, end));
    chunkStart = end;
  };
  const pattern = convertDigits ? LATIN_TOKEN : /[0-9A-Za-z][A-Za-z0-9%]*/g;
  pattern.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(input)) !== null) {
    const token = match[0];
    const protectedToken = convertDigits
      ? isEnglishLikeToken(token, keep)
      : /^[0-9]+$/.test(token) || isEnglishLikeToken(token, keep);
    if (protectedToken) {
      flush(match.index);
      out += token;
      chunkStart = match.index + token.length;
    }
  }
  flush(input.length);
  return toCanonical(out);
}

/**
 * Convert Unicode Bangla text to legacy Bijoy (SutonnyMJ / ANSI) code points.
 * English words, numbers and scientific notation pass through untouched.
 */
export function unicodeToBijoy(input: string): string {
  if (!input) return '';
  let line = composeNukta(toCanonical(input));
  line = replaceAll(line, 'ো', 'ো');
  line = replaceAll(line, 'ৌ', 'ৌ');
  line = rearrangeUnicodeText(line);
  line = applyTable(line, UNICODE_TO_BIJOY_ORDERED);
  return line;
}

/* ------------------------------------------------------------------ *
 * Detection: is a piece of text (probably) Bijoy or Unicode?
 * ------------------------------------------------------------------ */

const BIJOY_HIGH_ANSI = /[\u0080-\u00ff]/;
/** Characters/sequences that are essentially only produced by legacy Bijoy encoding. */
const BIJOY_MARKER_CHARS = ['‡', '†', '‰', '©', 'ª', '¨', '«', '¶', '·', '„', '…', 'ÿ', 'ÿ'];
const BIJOY_MARKER_SEQUENCES = [
  'Av', 'qv', 'Zv', 'ev', 'wK', 'Kv', 'gv', 'bv', 'Rv', 'Mv', 'nj', 'Zj', 'Ges', 'GK', 'Avgv',
  '†`', 'cÖ', 'c«', 'm¤', 'weÁ', 'Dr', 'DË', 'Aby', '‡K', '‡g', '†m', 'kg', 'Áv', 'Uª', '·', '¤',
];

export interface ScriptGuess {
  script: 'unicode' | 'bijoy' | 'english' | 'unknown';
  /** 0..1 — how confident the heuristic is. */
  confidence: number;
  banglaChars: number;
  latinChars: number;
}

/**
 * Heuristic script detection, used to pick a default direction in the converter and to warn when
 * pasted text still looks like legacy encoding. It is never used to destroy text: conversion is
 * always an explicit, undoable action.
 */
export function detectScript(text: string): ScriptGuess {
  const sample = text.slice(0, 4000);
  let banglaChars = 0;
  let latinChars = 0;
  let highAnsi = 0;
  let bengaliDigits = 0;
  for (const ch of sample) {
    const cp = ch.codePointAt(0) as number;
    if (isBanglaCodePoint(cp)) {
      banglaChars++;
      if (cp >= 0x09e6 && cp <= 0x09ef) bengaliDigits++;
    } else if (/[A-Za-z]/.test(ch)) {
      latinChars++;
    } else if (cp >= 0x80 && cp <= 0xff && ch !== '«' && ch !== '»' && ch !== '¼' && ch !== '½' && ch !== '¾' && ch !== '¿' && ch !== 'Þ' && ch !== 'Ü') {
      // High ANSI code points are the signature of legacy encoding (the font moved Bangla glyphs
      // into the 0x80–0xFF range). A few of them are common in ordinary Latin text, so skip those.
      highAnsi++;
    }
  }
  if (banglaChars > 0) {
    return { script: 'unicode', confidence: Math.min(1, 0.5 + banglaChars / Math.max(20, banglaChars + latinChars)), banglaChars, latinChars };
  }
  if (bengaliDigits > 0) {
    return { script: 'unicode', confidence: 0.5, banglaChars, latinChars };
  }
  if (highAnsi > 0) {
    return { script: 'bijoy', confidence: 0.95, banglaChars, latinChars };
  }
  let markers = 0;
  for (const ch of BIJOY_MARKER_CHARS) if (text.includes(ch)) markers += 3;
  for (const seq of BIJOY_MARKER_SEQUENCES) if (text.includes(seq)) markers += 1;
  if (!BIJOY_HIGH_ANSI.test(sample) && markers === 0) {
    return latinChars === 0
      ? { script: 'unknown', confidence: 0.1, banglaChars, latinChars }
      : { script: 'english', confidence: 0.7, banglaChars, latinChars };
  }
  if (markers >= 2) return { script: 'bijoy', confidence: Math.min(0.9, 0.5 + markers / 10), banglaChars, latinChars };
  return latinChars > 0
    ? { script: 'english', confidence: 0.5, banglaChars, latinChars }
    : { script: 'unknown', confidence: 0.2, banglaChars, latinChars };
}

export const looksLikeBijoy = (text: string): boolean => detectScript(text).script === 'bijoy';

/* ------------------------------------------------------------------ *
 * Bijoy Classic keyboard -> Unicode (live "Bijoy mode" typing)
 * ------------------------------------------------------------------ */

const BIJOY_KEYBOARD = new Map(BIJOY_KEYBOARD_TABLE.map(([k, v]) => [k, v]));

/** Map a single physical keystroke (Bijoy Classic layout) to its Unicode character. */
export function bijoyKeyToUnicode(key: string): string | null {
  const mapped = BIJOY_KEYBOARD.get(key);
  return mapped ?? null;
}

export const BIJOY_KEYBOARD_ENTRIES: ReadonlyArray<readonly [string, string]> = BIJOY_KEYBOARD_TABLE;

/**
 * Re-order Bangla text that was typed in Bijoy order (pre-kar typed before its consonant) into
 * logical Unicode order. Used by the live Bijoy input mode: after each keystroke the current
 * paragraph is passed through this function.
 */
export function reorderBijoyOrderedUnicode(text: string): string {
  return rearrangeUnicodeConvertedText(composeNukta(text));
}

/** Bengali digits ০-৯ for a Latin number string. */
export function toBengaliDigits(value: string | number): string {
  const digits = '০১২৩৪৫৬৭৮৯';
  return String(value).replace(/[0-9]/g, (d) => digits[Number(d)]);
}

/** Latin digits for a Bengali-number string. */
export function toLatinDigits(value: string | number): string {
  return String(value).replace(/[০-৯]/g, (d) => String(d.charCodeAt(0) - 0x09e6));
}
