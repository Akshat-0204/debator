import { Router } from "express";
import * as debateController from "../controllers/debateController";

const router = Router();

router.post("/debates", debateController.createDebate);
router.get("/debates/:sessionId", debateController.getDebate);
router.post("/debates/:sessionId/turn", debateController.executeTurn);
router.post("/debates/:sessionId/stop", debateController.stopDebate);
router.post("/debates/:sessionId/judge", debateController.generateJudgement);

export default router;