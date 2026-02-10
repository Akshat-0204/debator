import { DebateContext, DebateModel } from "./adapters";
export function buildPrompt(context : DebateContext) : string {
    const {motion , role,  previousTurns , turnNumber} = context;

    if(role === "judge"){
        return buildJudgePrompt(motion , previousTurns);
    }
    
    return buildDebatorPrompt(motion , role , previousTurns , turnNumber);

}


function buildDebatorPrompt(motion : string ,
    role : "for" | "against",
    previousTurns : Array<{
        role : string;
        content : string;
    }>,
    turnNumber : number,
) : string {
    const stance = role === 'for' ? 'FOR' : 'AGAINST';
    const opposite = role === 'for' ? 'AGAINST' : 'FOR';
  
    let prompt = `You are participating in a formal debate on the following motion:
  
  MOTION: "${motion}"
  
  YOUR ROLE: You are arguing strictly ${stance} this motion.
  
  CRITICAL CONSTRAINTS:
  - You MUST argue ${stance} the motion at all times
  - You may NOT concede the debate unless logically forced to do so
  - Focus on logical reasoning, evidence, and strong rebuttals
  - Do not use emotional manipulation or fallacies
  - Keep your response focused and under 300 words
  - Address the opponent's points directly when applicable
  
  `;
  
    if (previousTurns.length > 0) {
      prompt += `\nPREVIOUS DEBATE TURNS:\n\n`;
      previousTurns.forEach((turn, idx) => {
        const speaker = turn.role === role ? 'YOU' : 'OPPONENT';
        prompt += `[Turn ${idx + 1} - ${speaker}]\n${turn.content}\n\n`;
      });
      prompt += `\nNow provide your Turn ${turnNumber} response arguing ${stance} the motion:\n`;
    } else {
      prompt += `\nThis is Turn ${turnNumber}. Provide your opening argument ${stance} the motion:\n`;
    }
  
    return prompt;
}

function buildJudgePrompt(
    motion: string,
    allTurns: Array<{ role: string; content: string }>
  ): string {
    let transcript = '';
    allTurns.forEach((turn, idx) => {
      const label = turn.role === 'for' ? 'FOR' : 'AGAINST';
      transcript += `\n[Turn ${idx + 1} - ${label}]\n${turn.content}\n`;
    });
  
    return `You are a neutral debate judge evaluating the following debate.
  
  MOTION: "${motion}"
  
  FULL DEBATE TRANSCRIPT:
  ${transcript}
  
  YOUR TASK:
  Evaluate both sides objectively and provide a structured analysis in the following JSON format:
  
  {
    "verdict": "Brief statement of who argued more effectively and why",
    "forScore": {
      "logicalConsistency": <0-10>,
      "evidenceUsage": <0-10>,
      "clarity": <0-10>,
      "rebuttalStrength": <0-10>
    },
    "againstScore": {
      "logicalConsistency": <0-10>,
      "evidenceUsage": <0-10>,
      "clarity": <0-10>,
      "rebuttalStrength": <0-10>
    },
    "summary": "2-3 sentence summary of the debate",
    "insights": [
      "Meta-insight 1 (e.g., unstated assumptions, reasoning patterns)",
      "Meta-insight 2",
      "Meta-insight 3"
    ],
    "fallacies": [
      "Any logical fallacies detected with examples"
    ],
    "keyQuotes": [
      "Notable quote 1 with context",
      "Notable quote 2 with context"
    ]
  }
  
  CRITICAL CONSTRAINTS:
  - You are NEUTRAL - do not favor either side
  - Base your analysis ONLY on the debate transcript provided
  - Do NOT invent facts or external evidence
  - Identify logical fallacies, weak reasoning, and strong arguments
  - Focus on argumentation quality, not personal beliefs about the motion
  - Return ONLY valid JSON with no additional commentary
  
  Provide your evaluation now:`;
  }