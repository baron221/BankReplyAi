import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const inquiries = await prisma.inquiry.findMany({
    include: { assignedTo: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const headers = ["ID", "Mavzu", "Tashkilot turi", "Tashkilot nomi", "Holat", "Risk", "Muddat", "Qabul qilingan", "Mas'ul", "Versiya"];
  const rows = inquiries.map(i => [
    i.displayId,
    `"${i.title.replace(/"/g, '""')}"`,
    i.orgType,
    `"${i.orgName.replace(/"/g, '""')}"`,
    i.status,
    i.riskLevel,
    i.deadline,
    i.receivedDate,
    i.assignedTo?.name || "Tayinlanmagan",
    i.version,
  ]);

  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const bom = "\uFEFF"; // UTF-8 BOM for Excel

  return new NextResponse(bom + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="murojaatlar-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
