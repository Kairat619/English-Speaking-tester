import React from 'react';
import { AttemptResult, WordComparison } from '../types';
import { Volume2, CheckCircle2, AlertTriangle, ArrowRight, RotateCcw, Info } from 'lucide-react';
import { speakSentence } from '../utils/speechRecognition';

interface ResultCardProps {
  result: AttemptResult;
  language: 'en-US' | 'en-GB';
  showScores: boolean;
  showWordFeedback: boolean;
  onTryAgain: () => void;
  onNextSentence?: () => void;
  hasNextSentence?: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  language,
  showScores,
  showWordFeedback,
  onTryAgain,
  onNextSentence,
  hasNextSentence,
}) => {
  const handleListenExpected = () => {
    speakSentence(result.expectedText, language);
  };

  const handleListenSpoken = () => {
    speakSentence(result.recognizedText, language);
  };

  const score = result.matchScore;

  return (
    <div
      id="pronunciation-result-container"
      className="w-full max-w-2xl mx-auto bg-white rounded-3xl border-2 border-amber-200/90 shadow-md p-5 sm:p-7 my-4 animate-in fade-in slide-in-from-bottom-3 duration-300"
    >
      {/* Top Banner: Encouraging feedback & score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 font-['Fredoka',sans-serif] flex items-center gap-2">
            {result.feedbackTitle}
          </h2>
          <p className="text-sm font-medium text-slate-600 mt-0.5">
            {result.feedbackMessage}
          </p>
        </div>

        {showScores && (
          <div
            id="match-score-badge"
            className="self-start sm:self-center shrink-0 flex items-center gap-2 bg-amber-50 border-2 border-amber-300 px-4 py-2 rounded-2xl"
          >
            <span className="text-2xl font-black text-amber-900 font-['Fredoka',sans-serif]">
              {score}%
            </span>
            <div className="text-left">
              <span className="block text-[10px] uppercase font-extrabold tracking-wider text-amber-700">
                Speech Match
              </span>
              <span className="block text-xs font-semibold text-amber-900">
                {score >= 80 ? '✓ Recognized' : 'Needs practice'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Comparison Grid: Expected vs You Said */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
        {/* Expected Box */}
        <div
          id="expected-text-box"
          className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800">
                Expected
              </span>
              <button
                type="button"
                onClick={handleListenExpected}
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-950 bg-amber-200/70 hover:bg-amber-300/80 px-2 py-1 rounded-lg transition cursor-pointer"
                title="Listen to expected pronunciation"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-700" />
                <span>Hear</span>
              </button>
            </div>
            <p className="text-lg font-bold text-slate-900 font-['Fredoka',sans-serif] leading-relaxed">
              "{result.expectedText}"
            </p>
          </div>
        </div>

        {/* You Said Box */}
        <div
          id="recognized-text-box"
          className={`p-4 rounded-2xl border flex flex-col justify-between ${
            score >= 80
              ? 'bg-emerald-50/70 border-emerald-200'
              : 'bg-amber-50/50 border-amber-200'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                You said
              </span>
              {result.recognizedText && (
                <button
                  type="button"
                  onClick={handleListenSpoken}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-200/70 hover:bg-emerald-300/80 px-2 py-1 rounded-lg transition cursor-pointer"
                  title="Listen to what was recognized"
                >
                  <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Hear</span>
                </button>
              )}
            </div>
            <p className="text-lg font-bold text-slate-900 font-['Fredoka',sans-serif] leading-relaxed">
              {result.recognizedText ? (
                `"${result.recognizedText}"`
              ) : (
                <span className="text-slate-400 font-normal italic">
                  (No speech detected)
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Word-Level Breakdown if enabled */}
      {showWordFeedback && result.wordComparisons && result.wordComparisons.length > 0 && (
        <div id="word-level-feedback" className="my-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Word-by-word Breakdown
            </span>
            <span className="text-[11px] text-slate-500">
              Click a word for hints
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {result.wordComparisons.map((item: WordComparison) => {
              const isCorrect = item.status === 'correct';
              return (
                <div
                  key={item.id}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-bold transition-all shadow-2xs ${
                    isCorrect
                      ? 'bg-emerald-100/80 border-emerald-300 text-emerald-900'
                      : 'bg-amber-100 border-amber-300 text-amber-950 ring-1 ring-amber-400/50'
                  }`}
                  title={item.note || (isCorrect ? '✓ Correct' : 'Check this word')}
                >
                  {isCorrect ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  )}
                  <span>{item.word}</span>
                  {!isCorrect && (
                    <span className="text-[10px] bg-amber-200 text-amber-900 px-1 py-0.2 rounded font-semibold">
                      check
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action buttons: Try Again & Next Sentence */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-4 border-t border-amber-100">
        <button
          id="result-try-again-btn"
          type="button"
          onClick={onTryAgain}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-sm sm:text-base shadow-sm hover:shadow transition cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Try Again</span>
        </button>

        {hasNextSentence && onNextSentence && (
          <button
            id="result-next-sentence-btn"
            type="button"
            onClick={onNextSentence}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold text-sm sm:text-base shadow-sm hover:shadow transition cursor-pointer"
          >
            <span>Next Sentence</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Teacher Pronunciation Disclaimer (Mandatory Requirement #9) */}
      <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-start gap-2 text-[11px] text-slate-500">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <p>
          <strong>Teacher Note:</strong> This score measures how closely the speech-recognition system understood the student's words. It is not a professional pronunciation assessment.
        </p>
      </div>
    </div>
  );
};
