import React, { useEffect, useState } from 'react';
import { SpeechState } from '../types';
import { Mic, Square, Loader2, RotateCcw, Lightbulb, AlertCircle } from 'lucide-react';

interface RecordControlProps {
  speechState: SpeechState;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onReset: () => void;
  errorMessage?: string;
  onClearError?: () => void;
}

export const RecordControl: React.FC<RecordControlProps> = ({
  speechState,
  onStartRecording,
  onStopRecording,
  onReset,
  errorMessage,
  onClearError,
}) => {
  const [seconds, setSeconds] = useState(0);

  // Timer while recording
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (speechState === 'recording') {
      setSeconds(0);
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [speechState]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full flex flex-col items-center justify-center my-4 sm:my-6">
      {/* Error alert if any */}
      {errorMessage && (
        <div
          id="speech-error-banner"
          className="w-full max-w-lg mb-4 p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-800 text-sm flex items-start gap-3 shadow-xs animate-in fade-in"
        >
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Oops!</p>
            <p className="text-rose-700 mt-0.5">{errorMessage}</p>
          </div>
          {onClearError && (
            <button
              type="button"
              onClick={onClearError}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 underline cursor-pointer"
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      {/* Recording status badge and timer */}
      {speechState === 'recording' && (
        <div
          id="recording-indicator"
          className="flex items-center gap-3 px-5 py-2.5 mb-4 rounded-full bg-rose-100/90 border-2 border-rose-400 text-rose-800 shadow-sm animate-pulse"
        >
          <span className="w-3.5 h-3.5 rounded-full bg-rose-600 animate-ping" />
          <span className="font-bold text-sm sm:text-base">🔴 Recording...</span>
          <span className="font-mono font-extrabold text-sm sm:text-base bg-rose-200 px-2.5 py-0.5 rounded-lg">
            {formatTimer(seconds)}
          </span>
        </div>
      )}

      {speechState === 'processing' && (
        <div
          id="processing-indicator"
          className="flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold text-sm shadow-xs"
        >
          <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
          <span>Processing speech...</span>
        </div>
      )}

      {/* Main big action button */}
      <div className="relative flex items-center justify-center">
        {speechState === 'ready' && (
          <button
            id="start-recording-btn"
            type="button"
            onClick={onStartRecording}
            className="group relative flex items-center justify-center gap-3 px-8 sm:px-10 py-5 sm:py-6 rounded-3xl bg-linear-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-extrabold text-lg sm:text-xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-150 cursor-pointer border-b-4 border-emerald-800"
          >
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <span>🎙 START RECORDING</span>
          </button>
        )}

        {speechState === 'recording' && (
          <button
            id="stop-recording-btn"
            type="button"
            onClick={onStopRecording}
            className="group relative flex items-center justify-center gap-3 px-8 sm:px-10 py-5 sm:py-6 rounded-3xl bg-linear-to-b from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-extrabold text-lg sm:text-xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-150 cursor-pointer border-b-4 border-rose-800 ring-4 ring-rose-200/80"
          >
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center group-hover:scale-95 transition-transform">
              <Square className="w-5 h-5 fill-white text-white" />
            </div>
            <span>⏹ STOP RECORDING</span>
          </button>
        )}

        {speechState === 'processing' && (
          <button
            id="processing-btn"
            type="button"
            disabled
            className="flex items-center justify-center gap-3 px-8 sm:px-10 py-5 sm:py-6 rounded-3xl bg-slate-200 text-slate-500 font-extrabold text-lg sm:text-xl cursor-not-allowed border-b-4 border-slate-300"
          >
            <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
            <span>⏳ Processing...</span>
          </button>
        )}

        {speechState === 'finished' && (
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              id="try-again-btn"
              type="button"
              onClick={onReset}
              className="flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-base sm:text-lg shadow-md hover:shadow-lg transition-all cursor-pointer border-b-3 border-amber-700"
            >
              <RotateCcw className="w-5 h-5" />
              <span>🔄 TRY AGAIN</span>
            </button>
          </div>
        )}

        {speechState === 'error' && (
          <button
            id="retry-after-error-btn"
            type="button"
            onClick={onReset}
            className="flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-base shadow-md cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        )}
      </div>

      {/* Educational tip bar */}
      <div className="mt-5 max-w-md w-full bg-amber-100/60 border border-amber-200/80 rounded-2xl px-4 py-2.5 text-center text-xs sm:text-sm text-amber-900 font-medium flex items-center justify-center gap-2">
        <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          <strong>Tip:</strong> Speak clearly and don't rush. Take a breath → speak slowly → finish the sentence.
        </span>
      </div>
    </div>
  );
};
