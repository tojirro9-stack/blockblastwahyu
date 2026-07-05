// ==================== HAPTIC FEEDBACK SYSTEM ====================

export type HapticType =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error'
  | 'selection';

class HapticEngine {
  private _enabled: boolean = true;

  get enabled() { return this._enabled; }
  set enabled(v: boolean) { this._enabled = v; }

  private vibrate(pattern: number | number[]) {
    if (!this._enabled) return;
    try {
      if (navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Not supported or permission denied
    }
  }

  trigger(type: HapticType) {
    switch (type) {
      case 'light':
        this.vibrate(10);
        break;
      case 'medium':
        this.vibrate(20);
        break;
      case 'heavy':
        this.vibrate([30, 20, 30]);
        break;
      case 'success':
        this.vibrate([10, 30, 10]);
        break;
      case 'warning':
        this.vibrate([20, 50, 20]);
        break;
      case 'error':
        this.vibrate([40, 30, 40, 30, 40]);
        break;
      case 'selection':
        this.vibrate(5);
        break;
    }
  }

  dispose() {
    try {
      if (navigator.vibrate) {
        navigator.vibrate(0);
      }
    } catch {
      // ignore
    }
  }
}

export const haptic = new HapticEngine();
