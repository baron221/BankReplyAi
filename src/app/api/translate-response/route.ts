import { NextRequest, NextResponse } from "next/server";
import { translateResponse } from "@/lib/ai-service";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { text, targetLang } = await req.json();

    if (!text || !targetLang) {
      return NextResponse.json({ error: "Missing text or targetLang" }, { status: 400 });
    }

    const translated = await translateResponse(text, targetLang);

    return NextResponse.json({ translated });
  } catch (error: any) {
    console.error("Translation API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
