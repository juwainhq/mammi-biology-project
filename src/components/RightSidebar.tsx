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
    <aside className="w-80 bg-white border-l border-gray-200 flex flex-col h-full overflow-y-auto select-none text-xs">
      {/* Header */}
      <div className="p-3.5 border-b border-gray-200 bg-gray-50/70 font-bold text-gray-800 flex items-center gap-2">
        <span>⚙️ ফরম্যাটিং ও প্রোপার্টিজ</span>
      </div>

      <div className="p-4 space-y-6">
        {/* Document Typography */}
        <div className="space-y-3">
          <h4 className="font-bold text-gray-700 uppercase tracking-wider text-[11px]">
            টাইপোগ্রাফি ও ফন্ট
          </h4>

          <div>
            <label className="block text-gray-600 mb-1 font-medium">বাংলা ফন্ট:</label>
            <select
              value={settings.primaryFont}
              onChange={(e) =>
                onUpdateSettings({ primaryFont: e.target.value as any })
              }
              className="w-full p-2 border border-gray-300 rounded-md bg-white font-medium focus:ring-1 focus:ring-emerald-500"
            >
              <option value="Kalpurush">কালপুরুষ (Kalpurush — প্রমিত)</option>
              <option value="Noto Sans Bengali">নোটো স্যান্স বেঙ্গলি</option>
              <option value="Tiro Bangla">তিরো বাংলা (Tiro Bangla)</option>
              <option value="SolaimanLipi">সোলায়মান লিপি</option>
              <option value="SutonnyMJ">SutonnyMJ (বিজয় মোড)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-gray-600 mb-1">সাইজ (Pt):</label>
              <input
                type="number"
                min="9"
                max="18"
                value={settings.fontSizePt}
                onChange={(e) =>
                  onUpdateSettings({ fontSizePt: parseFloat(e.target.value) || 12 })
                }
                className="w-full p-1.5 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">লাইন স্পেসিং:</label>
              <select
                value={settings.lineSpacing}
                onChange={(e) =>
                  onUpdateSettings({ lineSpacing: parseFloat(e.target.value) || 1.35 })
                }
                className="w-full p-1.5 border border-gray-300 rounded-md bg-white"
              >
                <option value={1.15}>১.১৫ (কম্প্যাক্ট)</option>
                <option value={1.35}>১.৩৫ (স্ট্যান্ডার্ড)</option>
                <option value={1.5}>১.৫০ (প্রশস্ত)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Paper Margins & Page Size */}
        <div className="space-y-3 pt-3 border-t border-gray-200">
          <h4 className="font-bold text-gray-700 uppercase tracking-wider text-[11px]">
            পৃষ্ঠা ও মার্জিন
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-gray-600 mb-1">পৃষ্ঠা সাইজ:</label>
              <select
                value={settings.pageSize}
                onChange={(e) =>
                  onUpdateSettings({ pageSize: e.target.value as any })
                }
                className="w-full p-1.5 border border-gray-300 rounded-md bg-white"
              >
                <option value="A4">A4 (210 × 297 mm)</option>
                <option value="Letter">Letter</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-600 mb-1">নম্বর পজিশন:</label>
              <select
                value={settings.marksPlacement}
                onChange={(e) =>
                  onUpdateSettings({ marksPlacement: e.target.value as any })
                }
                className="w-full p-1.5 border border-gray-300 rounded-md bg-white"
              >
                <option value="right">ডান মার্জিন (বোর্ড স্টাইল)</option>
                <option value="inline">ইনলাইন [১, ২, ৩]</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-gray-600 mb-1">টপ/বটম (মিমি):</label>
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
                className="w-full p-1.5 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">লেফট/রাইট (মিমি):</label>
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
                className="w-full p-1.5 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Exam Paper Header Meta */}
        <div className="space-y-3 pt-3 border-t border-gray-200">
          <h4 className="font-bold text-gray-700 uppercase tracking-wider text-[11px]">
            পরীক্ষার হেডার তথ্য
          </h4>
          <div>
            <label className="block text-gray-600 mb-1">বোর্ড / কলেজের নাম:</label>
            <input
              type="text"
              value={paper.header.boardOrCollege}
              onChange={(e) => onUpdateHeader('boardOrCollege', e.target.value)}
              className="w-full p-1.5 border border-gray-300 rounded-md font-medium"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-gray-600 mb-1">পরীক্ষার নাম:</label>
              <input
                type="text"
                value={paper.header.examName}
                onChange={(e) => onUpdateHeader('examName', e.target.value)}
                className="w-full p-1.5 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">বছর:</label>
              <input
                type="text"
                value={paper.header.year}
                onChange={(e) => onUpdateHeader('year', e.target.value)}
                className="w-full p-1.5 border border-gray-300 rounded-md font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">বিষয়:</label>
            <input
              type="text"
              value={paper.header.subject}
              onChange={(e) => onUpdateHeader('subject', e.target.value)}
              className="w-full p-1.5 border border-gray-300 rounded-md"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-gray-600 mb-1">সময়:</label>
              <input
                type="text"
                value={paper.header.timeAllowed}
                onChange={(e) => onUpdateHeader('timeAllowed', e.target.value)}
                className="w-full p-1.5 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">পূর্ণমান:</label>
              <input
                type="text"
                value={paper.header.totalMarks}
                onChange={(e) => onUpdateHeader('totalMarks', e.target.value)}
                className="w-full p-1.5 border border-gray-300 rounded-md font-mono"
              />
            </div>
          </div>
        </div>

        {/* Active Question Properties (Diagram controls if selected) */}
        {activeQuestion && (
          <div className="space-y-3 pt-3 border-t border-gray-200 bg-emerald-50/40 p-3 rounded-lg border border-emerald-100">
            <h4 className="font-bold text-emerald-800 uppercase tracking-wider text-[11px] flex justify-between">
              <span>সিলেক্টেড প্রশ্ন ({activeQuestion.number})</span>
              <span className="font-mono text-emerald-600">
                {activeQuestion.kind === 'creative' ? 'সৃজনশীল' : 'MCQ'}
              </span>
            </h4>

            <div>
              <label className="block text-gray-600 mb-1">প্রশ্ন নম্বর:</label>
              <input
                type="text"
                value={activeQuestion.number}
                onChange={(e) =>
                  onUpdateQuestion({ ...activeQuestion, number: e.target.value })
                }
                className="w-full p-1.5 border border-gray-300 rounded-md bg-white font-bold"
              />
            </div>

            {/* Diagram Controls */}
            {activeQuestion.diagrams.length > 0 && (
              <div className="space-y-2 pt-2">
                <label className="block font-semibold text-gray-700">
                  সংযুক্ত চিত্র সেটিংস:
                </label>
                {activeQuestion.diagrams.map((diag, dIdx) => (
                  <div key={diag.id} className="space-y-1.5 bg-white p-2 rounded border">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-600">চিত্র #{dIdx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = activeQuestion.diagrams.filter(
                            (d) => d.id !== diag.id
                          );
                          onUpdateQuestion({ ...activeQuestion, diagrams: updated });
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        মুছুন
                      </button>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500">ক্যাপশন:</label>
                      <input
                        type="text"
                        value={diag.caption || ''}
                        onChange={(e) => {
                          const updated = [...activeQuestion.diagrams];
                          updated[dIdx] = { ...diag, caption: e.target.value };
                          onUpdateQuestion({ ...activeQuestion, diagrams: updated });
                        }}
                        placeholder="চিত্র: ..."
                        className="w-full p-1 border rounded text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div>
                        <label className="text-[10px] text-gray-500">প্রস্থ (px):</label>
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
                          className="w-full p-1 border rounded text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500">অ্যালাইনমেন্ট:</label>
                        <select
                          value={diag.alignment || 'center'}
                          onChange={(e) => {
                            const updated = [...activeQuestion.diagrams];
                            updated[dIdx] = { ...diag, alignment: e.target.value as any };
                            onUpdateQuestion({ ...activeQuestion, diagrams: updated });
                          }}
                          className="w-full p-1 border rounded text-xs bg-white"
                        >
                          <option value="left">বামে</option>
                          <option value="center">মাঝে</option>
                          <option value="right">ডানে</option>
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
