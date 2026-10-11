const GROQ_API_KEY = process.env.GROQ_API_KEY ?? '';
const MODEL = process.env.GROQ_MODEL ?? 'qwen/qwen3.8-27b';
const GROQ_BASE = 'https://api.groq.com/openai/v1';

type ChatMessage = { role: string; content: string };

async function groqChat(messages: ChatMessage[]): Promise<string> {
  const res = await fetch(`${GROQ_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({ model: MODEL, messages }),
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.choices[0].message.content as string;
}

export async function ollamaChat(messages: ChatMessage[], systemPrompt = ''): Promise<string> {
  try {
    const allMessages = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;
    return await groqChat(allMessages);
  } catch (e) {
    return `AI service temporarily unavailable: ${(e as Error).message}`;
  }
}

export async function ollamaGenerate(prompt: string): Promise<string> {
  try {
    return await groqChat([{ role: 'user', content: prompt }]);
  } catch (e) {
    return `AI service temporarily unavailable: ${(e as Error).message}`;
  }
}

export async function ollamaHealthy(): Promise<boolean> {
  if (!GROQ_API_KEY) return false;
  try {
    const res = await fetch(`${GROQ_BASE}/models`, {
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` },
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
