import React, { useState } from 'react';
import { AppMode } from '../types';
import { Mic, Volume2, Settings, User, BookOpen, MessageSquareText, Award } from 'lucide-react';

interface StudentHeaderProps {
  studentName: string;
  onUpdateStudentName: (name: string) => void;
  activeMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  onOpenTeacherModal: (tab?: 'sentences' | 'settings' | 'results') => void;
  resultsCount: number;
}

export const StudentHeader: React.FC<StudentHeaderProps> = ({
  studentName,
  onUpdateStudentName,
  activeMode,
  onSelectMode,
  onOpenTeacherModal,
  resultsCount,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(studentName);

  const handleSaveName = () => {
    const trimmed = tempName.trim();
    if (trimmed) {
      onUpdateStudentName(trimmed);
    }
    setIsEditingName(false);
  };

  return (
    <header className="w-full bg-white/90 backdrop-blur border-b border-amber-200/70 sticky top-0 z-30 px-4 py-3 shadow-xs">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Title and Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/90 text-amber-950 flex items-center justify-center shadow-xs">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 font-['Fredoka',sans-serif] flex items-center gap-2">
              English Pronunciation Tester
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Simple Speech Practice for Students
            </p>
          </div>
        </div>

        {/* Mode switcher tabs */}
        <div className="flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200/60">
          <button
            id="mode-pronunciation-test"
            type="button"
            onClick={() => onSelectMode('test')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeMode === 'test'
                ? 'bg-white text-amber-900 shadow-xs border border-amber-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>Pronunciation Test</span>
          </button>

          <button
            id="mode-free-speaking"
            type="button"
            onClick={() => onSelectMode('free')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeMode === 'free'
                ? 'bg-white text-amber-900 shadow-xs border border-amber-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquareText className="w-4 h-4 text-teal-600" />
            <span>Free Speaking</span>
          </button>
        </div>

        {/* Student name pill & Teacher button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Student name badge */}
          {isEditingName ? (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-300 px-2 py-1 rounded-xl">
              <input
                id="student-name-input"
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') setIsEditingName(false);
                }}
                autoFocus
                placeholder="Student name"
                className="w-24 sm:w-28 text-sm font-bold text-amber-950 bg-transparent outline-none"
              />
              <button
                type="button"
                onClick={handleSaveName}
                className="text-xs bg-amber-500 text-white font-bold px-2 py-0.5 rounded-lg hover:bg-amber-600 cursor-pointer"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              id="student-name-badge"
              type="button"
              onClick={() => {
                setTempName(studentName);
                setIsEditingName(true);
              }}
              title="Click to change student name"
              className="flex items-center gap-1.5 bg-amber-100/70 hover:bg-amber-200/70 border border-amber-300/80 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-amber-950 transition cursor-pointer"
            >
              <span className="w-5 h-5 rounded-full bg-amber-300 flex items-center justify-center text-amber-900">
                <User className="w-3.5 h-3.5" />
              </span>
              <span className="max-w-[100px] truncate">{studentName || 'Student'}</span>
              <span className="text-[10px] text-amber-700 font-normal underline ml-0.5">edit</span>
            </button>
          )}

          {/* Results shortcut */}
          {resultsCount > 0 && (
            <button
              id="results-button"
              type="button"
              onClick={() => onOpenTeacherModal('results')}
              title="View today's results"
              className="hidden sm:flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>{resultsCount} {resultsCount === 1 ? 'result' : 'results'}</span>
            </button>
          )}

          {/* Teacher settings button */}
          <button
            id="teacher-settings-btn"
            type="button"
            onClick={() => onOpenTeacherModal('sentences')}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300/70 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer"
            title="Teacher Settings & Sentences"
          >
            <Settings className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Teacher</span>
          </button>
        </div>
      </div>
    </header>
  );
};
