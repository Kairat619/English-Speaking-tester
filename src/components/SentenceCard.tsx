import React, { useState } from 'react';
import { TestSentence } from '../types';
import { Volume2, VolumeX, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { speakSentence, stopSpeaking } from '../utils/speechRecognition';

interface SentenceCardProps {
  sentence: TestSentence;
  currentIndex: number;
  totalCount: number;
  language: 'en-US' | 'en-GB';
  onPrevious: () => void;
  onNext: () => void;
  onSelectIndex: (index: number) => void;
  allSentences: TestSentence[];
}

export const SentenceCard: React.FC<SentenceCardProps> = ({
  sentence,
  currentIndex,
  totalCount,
  language,
  onPrevious,
  onNext,
  onSelectIndex,
  allSentences,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleListen = () => {
    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);
    speakSentence(sentence.text, language, () => {
      setIsPlayingAudio(false);
    });
  };

  return (
    <div
      id="expected-sentence-card"
      className="w-full bg-white rounded-3xl border-2 border-amber-200/90 shadow-sm p-5 sm:p-7 relative transition-all"
    >
      {/* Top row: Counter & Categories & Quick select */}
      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-amber-100">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100/90 px-2.5 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Sentence {currentIndex + 1} of {totalCount}
          </span>
          {sentence.category && (
            <span className="hidden sm:inline-block text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              {sentence.category}
            </span>
          )}
        </div>

        {/* Quick sentence dropdown */}
        <div className="flex items-center gap-1">
          <button
            id="prev-sentence-btn"
            type="button"
            onClick={onPrevious}
            disabled={currentIndex === 0}
            className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
            title="Previous sentence"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <select
            id="sentence-picker-select"
            aria-label="Select sentence to practice"
            value={currentIndex}
            onChange={(e) => onSelectIndex(Number(e.target.value))}
            className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 outline-none cursor-pointer"
          >
            {allSentences.map((s, idx) => (
              <option key={s.id} value={idx}>
                #{idx + 1}: {s.text.length > 25 ? s.text.slice(0, 25) + '...' : s.text}
              </option>
            ))}
          </select>

          <button
            id="next-sentence-btn"
            type="button"
            onClick={onNext}
            disabled={currentIndex === totalCount - 1}
            className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
            title="Next sentence"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main instruction & sentence */}
      <div className="text-center py-2 sm:py-4">
        <p className="text-sm sm:text-base font-bold text-amber-700 uppercase tracking-wide mb-2">
          Say this sentence:
        </p>

        <p
          id="target-sentence-text"
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug font-['Fredoka',sans-serif]"
        >
          "{sentence.text}"
        </p>
      </div>

      {/* Listen button */}
      <div className="flex justify-center mt-3 sm:mt-4">
        <button
          id="listen-audio-btn"
          type="button"
          onClick={handleListen}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold transition-all cursor-pointer shadow-xs ${
            isPlayingAudio
              ? 'bg-amber-500 text-white ring-4 ring-amber-200 animate-pulse'
              : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
          }`}
          title="Listen to native pronunciation"
        >
          {isPlayingAudio ? (
            <>
              <VolumeX className="w-4 h-4" />
              <span>Playing speech...</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-amber-700" />
              <span>Listen to sentence</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
