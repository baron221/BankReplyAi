// Inquiry Registration Service (Updated with department routing)
import { prisma } from "./db";
import { classifyInquiry } from "./ai-service";

export interface InboundInquiry {
  title: string;
  orgType: string;
  orgName: string;
  orgEmail?: string;
  description: string;
  deadline?: string;
  fileName?: string;
  fileBase64?: string; // Yangi maydon
  source?: "manual" | "email" | "api";
  language?: "uz" | "ru";
}

/**
 * Har bir kiruvchi murojaatni registratsiya qilish va AI orqali klassifikatsiya qilish
 */
export async function registerInquiry(data: InboundInquiry, userName: string = "Sistema", userRole: string = "operator") {
  console.log(`[Registration] Yangi murojaat registratsiya qilinmoqda: ${data.title}`);

  // 1. Unikal Display ID generatsiya qilish (INQ-2024-001)
  const year = new Date().getFullYear();
  const lastInquiry = await prisma.inquiry.findFirst({
    where: { displayId: { startsWith: `INQ-${year}-` } },
    orderBy: { displayId: "desc" },
  });

  let nextNumber = 1;
  if (lastInquiry) {
    const lastNum = parseInt(lastInquiry.displayId.split("-")[2]);
    nextNumber = lastNum + 1;
  }
  
  const displayId = `INQ-${year}-${String(nextNumber).padStart(3, "0")}`;

  // 2. AI orqali klassifikatsiya (Mavzu, Risk, Bo'lim aniqlash)
  let aiResult;
  try {
    aiResult = await classifyInquiry(data.description, data.fileBase64, data.language || "uz");
  } catch (err) {
    console.error("[Registration] AI klassifikatsiyada xatolik:", err);
    aiResult = {
      topic: data.title,
      riskScore: 50,
      department: "Yuridik", // Fallback
      keywords: [],
      summary: "Tahlil jarayonida xatolik yuz berdi.",
      deadline: data.deadline || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    };
  }

  try {
    const inquiry = await prisma.inquiry.create({
      data: {
        displayId,
        title: data.title,
        orgType: data.orgType,
        orgName: data.orgName,
        orgEmail: data.orgEmail || "",
        receivedDate: new Date().toISOString().split("T")[0],
        deadline: aiResult.deadline || data.deadline || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "yangi",
        riskLevel: aiResult.riskScore >= 70 ? "yuqori" : aiResult.riskScore >= 40 ? "o'rta" : "past",
        topic: aiResult.topic || data.title,
        description: data.description,
        department: aiResult.department || "Yuridik", // AI aniqlagan bo'lim
        fileName: data.fileName || "",
        aiKeywords: JSON.stringify(aiResult.keywords || []),
        aiSummary: aiResult.summary || "",
        aiMissingDocs: JSON.stringify(aiResult.missingDocs || []),
        aiRiskScore: aiResult.riskScore || 0,
        detectedLang: aiResult.detectedLang || "uz",
        translatedText: aiResult.translatedText || "",
        auditEntries: {
          create: {
            action: "Murojaat registratsiya qilindi",
            userName,
            userRole,
            details: `Registratsiya raqami: ${displayId}, Yo'naltirildi: ${aiResult.department}`,
          },
        },
      },
    });
    return inquiry;
  } catch (dbErr: any) {
    console.error("[Registration] Database Error:", dbErr);
    throw dbErr;
  }
}
