import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// ─── GET: Barcha murojaatlarni olish ─────────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const orgType = searchParams.get("orgType") || "";
  const status = searchParams.get("status") || "";
  const riskLevel = searchParams.get("riskLevel") || "";
  const statsOnly = searchParams.get("stats") === "true";

  const where = {
    AND: [
      search ? {
        OR: [
          { title: { contains: search } },
          { displayId: { contains: search } },
          { orgName: { contains: search } },
        ],
      } : {},
      orgType ? { orgType } : {},
      status ? { status } : {},
      riskLevel ? { riskLevel } : {},
    ],
  };

  if (statsOnly) {
    const [total, yangi, yuborilgan, muddatOtgan] = await Promise.all([
      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { status: "yangi" } }),
      prisma.inquiry.count({ where: { status: "yuborilgan" } }),
      prisma.inquiry.count({
        where: {
          deadline: { lt: new Date().toISOString().split("T")[0] },
          status: { notIn: ["yuborilgan", "rad_etilgan"] },
        },
      }),
    ]);
    const jarayonda = await prisma.inquiry.count({
      where: { status: { in: ["jarayonda", "tekshiruv"] } },
    });
    const orgStats = await prisma.inquiry.groupBy({
      by: ["orgType"],
      _count: true,
    });
    return NextResponse.json({ total, yangi, yuborilgan, muddatOtgan, jarayonda, orgStats });
  }

  const inquiries = await prisma.inquiry.findMany({
    where,
    include: { assignedTo: { select: { name: true, id: true } }, auditEntries: { orderBy: { timestamp: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(inquiries);
}

// ─── POST: Yangi murojaat qo'shish ────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, orgType, orgName, orgEmail, description, deadline, fileName, riskLevel } = body;

  // Generate display ID
  const count = await prisma.inquiry.count();
  const year = new Date().getFullYear();
  const displayId = `INQ-${year}-${String(count + 1).padStart(3, "0")}`;

  const inquiry = await prisma.inquiry.create({
    data: {
      displayId,
      title,
      orgType,
      orgName,
      orgEmail: orgEmail || "",
      receivedDate: new Date().toISOString().split("T")[0],
      deadline: deadline || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "yangi",
      riskLevel: riskLevel || "o'rta",
      description,
      fileName: fileName || "",
      auditEntries: {
        create: {
          action: "Murojaat qabul qilindi",
          userName: session.user?.name || "Sistema",
          userRole: (session.user as { role?: string })?.role || "operator",
          details: "Yangi murojaat kiritildi",
        },
      },
    },
  });

  return NextResponse.json(inquiry, { status: 201 });
}
