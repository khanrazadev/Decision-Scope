
import { CapturePolicy } from "./types";

const DEFAULT_POLICY: CapturePolicy = {
  mode: "auto",
  maxCandidates: 5000,
  maxPayloadKB: 256
};

export function resolveCapturePolicy(
  override?: Partial<CapturePolicy>
): CapturePolicy {
  return {
    ...DEFAULT_POLICY,
    ...override
  };
}

export function shouldSampleCandidates(
  totalCount: number,
  policy: CapturePolicy
): boolean {
  if (policy.mode === "full") return false;
  if (policy.mode === "minimal") return true;

  // auto
  return totalCount > 50;
}
