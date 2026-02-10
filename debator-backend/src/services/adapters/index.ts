import { DebateModel } from "./debatemodel.interface";
import { OpenAiAdapter } from "./openAiAdapter";
import { GeminiAdapter } from "./geminiAdapter";
import { GrokAdapter } from "./grokAdapter";

export type ModelProvider = "openai" | "gemini" | "grok";

export class AIAdapterFactory{
    static createModel(provider : ModelProvider, modelName : string) : DebateModel{
        switch(provider){
            case "openai" : return new OpenAiAdapter(modelName || 'gpt-4o');
            case "gemini" : return new GeminiAdapter(modelName || 'gemini-2.5-flash');
            case "grok" : return new GrokAdapter(modelName || 'grok-4.1-fast');
            default : throw new Error(`Unsupported provider: ${provider}`);
        }
    } 
}

export type {DebateModel, DebateContext} from "./debatemodel.interface";