// audio.js — every sound in the game is synthesized live with WebAudio.
// No audio files are shipped, so the game makes no network request and
// stays silent until the player first interacts (browser autoplay rules).

const NOTE = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0,
  A4: 440.0, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25,
  F5: 698.46, G5: 783.99, A5: 880.0, C6: 1046.5, E6: 1318.5, G6: 1568.0,
};

// A gentle music-box loop (an original little melody) for the background.
// Each entry is [note, seconds from the start of the 4-second loop].
const MELODY = [
  ['E5', 0.0], ['G5', 0.25], ['C6', 0.5], ['G5', 0.75],
  ['A5', 1.0], ['G5', 1.25], ['E5', 1.5], ['D5', 1.75],
  ['E5', 2.0], ['G5', 2.25], ['A5', 2.5], ['C6', 2.75],
  ['E6', 3.0], ['C6', 3.25], ['A5', 3.5], ['G5', 3.75],
];
const MELODY_LOOP_SECONDS = 4;

export class SoundEngine {
  constructor() {
    this.context = null;
    this.enabled = true;
    this.musicOn = false;
    this.musicTimer = null;
    this.loopStart = 0;
  }

  // Must be called from a user gesture at least once.
  ensureContext() {
    if (!this.context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return false;
      this.context = new AudioContext();
    }
    if (this.context.state === 'suspended') void this.context.resume();
    return true;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) this.stopMusic();
    else if (this.context) this.startMusic();
  }

  tone(frequency, { at = 0, duration = 0.18, type = 'sine', volume = 0.16 } = {}) {
    if (!this.enabled || !this.context) return;
    const start = this.context.currentTime + at;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain).connect(this.context.destination);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  }

  // A soft two-note "pop" when the player clicks anywhere.
  click() {
    this.tone(NOTE.G5, { duration: 0.07, volume: 0.08, type: 'triangle' });
  }

  // A happy chime when a difference is found.
  found() {
    this.tone(NOTE.C5, { duration: 0.16, volume: 0.2 });
    this.tone(NOTE.E5, { at: 0.08, duration: 0.18, volume: 0.2 });
    this.tone(NOTE.G5, { at: 0.16, duration: 0.28, volume: 0.22 });
  }

  // A low buzz for a wrong click.
  miss() {
    this.tone(140, { duration: 0.22, type: 'sawtooth', volume: 0.07 });
    this.tone(110, { at: 0.05, duration: 0.22, type: 'sawtooth', volume: 0.06 });
  }

  // A sparkle for a hint.
  hint() {
    this.tone(NOTE.A5, { duration: 0.14, volume: 0.14 });
    this.tone(NOTE.C6, { at: 0.1, duration: 0.2, volume: 0.14 });
  }

  // A little fanfare for finishing a level.
  fanfare() {
    const notes = [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6, NOTE.E6, NOTE.G6];
    notes.forEach((frequency, i) => {
      this.tone(frequency, { at: i * 0.11, duration: 0.3, volume: 0.2 });
    });
    this.tone(NOTE.C5, { at: 0.7, duration: 0.6, volume: 0.12 });
    this.tone(NOTE.G5, { at: 0.7, duration: 0.6, volume: 0.12 });
  }

  // Schedule one music-box note at an absolute context time.
  musicNote(name, at) {
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(NOTE[name], at);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.045, at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.9);
    osc.connect(gain).connect(this.context.destination);
    osc.start(at);
    osc.stop(at + 1);
  }

  // Start the quiet music-box loop. A timer keeps scheduling whole loops
  // just ahead of playback, so stopping is clean.
  startMusic() {
    if (!this.enabled || !this.context || this.musicOn) return;
    this.musicOn = true;
    this.loopStart = this.context.currentTime + 0.1;
    const schedule = () => {
      if (!this.musicOn || !this.context) return;
      const horizon = this.context.currentTime + 0.6;
      while (this.loopStart < horizon) {
        for (const [name, offset] of MELODY) {
          this.musicNote(name, this.loopStart + offset);
        }
        this.loopStart += MELODY_LOOP_SECONDS;
      }
      this.musicTimer = window.setTimeout(schedule, 200);
    };
    schedule();
  }

  stopMusic() {
    this.musicOn = false;
    if (this.musicTimer !== null) {
      window.clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }
}
