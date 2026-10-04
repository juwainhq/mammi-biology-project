import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from 'docx';
import { QuestionPaper, QuestionItem, SubQuestion } from '../model/types';
import { toBengaliNumber } from '../ocr/structureDetector';

/**
 * Converts data URL (base64) to Uint8Array buffer for docx ImageRun
 */
function dataUrlToBuffer(dataUrl: string): { buffer: Uint8Array; width: number; height: number } {
  const parts = dataUrl.split(',');
  const base64 = parts[1] || parts[0];
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return { buffer: bytes, width: 300, height: 200 };
}

/**
 * Generates an editable Microsoft Word (.docx) document from QuestionPaper model.
 * Adheres strictly to standard Bangladeshi HSC Board examination layout:
 * - Bengali font family: 'Kalpurush', 'SutonnyMJ', or 'SolaimanLipi'
 * - Proper title header block with Board/College, subject, time, full marks
 * - Instructions paragraph
 * - Sections with bold headings
 * - Creative questions with bold question number, stimulus, and aligned ক, খ, গ, ঘ with marks at right margin
 * - MCQs formatted cleanly
 * - Preserves diagrams and biological illustrations embedded in the document
 */
export async function exportPaperToDocx(paper: QuestionPaper): Promise<Blob> {
  const fontName = paper.settings.primaryFont || 'Kalpurush';
  const children: any[] = [];

  // ==================== HEADER BLOCK ====================
  // Board / College Name
  if (paper.header.boardOrCollege) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 60 },
        children: [
          new TextRun({
            text: paper.header.boardOrCollege,
            bold: true,
            size: 28, // 14pt
            font: fontName,
          }),
        ],
      })
    );
  }

  // Exam Name & Year
  const examLine = `${paper.header.examName} — ${paper.header.year}`;
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 60 },
      children: [
        new TextRun({
          text: examLine,
          bold: true,
          size: 26, // 13pt
          font: fontName,
        }),
      ],
    })
  );

  // Subject and Code
  const subjectLine = `${paper.header.subject} [বিষয় কোড: ${paper.header.subjectCode}]`;
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 120 },
      children: [
        new TextRun({
          text: subjectLine,
          bold: true,
          size: 24, // 12pt
          font: fontName,
        }),
      ],
    })
  );

  // Time and Marks Line (Two-column layout using borderless table)
  const metaTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: `সময় — ${paper.header.timeAllowed}`,
                    bold: true,
                    size: 22,
                    font: fontName,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `পূর্ণমান — ${paper.header.totalMarks}`,
                    bold: true,
                    size: 22,
                    font: fontName,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
  children.push(metaTable);

  // General Instructions
  if (paper.header.generalInstructions && paper.header.generalInstructions.length > 0) {
    for (const inst of paper.header.generalInstructions) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { before: 80, after: 80 },
          children: [
            new TextRun({
              text: `[ ${inst} ]`,
              italics: true,
              size: 20, // 10pt
              font: fontName,
            }),
          ],
        })
      );
    }
  }

  // Horizontal divider
  children.push(
    new Paragraph({
      spacing: { before: 100, after: 200 },
      border: {
        bottom: {
          color: '999999',
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
    })
  );

  // ==================== SECTIONS & QUESTIONS ====================
  for (const section of paper.sections) {
    // Section Header
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 80 },
        children: [
          new TextRun({
            text: section.title,
            bold: true,
            size: 26,
            font: fontName,
          }),
        ],
      })
    );

    if (section.subtitle) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 40, after: 160 },
          children: [
            new TextRun({
              text: section.subtitle,
              italics: true,
              size: 22,
              font: fontName,
            }),
          ],
        })
      );
    }

    // Questions in Section
    for (const q of section.questions) {
      children.push(...formatQuestionForDocx(q, fontName));
    }
  }

  // ==================== DOCUMENT CONFIG ====================
  const doc = new Document({
    creator: 'HSC Biology Question Builder',
    title: paper.title,
    description: 'Bangladeshi HSC Examination Question Paper',
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: paper.settings.margins.topMm * 56.7, // mm to twips
              bottom: paper.settings.margins.bottomMm * 56.7,
              left: paper.settings.margins.leftMm * 56.7,
              right: paper.settings.margins.rightMm * 56.7,
            },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

function formatQuestionForDocx(q: QuestionItem, fontName: string): any[] {
  const items: any[] = [];

  // Question header e.g. "১।" or "প্রশ্ন ১।"
  const qNumText = `${q.number}। `;

  // Stimulus / Stem paragraph
  const stimulusRuns: TextRun[] = [
    new TextRun({
      text: qNumText,
      bold: true,
      size: 24, // 12pt
      font: fontName,
    }),
  ];

  if (q.stimulus) {
    stimulusRuns.push(
      new TextRun({
        text: q.stimulus,
        size: 24,
        font: fontName,
      })
    );
  }

  items.push(
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 160, after: 80 },
      children: stimulusRuns,
    })
  );

  // Diagrams attached to question
  for (const diagram of q.diagrams) {
    try {
      const { buffer, width, height } = dataUrlToBuffer(diagram.dataUrl);
      const targetWidth = Math.min(diagram.width || width, 450);
      const targetHeight = Math.min(diagram.height || height, 300);

      items.push(
        new Paragraph({
          alignment:
            diagram.alignment === 'center'
              ? AlignmentType.CENTER
              : diagram.alignment === 'right'
              ? AlignmentType.RIGHT
              : AlignmentType.LEFT,
          spacing: { before: 100, after: 100 },
          children: [
            new ImageRun({
              data: buffer,
              transformation: {
                width: targetWidth,
                height: targetHeight,
              },
              type: 'png',
            }),
          ],
        })
      );

      if (diagram.caption) {
        items.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 20, after: 80 },
            children: [
              new TextRun({
                text: `চিত্র: ${diagram.caption}`,
                italics: true,
                size: 20,
                font: fontName,
              }),
            ],
          })
        );
      }
    } catch (e) {
      console.warn('Could not insert image into DOCX:', e);
    }
  }

  // Creative Sub-questions (ক, খ, গ, ঘ) with right-aligned marks
  if (q.kind === 'creative' && q.subQuestions.length > 0) {
    for (const sq of q.subQuestions) {
      items.push(formatSubQuestionTableRow(sq, fontName));
    }
  }

  // MCQ Options
  if (q.kind === 'mcq' && q.options.length > 0) {
    // 2x2 table for options
    const optRows: TableRow[] = [];
    const opts = q.options;

    // Pair options: (ক, খ) and (গ, ঘ)
    for (let i = 0; i < opts.length; i += 2) {
      const opt1 = opts[i];
      const opt2 = opts[i + 1];

      const cells: TableCell[] = [
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              spacing: { before: 40, after: 40 },
              children: [
                new TextRun({
                  text: `(${opt1.label}) `,
                  bold: true,
                  size: 22,
                  font: fontName,
                }),
                new TextRun({
                  text: opt1.text,
                  size: 22,
                  font: fontName,
                }),
              ],
            }),
          ],
        }),
      ];

      if (opt2) {
        cells.push(
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                spacing: { before: 40, after: 40 },
                children: [
                  new TextRun({
                    text: `(${opt2.label}) `,
                    bold: true,
                    size: 22,
                    font: fontName,
                  }),
                  new TextRun({
                    text: opt2.text,
                    size: 22,
                    font: fontName,
                  }),
                ],
              }),
            ],
          })
        );
      }

      optRows.push(new TableRow({ children: cells }));
    }

    items.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
          insideHorizontal: { style: BorderStyle.NONE },
          insideVertical: { style: BorderStyle.NONE },
        },
        rows: optRows,
      })
    );
  }

  return items;
}

/**
 * Format single sub-question (ক, খ, গ, ঘ) using a clean borderless 2-column table
 * to ensure marks are strictly aligned on the right margin, exactly as in Board papers.
 */
function formatSubQuestionTableRow(sq: SubQuestion, fontName: string): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 92, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                spacing: { before: 40, after: 40 },
                children: [
                  new TextRun({
                    text: `${sq.part}) `,
                    bold: true,
                    size: 22,
                    font: fontName,
                  }),
                  new TextRun({
                    text: sq.text,
                    size: 22,
                    font: fontName,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 8, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: 40, after: 40 },
                children: [
                  new TextRun({
                    text: toBengaliNumber(sq.marks),
                    bold: true,
                    size: 22,
                    font: fontName,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
