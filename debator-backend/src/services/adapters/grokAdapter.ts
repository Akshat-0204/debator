import {xai} from "@ai-sdk/xai";
import {DebateContext , DebateModel} from "./debatemodel.interface";
import { buildPrompt } from "../prompts";

export class GrokAdapter implements DebateModel {
    name : string;
    private client : xai;
    private model : string;

    constructor(model : string = "grok-4.1-fast") {
        this.name = "grok";
        this.model = model;
        this.client = new xai({
            apiKey : process.env.GROK_API_KEY,
        });
    }

    async generateResponse(
        context : DebateContext,
        maxTokens : number = 1000,
    ) : Promise<string> {
        try {
            const prompt = buildPrompt(context);

            const response = await this.client.chat.completions.create({
                model : this.model,
                messages : [
                    {
                        role : "user",
                        content : prompt,
                    },
                ],
                max_tokens : maxTokens,
                temperature : 0.7,
            });

            return response.choices[0].message?.content || "No response generated";
        } catch (error) {
            console.log("Response not generated , API issue hoga", error);
            throw new Error("Failed to generate response from Grok");
        }
    }
}