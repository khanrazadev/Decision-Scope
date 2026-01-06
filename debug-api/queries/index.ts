import { Request, Response } from "express";
import { getFlowsCollection, getStagesCollection } from "../db";

/**
 * Returns stages where a filter removed a large portion of candidates.
 * This usually indicates overly strict heuristics or bad early assumptions.
 */
export async function removedMostCandidates(
  _req: Request,
  res: Response
) {
  const results = await getStagesCollection()
    .find({
      "filterResult.removalRate": { $gte: 0.9 }
    })
    .limit(50)
    .toArray();

  res.json(results);
}

/**
 * Returns flows where the final choice confidence is below a threshold.
 * Low confidence decisions are often correct but risky and deserve inspection.
 */
export async function lowConfidenceFinalChoices(
  req: Request,
  res: Response
) {
  const threshold =
    typeof req.query.threshold === "string"
      ? Number(req.query.threshold)
      : 0.4;

  const results = await getStagesCollection()
    .find({
      "finalChoice.confidence": { $lte: threshold }
    })
    .limit(50)
    .toArray();

  res.json(results);
}


/**
 * Returns stages where the explanation caused a ranking change.
 * This is a strong signal of non-determinism or late-stage overrides.
 */
export async function rankingChangedStages(
  _req: Request,
  res: Response
) {
  const results = await getStagesCollection()
    .find({
      "explanation.changedRanking": true
    })
    .limit(50)
    .toArray();

  res.json(results);
}
