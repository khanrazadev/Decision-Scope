import "dotenv/config";

import { runCompetitorFlow } from "./competitorFlow";

/**
 * Entry point for running the demo workflow.
 * This mimics a real system invoking the decision pipeline.
 */
async function main() {
  try {
    await runCompetitorFlow();
    console.log("Demo flow completed");
  } catch (err) {
    console.error("Demo flow failed", err);
  }
}

main();
