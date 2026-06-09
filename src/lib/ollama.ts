const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434';
const MODEL = process.env.OLLAMA_MODEL ?? 'gemma3:1b';

type ChatMessage = { role: string; content: string };

export async function ollamaChat(messages: ChatMessage[], systemPrompt = ''): Promise<string> {
  try {
    const allMessages = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;
    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: MODEL, messages: allMessages, stream: false }),
      signal: AbortSignal.timeout(120000),
    });
    if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
    const data = await res.json();
    return data.message.content as string;
  } catch (e) {
    return `AI service temporarily unavailable: ${(e as Error).message}`;
  }
}

export async function ollamaGenerate(prompt: string): Promise<string> {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: MODEL, prompt, stream: false }),
      signal: AbortSignal.timeout(120000),
    });
    if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
    const data = await res.json();
    return data.response as string;
  } catch (e) {
    return `AI service temporarily unavailable: ${(e as Error).message}`;
  }
}

export async function ollamaHealthy(): Promise<boolean> {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, {
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
