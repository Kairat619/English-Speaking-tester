import { AttemptResult, TeacherSettings, TestSentence } from '../types';

export const DEFAULT_SENTENCES: TestSentence[] = [
  { id: 'sent-1', text: 'Hello, my name is Sarah.', category: 'Greetings' },
  { id: 'sent-2', text: 'I like playing football.', category: 'Hobbies' },
  { id: 'sent-3', text: 'The weather is beautiful today.', category: 'Nature' },
  { id: 'sent-4', text: 'What is your favorite food?', category: 'Questions' },
  { id: 'sent-5', text: 'I go to school every morning.', category: 'Daily Life' },
  { id: 'sent-6', text: 'Hello, my name is John.', category: 'Greetings' },
  { id: 'sent-7', text: 'I love reading books with my friends.', category: 'School' },
  { id: 'sent-8', text: 'Can you please help me find the library?', category: 'Conversation' },
];

export const DEFAULT_SETTINGS: TeacherSettings = {
  language: 'en-US',
  showLiveTranscription: true,
  showScores: true,
  showWordFeedback: true,
  soundEffects: true,
  autoPlaySample: false,
};

const STORAGE_KEYS = {
  SENTENCES: 'ept_test_sentences_v1',
  SETTINGS: 'ept_teacher_settings_v1',
  ATTEMPTS: 'ept_session_attempts_v1',
  STUDENT_NAME: 'ept_active_student_v1',
};

export function loadSentences(): TestSentence[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SENTENCES);
    if (!raw) return DEFAULT_SENTENCES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SENTENCES;
  } catch {
    return DEFAULT_SENTENCES;
  }
}

export function saveSentences(sentences: TestSentence[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.SENTENCES, JSON.stringify(sentences));
  } catch (e) {
    console.error('Failed to save sentences', e);
  }
}

export function loadTeacherSettings(): TeacherSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveTeacherSettings(settings: TeacherSettings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

export function loadAttempts(): AttemptResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveAttempt(attempt: AttemptResult): AttemptResult[] {
  try {
    const existing = loadAttempts();
    const updated = [attempt, ...existing].slice(0, 100); // Keep last 100
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function clearAttempts() {
  try {
    localStorage.removeItem(STORAGE_KEYS.ATTEMPTS);
  } catch {
    // ignore
  }
}

export function loadStudentName(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.STUDENT_NAME) || 'Sarah';
  } catch {
    return 'Sarah';
  }
}

export function saveStudentName(name: string) {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENT_NAME, name);
  } catch {
    // ignore
  }
}
