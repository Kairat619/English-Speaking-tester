import React, { useState } from 'react';
import { AttemptResult, TeacherSettings, TestSentence } from '../types';
import {
  X,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  RotateCcw,
  Download,
  Check,
  Globe,
  Sliders,
  Award,
  ShieldCheck,
  ListPlus,
  Volume2
} from 'lucide-react';
import { DEFAULT_SENTENCES } from '../utils/storage';

interface TeacherModalProps {
  isOpen: boolean;
  initialTab?: 'sentences' | 'settings' | 'results';
  onClose: () => void;
  sentences: TestSentence[];
  onSaveSentences: (sentences: TestSentence[]) => void;
  settings: TeacherSettings;
  onSaveSettings: (settings: TeacherSettings) => void;
  attempts: AttemptResult[];
  onClearAttempts: () => void;
}

export const TeacherModal: React.FC<TeacherModalProps> = ({
  isOpen,
  initialTab = 'sentences',
  onClose,
  sentences,
  onSaveSentences,
  settings,
  onSaveSettings,
  attempts,
  onClearAttempts,
}) => {
  const [activeTab, setActiveTab] = useState<'sentences' | 'settings' | 'results' | 'privacy'>(
    initialTab
  );

  // Sentences editing state
  const [newSentenceText, setNewSentenceText] = useState('');
  const [newSentenceCategory, setNewSentenceCategory] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  if (!isOpen) return null;

  // Add new sentence
  const handleAddSentence = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSentenceText.trim();
    if (!trimmed) return;

    const newSentence: TestSentence = {
      id: `sent-${Date.now()}`,
      text: trimmed,
      category: newSentenceCategory.trim() || 'Custom',
    };

    onSaveSentences([...sentences, newSentence]);
    setNewSentenceText('');
    setNewSentenceCategory('');
  };

  // Delete sentence
  const handleDeleteSentence = (id: string) => {
    if (sentences.length <= 1) {
      alert('You need at least one test sentence.');
      return;
    }
    onSaveSentences(sentences.filter((s) => s.id !== id));
  };

  // Move sentence up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const reordered = [...sentences];
    const temp = reordered[index - 1];
    reordered[index - 1] = reordered[index];
    reordered[index] = temp;
    onSaveSentences(reordered);
  };

  // Move sentence down
  const handleMoveDown = (index: number) => {
    if (index === sentences.length - 1) return;
    const reordered = [...sentences];
    const temp = reordered[index + 1];
    reordered[index + 1] = reordered[index];
    reordered[index] = temp;
    onSaveSentences(reordered);
  };

  // Save edit
  const handleSaveEdit = (id: string) => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    onSaveSentences(
      sentences.map((s) => (s.id === id ? { ...s, text: trimmed } : s))
    );
    setEditingId(null);
  };

  // Restore default sentences
  const handleRestoreDefaults = () => {
    if (confirm('Restore the default classroom test sentences?')) {
      onSaveSentences(DEFAULT_SENTENCES);
    }
  };

  // Export results to CSV
  const handleExportCSV = () => {
    if (attempts.length === 0) return;
    const headers = ['Student', 'Date', 'Expected Sentence', 'Recognized Speech', 'Match Score %'];
    const rows = attempts.map((a) => [
      `"${a.studentName.replace(/"/g, '""')}"`,
      `"${new Date(a.timestamp).toLocaleString().replace(/"/g, '""')}"`,
      `"${a.expectedText.replace(/"/g, '""')}"`,
      `"${a.recognizedText.replace(/"/g, '""')}"`,
      a.matchScore,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pronunciation_results_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      id="teacher-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
    >
      <div
        id="teacher-modal-dialog"
        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95"
      >
        {/* Modal Header */}
        <div className="bg-amber-500 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-amber-100" />
            <h2 className="text-xl font-bold font-['Fredoka',sans-serif]">
              Teacher & Classroom Setup
            </h2>
          </div>
          <button
            id="close-teacher-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-amber-600 transition cursor-pointer"
            title="Close"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('sentences')}
            className={`px-4 py-2.5 rounded-t-2xl font-bold text-sm flex items-center gap-2 border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'sentences'
                ? 'bg-white text-amber-800 border-amber-500 shadow-xs'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <ListPlus className="w-4 h-4 text-amber-600" />
            <span>Test Sentences ({sentences.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 rounded-t-2xl font-bold text-sm flex items-center gap-2 border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-white text-amber-800 border-amber-500 shadow-xs'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <Globe className="w-4 h-4 text-teal-600" />
            <span>Settings & Language</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('results')}
            className={`px-4 py-2.5 rounded-t-2xl font-bold text-sm flex items-center gap-2 border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'results'
                ? 'bg-white text-amber-800 border-amber-500 shadow-xs'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4 text-indigo-600" />
            <span>Classroom Results ({attempts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2.5 rounded-t-2xl font-bold text-sm flex items-center gap-2 border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'bg-white text-amber-800 border-amber-500 shadow-xs'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Privacy</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-5 overflow-y-auto flex-1 text-slate-800">
          {/* TAB 1: TEST SENTENCES */}
          {activeTab === 'sentences' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-base text-slate-800 font-['Fredoka',sans-serif]">
                    Classroom Test Sentences
                  </h3>
                  <p className="text-xs text-slate-500">
                    Add, edit, reorder or delete sentences that students will practice.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRestoreDefaults}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-xl transition cursor-pointer self-start"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Defaults</span>
                </button>
              </div>

              {/* Add new sentence form */}
              <form
                onSubmit={handleAddSentence}
                className="bg-amber-50/60 border border-amber-200 rounded-2xl p-3.5 flex flex-col sm:flex-row gap-2"
              >
                <input
                  type="text"
                  placeholder="Enter a new English sentence..."
                  value={newSentenceText}
                  onChange={(e) => setNewSentenceText(e.target.value)}
                  className="flex-1 bg-white border border-amber-300 rounded-xl px-3.5 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-amber-400"
                />
                <input
                  type="text"
                  placeholder="Category (e.g. Greetings)"
                  value={newSentenceCategory}
                  onChange={(e) => setNewSentenceCategory(e.target.value)}
                  className="w-full sm:w-36 bg-white border border-amber-300 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-amber-400"
                />
                <button
                  type="submit"
                  disabled={!newSentenceText.trim()}
                  className="inline-flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-sm px-4 py-2 rounded-xl transition cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Sentence</span>
                </button>
              </form>

              {/* Sentences List */}
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {sentences.map((sent, idx) => (
                  <div
                    key={sent.id}
                    className="flex items-center justify-between gap-3 p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl transition"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>

                      {editingId === sent.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="flex-1 bg-amber-50 border border-amber-400 rounded-lg px-2.5 py-1 text-sm font-bold outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(sent.id)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-800 truncate">
                            "{sent.text}"
                          </p>
                          {sent.category && (
                            <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-1.5 py-0.5 rounded">
                              {sent.category}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                        className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                        title="Move Up"
                      >
                        <MoveUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(idx)}
                        disabled={idx === sentences.length - 1}
                        className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                        title="Move Down"
                      >
                        <MoveDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(sent.id);
                          setEditText(sent.text);
                        }}
                        className="px-2 py-1 text-xs font-bold text-amber-700 hover:bg-amber-50 rounded-lg cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSentence(sent.id)}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: TEACHER SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-base text-slate-800 font-['Fredoka',sans-serif]">
                  Recognition & Display Settings
                </h3>
                <p className="text-xs text-slate-500">
                  Configure English dialect and student interface visibility.
                </p>
              </div>

              {/* Language selection */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Speech Recognition Accent / Dialect
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => onSaveSettings({ ...settings, language: 'en-US' })}
                    className={`flex items-center justify-between p-3.5 rounded-xl border-2 text-left transition cursor-pointer ${
                      settings.language === 'en-US'
                        ? 'bg-amber-50/80 border-amber-500 text-amber-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 font-medium'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold">English (US)</p>
                      <p className="text-xs text-slate-500">en-US standard pronunciation</p>
                    </div>
                    {settings.language === 'en-US' && <Check className="w-5 h-5 text-amber-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSaveSettings({ ...settings, language: 'en-GB' })}
                    className={`flex items-center justify-between p-3.5 rounded-xl border-2 text-left transition cursor-pointer ${
                      settings.language === 'en-GB'
                        ? 'bg-amber-50/80 border-amber-500 text-amber-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 font-medium'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold">English (UK)</p>
                      <p className="text-xs text-slate-500">en-GB British pronunciation</p>
                    </div>
                    {settings.language === 'en-GB' && <Check className="w-5 h-5 text-amber-600" />}
                  </button>
                </div>
              </div>

              {/* Toggle Switches */}
              <div className="space-y-3">
                {/* Live transcription */}
                <label className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Live Speech Transcription</p>
                    <p className="text-xs text-slate-500">
                      Show recognized words in real-time as the child speaks
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showLiveTranscription}
                    onChange={(e) =>
                      onSaveSettings({ ...settings, showLiveTranscription: e.target.checked })
                    }
                    className="w-5 h-5 accent-amber-500 rounded"
                  />
                </label>

                {/* Show score percentage */}
                <label className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Display Recognition Match Score</p>
                    <p className="text-xs text-slate-500">
                      Show the percentage match score (e.g., 92% Speech Recognition Match)
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showScores}
                    onChange={(e) =>
                      onSaveSettings({ ...settings, showScores: e.target.checked })
                    }
                    className="w-5 h-5 accent-amber-500 rounded"
                  />
                </label>

                {/* Show word-level breakdown */}
                <label className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Word-Level Feedback Pills</p>
                    <p className="text-xs text-slate-500">
                      Highlight individual correct and missed words
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showWordFeedback}
                    onChange={(e) =>
                      onSaveSettings({ ...settings, showWordFeedback: e.target.checked })
                    }
                    className="w-5 h-5 accent-amber-500 rounded"
                  />
                </label>

                {/* Sound effects */}
                <label className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Audio Feedback Chimes</p>
                    <p className="text-xs text-slate-500">
                      Play gentle audio chimes on recording start and completion
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.soundEffects}
                    onChange={(e) =>
                      onSaveSettings({ ...settings, soundEffects: e.target.checked })
                    }
                    className="w-5 h-5 accent-amber-500 rounded"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: CLASSROOM RESULTS */}
          {activeTab === 'results' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-base text-slate-800 font-['Fredoka',sans-serif]">
                    Today's Classroom Results
                  </h3>
                  <p className="text-xs text-slate-500">
                    Saved locally in the browser session.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {attempts.length > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={handleExportCSV}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export CSV</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Clear all stored practice attempts?')) {
                            onClearAttempts();
                          }
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Clear All</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {attempts.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-600">No attempts recorded yet</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    When students practice sentences, their scores and transcripts will show up here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                  {attempts.map((att) => (
                    <div
                      key={att.id}
                      className="p-3 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm text-slate-900">
                            {att.studentName || 'Student'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(att.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          <strong>Expected:</strong> "{att.expectedText}"
                        </p>
                        <p className="text-xs text-slate-800 font-medium truncate mt-0.5">
                          <strong>Said:</strong> "{att.recognizedText}"
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        <span
                          className={`text-sm font-extrabold px-3 py-1 rounded-xl border ${
                            att.matchScore >= 80
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          {att.matchScore}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PRIVACY */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 max-w-xl">
              <div className="flex items-center gap-2 text-emerald-700">
                <ShieldCheck className="w-6 h-6" />
                <h3 className="font-bold text-lg font-['Fredoka',sans-serif]">
                  Children's Privacy Protection
                </h3>
              </div>

              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 text-sm text-emerald-950 leading-relaxed space-y-2">
                <p className="font-bold">
                  "Your speech is used for this pronunciation exercise. No audio recording is stored by this app."
                </p>
                <p className="text-xs text-emerald-800">
                  This application utilizes browser-native Web Speech API speech recognition. Audio streams are processed locally in real-time and are never uploaded, archived, or transmitted to any external audio database.
                </p>
              </div>

              <div className="text-xs text-slate-600 space-y-2">
                <p className="font-bold text-slate-800">Educational Design Guarantees:</p>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  <li>No account registration or login required</li>
                  <li>No collection of emails, passwords, or personal identifying data</li>
                  <li>Session attempts remain in the local browser cache (localStorage)</li>
                  <li>Encouraging educational framing designed for non-native English learners</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-xs cursor-pointer"
          >
            Done & Return to Student Practice
          </button>
        </div>
      </div>
    </div>
  );
};
