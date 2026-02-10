import { Request, Response } from "express";
import { debateLogic } from "../services/debateLogic";
import Debate from "../models/debate";
import Message from "../models/message";
import JudgeReport from "../models/judgementReport";

export const createDebate = async (req: Request, res: Response) => {
  try {
    const { motion, forModel, againstModel, judgeModel, maxRounds } = req.body;

    if (!motion || !forModel || !againstModel || !judgeModel) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const orchestrator = new debateLogic({
      motion,
      forModel,
      againstModel,
      judgeModel,
      maxRounds,
    });

    const debate = await orchestrator.startDebate({
      motion,
      forModel,
      againstModel,
      judgeModel,
      maxRounds,
    });

    res.status(201).json({
      sessionId: debate.sessionId,
      debate,
    });
  } catch (error: any) {
    console.error("Create debate error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const executeTurn = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params as { sessionId: string };

    const debate = await Debate.findOne({ sessionId });
    if (!debate) {
      return res.status(404).json({ error: "Debate not found" });
    }

    const orchestrator = new debateLogic({
      motion: debate.motion,
      forModel: debate.forModel,
      againstModel: debate.againstModel,
      judgeModel: debate.judgeModel,
    });

    const result = await orchestrator.executeTurn(sessionId);

    res.json(result);
  } catch (error: any) {
    console.error("Execute turn error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const stopDebate = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params as { sessionId: string };

    const debate = await Debate.findOne({ sessionId });
    if (!debate) {
      return res.status(404).json({ error: "Debate not found" });
    }

    const orchestrator = new debateLogic({
      motion: debate.motion,
      forModel: debate.forModel,
      againstModel: debate.againstModel,
      judgeModel: debate.judgeModel,
    });

    await orchestrator.stopDebate(sessionId);

    res.json({ message: "Debate stopped successfully" });
  } catch (error: any) {
    console.error("Stop debate error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const generateJudgement = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params as { sessionId: string };

    const debate = await Debate.findOne({ sessionId });
    if (!debate) {
      return res.status(404).json({ error: "Debate not found" });
    }

    const orchestrator = new debateLogic({
      motion: debate.motion,
      forModel: debate.forModel,
      againstModel: debate.againstModel,
      judgeModel: debate.judgeModel,
    });

    const report = await orchestrator.generateJudgeReport(sessionId);

    res.json(report);
  } catch (error: any) {
    console.error("Generate judgement error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getDebate = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params as { sessionId: string };

    const debate = await Debate.findOne({ sessionId });
    if (!debate) {
      return res.status(404).json({ error: "Debate not found" });
    }

    const messages = await Message.find({ debateId: sessionId }).sort({
      turnNumber: 1,
    });

    const judgeReport = await JudgeReport.findOne({ debateId: sessionId });

    res.json({
      debate,
      messages,
      judgeReport,
    });
  } catch (error: any) {
    console.error("Get debate error:", error);
    res.status(500).json({ error: error.message });
  }
};
