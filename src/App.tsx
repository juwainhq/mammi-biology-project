import React, { useEffect, useState } from 'react';
import { SAMPLE_HSC_PAPER } from './model/samplePaper';
import {
  QuestionPaper,
  QuestionItem,
  SubQuestionPart,
  ImageAttachment,
} from './model/types';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { PaperCanvas } from './components/PaperCanvas';
import { BanglaToolbar } from './bangla/BanglaToolbar';
import { ImageUploadModal } from './components/ImageUploadModal';
import { exportPaperToDocx } from './export/docxExporter';
import { toBengaliNumber } from './ocr/structureDetector';

const STORAGE_KEY = 'hsc_biology_paper_v1';

export const App: React.FC = () => {
  // Load local state or initialize with HSC biology sample paper
  const [paper, setPaper] = useState<QuestionPaper>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not restore from localStorage:', e);
    }
    return SAMPLE_HSC_PAPER;
  });

  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(() => {
    return paper.sections[0]?.questions[0]?.id || null;
  });

  // History stack for Undo / Redo
  const [history, setHistory] = useState<QuestionPaper[]>([paper]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // UI state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [inputMode, setInputMode] = useState<'unicode' | 'bijoy'>('unicode');
  const [isExporting, setIsExporting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(paper));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [paper]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 3000);
  };

  const updatePaperWithHistory = (newPaper: QuestionPaper) => {
    setPaper(newPaper);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newPaper);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setPaper(prev);
      showNotification('পূর্ববর্তী অবস্থায় ফিরিয়ে নেওয়া হয়েছে (Undo)');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setPaper(next);
      showNotification('পুনরায় প্রয়োগ করা হয়েছে (Redo)');
    }
  };

  // Find active question object
  const findActiveQuestion = (): QuestionItem | null => {
    if (!activeQuestionId) return null;
    for (const sec of paper.sections) {
      for (const q of sec.questions) {
        if (q.id === activeQuestionId) return q;
      }
    }
    return null;
  };

  // Add new question
  const handleAddQuestion = (sectionId: string, kind: 'creative' | 'mcq') => {
    const sectionIndex = paper.sections.findIndex((s) => s.id === sectionId);
    if (sectionIndex === -1) return;

    const currentQuestions = paper.sections[sectionIndex].questions;
    const newNumber = toBengaliNumber(currentQuestions.length + 1);
    const newQId = `q-${Date.now()}`;

    const newQuestion: QuestionItem = {
      id: newQId,
      kind,
      number: newNumber,
      stimulus:
        kind === 'creative'
          ? 'নতুন সৃজনশীল প্রশ্নের উদ্দীপক এখানে লিখুন...'
          : 'বহুনির্বাচনি প্রশ্নের মূল বাক্য...',
      diagrams: [],
      subQuestions:
        kind === 'creative'
          ? [
              { id: `sq-${Date.now()}-1`, part: 'ক', text: 'জ্ঞানমূলক প্রশ্ন', marks: 1 },
              { id: `sq-${Date.now()}-2`, part: 'খ', text: 'অনুধাবনমূলক প্রশ্ন', marks: 2 },
              { id: `sq-${Date.now()}-3`, part: 'গ', text: 'প্রয়োগমূলক প্রশ্ন', marks: 3 },
              { id: `sq-${Date.now()}-4`, part: 'ঘ', text: 'উচ্চতর দক্ষতামূলক প্রশ্ন', marks: 4 },
            ]
          : [],
      options:
        kind === 'mcq'
          ? [
              { id: `opt-${Date.now()}-1`, label: 'ক', text: 'অপশন ১' },
              { id: `opt-${Date.now()}-2`, label: 'খ', text: 'অপশন ২' },
              { id: `opt-${Date.now()}-3`, label: 'গ', text: 'অপশন ৩' },
              { id: `opt-${Date.now()}-4`, label: 'ঘ', text: 'অপশন ৪' },
            ]
          : [],
      totalMarks: kind === 'creative' ? 10 : 1,
    };

    const updatedSections = [...paper.sections];
    updatedSections[sectionIndex] = {
      ...updatedSections[sectionIndex],
      questions: [...currentQuestions, newQuestion],
    };

    updatePaperWithHistory({
      ...paper,
      sections: updatedSections,
      updatedAt: Date.now(),
    });
    setActiveQuestionId(newQId);
  };

  // Delete question
  const handleDeleteQuestion = (questionId: string) => {
    const updatedSections = paper.sections.map((sec) => ({
      ...sec,
      questions: sec.questions.filter((q) => q.id !== questionId),
    }));

    updatePaperWithHistory({
      ...paper,
      sections: updatedSections,
      updatedAt: Date.now(),
    });

    if (activeQuestionId === questionId) {
      setActiveQuestionId(null);
    }
  };

  // Update question
  const handleUpdateQuestion = (updatedQuestion: QuestionItem) => {
    const updatedSections = paper.sections.map((sec) => ({
      ...sec,
      questions: sec.questions.map((q) =>
        q.id === updatedQuestion.id ? updatedQuestion : q
      ),
    }));

    setPaper({
      ...paper,
      sections: updatedSections,
      updatedAt: Date.now(),
    });
  };

  // Add sub-question to active question
  const handleAddSubQuestion = (questionId: string) => {
    const parts: SubQuestionPart[] = ['ক', 'খ', 'গ', 'ঘ'];
    const updatedSections = paper.sections.map((sec) => ({
      ...sec,
      questions: sec.questions.map((q) => {
        if (q.id === questionId) {
          const nextPart = parts[q.subQuestions.length] || 'ক';
          return {
            ...q,
            subQuestions: [
              ...q.subQuestions,
              {
                id: `sq-${Date.now()}`,
                part: nextPart,
                text: 'নতুন উপ-প্রশ্ন',
                marks: q.subQuestions.length + 1,
              },
            ],
          };
        }
        return q;
      }),
    }));

    updatePaperWithHistory({
      ...paper,
      sections: updatedSections,
      updatedAt: Date.now(),
    });
  };

  // Trigger diagram upload for question
  const handleAddDiagram = (questionId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (loadEvt) => {
          if (loadEvt.target?.result) {
            const dataUrl = loadEvt.target.result as string;
            const updatedSections = paper.sections.map((sec) => ({
              ...sec,
              questions: sec.questions.map((q) => {
                if (q.id === questionId) {
                  const newDiag: ImageAttachment = {
                    id: `diag-${Date.now()}`,
                    dataUrl,
                    caption: 'চিত্র',
                    alignment: 'center',
                    width: 380,
                    height: 240,
                  };
                  return {
                    ...q,
                    diagrams: [...q.diagrams, newDiag],
                  };
                }
                return q;
              }),
            }));

            updatePaperWithHistory({
              ...paper,
              sections: updatedSections,
              updatedAt: Date.now(),
            });
            showNotification('ডায়াগ্রাম চিত্র সফলভাবে যুক্ত হয়েছে!');
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // Export DOCX
  const handleExportDocx = async () => {
    setIsExporting(true);
    try {
      const blob = await exportPaperToDocx(paper);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HSC_Biology_Question_Paper_${paper.header.year}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotification('DOCX ফাইল সফলভাবে তৈরি ও ডাউনলোড হয়েছে!');
    } catch (err: any) {
      console.error('Export error:', err);
      alert('DOCX এক্সপোর্ট তৈরিতে সমস্যা হয়েছে: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-100 font-sans">
      {/* ================= TOP NAVBAR ================= */}
      <header className="bg-emerald-800 text-white px-4 py-2.5 flex items-center justify-between shadow-md z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white shadow">
            🧬
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight flex items-center gap-2">
              HSC Biology Question Builder
              <span className="text-[10px] font-normal bg-emerald-700/80 text-emerald-100 px-2 py-0.5 rounded-full border border-emerald-600">
                V1 প্রফেশনাল
              </span>
            </h1>
            <p className="text-[11px] text-emerald-200">
              ছবি থেকে প্রশ্ন সনাক্তকরণ ➔ বাংলা এডিটর ➔ প্রমিত DOCX এক্সপোর্ট
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Undo / Redo */}
          <div className="flex items-center bg-emerald-900/50 rounded-lg p-0.5 border border-emerald-700">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1.5 hover:bg-emerald-700 disabled:opacity-30 rounded text-xs"
              title="পূর্ববর্তী অবস্থা (Undo)"
            >
              ↩
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 hover:bg-emerald-700 disabled:opacity-30 rounded text-xs"
              title="পরবর্তী অবস্থা (Redo)"
            >
              ↪
            </button>
          </div>

          {/* Upload Button */}
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow transition-colors"
          >
            <span>📷</span>
            <span>প্রশ্ন আপলোড ও OCR</span>
          </button>

          {/* Export DOCX Button */}
          <button
            type="button"
            onClick={handleExportDocx}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold rounded-lg text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <span>📄</span>
            <span>{isExporting ? 'তৈরি হচ্ছে...' : 'DOCX এক্সপোর্ট'}</span>
          </button>
        </div>
      </header>

      {/* ================= BANGLA TOOLBAR & SYMBOLS ================= */}
      <BanglaToolbar
        inputMode={inputMode}
        onInputModeChange={setInputMode}
        onInsertText={(txt) => {
          if (activeQuestionId) {
            const active = findActiveQuestion();
            if (active) {
              handleUpdateQuestion({
                ...active,
                stimulus: (active.stimulus || '') + ' ' + txt,
              });
              showNotification(`"${txt}" যোগ করা হয়েছে`);
            }
          }
        }}
      />

      {/* ================= 3-COLUMN MAIN WORKSPACE ================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: Question Tree Structure */}
        <LeftSidebar
          paper={paper}
          activeQuestionId={activeQuestionId}
          onSelectQuestion={setActiveQuestionId}
          onAddQuestion={handleAddQuestion}
          onDeleteQuestion={handleDeleteQuestion}
        />

        {/* CENTER COLUMN: Real HSC Paper Canvas */}
        <PaperCanvas
          paper={paper}
          activeQuestionId={activeQuestionId}
          onSelectQuestion={setActiveQuestionId}
          onUpdateQuestion={handleUpdateQuestion}
          onDeleteQuestion={handleDeleteQuestion}
          onAddSubQuestion={handleAddSubQuestion}
          onAddDiagram={handleAddDiagram}
        />

        {/* RIGHT COLUMN: Typography, Properties & Settings */}
        <RightSidebar
          paper={paper}
          activeQuestion={findActiveQuestion()}
          onUpdateSettings={(s) =>
            setPaper({ ...paper, settings: { ...paper.settings, ...s } })
          }
          onUpdateHeader={(key, val) =>
            setPaper({ ...paper, header: { ...paper.header, [key]: val } })
          }
          onUpdateQuestion={handleUpdateQuestion}
        />
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white text-xs px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span>✓</span>
          <span>{notification}</span>
        </div>
      )}

      {/* Image Upload & OCR Modal */}
      <ImageUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onQuestionsExtracted={(extractedQuestions) => {
          // Add newly extracted questions to first section
          const sec = [...paper.sections];
          if (sec[0]) {
            sec[0].questions = [...sec[0].questions, ...extractedQuestions];
          }
          updatePaperWithHistory({
            ...paper,
            sections: sec,
            updatedAt: Date.now(),
          });
          if (extractedQuestions[0]) {
            setActiveQuestionId(extractedQuestions[0].id);
          }
          showNotification(
            `সফলভাবে ${extractedQuestions.length} টি প্রশ্ন সনাক্ত ও যুক্ত করা হয়েছে!`
          );
        }}
      />
    </div>
  );
};
