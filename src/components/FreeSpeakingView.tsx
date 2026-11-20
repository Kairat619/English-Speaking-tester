import React from 'react';
import { SpeechState } from '../types';
import { RecordControl } from './RecordControl';
import { LiveTranscriptBox } from './LiveTranscriptBox';
import { MessageSquareText, Volume2, Sparkles } from 'lucide-react';
import { speakSentence } from '../utils/speechRecognition';

interface FreeSpeakingViewProps {
  speechState: SpeechState;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onReset: () => void;
  liveTranscript: string;
  finalTranscript: string;
  language: 'en-US' | 'en-GB';
  errorMessage?: string;
  onClearError?: () => void;
}

export const FreeSpeakingView: React.FC<FreeSpeakingViewProps> = ({
  speechState,
  onStartRecording,
  onStopRecording,
  onReset,
  liveTranscript,
  finalTranscript,
  language,
  errorMessage,
  onClearError,
}) => {
  const wordsSpoken = finalTranscript ? finalTranscript.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      {/* Friendly intro banner */}
      <div className="w-full bg-white rounded-3xl border-2 border-teal-200 shadow-sm p-5 sm:p-6 mb-4 text-center">
        <div className="inline-flex items-center gap-1.5 bg-teal-100 text-teal-800 font-extrabold text-xs uppercase px-3 py-1 rounded-full mb-2">
          <MessageSquareText className="w-3.5 h-3.5 text-teal-600" />
          <span>Mode A: Free Speaking</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 font-['Fredoka',sans-serif]">
          Say anything you want!
        </h2>
        <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
          Practice speaking complete English sentences freely. The microphone will write down everything it hears.
        </p>
      </div>

      {/* Live transcript during recording */}
      <LiveTranscriptBox
        transcript={liveTranscript}
        isRecording={speechState === 'recording'}
      />

      {/* Primary recording button */}
      <RecordControl
        speechState={speechState}
        onStartRecording={onStartRecording}
        onStopRecording={onStopRecording}
        onReset={onReset}
        errorMessage={errorMessage}
        onClearError={onClearError}
      />

      {/* Final transcript view */}
      {speechState === 'finished' && finalTranscript && (
        <div
          id="free-speaking-result-card"
          className="w-full bg-white rounded-3xl border-2 border-teal-300 shadow-md p-6 my-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-teal-100">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              Speech Result
            </span>
            <span className="text-xs font-semibold bg-teal-50 text-teal-700 px-2.5 py-1 rounded-lg border border-teal-200">
              {wordsSpoken} {wordsSpoken === 1 ? 'word' : 'words'} detected
            </span>
          </div>

          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
            You said:
          </p>

          <p className="text-xl sm:text-2xl font-bold text-slate-800 font-['Fredoka',sans-serif] leading-relaxed p-4 bg-teal-50/50 rounded-2xl border border-teal-200">
            "{finalTranscript}"
          </p>

          <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => speakSentence(finalTranscript, language)}
              className="inline-flex items-center gap-2 text-sm font-bold text-teal-800 bg-teal-100 hover:bg-teal-200 px-4 py-2 rounded-xl transition cursor-pointer"
            >
              <Volume2 className="w-4 h-4 text-teal-700" />
              <span>Listen back</span>
            </button>

            <button
              type="button"
              onClick={onReset}
              className="text-sm font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition cursor-pointer"
            >
              Say something else
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
