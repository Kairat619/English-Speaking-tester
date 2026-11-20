/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AppMode,
  AttemptResult,
  SpeechState,
  TeacherSettings,
  TestSentence,
} from './types';
import {
  loadSentences,
  saveSentences,
  loadTeacherSettings,
  saveTeacherSettings,
  loadAttempts,
  saveAttempt,
  clearAttempts,
  loadStudentName,
  saveStudentName,
} from './utils/storage';
import {
  SpeechRecognizer,
  isSpeechRecognitionSupported,
} from './utils/speechRecognition';
import {
  calculateMatchScore,
  compareWords,
  getFeedbackMessage,
} from './utils/textComparison';
import { playChime } from './utils/soundEffects';

import { StudentHeader } from './components/StudentHeader';
import { SentenceCard } from './components/SentenceCard';
import { RecordControl } from './components/RecordControl';
import { LiveTranscriptBox } from './components/LiveTranscriptBox';
import { ResultCard } from './components/ResultCard';
import { FreeSpeakingView } from './components/FreeSpeakingView';
import { TeacherModal } from './components/TeacherModal';
import { AlertCircle, Keyboard, MicOff } from 'lucide-react';

export default function App() {
  // ==========================================
  // APP STATE & STUDENT MANAGEMENT
  // ==========================================
  const [mode, setMode] = useState<AppMode>('test');
  const [studentName, setStudentName] = useState<string>(() => loadStudentName());
  const [sentences, setSentences] = useState<TestSentence[]>(() => loadSentences());
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number>(0);
  const [settings, setSettings] = useState<TeacherSettings>(() => loadTeacherSettings());
  const [attempts, setAttempts] = useState<AttemptResult[]>(() => loadAttempts());

  // Teacher modal state
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [teacherInitialTab, setTeacherInitialTab] = useState<'sentences' | 'settings' | 'results'>('sentences');

  // ==========================================
  // RECORDING & TRANSCRIPTION STATE
  // ==========================================
  const [speechState, setSpeechState] = useState<SpeechState>('ready');
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [finalTranscript, setFinalTranscript] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSupported, setIsSupported] = useState<boolean>(true);

  // Manual fallback simulation dialog for test environments without microphone
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [manualInputText, setManualInputText] = useState<string>('');

  // Latest evaluation result for Pronunciation Test mode
  const [currentResult, setCurrentResult] = useState<AttemptResult | null>(null);

  // Speech Recognizer instance ref
  const recognizerRef = useRef<SpeechRecognizer | null>(null);

  // ==========================================
  // INITIALIZATION & LIFECYCLE
  // ==========================================
  useEffect(() => {
    setIsSupported(isSpeechRecognitionSupported());
    recognizerRef.current = new SpeechRecognizer(settings.language);
  }, []);

  // Update recognizer language whenever settings change
  useEffect(() => {
    if (recognizerRef.current) {
      recognizerRef.current.setLanguage(settings.language);
    }
  }, [settings.language]);

  const currentSentence = sentences[currentSentenceIndex] || sentences[0] || {
    id: 'default',
    text: 'Hello, my name is Sarah.',
    category: 'General',
  };

  // ==========================================
  // STUDENT NAME UPDATE
  // ==========================================
  const handleUpdateStudentName = (newName: string) => {
    setStudentName(newName);
    saveStudentName(newName);
  };

  // ==========================================
  // RESET ATTEMPT
  // ==========================================
  const resetAttempt = useCallback(() => {
    if (recognizerRef.current) {
      recognizerRef.current.abort();
    }
    setSpeechState('ready');
    setLiveTranscript('');
    setFinalTranscript('');
    setErrorMessage('');
    setCurrentResult(null);
  }, []);

  // When switching modes or changing sentence, reset current attempt
  const handleSelectMode = (newMode: AppMode) => {
    resetAttempt();
    setMode(newMode);
  };

  const handleSelectSentenceIndex = (index: number) => {
    resetAttempt();
    setCurrentSentenceIndex(index);
  };

  const handlePreviousSentence = () => {
    if (currentSentenceIndex > 0) {
      handleSelectSentenceIndex(currentSentenceIndex - 1);
    }
  };

  const handleNextSentence = () => {
    if (currentSentenceIndex < sentences.length - 1) {
      handleSelectSentenceIndex(currentSentenceIndex + 1);
    }
  };

  // ==========================================
  // PROCESS TRANSCRIPT & EVALUATE
  // ==========================================
  const processTranscript = useCallback(
    (spokenText: string) => {
      const trimmedText = spokenText.trim();
      setFinalTranscript(trimmedText);
      setLiveTranscript('');

      if (!trimmedText) {
        setSpeechState('error');
        setErrorMessage("We didn't hear anything. Please speak into the microphone and try again.");
        playChime('pop', settings.soundEffects);
        return;
      }

      if (mode === 'test') {
        const expected = currentSentence.text;
        const score = calculateMatchScore(expected, trimmedText);
        const feedback = getFeedbackMessage(score);
        const wordDiffs = compareWords(expected, trimmedText);

        const newResult: AttemptResult = {
          id: `attempt-${Date.now()}`,
          studentName: studentName.trim() || 'Student',
          timestamp: Date.now(),
          mode: 'test',
          expectedText: expected,
          recognizedText: trimmedText,
          matchScore: score,
          feedbackTitle: feedback.title,
          feedbackMessage: feedback.message,
          wordComparisons: wordDiffs,
        };

        setCurrentResult(newResult);
        const updatedAttempts = saveAttempt(newResult);
        setAttempts(updatedAttempts);

        // Sound effect based on score
        if (score >= 80) {
          playChime('success', settings.soundEffects);
        } else {
          playChime('encourage', settings.soundEffects);
        }
      } else {
        // Free speaking mode
        playChime('pop', settings.soundEffects);
      }

      setSpeechState('finished');
    },
    [mode, currentSentence, studentName, settings.soundEffects]
  );

  // ==========================================
  // SPEECH RECOGNITION HANDLERS
  // ==========================================
  const startRecording = () => {
    setErrorMessage('');
    setLiveTranscript('');
    setFinalTranscript('');
    setCurrentResult(null);

    if (!isSupported) {
      setErrorMessage(
        'Speech recognition is not supported in this browser. Please try Google Chrome, Microsoft Edge, or use the Practice Simulator below.'
      );
      setSpeechState('error');
      return;
    }

    if (!recognizerRef.current) {
      recognizerRef.current = new SpeechRecognizer(settings.language);
    }

    playChime('start', settings.soundEffects);
    setSpeechState('recording');

    recognizerRef.current.start({
      onStart: () => {
        setSpeechState('recording');
      },
      onInterim: (interim) => {
        if (settings.showLiveTranscription) {
          setLiveTranscript(interim);
        }
      },
      onResult: (finalText) => {
        processTranscript(finalText);
      },
      onError: (friendlyMsg) => {
        setSpeechState('error');
        setErrorMessage(friendlyMsg);
        playChime('pop', settings.soundEffects);
      },
      onEnd: () => {
        // Handled through onResult or reset
      },
    });
  };

  const stopRecording = () => {
    playChime('stop', settings.soundEffects);
    setSpeechState('processing');

    if (recognizerRef.current) {
      const finalRecorded = recognizerRef.current.stop();
      // If recognition onresult already triggered, processing will complete
      // If no result was returned after a short grace period, check fallback
      setTimeout(() => {
        setSpeechState((curr) => {
          if (curr === 'processing') {
            if (finalRecorded) {
              processTranscript(finalRecorded);
              return 'finished';
            }
            if (liveTranscript) {
              processTranscript(liveTranscript);
              return 'finished';
            }
            setErrorMessage("We didn't hear anything. Please try again.");
            return 'error';
          }
          return curr;
        });
      }, 700);
    }
  };

  // Fallback test simulation: allows students/teachers to test speech input even if mic permission is blocked in preview
  const handleApplyManualSpeech = () => {
    if (!manualInputText.trim()) return;
    setShowManualInput(false);
    processTranscript(manualInputText.trim());
    setManualInputText('');
  };

  // ==========================================
  // TEACHER MODAL ACTIONS
  // ==========================================
  const handleOpenTeacherModal = (tab: 'sentences' | 'settings' | 'results' = 'sentences') => {
    setTeacherInitialTab(tab);
    setIsTeacherModalOpen(true);
  };

  const handleSaveSentences = (newSentences: TestSentence[]) => {
    setSentences(newSentences);
    saveSentences(newSentences);
    if (currentSentenceIndex >= newSentences.length) {
      setCurrentSentenceIndex(Math.max(0, newSentences.length - 1));
    }
  };

  const handleSaveSettings = (newSettings: TeacherSettings) => {
    setSettings(newSettings);
    saveTeacherSettings(newSettings);
  };

  const handleClearAttempts = () => {
    clearAttempts();
    setAttempts([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/40 text-slate-800 font-['Nunito',sans-serif]">
      {/* Top Application Header */}
      <StudentHeader
        studentName={studentName}
        onUpdateStudentName={handleUpdateStudentName}
        activeMode={mode}
        onSelectMode={handleSelectMode}
        onOpenTeacherModal={handleOpenTeacherModal}
        resultsCount={attempts.length}
      />

      {/* Main Learning Workspace */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col justify-start">
        {/* Unsupported browser alert if Web Speech API isn't present */}
        {!isSupported && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-100/90 border border-amber-300 text-amber-950 text-sm flex items-start gap-3 shadow-xs">
            <MicOff className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Speech Recognition Notice</p>
              <p className="mt-0.5 text-xs text-amber-900">
                Native speech recognition is best supported in Google Chrome and Microsoft Edge. You can also use the Practice Simulator below to test sentences!
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowManualInput(true)}
              className="text-xs font-bold bg-amber-600 text-white px-3 py-1.5 rounded-xl hover:bg-amber-700 cursor-pointer shrink-0"
            >
              Open Simulator
            </button>
          </div>
        )}

        {/* MODE A: Free Speaking */}
        {mode === 'free' && (
          <FreeSpeakingView
            speechState={speechState}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            onReset={resetAttempt}
            liveTranscript={liveTranscript}
            finalTranscript={finalTranscript}
            language={settings.language}
            errorMessage={errorMessage}
            onClearError={() => setErrorMessage('')}
          />
        )}

        {/* MODE B: Pronunciation Test */}
        {mode === 'test' && (
          <div className="w-full flex flex-col items-center">
            {/* Target Sentence Card */}
            <SentenceCard
              sentence={currentSentence}
              currentIndex={currentSentenceIndex}
              totalCount={sentences.length}
              language={settings.language}
              onPrevious={handlePreviousSentence}
              onNext={handleNextSentence}
              onSelectIndex={handleSelectSentenceIndex}
              allSentences={sentences}
            />

            {/* Live speech feedback while recording */}
            {settings.showLiveTranscription && (
              <LiveTranscriptBox
                transcript={liveTranscript}
                isRecording={speechState === 'recording'}
              />
            )}

            {/* Recording Controls */}
            <RecordControl
              speechState={speechState}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              onReset={resetAttempt}
              errorMessage={errorMessage}
              onClearError={() => setErrorMessage('')}
            />

            {/* Test Result Card when completed */}
            {speechState === 'finished' && currentResult && (
              <ResultCard
                result={currentResult}
                language={settings.language}
                showScores={settings.showScores}
                showWordFeedback={settings.showWordFeedback}
                onTryAgain={resetAttempt}
                onNextSentence={handleNextSentence}
                hasNextSentence={currentSentenceIndex < sentences.length - 1}
              />
            )}
          </div>
        )}

        {/* Quick simulator shortcut toggle for teachers or testing without a microphone */}
        <div className="mt-auto pt-8 pb-4 flex items-center justify-center">
          <button
            id="open-manual-tester-btn"
            type="button"
            onClick={() => setShowManualInput(true)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Practice Simulator (Type speech manually)</span>
          </button>
        </div>
      </main>

      {/* Manual Input Modal for Practice Simulation / Testing without Mic */}
      {showManualInput && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-800 font-['Fredoka',sans-serif] mb-2 flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-amber-500" />
              Practice Simulator
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter what the student said to test the recognition match algorithm and word-level feedback:
            </p>

            <textarea
              value={manualInputText}
              onChange={(e) => setManualInputText(e.target.value)}
              placeholder={`e.g. ${currentSentence.text}`}
              rows={3}
              className="w-full p-3 text-sm font-medium border border-slate-300 rounded-2xl outline-none focus:ring-2 focus:ring-amber-400 mb-4"
              autoFocus
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowManualInput(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyManualSpeech}
                disabled={!manualInputText.trim()}
                className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl shadow-xs cursor-pointer"
              >
                Evaluate Speech
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Settings & Sentence Management Modal */}
      <TeacherModal
        isOpen={isTeacherModalOpen}
        initialTab={teacherInitialTab}
        onClose={() => setIsTeacherModalOpen(false)}
        sentences={sentences}
        onSaveSentences={handleSaveSentences}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        attempts={attempts}
        onClearAttempts={handleClearAttempts}
      />
    </div>
  );
}
