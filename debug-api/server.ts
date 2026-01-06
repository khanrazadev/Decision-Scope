import "dotenv/config";

import express from "express";
import { connectDB } from "./db";
import { ingestRouter } from "./routes/ingest";
import { queryRouter } from "./routes/query";

async function start() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing");
  }

  if (!process.env.MONGODB_DB_NAME) {
    throw new Error("MONGODB_DB_NAME is missing");
  }

  await connectDB(
    process.env.MONGODB_URI,
    process.env.MONGODB_DB_NAME
  );

  const app = express();
  app.use(express.json({ limit: "512kb" }));

  app.use("/ingest", ingestRouter);
  app.use("/query", queryRouter);

  app.listen(4000, () => {
    console.log("Debug API listening on 4000");
  });
}

start().catch(err => {
  console.error("Fatal startup error", err);
  process.exit(1);
});
