
import { resolveCapturePolicy } from "./capturePolicy";
import  { StageRecorder } from "./stage";
import { FlowStartInput } from "./types";
import { safeSend } from "./sender";

export class DebugFlow {
  private readonly flowId: string;
  private readonly workflowName: string;
  private readonly capturePolicy;
  private stageOrder = 0;
  private ended = false;

  private constructor(input: FlowStartInput) {
    this.flowId = input.flowId;
    this.workflowName = input.workflowName;
    this.capturePolicy = resolveCapturePolicy(input.capturePolicy);

    safeSend({
      type: "flow-start",
      payload: {
        flowId: this.flowId,
        workflowName: this.workflowName,
        capturePolicy: this.capturePolicy
      }
    });
  }

  static start(input: FlowStartInput): DebugFlow {
    return new DebugFlow(input);
  }

  startStage(stageName: string): StageRecorder {
    if (this.ended) {
      throw new Error("Cannot start stage on ended flow");
    }

    return new StageRecorder({
      flowId: this.flowId,
      stageName,
      stageOrder: ++this.stageOrder,
      capturePolicy: this.capturePolicy
    });
  }

  end(): void {
    if (this.ended) return;
    this.ended = true;

    safeSend({
      type: "flow-end",
      payload: {
        flowId: this.flowId
      }
    });
  }
}
