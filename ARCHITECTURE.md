## Decision Scope – Decision Debugging System

Decision Scope is an internal debugging system built to understand why a system made a particular decision.

This problem appears often in ranking systems, recommendation logic, heuristics, and LLM-based workflows, where decisions happen in multiple steps and are not always deterministic.

The goal of Decision Scope is to answer a single question:

``Why did the system produce this output? ``

This document focuses on reasoning, trade-offs, and failure modes rather than implementation details.

---

## High-level overview

Decision Scope consists of three components:

```
Application Code
     |
     |  (SDK emits decision events)
     v
Debug SDK
     |
     |  HTTP (best-effort, fire-and-forget)
     v
Debug API
     |
     v
MongoDB
```

* The **SDK** is embedded inside decision pipelines.
* The **API** ingests decision events.
* **MongoDB** stores historical decision structure for later inspection.

A strict requirement is that Decision Scope must never break the main system.
If the backend is unavailable, the decision pipeline must still complete normally.

---

## Core concepts

**Flow**

* Represents one full execution of a decision.
* Example: one competitor-selection request.

**Stage**

* Represents a single logical decision step within a flow.
* Examples: retrieval, filtering, ranking, LLM judgment.

Relationship:

```
Flow (1) ──▶ (N) Stage
```

Stages reference their parent via `flowId`.

---

## Data model and reasoning

### Why stages are separate documents

I considered embedding all stages inside a single Flow document.
This was rejected for the following reasons:

1. **Unbounded document growth**
   Candidate-heavy stages can involve thousands of items, quickly approaching MongoDB’s document size limits.

2. **Poor cross-workflow queryability**
   Queries like “show all filtering steps that removed >90% of candidates” become expensive and awkward when stages are deeply nested.

3. **Partial executions**
   Real systems fail mid-flight. Stages need to exist independently even if a flow never completes.

### What would break with a different design

If stages were embedded:

* Large candidate lists would require aggressive truncation or data loss
* Stage-level analysis across pipelines would require full document scans
* Partial flows would be hard to represent without special casing

Separating stages makes partial data a first-class, inspectable state.

---

## Debugging walkthrough (bad match example)

**Scenario**
A competitor-selection run returns a **phone case** for the query *“best laptop stand”*.

### How X-Ray is used

1. An engineer queries suspicious decisions:

   ```
   GET /query/low-confidence?threshold=0.4
   ```

2. The response highlights a specific stage:

   * `stageName: "llm-ranking"`
   * `finalChoice.confidence: 0.32`

3. Inspecting that stage shows:

   * Input: ranking strategy biased toward reviews
   * Candidates: laptop stands + phone case
   * Explanation metadata indicating ranking override

### Outcome

The issue did not come from fetching or filtering candidates.
It came from the ranking step.

Without Decision Scope, only the final output would be visible.
With Decision Scope, the exact step where the decision changed is clear.

---

## Queryability Across Pipelines

Decision Scope is designed to work across many pipelines:

* competitor selection
* listing optimization
* categorization
* ranking heuristics

### Design principle

**Queries are based on stage behavior, not pipeline names.**

Stages emit structured, queryable fields such as:

* `filterResult.removalRate`
* `finalChoice.confidence`
* `explanation.changedRanking`

### Example cross-pipeline query

 **Show all runs where filtering eliminated more than 90% of candidates**

This works because:

* Any filtering stage records `filterResult`
* The backend queries on `removalRate >= 0.9`
* No assumptions are made about workflow or stage naming

### Developer constraints

To enable this:

* Developers must emit semantic fields (numbers/booleans), not only text
* Free-form explanations are allowed, but not relied on for queries

This trades some flexibility for reliable cross-workflow analysis.

---

## Performance & Scale

### Problem case

A stage receives:

* 5,000 candidates
* Filters down to 30

Capturing full details and rejection reasons for all 5,000 is expensive.

### Design choice

Capture policy is handled **in the SDK**, not the backend.

Default behavior:

* Small sets → full capture
* Medium sets → sampling
* Large sets → summary + bounded sample

Example stored data:

* `totalCount: 5000`
* `sampled: 50 items`
* `summary: "Sampled 50 of 5000"`

## Developer Experience

### (a) Minimal instrumentation

To get value quickly, a developer adds:

* `DebugFlow.start()`
* `flow.startStage()`
* `stage.captureFinalChoice()`

This already enables:

* Flow tracking
* Low-confidence analysis

### (b) Full instrumentation

Additional optional calls:

* `captureInput`
* `captureCandidates`
* `captureFilterResult`
* Explanation metadata

This provides full decision introspection.

### (c) Backend unavailable

If the decision scope backend is down:

* SDK swallows errors
* No exceptions are thrown
* The host pipeline continues normally

Failure isolation is a hard requirement.

---

## Real-World Application

In a ranking system I’ve worked with, regressions surfaced as metric drops without clear attribution.

Debugging required:

* Manual log correlation
* Re-running historical inputs
* Guessing which step changed behavior

An system would have immediately shown:

* Which stage changed behavior
* Whether ranking logic was overridden
* Whether decision confidence dropped

This design allows incremental retrofitting without rewriting existing pipelines.

---

## API Overview (Brief)

### Ingest

```
POST /ingest
```

Accepts discrete decision events:

* flow-start
* stage-start
* stage-input
* stage-candidates
* stage-filter
* stage-final
* stage-end

Ingestion is best-effort and idempotency-tolerant.

---

### Endpoints

```
GET /query/low-confidence
GET /query/ranking-changes
GET /query/heavy-filters
```

All queries operate on historical data.

---

## What Next

If shipping this system for real-world use:

* Authentication and tenancy
* UI for visual flow inspection
* Decision comparison across similar runs
* Confidence drift detection
* Storage tiering for older data

These were intentionally out of scope for this exercise.

---
