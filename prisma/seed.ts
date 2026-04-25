import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";

const dbPath = path.resolve(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("🌱 Tozalash va premium ma'lumotlar bilan to'ldirish boshlandi...");

  // Tozalash
  await prisma.auditEntry.deleteMany({});
  await prisma.inquiry.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.legalDoc.deleteMany({});

  const adminHash = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.create({
    data: { name: "Bobur Karimov", email: "admin@bank.uz", passwordHash: adminHash, role: "admin", department: "IT Xizmati" },
  });

  const inquiries = [
    {
      displayId: "INQ-2024-001",
      title: "Jinoyat ishi doirasida bank siri ma'lumotlari so'rovi",
      orgType: "prokuratura",
      orgName: "Toshkent shahar prokuraturasi",
      orgEmail: "prokuror@gov.uz",
      receivedDate: "2024-04-20",
      deadline: "2024-05-05",
      status: "yangi",
      riskLevel: "yuqori",
      topic: "Jinoyat ishi / Bank siri",
      description: "2024-yil 15-apreldagi 14/2-sonli jinoyat ishi doirasida 'Global Trade' MCHJning 2023-yildagi barcha tranzaksiyalari va hisobvaraq qoldiqlari haqida batafsil ma'lumot taqdim etishingizni so'raymiz.",
      department: "Yuridik",
      fileName: "prokuratura_sorov_14_2.pdf",
      aiKeywords: JSON.stringify(["Jinoyat ishi", "Bank siri", "Tranzaksiya"]),
      aiSummary: "Mijoz tranzaksiyalari bo'yicha prokuratura so'rovi. Bank siri to'g'risidagi qonunning 12-moddasiga muvofiq ko'rib chiqish talab etiladi.",
      aiMissingDocs: JSON.stringify(["Mijozning pasport nusxasi", "Yopiq hisob raqamlari ro'yxati"]),
      aiRiskScore: 85
    },
    {
      displayId: "INQ-2024-002",
      title: "Soliq auditi doirasida dividend to'lovlari monitoringi",
      orgType: "soliq",
      orgName: "Davlat Soliq Qo'mitasi",
      orgEmail: "audit@soliq.uz",
      receivedDate: "2024-04-21",
      deadline: "2024-05-10",
      status: "jarayonda",
      riskLevel: "o'rta",
      topic: "Audit / Soliq",
      description: "'Artel Logistics' MCHJ tomonidan 2023-yil yakunlari bo'yicha to'langan dividendlardan ushlangan soliqlar va bank o'tkazmalari tasdig'i so'ralmoqda.",
      department: "Amaliyot",
      fileName: "dsq_audit_check.docx",
      aiKeywords: JSON.stringify(["Soliq", "Dividend", "Audit"]),
      aiSummary: "Dividend to'lovlari bo'yicha soliq auditi. Amaliyot bo'limi tomonidan ma'lumotnoma tayyorlanishi va soliq stavkasi tekshirilishi kerak.",
      aiMissingDocs: JSON.stringify(["To'lov topshiriqnomalari", "Dividend qarori nusxasi"]),
      aiRiskScore: 45
    },
    {
      displayId: "INQ-2024-003",
      title: "Prudensial normativlar va likvidlik hisoboti",
      orgType: "markaziy_bank",
      orgName: "O'zbekiston Respublikasi Markaziy Banki",
      orgEmail: "supervision@cbu.uz",
      receivedDate: "2024-04-22",
      deadline: "2024-04-28",
      status: "tekshiruv",
      riskLevel: "past",
      topic: "Nazorat / Hisobot",
      description: "Likvidlikni qoplash koeffitsiyenti (LCR) va sof barqaror moliyalashtirish koeffitsiyenti (NSFR) bo'yicha oylik hisobotni taqdim etish.",
      department: "Kredit",
      fileName: "mb_report_standard.pdf",
      aiKeywords: JSON.stringify(["Likvidlik", "LCR", "NSFR"]),
      aiSummary: "Markaziy bankning likvidlik bo'yicha standart hisoboti. Ma'lumotlar Kredit va Moliya bo'limi tomonidan tasdiqlanishi shart.",
      aiMissingDocs: JSON.stringify(["Oylik balans", "Likvidlik kalkulyatsiyasi"]),
      aiRiskScore: 20
    },
    {
      displayId: "INQ-2024-004",
      title: "Valyuta operatsiyalari va eksport tushumlari tahlili",
      orgType: "markaziy_bank",
      orgName: "MB Valyuta nazorati departamenti",
      receivedDate: "2024-04-25",
      deadline: "2024-05-12",
      status: "yangi",
      riskLevel: "o'rta",
      topic: "Valyuta / Eksport",
      description: "Eksport shartnomalari bo'yicha valyuta tushumlarining o'z vaqtida qaytarilishi va debitorlik qarzdorligi bo'yicha ma'lumotnoma.",
      department: "Amaliyot",
      fileName: "valyuta_nazorat_04.pdf",
      aiKeywords: JSON.stringify(["Valyuta", "Eksport", "Monitoring"]),
      aiSummary: "Eksport tushumlari bo'yicha nazorat so'rovi. Valyuta nazorati qoidalariga muvofiqligini tekshirish kerak.",
      aiMissingDocs: JSON.stringify(["Tashqi savdo shartnomasi", "SWIFT xabarnomasi"]),
      aiRiskScore: 35
    },
    {
      displayId: "INQ-2024-005",
      title: "Shubhali operatsiyalar va AML/CFT monitoringi",
      orgType: "prokuratura",
      orgName: "Bosh prokuratura huzuridagi Departament",
      receivedDate: "2024-04-25",
      deadline: "2024-04-30",
      status: "yangi",
      riskLevel: "yuqori",
      topic: "AML / Monitoring",
      description: "P2P o'tkazmalari orqali amalga oshirilgan 1.5 mlrd so'mlik shubhali tranzaksiyalar va ularning egalari haqida to'liq ma'lumot.",
      department: "Compliance",
      fileName: "aml_alert_1500.pdf",
      aiKeywords: JSON.stringify(["AML", "P2P", "Shubhali"]),
      aiSummary: "Katta miqdordagi shubhali o'tkazmalar. KYC (Mijozingni bil) ma'lumotlarini qayta ko'rib chiqish va prokuraturaga javob tayyorlash lozim.",
      aiMissingDocs: JSON.stringify(["Mijoz anketasi", "Karta tranzaksiyalari", "IP manzillar ro'yxati"]),
      aiRiskScore: 92
    },
    {
      displayId: "INQ-2024-006",
      title: "Mijoz shikoyati: Ipoteka krediti foizlari",
      orgType: "davlat",
      orgName: "Raqobatni rivojlantirish qo'mitasi",
      receivedDate: "2024-04-26",
      deadline: "2024-05-02",
      status: "yangi",
      riskLevel: "o'rta",
      topic: "Shikoyat / Kredit",
      description: "Fuqaro S.Saidovning imtiyozli ipoteka krediti foiz stavkalari asossiz oshirilganligi yuzasidan yo'llagan shikoyatini o'rganish.",
      department: "Kredit",
      fileName: "shikoyat_saidov.pdf",
      aiKeywords: JSON.stringify(["Ipoteka", "Foiz stavkasi", "Shikoyat"]),
      aiSummary: "Ipoteka krediti bo'yicha iste'molchi shikoyati. Kredit shartnomasi va foiz hisoblash mexanizmini tekshirish talab etiladi.",
      aiMissingDocs: JSON.stringify(["Kredit shartnomasi", "Grafik nusxasi"]),
      aiRiskScore: 50
    },
    {
      displayId: "INQ-2024-007",
      title: "Tashqi iqtisodiy faoliyat: Import tahlili",
      orgType: "soliq",
      orgName: "Toshkent shahar soliq boshqarmasi",
      receivedDate: "2024-04-26",
      deadline: "2024-05-15",
      status: "yangi",
      riskLevel: "past",
      topic: "Import / Audit",
      description: "'Food-Tech' MCHJ tomonidan amalga oshirilgan import operatsiyalari va to'langan bojxona to'lovlari bo'yicha bank tasdig'i.",
      department: "Amaliyot",
      fileName: "import_data_foodtech.xlsx",
      aiKeywords: JSON.stringify(["Import", "Bojxona", "To'lov"]),
      aiSummary: "Import operatsiyalari bo'yicha soliq idorasi so'rovi. Tashqi savdo bo'limi ma'lumotlari bilan solishtirish kerak.",
      aiMissingDocs: JSON.stringify(["Bojxona deklaratsiyasi", "Invoys"]),
      aiRiskScore: 15
    },
    {
      displayId: "INQ-2024-008",
      title: "Mikroqarzlar monitoringi va foiz tahlili",
      orgType: "markaziy_bank",
      orgName: "MB Kredit monitoringi departamenti",
      receivedDate: "2024-04-27",
      deadline: "2024-05-10",
      status: "yangi",
      riskLevel: "o'rta",
      topic: "Mikroqarz / Monitoring",
      description: "Aholi o'rtasida mikroqarzlar bo'yicha o'rtacha foiz stavkalari va qaytarish koeffitsiyenti haqida tahliliy hisobot.",
      department: "Kredit",
      fileName: "microloan_stats.pdf",
      aiKeywords: JSON.stringify(["Mikroqarz", "Foiz", "Tahlil"]),
      aiSummary: "Aholiga berilgan mikroqarzlar statistikasi. MB talablariga muvofiq tahliliy ma'lumotnoma tayyorlanishi kerak.",
      aiMissingDocs: JSON.stringify(["Kredit portfeli tahlili", "Qaytarilmagan summalar ro'yxati"]),
      aiRiskScore: 30
    },
    {
      displayId: "INQ-2024-009",
      title: "Plastik kartalar komissiyasi tekshiruvi",
      orgType: "davlat",
      orgName: "Iste'molchilar huquqlarini himoya qilish agentligi",
      receivedDate: "2024-04-27",
      deadline: "2024-05-01",
      status: "yangi",
      riskLevel: "past",
      topic: "Komissiya / Plastik karta",
      description: "Plastik kartalardan naqd pul yechish va boshqa operatsiyalar uchun joriy etilgan yangi komissiya stavkalari asosliligi.",
      department: "Amaliyot",
      fileName: "card_tariffs_2024.pdf",
      aiKeywords: JSON.stringify(["Komissiya", "Plastik karta", "Tarif"]),
      aiSummary: "Bank tariflari bo'yicha so'rov. Tariflar e'lon qilingan sanalar va ommaviy oferta shartlarini taqdim etish kerak.",
      aiMissingDocs: JSON.stringify(["Bank tariflar jadvali", "Ommaviy oferta"]),
      aiRiskScore: 25
    },
    {
      displayId: "INQ-2024-010",
      title: "Xalqaro pul o'tkazmalari auditi",
      orgType: "markaziy_bank",
      orgName: "MB Xalqaro hamkorlik bo'limi",
      receivedDate: "2024-04-28",
      deadline: "2024-05-15",
      status: "yangi",
      riskLevel: "yuqori",
      topic: "Xalqaro o'tkazma / Audit",
      description: "Rossiya va Qozog'istondan kelib tushayotgan pul o'tkazmalari hajmining o'sishi va ularning manbalarini o'rganish bo'yicha MB so'rovi.",
      department: "Compliance",
      fileName: "international_remittance.xlsx",
      aiKeywords: JSON.stringify(["Pul o'tkazmasi", "Xalqaro", "Compliance"]),
      aiSummary: "Xalqaro o'tkazmalar bo'yicha chuqur tahlil. Geopolitik risklar va sanksiyalar bilan bog'liq masalalarni inobatga olish shart.",
      aiMissingDocs: JSON.stringify(["Mijozlar daromad manbasi", "Sanksion ro'yxat tekshiruvi"]),
      aiRiskScore: 88
    }
  ];

  for (const inq of inquiries) {
    const created = await prisma.inquiry.create({
      data: {
        ...inq,
        assignedToId: admin.id,
        auditEntries: {
          create: {
            action: "Murojaat qabul qilindi va tizimga kiritildi",
            userName: "Sistema",
            userRole: "admin",
            details: "Hackathon Premium Dataset"
          }
        }
      }
    });
    console.log(`✅ Yaratildi: ${created.displayId}`);
  }

  console.log("\n🎉 Premium bazani to'ldirish muvaffaqiyatli yakunlandi!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
