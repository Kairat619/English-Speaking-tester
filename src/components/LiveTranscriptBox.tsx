import React from 'react';
import { Mic } from 'lucide-react';

interface LiveTranscriptBoxProps {
  transcript: string;
  isRecording: boolean;
}

export const LiveTranscriptBox: React.FC<LiveTranscriptBoxProps> = ({
  transcript,
  isRecording,
}) => {
  if (!isRecording && !transcript) return null;

  return (
    <div
      id="live-transcript-box"
      className="w-full max-w-xl mx-auto my-3 p-4 rounded-2xl bg-amber-50/90 border border-amber-300/80 shadow-xs transition-all"
    >
      <div className="flex items-center gap-2 mb-1.5 text-xs font-bold uppercase tracking-wider text-amber-800">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
        <Mic className="w-3.5 h-3.5 text-rose-600" />
        <span>Live Speech Detection</span>
      </div>

      <p className="text-xs font-semibold text-slate-500 mb-1">You said:</p>

      <div className="min-h-[44px] flex items-center bg-white rounded-xl p-3 border border-amber-200">
        <p className="text-base sm:text-lg font-bold text-slate-800 tracking-normal font-['Fredoka',sans-serif]">
          {transcript ? (
            <>
              "{transcript}"
              <span className="inline-block w-1.5 h-4 ml-1 bg-amber-500 animate-pulse align-middle" />
            </>
          ) : (
            <span className="text-slate-400 font-normal italic">
              Listening... speak into your microphone now
            </span>
          )}
        </p>
      </div>
    </div>
  );
};
