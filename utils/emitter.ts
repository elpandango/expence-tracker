type EventMap = {
  'ui:startLoading': 'auth' | 'default';
  'ui:stopLoading': 'auth' | 'default';
  'ui:showToast': { message: string; type: 'success' | 'error' };
};

export class Emitter<T extends EventMap> {
  private events: { [K in keyof T]?: Array<(payload: T[K]) => void> };

  constructor() {
    this.events = {};
  }

  on<K extends keyof T>(event: K, callback: (payload: T[K]) => void): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event]!.push(callback);
  }

  off<K extends keyof T>(event: K, callback: (payload: T[K]) => void): void {
    if (!this.events[event]) return;

    this.events[event] = this.events[event]!.filter(cb => cb !== callback);
  }

  emit<K extends keyof T>(event: K, payload: T[K]): void {
    if (!this.events[event]) return;

    this.events[event]!.forEach(callback => callback(payload));
  }
}