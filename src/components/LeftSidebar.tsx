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
  const totalCount = paper.sections.reduce((acc, s) => acc + s.questions.length, 0);

  return (
    <aside className="w-64 bg-surface border-r border-border flex flex-col h-full overflow-hidden select-none">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-widest text-muted font-mono font-semibold">
            Structure
          </span>
          <span className="text-[11px] font-mono text-accent">
            [{totalCount.toString().padStart(2, '0')}]
          </span>
        </div>
      </div>

      {/* Sections and Questions Hierarchy */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        {paper.sections.map((section, sIdx) => (
          <div key={section.id} className="space-y-2">
            <div className="flex items-center justify-between group px-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted truncate" title={section.title}>
                {(sIdx + 1).toString().padStart(2, '0')} · {section.title}
              </span>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 font-mono">
                <button
                  type="button"
                  onClick={() => onAddQuestion(section.id, 'creative')}
                  title="Add Creative Question (CQ)"
                  className="px-1.5 py-0.5 text-[10px] text-muted hover:text-accent hover:border-accent border border-border"
                >
                  +CQ
                </button>
                <button
                  type="button"
                  onClick={() => onAddQuestion(section.id, 'mcq')}
                  title="Add MCQ Question"
                  className="px-1.5 py-0.5 text-[10px] text-muted hover:text-accent hover:border-accent border border-border"
                >
                  +MCQ
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-1">
              {section.questions.map((q) => {
                const isActive = q.id === activeQuestionId;
                return (
                  <div
                    key={q.id}
                    className={`border transition-all ${
                      isActive
                        ? 'bg-black border-accent'
                        : 'bg-surface-subtle border-border hover:border-border-strong'
                    }`}
                  >
                    <div
                      onClick={() => onSelectQuestion(q.id)}
                      className="p-2.5 flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className={`w-1 h-3 ${
                            isActive ? 'bg-accent' : 'bg-border-strong'
                          }`}
                        />
                        <span className="font-mono text-xs font-semibold text-canvas">
                          Q{q.number}
                        </span>
                        <span className="text-[11px] text-muted truncate max-w-[90px] font-sans">
                          {q.stimulus ? q.stimulus.substring(0, 14) + '...' : ''}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteQuestion(q.id);
                        }}
                        className="text-muted hover:text-red-400 p-0.5 text-[11px] font-mono"
                        title="Delete Question"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Creative Question Sub-tree */}
                    {q.kind === 'creative' && q.subQuestions.length > 0 && (
                      <div className="px-3 pb-2 text-[11px] space-y-1 border-t border-border/50 pt-1.5 font-mono">
                        {q.subQuestions.map((sq) => (
                          <div
                            key={sq.id}
                            onClick={() => onSelectQuestion(q.id)}
                            className="flex items-center justify-between text-muted hover:text-canvas cursor-pointer py-0.5"
                          >
                            <span className="truncate">
                              {sq.part}) {sq.text ? sq.text.substring(0, 10) + '...' : 'খালি'}
                            </span>
                            <span className="text-[10px] text-accent">
                              [{sq.marks}]
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* MCQ Options */}
                    {q.kind === 'mcq' && q.options.length > 0 && (
                      <div className="px-3 pb-2 text-[11px] grid grid-cols-2 gap-1 border-t border-border/50 pt-1.5 font-mono text-muted">
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
                <div className="text-center p-4 text-[11px] font-mono text-muted border border-dashed border-border">
                  Empty section
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Add Buttons */}
      <div className="p-3 border-t border-border bg-black flex gap-2 font-mono">
        <button
          type="button"
          onClick={() => {
            const firstSec = paper.sections[0]?.id;
            if (firstSec) onAddQuestion(firstSec, 'creative');
          }}
          className="flex-1 py-1.5 text-xs text-canvas bg-surface border border-border hover:border-accent transition-colors uppercase tracking-wider"
        >
          + CQ
        </button>
        <button
          type="button"
          onClick={() => {
            const firstSec = paper.sections[0]?.id;
            if (firstSec) onAddQuestion(firstSec, 'mcq');
          }}
          className="flex-1 py-1.5 text-xs text-canvas bg-surface border border-border hover:border-accent transition-colors uppercase tracking-wider"
        >
          + MCQ
        </button>
      </div>
    </aside>
  );
};
