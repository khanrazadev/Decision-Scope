
import { DebugFlow } from "../debug-sdk/flow";

/**
 * Simulates a competitor selection workflow.
 * This intentionally contains a non-deterministic step
 * that may produce a bad match.
 */
export async function runCompetitorFlow(): Promise<void> {
  const flow = DebugFlow.start({
    flowId: `flow-${Date.now()}`,
    workflowName: "competitor-selection",
    workflowVersion: "v1"
  });

  /**
   * Stage 1: Initial category filter
   * We start with a mixed candidate set.
   */
  const stage1 = flow.startStage("initial-category-filter");

  stage1.captureInput({
    userQuery: "best laptop stand for desk",
    detectedCategory: "laptop-accessories"
  });

  const candidates = [
    { id: "c1", label: "Aluminum Laptop Stand", score: 0.8 },
    { id: "c2", label: "Adjustable Desk Stand", score: 0.7 },
    { id: "c3", label: "Phone Case – Shockproof", score: 0.9 }
  ];

  stage1.captureCandidates(candidates);

  // Phone case survives due to loose category matching
  stage1.captureFilterResult({
    removedCount: 0,
    reasons: [{ reason: "category-match-loose", count: 3 }]
  });

  stage1.end();

  /**
   * Stage 2: Ranking with non-deterministic reasoning
   * This simulates an LLM-style judgment call.
   */
  const stage2 = flow.startStage("llm-ranking");

  stage2.captureInput({
    rankingStrategy: "review-heavy",
    note: "LLM prioritizes reviews over product type"
  });

  // Simulate non-determinism
  const randomBias = Math.random();

  const finalChoice =
    randomBias > 0.6
      ? { id: "c3", label: "Phone Case – Shockproof", score: 0.95 }
      : { id: "c1", label: "Aluminum Laptop Stand", score: 0.85 };

  stage2.captureFinalChoice({
    ...finalChoice,
    confidence: 0.32,
    explanation:
      "Selected based on unusually high review sentiment despite weak category alignment",
  });

  // Explanation overrode original ranking
  stage2.end([
    "Explanation overrode category relevance",
    "High review sentiment dominated decision"
  ]);

  flow.end();
}
