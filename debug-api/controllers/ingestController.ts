
import { Request, Response } from "express";
import { getFlowsCollection, getStagesCollection } from "../db";

export async function ingestController(req: Request, res: Response) {
  const { type, payload } = req.body;
console.log("INGEST EVENT:", req.body.type);

  try {
    switch (type) {
      case "flow-start":
        await getFlowsCollection().updateOne(
          { flowId: payload.flowId },
          {
            $setOnInsert: {
              flowId: payload.flowId,
              workflowName: payload.workflowName,
              startedAt: new Date(),
              capturePolicy: payload.capturePolicy,
              stageCount: 0,
              status: "partial",
            },
          },
          { upsert: true }
        );
        break;

      case "stage-start":
        await getStagesCollection().insertOne({
          flowId: payload.flowId,
          stageName: payload.stageName,
          stageOrder: payload.stageOrder,
          startedAt: new Date(),
        });

        await getFlowsCollection().updateOne(
          { flowId: payload.flowId },
          { $inc: { stageCount: 1 } }
        );
        break;

      case "stage-input":
        await getStagesCollection().updateOne(
          { flowId: payload.flowId, stageName: payload.stageName },
          { $set: { inputData: payload.input } }
        );
        break;

      case "stage-candidates":
        await getStagesCollection().updateOne(
          { flowId: payload.flowId, stageName: payload.stageName },
          { $set: { candidates: payload.candidates } }
        );
        break;

      case "stage-filter":
        await getStagesCollection().updateOne(
          { flowId: payload.flowId, stageName: payload.stageName },
          { $set: { filterResult: payload.filterResult } }
        );
        break;

      case "stage-final":
        await getStagesCollection().updateOne(
          { flowId: payload.flowId, stageName: payload.stageName },
          {
            $set: {
              finalChoice: payload.finalChoice,
              explanation: payload.explanation,
            },
          }
        );

        break;

      case "stage-end":
        await getStagesCollection().updateOne(
          { flowId: payload.flowId, stageName: payload.stageName },
          {
            $set: { completedAt: new Date() },
            ...(payload.warnings
              ? { $set: { warnings: payload.warnings } }
              : {}),
          }
        );
        break;

      case "flow-end":
        await getFlowsCollection().updateOne(
          { flowId: payload.flowId },
          {
            $set: {
              completedAt: new Date(),
              status: "completed",
            },
          }
        );
        break;
    }

    res.status(204).end();
  } catch (err) {
    // Never fail ingestion loudly
    res.status(202).end();
  }
}
