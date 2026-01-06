
# Decision Scope

Decision Scope is an internal debugging system used to understand **why a system made a particular decision**.

It is designed for backend decision logic such as:
- Ranking systems
- Recommendation flows
- Heuristics
- LLM-based workflows where decisions happen in multiple steps
-It is meant for engineers debugging complex decision behavior.

---

## Setup Instructions

### Requirements

- Node.js
- MongoDB (local or MongoDB Atlas)
- Environment variables

---

### Environment Variables

Create a `.env` file in the project root and add:

```env
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB_NAME=decision_debug_demo
DEBUG_API_URL=http://localhost:4000

NODE_ENV=development
````

---

## Start the Debug API

Run the following command:

```bash
npx ts-node debug-api/server.ts
```

You should see:

```
Debug API listening on 4000
```

---

## Run the Demo Workflow

In another terminal, run:

```bash
npx ts-node demo/runDemo.ts
```

This simulates a decision workflow and sends decision data to the Debug API.

---

## Verify Data

In MongoDB, you should see two collections:

* `flows`
* `stages`

You can also test the query endpoints in a browser or using `curl`:

* [http://localhost:4000/query/low-confidence?threshold=0.4](http://localhost:4000/query/low-confidence?threshold=0.4)
* [http://localhost:4000/query/ranking-changes](http://localhost:4000/query/ranking-changes)
* [http://localhost:4000/query/heavy-filters](http://localhost:4000/query/heavy-filters)

---

## Brief Explanation of the Approach

Decision Scope works by embedding a small SDK into decision pipelines.

As a decision runs, the SDK records:

* What input the system received
* What candidates were considered
* How filtering behaved
* What final choice was made and why

This data is sent to a backend API in a **best-effort** way and stored in MongoDB.

Later, engineers can query past decisions to understand **where and why things went wrong**.

The demo uses **hard-coded data on purpose** so the behavior is predictable and easy to inspect.

---

## Known Limitations

* No user interface (API-only)
* No authentication or access control
* Best-effort ingestion (not guaranteed delivery)
* No automatic comparison between similar decisions

---

## Future Improvements

* Web UI for inspecting flows and stages
* Comparing similar decisions across runs
* Confidence trend analysis
* Multi-team access control
* Cleanup and archiving for old data

---

## Notes

* See `ARCHITECTURE.md` for detailed design reasoning and trade-offs
* The demo is meant to validate the system, not represent real business logic

```

