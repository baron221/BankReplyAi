import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function GET() {
  try {
    const docs = await prisma.legalDoc.findMany({
      orderBy: { date: "desc" },
    });
    return NextResponse.json(docs);
  } catch (error) {
    console.error("KB GET error:", error);
    return NextResponse.json({ error: "Hujjatlarni yuklashda xatolik" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, fullText, docType, number, date } = body;

    if (!fullText) {
      return NextResponse.json({ error: "Matn bo'sh bo'lishi mumkin emas" }, { status: 400 });
    }

    // AI "Training"
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Sen O'zbekiston huquqshunosisan. Quyidagi hujjat matnini tahlil qil va JSON formatida qisqacha ma'lumot ber:
    
    HUJJAT MATNI:
    ${fullText.substring(0, 5000)}
    
    Faqat JSON qaytar (kod bloki belgisiz):
    {
      "summary": "Hujjatning qisqacha mazmuni (1-2 gap)",
      "relevantOrgs": ["prokuratura", "soliq", "markaziy_bank", "davlat"]
    }`;

    let aiResult = { summary: "Tahlil qilinmadi", relevantOrgs: ["davlat"] };
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
      aiResult = JSON.parse(cleaned);
    } catch (aiErr) {
      console.error("Knowledge Base AI error:", aiErr);
    }

    const newDoc = await prisma.legalDoc.create({
      data: {
        title: title || "Yangi hujjat",
        docType: docType || "nizom",
        number: number || "Noma'lum",
        date: date || new Date().toISOString().split("T")[0],
        fullText: fullText,
        summary: aiResult.summary,
        relevantOrgs: JSON.stringify(aiResult.relevantOrgs),
      },
    });

    return NextResponse.json(newDoc);
  } catch (error) {
    console.error("KB POST error:", error);
    return NextResponse.json({ error: "Hujjat qo'shishda xatolik" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, fullText, title, docType, number } = body;

    if (!id) return NextResponse.json({ error: "ID topilmadi" }, { status: 400 });

    let dataToUpdate: any = { fullText, title, docType, number };

    // Agar matn o'zgargan bo'lsa, qayta "Train" (tahlil) qilamiz
    if (fullText) {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `Sen O'zbekiston huquqshunosisan. Quyidagi hujjat matnini tahlil qil va JSON formatida qisqacha ma'lumot ber:
      
      HUJJAT MATNI:
      ${fullText.substring(0, 5000)}
      
      Faqat JSON qaytar (kod bloki belgisiz):
      {
        "summary": "Hujjatning qisqacha mazmuni (1-2 gap)",
        "relevantOrgs": ["prokuratura", "soliq", "markaziy_bank", "davlat"]
      }`;

      try {
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
        const aiResult = JSON.parse(cleaned);
        dataToUpdate.summary = aiResult.summary;
        dataToUpdate.relevantOrgs = JSON.stringify(aiResult.relevantOrgs);
      } catch (aiErr) {
        console.error("Retrain error:", aiErr);
      }
    }

    const updatedDoc = await prisma.legalDoc.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedDoc);
  } catch (error) {
    console.error("KB PATCH error:", error);
    return NextResponse.json({ error: "Yangilashda xatolik" }, { status: 500 });
  }
}
