import React, { useState } from 'react';
import {
  bijoyToUnicode,
  unicodeToBijoy,
  detectScript,
} from './bijoy';

interface BanglaToolbarProps {
  onInsertText?: (text: string) => void;
  inputMode: 'unicode' | 'bijoy';
  onInputModeChange: (mode: 'unicode' | 'bijoy') => void;
}

export const BanglaToolbar: React.FC<BanglaToolbarProps> = ({
  onInsertText,
  inputMode,
  onInputModeChange,
}) => {
  const [showConverterModal, setShowConverterModal] = useState(false);
  const [inputText, setInputText] = useState('');
  const [convertedText, setConvertedText] = useState('');
  const [conversionDirection, setConversionDirection] = useState<'u2b' | 'b2u'>('b2u');

  const handleConvert = (direction: 'u2b' | 'b2u') => {
    setConversionDirection(direction);
    if (direction === 'b2u') {
      const out = bijoyToUnicode(inputText);
      setConvertedText(out);
    } else {
      const out = unicodeToBijoy(inputText);
      setConvertedText(out);
    }
  };

  const handleAutoDetect = (text: string) => {
    setInputText(text);
    if (!text.trim()) return;
    const guess = detectScript(text);
    if (guess.script === 'bijoy') {
      setConversionDirection('b2u');
      setConvertedText(bijoyToUnicode(text));
    } else if (guess.script === 'unicode') {
      setConversionDirection('u2b');
      setConvertedText(unicodeToBijoy(text));
    }
  };

  const handleApplyToCanvas = () => {
    if (onInsertText && convertedText) {
      onInsertText(convertedText);
      setShowConverterModal(false);
      setInputText('');
      setConvertedText('');
    }
  };

  // Common HSC Biology symbols & terms
  const bioSymbols = [
    'DNA',
    'RNA',
    'ATP',
    'ADP',
    'CO₂',
    'H₂O',
    'O₂',
    'pH',
    '°C',
    'µm',
    'F₁',
    'F₂',
    '♂',
    '♀',
    '±',
    '×',
    '÷',
    '→',
  ];

  return (
    <div className="bangla-toolbar bg-white border-b border-gray-200 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-sm">
      {/* Input Mode Toggle */}
      <div className="flex items-center gap-2">
        <span className="font-medium text-gray-700 flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
          কীবোর্ড মোড:
        </span>
        <div className="inline-flex rounded-md shadow-sm border border-gray-300 overflow-hidden bg-gray-50">
          <button
            type="button"
            onClick={() => onInputModeChange('unicode')}
            className={`px-3 py-1 text-xs font-semibold transition-colors ${
              inputMode === 'unicode'
                ? 'bg-emerald-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            ইউনিকোড (Avro)
          </button>
          <button
            type="button"
            onClick={() => onInputModeChange('bijoy')}
            className={`px-3 py-1 text-xs font-semibold transition-colors ${
              inputMode === 'bijoy'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title="SutonnyMJ / Bijoy Classic কি-ম্যাপিং সরাসরি ইউনিকোডে রূপান্তরিত হবে"
          >
            বিজয় ক্লাসিক (Bijoy 52)
          </button>
        </div>
      </div>

      {/* Biology Terminology Quick Badges */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs text-gray-500 font-medium">প্রতীক:</span>
        {bioSymbols.map((sym) => (
          <button
            key={sym}
            type="button"
            onClick={() => onInsertText && onInsertText(sym)}
            className="px-2 py-0.5 text-xs bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-gray-700 rounded border border-gray-200 font-mono transition-colors"
            title={`ক্লিক করে পেপারের বর্তমান অংশে "${sym}" যোগ করুন`}
          >
            {sym}
          </button>
        ))}
      </div>

      {/* Converter Button */}
      <div>
        <button
          type="button"
          onClick={() => setShowConverterModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors shadow-sm"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
          বিজয় ⇄ ইউনিকোড কনভার্টার
        </button>
      </div>

      {/* Full-featured Modal Converter */}
      {showConverterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-2xl w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span>🇧🇩</span>
                বাংলা ফন্ট কনভার্টার (বিজয় ⇄ ইউনিকোড)
              </h3>
              <button
                type="button"
                onClick={() => setShowConverterModal(false)}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-1 text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-600 mt-2 mb-4">
              পুরনো বিজয় (SutonnyMJ / ANSI) টেক্সট এখানে পেস্ট করলে স্বয়ংক্রিয়ভাবে প্রমিত ইউনিকোডে
              রূপান্তর করা যাবে। ইংরেজি বৈজ্ঞানিক পরিভাষা (DNA, ATP ইত্যাদি) অক্ষত থাকবে।
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Input Box */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-gray-700">
                    ইনপুট টেক্সট {conversionDirection === 'b2u' ? '(বিজয়)' : '(ইউনিকোড)'}:
                  </label>
                  <button
                    type="button"
                    onClick={() => setInputText('')}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    মুছে ফেলুন
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={inputText}
                  onChange={(e) => handleAutoDetect(e.target.value)}
                  placeholder="এখানে টেক্সট পেস্ট করুন (যেমন: Avwg evsjvq Mvb MvB)..."
                  className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                />
              </div>

              {/* Output Box */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-gray-700">
                    রূপান্তরিত টেক্সট {conversionDirection === 'b2u' ? '(ইউনিকোড)' : '(বিজয়)'}:
                  </label>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(convertedText)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    কপি করুন
                  </button>
                </div>
                <textarea
                  rows={6}
                  readOnly
                  value={convertedText}
                  placeholder="রূপান্তরিত টেক্সট এখানে দেখা যাবে..."
                  className="w-full text-sm p-2.5 border border-gray-300 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-5 pt-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleConvert('b2u')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm border ${
                    conversionDirection === 'b2u'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  বিজয় ➔ ইউনিকোড
                </button>
                <button
                  type="button"
                  onClick={() => handleConvert('u2b')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm border ${
                    conversionDirection === 'u2b'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  ইউনিকোড ➔ বিজয়
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowConverterModal(false)}
                  className="px-4 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  বন্ধ করুন
                </button>
                {onInsertText && (
                  <button
                    type="button"
                    onClick={handleApplyToCanvas}
                    disabled={!convertedText}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm"
                  >
                    পেপারে যোগ করুন
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
