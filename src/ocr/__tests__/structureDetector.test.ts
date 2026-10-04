import { describe, expect, it } from 'vitest';
import { detectQuestionStructure } from '../structureDetector';

describe('detectQuestionStructure', () => {
  it('parses HSC creative question with 4 sub-questions (ক, খ, গ, ঘ)', () => {
    const rawOcr = `
১। কোষের গঠন ও কাজ জীববিজ্ঞানের অন্যতম মৌলিক বিষয়। মাইটোকন্ড্রিয়া কোষে শক্তি উৎপাদন করে।
(ক) মাইটোকন্ড্রিয়া কী? ১
(খ) কোষ প্রাচীর ও প্লাজমা মেমব্রেনের পার্থক্য লেখ। ২
(গ) উদ্দীপকের অঙ্গাণুটির চিত্র অঙ্কন কর। ৩
(ঘ) জীবদেহের শক্তি বিপাকে অঙ্গাণুটির ভূমিকা বিশ্লেষণ কর। ৪
`;
    const questions = detectQuestionStructure(rawOcr);
    expect(questions).toHaveLength(1);
    const q = questions[0];
    expect(q.number).toBe('১');
    expect(q.kind).toBe('creative');
    expect(q.subQuestions).toHaveLength(4);
    expect(q.subQuestions[0].part).toBe('ক');
    expect(q.subQuestions[0].marks).toBe(1);
    expect(q.subQuestions[1].part).toBe('খ');
    expect(q.subQuestions[1].marks).toBe(2);
    expect(q.subQuestions[2].part).toBe('গ');
    expect(q.subQuestions[2].marks).toBe(3);
    expect(q.subQuestions[3].part).toBe('ঘ');
    expect(q.subQuestions[3].marks).toBe(4);
    expect(q.totalMarks).toBe(10);
  });

  it('preserves scientific terms: DNA, RNA, ATP, CO₂, H₂O, pH', () => {
    const rawOcr = `
২। DNA থেকে RNA তৈরি হয় এবং ATP খরচ হয়। pH ৭.৪ এ কার্যক্ষম।
ক) DNA কী?
খ) CO₂ ও H₂O এর ভূমিকা লেখ।
`;
    const questions = detectQuestionStructure(rawOcr);
    expect(questions).toHaveLength(1);
    expect(questions[0].stimulus).toContain('DNA');
    expect(questions[0].stimulus).toContain('ATP');
    expect(questions[0].subQuestions[1].text).toContain('CO₂');
    expect(questions[0].subQuestions[1].text).toContain('H₂O');
  });

  it('detects MCQ questions and options', () => {
    const rawOcr = `
১। প্রোটিন তৈরির কারখানা বলা হয় কোনটিকে?
(ক) মাইটোকন্ড্রিয়া (খ) রাইবোজোম (গ) গলগি বডি (ঘ) লাইসোজোম
`;
    const questions = detectQuestionStructure(rawOcr);
    expect(questions).toHaveLength(1);
    expect(questions[0].kind).toBe('mcq');
    expect(questions[0].options.length).toBeGreaterThanOrEqual(2);
  });
});
