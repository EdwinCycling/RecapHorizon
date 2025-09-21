// Enhanced AudioRecorder for mobile device compatibility
// Handles common web-specific interruptions and provides robust recording

type TranslationFunction = (key: string, fallback?: string) => string;

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private _isRecording: boolean = false;
  private _isPaused: boolean = false;
  private onDataAvailable?: (chunks: Blob[]) => void;
  private onError?: (error: Error) => void;
  private onStateChange?: (state: 'recording' | 'paused' | 'stopped' | 'error') => void;
  private onStop?: (blob: Blob) => void;
  private isMobile: boolean = false;
  private t?: TranslationFunction;

  constructor(t?: TranslationFunction) {
    this.t = t;
    this.detectMobile();
    this.setupVisibilityListener();
    this.setupAudioContextListener();
  }

  // Public getters for recording state
  public get isRecording(): boolean { return this._isRecording; }
  public get isPaused(): boolean { return this._isPaused; }

  public getAnalyser(): AnalyserNode | null { return this.analyser; }

  private detectMobile(): void {
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (navigator.userAgent.includes('Mac') && 'ontouchend' in document);
  }

  // Set callback functions
  setCallbacks(callbacks: {
    onDataAvailable?: (chunks: Blob[]) => void;
    onError?: (error: Error) => void;
    onStateChange?: (state: 'recording' | 'paused' | 'stopped' | 'error') => void;
    onStop?: (blob: Blob) => void;
  }): void {
    this.onDataAvailable = callbacks.onDataAvailable;
    this.onError = callbacks.onError;
    this.onStateChange = callbacks.onStateChange;
    this.onStop = callbacks.onStop;
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
              sampleRate: 8000, // Lower sample rate for better stability and reduced data
              channelCount: 1, // Mono is sufficient for transcription
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
              // Additional constraints for better transcription quality
            } 
          });
        } catch (error) {
          console.warn(this.t?.('microphoneAccessDenied') || 'Microphone access denied:', error);
          if (!includeSystemAudio) {
            throw new Error(this.t?.('microphoneAccessDenied') || 'Microphone access required but denied');
          }
        }
      }

      // Request display media (system audio) - not available on mobile
      let displayStream: MediaStream | null = null;
      if (includeSystemAudio && !this.isMobile) {
        try {
          displayStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: { 
              sampleRate: 8000, // Lower sample rate for better stability and reduced data
              channelCount: 1, // Mono is sufficient for transcription
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            } as MediaTrackConstraints
          });
        } catch (error) {
          console.warn(this.t?.('displayCaptureNotAvailable') || 'Display capture not available:', error);
        }
      }

      // Create audio context
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass();
      // Attach statechange listener to handle brief interruptions on mobile (iOS Safari etc.)
      this.setupAudioContextListener();
      
      // iOS requires explicit resume after user gesture
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Prepare analyser and destination
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;

      const destination = this.audioContext.createMediaStreamDestination();
      let hasAudio = false;

      if (displayStream) {
        const displayAudioTracks = displayStream.getAudioTracks();
        if (displayAudioTracks.length > 0) {
          const displaySource = this.audioContext.createMediaStreamSource(new MediaStream(displayAudioTracks));
          displaySource.connect(this.analyser);
          hasAudio = true;
        }
      }

      if (micStream) {
        const micAudioTracks = micStream.getAudioTracks();
        if (micAudioTracks.length > 0) {
          const micSource = this.audioContext.createMediaStreamSource(new MediaStream(micAudioTracks));
          micSource.connect(this.analyser);
          hasAudio = true;
        }
      }

      if (!hasAudio) {
        throw new Error(this.t?.('noAudioSources') || 'No audio sources available');
      }

      // Route analyser output to destination so it is recorded
      this.analyser.connect(destination);
      this.stream = destination.stream;

      // On some mobile devices, audio tracks can end briefly; try to recover automatically
      this.stream.getAudioTracks().forEach((track) => {
        track.addEventListener('ended', async () => {
          console.warn('Audio track ended unexpectedly, attempting recovery...');
          if (!this._isRecording) return;
          try {
            // Recreate destination if needed
            if (!this.audioContext) return;
            const newDest = this.audioContext.createMediaStreamDestination();
            try { this.analyser?.disconnect(); } catch {}
            this.analyser?.connect(newDest);
            this.stream = newDest.stream;
            if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
              // Note: MediaRecorder cannot change stream mid-flight in all browsers,
              // so we stop and restart seamlessly building on existing chunks.
              const prevChunks = this.audioChunks.slice();
              this.mediaRecorder.stop();
              // Small delay to allow onstop to flush
              await new Promise(r => setTimeout(r, 50));
              const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
              // Initialize MediaRecorder with optimized settings for transcription
              const mediaRecorderOptions: MediaRecorderOptions = {
                mimeType,
                audioBitsPerSecond: 16000 // 16kbps for maximum stability and minimal server load
              };
              
              // Fallback if audioBitsPerSecond is not supported
              try {
                this.mediaRecorder = new MediaRecorder(this.stream, mediaRecorderOptions);
              } catch (error) {
                console.warn(this.t?.('mediaRecorderBitrateNotSupported') || 'MediaRecorder with bitrate not supported, using default:', error);
                this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });
              }
              this.audioChunks = prevChunks;
              this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
                if (event.data.size > 0) {
                  this.audioChunks.push(event.data);
                  this.onDataAvailable?.(this.audioChunks);
                }
              };
              this.mediaRecorder.onstop = () => {
                const mimeTypeInner = this.mediaRecorder?.mimeType || 'audio/webm';
                const audioBlob = new Blob(this.audioChunks, { type: mimeTypeInner });
                this._isRecording = false;
                this._isPaused = false;
                this.onStateChange?.('stopped');
                this.onStop?.(audioBlob);
                this.cleanup();
              };
              this.mediaRecorder.start(1000);
              this._isRecording = true;
              this._isPaused = false;
              this.onStateChange?.('recording');
              console.log(this.t?.('mediaRecorderRestarted') || 'MediaRecorder restarted after track end');
            }
          } catch (e) {
            console.warn(this.t?.('failedToRecoverFromTrackEnd') || 'Failed to recover from track end:', e);
          }
        });
      });

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

      // Initialize MediaRecorder with optimized settings for transcription
      const mediaRecorderOptions: MediaRecorderOptions = {
        mimeType,
        audioBitsPerSecond: 16000 // 16kbps for maximum stability and minimal server load
      };
      
      // Fallback if audioBitsPerSecond is not supported
      try {
        this.mediaRecorder = new MediaRecorder(this.stream, mediaRecorderOptions);
      } catch (error) {
        console.warn('MediaRecorder with bitrate not supported, using default:', error);
        this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });
      }

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
        const error = new Error(this.t?.('recordingFailed') || 'Recording failed');
        this.onError?.(error);
        this.onStateChange?.('error');
        this.stopRecording();
      };

      // Handle stop event
      this.mediaRecorder.onstop = () => {
        const mimeTypeInner = this.mediaRecorder?.mimeType || 'audio/webm';
        const audioBlob = new Blob(this.audioChunks, { type: mimeTypeInner });
        this._isRecording = false;
        this._isPaused = false;
        this.onStateChange?.('stopped');
        // Emit final blob to consumer
        this.onStop?.(audioBlob);
        this.cleanup();
      };

      // Start recording with 1s intervals for chunk collection
      this.mediaRecorder.start(1000);
      this._isRecording = true;
      this._isPaused = false;
      this.onStateChange?.('recording');
      
      console.log(this.t?.('recordingStartedWithMimeType') || 'Recording started with MIME type:', mimeType);
    } catch (error) {
      console.error(this.t?.('failedToStartRecording') || 'Failed to start recording:', error);
      this.onError?.(error as Error);
      this.onStateChange?.('error');
      throw error;
    }
  }

  // Pause recording
  pauseRecording(): void {
    if (this.mediaRecorder && this._isRecording && !this._isPaused) {
      this.mediaRecorder.pause();
      this._isPaused = true;
      this.onStateChange?.('paused');
      console.log(this.t?.('recordingPausedConsole') || 'Recording paused');
    }
  }

  // Resume recording
  resumeRecording(): void {
    if (this.mediaRecorder && this._isRecording && this._isPaused) {
      // Resume audio context if suspended
      if (this.audioContext?.state === 'suspended') {
        this.audioContext.resume().catch(err => 
          console.error(this.t?.('failedToResumeAudioContext') || 'Failed to resume AudioContext:', err)
        );
      }
      
      this.mediaRecorder.resume();
      this._isPaused = false;
      this.onStateChange?.('recording');
      console.log(this.t?.('recordingResumed') || 'Recording resumed');
    }
  }

  // Stop recording and get the final audio
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this._isRecording) {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        // Emit to consumer as well
        this.onStop?.(audioBlob);
        resolve(audioBlob);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const mimeTypeInner = this.mediaRecorder?.mimeType || 'audio/webm';
        const audioBlob = new Blob(this.audioChunks, { type: mimeTypeInner });
        this.cleanup();
        // Emit to consumer
        this.onStop?.(audioBlob);
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
      this._isRecording = false;
      this._isPaused = false;
    });
  }

  // Clean up resources
  public cleanup(): void {
    try {
      if (this.stream) {
        this.stream.getTracks().forEach((track) => track.stop());
        this.stream = null;
      }
      if (this.analyser) {
        try { this.analyser.disconnect(); } catch {}
        this.analyser = null;
      }
      if (this.audioContext) {
        try { this.audioContext.close(); } catch {}
        this.audioContext = null;
      }
      this.mediaRecorder = null;
    } catch (e) {
      console.warn(this.t?.('cleanupError') || 'Cleanup error:', e);
    }
  }

  // Handle tab visibility changes (mobile browsers often pause when tab is hidden)
  private setupVisibilityListener(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this._isRecording && !this._isPaused) {
        console.log(this.t?.('tabHiddenPausingRecording') || 'Tab hidden, pausing recording to prevent interruption');
        this.pauseRecording();
      } else if (!document.hidden && this._isRecording && this._isPaused) {
        console.log(this.t?.('tabVisibleResumingRecording') || 'Tab visible, resuming recording');
        this.resumeRecording();
      }
    });
  }

  // Handle audio context interruptions (system audio interrupts)
  private setupAudioContextListener(): void {
    if (!this.audioContext) return;
    try {
      this.audioContext.onstatechange = async () => {
        const state = this.audioContext?.state;
        if (!state) return;
        // When context becomes suspended unexpectedly during recording, attempt auto-resume
        if (state === 'suspended' && this._isRecording && !this._isPaused) {
          try {
            await this.audioContext.resume();
            console.log(this.t?.('audioContextAutoResumed') || 'AudioContext auto-resumed after brief interruption');
          } catch (err) {
            console.warn(this.t?.('failedToAutoResumeAudioContext') || 'Failed to auto-resume AudioContext:', err);
          }
        }
      };
    } catch (e) {
      console.warn(this.t?.('couldNotAttachAudioContextListener') || 'Could not attach AudioContext statechange listener:', e);
    }
  }

  // Get current recording state
  getState(): { isRecording: boolean; isPaused: boolean; chunksCount: number } {
    return {
      isRecording: this._isRecording,
      isPaused: this._isPaused,
      chunksCount: this.audioChunks.length
    };
  }

  // Get current audio chunks (for real-time processing)
  getCurrentChunks(): Blob[] {
    return [...this.audioChunks];
  }

  // Force cleanup (call when component unmounts)
  destroy(): void {
    if (this._isRecording) {
      this.stopRecording();
    }
    this.cleanup();
  }
}