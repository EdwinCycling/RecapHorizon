export enum RecordingStatus {
  IDLE = 'IDLE',
  GETTING_PERMISSION = 'GETTING_PERMISSION',
  RECORDING = 'RECORDING',
  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED',
  TRANSCRIBING = 'TRANSCRIBING',
  SUMMARIZING = 'SUMMARIZING',
  FINISHED = 'FINISHED',
  ERROR = 'ERROR'
}

// Minimal interface to satisfy SpeechRecognition API usage in App.tsx
export interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}
