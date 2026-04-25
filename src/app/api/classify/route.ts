import { NextRequest, NextResponse } from "next/server";
import { classifyInquiry } from "@/lib/ai-service";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text, orgType, inquiryId } = await req.json();
  const result = await classifyInquiry(text);

  // If inquiryId provided, save classification to DB
  if (inquiryId) {
    const inquiry = await prisma.inquiry.findFirst({ where: { OR: [{ id: inquiryId }, { displayId: inquiryId }] } });
    if (inquiry) {
      await prisma.inquiry.update({
        where: { id: inquiry.id },
        data: {
          topic: result.topic,
          aiKeywords: JSON.stringify(result.keywords),
          aiSummary: result.summary,
          aiRiskScore: result.riskScore,
          riskLevel: result.riskScore >= 70 ? "yuqori" : result.riskScore >= 40 ? "o'rta" : "past",
          version: { increment: 1 },
          auditEntries: {
            create: {
              action: "AI klassifikatsiya bajarildi",
              userName: "Sistema",
              userRole: "operator",
              details: `Risk: ${result.riskScore}%, Mavzu: ${result.topic}`,
            },
          },
        },
      });
    }
  }

  return NextResponse.json({ ...result, orgType });
}
