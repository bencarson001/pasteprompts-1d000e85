import { GoogleGenAI } from "@google/genai";

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  model?: "gemini-3.8-flash" | "gemini-3.1-flash-lite" | "gemini-4-argon";
}

export interface ChatResponse {
  reply: string;
  model: string;
}

const SYSTEM_INSTRUCTION = `You are the friendly, expert AI Assistant for Paste Prompts (pasteprompts.co.uk) — the premier marketplace for tested, high-performing AI prompts for ChatGPT, Claude, Gemini, Midjourney, Flux, Sora, and more.

Your goals:
1. Help buyers discover the best prompts for marketing, coding, content creation, business strategy, creative writing, and image generation.
2. Provide actionable prompt engineering advice, including variable placeholders (e.g. [INPUT], [TOPIC]), clear role framing, negative constraints, and few-shot examples.
3. Guide creators on how to sell their tested prompts, set fair pricing (in GBP £), write descriptive listings, and build their reputation.
4. Explain platform features clearly: free prompts, paid prompts, early bird rewards, and Pro subscriptions (£9.99/mo or £79/yr for unlimited access).
5. Always be warm, concise, and structured. Use markdown formatting with bullet points and short code blocks when providing prompt examples.`;

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured on the server.");
    }
    client = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return client;
}

export async function handleGeminiChat(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: ChatRequest;
  try {
    body = (await request.json()) as ChatRequest;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages, model: requestedModel = "gemini-3.8-flash" } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(
      JSON.stringify({ error: "Messages array is required and cannot be empty" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  // Sanitize and format messages for the Gemini SDK
  const contents = messages
    .filter((m) => typeof m?.text === "string" && m.text.trim().length > 0)
    .map((m) => ({
      role: m.role === "model" ? "model" : "user",
      parts: [{ text: m.text.trim() }],
    }));

  if (contents.length === 0) {
    return new Response(
      JSON.stringify({ error: "At least one non-empty message is required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const ai = getClient();
  const modelsToTry = [requestedModel];
  if (requestedModel !== "gemini-3.1-flash-lite") {
    // Fallback to flash-lite if requested model is busy or hits capacity limits
    modelsToTry.push("gemini-3.1-flash-lite");
  }

  let lastError: unknown = null;

  for (const modelToUse of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelToUse,
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });

      const reply = response.text || "I'm sorry, I couldn't generate a response. Please try again.";
      return new Response(
        JSON.stringify({
          reply,
          model: modelToUse,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (err: unknown) {
      lastError = err;
      console.warn(`[Gemini API] Call to ${modelToUse} failed:`, err);
      // If there's another model in modelsToTry, loop will continue
    }
  }

  const errorMessage =
    lastError instanceof Error
      ? lastError.message
      : "Gemini assistant is temporarily unavailable. Please try again in a moment.";

  return new Response(
    JSON.stringify({
      error: errorMessage,
    }),
    {
      status: 503,
      headers: { "Content-Type": "application/json" },
    },
  );
}
