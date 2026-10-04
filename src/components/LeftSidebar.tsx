import React from 'react';
import { QuestionPaper } from '../model/types';

interface LeftSidebarProps {
  paper: QuestionPaper;
  activeQuestionId: string | null;
  onSelectQuestion: (questionId: string) => void;
  onAddQuestion: (sectionId: string, kind: 'creative' | 'mcq') => void;
  onDeleteQuestion: (questionId: string) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  paper,
  activeQuestionId,
  onSelectQuestion,
  onAddQuestion,
  onDeleteQuestion,
}) => {
  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden select-none">
      {/* Title Header */}
      <div className="p-3.5 border-b border-gray-200 bg-gray-50/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-emerald-700 font-bold text-sm">📑 প্রশ্ন কাঠামো</span>
          <span className="text-xs bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-mono">
            {paper.sections.reduce((acc, s) => acc + s.questions.length, 0)}
          </span>
        </div>
      </div>

      {/* Sections & Tree Hierarchy */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {paper.sections.map((section) => (
          <div key={section.id} className="space-y-1.5">
            <div className="flex items-center justify-between group px-1">
              <span className="text-xs font-bold text-gray-700 truncate" title={section.title}>
                {section.title}
              </span>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onAddQuestion(section.id, 'creative')}
                  title="নতুন সৃজনশীল প্রশ্ন যোগ করুন"
                  className="p-1 hover:bg-emerald-100 text-emerald-700 rounded text-[11px] font-medium"
                >
                  + CQ
                </button>
                <button
                  type="button"
                  onClick={() => onAddQuestion(section.id, 'mcq')}
                  title="নতুন বহুনির্বাচনি প্রশ্ন যোগ করুন"
                  className="p-1 hover:bg-blue-100 text-blue-700 rounded text-[11px] font-medium"
                >
                  + MCQ
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-1 pl-1">
              {section.questions.map((q) => {
                const isActive = q.id === activeQuestionId;
                return (
                  <div
                    key={q.id}
                    className={`rounded-lg border text-xs transition-all ${
                      isActive
                        ? 'bg-emerald-50 border-emerald-300 shadow-sm'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      onClick={() => onSelectQuestion(q.id)}
                      className="p-2 flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            q.kind === 'creative' ? 'bg-emerald-500' : 'bg-blue-500'
                          }`}
                        />
                        <span className="font-bold text-gray-900">প্রশ্ন {q.number}</span>
                        <span className="text-[10px] text-gray-500 truncate max-w-[100px]">
                          {q.stimulus ? q.stimulus.substring(0, 18) + '...' : ''}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteQuestion(q.id);
                        }}
                        className="text-gray-400 hover:text-red-500 p-1 text-[11px]"
                        title="প্রশ্নটি মুছে ফেলুন"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Sub-question tree breakdown for CQ */}
                    {q.kind === 'creative' && q.subQuestions.length > 0 && (
                      <div className="pl-6 pr-2 pb-2 text-[11px] space-y-0.5 border-t border-emerald-100/60 pt-1 text-gray-600">
                        {q.subQuestions.map((sq) => (
                          <div
                            key={sq.id}
                            onClick={() => onSelectQuestion(q.id)}
                            className="flex items-center justify-between py-0.5 px-1 hover:bg-emerald-100/40 rounded cursor-pointer"
                          >
                            <span className="font-medium">
                              ├─ {sq.part}) {sq.text ? sq.text.substring(0, 14) + '...' : 'খালি'}
                            </span>
                            <span className="text-[10px] text-emerald-800 font-mono">
                              [{sq.marks}]
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* MCQ Options preview */}
                    {q.kind === 'mcq' && q.options.length > 0 && (
                      <div className="pl-6 pr-2 pb-2 text-[11px] grid grid-cols-2 gap-0.5 border-t border-blue-100/60 pt-1 text-gray-600">
                        {q.options.map((opt) => (
                          <span key={opt.id} className="truncate">
                            {opt.label}) {opt.text}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {section.questions.length === 0 && (
                <div className="text-center p-3 text-xs text-gray-400 border border-dashed rounded-lg">
                  কোনো প্রশ্ন নেই
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Add Buttons at bottom */}
      <div className="p-3 border-t border-gray-200 bg-gray-50 flex gap-2">
        <button
          type="button"
          onClick={() => {
            const firstSec = paper.sections[0]?.id;
            if (firstSec) onAddQuestion(firstSec, 'creative');
          }}
          className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-sm transition-colors text-center"
        >
          + সৃজনশীল (CQ)
        </button>
        <button
          type="button"
          onClick={() => {
            const firstSec = paper.sections[0]?.id;
            if (firstSec) onAddQuestion(firstSec, 'mcq');
          }}
          className="flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-sm transition-colors text-center"
        >
          + বহুনির্বাচনি (MCQ)
        </button>
      </div>
    </aside>
  );
};
