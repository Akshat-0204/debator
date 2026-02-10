//ye extra stiff clean kar dega code me se
export function cleanInput(input: string): string {
    return input
      .replace(/\bsystem\b/gi, '')
      .replace(/\bignore previous instructions\b/gi, '')
      .replace(/\bjailbreak\b/gi, '')
      .trim()
      .slice(0, 5000); 
}