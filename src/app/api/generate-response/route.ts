import { NextRequest, NextResponse } from "next/server";
import { generateResponse } from "@/lib/ai-service";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { inquiryText, orgName, orgType, topic, laws, inquiryId } = await req.json();

  // Bilimlar bazasidan aynan shu tashkilot turiga mos hujjatlarni qidirish
  const dbDocs = await prisma.legalDoc.findMany();
  const relevantDocs = dbDocs.filter(doc => {
    try {
      const orgs = JSON.parse(doc.relevantOrgs);
      return Array.isArray(orgs) && orgs.includes(orgType);
    } catch {
      return false;
    }
  });

  // Hujjatlar matnini birlashtirish
  const contextLaws = relevantDocs.map(d => `${d.title} (${d.number}): ${d.fullText || d.summary}`);
  
  // Frontend'dan kelgan qonunlar bilan birlashtirish
  const finalLaws = [...contextLaws, ...(laws || [])];

  const result = await generateResponse(inquiryText, orgName, orgType, topic, finalLaws, {
    inquiryId: inquiryId || "",
    currentDate: new Date().toLocaleDateString("uz-UZ", { year: 'numeric', month: 'long', day: 'numeric' }),
    bankName: "O'zbekiston banki",
    operatorName: session.user?.name || "Noma'lum xodim"
  });

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
              action: "AI javob generatsiya qilindi (Bilimlar bazasi asosida)",
              userName: "Sistema",
              userRole: "menejer",
              details: `Ishonch darajasi: ${result.confidence}% | Bilimlar bazasidan ${relevantDocs.length} ta hujjat ishlatildi`,
            },
          },
        },
      });
    }
  }

  return NextResponse.json(result);
}
