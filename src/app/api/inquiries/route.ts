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
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const skip = (page - 1) * limit;

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

  const [inquiries, totalCount] = await Promise.all([
    prisma.inquiry.findMany({
      where,
      include: { assignedTo: { select: { name: true, id: true } }, auditEntries: { orderBy: { timestamp: "asc" } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.inquiry.count({ where })
  ]);

  return NextResponse.json({
    data: inquiries,
    pagination: {
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    }
  });
}

// ─── POST: Yangi murojaat qo'shish ────────────────────────────────────────────
import { registerInquiry } from "@/lib/inquiry-service";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const inquiry = await registerInquiry(
      body,
      session.user?.name || "Sistema",
      (session.user as { role?: string })?.role || "operator"
    );
    return NextResponse.json(inquiry, { status: 201 });
  } catch (error: any) {
    console.error("[Inquiries API] Error:", error);
    return NextResponse.json({ 
      error: "Registratsiya qilishda xatolik", 
      details: error.message || String(error) 
    }, { status: 500 });
  }
}
