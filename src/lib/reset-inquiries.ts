const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Bazani tozalash...");
  try {
    await prisma.auditEntry.deleteMany();
    await prisma.inquiry.deleteMany();
  } catch (e) {
    console.log("Tozalashda xato (baza bo'sh bo'lishi mumkin):", e.message);
  }

  console.log("Demo ma'lumotlarni qo'shish...");

  const inquiries = [
    {
      displayId: "INQ-2026-001",
      title: "Jinoyat ishi bo'yicha hisobvaraqlar haqida so'rov",
      orgType: "prokuratura",
      orgName: "Toshkent shahar prokuraturasi",
      orgEmail: "info@prokuratura.uz",
      receivedDate: "2026-04-20",
      deadline: "2026-05-05",
      status: "yangi",
      riskLevel: "yuqori",
      topic: "Jinoyat ishi / Bank siri",
      description: "2026-yil 15-apreldagi 14/2-sonli jinoyat ishi doirasida 'Mijoz X' ning 2025-yildagi barcha tranzaksiyalari haqida ma'lumot taqdim etishingizni so'raymiz.",
      department: "Yuridik",
      aiKeywords: JSON.stringify(["Jinoyat ishi", "Tranzaksiya", "Monitoring"]),
      aiSummary: "Mijoz tranzaksiyalari bo'yicha prokuratura so'rovi. Bank siri to'g'risidagi qonunga muvofiq ko'rib chiqish talab etiladi.",
      aiMissingDocs: JSON.stringify(["Mijozning pasport nusxasi", "Yopiq hisob raqamlari ro'yxati"]),
      aiRiskScore: 85
    },
    {
      displayId: "INQ-2026-002",
      title: "Soliq tekshiruvi doirasida ma'lumot taqdim etish",
      orgType: "soliq",
      orgName: "Davlat Soliq Qo'mitasi",
      orgEmail: "audit@soliq.uz",
      receivedDate: "2026-04-21",
      deadline: "2026-05-06",
      status: "jarayonda",
      riskLevel: "o'rta",
      topic: "Audit / Soliq",
      description: "'Global Invest' MCHJning 2023-yildagi to'langan dividendlari va soliq ushlanmalari bo'yicha ma'lumotnoma so'raladi.",
      department: "Amaliyot",
      aiKeywords: JSON.stringify(["Soliq", "Dividend", "Audit"]),
      aiSummary: "Mijoz dividend to'lovlari bo'yicha soliq idorasi so'rovi. Amaliyot bo'limi tomonidan ma'lumotnoma tayyorlanishi kerak.",
      aiMissingDocs: JSON.stringify(["To'lov topshiriqnomalari", "Dividend qarori nusxasi"]),
      aiRiskScore: 45
    },
    {
      displayId: "INQ-2026-003",
      title: "Prudensial normativlar hisoboti",
      orgType: "markaziy_bank",
      orgName: "O'zbekiston Respublikasi Markaziy Banki",
      orgEmail: "reports@cbu.uz",
      receivedDate: "2026-04-22",
      deadline: "2026-04-28",
      status: "tekshiruv",
      riskLevel: "past",
      topic: "Nazorat / Hisobot",
      description: "Likvidlik qoplama koeffitsiyenti (LCR) bo'yicha oylik hisobotni taqdim etish.",
      department: "Kredit",
      aiKeywords: JSON.stringify(["Likvidlik", "LCR", "Normativ"]),
      aiSummary: "Markaziy bankning likvidlik bo'yicha standart hisoboti. Kechikish jarimaga sabab bo'lishi mumkin.",
      aiMissingDocs: JSON.stringify(["Oylik balans", "Likvidlik kalkulyatsiyasi"]),
      aiRiskScore: 20
    }
  ];

  for (const inq of inquiries) {
    await prisma.inquiry.create({
      data: {
        ...inq,
        auditEntries: {
          create: {
            action: "Demo ma'lumot sifatida yaratildi",
            userName: "Sistema",
            userRole: "admin",
            details: "Hackathon demo ma'lumotlari"
          }
        }
      }
    });
  }

  console.log("Tayyor! 3 ta murojaat yaratildi.");
}

main()
  .catch(e => console.error("Xatolik:", e))
  .finally(async () => {
    await prisma.$disconnect();
  });
