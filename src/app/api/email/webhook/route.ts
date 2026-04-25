import { NextRequest, NextResponse } from "next/server";
import { parseInboundEmailPayload, detectOrgType } from "@/lib/email-service";
import { classifyInquiry } from "@/lib/ai-service";

/**
 * POST /api/email/webhook
 *
 * Inbound email webhook receiver.
 * Supports: SendGrid Inbound Parse, Mailgun Inbound, Postmark Inbound
 *
 * Setup:
 * - SendGrid: Dashboard → Mail Settings → Inbound Parse → add URL: https://yourdomain.com/api/email/webhook
 * - Mailgun:  Receiving → Routes → action: forward("https://yourdomain.com/api/email/webhook")
 */
export async function POST(req: NextRequest) {
  try {
    // Verify webhook secret if set
    const secret = process.env.EMAIL_WEBHOOK_SECRET;
    if (secret) {
      const authHeader = req.headers.get("x-webhook-secret") || req.headers.get("authorization");
      if (authHeader !== secret && authHeader !== `Bearer ${secret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    let payload: Record<string, string> = {};

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      payload = await req.json();
    } else if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        if (typeof value === "string") payload[key] = value;
      });
    } else {
      const text = await req.text();
      try { payload = JSON.parse(text); } catch { payload = { body: text }; }
    }

    // Parse email
    const email = parseInboundEmailPayload(payload);
    const orgType = detectOrgType(email.from);

    // AI Classify
    let classification = null;
    try {
      classification = await classifyInquiry(
        `Subject: ${email.subject}\n\nFrom: ${email.fromName} (${email.from})\n\n${email.body}`
      );
    } catch {
      classification = null;
    }

    // Here you would save to DB. For now return processed result.
    const result = {
      success: true,
      emailId: `email-${Date.now()}`,
      from: email.from,
      fromName: email.fromName,
      subject: email.subject,
      orgType,
      receivedAt: email.receivedAt,
      aiClassification: classification,
      message: "Email qabul qilindi va AI tahlil qilindi",
    };

    console.log("[Email Webhook] Received:", result);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[Email Webhook] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET — webhook verification (some providers send GET to verify endpoint)
export async function GET(req: NextRequest) {
  const challenge = req.nextUrl.searchParams.get("challenge");
  if (challenge) return new NextResponse(challenge, { status: 200 });
  return NextResponse.json({ status: "Email webhook endpoint active", timestamp: new Date().toISOString() });
}
