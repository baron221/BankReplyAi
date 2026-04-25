import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";

const dbPath = path.resolve(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter } as Parameters<typeof PrismaClient>[0]);

async function main() {
  console.log("🌱 Ma'lumotlar bazasini to'ldirish boshlandi...");

  const adminHash = await bcrypt.hash("admin123", 12);
  const menejerHash = await bcrypt.hash("menejer123", 12);
  const operatorHash = await bcrypt.hash("operator123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@bank.uz" },
    update: {},
    create: { name: "Bobur Karimov", email: "admin@bank.uz", passwordHash: adminHash, role: "admin", department: "IT Xizmati" },
  });

  const menejer = await prisma.user.upsert({
    where: { email: "malika@bank.uz" },
    update: {},
    create: { name: "Malika Tosheva", email: "malika@bank.uz", passwordHash: menejerHash, role: "menejer", department: "Yuridik Bo'lim" },
  });

  const op1 = await prisma.user.upsert({
    where: { email: "jamshid@bank.uz" },
    update: {},
    create: { name: "Jamshid Yusupov", email: "jamshid@bank.uz", passwordHash: operatorHash, role: "operator", department: "Moliya Bo'limi" },
  });

  await prisma.user.upsert({
    where: { email: "nilufar@bank.uz" },
    update: {},
    create: { name: "Nilufar Rakhimova", email: "nilufar@bank.uz", passwordHash: operatorHash, role: "operator", department: "Kredit Bo'limi" },
  });

  console.log("✅ Foydalanuvchilar yaratildi");

  const legalDocs = [
    { id: "l1", title: "O'zbekiston Respublikasi Markaziy banki to'g'risidagi Qonun", docType: "qonun", number: "№ ZRU-598", date: "2019-11-11", relevantOrgs: JSON.stringify(["markaziy_bank"]), summary: "Markaziy bankning vazifalari, huquqlari va majburiyatlarini belgilaydi." },
    { id: "l2", title: "Soliq Kodeksi — Soliq organlarining tekshiruv vakolatlari", docType: "nizom", number: "№ ZRU-702", date: "2021-01-01", relevantOrgs: JSON.stringify(["soliq"]), summary: "Soliq organlari tomonidan o'tkaziladigan tekshiruvlar tartibi va javob muddatlari." },
    { id: "l3", title: "Prokuratara to'g'risidagi Qonun", docType: "qonun", number: "№ ZRU-445", date: "2015-08-20", relevantOrgs: JSON.stringify(["prokuratura"]), summary: "Prokuratura organlarining kredit tashkilotlariga so'rov yuborish huquqi (15 ish kuni)." },
    { id: "l4", title: "Bank siri to'g'risida nizom", docType: "nizom", number: "№ 2891", date: "2020-06-15", relevantOrgs: JSON.stringify(["prokuratura", "soliq", "markaziy_bank", "davlat"]), summary: "Bank sirini tashkil etuvchi ma'lumotlar doirasi va ularni oshkor qilish shartlari." },
    { id: "l5", title: "Pul yuvishga qarshi kurash qonuni", docType: "qonun", number: "№ ZRU-330", date: "2004-08-26", relevantOrgs: JSON.stringify(["prokuratura", "markaziy_bank", "davlat"]), summary: "Shubhali operatsiyalar haqida hisobot berish majburiyati va monitoring tizimi." },
    { id: "l6", title: "Kredit tashkilotlari to'g'risidagi qonun", docType: "qonun", number: "№ ZRU-215", date: "1996-04-25", relevantOrgs: JSON.stringify(["markaziy_bank", "soliq"]), summary: "Banklar va kredit tashkilotlarining litsenziyalash va hisobot berish tartibi." },
  ];

  for (const doc of legalDocs) {
    await prisma.legalDoc.upsert({ where: { id: doc.id }, update: {}, create: doc });
  }
  console.log("✅ Huquqiy hujjatlar yaratildi");

  const inq1 = await prisma.inquiry.upsert({
    where: { displayId: "INQ-2024-001" },
    update: {},
    create: {
      displayId: "INQ-2024-001",
      title: "Fuqaro Toshmatov A. hisobvaraqlari bo'yicha ma'lumot so'rovi",
      orgType: "prokuratura", orgName: "Toshkent shahar prokuraturasi", orgEmail: "prokuratura@gov.uz",
      receivedDate: "2024-04-15", deadline: "2024-04-30", status: "tekshiruv", riskLevel: "yuqori",
      topic: "Bank siri, hisobvaraq ma'lumotlari",
      description: "Jinoyat ishi doirasida fuqaro Toshmatov Alisher Baxtiyorovichning barcha hisobvaraqlari va so'nggi 12 oylik operatsiyalari bo'yicha ma'lumot so'ralmoqda.",
      fileName: "prokuratura_sorov_001.pdf", assignedToId: menejer.id,
      aiResponse: "Toshkent shahar prokuraturasiga,\n\nSizning so'rovingiz asosida quyidagilarni ma'lum qilamiz...\n\nHurmat bilan,\nBank rahbariyati",
      aiRiskScore: 87, aiKeywords: JSON.stringify(["jinoyat ishi", "hisobvaraq", "operatsiyalar", "bank siri"]),
      compliancePassed: true, complianceLaws: JSON.stringify(["ZRU-445", "№2891"]), version: 3,
    },
  });

  await prisma.auditEntry.createMany({
    data: [
      { inquiryId: inq1.id, action: "Murojaat qabul qilindi", userName: "Jamshid Yusupov", userRole: "operator", details: "PDF fayl yuklandi", timestamp: new Date("2024-04-15T09:30:00") },
      { inquiryId: inq1.id, action: "AI klassifikatsiya bajarildi", userName: "Sistema", userRole: "operator", details: "Risk: Yuqori, Muddat: 15 kun", timestamp: new Date("2024-04-15T09:32:00") },
      { inquiryId: inq1.id, action: "AI javob generatsiya qilindi", userName: "Sistema", userRole: "menejer", details: "Ishonch darajasi: 92%", timestamp: new Date("2024-04-15T14:20:00") },
    ],
  });

  const inq2 = await prisma.inquiry.upsert({
    where: { displayId: "INQ-2024-002" },
    update: {},
    create: {
      displayId: "INQ-2024-002", title: "2023-yil soliq hisobotlari tekshiruvi",
      orgType: "soliq", orgName: "Toshkent shahar soliq inspeksiyasi", orgEmail: "soliq@tax.gov.uz",
      receivedDate: "2024-04-10", deadline: "2024-04-25", status: "yuborilgan", riskLevel: "o'rta",
      topic: "Soliq hisoboti", description: "Bank tomonidan 2023-yil davomida to'langan soliqlar bo'yicha tekshiruv.",
      assignedToId: op1.id, aiRiskScore: 55, aiKeywords: JSON.stringify(["soliq", "hisobot", "2023-yil"]),
      compliancePassed: true, version: 2,
    },
  });

  await prisma.auditEntry.createMany({
    data: [
      { inquiryId: inq2.id, action: "Murojaat qabul qilindi", userName: "Nilufar Rakhimova", userRole: "operator", timestamp: new Date("2024-04-10T08:00:00") },
      { inquiryId: inq2.id, action: "Javob yuborildi", userName: "Malika Tosheva", userRole: "menejer", details: "Email va qog'ozda yuborildi", timestamp: new Date("2024-04-19T09:00:00") },
    ],
  });

  for (const inq of [
    { displayId: "INQ-2024-003", title: "Kapital etarliligi nisbatini tekshirish", orgType: "markaziy_bank", orgName: "O'zbekiston Respublikasi Markaziy banki", orgEmail: "info@cbu.uz", receivedDate: "2024-04-18", deadline: "2024-05-03", status: "jarayonda", riskLevel: "yuqori", topic: "Kapital talablari", description: "Basel III talablariga muvofiq kapital etarliligi nisbati bo'yicha ma'lumot so'ralmoqda.", assignedToId: menejer.id, aiRiskScore: 78, aiKeywords: JSON.stringify(["kapital", "Basel III"]), version: 1 },
    { displayId: "INQ-2024-004", title: "AML monitoring natijalari bo'yicha hisobot", orgType: "prokuratura", orgName: "O'zbekiston Respublikasi Bosh prokuraturasi", orgEmail: "bosh.prokuratura@gov.uz", receivedDate: "2024-04-20", deadline: "2024-05-05", status: "yangi", riskLevel: "yuqori", topic: "Pul yuvish", description: "2024-yilning I choragida aniqlangan shubhali moliyaviy operatsiyalar bo'yicha hisobot.", aiRiskScore: 90, version: 1 },
    { displayId: "INQ-2024-005", title: "Xorijiy valyuta operatsiyalari tekshiruvi", orgType: "soliq", orgName: "Davlat Soliq Qo'mitasi", receivedDate: "2024-04-08", deadline: "2024-04-22", status: "rad_etilgan", riskLevel: "past", topic: "Valyuta operatsiyalari", description: "Xorijiy kontragentlar bilan amalga oshirilgan valyuta operatsiyalari bo'yicha ma'lumot so'ralmoqda.", assignedToId: op1.id, aiRiskScore: 30, version: 1 },
    { displayId: "INQ-2024-006", title: "Majburiy zahiralar bo'yicha qo'shimcha ma'lumot", orgType: "markaziy_bank", orgName: "O'zbekiston Respublikasi Markaziy banki", orgEmail: "info@cbu.uz", receivedDate: "2024-04-22", deadline: "2024-05-07", status: "yangi", riskLevel: "o'rta", topic: "Majburiy zahiralar", description: "Markaziy bankning yangilangan majburiy zahira talablariga bank muvofiqligini tekshirish.", aiRiskScore: 55, version: 1 },
  ]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await prisma.inquiry.upsert({ where: { displayId: inq.displayId }, update: {}, create: inq as any });
  }

  console.log("✅ Namuna murojaatlar yaratildi");
  console.log("\n🎉 Seed muvaffaqiyatli bajarildi!");
  console.log("\n📌 Login ma'lumotlari:");
  console.log("   Admin:    admin@bank.uz    / admin123");
  console.log("   Menejer:  malika@bank.uz   / menejer123");
  console.log("   Operator: jamshid@bank.uz  / operator123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
