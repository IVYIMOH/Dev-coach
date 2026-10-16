/**
 * Dev Coach - Speech Engine (Web Speech API)
 * Handles TTS (Text-to-Speech) with per-persona settings and mute toggle,
 * plus STT (Speech-to-Text) for voice inputs.
 */

class SpeechEngine {
  constructor() {
    this.synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
    this.isMuted = false;
    this.currentUtterance = null;
    this.recognition = null;
    this.isListening = false;
    this.voices = [];

    if (this.synth) {
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }

    // Initialize Speech Recognition if supported
    const SpeechRec = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
    if (SpeechRec) {
      this.recognition = new SpeechRec();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
    }
  }

  loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  setMuted(muted) {
    this.isMuted = Boolean(muted);
    if (this.isMuted) {
      this.stop();
    }
  }

  toggleMute() {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /**
   * Speaks aloud in the specified persona's voice.
   * @param {string} text
   * @param {object} persona
   * @param {Function} [onStart]
   * @param {Function} [onEnd]
   */
  speak(text, persona = {}, onStart = null, onEnd = null) {
    if (!this.synth || this.isMuted || !text) {
      if (onEnd) setTimeout(onEnd, 100);
      return;
    }

    this.stop();

    // Clean markdown/special characters for speech
    const cleanText = text
      .replace(/[*_#`~[\]]/g, '')
      .replace(/https?:\/\/\S+/g, 'link')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const settings = persona.speechSettings || { pitch: 1.0, rate: 1.0 };

    utterance.pitch = settings.pitch || 1.0;
    utterance.rate = settings.rate || 1.0;

    // Pick appropriate voice
    if (this.voices.length > 0) {
      const enVoices = this.voices.filter(v => v.lang.startsWith('en'));
      if (persona.id === 'sergeant') {
        const energeticVoice = enVoices.find(v => /female|samantha|karen|zira|victoria/i.test(v.name));
        if (energeticVoice) utterance.voice = energeticVoice;
      } else if (persona.id === 'architect') {
        const deepVoice = enVoices.find(v => /male|george|david|daniel|oliver/i.test(v.name));
        if (deepVoice) utterance.voice = deepVoice;
      } else {
        const naturalVoice = enVoices.find(v => /alex|google|natural/i.test(v.name));
        if (naturalVoice) utterance.voice = naturalVoice;
      }
    }

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
  }

  /**
   * Listens for speech input from the user microphone.
   * @param {{ onResult: Function, onEnd: Function, onError: Function }} callbacks
   */
  startListening({ onResult, onEnd, onError }) {
    if (!this.recognition) {
      if (onError) onError(new Error('Speech recognition is not supported in this browser'));
      return false;
    }

    if (this.isListening) {
      this.stopListening();
    }

    this.isListening = true;

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (onResult) onResult(transcript);
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      if (onError) onError(event);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
      return true;
    } catch (err) {
      this.isListening = false;
      if (onError) onError(err);
      return false;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.isListening = false;
    }
  }

  isSpeechRecognitionSupported() {
    return Boolean(this.recognition);
  }
}

export const speechEngine = new SpeechEngine();

