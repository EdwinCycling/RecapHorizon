// Enhanced AudioRecorder for mobile device compatibility
// Handles common web-specific interruptions and provides robust recording

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private isRecording: boolean = false;
  private isPaused: boolean = false;
  private onDataAvailable?: (chunks: Blob[]) => void;
  private onError?: (error: Error) => void;
  private onStateChange?: (state: 'recording' | 'paused' | 'stopped' | 'error') => void;
  private isMobile: boolean = false;

  constructor() {
    this.detectMobile();
    this.setupVisibilityListener();
    this.setupAudioContextListener();
  }

  private detectMobile(): void {
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (navigator.userAgent.includes('Mac') && 'ontouchend' in document);
  }

  // Set callback functions
  setCallbacks(callbacks: {
    onDataAvailable?: (chunks: Blob[]) => void;
    onError?: (error: Error) => void;
    onStateChange?: (state: 'recording' | 'paused' | 'stopped' | 'error') => void;
  }): void {
    this.onDataAvailable = callbacks.onDataAvailable;
    this.onError = callbacks.onError;
    this.onStateChange = callbacks.onStateChange;
  }

  // Start recording with enhanced mobile support
  async startRecording(options?: {
    includeSystemAudio?: boolean;
    includeMicrophone?: boolean;
  }): Promise<void> {
    try {
      const { includeSystemAudio = true, includeMicrophone = true } = options || {};
      
      // Reset chunks
      this.audioChunks = [];
      
      // Request microphone permission
      let micStream: MediaStream | null = null;
      if (includeMicrophone) {
        try {
          micStream = await navigator.mediaDevices.getUserMedia({ 
            audio: { 
              sampleRate: 44100, 
              channelCount: 2,
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            } 
          });
        } catch (error) {
          console.warn('Microphone access denied:', error);
          if (!includeSystemAudio) {
            throw new Error('Microphone access required but denied');
          }
        }
      }

      // Request display media (system audio) - not available on mobile
      let displayStream: MediaStream | null = null;
      if (includeSystemAudio && !this.isMobile) {
        try {
          displayStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: { sampleRate: 44100, channelCount: 2 } as MediaTrackConstraints
          });
        } catch (error) {
          console.warn('Display capture not available:', error);
        }
      }

      // Create audio context
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass();
      
      // iOS requires explicit resume after user gesture
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Combine streams
      const destination = this.audioContext.createMediaStreamDestination();
      let hasAudio = false;

      if (displayStream) {
        const displayAudioTracks = displayStream.getAudioTracks();
        if (displayAudioTracks.length > 0) {
          const displaySource = this.audioContext.createMediaStreamSource(new MediaStream(displayAudioTracks));
          displaySource.connect(destination);
          hasAudio = true;
        }
      }

      if (micStream) {
        const micAudioTracks = micStream.getAudioTracks();
        if (micAudioTracks.length > 0) {
          const micSource = this.audioContext.createMediaStreamSource(new MediaStream(micAudioTracks));
          micSource.connect(destination);
          hasAudio = true;
        }
      }

      if (!hasAudio) {
        throw new Error('No audio sources available');
      }

      this.stream = destination.stream;

      // Choose appropriate MIME type for the platform
      let mimeType = 'audio/webm';
      if (this.isMobile) {
        // iOS Safari doesn't support webm, prefer mp4/aac
        const candidates = [
          'audio/mp4',
          'audio/aac',
          'audio/mpeg',
          'audio/webm'
        ];
        
        for (const type of candidates) {
          if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(type)) {
            mimeType = type;
            break;
          }
        }
      } else {
        // Desktop: prefer webm with opus
        const candidates = [
          'audio/webm; codecs=opus',
          'audio/webm',
          'audio/mp4'
        ];
        
        for (const type of candidates) {
          if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(type)) {
            mimeType = type;
            break;
          }
        }
      }

      // Initialize MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });

      // Handle data availability - collect chunks every 1s for robustness
      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          // Notify callback with current chunks for real-time processing if needed
          this.onDataAvailable?.(this.audioChunks);
        }
      };

      // Handle errors
      this.mediaRecorder.onerror = (event: Event) => {
        console.error('MediaRecorder error:', event);
        const error = new Error('Recording failed');
        this.onError?.(error);
        this.onStateChange?.("error");
        this.stopRecording();
      };

      // Handle stop event
      this.mediaRecorder.onstop = () => {
        this.isRecording = false;
        this.isPaused = false;
        this.onStateChange?.("stopped");
        this.cleanup();
      };

      // Start recording with 1s intervals for chunk collection
      this.mediaRecorder.start(1000);
      this.isRecording = true;
      this.isPaused = false;
      this.onStateChange?.("recording");
      
      console.log('Recording started with MIME type:', mimeType);
    } catch (error) {
      console.error('Failed to start recording:', error);
      this.onError?.(error as Error);
      this.onStateChange?.("error");
      throw error;
    }
  }

  // Pause recording
  pauseRecording(): void {
    if (this.mediaRecorder && this.isRecording && !this.isPaused) {
      this.mediaRecorder.pause();
      this.isPaused = true;
      this.onStateChange?.("paused");
      console.log('Recording paused');
    }
  }

  // Resume recording
  resumeRecording(): void {
    if (this.mediaRecorder && this.isRecording && this.isPaused) {
      // Resume audio context if suspended
      if (this.audioContext?.state === 'suspended') {
        this.audioContext.resume().catch(err => 
          console.error('Failed to resume AudioContext:', err)
        );
      }
      
      this.mediaRecorder.resume();
      this.isPaused = false;
      this.onStateChange?.("recording");
      console.log('Recording resumed');
    }
  }

  // Stop recording and get the final audio
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.isRecording) {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        resolve(audioBlob);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        this.cleanup();
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
      this.isRecording = false;
      this.isPaused = false;
    });
  }

  // Clean up resources
  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.mediaRecorder = null;
  }

  // Handle tab visibility changes (mobile browsers often pause when tab is hidden)
  private setupVisibilityListener(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.isRecording && !this.isPaused) {
        console.log('Tab hidden, pausing recording to prevent interruption');
        this.pauseRecording();
      } else if (!document.hidden && this.isRecording && this.isPaused) {
        console.log('Tab visible, resuming recording');
        this.resumeRecording();
      }
    });
  }

  // Handle audio context interruptions (system audio interrupts)
  private setupAudioContextListener(): void {
    // This will be set up when audio context is created
    // We'll monitor state changes in the resume method
  }

  // Get current recording state
  getState(): { isRecording: boolean; isPaused: boolean; chunksCount: number } {
    return {
      isRecording: this.isRecording,
      isPaused: this.isPaused,
      chunksCount: this.audioChunks.length
    };
  }

  // Get current audio chunks (for real-time processing)
  getCurrentChunks(): Blob[] {
    return [...this.audioChunks];
  }

  // Force cleanup (call when component unmounts)
  destroy(): void {
    if (this.isRecording) {
      this.stopRecording();
    }
    this.cleanup();
  }
}