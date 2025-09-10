export class EventEmitter {
  private events: Record<string, Array<(...args: any[]) => void>> = {};

  on(event: string, listener: (...args: any[]) => void): this {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(listener);
    return this;
  }

  off(event: string, listener: (...args: any[]) => void): this {
    const listeners = this.events[event];
    if (!listeners) return this;
    this.events[event] = listeners.filter((l) => l !== listener);
    return this;
  }

  emit(event: string, ...args: any[]): boolean {
    const listeners = this.events[event];
    if (!listeners || listeners.length === 0) return false;
    for (const listener of [...listeners]) {
      try {
        listener(...args);
      } catch {
        // ignore listener errors in emitter
      }
    }
    return true;
  }

  removeAllListeners(event?: string): this {
    if (event) delete this.events[event];
    else this.events = {};
    return this;
  }
}

export default EventEmitter;
