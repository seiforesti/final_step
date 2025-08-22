/**
 * 📊 REQUEST QUEUE - ADVANCED REQUEST MANAGEMENT
 * =========================================
 *
 * Enterprise-grade request queue with:
 * - Priority-based queueing
 * - Group-based queue management
 * - Queue size limits and overflow handling
 * - Request timeout management
 */

export interface QueueConfig {
  maxSize: number;
  timeout: number;
  priorityLevels: number;
  groupQueues?: string[];
}

export interface QueuedRequest {
  id: string;
  priority: number;
  timestamp: number;
  group?: string;
  execute: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}

export class RequestQueue {
  private queues: Map<number, QueuedRequest[]>;
  private groupQueues: Map<string, Map<number, QueuedRequest[]>>;
  private activeRequests: Set<string>;
  private readonly config: QueueConfig;

  constructor(config: QueueConfig) {
    this.config = config;
    this.queues = new Map();
    this.groupQueues = new Map();
    this.activeRequests = new Set();

    // Initialize priority queues
    for (let i = 0; i < config.priorityLevels; i++) {
      this.queues.set(i, []);
    }

    // Initialize group queues if specified
    if (config.groupQueues) {
      config.groupQueues.forEach((group) => {
        const groupPriorityQueues = new Map();
        for (let i = 0; i < config.priorityLevels; i++) {
          groupPriorityQueues.set(i, []);
        }
        this.groupQueues.set(group, groupPriorityQueues);
      });
    }
  }

  public async enqueue<T>(
    request: () => Promise<T>,
    priority: number = 0,
    group?: string
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const queuedRequest: QueuedRequest = {
        id: Math.random().toString(36).substr(2, 9),
        priority,
        timestamp: Date.now(),
        group,
        execute: request,
        resolve,
        reject,
      };

      if (group && this.groupQueues.has(group)) {
        const groupQueue = this.groupQueues.get(group)!;
        const priorityQueue = groupQueue.get(priority) || [];
        priorityQueue.push(queuedRequest);
        this.checkQueueSize(priorityQueue);
      } else {
        const queue = this.queues.get(priority) || [];
        queue.push(queuedRequest);
        this.checkQueueSize(queue);
      }

      this.scheduleTimeout(queuedRequest);
      this.processNextRequest();
    });
  }

  private checkQueueSize(queue: QueuedRequest[]): void {
    if (queue.length > this.config.maxSize) {
      const oldestRequest = queue.shift();
      if (oldestRequest) {
        oldestRequest.reject(new Error("Queue overflow"));
      }
    }
  }

  private scheduleTimeout(request: QueuedRequest): void {
    setTimeout(() => {
      this.removeRequest(request);
      request.reject(new Error("Request timeout"));
    }, this.config.timeout);
  }

  private async processNextRequest(): Promise<void> {
    // Process group queues first
    for (const [group, groupQueue] of this.groupQueues) {
      for (
        let priority = this.config.priorityLevels - 1;
        priority >= 0;
        priority--
      ) {
        const queue = groupQueue.get(priority) || [];
        if (queue.length > 0) {
          await this.executeRequest(queue[0]);
          return;
        }
      }
    }

    // Then process global queues
    for (
      let priority = this.config.priorityLevels - 1;
      priority >= 0;
      priority--
    ) {
      const queue = this.queues.get(priority) || [];
      if (queue.length > 0) {
        await this.executeRequest(queue[0]);
        return;
      }
    }
  }

  private async executeRequest(request: QueuedRequest): Promise<void> {
    if (this.activeRequests.has(request.id)) {
      return;
    }

    this.activeRequests.add(request.id);

    try {
      const result = await request.execute();
      request.resolve(result);
    } catch (error) {
      request.reject(error);
    } finally {
      this.removeRequest(request);
      this.activeRequests.delete(request.id);
      this.processNextRequest();
    }
  }

  private removeRequest(request: QueuedRequest): void {
    if (request.group && this.groupQueues.has(request.group)) {
      const groupQueue = this.groupQueues.get(request.group)!;
      const queue = groupQueue.get(request.priority) || [];
      const index = queue.findIndex((r) => r.id === request.id);
      if (index !== -1) {
        queue.splice(index, 1);
      }
    } else {
      const queue = this.queues.get(request.priority) || [];
      const index = queue.findIndex((r) => r.id === request.id);
      if (index !== -1) {
        queue.splice(index, 1);
      }
    }
  }

  public getQueueSize(priority?: number, group?: string): number {
    if (group && this.groupQueues.has(group)) {
      const groupQueue = this.groupQueues.get(group)!;
      if (priority !== undefined) {
        return groupQueue.get(priority)?.length || 0;
      }
      return Array.from(groupQueue.values()).reduce(
        (total, queue) => total + queue.length,
        0
      );
    }

    if (priority !== undefined) {
      return this.queues.get(priority)?.length || 0;
    }

    return Array.from(this.queues.values()).reduce(
      (total, queue) => total + queue.length,
      0
    );
  }

  public getActiveRequestCount(): number {
    return this.activeRequests.size;
  }

  public clear(group?: string): void {
    if (group && this.groupQueues.has(group)) {
      const groupQueue = this.groupQueues.get(group)!;
      groupQueue.forEach((queue) => {
        queue.forEach((request) => {
          request.reject(new Error("Queue cleared"));
        });
        queue.length = 0;
      });
    } else {
      this.queues.forEach((queue) => {
        queue.forEach((request) => {
          request.reject(new Error("Queue cleared"));
        });
        queue.length = 0;
      });
    }
  }
}
