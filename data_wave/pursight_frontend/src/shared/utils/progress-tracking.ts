export interface ProgressTracker {
  start: (label?: string) => void
  update: (percent: number, message?: string) => void
  complete: (message?: string) => void
}

export function setupProgressTracking(): ProgressTracker {
  return {
    start: () => {},
    update: () => {},
    complete: () => {}
  }
}


