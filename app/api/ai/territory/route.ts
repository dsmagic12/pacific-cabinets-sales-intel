import { getAnthropicClient } from "@/lib/ai/client";
import { TERRITORY_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { buildTerritoryContext } from "@/lib/ai/context-builders";

export async function POST() {
  try {
    const context = buildTerritoryContext();
    const anthropic = getAnthropicClient();

    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 1200,
      system: TERRITORY_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Generate a territory intelligence digest for the Pacific Northwest territory based on the following data.\n\n${context}`,
        },
      ],
    });

    return new Response(
      new ReadableStream({
        async start(controller) {
          stream.on("text", (text) => {
            controller.enqueue(new TextEncoder().encode(text));
          });
          stream.on("finalMessage", () => {
            controller.close();
          });
          stream.on("error", (err) => {
            controller.error(err);
          });
        },
      }),
      {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Transfer-Encoding": "chunked",
          "Cache-Control": "no-cache",
        },
      }
    );
  } catch (error) {
    console.error("Territory digest error:", error);
    if (error instanceof Error && error.message.includes("ANTHROPIC_API_KEY")) {
      return Response.json(
        { error: "API key not configured. Please add ANTHROPIC_API_KEY to .env.local" },
        { status: 500 }
      );
    }
    return Response.json({ error: "Failed to generate territory digest" }, { status: 500 });
  }
}
