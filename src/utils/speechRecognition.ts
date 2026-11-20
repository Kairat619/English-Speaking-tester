// Web Speech API wrapper for speech-to-text and text-to-speech

// TypeScript declaration for Web Speech API
export interface ISpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export interface ISpeechRecognitionResult {
  readonly length: number;
  item(index: number): ISpeechRecognitionAlternative;
  [index: number]: ISpeechRecognitionAlternative;
  isFinal: boolean;
}

export interface ISpeechRecognitionResultList {
  readonly length: number;
  item(index: number): ISpeechRecognitionResult;
  [index: number]: ISpeechRecognitionResult;
}

export interface ISpeechRecognitionEvent extends Event {
  results: ISpeechRecognitionResultList;
  resultIndex: number;
}

export interface ISpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

export interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: ISpeechRecognition, ev: ISpeechRecognitionEvent) => void) | null;
  onerror: ((this: ISpeechRecognition, ev: ISpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): ISpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export interface SpeechRecognizerHandlers {
  onStart?: () => void;
  onInterim?: (interimText: string) => void;
  onResult?: (finalText: string) => void;
  onError?: (friendlyMessage: string, errorCode: string) => void;
  onEnd?: () => void;
}

export class SpeechRecognizer {
  private recognition: ISpeechRecognition | null = null;
  private isListening = false;
  private lang = 'en-US';
  private handlers: SpeechRecognizerHandlers = {};
  private finalTranscript = '';

  constructor(lang = 'en-US') {
    this.lang = lang;
  }

  public setLanguage(lang: 'en-US' | 'en-GB') {
    this.lang = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  public start(handlers: SpeechRecognizerHandlers) {
    this.handlers = handlers;
    this.finalTranscript = '';

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRec) {
      handlers.onError?.(
        'Your browser does not support speech recognition. Please try a supported browser such as Google Chrome or Microsoft Edge.',
        'unsupported'
      );
      return;
    }

    try {
      if (this.recognition) {
        try {
          this.recognition.abort();
        } catch {
          // ignore
        }
      }

      this.recognition = new SpeechRec();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.lang;
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.handlers.onStart?.();
      };

      this.recognition.onresult = (event: ISpeechRecognitionEvent) => {
        let interim = '';
        let accumulatedFinal = '';

        for (let i = 0; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            accumulatedFinal += res[0].transcript + ' ';
          } else {
            interim += res[0].transcript;
          }
        }

        this.finalTranscript = accumulatedFinal.trim();
        const fullLive = (accumulatedFinal + ' ' + interim).trim();

        if (interim && this.handlers.onInterim) {
          this.handlers.onInterim(fullLive);
        } else if (accumulatedFinal && this.handlers.onInterim) {
          this.handlers.onInterim(accumulatedFinal.trim());
        }
      };

      this.recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
        let message = 'We could not understand the speech this time. Please speak clearly and try again.';
        const code = event.error;

        if (code === 'not-allowed') {
          message = '🎤 Microphone access is needed. Please allow microphone access in your browser and try again.';
        } else if (code === 'no-speech') {
          message = "We didn't hear anything. Please try again.";
        } else if (code === 'audio-capture') {
          message = 'No microphone was found. Please check your microphone connection and try again.';
        } else if (code === 'network') {
          message = 'Speech recognition requires a stable internet connection. Please check your network and try again.';
        }

        this.handlers.onError?.(message, code);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.finalTranscript) {
          this.handlers.onResult?.(this.finalTranscript);
        }
        this.handlers.onEnd?.();
      };

      this.recognition.start();
    } catch (err) {
      this.handlers.onError?.(
        'Could not start microphone. Please check browser permissions and try again.',
        'exception'
      );
    }
  }

  public stop(): string {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
    this.isListening = false;
    return this.finalTranscript;
  }

  public abort() {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // ignore
      }
    }
    this.isListening = false;
  }
}

/**
 * Text-to-Speech playback using SpeechSynthesis
 */
export function speakSentence(text: string, lang = 'en-US', onFinish?: () => void): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false;

  try {
    window.speechSynthesis.cancel(); // Stop any pending speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.85; // Slightly slower, clear cadence for English learners!
    utterance.pitch = 1.05; // Friendly, warm pitch

    utterance.onend = () => {
      onFinish?.();
    };
    utterance.onerror = () => {
      onFinish?.();
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
