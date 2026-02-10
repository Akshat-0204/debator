import OpenAI from "openai";

import { DebateContext, DebateModel } from "./debatemodel.interface";
import { buildPrompt } from "../prompts";

export class OpenAiAdapter implements DebateModel {
  name: string;
  private client: OpenAI;
  private model: string;

  //gpt model dekhna padega konsa mil rha hai free mein
  //can be changed
  constructor(model: string = "gpt-4o") {
    this.name = "openai";
    this.model = model;
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateResponse(
    context: DebateContext,
    maxTokens: number = 1000,
  ): Promise<string> {
    try {
      const prompt = buildPrompt(context);

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || "No response generated";
    } catch (error) {
        console.log("Response not generated , API issue hoga", error);
        throw new Error("Failed to generate response from OpenAI");
    }
  }
}
