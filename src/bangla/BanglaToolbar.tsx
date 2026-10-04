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

  // Standard HSC Biology terms & notation
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
    '→',
  ];

  return (
    <div className="bg-surface border-b border-border px-6 py-2 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
      {/* Input Mode Toggle */}
      <div className="flex items-center gap-3">
        <span className="text-muted tracking-wider uppercase text-[11px] flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-accent inline-block"></span>
          Input
        </span>
        <div className="inline-flex border border-border bg-black">
          <button
            type="button"
            onClick={() => onInputModeChange('unicode')}
            className={`px-3 py-1 text-xs uppercase tracking-wider transition-colors ${
              inputMode === 'unicode'
                ? 'bg-accent text-black font-semibold'
                : 'text-muted hover:text-canvas'
            }`}
          >
            Unicode (Avro)
          </button>
          <button
            type="button"
            onClick={() => onInputModeChange('bijoy')}
            className={`px-3 py-1 text-xs uppercase tracking-wider transition-colors border-l border-border ${
              inputMode === 'bijoy'
                ? 'bg-accent text-black font-semibold'
                : 'text-muted hover:text-canvas'
            }`}
            title="SutonnyMJ / Bijoy Classic কি-ম্যাপিং সরাসরি ইউনিকোডে রূপান্তরিত হবে"
          >
            Bijoy Classic
          </button>
        </div>
      </div>

      {/* Biology Terminology Quick Badges */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] text-muted tracking-wider uppercase mr-1">Symbols</span>
        {bioSymbols.map((sym) => (
          <button
            key={sym}
            type="button"
            onClick={() => onInsertText && onInsertText(sym)}
            className="px-2 py-0.5 text-xs bg-surface-subtle hover:bg-surface-hover hover:border-accent text-canvas border border-border transition-colors font-mono"
            title={`ক্লিক করে পেপারে যোগ করুন: "${sym}"`}
          >
            {sym}
          </button>
        ))}
      </div>

      {/* Converter Modal Button */}
      <div>
        <button
          type="button"
          onClick={() => setShowConverterModal(true)}
          className="inline-flex items-center gap-2 px-3 py-1 text-xs text-canvas bg-surface-subtle border border-border hover:border-accent transition-colors"
        >
          <span className="text-accent">⇄</span>
          <span>Bijoy ⇄ Unicode Converter</span>
        </button>
      </div>

      {/* Minimalist Monochrome Modal */}
      {showConverterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="space-y-0.5">
                <h3 className="text-sm font-semibold tracking-wider text-canvas uppercase flex items-center gap-2">
                  <span className="text-accent">■</span> Bijoy ⇄ Unicode Conversion Engine
                </h3>
                <p className="text-[11px] text-muted font-sans">
                  পুরনো SutonnyMJ বা আধুনিক ইউনিকোড বাংলা রূপান্তর। বৈজ্ঞানিক চিহ্ন অক্ষত থাকবে।
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowConverterModal(false)}
                className="text-muted hover:text-canvas text-base p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Input Box */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] text-muted tracking-wider uppercase">
                    Input {conversionDirection === 'b2u' ? '(Bijoy/ANSI)' : '(Unicode)'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setInputText('')}
                    className="text-[10px] text-muted hover:text-canvas"
                  >
                    Clear
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={inputText}
                  onChange={(e) => handleAutoDetect(e.target.value)}
                  placeholder="Paste legacy Bijoy or Unicode text here..."
                  className="w-full text-xs p-2.5 bg-black border border-border text-canvas focus:border-accent outline-none font-mono"
                />
              </div>

              {/* Output Box */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] text-muted tracking-wider uppercase">
                    Converted {conversionDirection === 'b2u' ? '(Unicode)' : '(Bijoy/ANSI)'}
                  </label>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(convertedText)}
                    className="text-[10px] text-accent hover:underline"
                  >
                    Copy
                  </button>
                </div>
                <textarea
                  rows={6}
                  readOnly
                  value={convertedText}
                  placeholder="Output appears here..."
                  className="w-full text-xs p-2.5 bg-black border border-border text-canvas focus:border-accent outline-none font-mono"
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleConvert('b2u')}
                  className={`px-3 py-1 text-xs border transition-colors ${
                    conversionDirection === 'b2u'
                      ? 'bg-accent text-black font-semibold border-accent'
                      : 'bg-black text-muted border-border hover:text-canvas'
                  }`}
                >
                  Bijoy ➔ Unicode
                </button>
                <button
                  type="button"
                  onClick={() => handleConvert('u2b')}
                  className={`px-3 py-1 text-xs border transition-colors ${
                    conversionDirection === 'u2b'
                      ? 'bg-accent text-black font-semibold border-accent'
                      : 'bg-black text-muted border-border hover:text-canvas'
                  }`}
                >
                  Unicode ➔ Bijoy
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowConverterModal(false)}
                  className="px-3 py-1 text-xs text-muted hover:text-canvas border border-border"
                >
                  Close
                </button>
                {onInsertText && (
                  <button
                    type="button"
                    onClick={handleApplyToCanvas}
                    disabled={!convertedText}
                    className="px-4 py-1 text-xs font-semibold text-black bg-accent hover:bg-accent-hover disabled:opacity-30"
                  >
                    Insert to Editor
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
