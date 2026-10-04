import {
  QuestionItem,
  SubQuestion,
  SubQuestionPart,
} from '../model/types';
import { toCanonical } from '../bangla/bijoy';

/**
 * Parses raw OCR text into structured HSC Biology questions.
 * Handles:
 * - Bengali question numbers: ১।, ২।, ৩।, ৪।, ১., ২.
 * - Sub-question parts: (ক), ক), ক., [ক]
 * - Standard 4-part HSC CQ structure: ক (1 mark), খ (2 marks), গ (3 marks), ঘ (4 marks)
 * - MCQ options: (ক) / (খ) / (গ) / (ঘ) or a) / b) / c) / d)
 * - Preserves scientific notation (DNA, RNA, ATP, CO₂, H₂O, pH, %)
 */

const BENGALI_DIGITS = '০১২৩৪৫৬৭৮৯';

export function normalizeBengaliDigits(str: string): string {
  let res = '';
  for (const char of str) {
    const idx = BENGALI_DIGITS.indexOf(char);
    if (idx !== -1) {
      res += idx.toString();
    } else {
      res += char;
    }
  }
  return res;
}

export function toBengaliNumber(num: number | string): string {
  const str = num.toString();
  let res = '';
  for (const char of str) {
    if (char >= '0' && char <= '9') {
      res += BENGALI_DIGITS[parseInt(char, 10)];
    } else {
      res += char;
    }
  }
  return res;
}

// Regex patterns for matching question headers and sub-questions
// Matches: ১।, ২।, ১., 1., 1)
const QUESTION_NUM_REGEX = /^(?:[০-৯]+|[0-9]+)\s*[।\.\)]\s*/;

// Matches sub-question labels: ক), (ক), ক., ক:, (a), a)
const SUB_QUESTION_REGEX = /^[\(\[\{]?([কখগঘabcdABCD])[\)\]\}\.:\-—]\s*(.*)$/;

// Matches MCQ pattern like: (ক) অপশন (খ) অপশন
const MCQ_INLINE_REGEX = /[\(\[\{]?([কখগঘabcdABCD])[\)\]\}\.:\-—]\s+([^\(\[\{]+)/g;

export function detectQuestionStructure(rawOcrText: string): QuestionItem[] {
  const cleanText = toCanonical(rawOcrText);
  const lines = cleanText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const questions: QuestionItem[] = [];
  let currentQuestion: QuestionItem | null = null;
  let currentSubQuestion: SubQuestion | null = null;
  let questionCounter = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line starts a new main question (e.g., ১।, ২।, 3.)
    const qNumMatch = line.match(QUESTION_NUM_REGEX);

    // Also check if line contains an explicit sub-question marker
    const subMatch = line.match(SUB_QUESTION_REGEX);

    if (qNumMatch && !subMatch) {
      // Finalize previous question if any
      if (currentQuestion) {
        questions.push(currentQuestion);
      }

      const matchedPrefix = qNumMatch[0];
      const rawNum = matchedPrefix.replace(/[।\.\)\s]/g, '');
      const remainder = line.substring(matchedPrefix.length).trim();

      currentQuestion = {
        id: `detected-q-${Date.now()}-${questionCounter}`,
        kind: 'creative',
        number: rawNum,
        stimulus: remainder,
        diagrams: [],
        subQuestions: [],
        options: [],
        totalMarks: 10,
      };
      currentSubQuestion = null;
      questionCounter++;
      continue;
    }

    // Check first if line looks like an inline MCQ options row e.g. (ক) ... (খ) ...
    const inlineMatches = Array.from(line.matchAll(MCQ_INLINE_REGEX));
    if (inlineMatches.length >= 2) {
      if (!currentQuestion) {
        currentQuestion = {
          id: `detected-q-${Date.now()}-${questionCounter}`,
          kind: 'mcq',
          number: toBengaliNumber(questionCounter),
          stimulus: '',
          diagrams: [],
          subQuestions: [],
          options: [],
          totalMarks: 1,
        };
        questionCounter++;
      } else {
        currentQuestion.kind = 'mcq';
        currentQuestion.totalMarks = 1;
      }

      for (const m of inlineMatches) {
        const lbl = m[1];
        let mappedLbl: 'ক' | 'খ' | 'গ' | 'ঘ' = 'ক';
        if (lbl === 'খ' || lbl.toLowerCase() === 'b') mappedLbl = 'খ';
        else if (lbl === 'গ' || lbl.toLowerCase() === 'c') mappedLbl = 'গ';
        else if (lbl === 'ঘ' || lbl.toLowerCase() === 'd') mappedLbl = 'ঘ';

        currentQuestion.options.push({
          id: `opt-${Date.now()}-${currentQuestion.options.length + 1}`,
          label: mappedLbl,
          text: m[2].trim(),
        });
      }
      continue;
    }

    // Check for single sub-question (ক, খ, গ, ঘ)
    if (subMatch) {
      const rawPart = subMatch[1];
      const partText = subMatch[2].trim();

      // Map a,b,c,d to ক,খ,গ,ঘ if necessary
      let mappedPart: SubQuestionPart = 'ক';
      if (rawPart === 'ক' || rawPart.toLowerCase() === 'a') mappedPart = 'ক';
      else if (rawPart === 'খ' || rawPart.toLowerCase() === 'b') mappedPart = 'খ';
      else if (rawPart === 'গ' || rawPart.toLowerCase() === 'c') mappedPart = 'গ';
      else if (rawPart === 'ঘ' || rawPart.toLowerCase() === 'd') mappedPart = 'ঘ';

      // Default marks standard for HSC CQ: ক=1, খ=2, গ=3, ঘ=4
      let standardMarks = 1;
      if (mappedPart === 'খ') standardMarks = 2;
      else if (mappedPart === 'গ') standardMarks = 3;
      else if (mappedPart === 'ঘ') standardMarks = 4;

      // Check if text has marks indicated at end e.g. [১], (২), ১, 4
      const marksMatch = partText.match(/[\(\[\{]?([১-৪1-4])[\)\]\}]?\s*$/);
      let parsedMarks = standardMarks;
      let cleanedText = partText;

      if (marksMatch) {
        const markDigit = marksMatch[1];
        parsedMarks = parseInt(normalizeBengaliDigits(markDigit), 10) || standardMarks;
        cleanedText = partText.substring(0, marksMatch.index).trim();
      }

      if (!currentQuestion) {
        // Automatically start question 1 if missing header
        currentQuestion = {
          id: `detected-q-${Date.now()}-${questionCounter}`,
          kind: 'creative',
          number: toBengaliNumber(questionCounter),
          stimulus: '',
          diagrams: [],
          subQuestions: [],
          options: [],
          totalMarks: 10,
        };
        questionCounter++;
      }

      currentSubQuestion = {
        id: `detected-sq-${Date.now()}-${currentQuestion.subQuestions.length + 1}`,
        part: mappedPart,
        text: cleanedText,
        marks: parsedMarks,
      };
      currentQuestion.subQuestions.push(currentSubQuestion);
      continue;
    }

    // Otherwise, append to existing stimulus or subquestion text
    if (currentSubQuestion) {
      currentSubQuestion.text += (currentSubQuestion.text ? ' ' : '') + line;
    } else if (currentQuestion) {
      currentQuestion.stimulus =
        (currentQuestion.stimulus ? currentQuestion.stimulus + '\n' : '') + line;
    } else {
      // First lines before any question marker: likely stimulus or general text
      currentQuestion = {
        id: `detected-q-${Date.now()}-${questionCounter}`,
        kind: 'creative',
        number: toBengaliNumber(questionCounter),
        stimulus: line,
        diagrams: [],
        subQuestions: [],
        options: [],
        totalMarks: 10,
      };
      questionCounter++;
    }
  }

  if (currentQuestion) {
    questions.push(currentQuestion);
  }

  // If parsed question has subquestions, ensure CQ kind and 10 marks
  for (const q of questions) {
    if (q.subQuestions.length > 0) {
      q.kind = 'creative';
      q.totalMarks =
        q.subQuestions.reduce(
          (acc: number, sq: SubQuestion) => acc + (sq.marks || 0),
          0
        ) || 10;
    }
  }

  return questions;
}
