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
      showNotification('Undo applied');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setPaper(next);
      showNotification('Redo applied');
    }
  };

  // Keep browser-native text editing undo intact inside fields while offering
  // app-level history and common document actions everywhere else.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const modifier = event.ctrlKey || event.metaKey;
      if (!modifier || event.altKey) return;

      const target = event.target;
      const isEditable = target instanceof HTMLElement && (
        target.isContentEditable ||
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      );

      if (key === 's') {
        event.preventDefault();
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(paper));
          showNotification('Saved in this browser');
        } catch (error) {
          console.warn('Could not save to localStorage:', error);
          showNotification('Could not save in this browser');
        }
        return;
      }

      if (isEditable) return;

      if (key === 'z') {
        event.preventDefault();
        if (event.shiftKey) handleRedo();
        else handleUndo();
      } else if (key === 'y') {
        event.preventDefault();
        handleRedo();
      } else if (event.shiftKey && key === 'e') {
        event.preventDefault();
        void handleExportDocx();
      } else if (event.shiftKey && key === 'u') {
        event.preventDefault();
        setIsUploadModalOpen(true);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

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
            showNotification('Diagram image added');
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
      showNotification('DOCX export complete');
    } catch (err: any) {
      console.error('Export error:', err);
      alert('Error exporting DOCX: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-black text-canvas font-sans selection:bg-accent selection:text-black">
      {/* ================= TOP NAVBAR (PORTFOLIO STYLE) ================= */}
      <header className="bg-black border-b border-border px-6 py-3 flex items-center justify-between select-none z-20">
        <div className="flex items-center gap-4">
          <span className="font-mono text-accent text-sm font-bold">01</span>
          <div className="space-y-0.5">
            <h1 className="text-xs uppercase font-mono font-semibold tracking-widest text-canvas flex items-center gap-2">
              HSC Biology Question Builder
              <span className="text-[10px] text-muted border border-border px-1.5 py-0.2">
                Static V1
              </span>
            </h1>
            <p className="text-[10px] text-muted font-sans tracking-wide">
              Editorial Question Paper Engine · juwainhq
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 font-mono text-xs">
          {/* Undo / Redo */}
          <div className="inline-flex border border-border bg-surface">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="px-2.5 py-1 text-muted hover:text-canvas disabled:opacity-30 border-r border-border"
              title="Undo (Ctrl/⌘+Z)"
              aria-keyshortcuts="Control+Z Meta+Z"
            >
              Undo
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="px-2.5 py-1 text-muted hover:text-canvas disabled:opacity-30"
              title="Redo (Ctrl/⌘+Shift+Z or Ctrl/⌘+Y)"
              aria-keyshortcuts="Control+Shift+Z Meta+Shift+Z Control+Y Meta+Y"
            >
              Redo
            </button>
          </div>

          {/* Upload Button */}
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="px-3 py-1 bg-surface border border-border hover:border-accent text-canvas transition-colors uppercase tracking-wider"
            title="Upload image / OCR (Ctrl/⌘+Shift+U)"
            aria-keyshortcuts="Control+Shift+U Meta+Shift+U"
          >
            Upload Image / OCR
          </button>

          {/* Export DOCX Button */}
          <button
            type="button"
            onClick={handleExportDocx}
            disabled={isExporting}
            className="px-4 py-1 bg-accent hover:bg-accent-hover text-black font-semibold transition-colors uppercase tracking-wider disabled:opacity-40"
            title="Export DOCX (Ctrl/⌘+Shift+E)"
            aria-keyshortcuts="Control+Shift+E Meta+Shift+E"
          >
            {isExporting ? 'Generating...' : 'Export DOCX'}
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
              showNotification(`Inserted "${txt}"`);
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

      {/* Minimal Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-black border border-accent text-canvas text-xs px-4 py-2 font-mono flex items-center gap-2">
          <span className="text-accent">■</span>
          <span>{notification}</span>
        </div>
      )}

      {/* Image Upload & OCR Modal */}
      <ImageUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onQuestionsExtracted={(extractedQuestions) => {
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
            `Extracted & placed ${extractedQuestions.length} question(s)`
          );
        }}
      />
    </div>
  );
};
