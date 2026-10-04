import React, { useRef, useState } from 'react';
import { runBanglaOcr, OcrProgress } from '../ocr/ocrEngine';
import { detectQuestionStructure } from '../ocr/structureDetector';
import { QuestionItem } from '../model/types';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestionsExtracted: (questions: QuestionItem[], sourceImages: string[]) => void;
}

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  onQuestionsExtracted,
}) => {
  const [previews, setPreviews] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrStatus, setOcrStatus] = useState<string>('');
  const [ocrPercent, setOcrPercent] = useState<number>(0);
  const [recognizedQuestions, setRecognizedQuestions] = useState<QuestionItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    setErrorMessage('');

    const newPreviews: string[] = [];
    let loadedCount = 0;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        if (loadEvt.target?.result) {
          newPreviews.push(loadEvt.target.result as string);
        }
        loadedCount++;
        if (loadedCount === files.length) {
          setPreviews(newPreviews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRunOcr = async () => {
    if (previews.length === 0) {
      setErrorMessage('অনুগ্রহ করে অন্তত একটি প্রশ্নপত্র ছবি আপলোড করুন।');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');
    let aggregatedText = '';

    try {
      for (let idx = 0; idx < previews.length; idx++) {
        setOcrStatus(`Processing image ${idx + 1}/${previews.length}...`);
        const result = await runBanglaOcr(previews[idx], (p: OcrProgress) => {
          setOcrPercent(Math.round(p.progress * 100));
        });
        aggregatedText += (aggregatedText ? '\n\n' : '') + result.text;
      }

      const structured = detectQuestionStructure(aggregatedText);

      // Attach first diagram image to first question if user uploaded diagram
      if (previews.length > 0 && structured.length > 0) {
        structured[0].diagrams.push({
          id: `diag-${Date.now()}`,
          dataUrl: previews[0],
          caption: 'প্রশ্নে ব্যবহৃত চিত্র',
          alignment: 'center',
          width: 380,
          height: 240,
        });
      }

      setRecognizedQuestions(structured);
      setOcrStatus('Extraction complete.');
    } catch (err: any) {
      console.error('OCR Error:', err);
      setErrorMessage('OCR Error: ' + (err.message || String(err)));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyToEditor = () => {
    if (recognizedQuestions.length > 0) {
      onQuestionsExtracted(recognizedQuestions, previews);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden text-canvas font-mono">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-black">
          <div className="space-y-0.5">
            <h2 className="text-sm font-semibold tracking-wider uppercase text-canvas flex items-center gap-2">
              <span className="text-accent">■</span> OCR Question Extraction
            </h2>
            <p className="text-[11px] text-muted font-sans">
              Client-side Bangla + English OCR with automatic Creative Question structure detection.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-canvas text-base p-1"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border border-dashed border-border hover:border-accent p-8 text-center cursor-pointer bg-black transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <span className="text-2xl text-accent">↑</span>
              <p className="text-xs uppercase tracking-wider font-semibold text-canvas">
                Click or Drop Question Image(s) Here
              </p>
              <p className="text-[11px] text-muted">
                Supports multiple JPG, PNG, WEBP files
              </p>
            </div>
          </div>

          {/* Previews */}
          {previews.length > 0 && (
            <div>
              <h4 className="text-[11px] text-muted uppercase tracking-wider mb-2">
                Selected Images ({previews.length}):
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {previews.map((src, i) => (
                  <div
                    key={i}
                    className="relative border border-border bg-black aspect-video flex items-center justify-center overflow-hidden"
                  >
                    <img
                      src={src}
                      alt={`Upload ${i + 1}`}
                      className="object-contain max-h-full max-w-full"
                    />
                    <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] text-muted px-1.5 border border-border">
                      #{i + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress Indicator */}
          {isProcessing && (
            <div className="p-4 bg-black border border-border space-y-2">
              <div className="flex justify-between text-xs text-muted">
                <span>{ocrStatus || 'Processing...'}</span>
                <span className="text-accent">{ocrPercent}%</span>
              </div>
              <div className="w-full bg-surface h-1 overflow-hidden">
                <div
                  className="bg-accent h-1 transition-all duration-200"
                  style={{ width: `${ocrPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-black border border-red-900 text-red-400 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Detected Structure Preview */}
          {recognizedQuestions.length > 0 && (
            <div className="border border-border p-4 bg-black space-y-3">
              <h4 className="text-xs text-accent uppercase tracking-wider flex items-center gap-2">
                <span>■</span> Detected Questions ({recognizedQuestions.length}):
              </h4>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {recognizedQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="p-3 bg-surface border border-border text-xs space-y-1.5"
                  >
                    <div className="font-semibold text-canvas flex justify-between">
                      <span>Question {q.number}</span>
                      <span className="text-accent text-[11px] uppercase">
                        {q.kind}
                      </span>
                    </div>
                    {q.stimulus && (
                      <p className="text-muted italic border-l border-accent/60 pl-2 font-sans">
                        {q.stimulus}
                      </p>
                    )}
                    {q.subQuestions && q.subQuestions.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 pt-1 font-sans">
                        {q.subQuestions.map((sq) => (
                          <div key={sq.id} className="text-canvas bg-black p-1.5 border border-border">
                            <span className="text-accent font-mono font-semibold">
                              ({sq.part})
                            </span>{' '}
                            {sq.text}{' '}
                            <span className="text-muted font-mono">[{sq.marks}]</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border bg-black flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-muted hover:text-canvas border border-border"
          >
            Cancel
          </button>
          <div className="flex items-center gap-3">
            {previews.length > 0 && (
              <button
                type="button"
                onClick={handleRunOcr}
                disabled={isProcessing}
                className="px-4 py-1.5 text-xs uppercase tracking-wider font-semibold text-black bg-accent hover:bg-accent-hover disabled:opacity-30"
              >
                {isProcessing ? 'Processing...' : 'Run Bangla OCR'}
              </button>
            )}
            {recognizedQuestions.length > 0 && (
              <button
                type="button"
                onClick={handleApplyToEditor}
                className="px-4 py-1.5 text-xs uppercase tracking-wider font-semibold text-black bg-canvas hover:bg-white"
              >
                Place in Paper ➔
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
