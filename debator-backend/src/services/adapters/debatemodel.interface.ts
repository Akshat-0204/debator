export interface DebateContext {
  motion: string;
  role: "for" | "against" | "judge";
  previousTurns: Array<{
    role: "for" | "against";
    content: string;
  }>;
  turnNumber: number;
}

export interface DebateModel {
  name: string;
  generateResponse(content: DebateContext, maxTokens?: number): Promise<string>;
}
