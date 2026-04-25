import { NextRequest, NextResponse } from "next/server";
import { checkCompliance } from "@/lib/ai-service";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { responseText, orgType, inquiryId } = await req.json();
  const result = await checkCompliance(responseText, orgType);

  if (inquiryId) {
    const inquiry = await prisma.inquiry.findFirst({ where: { OR: [{ id: inquiryId }, { displayId: inquiryId }] } });
    if (inquiry) {
      await prisma.inquiry.update({
        where: { id: inquiry.id },
        data: {
          compliancePassed: result.passed,
          complianceIssues: JSON.stringify(result.issues),
          status: result.passed ? "tasdiqlangan" : inquiry.status,
          version: { increment: 1 },
          auditEntries: {
            create: {
              action: `Compliance tekshiruvi: ${result.passed ? "O'tdi ✓" : "Xatolik ✗"}`,
              userName: "Sistema",
              userRole: "menejer",
              details: result.issues.length > 0 ? result.issues.join("; ") : "Barcha talablar bajarildi",
            },
          },
        },
      });
    }
  }

  return NextResponse.json(result);
}
