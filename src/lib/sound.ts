// ==================== SOUND SYSTEM ====================
// Uses Howler.js for SFX and BGM

// Sound effect keys
export type SfxKey =
  | 'place'
  | 'clear'
  | 'combo'
  | 'double'
  | 'triple'
  | 'quad'
  | 'fever'
  | 'godmode'
  | 'gameover'
  | 'newbest'
  | 'click'
  | 'powerup'
  | 'coin'
  | 'error'
  | 'countdown'
  | 'times_up'
  | 'level_up'
  | 'achievement'
  | 'daily_reward';

// Generate simple sounds using Web Audio API (no external files needed)
// This provides basic feedback without requiring audio file downloads
class SoundGenerator {
  private audioCtx: AudioContext | null = null;
  private _enabled: boolean = true;
  private _volume: number = 0.3;
  private _bgmPlaying: boolean = false;
  private _bgmNode: OscillatorNode | null = null;
  private _bgmGain: GainNode | null = null;

  get enabled() { return this._enabled; }
  set enabled(v: boolean) { this._enabled = v; if (!v) this.stopBGM(); }

  get volume() { return this._volume; }
  set volume(v: number) { this._volume = Math.max(0, Math.min(1, v)); }

  private getCtx(): AudioContext {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'square',
    volumeMod?: (gain: GainNode, time: number) => void
  ) {
    if (!this._enabled) return;
    try {
      const ctx = this.getCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, now);
      gain.gain.setValueAtTime(this._volume, now);
      if (volumeMod) {
        volumeMod(gain, now);
      } else {
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      }
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      // Audio context might not be available
    }
  }

  play(key: SfxKey) {
    if (!this._enabled) return;
    switch (key) {
      case 'place':
        this.playTone(440, 0.08, 'square', (g, t) => {
          g.gain.setValueAtTime(this._volume * 0.4, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        });
        break;
      case 'clear':
        this.playTone(523, 0.12, 'square', (g, t) => {
          g.gain.setValueAtTime(this._volume * 0.5, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        });
        setTimeout(() => this.playTone(659, 0.1, 'square', (g, t) => {
          g.gain.setValueAtTime(this._volume * 0.4, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        }), 60);
        break;
      case 'combo':
        this.playTone(784, 0.15, 'sine', (g, t) => {
          g.gain.setValueAtTime(this._volume * 0.5, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        });
        break;
      case 'double':
        this.playTone(587, 0.15, 'sine', (g, t) => {
          g.gain.setValueAtTime(this._volume * 0.6, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        });
        break;
      case 'triple':
        this.playTone(659, 0.18, 'sine', (g, t) => {
          g.gain.setValueAtTime(this._volume * 0.6, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        });
        break;
      case 'quad':
        this.playTone(784, 0.2, 'sine', (g, t) => {
          g.gain.setValueAtTime(this._volume * 0.7, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        });
        break;
      case 'fever':
        this.playTone(988, 0.25, 'sine', (g, t) => {
          g.gain.setValueAtTime(this._volume * 0.8, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        });
        setTimeout(() => this.playTone(1319, 0.15, 'sine', (g, t) => {
          g.gain.setValueAtTime(this._volume * 0.7, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        }), 100);
        break;
      case 'godmode':
        this.playTone(1047, 0.3, 'sine', (g, t) => {
          g.gain.setValueAtTime(this._volume * 0.9, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        });
        setTimeout(() => this.playTone(1397, 0.2, 'sine', (g, t) => {
          g.gain.setValueAtTime(this._volume * 0.8, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        }), 100);
        setTimeout(() => this.playTone(1760, 0.3, 'sine', (g, t) => {
          g.gain.setValueAtTime(this._volume * 0.9, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        }), 200);
        break;
      case 'gameover':
        this.playTone(392, 0.3, 'sawtooth', (g, t) => {
          g.gain.setValueAtTime(this._volume * 0.5, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        });
        setTimeout(() => this.playTone(330, 0.4, 'sawtooth', (g, t) => {
          g.gain.setValueAtTime(this._volume * 0.5, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        }), 200);
        setTimeout(() => this.playTone(262, 0.6, 'sawtooth', (g, t) => {
          g.gain.setValueAtTime(this._volume * 0.4, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
        }), 450);
        break;
      case 'newbest':
        this.playTone(1047, 0.15, 'sine', (g, t) => {
          g.gain.setValueAtTime(this._volume * 0.7, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        });
        setTimeout(() => this.playTone(1319, 0.15, 'sine'), 100);
        setTimeout(() => this.playTone(1568, 0.2, 'sine'), 200);
        setTimeout(() => this.playTone(2093, 0.3, 'sine'), 300);
        break;
      case 'click':
        this.playTone(600, 0.04, 'square', (g, t) => {
          g.gain.setValueAtTime(this._volume * 0.2, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        });
        break;
      case 'powerup':
        this.playTone(880, 0.1, 'sine', (g, t) => {
          g.gain.setValueAtTime(this._volume * 0.6, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        });
        setTimeout(() => this.playTone(1109, 0.1, 'sine'), 60);
        setTimeout(() => this.playTone(1320, 0.15, 'sine'), 120);
        break;
      case 'coin':
        this.playTone(1319, 0.08, 'sine', (g, t) => {
          g.gain.setValueAtTime(this._volume * 0.5, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        });
        break;
      case 'error':
        this.playTone(200, 0.15, 'sawtooth', (g, t) => {
          g.gain.setValueAtTime(this._volume * 0.4, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        });
        break;
      case 'achievement':
        this.playTone(784, 0.15, 'sine');
        setTimeout(() => this.playTone(988, 0.15, 'sine'), 120);
        setTimeout(() => this.playTone(1175, 0.15, 'sine'), 240);
        setTimeout(() => this.playTone(1568, 0.3, 'sine'), 360);
        break;
      case 'daily_reward':
        this.playTone(523, 0.12, 'sine');
        setTimeout(() => this.playTone(659, 0.12, 'sine'), 80);
        setTimeout(() => this.playTone(784, 0.12, 'sine'), 160);
        setTimeout(() => this.playTone(1047, 0.2, 'sine'), 240);
        break;
      case 'countdown':
        this.playTone(440, 0.08, 'square', (g, t) => {
          g.gain.setValueAtTime(this._volume * 0.3, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        });
        break;
      case 'times_up':
        this.playTone(330, 0.2, 'sawtooth', (g, t) => {
          g.gain.setValueAtTime(this._volume * 0.5, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        });
        setTimeout(() => this.playTone(262, 0.4, 'sawtooth'), 200);
        break;
      case 'level_up':
        this.playTone(523, 0.1, 'sine');
        setTimeout(() => this.playTone(659, 0.1, 'sine'), 80);
        setTimeout(() => this.playTone(784, 0.1, 'sine'), 160);
        setTimeout(() => this.playTone(1047, 0.2, 'sine'), 240);
        break;
    }
  }

  startBGM() {
    if (!this._enabled || this._bgmPlaying) return;
    try {
      const ctx = this.getCtx();
      const now = ctx.currentTime;

      // Create a simple looping ambient tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(55, now); // Very low A1
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(this._volume * 0.08, now + 2);

      // Add a slow LFO for gentle movement
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.2, now); // Slow pulse
      lfoGain.gain.setValueAtTime(10, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(now);
      lfo.stop(now + 600);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);

      this._bgmPlaying = true;
      this._bgmNode = osc;
      this._bgmGain = gain;
    } catch (e) {
      // ignore
    }
  }

  stopBGM() {
    if (!this._bgmPlaying) return;
    try {
      if (this._bgmNode) {
        this._bgmNode.stop();
        this._bgmNode.disconnect();
      }
      if (this._bgmGain) {
        this._bgmGain.disconnect();
      }
    } catch (e) {
      // ignore
    }
    this._bgmPlaying = false;
    this._bgmNode = null;
    this._bgmGain = null;
  }

  dispose() {
    this.stopBGM();
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}

// Singleton instance
export const sound = new SoundGenerator();
