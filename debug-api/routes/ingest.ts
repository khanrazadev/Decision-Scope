
import { Router } from "express";
import { ingestController } from "../controllers/ingestController";

export const ingestRouter = Router();

ingestRouter.post("/", ingestController);
