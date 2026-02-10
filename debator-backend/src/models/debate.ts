import mongoose, { Schema, Document } from "mongoose";

export interface ModelConfig {
  provider: string;
  model?: string;
}

export interface IDebate extends Document {
  sessionId: string;
  motion: string; //yeh for/against decide krega
  forModel: ModelConfig;
  againstModel: ModelConfig;
  judgeModel: ModelConfig;
  status: "active" | "completed" | "error" | "stopped";
  currentRound: number;
  maxRounds: number;
  updatedAt: Date;
  createdAt?: Date;
}

const modelConfigSchema = new Schema(
  {
    provider: { type: String, required: true },
    model: { type: String, required: false },
  },
  { _id: false },
);

const debateSchema: Schema = new Schema({
  sessionId: { type: String, unique: true, index: true, required: true },
  motion: { type: String, required: true },
  forModel: { type: modelConfigSchema, required: true },
  againstModel: { type: modelConfigSchema, required: true },
  judgeModel: { type: modelConfigSchema, required: true },
  status: {
    type: String,
    enum: ["active", "completed", "error", "stopped"],
    default: "active",
  },
  currentRound: { type: Number, required: true },
  maxRounds: { type: Number, required: true },
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IDebate>("Debate", debateSchema);
