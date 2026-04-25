import { NextRequest, NextResponse } from "next/server";
import { generateResponse } from "@/lib/ai-service";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { inquiryText, orgName, orgType, topic, laws, inquiryId } = await req.json();
  const result = await generateResponse(inquiryText, orgName, orgType, topic, laws || []);

  // Save to DB if inquiryId provided
  if (inquiryId) {
    const inquiry = await prisma.inquiry.findFirst({ where: { OR: [{ id: inquiryId }, { displayId: inquiryId }] } });
    if (inquiry) {
      await prisma.inquiry.update({
        where: { id: inquiry.id },
        data: {
          aiResponse: result.response,
          complianceLaws: JSON.stringify(result.referencedLaws),
          version: { increment: 1 },
          auditEntries: {
            create: {
              action: "AI javob generatsiya qilindi",
              userName: "Sistema",
              userRole: "menejer",
              details: `Ishonch darajasi: ${result.confidence}%`,
            },
          },
        },
      });
    }
  }

  return NextResponse.json(result);
}
