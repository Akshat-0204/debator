import { GoogleGenerativeAI } from "@google/generative-ai";
import { DebateContext, DebateModel } from "./debatemodel.interface";
import { buildPrompt } from "../prompts";

export class GeminiAdapter implements DebateModel {
  name: string;
  private client: GoogleGenerativeAI;
  private model: any;

  constructor(modelName: string = "gemini-2.5-flash") {
    this.name = "gemini";
    this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    this.model = this.client.getGenerativeModel({ model: modelName });
  }

  async generateResponse(
    context: DebateContext,
    maxTokens: number = 1000,
  ): Promise<string> {
    try {
      const prompt = await buildPrompt(context);

      const result = await this.model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 0.7,
        },
      });

      return result.response.text() || "no response was generated in gemini api";
    } catch (error) {
      console.log("Response not generated , API issue hoga", error);
      throw new Error("Failed to generate response from Gemini");
    }
  }
}
