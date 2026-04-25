import { NextRequest, NextResponse } from "next/server";
import { sendResponseEmail } from "@/lib/email-service";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    console.log("[Email Send] Request Body:", body);
    const { to, toName, subject, responseText, inquiryId } = body;

    if (!to || !responseText || !inquiryId) {
      console.warn("[Email Send] Missing required fields:", { to, responseText, inquiryId });
      return NextResponse.json({ error: "to, responseText, inquiryId majburiy" }, { status: 400 });
    }

    const result = await sendResponseEmail({
      to,
      toName: toName || to,
      subject: subject || `Re: Sizning so'rovingizga javob — ${inquiryId}`,
      body: responseText,
      inquiryId,
    });

    if (result.success) {
      console.log("[Email Send] Success:", result.messageId);
      return NextResponse.json({ success: true, messageId: result.messageId, message: "Email muvaffaqiyatli yuborildi" });
    } else {
      console.error("[Email Send] Service error:", result.error);
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error: any) {
    console.error("[Email Send] API Route Catch:", error.message || error);
    return NextResponse.json({ error: error.message || "Email yuborishda xato" }, { status: 500 });
  }
}
