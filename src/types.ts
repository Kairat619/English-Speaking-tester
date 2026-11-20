export type AppMode = 'test' | 'free';

export type SpeechState =
  | 'ready'
  | 'recording'
  | 'processing'
  | 'finished'
  | 'error'
  | 'unsupported';

export interface TestSentence {
  id: string;
  text: string;
  category?: string;
}

export type WordStatus = 'correct' | 'missing' | 'mismatched' | 'extra';

export interface WordComparison {
  id: string;
  word: string;
  expectedWord?: string;
  status: WordStatus;
  note?: string;
}

export interface AttemptResult {
  id: string;
  studentName: string;
  timestamp: number;
  mode: AppMode;
  expectedText: string;
  recognizedText: string;
  matchScore: number;
  feedbackTitle: string;
  feedbackMessage: string;
  wordComparisons: WordComparison[];
}

export interface TeacherSettings {
  language: 'en-US' | 'en-GB';
  showLiveTranscription: boolean;
  showScores: boolean;
  showWordFeedback: boolean;
  soundEffects: boolean;
  autoPlaySample: boolean;
}
