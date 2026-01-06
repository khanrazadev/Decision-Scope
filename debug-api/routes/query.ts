import { Router } from "express";
import {
  removedMostCandidates,
  lowConfidenceFinalChoices,
  rankingChangedStages
} from "../queries";

export const queryRouter = Router();

// Stages where a filter removed most candidates.
// Useful for spotting overly aggressive heuristics.
queryRouter.get("/heavy-filters", removedMostCandidates);

// Flows where the system was unsure about the final decision.
// Especially important for LLM-based choices.
queryRouter.get("/low-confidence", lowConfidenceFinalChoices);

// Stages where explanation materially changed ranking.
// Signals non-deterministic or unstable reasoning.
queryRouter.get("/ranking-changes", rankingChangedStages);
