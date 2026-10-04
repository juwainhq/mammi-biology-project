import { QuestionPaper, DEFAULT_HEADER, DEFAULT_FORMATTING } from './types';

export const SAMPLE_HSC_PAPER: QuestionPaper = {
  id: 'paper-sample-1',
  version: 1,
  title: 'HSC Biology 1st Paper Model Test',
  header: DEFAULT_HEADER,
  settings: DEFAULT_FORMATTING,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  sections: [
    {
      id: 'sec-cq',
      title: 'সৃজনশীল প্রশ্ন (মান ৫০)',
      subtitle: 'যে কোনো ৫টি প্রশ্নের উত্তর দাও। প্রতিটি প্রশ্নের মান ১০।',
      questions: [
        {
          id: 'q-1',
          kind: 'creative',
          number: '১',
          stimulus:
            'জীবদেহের গাঠনিক ও কার্যকরী একক হলো কোষ। বিজ্ঞানী রবার্ট হুক ১৬৬৫ সালে কর্কের পাতলা ছেদে প্রথম কোষ আবিষ্কার করেন। উদ্ভিদকোষে ঝিল্লিবেষ্টিত অঙ্গাণু হিসেবে মাইটোকন্ড্রিয়া ও ক্লোরোপ্লাস্ট গুরুত্বপূর্ণ ভূমিকা পালন করে। অন্যদিকে, নিউক্লিয়াসে অবস্থিত ক্রোমোজোমে জীবের বংশগতির মূল ভিত্তি DNA বিদ্যমান।',
          diagrams: [],
          totalMarks: 10,
          subQuestions: [
            {
              id: 'sq-1-a',
              part: 'ক',
              text: 'কোষ প্রাচীরের প্রধান গাঠনিক উপাদান কী?',
              marks: 1,
            },
            {
              id: 'sq-1-b',
              part: 'খ',
              text: 'মাইটোকন্ড্রিয়াকে কোষের শক্তিঘর বলা হয় কেন?',
              marks: 2,
            },
            {
              id: 'sq-1-c',
              part: 'গ',
              text: 'উদ্দীপকে উল্লিখিত দ্বৈত-ঝিল্লিবদ্ধ অঙ্গাণুটির চিহ্নিত চিত্রসহ গঠন ব্যাখ্যা কর।',
              marks: 3,
            },
            {
              id: 'sq-1-d',
              part: 'ঘ',
              text: 'জীবের অস্তিত্ব রক্ষায় উদ্দীপকের বংশগতীয় উপাদানটির ভূমিকা বিশ্লেষণ কর।',
              marks: 4,
            },
          ],
          options: [],
        },
        {
          id: 'q-2',
          kind: 'creative',
          number: '২',
          stimulus:
            'উচ্চশ্রেণীর উদ্ভিদের মূল ও কাণ্ডের অগ্রভাগে এক বিশেষ ধরণের বিভাজন দেখা যায়। অন্যদিকে জনন মাতৃকোষে ক্রোমোজোম সংখ্যার হ্রাস ঘটিয়ে নতুন বৈচিত্র্যের সৃষ্টি হয়। ক্রসিং ওভারের মাধ্যমে জিনের নতুন সমাবেশ ঘটে।',
          diagrams: [],
          totalMarks: 10,
          subQuestions: [
            {
              id: 'sq-2-a',
              part: 'ক',
              text: 'কায়াজমা কী?',
              marks: 1,
            },
            {
              id: 'sq-2-b',
              part: 'খ',
              text: 'অ্যামাইটোসিসকে প্রত্যক্ষ কোষ বিভাজন বলা হয় কেন?',
              marks: 2,
            },
            {
              id: 'sq-2-c',
              part: 'গ',
              text: 'উদ্দীপকের দ্বিতীয় প্রকার কোষ বিভাজনের প্রফেজ-১ এর প্যাকাইটিন উপপর্যায় বর্ণনা কর।',
              marks: 3,
            },
            {
              id: 'sq-2-d',
              part: 'ঘ',
              text: 'জীবের বৈচিত্র্য সৃষ্টিতে উল্লিখিত দ্বিতীয় বিভাজনের গুরুত্ব উদ্দীপকের আলোকে বিশ্লেষণ কর।',
              marks: 4,
            },
          ],
          options: [],
        },
      ],
    },
    {
      id: 'sec-mcq',
      title: 'বহুনির্বাচনি প্রশ্ন (নমুনা)',
      subtitle: 'সঠিক উত্তরের পাশে টিকচিহ্ন দাও।',
      questions: [
        {
          id: 'q-mcq-1',
          kind: 'mcq',
          number: '১',
          stimulus: 'কোষের প্রোটিন তৈরির কারখানা বলা হয় কোনটিকে?',
          diagrams: [],
          subQuestions: [],
          options: [
            { id: 'opt-1-1', label: 'ক', text: 'মাইটোকন্ড্রিয়া' },
            { id: 'opt-1-2', label: 'খ', text: 'রাইবোজোম', isCorrect: true },
            { id: 'opt-1-3', label: 'গ', text: 'লাইসোজোম' },
            { id: 'opt-1-4', label: 'ঘ', text: 'গলগি বস্তু' },
          ],
          totalMarks: 1,
        },
        {
          id: 'q-mcq-2',
          kind: 'mcq',
          number: '২',
          stimulus: 'শালোকসংশ্লেষণ প্রক্রিয়ায় আলোক শক্তি কোন শক্তিতে রূপান্তরিত হয়?',
          diagrams: [],
          subQuestions: [],
          options: [
            { id: 'opt-2-1', label: 'ক', text: 'তাপ শক্তিতে' },
            { id: 'opt-2-2', label: 'খ', text: 'রাসায়নিক শক্তিতে', isCorrect: true },
            { id: 'opt-2-3', label: 'গ', text: 'গতি শক্তিতে' },
            { id: 'opt-2-4', label: 'ঘ', text: 'চৌম্বক শক্তিতে' },
          ],
          totalMarks: 1,
        },
      ],
    },
  ],
};
