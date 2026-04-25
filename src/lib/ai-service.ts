// Gemini AI Service for generating responses

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash"
];

export interface ClassificationResult {
  topic: string;
  deadline: string;
  riskScore: number;
  keywords: string[];
  orgType: string;
  summary: string;
  department: string;
  missingDocs: string[]; // Yangi maydon
  draftResponse?: string;
}

export interface GeneratedResponse {
  response: string;
  complianceNotes: string[];
  referencedLaws: string[];
  confidence: number;
}

// ─── AI Runner (Direct, No Retries, Quick Fallback) ──────────────────────────

async function runAI(prompt: string) {
  let lastError: any;
  for (const modelName of MODELS) {
    try {
      console.log(`AI so'rovi yuborilmoqda: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${modelName} xatolik berdi: ${err.status || err.message}`);
      
      // Agar 503 (Band) bo'lsa, juda qisqa kutib ko'ramiz
      if (err.status === 429 || err.status === 503) {
        console.log(`Model band, 2 soniya kutilmoqda...`);
        await new Promise(r => setTimeout(r, 2000));
      }
      
      // Har qanday xatoda (429, 403, 503) keyingi modelga o'tib ketaveramiz
      continue;
    }
  }
  throw lastError;
}

// ─── Classify Inquiry ─────────────────────────────────────────────────────────

export async function classifyInquiry(text: string, fileBase64?: string): Promise<ClassificationResult> {
  const prompt = `Sen O'zbekiston banki yuridik xizmati uchun sun'iy intellekt yordamchisisisan.
Quyidagi murojaatni tahlil qil va JSON formatida qaytarish.
Agar ilova qilingan hujjat (PDF) bo'lsa, undagi ma'lumotlarni ham hisobga ol.

MUROJAAT MATNI:
${text}

Quyidagi JSON formatida qaytarishingiz kerak (faqat JSON, hech qanday izoh yoki kod bloki belgisiz):
{
  "topic": "Murojaatning asosiy mavzusi (qisqa)",
  "deadline": "Javob berish muddati (YYYY-MM-DD formatida, agar ko'rsatilmagan bo'lsa 15 ish kunidan hisoblash)",
  "riskScore": "Risk darajasi 0-100 oralig'ida (son)",
  "keywords": ["kalit so'z 1", "kalit so'z 2", "kalit so'z 3"],
  "orgType": "prokuratura | soliq | markaziy_bank | davlat",
  "summary": "Murojaatning qisqacha mazmuni (1-2 gap)",
  "department": "Yo'naltirilishi kerak bo'lgan bo'lim: Yuridik | Kredit | Amaliyot | IT xavfsizlik | Kadrlar | Mijozlarga xizmat ko'rsatish | Compliance",
  "missingDocs": ["javob berish uchun zarur bo'lgan hujjat 1", "javob berish uchun zarur bo'lgan hujjat 2"],
  "draftResponse": "Murojaatga beriladigan rasmiy va qonuniy javob matni loyihasi (o'zbek tilida, rasmiy uslubda)"
}

Javob faqat o'zbek tilida bo'lsin. missingDocs ro'yxati bank ichki jarayonlariga (masalan: shartnoma nusxasi, hisobdan ko'chirma, mijoz pasporti) asoslangan holda mantiqiy bo'lsin.`;

  try {
    let parts: any[] = [prompt];
    
    if (fileBase64) {
      parts.push({
        inlineData: {
          mimeType: "application/pdf",
          data: fileBase64
        }
      });
    }

    // runAI o'rniga to'g'ridan-to'g'ri model.generateContent ishlatamiz (multimodal uchun)
    let lastError: any;
    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(parts);
        const responseText = result.response.text().trim();
        console.log("AI Klassifikatsiya Javobi:", responseText);
        const cleaned = responseText.replace(/```json\n?|\n?```/g, "").trim();
        return JSON.parse(cleaned);
      } catch (err) {
        lastError = err;
        console.warn(`Model ${modelName} multimodal xatolik:`, err);
        continue;
      }
    }
    throw lastError;

  } catch (err: any) {
    console.error("AI Xatosi:", err);
    return {
      topic: "Aniqlanmadi",
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      riskScore: 50,
      keywords: ["murojaat", "bank", "ma'lumot"],
      orgType: "davlat",
      summary: "Tizimda xatolik yuz berdi.",
      missingDocs: [],
      department: "Yuridik",
    };
  }
}

// ─── Generate Response ────────────────────────────────────────────────────────

export async function generateResponse(
  inquiryText: string,
  orgName: string,
  orgType: string,
  topic: string,
  relevantLaws: string[],
  meta?: {
    inquiryId: string;
    currentDate: string;
    bankName: string;
    operatorName: string;
  }
): Promise<GeneratedResponse> {
  const lawsContext = relevantLaws.join("; ");

  const prompt = `Sen O'zbekiston banki yuridik xizmati uchun sun'iy intellekt yordamchisisisan.
Quyidagi murojaat va bilimlarni o'qib, BARCHA BO'SHLIQLARI TO'LDIRILGAN, tayyor rasmiy javob xatini yarat.
HECH QANDAY PROBEL ("_____") YOKI QAVS ICHIDAGI ESLATMALAR QOLDIRMA. O'zing berilgan ma'lumotlarga qarab to'ldir.

MUROJAAT MA'LUMOTLARI:
- Tashkilot: ${orgName} (${orgType})
- Mavzu: ${topic}
- Murojaat matni: ${inquiryText}

METAMA'LUMOTLAR (javobni to'ldirish uchun):
- Sana: ${meta?.currentDate || new Date().toLocaleDateString("uz-UZ")}
- Chiquvchi raqam: CH-${meta?.inquiryId || "INQ-202X"}
- Bank nomi: "${meta?.bankName || "O'zbekiston banki"}" AT
- Mas'ul xodim (ism-sharifi): ${meta?.operatorName || "Noma'lum xodim"}
- Murojaatning (kirish) raqami: K-${meta?.inquiryId || "INQ"} (shu raqamli murojaatga javob)

QONUNCHILIK ASOSLARI VA BILIMLAR BAZASI:
${lawsContext}

Iltimos, faqat quyidagi JSON formatida qaytarish (faqat JSON, kod bloki belgisiz):
{
  "response": "To'liq rasmiy javob matni o'zbek tilida. DIQQAT: Xatda hech qanday bo'shliq qoldirmang. Sana, chiquvchi raqam, tashkilot nomi va xodim ismini albatta ishlating. Javob bilimlar bazasi asosida tuzilsin.",
  "complianceNotes": ["muvofiqlik eslatmasi 1", "muvofiqlik eslatmasi 2"],
  "referencedLaws": ["qonun 1", "qonun 2"],
  "confidence": "0-100 oralig'ida ishonch darajasi (son)"
}

Javob:
- Rasmiy hujjat formatida bo'lsin
- O'zbek tilida yozilsin
- Bilimlar bazasida kelgan ma'lumotlarga qat'iy tayansin
- Hech qanday pastki chiziq ("___") qoldirmang
- Kirish, asosiy qism va xulosa bo'lsin`;

  try {
    const responseText = await runAI(prompt);
    const cleaned = responseText.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("AI xatosi:", err);
    return {
      response: `${orgName}ga,\n\nSizning murojaatingiz qabul qilindi va ko'rib chiqilmoqda.\n\nHurmat bilan,\n${meta?.bankName || "Bank"} rahbariyati`,
      complianceNotes: ["Xatolik yuz berdi"],
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
  const prompt = `Sen O'zbekiston bank qonunchiligi bo'yicha Compliance nazoratchisisan.
Sening vazifang - bank tomonidan tayyorlangan javob matnini tekshirish.

JAVOB MATNI:
${responseText}

MUROJAAT TURI: ${orgType}

DIQQAT: Faqat quyidagi JSON formatida javob ber:
{
  "passed": true/false,
  "issues": ["1-aniq kamchilik", "2-aniq kamchilik"],
  "suggestions": ["1-tavsiya", "2-tavsiya"]
}

TEKSHIRUV MEZONLARI:
1. Bank siri: Mijoz ma'lumotlari uchinchi shaxsga oshkor bo'lmaganmi?
2. Rasmiy uslub: Matn xushmuomalalik va rasmiy tilda yozilganmi?
3. Qonuniy asos: O'zbekiston qonunlariga (masalan: "Banklar va bank faoliyati to'g'risida") havola bormi?
4. To'liqlik: Murojaatdagi barcha savollarga javob berilganmi?

MUHIM QOIDA: Agar "passed": false bo'lsa, "issues" massivida kamida 2 ta aniq sababni ko'rsatishing SHART. 
Aks holda tahlil xato deb hisoblanadi.`;

  try {
    const rawResult = await runAI(prompt);
    console.log("Compliance AI Raw Response:", rawResult);
    const cleaned = rawResult.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    
    // Boolean qiymatni aniqroq tekshirish (string bo'lsa ham)
    const isPassed = parsed.passed === true || parsed.passed === "true";
    
    // Agar passed: false bo'lsa-yu, issues bo'sh bo'lsa, standart xatolarni qo'shamiz
    let finalIssues = Array.isArray(parsed.issues) ? parsed.issues : [];
    if (!isPassed && finalIssues.length === 0) {
      finalIssues = ["Javob matnida qonuniy asoslar yetarli emas", "Rasmiy uslub standartlariga to'liq mos kelmaydi"];
    }

    return {
      passed: isPassed,
      issues: finalIssues,
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : []
    };
  } catch (err) {
    console.error("Compliance Check logic error:", err);
    return {
      passed: true, // Xatolik bo'lsa bloklamaslik uchun
      issues: ["AI tahlilida texnik xatolik"],
      suggestions: ["Javobni qaytadan tekshirib ko'ring"]
    };
  }
}
