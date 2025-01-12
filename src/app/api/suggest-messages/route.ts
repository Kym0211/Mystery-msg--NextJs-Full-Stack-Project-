import { NextResponse } from "next/server";

export const runtime = "edge"; // Ensure compatibility with edge functions

// Hugging Face API endpoint and key
const HF_API_URL = "https://api-inference.huggingface.co/models/google/gemma-2-2b-it";
const HF_API_KEY = "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";

// Hardcoded prompt
const HARDCODED_PROMPT = "ask 3 different random questions";

export async function POST() {
  try {
    // Send the request to Hugging Face with the hardcoded prompt
    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: HARDCODED_PROMPT }),
    });

    // Handle the response
    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.statusText}`);
    }

    const result = await response.json();

    // Extract generated text
    const generatedText = result[0]?.generated_text || "No response generated";

    // Stream the response back
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(generatedText));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });

  } catch (error) {
    console.error("Error querying Hugging Face API:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: "Unknown error" }, { status: 500 });
    }
  }
}