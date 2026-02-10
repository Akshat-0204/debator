import { AIAdapterFactory, DebateContext, DebateModel } from "./adapters";
import Debate, { IDebate } from "../models/debate";
import Message, { IMessage } from "../models/message";
import JudgeReport, { IReport } from "../models/judgementReport";
import { v4 as uuidv4 } from "uuid";
import debate from "../models/debate";

interface DebateConfiguration {
  motion: string;
  forModel: { provider: string; model?: string };
  againstModel: { provider: string; model?: string };
  judgeModel: { provider: string; model?: string };
  maxRounds?: number;
}

export class debateLogic {
  private debate: IDebate | null = null;
  private forAI: DebateModel;
  private againstAI: DebateModel;
  private judgeAI: DebateModel;
  private maxTokens: number;

  constructor(configuration: DebateConfiguration) {
    this.forAI = AIAdapterFactory.createModel(
      configuration.forModel.provider as any,
      configuration.forModel.model || "",
    );

    this.againstAI = AIAdapterFactory.createModel(
      configuration.againstModel.provider as any,
      configuration.againstModel.model || "",
    );

    this.judgeAI = AIAdapterFactory.createModel(
      configuration.judgeModel.provider as any,
      configuration.judgeModel.model || "",
    );

    this.maxTokens = parseInt(process.env.MAXTOKENS_PER_ROUND || "1000");
  }

  async startDebate(configuration: DebateConfiguration): Promise<IDebate> {
    const sessionId = uuidv4();

    this.debate = await Debate.create({
      sessionId,
      motion: configuration.motion,
      forModel: configuration.forModel,
      againstModel: configuration.againstModel,
      judgeModel: configuration.judgeModel,
      status: "active",
      currentRound: 0,
      maxRounds:
        configuration.maxRounds || parseInt(process.env.MAXROUNDS || "6"),
    });

    return this.debate;
  }

  async executeTurn(sessionId: string): Promise<{
    forMessage: IMessage;
    againstMessage: IMessage;
    shouldContinue: boolean;
    judgeReport?: IReport;
  }> {
    const debate = await Debate.findOne({ sessionId });
    if (!debate) {
      throw new Error("Debate not found");
    }

    if (debate.status !== "active") {
      throw new Error("Debate is not active");
    }

    const previousMessages = await Message.find({ debateId: sessionId }).sort({
      turnNumber: 1,
    });
    const previousTurns = previousMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const currentTurn = debate.currentRound + 1;

    //creating for the motion responses
    const forContext: DebateContext = {
      motion: debate.motion,
      role: "for",
      previousTurns: previousTurns,
      turnNumber: currentTurn,
    };

    const forResponse = await this.forAI.generateResponse(
      forContext,
      this.maxTokens,
    );
    const forMessage = await Message.create({
      debateId: sessionId,
      role: "for",
      modelName: debate.forModel.model || debate.forModel.provider,
      content: forResponse,
      turnNumber: currentTurn,
    });

    //creating against the motion responses
    const againstContext: DebateContext = {
      motion: debate.motion,
      role: "against",
      previousTurns: previousTurns,
      turnNumber: currentTurn,
    };

    const againstResponse = await this.againstAI.generateResponse(
      againstContext,
      this.maxTokens,
    );
    const againstMessage = await Message.create({
      debateId: sessionId,
      role: "against",
      modelName: debate.againstModel.model || debate.againstModel.provider,
      content: againstResponse,
      turnNumber: currentTurn,
    });

    //updating debate
    debate.currentRound = currentTurn;
    debate.updatedAt = new Date();

    const shouldContinue = currentTurn < debate.maxRounds; //agar zyada hua toh debate khatam kardena
    if (!shouldContinue) {
      debate.status = "completed";
    }
    await debate.save();

    return {
      forMessage,
      againstMessage,
      shouldContinue,
    };
  }

  //stop debate
  async stopDebate(sessionId: string): Promise<void> {
    const debate = await Debate.findOne({ sessionId });
    if (!debate) {
      throw new Error("Error not found ");
    }

    //debate ka status set karke save kardo
    debate.status = "completed";
    debate.updatedAt = new Date();
    await debate.save();
  }

  //Judge report generate karwane ke liye function
  async generateJudgeReport(sessionId: string): Promise<any> {
    const debate = await Debate.findOne({ sessionId });
    if (!debate) {
      throw new Error("Debate not found");
    }

    const messages = await Message.find({ debateId: sessionId }).sort({
      turnNumber: 1,
    });

    const allTurns = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const judgeContext: DebateContext = {
      motion: debate.motion,
      role: "judge",
      previousTurns: allTurns,
      turnNumber: 0,
    };

    const judgeResponse = await this.judgeAI.generateResponse(
      judgeContext,
      2000,
    );

    //response aaya , usko parse karna padega
    let parsedReport: any;
    try {
      const jsonMatch = judgeResponse.match(/\{[\s\S]*\}/);
      parsedReport = JSON.parse(jsonMatch ? jsonMatch[0] : judgeResponse);
    } catch (error) {
      console.error("Error parsing judge response", error);
      throw new Error("Invalid judge response");
    }

    //ab jo bhi response aya hai use database me save karna
    const judgeReport = await JudgeReport.create({
      debateId: sessionId,
      verdict: parsedReport.verdict,
      forScore: parsedReport.forScore,
      againstScore: parsedReport.againstScore,
      summary: parsedReport.summary,
      insights: parsedReport.insights,
      fallacies: parsedReport.fallacies,
      keyQuotes: parsedReport.keyQuotes,
    });

    return judgeReport;
  }
}
