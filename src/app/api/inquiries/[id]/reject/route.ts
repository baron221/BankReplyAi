import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const reason = body.reason || "Sabab ko'rsatilmagan";

  const inquiry = await prisma.inquiry.findFirst({
    where: { OR: [{ id }, { displayId: id }] },
  });
  if (!inquiry) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  const updated = await prisma.inquiry.update({
    where: { id: inquiry.id },
    data: {
      status: "rad_etilgan",
      version: { increment: 1 },
      auditEntries: {
        create: {
          action: "Murojaat rad etildi",
          userName: session.user?.name || "Sistema",
          userRole: (session.user as { role?: string })?.role || "menejer",
          details: reason,
        },
      },
    },
    include: { auditEntries: { orderBy: { timestamp: "asc" } } },
  });

  return NextResponse.json({ success: true, inquiry: updated });
}
