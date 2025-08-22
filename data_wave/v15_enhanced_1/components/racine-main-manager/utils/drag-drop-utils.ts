"use client";

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface DragItem {
  id: string;
  type: string;
  data: any;
  sourceIndex?: number;
  sourceContainer?: string;
}

export interface DropZone {
  id: string;
  accepts: string[];
  isActive: boolean;
  position: { x: number; y: number; width: number; height: number };
}

export interface DragState {
  isDragging: boolean;
  draggedItem: DragItem | null;
  dropZones: DropZone[];
  activeDropZone: string | null;
  dragOffset: { x: number; y: number };
}

export interface DragDropConfig {
  enableDrag: boolean;
  enableDrop: boolean;
  dragThreshold: number;
  dropAnimation: boolean;
  snapToGrid: boolean;
  gridSize: number;
}

// =============================================================================
// DRAG DROP UTILITIES
// =============================================================================

export class DragDropManager {
  private state: DragState = {
    isDragging: false,
    draggedItem: null,
    dropZones: [],
    activeDropZone: null,
    dragOffset: { x: 0, y: 0 }
  };

  private config: DragDropConfig = {
    enableDrag: true,
    enableDrop: true,
    dragThreshold: 5,
    dropAnimation: true,
    snapToGrid: false,
    gridSize: 10
  };

  private listeners: Map<string, Function[]> = new Map();

  constructor(config?: Partial<DragDropConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  // Event management
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Drag operations
  startDrag(item: DragItem, event: MouseEvent | TouchEvent) {
    if (!this.config.enableDrag) return;

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    this.state = {
      ...this.state,
      isDragging: true,
      draggedItem: item,
      dragOffset: {
        x: clientX,
        y: clientY
      }
    };

    this.emit('dragstart', { item, event });
  }

  updateDrag(event: MouseEvent | TouchEvent) {
    if (!this.state.isDragging) return;

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    // Update drag offset
    this.state.dragOffset = { x: clientX, y: clientY };

    // Check drop zones
    const activeDropZone = this.findDropZone(clientX, clientY);
    if (activeDropZone !== this.state.activeDropZone) {
      this.state.activeDropZone = activeDropZone;
      this.emit('dropzonechange', { dropZoneId: activeDropZone });
    }

    this.emit('drag', { event, offset: this.state.dragOffset });
  }

  endDrag(event: MouseEvent | TouchEvent) {
    if (!this.state.isDragging) return;

    const clientX = 'touches' in event ? event.changedTouches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.changedTouches[0].clientY : event.clientY;

    const dropZone = this.findDropZone(clientX, clientY);
    const success = dropZone && this.canDrop(this.state.draggedItem!, dropZone);

    if (success) {
      this.emit('drop', {
        item: this.state.draggedItem,
        dropZone,
        event
      });
    } else {
      this.emit('dragcancel', { item: this.state.draggedItem, event });
    }

    // Reset state
    this.state = {
      ...this.state,
      isDragging: false,
      draggedItem: null,
      activeDropZone: null,
      dragOffset: { x: 0, y: 0 }
    };
  }

  // Drop zone management
  registerDropZone(dropZone: DropZone) {
    const existingIndex = this.state.dropZones.findIndex(zone => zone.id === dropZone.id);
    if (existingIndex > -1) {
      this.state.dropZones[existingIndex] = dropZone;
    } else {
      this.state.dropZones.push(dropZone);
    }
  }

  unregisterDropZone(dropZoneId: string) {
    this.state.dropZones = this.state.dropZones.filter(zone => zone.id !== dropZoneId);
  }

  updateDropZone(dropZoneId: string, updates: Partial<DropZone>) {
    const index = this.state.dropZones.findIndex(zone => zone.id === dropZoneId);
    if (index > -1) {
      this.state.dropZones[index] = { ...this.state.dropZones[index], ...updates };
    }
  }

  // Utility methods
  private findDropZone(x: number, y: number): string | null {
    for (const dropZone of this.state.dropZones) {
      if (dropZone.isActive && this.isPointInDropZone(x, y, dropZone)) {
        return dropZone.id;
      }
    }
    return null;
  }

  private isPointInDropZone(x: number, y: number, dropZone: DropZone): boolean {
    const { position } = dropZone;
    return (
      x >= position.x &&
      x <= position.x + position.width &&
      y >= position.y &&
      y <= position.y + position.height
    );
  }

  private canDrop(item: DragItem, dropZone: string): boolean {
    const zone = this.state.dropZones.find(z => z.id === dropZone);
    if (!zone) return false;

    return zone.accepts.includes(item.type);
  }

  // Grid snapping
  snapToGrid(x: number, y: number): { x: number; y: number } {
    if (!this.config.snapToGrid) {
      return { x, y };
    }

    return {
      x: Math.round(x / this.config.gridSize) * this.config.gridSize,
      y: Math.round(y / this.config.gridSize) * this.config.gridSize
    };
  }

  // State getters
  getState(): DragState {
    return { ...this.state };
  }

  getConfig(): DragDropConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<DragDropConfig>) {
    this.config = { ...this.config, ...config };
  }
}

// =============================================================================
// REACT HOOKS
// =============================================================================

import { useState, useCallback, useRef, useEffect } from 'react';

export const useDragDrop = (config?: Partial<DragDropConfig>) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedItem: null,
    dropZones: [],
    activeDropZone: null,
    dragOffset: { x: 0, y: 0 }
  });

  const managerRef = useRef<DragDropManager | null>(null);

  useEffect(() => {
    managerRef.current = new DragDropManager(config);
    
    // Set up event listeners
    const manager = managerRef.current;
    
    manager.on('dragstart', (data) => {
      setDragState(prev => ({
        ...prev,
        isDragging: true,
        draggedItem: data.item,
        dragOffset: data.event.clientX ? { x: data.event.clientX, y: data.event.clientY } : prev.dragOffset
      }));
    });

    manager.on('drag', (data) => {
      setDragState(prev => ({
        ...prev,
        dragOffset: data.offset
      }));
    });

    manager.on('dropzonechange', (data) => {
      setDragState(prev => ({
        ...prev,
        activeDropZone: data.dropZoneId
      }));
    });

    manager.on('drop', (data) => {
      setDragState(prev => ({
        ...prev,
        isDragging: false,
        draggedItem: null,
        activeDropZone: null,
        dragOffset: { x: 0, y: 0 }
      }));
    });

    manager.on('dragcancel', (data) => {
      setDragState(prev => ({
        ...prev,
        isDragging: false,
        draggedItem: null,
        activeDropZone: null,
        dragOffset: { x: 0, y: 0 }
      }));
    });

    return () => {
      managerRef.current = null;
    };
  }, [config]);

  const startDrag = useCallback((item: DragItem, event: MouseEvent | TouchEvent) => {
    managerRef.current?.startDrag(item, event);
  }, []);

  const updateDrag = useCallback((event: MouseEvent | TouchEvent) => {
    managerRef.current?.updateDrag(event);
  }, []);

  const endDrag = useCallback((event: MouseEvent | TouchEvent) => {
    managerRef.current?.endDrag(event);
  }, []);

  const registerDropZone = useCallback((dropZone: DropZone) => {
    managerRef.current?.registerDropZone(dropZone);
    setDragState(prev => ({
      ...prev,
      dropZones: [...prev.dropZones.filter(zone => zone.id !== dropZone.id), dropZone]
    }));
  }, []);

  const unregisterDropZone = useCallback((dropZoneId: string) => {
    managerRef.current?.unregisterDropZone(dropZoneId);
    setDragState(prev => ({
      ...prev,
      dropZones: prev.dropZones.filter(zone => zone.id !== dropZoneId)
    }));
  }, []);

  return {
    dragState,
    startDrag,
    updateDrag,
    endDrag,
    registerDropZone,
    unregisterDropZone
  };
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export const createDragItem = (id: string, type: string, data: any): DragItem => ({
  id,
  type,
  data
});

export const createDropZone = (
  id: string,
  accepts: string[],
  position: { x: number; y: number; width: number; height: number }
): DropZone => ({
  id,
  accepts,
  isActive: true,
  position
});

export const calculateDragOffset = (
  startEvent: MouseEvent | TouchEvent,
  currentEvent: MouseEvent | TouchEvent
): { x: number; y: number } => {
  const startX = 'touches' in startEvent ? startEvent.touches[0].clientX : startEvent.clientX;
  const startY = 'touches' in startEvent ? startEvent.touches[0].clientY : startEvent.clientY;
  const currentX = 'touches' in currentEvent ? currentEvent.touches[0].clientX : currentEvent.clientX;
  const currentY = 'touches' in currentEvent ? currentEvent.touches[0].clientY : currentEvent.clientY;

  return {
    x: currentX - startX,
    y: currentY - startY
  };
};

export const isDragThresholdMet = (
  startEvent: MouseEvent | TouchEvent,
  currentEvent: MouseEvent | TouchEvent,
  threshold: number = 5
): boolean => {
  const offset = calculateDragOffset(startEvent, currentEvent);
  return Math.abs(offset.x) > threshold || Math.abs(offset.y) > threshold;
};

export const validateComponentPlacement = (
  component: any,
  targetZone: DropZone,
  existingComponents: any[]
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check if component type is accepted by drop zone
  if (!targetZone.accepts.includes(component.type)) {
    errors.push(`Component type '${component.type}' is not accepted in this zone`);
  }

  // Check for overlapping components
  const overlapping = existingComponents.some(existing => {
    return existing.position && component.position &&
           existing.position.x < component.position.x + component.position.width &&
           existing.position.x + existing.position.width > component.position.x &&
           existing.position.y < component.position.y + component.position.height &&
           existing.position.y + existing.position.height > component.position.y;
  });

  if (overlapping) {
    errors.push('Component placement overlaps with existing components');
  }

  // Check if component fits within drop zone bounds
  if (component.position && targetZone.position) {
    if (component.position.x < targetZone.position.x ||
        component.position.y < targetZone.position.y ||
        component.position.x + component.position.width > targetZone.position.x + targetZone.position.width ||
        component.position.y + component.position.height > targetZone.position.y + targetZone.position.height) {
      errors.push('Component placement is outside drop zone bounds');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export default DragDropManager;
