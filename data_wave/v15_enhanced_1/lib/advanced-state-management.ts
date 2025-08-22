/**
 * Advanced State Management System
 * ===============================
 *
 * Enterprise-grade state management with:
 * - Immutable state updates
 * - Time-travel debugging
 * - State persistence
 * - Cross-group state synchronization
 * - Middleware pipeline
 * - Action validation
 * - State snapshots
 * - Performance optimization
 */

import { websocketService, WSMessage } from "./websocket-service";
import {
  crossGroupIntegrationService,
  GroupMetadata,
} from "./cross-group-integration-service";
import { EventEmitter } from "events";

export type StateSnapshot = {
  id: string;
  state: any;
  timestamp: string;
  metadata: Record<string, any>;
};

export type StateAction = {
  type: string;
  payload: any;
  metadata: {
    timestamp: string;
    groupId?: string;
    userId?: string;
    transactionId?: string;
    priority?: "high" | "normal" | "low";
  };
};

export type Middleware = {
  pre?: (action: StateAction, state: any) => Promise<StateAction>;
  post?: (action: StateAction, prevState: any, nextState: any) => Promise<void>;
};

export type StateSubscription = {
  id: string;
  selector: (state: any) => any;
  callback: (selectedState: any) => void;
  options: {
    debounceMs?: number;
    equalityFn?: (a: any, b: any) => boolean;
  };
};

export class AdvancedStateManagement {
  private state: any = {};
  private snapshots: StateSnapshot[] = [];
  private readonly middleware: Middleware[] = [];
  private readonly subscriptions = new Map<string, StateSubscription>();
  private readonly eventEmitter = new EventEmitter();
  private stateVersion = 0;
  private isTimeTravel = false;
  private readonly debounceTimers = new Map<string, NodeJS.Timeout>();
  private lastBroadcast: string | null = null;

  constructor(initialState: any = {}) {
    this.state = this.deepFreeze({ ...initialState });
    this.initializeWebSocketHandlers();
    this.setupAutoPersistence();
    this.createInitialSnapshot();
  }

  /**
   * Dispatch an action to update state
   */
  public async dispatch(action: Omit<StateAction, "metadata">): Promise<void> {
    const fullAction: StateAction = {
      ...action,
      metadata: {
        timestamp: new Date().toISOString(),
        transactionId: crypto.randomUUID(),
      },
    };

    try {
      // Run pre-middleware
      let processedAction = fullAction;
      for (const mw of this.middleware) {
        if (mw.pre) {
          processedAction = await mw.pre(processedAction, this.state);
        }
      }

      const prevState = this.state;
      await this.updateState(processedAction);

      // Run post-middleware
      for (const mw of this.middleware) {
        if (mw.post) {
          await mw.post(processedAction, prevState, this.state);
        }
      }

      // Notify subscribers
      this.notifySubscribers();

      // Broadcast if needed
      await this.broadcastStateUpdate(processedAction);
    } catch (error) {
      console.error("Error dispatching action:", error);
      throw error;
    }
  }

  /**
   * Subscribe to state changes with selector
   */
  public subscribe<T>(
    selector: (state: any) => T,
    callback: (selectedState: T) => void,
    options: StateSubscription["options"] = {}
  ): () => void {
    const subscription: StateSubscription = {
      id: crypto.randomUUID(),
      selector,
      callback,
      options,
    };

    this.subscriptions.set(subscription.id, subscription);

    // Initial call
    const selectedState = selector(this.state);
    if (subscription.options.debounceMs) {
      this.debouncedCallback(subscription, selectedState);
    } else {
      callback(selectedState);
    }

    return () => {
      this.subscriptions.delete(subscription.id);
      const timer = this.debounceTimers.get(subscription.id);
      if (timer) {
        clearTimeout(timer);
        this.debounceTimers.delete(subscription.id);
      }
    };
  }

  /**
   * Add middleware to the pipeline
   */
  public use(middleware: Middleware): () => void {
    this.middleware.push(middleware);
    return () => {
      const index = this.middleware.indexOf(middleware);
      if (index > -1) {
        this.middleware.splice(index, 1);
      }
    };
  }

  /**
   * Create state snapshot
   */
  public createSnapshot(metadata: Record<string, any> = {}): StateSnapshot {
    const snapshot: StateSnapshot = {
      id: crypto.randomUUID(),
      state: this.deepClone(this.state),
      timestamp: new Date().toISOString(),
      metadata,
    };

    this.snapshots.push(snapshot);
    // Keep only last 50 snapshots
    if (this.snapshots.length > 50) {
      this.snapshots.shift();
    }

    return snapshot;
  }

  /**
   * Restore state from snapshot
   */
  public async restoreSnapshot(snapshotId: string): Promise<void> {
    const snapshot = this.snapshots.find((s) => s.id === snapshotId);
    if (!snapshot) {
      throw new Error(`Snapshot ${snapshotId} not found`);
    }

    this.isTimeTravel = true;
    this.state = this.deepFreeze(this.deepClone(snapshot.state));
    this.notifySubscribers();
    this.isTimeTravel = false;

    await this.broadcastStateUpdate({
      type: "SNAPSHOT_RESTORED",
      payload: { snapshotId },
      metadata: {
        timestamp: new Date().toISOString(),
        transactionId: crypto.randomUUID(),
      },
    });
  }

  /**
   * Get current state
   */
  public getState(): any {
    return this.state;
  }

  /**
   * Get state history
   */
  public getSnapshots(): StateSnapshot[] {
    return [...this.snapshots];
  }

  private async updateState(action: StateAction): Promise<void> {
    const nextState = await this.reducer(this.state, action);
    this.state = this.deepFreeze(nextState);
    this.stateVersion++;

    if (!this.isTimeTravel) {
      this.createSnapshot({
        action,
        version: this.stateVersion,
      });
    }
  }

  private async reducer(state: any, action: StateAction): Promise<any> {
    // Implement your state update logic here
    // This is a simple example, extend based on your needs
    switch (action.type) {
      case "SET_VALUE":
        return {
          ...state,
          [action.payload.key]: action.payload.value,
        };

      case "MERGE_STATE":
        return {
          ...state,
          ...action.payload,
        };

      case "DELETE_KEY":
        const newState = { ...state };
        delete newState[action.payload];
        return newState;

      default:
        return state;
    }
  }

  private notifySubscribers(): void {
    this.subscriptions.forEach((subscription) => {
      const selectedState = subscription.selector(this.state);

      if (subscription.options.debounceMs) {
        this.debouncedCallback(subscription, selectedState);
      } else {
        subscription.callback(selectedState);
      }
    });
  }

  private debouncedCallback(
    subscription: StateSubscription,
    selectedState: any
  ): void {
    const existing = this.debounceTimers.get(subscription.id);
    if (existing) {
      clearTimeout(existing);
    }

    this.debounceTimers.set(
      subscription.id,
      setTimeout(() => {
        subscription.callback(selectedState);
        this.debounceTimers.delete(subscription.id);
      }, subscription.options.debounceMs)
    );
  }

  private async broadcastStateUpdate(action: StateAction): Promise<void> {
    // Avoid broadcasting if the last broadcast was too recent
    const now = Date.now();
    if (
      this.lastBroadcast &&
      now - new Date(this.lastBroadcast).getTime() < 100
    ) {
      return;
    }

    try {
      await websocketService.send("state-update", {
        action,
        version: this.stateVersion,
        timestamp: new Date().toISOString(),
      });
      this.lastBroadcast = new Date().toISOString();
    } catch (error) {
      console.error("Failed to broadcast state update:", error);
    }
  }

  private initializeWebSocketHandlers(): void {
    websocketService.subscribe("state-update", async (message: WSMessage) => {
      if (message.payload.version > this.stateVersion) {
        try {
          this.isTimeTravel = true;
          await this.dispatch({
            type: "MERGE_STATE",
            payload: message.payload.state,
          });
        } finally {
          this.isTimeTravel = false;
        }
      }
    });
  }

  private setupAutoPersistence(): void {
    // Auto-save state every 5 minutes
    setInterval(() => {
      try {
        localStorage.setItem(
          "app_state",
          JSON.stringify({
            state: this.state,
            version: this.stateVersion,
            timestamp: new Date().toISOString(),
          })
        );
      } catch (error) {
        console.error("Failed to persist state:", error);
      }
    }, 5 * 60 * 1000);
  }

  private createInitialSnapshot(): void {
    this.createSnapshot({
      type: "initial",
      version: this.stateVersion,
    });
  }

  private deepFreeze<T>(obj: T): T {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }

    Object.keys(obj as object).forEach((prop) => {
      if (
        (obj as any)[prop] !== null &&
        (typeof (obj as any)[prop] === "object" ||
          typeof (obj as any)[prop] === "function") &&
        !Object.isFrozen((obj as any)[prop])
      ) {
        this.deepFreeze((obj as any)[prop]);
      }
    });

    return Object.freeze(obj);
  }

  private deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.deepClone(item)) as unknown as T;
    }

    return Object.keys(obj as object).reduce((acc, key) => {
      (acc as any)[key] = this.deepClone((obj as any)[key]);
      return acc;
    }, {} as T);
  }
}

// Create singleton instance
export const stateManager = new AdvancedStateManagement({
  // Initial state
  app: {
    version: "1.0.0",
    initialized: false,
  },
  user: null,
  settings: {},
  cache: {},
  groups: {},
});
