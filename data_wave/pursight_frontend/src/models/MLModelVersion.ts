// MLModelVersion.ts
export interface MLModelVersion {
  id: number;
  version: string;
  trained_at: string;
  accuracy?: number;
  precision?: number;
  recall?: number;
  notes?: string;
  is_active?: boolean;
}
