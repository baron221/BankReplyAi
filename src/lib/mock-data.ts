// Mock data for the AI Response System

export type OrgType = "prokuratura" | "soliq" | "markaziy_bank" | "davlat";
export type StatusType = "yangi" | "jarayonda" | "tekshiruv" | "tasdiqlangan" | "rad_etilgan" | "yuborilgan";
export type RiskLevel = "yuqori" | "oʻrta" | "past";
export type UserRole = "operator" | "menejer" | "admin";

export interface Inquiry {
  id: string;
  title: string;
  orgType: OrgType;
  orgName: string;
  receivedDate: string;
  deadline: string;
  status: StatusType;
  riskLevel: RiskLevel;
  topic: string;
  description: string;
  fileUrl?: string;
  fileName?: string;
  assignedTo?: string;
  aiClassification?: {
    topic: string;
    deadline: string;
    riskScore: number;
    keywords: string[];
  };
  aiResponse?: string;
  complianceCheck?: {
    passed: boolean;
    issues: string[];
    laws: string[];
  };
  auditTrail: AuditEntry[];
  version: number;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  role: UserRole;
  details?: string;
}

export interface LegalDocument {
  id: string;
  title: string;
  type: "qonun" | "farmon" | "nizom" | "yoʻriqnoma";
  number: string;
  date: string;
  relevantOrgs: OrgType[];
  summary: string;
  fullText?: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  department: string;
  email: string;
  avatar?: string;
}

// ─── Mock Users ───────────────────────────────────────────────────────────────

export const MOCK_USERS: User[] = [
  { id: "u1", name: "Bobur Karimov", role: "admin", department: "IT Xizmati", email: "bobur@bank.uz" },
  { id: "u2", name: "Malika Tosheva", role: "menejer", department: "Yuridik Boʻlim", email: "malika@bank.uz" },
  { id: "u3", name: "Jamshid Yusupov", role: "operator", department: "Moliya Boʻlimi", email: "jamshid@bank.uz" },
  { id: "u4", name: "Nilufar Rakhimova", role: "operator", department: "Kredit Boʻlimi", email: "nilufar@bank.uz" },
];

export const CURRENT_USER = MOCK_USERS[0];

// ─── Mock Legal Documents ─────────────────────────────────────────────────────

export const MOCK_LEGAL_DOCS: LegalDocument[] = [
  {
    id: "l1",
    title: "Oʻzbekiston Respublikasi Markaziy banki toʻgʻrisidagi Qonun",
    type: "qonun",
    number: "№ ZRU-598",
    date: "2019-11-11",
    relevantOrgs: ["markaziy_bank"],
    summary: "Markaziy bankning vazifalari, huquqlari va majburiyatlarini belgilaydi. Bankka nisbatan nazorat va tekshiruvlar tartibini tartibga soladi.",
  },
  {
    id: "l2",
    title: "Soliq Kodeksi — Soliq organlarining tekshiruv vakolatlari",
    type: "nizom",
    number: "№ ZRU-702",
    date: "2021-01-01",
    relevantOrgs: ["soliq"],
    summary: "Soliq organlari tomonidan oʻtkaziladigan tekshiruvlar tartibi, talab qilinadigan hujjatlar roʻyxati va javob muddatlari.",
  },
  {
    id: "l3",
    title: "Prokuratara toʻgʻrisidagi Qonun — Bank tuzilmalariga murojaat tartibi",
    type: "qonun",
    number: "№ ZRU-445",
    date: "2015-08-20",
    relevantOrgs: ["prokuratura"],
    summary: "Prokuratura organlarining kredit tashkilotlariga soʻrov yuborish huquqi va javob muddatlari (15 ish kuni).",
  },
  {
    id: "l4",
    title: "Bank siri toʻgʻrisida nizom",
    type: "nizom",
    number: "№ 2891",
    date: "2020-06-15",
    relevantOrgs: ["prokuratura", "soliq", "markaziy_bank", "davlat"],
    summary: "Bank sirini tashkil etuvchi maʼlumotlar doirasi, ularni oshkor qilish shartlari va tartib-qoidalari.",
  },
  {
    id: "l5",
    title: "Pul yuvishga qarshi kurash qonuni",
    type: "qonun",
    number: "№ ZRU-330",
    date: "2004-08-26",
    relevantOrgs: ["prokuratura", "markaziy_bank", "davlat"],
    summary: "Shubhali operatsiyalar haqida hisobot berish majburiyati, monitoring tizimi va muassasa javobgarligi.",
  },
  {
    id: "l6",
    title: "Kredit tashkilotlari toʻgʻrisidagi qonun",
    type: "qonun",
    number: "№ ZRU-215",
    date: "1996-04-25",
    relevantOrgs: ["markaziy_bank", "soliq"],
    summary: "Banklar va kredit tashkilotlarining litsenziyalash, kapital talablari va hisobot berish tartibini belgilaydi.",
  },
];

// ─── Mock Inquiries ───────────────────────────────────────────────────────────

export const MOCK_INQUIRIES: Inquiry[] = [
  {
    id: "INQ-2024-001",
    title: "Fuqaro Toshmatov A. hisobvaraqlari boʻyicha maʼlumot soʻrovi",
    orgType: "prokuratura",
    orgName: "Toshkent shahar prokuraturasi",
    receivedDate: "2024-04-15",
    deadline: "2024-04-30",
    status: "tekshiruv",
    riskLevel: "yuqori",
    topic: "Bank siri, hisobvaraq maʼlumotlari",
    description: "Jinoyat ishi doirasida fuqaro Toshmatov Alisher Baxtiyorovichning barcha hisobvaraqlari va soʻnggi 12 oylik operatsiyalari boʻyicha maʼlumot soʻralmoqda.",
    fileName: "prokuratura_sorov_001.pdf",
    assignedTo: "u2",
    aiClassification: {
      topic: "Bank siri / Jinoyat ishi soʻrovi",
      deadline: "2024-04-30",
      riskScore: 87,
      keywords: ["jinoyat ishi", "hisobvaraq", "operatsiyalar", "bank siri"],
    },
    aiResponse: `Toshkent shahar prokuraturasiga,

Sizning 2024-yil 15-apreldagi №123/2024 raqamli soʻrovingiz asosida, Oʻzbekiston Respublikasining «Bank siri toʻgʻrisida»gi nizomi va «Prokuratora toʻgʻrisidagi» qonuniga muvofiq quyidagilarni maʼlum qilamiz:

Fuqaro Toshmatov Alisher Baxtiyorovich (JSHSHIR: 12345678901234) bankimizda quyidagi hisobvaraqlarga ega:
— UZS hisobvarag'i: №2020802000001234567 (faol)
— USD hisobvarag'i: №2020802000001234568 (faol)

Soʻnggi 12 oylik operatsiyalar tarixi ilova sifatida taqdim etilmoqda (maxfiy, faqat sud ishi maqsadida).

Hurmat bilan,
[Bank rahbariyati imzosi]`,
    complianceCheck: {
      passed: true,
      issues: [],
      laws: ["ZRU-445 (15 ish kuni muddat)", "№2891 (Bank siri tartibi)", "ZRU-598 (MB qonuni)"],
    },
    auditTrail: [
      { id: "a1", timestamp: "2024-04-15T09:30:00", action: "Murojaat qabul qilindi", user: "Jamshid Yusupov", role: "operator", details: "PDF fayl yuklandi, OCR bajarildi" },
      { id: "a2", timestamp: "2024-04-15T09:32:00", action: "AI klassifikatsiya bajarildi", user: "Sistema", role: "operator", details: "Risk: Yuqori, Muddat: 15 kun" },
      { id: "a3", timestamp: "2024-04-15T10:00:00", action: "Menejrga yuborildi", user: "Jamshid Yusupov", role: "operator" },
      { id: "a4", timestamp: "2024-04-15T14:20:00", action: "AI javob generatsiya qilindi", user: "Sistema", role: "menejer" },
      { id: "a5", timestamp: "2024-04-16T09:00:00", action: "Compliance tekshiruvi oʻtdi", user: "Sistema", role: "menejer", details: "Barcha qonun talablari bajarildi" },
    ],
    version: 3,
  },
  {
    id: "INQ-2024-002",
    title: "2023-yil soliq hisobotlari tekshiruvi",
    orgType: "soliq",
    orgName: "Toshkent shahar soliq inspeksiyasi",
    receivedDate: "2024-04-10",
    deadline: "2024-04-25",
    status: "yuborilgan",
    riskLevel: "oʻrta",
    topic: "Soliq hisoboti, daromad deklaratsiyasi",
    description: "Bank tomonidan 2023-yil davomida toʻlangan soliqlar, moliyaviy hisobotlar va deklaratsiyalar boʻyicha tekshiruv olib borilmoqda.",
    fileName: "soliq_tekshiruv_2024.pdf",
    assignedTo: "u3",
    aiClassification: {
      topic: "Soliq tekshiruvi / Moliyaviy hisobot",
      deadline: "2024-04-25",
      riskScore: 55,
      keywords: ["soliq", "hisobot", "2023-yil", "deklaratsiya", "tekshiruv"],
    },
    aiResponse: "Toshkent shahar soliq inspeksiyasiga...",
    complianceCheck: {
      passed: true,
      issues: [],
      laws: ["ZRU-702 (Soliq kodeksi)", "ZRU-215 (Kredit tashkilotlari)"],
    },
    auditTrail: [
      { id: "b1", timestamp: "2024-04-10T08:00:00", action: "Murojaat qabul qilindi", user: "Nilufar Rakhimova", role: "operator" },
      { id: "b2", timestamp: "2024-04-10T08:05:00", action: "AI klassifikatsiya bajarildi", user: "Sistema", role: "operator" },
      { id: "b3", timestamp: "2024-04-18T11:30:00", action: "Javob tasdiqlandi", user: "Malika Tosheva", role: "menejer" },
      { id: "b4", timestamp: "2024-04-19T09:00:00", action: "Javob yuborildi", user: "Malika Tosheva", role: "menejer", details: "Email va qogʻozda yuborildi" },
    ],
    version: 2,
  },
  {
    id: "INQ-2024-003",
    title: "Kapital etarliligi nisbatini tekshirish",
    orgType: "markaziy_bank",
    orgName: "Oʻzbekiston Respublikasi Markaziy banki",
    receivedDate: "2024-04-18",
    deadline: "2024-05-03",
    status: "jarayonda",
    riskLevel: "yuqori",
    topic: "Kapital talablari, prudensial nazorat",
    description: "Basel III talablariga muvofiq kapital etarliligi nisbati va boshqa prudensial ko'rsatkichlar boʻyicha maʼlumot soʻralmoqda.",
    fileName: "mb_kapital_sorov.pdf",
    assignedTo: "u2",
    aiClassification: {
      topic: "Prudensial nazorat / Kapital etarliligi",
      deadline: "2024-05-03",
      riskScore: 78,
      keywords: ["kapital", "Basel III", "prudensial", "nazorat", "nisbat"],
    },
    auditTrail: [
      { id: "c1", timestamp: "2024-04-18T10:00:00", action: "Murojaat qabul qilindi", user: "Bobur Karimov", role: "admin" },
      { id: "c2", timestamp: "2024-04-18T10:05:00", action: "AI klassifikatsiya bajarildi", user: "Sistema", role: "admin" },
      { id: "c3", timestamp: "2024-04-18T14:00:00", action: "Menejrga topshirildi", user: "Bobur Karimov", role: "admin" },
    ],
    version: 1,
  },
  {
    id: "INQ-2024-004",
    title: "AML monitoring natijalari boʻyicha hisobot",
    orgType: "prokuratura",
    orgName: "Oʻzbekiston Respublikasi Bosh prokuraturasi",
    receivedDate: "2024-04-20",
    deadline: "2024-05-05",
    status: "yangi",
    riskLevel: "yuqori",
    topic: "Pul yuvish, shubhali operatsiyalar",
    description: "2024-yilning I choragida aniqlangan shubhali moliyaviy operatsiyalar boʻyicha hisobot va tegishli chora-tadbirlar talab qilinmoqda.",
    fileName: "bosh_prokuratura_aml.pdf",
    auditTrail: [
      { id: "d1", timestamp: "2024-04-20T09:00:00", action: "Murojaat qabul qilindi", user: "Sistema", role: "operator", details: "Email orqali qabul qilindi" },
    ],
    version: 1,
  },
  {
    id: "INQ-2024-005",
    title: "Xorijiy valyuta operatsiyalari tekshiruvi",
    orgType: "soliq",
    orgName: "Davlat Soliq Qoʻmitasi",
    receivedDate: "2024-04-08",
    deadline: "2024-04-22",
    status: "rad_etilgan",
    riskLevel: "past",
    topic: "Valyuta operatsiyalari, transfer pricing",
    description: "Xorijiy kontragentlar bilan amalga oshirilgan valyuta operatsiyalari va transfer pricing bo'yicha maʼlumot soʻralmoqda.",
    assignedTo: "u3",
    auditTrail: [
      { id: "e1", timestamp: "2024-04-08T11:00:00", action: "Murojaat qabul qilindi", user: "Jamshid Yusupov", role: "operator" },
      { id: "e2", timestamp: "2024-04-09T09:00:00", action: "AI klassifikatsiya bajarildi", user: "Sistema", role: "operator" },
      { id: "e3", timestamp: "2024-04-10T10:00:00", action: "Rad etildi", user: "Malika Tosheva", role: "menejer", details: "Soʻrov vakolat doirasidan tashqarida" },
    ],
    version: 1,
  },
  {
    id: "INQ-2024-006",
    title: "Majburiy zahiralar boʻyicha qoʻshimcha maʼlumot",
    orgType: "markaziy_bank",
    orgName: "Oʻzbekiston Respublikasi Markaziy banki",
    receivedDate: "2024-04-22",
    deadline: "2024-05-07",
    status: "yangi",
    riskLevel: "oʻrta",
    topic: "Majburiy zahiralar, likvidlik",
    description: "Markaziy bankning 2024-yil uchun yangilangan majburiy zahira talablariga bank muvofiqligini tekshirish.",
    auditTrail: [
      { id: "f1", timestamp: "2024-04-22T08:30:00", action: "Murojaat qabul qilindi", user: "Sistema", role: "operator" },
    ],
    version: 1,
  },
];

// ─── Statistics ───────────────────────────────────────────────────────────────

export function getStats() {
  const total = MOCK_INQUIRIES.length;
  const yangi = MOCK_INQUIRIES.filter(i => i.status === "yangi").length;
  const jarayonda = MOCK_INQUIRIES.filter(i => i.status === "jarayonda" || i.status === "tekshiruv").length;
  const yuborilgan = MOCK_INQUIRIES.filter(i => i.status === "yuborilgan").length;
  const muddatOtgan = MOCK_INQUIRIES.filter(i => {
    const deadline = new Date(i.deadline);
    return deadline < new Date() && i.status !== "yuborilgan" && i.status !== "rad_etilgan";
  }).length;

  return { total, yangi, jarayonda, yuborilgan, muddatOtgan };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const ORG_LABELS: Record<OrgType, string> = {
  prokuratura: "Prokuratura",
  soliq: "Soliq organi",
  markaziy_bank: "Markaziy bank",
  davlat: "Davlat organi",
};

export const STATUS_LABELS: Record<StatusType, string> = {
  yangi: "Yangi",
  jarayonda: "Jarayonda",
  tekshiruv: "Tekshiruvda",
  tasdiqlangan: "Tasdiqlangan",
  rad_etilgan: "Rad etilgan",
  yuborilgan: "Yuborilgan",
};

export const RISK_LABELS: Record<RiskLevel, string> = {
  yuqori: "Yuqori",
  "oʻrta": "O'rta",
  past: "Past",
};
