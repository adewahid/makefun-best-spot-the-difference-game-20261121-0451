// audio.js — every sound in Harbor Lights, synthesized live with WebAudio.
// No audio files are shipped: each effect is a few oscillators and a gain
// envelope, so the game stays silent on disk and offline in the browser.

export class SoundEngine {
  constructor() {
    this.context = null;
    this.muted = false;
  }

  // The AudioContext is created on the first user gesture, never before.
  ensure() {
    if (!this.context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      try {
        this.context = new AudioContext();
      } catch {
        return null;
      }
    }
    if (this.context.state === 'suspended') void this.context.resume();
    return this.context;
  }

  tone(freq, startAt, duration, type, volume) {
    const ctx = this.context;
    if (!ctx || this.muted) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startAt);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime + startAt);
    gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + startAt + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime + startAt);
    osc.stop(ctx.currentTime + startAt + duration + 0.05);
  }

  // A bright two-note chime when a difference is found.
  found() {
    if (!this.ensure()) return;
    this.tone(880, 0, 0.22, 'sine', 0.22);
    this.tone(1318.5, 0.09, 0.32, 'sine', 0.2);
    this.tone(1760, 0.18, 0.3, 'triangle', 0.1);
  }

  // A low buzz for a wrong click.
  miss() {
    if (!this.ensure()) return;
    this.tone(160, 0, 0.18, 'sawtooth', 0.12);
    this.tone(110, 0.05, 0.2, 'sawtooth', 0.1);
  }

  // A soft sparkle when a hint is spent.
  hint() {
    if (!this.ensure()) return;
    this.tone(1568, 0, 0.15, 'sine', 0.14);
    this.tone(2093, 0.08, 0.2, 'sine', 0.12);
  }

  // A short tick when the clock is nearly out.
  tick() {
    if (!this.ensure()) return;
    this.tone(1200, 0, 0.06, 'square', 0.05);
  }

  // A rising fanfare when a level is cleared.
  win() {
    if (!this.ensure()) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      this.tone(freq, i * 0.12, 0.34, 'triangle', 0.18);
    });
    this.tone(1318.5, 0.5, 0.5, 'sine', 0.14);
  }

  // A gentle descending line when time runs out.
  lose() {
    if (!this.ensure()) return;
    [392, 329.63, 261.63].forEach((freq, i) => {
      this.tone(freq, i * 0.16, 0.3, 'triangle', 0.15);
    });
  }

  // A quiet click for buttons.
  click() {
    if (!this.ensure()) return;
    this.tone(700, 0, 0.06, 'sine', 0.08);
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }
}
