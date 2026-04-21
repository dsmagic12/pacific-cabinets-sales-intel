import { getAnthropicClient } from "@/lib/ai/client";
import { BRIEF_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { buildBriefContext } from "@/lib/ai/context-builders";
import { getCustomer, getProjects, getRecentOrders, getRep } from "@/lib/data/mock";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { customerId } = await request.json();

    if (!customerId) {
      return Response.json({ error: "customerId is required" }, { status: 400 });
    }

    const customer = getCustomer(customerId);
    if (!customer) {
      return Response.json({ error: "Customer not found" }, { status: 404 });
    }

    const projects = getProjects(customerId);
    const recentOrders = getRecentOrders(customerId, 10);
    const rep = getRep(customer.assignedRepId);

    const context = buildBriefContext(customer, projects, recentOrders, rep);

    const anthropic = getAnthropicClient();

    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system: BRIEF_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Generate a pre-call brief for the upcoming interaction with this customer.\n\n${context}`,
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
    console.error("Brief generation error:", error);
    if (error instanceof Error && error.message.includes("ANTHROPIC_API_KEY")) {
      return Response.json(
        { error: "API key not configured. Please add ANTHROPIC_API_KEY to .env.local" },
        { status: 500 }
      );
    }
    return Response.json({ error: "Failed to generate brief" }, { status: 500 });
  }
}
