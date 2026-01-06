
export type CaptureMode = "auto" | "minimal" | "full";

export interface CapturePolicy {
  mode: CaptureMode;
  maxCandidates: number;
  maxPayloadKB: number;
}

export interface FlowStartInput {
  flowId: string;
  workflowName: string;
  workflowVersion?: string;
  capturePolicy?: Partial<CapturePolicy>;
}

export interface FilterReasonSample {
  reason: string;
  count: number;
}

export interface FinalChoiceInput {
  id: string;
  label?: string;
  score?: number;
  confidence?: number;
  explanation?: string;
}
