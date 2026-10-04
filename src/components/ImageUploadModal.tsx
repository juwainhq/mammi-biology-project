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

    // Generate previews
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
        setOcrStatus(`ছবি ${idx + 1}/${previews.length} প্রসেসিং চলছে...`);
        const result = await runBanglaOcr(previews[idx], (p: OcrProgress) => {
          setOcrPercent(Math.round(p.progress * 100));
        });
        aggregatedText += (aggregatedText ? '\n\n' : '') + result.text;
      }

      const structured = detectQuestionStructure(aggregatedText);

      // Attach first diagram image to first question if user uploaded diagram
      if (previews.length > 0 && structured.length > 0) {
        // If image might contain diagram, store diagram image reference
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
      setOcrStatus('সফলভাবে সনাক্ত করা হয়েছে!');
    } catch (err: any) {
      console.error('OCR Error:', err);
      setErrorMessage('OCR প্রক্রিয়াকরণে সমস্যা হয়েছে: ' + (err.message || String(err)));
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-emerald-50/50">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-lg text-lg">📷</span>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                জীববিজ্ঞান প্রশ্নপত্র ছবি থেকে OCR ও তৈরি
              </h2>
              <p className="text-xs text-gray-600">
                ছবি আপলোড করুন ➔ বাংলা OCR ➔ অটো ক, খ, গ, ঘ ও উদ্দীপক সনাক্তকরণ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-lg p-1.5"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-xl p-6 text-center cursor-pointer bg-gray-50/60 hover:bg-emerald-50/20 transition-all"
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
              <svg
                className="w-10 h-10 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm font-semibold text-gray-700">
                এখানে ক্লিক করে প্রশ্নপত্রের ছবি আপলোড করুন
              </p>
              <p className="text-xs text-gray-500">
                JPG, PNG, JPEG বা WEBP (একাধিক ছবি সাপোর্ট করে)
              </p>
            </div>
          </div>

          {/* Previews */}
          {previews.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                আপলোড করা ছবিসমূহ ({previews.length} টি):
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {previews.map((src, i) => (
                  <div
                    key={i}
                    className="relative group border rounded-lg overflow-hidden bg-gray-100 aspect-video flex items-center justify-center shadow-sm"
                  >
                    <img
                      src={src}
                      alt={`Upload ${i + 1}`}
                      className="object-contain max-h-full max-w-full"
                    />
                    <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                      ছবি {i + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress Indicator */}
          {isProcessing && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex justify-between text-xs font-semibold text-emerald-800">
                <span>{ocrStatus || 'প্রক্রিয়াকরণ চলছে...'}</span>
                <span>{ocrPercent}%</span>
              </div>
              <div className="w-full bg-emerald-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-200"
                  style={{ width: `${ocrPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-emerald-700">
                বাংলা ব্যাকরণ ও জীববিজ্ঞানের শব্দকোষ দিয়ে অক্ষর সনাক্ত করা হচ্ছে...
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {errorMessage}
            </div>
          )}

          {/* Detected Structure Preview */}
          {recognizedQuestions.length > 0 && (
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-3">
              <h4 className="text-sm font-bold text-emerald-800 flex items-center gap-2">
                <span>✓</span> সনাক্তকৃত প্রশ্ন কাঠামো ({recognizedQuestions.length} টি প্রশ্ন):
              </h4>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {recognizedQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="p-3 bg-white border border-gray-200 rounded-lg text-xs space-y-1.5 shadow-sm"
                  >
                    <div className="font-bold text-gray-900 flex justify-between">
                      <span>প্রশ্ন {q.number}।</span>
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                        {q.kind === 'creative' ? 'সৃজনশীল' : 'বহুনির্বাচনি'}
                      </span>
                    </div>
                    {q.stimulus && (
                      <p className="text-gray-700 italic border-l-2 border-emerald-500 pl-2">
                        {q.stimulus}
                      </p>
                    )}
                    {q.subQuestions && q.subQuestions.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1 pt-1">
                        {q.subQuestions.map((sq) => (
                          <div key={sq.id} className="text-gray-800 bg-gray-50 p-1 rounded">
                            <span className="font-bold text-emerald-700">{sq.part})</span>{' '}
                            {sq.text}{' '}
                            <span className="text-gray-500 font-mono">[{sq.marks}]</span>
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
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            বাতিল
          </button>
          <div className="flex items-center gap-3">
            {previews.length > 0 && (
              <button
                type="button"
                onClick={handleRunOcr}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <span>🔍</span>
                {isProcessing ? 'OCR চলছে...' : 'OCR এক্সট্র্যাক্ট করুন'}
              </button>
            )}
            {recognizedQuestions.length > 0 && (
              <button
                type="button"
                onClick={handleApplyToEditor}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
              >
                এডিটরে স্থাপন করুন ➔
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
