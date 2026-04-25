import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { sendResponseEmail } from "@/lib/email-service";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const inquiry = await prisma.inquiry.findFirst({
    where: { OR: [{ id }, { displayId: id }] },
  });

  if (!inquiry) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  if (!inquiry.aiResponse) return NextResponse.json({ error: "AI javob yo'q" }, { status: 400 });

  // Send email
  const recipientEmail = inquiry.orgEmail || process.env.BANK_EMAIL || "info@bank.uz";
  const emailResult = await sendResponseEmail({
    to: recipientEmail,
    toName: inquiry.orgName,
    subject: `Javob: ${inquiry.title} (${inquiry.displayId})`,
    body: inquiry.aiResponse,
    inquiryId: inquiry.displayId,
  });

  // Update status + audit
  const updated = await prisma.inquiry.update({
    where: { id: inquiry.id },
    data: {
      status: "yuborilgan",
      version: { increment: 1 },
      auditEntries: {
        create: {
          action: "Javob yuborildi",
          userName: session.user?.name || "Sistema",
          userRole: (session.user as { role?: string })?.role || "operator",
          details: emailResult.success
            ? `Email yuborildi: ${recipientEmail} (ID: ${emailResult.messageId})`
            : `Email yuborishda xato: ${emailResult.error} — Status "Yuborilgan"ga o'zgartirildi`,
        },
      },
    },
    include: { auditEntries: { orderBy: { timestamp: "asc" } } },
  });

  return NextResponse.json({ success: true, inquiry: updated, emailResult });
}
