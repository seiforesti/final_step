// AuditEvent.ts
export interface AuditEvent {
  id: number;
  proposal_id?: number;
  action: string;
  performed_by: string;
  note?: string;
  timestamp: string;
}
