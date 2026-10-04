import React from 'react';
import {
  QuestionPaper,
  QuestionItem,
  PaperFormattingSettings,
} from '../model/types';

interface RightSidebarProps {
  paper: QuestionPaper;
  activeQuestion: QuestionItem | null;
  onUpdateSettings: (settings: Partial<PaperFormattingSettings>) => void;
  onUpdateHeader: (key: string, value: any) => void;
  onUpdateQuestion: (question: QuestionItem) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  paper,
  activeQuestion,
  onUpdateSettings,
  onUpdateHeader,
  onUpdateQuestion,
}) => {
  const settings = paper.settings;

  return (
    <aside className="w-80 bg-surface border-l border-border flex flex-col h-full overflow-y-auto select-none text-xs font-mono">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-widest text-muted font-semibold">
          Properties & Settings
        </span>
      </div>

      <div className="p-4 space-y-6">
        {/* Document Typography */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-semibold text-muted uppercase tracking-widest">
            Typography
          </h4>

          <div>
            <label className="block text-muted text-[11px] mb-1">Bangla Font</label>
            <select
              value={settings.primaryFont}
              onChange={(e) =>
                onUpdateSettings({ primaryFont: e.target.value as any })
              }
              className="w-full p-2 bg-black border border-border text-canvas focus:border-accent outline-none"
            >
              <option value="Kalpurush">কালপুরুষ (Kalpurush — Standard)</option>
              <option value="Noto Sans Bengali">Noto Sans Bengali</option>
              <option value="Tiro Bangla">Tiro Bangla (Serif)</option>
              <option value="SolaimanLipi">SolaimanLipi</option>
              <option value="SutonnyMJ">SutonnyMJ (Bijoy Mode)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-muted text-[11px] mb-1">Size (Pt)</label>
              <input
                type="number"
                min="9"
                max="18"
                value={settings.fontSizePt}
                onChange={(e) =>
                  onUpdateSettings({ fontSizePt: parseFloat(e.target.value) || 12 })
                }
                className="w-full p-1.5 bg-black border border-border text-canvas focus:border-accent outline-none"
              />
            </div>
            <div>
              <label className="block text-muted text-[11px] mb-1">Line Height</label>
              <select
                value={settings.lineSpacing}
                onChange={(e) =>
                  onUpdateSettings({ lineSpacing: parseFloat(e.target.value) || 1.35 })
                }
                className="w-full p-1.5 bg-black border border-border text-canvas focus:border-accent outline-none"
              >
                <option value={1.15}>1.15 (Compact)</option>
                <option value={1.35}>1.35 (Standard)</option>
                <option value={1.5}>1.50 (Comfortable)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Paper & Margins */}
        <div className="space-y-3 pt-3 border-t border-border">
          <h4 className="text-[10px] font-semibold text-muted uppercase tracking-widest">
            Page & Layout
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-muted text-[11px] mb-1">Paper Size</label>
              <select
                value={settings.pageSize}
                onChange={(e) =>
                  onUpdateSettings({ pageSize: e.target.value as any })
                }
                className="w-full p-1.5 bg-black border border-border text-canvas focus:border-accent outline-none"
              >
                <option value="A4">A4 (210×297 mm)</option>
                <option value="Letter">Letter</option>
              </select>
            </div>
            <div>
              <label className="block text-muted text-[11px] mb-1">Marks Position</label>
              <select
                value={settings.marksPlacement}
                onChange={(e) =>
                  onUpdateSettings({ marksPlacement: e.target.value as any })
                }
                className="w-full p-1.5 bg-black border border-border text-canvas focus:border-accent outline-none"
              >
                <option value="right">Right Margin (Board)</option>
                <option value="inline">Inline [1, 2, 3]</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-muted text-[11px] mb-1">Top/Bottom (mm)</label>
              <input
                type="number"
                value={settings.margins.topMm}
                onChange={(e) =>
                  onUpdateSettings({
                    margins: {
                      ...settings.margins,
                      topMm: parseFloat(e.target.value) || 20,
                      bottomMm: parseFloat(e.target.value) || 20,
                    },
                  })
                }
                className="w-full p-1.5 bg-black border border-border text-canvas focus:border-accent outline-none"
              />
            </div>
            <div>
              <label className="block text-muted text-[11px] mb-1">Left/Right (mm)</label>
              <input
                type="number"
                value={settings.margins.leftMm}
                onChange={(e) =>
                  onUpdateSettings({
                    margins: {
                      ...settings.margins,
                      leftMm: parseFloat(e.target.value) || 22,
                      rightMm: parseFloat(e.target.value) || 22,
                    },
                  })
                }
                className="w-full p-1.5 bg-black border border-border text-canvas focus:border-accent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Exam Header Meta */}
        <div className="space-y-3 pt-3 border-t border-border">
          <h4 className="text-[10px] font-semibold text-muted uppercase tracking-widest">
            Header Metadata
          </h4>
          <div>
            <label className="block text-muted text-[11px] mb-1">Board / College</label>
            <input
              type="text"
              value={paper.header.boardOrCollege}
              onChange={(e) => onUpdateHeader('boardOrCollege', e.target.value)}
              className="w-full p-1.5 bg-black border border-border text-canvas focus:border-accent outline-none font-sans"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-muted text-[11px] mb-1">Exam</label>
              <input
                type="text"
                value={paper.header.examName}
                onChange={(e) => onUpdateHeader('examName', e.target.value)}
                className="w-full p-1.5 bg-black border border-border text-canvas focus:border-accent outline-none font-sans"
              />
            </div>
            <div>
              <label className="block text-muted text-[11px] mb-1">Year</label>
              <input
                type="text"
                value={paper.header.year}
                onChange={(e) => onUpdateHeader('year', e.target.value)}
                className="w-full p-1.5 bg-black border border-border text-canvas focus:border-accent outline-none font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-muted text-[11px] mb-1">Subject</label>
            <input
              type="text"
              value={paper.header.subject}
              onChange={(e) => onUpdateHeader('subject', e.target.value)}
              className="w-full p-1.5 bg-black border border-border text-canvas focus:border-accent outline-none font-sans"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-muted text-[11px] mb-1">Time</label>
              <input
                type="text"
                value={paper.header.timeAllowed}
                onChange={(e) => onUpdateHeader('timeAllowed', e.target.value)}
                className="w-full p-1.5 bg-black border border-border text-canvas focus:border-accent outline-none font-sans"
              />
            </div>
            <div>
              <label className="block text-muted text-[11px] mb-1">Marks</label>
              <input
                type="text"
                value={paper.header.totalMarks}
                onChange={(e) => onUpdateHeader('totalMarks', e.target.value)}
                className="w-full p-1.5 bg-black border border-border text-canvas focus:border-accent outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Selected Question Controls */}
        {activeQuestion && (
          <div className="space-y-3 pt-3 border-t border-border bg-black p-3 border border-border">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-semibold text-accent uppercase tracking-widest">
                Selected: Q{activeQuestion.number}
              </span>
              <span className="text-[10px] text-muted uppercase">
                {activeQuestion.kind}
              </span>
            </div>

            <div>
              <label className="block text-muted text-[11px] mb-1">Question Number</label>
              <input
                type="text"
                value={activeQuestion.number}
                onChange={(e) =>
                  onUpdateQuestion({ ...activeQuestion, number: e.target.value })
                }
                className="w-full p-1.5 bg-surface border border-border text-canvas focus:border-accent outline-none font-mono font-bold"
              />
            </div>

            {/* Diagram Controls */}
            {activeQuestion.diagrams.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border">
                <label className="block text-[11px] text-muted uppercase tracking-wider">
                  Attached Diagrams
                </label>
                {activeQuestion.diagrams.map((diag, dIdx) => (
                  <div key={diag.id} className="space-y-2 bg-surface p-2 border border-border">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-muted">Figure #{dIdx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = activeQuestion.diagrams.filter(
                            (d) => d.id !== diag.id
                          );
                          onUpdateQuestion({ ...activeQuestion, diagrams: updated });
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                    <div>
                      <label className="text-[10px] text-muted">Caption</label>
                      <input
                        type="text"
                        value={diag.caption || ''}
                        onChange={(e) => {
                          const updated = [...activeQuestion.diagrams];
                          updated[dIdx] = { ...diag, caption: e.target.value };
                          onUpdateQuestion({ ...activeQuestion, diagrams: updated });
                        }}
                        placeholder="চিত্র: ..."
                        className="w-full p-1 bg-black border border-border text-canvas text-xs focus:border-accent outline-none font-sans"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div>
                        <label className="text-[10px] text-muted">Width (px)</label>
                        <input
                          type="number"
                          value={diag.width || 380}
                          onChange={(e) => {
                            const updated = [...activeQuestion.diagrams];
                            updated[dIdx] = {
                              ...diag,
                              width: parseInt(e.target.value, 10) || 300,
                            };
                            onUpdateQuestion({ ...activeQuestion, diagrams: updated });
                          }}
                          className="w-full p-1 bg-black border border-border text-canvas text-xs focus:border-accent outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted">Alignment</label>
                        <select
                          value={diag.alignment || 'center'}
                          onChange={(e) => {
                            const updated = [...activeQuestion.diagrams];
                            updated[dIdx] = { ...diag, alignment: e.target.value as any };
                            onUpdateQuestion({ ...activeQuestion, diagrams: updated });
                          }}
                          className="w-full p-1 bg-black border border-border text-canvas text-xs focus:border-accent outline-none font-mono"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
