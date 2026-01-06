
import { CapturePolicy, FinalChoiceInput, FilterReasonSample } from "./types";
import { safeSend } from "./sender";
import { shouldSampleCandidates } from "./capturePolicy";

interface StageInit {
  flowId: string;
  stageName: string;
  stageOrder: number;
  capturePolicy: CapturePolicy;
}

export class StageRecorder {
  private readonly flowId;
  private readonly stageName;
  private readonly stageOrder;
  private readonly capturePolicy;
  private ended = false;

  constructor(init: StageInit) {
    this.flowId = init.flowId;
    this.stageName = init.stageName;
    this.stageOrder = init.stageOrder;
    this.capturePolicy = init.capturePolicy;

    safeSend({
      type: "stage-start",
      payload: {
        flowId: this.flowId,
        stageName: this.stageName,
        stageOrder: this.stageOrder
      }
    });
  }

  captureInput(input: Record<string, unknown>): void {
    safeSend({
      type: "stage-input",
      payload: {
        flowId: this.flowId,
        stageName: this.stageName,
        input
      }
    });
  }

  captureCandidates(candidates: Array<{ id: string; label?: string; score?: number }>): void {
    const totalCount = candidates.length;

    let sampled;
    let summary;

    if (shouldSampleCandidates(totalCount, this.capturePolicy)) {
      sampled = candidates.slice(0, 50);
      summary = {
        strategy: "sampled",
        notes: `Sampled 50 of ${totalCount}`
      };
    }

    safeSend({
      type: "stage-candidates",
      payload: {
        flowId: this.flowId,
        stageName: this.stageName,
        candidates: {
          totalCount,
          sampled,
          summary
        }
      }
    });
  }

  captureFilterResult(input: {
    removedCount: number;
    reasons?: FilterReasonSample[];
  }): void {
    const removalRate =
      input.removedCount <= 0 ? 0 : input.removedCount;

    safeSend({
      type: "stage-filter",
      payload: {
        flowId: this.flowId,
        stageName: this.stageName,
        filterResult: {
          removedCount: input.removedCount,
          removalRate,
          reasonsSample: input.reasons
        }
      }
    });
  }

  captureFinalChoice(choice: FinalChoiceInput): void {
    safeSend({
      type: "stage-final",
      payload: {
        flowId: this.flowId,
        stageName: this.stageName,
        finalChoice: choice
      }
    });
  }

  end(warnings?: string[]): void {
    if (this.ended) return;
    this.ended = true;

    safeSend({
      type: "stage-end",
      payload: {
        flowId: this.flowId,
        stageName: this.stageName,
        warnings
      }
    });
  }
}
