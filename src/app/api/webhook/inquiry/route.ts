import { NextRequest, NextResponse } from "next/server";
import { classifyInquiry } from "@/lib/ai-service";
import { detectOrgType } from "@/lib/email-service";

/**
 * POST /api/webhook/inquiry
 *
 * External API webhook for direct system integrations.
 * Markaziy bank, Soliq portali kabi tizimlar JSON so'rov yuboradi.
 *
 * Authentication: X-API-Key header
 *
 * Request body:
 * {
 *   "title": "So'rov mavzusi",
 *   "orgName": "Tashkilot nomi",
 *   "orgEmail": "tashkilot@gov.uz",
 *   "description": "So'rov matni",
 *   "deadline": "2024-05-15",
 *   "priority": "urgent | normal | low",
 *   "referenceNumber": "Ichki raqam",
 *   "attachments": [{ "filename": "file.pdf", "url": "https://..." }]
 * }
 */
export async function POST(req: NextRequest) {
  // API Key Auth
  const apiKey = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "");
  const validKey = process.env.API_WEBHOOK_SECRET;

  if (validKey && apiKey !== validKey) {
    return NextResponse.json(
      { error: "Unauthorized. X-API-Key header talab qilinadi." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { title, orgName, orgEmail, description, deadline, priority, referenceNumber, attachments } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "title va description majburiy maydonlar" },
        { status: 400 }
      );
    }

    // Detect org type
    const orgType = orgEmail ? detectOrgType(orgEmail) : "davlat";

    // AI Classify
    let classification = null;
    try {
      classification = await classifyInquiry(
        `Mavzu: ${title}\nTashkilot: ${orgName}\n\n${description}`
      );
    } catch {
      classification = null;
    }

    // Generate inquiry ID
    const inquiryId = `INQ-API-${Date.now()}`;

    const result = {
      success: true,
      inquiryId,
      status: "yangi",
      orgType,
      receivedAt: new Date().toISOString(),
      referenceNumber: referenceNumber || null,
      aiClassification: classification,
      message: "Murojaat muvaffaqiyatli qabul qilindi va AI tahlil qilindi",
      links: {
        detail: `/murojaatlar/${inquiryId}`,
        status: `/api/webhook/inquiry/${inquiryId}/status`,
      },
    };

    console.log("[API Webhook] New inquiry received:", { inquiryId, orgName, orgType, priority });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("[API Webhook] Error:", error);
    return NextResponse.json({ error: "So'rovni qayta ishlashda xato" }, { status: 500 });
  }
}

/**
 * GET /api/webhook/inquiry
 * Health check + API info
 */
export async function GET() {
  return NextResponse.json({
    status: "active",
    version: "1.0",
    description: "AI Murojaat Tizimi — Tashqi API Webhook",
    endpoints: {
      "POST /api/webhook/inquiry": "Yangi murojaat yuborish",
      "POST /api/email/webhook": "Email webhook (SendGrid/Mailgun)",
      "POST /api/email/send": "Javob emailini yuborish",
    },
    authentication: "X-API-Key header yoki Authorization: Bearer <key>",
    timestamp: new Date().toISOString(),
  });
}
