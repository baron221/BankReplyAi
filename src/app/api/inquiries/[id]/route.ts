import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// ─── GET: Bitta murojaat ──────────────────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const inquiry = await prisma.inquiry.findFirst({
    where: { OR: [{ id }, { displayId: id }] },
    include: { assignedTo: { select: { name: true, id: true } }, auditEntries: { orderBy: { timestamp: "asc" } } },
  });

  if (!inquiry) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  return NextResponse.json(inquiry);
}

// ─── PATCH: Murojaatni yangilash ──────────────────────────────────────────────
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.inquiry.findFirst({ where: { OR: [{ id }, { displayId: id }] } });
  if (!existing) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  const { aiResponse, aiKeywords, aiRiskScore, status, compliancePassed, complianceIssues, complianceLaws, riskLevel, auditAction, auditDetails } = body;

  const updated = await prisma.inquiry.update({
    where: { id: existing.id },
    data: {
      ...(aiResponse !== undefined && { aiResponse }),
      ...(aiKeywords !== undefined && { aiKeywords: JSON.stringify(aiKeywords) }),
      ...(aiRiskScore !== undefined && { aiRiskScore }),
      ...(status !== undefined && { status }),
      ...(riskLevel !== undefined && { riskLevel }),
      ...(compliancePassed !== undefined && { compliancePassed }),
      ...(complianceIssues !== undefined && { complianceIssues: JSON.stringify(complianceIssues) }),
      ...(complianceLaws !== undefined && { complianceLaws: JSON.stringify(complianceLaws) }),
      version: { increment: 1 },
      ...(auditAction && {
        auditEntries: {
          create: {
            action: auditAction,
            userName: session.user?.name || "Sistema",
            userRole: (session.user as { role?: string })?.role || "operator",
            details: auditDetails || "",
          },
        },
      }),
    },
    include: { auditEntries: { orderBy: { timestamp: "asc" } } },
  });

  return NextResponse.json(updated);
}
