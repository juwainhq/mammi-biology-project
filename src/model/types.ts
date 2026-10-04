/**
 * Core question-paper and question data model for HSC Biology Question Builder.
 *
 * Represents an HSC Biology exam paper hierarchically:
 * Paper -> Sections -> Questions (CQ or MCQ) -> Sub-questions / Options + Stimulus / Diagrams.
 */

export type SubjectType = 'biology-1st' | 'biology-2nd' | 'biology-combined';

export type QuestionKind = 'creative' | 'mcq' | 'descriptive';

export type SubQuestionPart = 'ক' | 'খ' | 'গ' | 'ঘ';

export interface ImageAttachment {
  id: string;
  dataUrl: string;
  name?: string;
  caption?: string;
  width?: number; // target display width in px
  height?: number; // target display height in px
  alignment?: 'left' | 'center' | 'right';
  originalWidth?: number;
  originalHeight?: number;
}

export interface SubQuestion {
  id: string;
  part: SubQuestionPart;
  text: string;
  marks: number;
  lowConfidence?: boolean;
}

export interface McqOption {
  id: string;
  label: 'ক' | 'খ' | 'গ' | 'ঘ';
  text: string;
  isCorrect?: boolean;
}

export interface QuestionItem {
  id: string;
  kind: QuestionKind;
  number: string; // e.g., '১', '২', '৩', '1', '2'
  title?: string;
  stimulus?: string; // উদ্দীপক (stem/scenario text)
  diagrams: ImageAttachment[];
  subQuestions: SubQuestion[]; // for creative questions (ক, খ, গ, ঘ)
  options: McqOption[]; // for MCQ questions
  totalMarks?: number;
  sourceImageId?: string;
  notes?: string;
}

export interface PaperSection {
  id: string;
  title: string; // e.g. 'ক-বিভাগ : সৃজনশীল প্রশ্ন' or 'খ-বিভাগ'
  subtitle?: string; // e.g. 'যে কোনো ৫টি প্রশ্নের উত্তর দাও'
  questions: QuestionItem[];
}

export interface PaperHeader {
  boardOrCollege: string; // e.g. "ঢাকা বোর্ড" or college name
  examName: string; // e.g. "উচ্চ মাধ্যমিক সার্টিফিকেট পরীক্ষা"
  year: string; // e.g. "২০২৪"
  subject: string; // e.g. "জীববিজ্ঞান ১ম পত্র (তত্ত্বীয়)"
  subjectCode: string; // e.g. "১৭৮"
  timeAllowed: string; // e.g. "২ ঘণ্টা ৩৫ মিনিট"
  totalMarks: string; // e.g. "৫০"
  generalInstructions: string[]; // e.g. ["প্রতিটি বিভাগ থেকে কমপক্ষে ২টি করে মোট ৫টি প্রশ্নের উত্তর দাও।"]
}

export interface QuestionPaper {
  id: string;
  version: number;
  title: string;
  header: PaperHeader;
  sections: PaperSection[];
  footerNote?: string;
  settings: PaperFormattingSettings;
  createdAt: number;
  updatedAt: number;
}

export interface PaperFormattingSettings {
  primaryFont: 'Kalpurush' | 'Noto Sans Bengali' | 'Tiro Bangla' | 'SolaimanLipi' | 'SutonnyMJ';
  fontSizePt: number;
  lineSpacing: number; // e.g. 1.25, 1.4
  paragraphSpacingPt: number; // e.g. 4, 6
  pageSize: 'A4' | 'Letter';
  margins: {
    topMm: number;
    bottomMm: number;
    leftMm: number;
    rightMm: number;
  };
  marksPlacement: 'right' | 'inline';
}

export const DEFAULT_FORMATTING: PaperFormattingSettings = {
  primaryFont: 'Kalpurush',
  fontSizePt: 12,
  lineSpacing: 1.35,
  paragraphSpacingPt: 4,
  pageSize: 'A4',
  margins: {
    topMm: 20,
    bottomMm: 20,
    leftMm: 22,
    rightMm: 22,
  },
  marksPlacement: 'right',
};

export const DEFAULT_HEADER: PaperHeader = {
  boardOrCollege: 'মাধ্যমিক ও উচ্চমাধ্যমিক শিক্ষা বোর্ড, ঢাকা',
  examName: 'উচ্চ মাধ্যমিক সার্টিফিকেট (এইচএসসি) পরীক্ষা',
  year: '২০২৪',
  subject: 'জীববিজ্ঞান প্রথম পত্র (উদ্ভিদবিজ্ঞান) — তত্ত্বীয়',
  subjectCode: '১৭৮',
  timeAllowed: '২ ঘণ্টা ৩৫ মিনিট',
  totalMarks: '৫০',
  generalInstructions: [
    'বিশেষ দ্রষ্টব্য: ডান পাশের সংখ্যা প্রশ্নের পূর্ণমান জ্ঞাপক।',
    'উদ্দীপকটি মনোযোগ সহকারে পড়ে সংশ্লিষ্ট প্রশ্নগুলোর উত্তর দাও।',
  ],
};
