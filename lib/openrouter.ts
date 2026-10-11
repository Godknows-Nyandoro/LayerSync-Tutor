// Talks to OpenRouter, which gives one API for many AI models.
// We use plain fetch (no SDK), so every step is visible.

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type Usage = { inputTokens: number; outputTokens: number };

const API_URL = "https://openrouter.ai/api/v1/chat/completions";

function requestBody(messages: ChatMessage[], maxTokens: number, stream: boolean, json = false) {
  return JSON.stringify({
    model: process.env.OPENROUTER_MODEL,
    messages,
    max_tokens: maxTokens, // hard cap on reply length = cap on cost
    temperature: json ? 0 : 0.4, // marking should be consistent, so no randomness
    stream,
    usage: { include: true }, // ask OpenRouter to report token counts
    ...(json && { response_format: { type: "json_object" } }), // force a JSON reply
  });
}

function headers() {
  return {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
  };
}

// Waits for the whole reply and returns it parsed as JSON (used by the marker).
export async function chatJson(messages: ChatMessage[], maxTokens: number) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: headers(),
    body: requestBody(messages, maxTokens, false, true),
  });
  if (!response.ok) {
    throw new Error(`OpenRouter error ${response.status}: ${await response.text()}`);
  }
  const json = await response.json();
  return JSON.parse(json.choices[0].message.content);
}

// Streams the reply. Calls onText(piece) for each piece of text as it arrives,
// and returns the full reply and token usage at the end.
export async function streamChat(
  messages: ChatMessage[],
  maxTokens: number,
  onText: (text: string) => void,
) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: headers(),
    body: requestBody(messages, maxTokens, true),
  });
  if (!response.ok || !response.body) {
    throw new Error(`OpenRouter error ${response.status}: ${await response.text()}`);
  }

  // The reply arrives as Server-Sent Events: lines that look like `data: {...json...}`.
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";
  const usage: Usage = { inputTokens: 0, outputTokens: 0 };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop()!; // the last line may be incomplete: keep it for the next chunk

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue; // skip blank lines and comments
      const data = line.slice("data: ".length);
      if (data === "[DONE]") continue;

      const json = JSON.parse(data);
      const text = json.choices?.[0]?.delta?.content;
      if (text) {
        fullText += text;
        onText(text);
      }
      if (json.usage) {
        usage.inputTokens = json.usage.prompt_tokens;
        usage.outputTokens = json.usage.completion_tokens;
      }
    }
  }

  return { text: fullText, usage };
}
