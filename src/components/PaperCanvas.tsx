import React from 'react';
import {
  QuestionPaper,
  QuestionItem,
} from '../model/types';
import { toBengaliNumber } from '../ocr/structureDetector';

interface PaperCanvasProps {
  paper: QuestionPaper;
  activeQuestionId: string | null;
  onSelectQuestion: (questionId: string) => void;
  onUpdateQuestion: (question: QuestionItem) => void;
  onDeleteQuestion: (questionId: string) => void;
  onAddSubQuestion: (questionId: string) => void;
  onAddDiagram: (questionId: string) => void;
}

export const PaperCanvas: React.FC<PaperCanvasProps> = ({
  paper,
  activeQuestionId,
  onSelectQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onAddSubQuestion,
  onAddDiagram,
}) => {
  const fontClass =
    paper.settings.primaryFont === 'Noto Sans Bengali'
      ? 'font-noto'
      : paper.settings.primaryFont === 'Tiro Bangla'
      ? 'font-tiro'
      : 'font-kalpurush';

  return (
    <div className="flex-1 bg-black overflow-y-auto p-6 md:p-10 flex justify-center">
      {/* Paper Sheet Representation: Crisp white, high-contrast, strictly matching board examination reference */}
      <div
        className={`bg-[#FFFFFF] text-[#000000] shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-all ${fontClass}`}
        style={{
          width: '210mm',
          minHeight: '297mm',
          padding: `${paper.settings.margins.topMm}mm ${paper.settings.margins.rightMm}mm ${paper.settings.margins.bottomMm}mm ${paper.settings.margins.leftMm}mm`,
          fontSize: `${paper.settings.fontSizePt}pt`,
          lineHeight: paper.settings.lineSpacing,
        }}
      >
        {/* ===================== PAPER HEADER ===================== */}
        <div className="text-center pb-4 mb-5 border-b border-[#222222] select-text">
          {paper.header.boardOrCollege && (
            <h1 className="text-xl font-bold tracking-tight text-[#000000] mb-0.5">
              {paper.header.boardOrCollege}
            </h1>
          )}
          <h2 className="text-lg font-bold text-[#111111] mb-0.5">
            {paper.header.examName} — {paper.header.year}
          </h2>
          <h3 className="text-base font-bold text-[#222222] mb-2">
            {paper.header.subject} [বিষয় কোড: {paper.header.subjectCode}]
          </h3>

          {/* Time & Marks meta row */}
          <div className="flex justify-between items-center text-sm font-bold border-t border-b border-[#333333] py-1.5 px-2 my-2.5">
            <span>সময় — {paper.header.timeAllowed}</span>
            <span>পূর্ণমান — {paper.header.totalMarks}</span>
          </div>

          {/* Instructions */}
          {paper.header.generalInstructions.map((inst, i) => (
            <p key={i} className="text-xs text-[#333333] italic mt-0.5">
              [ {inst} ]
            </p>
          ))}
        </div>

        {/* ===================== SECTIONS & QUESTIONS ===================== */}
        <div className="space-y-6">
          {paper.sections.map((section) => (
            <div key={section.id} className="space-y-4">
              {/* Section Header */}
              <div className="text-center my-4">
                <span className="inline-block px-3 py-1 font-bold text-sm border-b border-[#000000]">
                  {section.title}
                </span>
                {section.subtitle && (
                  <p className="text-xs italic text-[#444444] mt-1">
                    {section.subtitle}
                  </p>
                )}
              </div>

              {/* Questions */}
              <div className="space-y-5">
                {section.questions.map((q) => {
                  const isActive = q.id === activeQuestionId;

                  return (
                    <div
                      key={q.id}
                      id={`question-node-${q.id}`}
                      onClick={() => onSelectQuestion(q.id)}
                      className={`relative p-3 transition-all group ${
                        isActive
                          ? 'outline outline-1 outline-[#F04444] bg-[#FFF1F1]'
                          : 'hover:bg-[#F9F9F9]'
                      }`}
                    >
                      {/* Floating Action Badge on active */}
                      {isActive && (
                        <div className="absolute -top-3 right-2 bg-[#000000] text-[#FAFAFA] text-[10px] px-2 py-0.5 border border-[#F04444] flex items-center gap-2 font-mono">
                          <span className="text-[#F04444] font-semibold">Q{q.number}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddDiagram(q.id);
                            }}
                            className="hover:text-[#F04444]"
                            title="চিত্র বা ডায়াগ্রাম যুক্ত করুন"
                          >
                            +Fig
                          </button>
                          {q.kind === 'creative' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddSubQuestion(q.id);
                              }}
                              className="hover:text-[#F04444]"
                              title="সাব-প্রশ্ন যুক্ত করুন"
                            >
                              +Sub
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteQuestion(q.id);
                            }}
                            className="text-[#8C8C8C] hover:text-red-400"
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      {/* Question Number & Stimulus (উদ্দীপক) */}
                      <div className="flex items-start gap-2 text-justify">
                        <span className="font-bold whitespace-nowrap">
                          {q.number}।
                        </span>
                        <div className="flex-1">
                          <textarea
                            rows={q.stimulus && q.stimulus.length > 80 ? 3 : 1}
                            value={q.stimulus || ''}
                            onChange={(e) =>
                              onUpdateQuestion({ ...q, stimulus: e.target.value })
                            }
                            placeholder="এখানে উদ্দীপক বা মূল প্রশ্নের বিবরণ লিখুন..."
                            className="w-full bg-transparent resize-y outline-none focus:bg-white focus:outline focus:outline-1 focus:outline-[#F04444] p-1 leading-relaxed"
                          />
                        </div>
                      </div>

                      {/* Attached Diagram / Illustration */}
                      {q.diagrams && q.diagrams.length > 0 && (
                        <div className="my-3 space-y-2">
                          {q.diagrams.map((diag) => (
                            <div
                              key={diag.id}
                              className={`flex flex-col items-${
                                diag.alignment === 'left'
                                  ? 'start'
                                  : diag.alignment === 'right'
                                  ? 'end'
                                  : 'center'
                              } group/diag`}
                            >
                              <div className="relative border border-[#CCCCCC] bg-white p-1 inline-block">
                                <img
                                  src={diag.dataUrl}
                                  alt={diag.caption || 'ডায়াগ্রাম'}
                                  style={{
                                    maxWidth: `${diag.width || 380}px`,
                                    maxHeight: '260px',
                                  }}
                                  className="object-contain"
                                />
                              </div>
                              {diag.caption && (
                                <p className="text-xs italic text-[#555555] mt-1">
                                  চিত্র: {diag.caption}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Creative Sub-questions (ক, খ, গ, ঘ) */}
                      {q.kind === 'creative' && q.subQuestions.length > 0 && (
                        <div className="mt-3 space-y-1.5 pl-4">
                          {q.subQuestions.map((sq, sqIdx) => (
                            <div
                              key={sq.id}
                              className="flex items-baseline justify-between gap-2 group/sq"
                            >
                              <div className="flex items-baseline gap-2 flex-1">
                                <span className="font-bold text-[#000000] whitespace-nowrap">
                                  ({sq.part})
                                </span>
                                <input
                                  type="text"
                                  value={sq.text}
                                  onChange={(e) => {
                                    const updated = [...q.subQuestions];
                                    updated[sqIdx] = { ...sq, text: e.target.value };
                                    onUpdateQuestion({ ...q, subQuestions: updated });
                                  }}
                                  className="flex-1 bg-transparent outline-none focus:outline focus:outline-1 focus:outline-[#F04444] px-1 py-0.5"
                                />
                              </div>
                              <div className="flex items-center gap-1 font-bold text-[#000000]">
                                <span className="font-mono text-sm">
                                  {toBengaliNumber(sq.marks)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* MCQ Options */}
                      {q.kind === 'mcq' && q.options.length > 0 && (
                        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 pl-4">
                          {q.options.map((opt, optIdx) => (
                            <div key={opt.id} className="flex items-baseline gap-2">
                              <span className="font-bold text-[#000000]">
                                ({opt.label})
                              </span>
                              <input
                                type="text"
                                value={opt.text}
                                onChange={(e) => {
                                  const updated = [...q.options];
                                  updated[optIdx] = { ...opt, text: e.target.value };
                                  onUpdateQuestion({ ...q, options: updated });
                                }}
                                className="flex-1 bg-transparent outline-none focus:outline focus:outline-1 focus:outline-[#F04444] px-1 py-0.5"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
