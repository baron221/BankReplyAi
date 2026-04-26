import { NextRequest, NextResponse } from "next/server";
import { chatWithCopilot } from "@/lib/ai-service";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { messages, contextData } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    const responseText = await chatWithCopilot(messages, contextData || {});

    return NextResponse.json({ response: responseText });
  } catch (error: any) {
    console.error("Copilot API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
