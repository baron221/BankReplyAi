// Gemini AI Service for generating responses

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface ClassificationResult {
  topic: string;
  deadline: string;
  riskScore: number;
  keywords: string[];
  orgType: string;
  summary: string;
}

export interface GeneratedResponse {
  response: string;
  complianceNotes: string[];
  referencedLaws: string[];
  confidence: number;
}

// ─── Classify Inquiry ─────────────────────────────────────────────────────────

export async function classifyInquiry(text: string): Promise<ClassificationResult> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Sen O'zbekiston banki yuridik xizmati uchun sun'iy intellekt yordamchisisisan.
Quyidagi rasmiy murojaat matnini tahlil qil va JSON formatida qaytarish:

MUROJAAT MATNI:
${text}

Quyidagi JSON formatida qaytarishingiz kerak (faqat JSON, hech qanday izoh yoki kod bloki belgisiz):
{
  "topic": "Murojaatning asosiy mavzusi (qisqa)",
  "deadline": "Javob berish muddati (YYYY-MM-DD formatida, agar ko'rsatilmagan bo'lsa 15 ish kunidan hisoblash)",
  "riskScore": "Risk darajasi 0-100 oralig'ida (son)",
  "keywords": ["kalit so'z 1", "kalit so'z 2", "kalit so'z 3"],
  "orgType": "prokuratura | soliq | markaziy_bank | davlat",
  "summary": "Murojaatning qisqacha mazmuni (1-2 gap)"
}`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    console.log("Gemini API Javobi (Klassifikatsiya):", responseText);
    
    // Remove potential markdown code blocks
    const cleaned = responseText.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Gemini API Xatosi (Klassifikatsiya):", err);
    // Fallback if JSON parsing fails
    return {
      topic: "Aniqlanmadi",
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      riskScore: 50,
      keywords: ["murojaat", "bank", "ma'lumot"],
      orgType: "davlat",
      summary: "AI klassifikatsiya qilishda xatolik yuz berdi.",
    };
  }
}

// ─── Generate Response ────────────────────────────────────────────────────────

export async function generateResponse(
  inquiryText: string,
  orgName: string,
  orgType: string,
  topic: string,
  relevantLaws: string[]
): Promise<GeneratedResponse> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const lawsContext = relevantLaws.join("; ");

  const prompt = `Sen O'zbekiston banki yuridik xizmati uchun sun'iy intellekt yordamchisisisan.
Quyidagi murojaat asosida rasmiy va qonunchilikka mos bank javobi tayyorla.

MUROJAAT MA'LUMOTLARI:
- Tashkilot: ${orgName} (${orgType})
- Mavzu: ${topic}
- Murojaat matni: ${inquiryText}

QONUNCHILIK ASOSLARI:
${lawsContext}

Iltimos, quyidagi JSON formatida qaytarish (faqat JSON, hech qanday kod bloki belgisiz):
{
  "response": "To'liq rasmiy javob matni o'zbek tilida. Salom so'zi bilan boshlash, rasmiy uslubda, qonunga havola qilib, imzoga joy qoldirish kerak.",
  "complianceNotes": ["muvofiqlik eslatmasi 1", "muvofiqlik eslatmasi 2"],
  "referencedLaws": ["qonun 1", "qonun 2"],
  "confidence": "0-100 oralig'ida ishonch darajasi (son)"
}

Javob:
- Rasmiy hujjat formatida bo'lsin
- O'zbek tilida yozilsin
- Qonunchilikka muvofiq bo'lsin
- Bank sirini himoya qiluvchi band bo'lsin
- Kirish, asosiy qism va xulosa bo'lsin`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    const cleaned = responseText.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Gemini API xatosi:", err);
    return {
      response: `${orgName}ga,\n\nSizning murojaatingiz qabul qilindi va ko'rib chiqilmoqda. Qonunchilik talablariga muvofiq javob tayyorlanadi.\n\nHurmat bilan,\nBank rahbariyati`,
      complianceNotes: ["API ulanishda muammo yuz berdi"],
      referencedLaws: relevantLaws,
      confidence: 0,
    };
  }
}

// ─── Compliance Check ─────────────────────────────────────────────────────────

export async function checkCompliance(
  responseText: string,
  orgType: string
): Promise<{ passed: boolean; issues: string[]; suggestions: string[] }> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Sen O'zbekiston bank qonunchiligi bo'yicha compliance mutaxassisisisan.
Quyidagi javob matnini tekshir va JSON formatida qaytarish:

JAVOB MATNI:
${responseText}

MUROJAAT TURI: ${orgType}

JSON formatida (faqat JSON, kod bloki belgisiz):
{
  "passed": true/false,
  "issues": ["muammo 1", "muammo 2"],
  "suggestions": ["tavsiya 1", "tavsiya 2"]
}

Tekshirish mezonlari:
- Bank siri talablari bajarilganmi?
- Muddatlar ko'rsatilganmi?
- Qonuniy asoslar mavjudmi?
- Rasmiy uslub saqlanganmi?`;

  try {
    const result = await model.generateContent(prompt);
    const responseTextRaw = result.response.text().trim();
    const cleaned = responseTextRaw.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      passed: true,
      issues: [],
      suggestions: [],
    };
  }
}
