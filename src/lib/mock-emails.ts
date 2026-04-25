// Mock Email data for inbox simulation

export interface InboundEmail {
  id: string;
  from: string;
  fromName: string;
  fromOrg: string;
  orgType: "prokuratura" | "soliq" | "markaziy_bank" | "davlat";
  to: string;
  subject: string;
  body: string;
  receivedAt: string;
  hasAttachment: boolean;
  attachmentName?: string;
  status: "yangi" | "jarayonda" | "qayta_ishlandi";
  aiProcessed: boolean;
  linkedInquiryId?: string;
  priority: "urgent" | "normal" | "low";
}

export const MOCK_EMAILS: InboundEmail[] = [
  {
    id: "email-001",
    from: "info@prokuratura.gov.uz",
    fromName: "Toshkent shahar prokuraturasi",
    fromOrg: "Toshkent shahar prokuraturasi",
    orgType: "prokuratura",
    to: "info@yourbank.uz",
    subject: "So'rov №45/2024 — Fuqaro Karimov R. hisobvaraqlari bo'yicha",
    body: `Hurmatli bank rahbariyati,

O'zbekiston Respublikasi Jinoyat-protsessual kodeksining 180-moddasi va «Prokuratora to'g'risida»gi qonunning 29-moddasiga muvofiq, Toshkent shahar prokuraturasida yuritilayotgan №45/2024 jinoyat ishi doirasida quyidagilarni so'raymiz:

Fuqaro Karimov Rustam Ismoilovich (JSHSHIR: 30506197300014) ga tegishli barcha bank hisobvaraqlari bo'yicha 2023-yil 1-yanvardan 2024-yil 1-aprelgacha bo'lgan davrdagi to'liq bank ko'chirmalarini taqdim eting.

Javob muddati: 15 ish kuni (2024-yil 10-may).

Hurmat bilan,
Toshkent shahar prokuratori
Yusupov A.K.`,
    receivedAt: "2024-04-23T08:30:00",
    hasAttachment: true,
    attachmentName: "sorov_45_2024.pdf",
    status: "yangi",
    aiProcessed: false,
    priority: "urgent",
  },
  {
    id: "email-002",
    from: "tekshiruv@soliq.gov.uz",
    fromName: "Davlat Soliq Qo'mitasi",
    fromOrg: "Davlat Soliq Qo'mitasi — Toshkent viloyati",
    orgType: "soliq",
    to: "info@yourbank.uz",
    subject: "Kameral soliq tekshiruvi №ST-2024-112",
    body: `Hurmatli bank rahbariyati,

Soliq kodeksining 141-moddasiga muvofiq, №ST-2024-112 kameral soliq tekshiruvi doirasida quyidagi ma'lumotlarni 10 ish kuni ichida taqdim etishingizni so'raymiz:

1. 2023-yil uchun to'liq moliyaviy hisobot (balans va foyda-zarar)
2. Korporativ daromad solig'i deklaratsiyasi
3. QQS bo'yicha kvartal hisobotlari
4. Asosiy vositalar ro'yxati va amortizatsiya hisobi

Javob muddati: 2024-yil 5-may.`,
    receivedAt: "2024-04-22T14:15:00",
    hasAttachment: false,
    status: "jarayonda",
    aiProcessed: true,
    linkedInquiryId: "INQ-2024-002",
    priority: "normal",
  },
  {
    id: "email-003",
    from: "nazorat@cbu.uz",
    fromName: "Markaziy Bank Nazorat Boshqarmasi",
    fromOrg: "O'zbekiston Respublikasi Markaziy banki",
    orgType: "markaziy_bank",
    to: "info@yourbank.uz",
    subject: "Prudensial ko'rsatkichlar bo'yicha so'rov — 2024 Q1",
    body: `Hurmatli bank rahbariyati,

Markaziy bankning 15.03.2024 №1245-son buyrug'iga muvofiq, 2024-yilning I choragi yakunlari bo'yicha quyidagi prudensial ko'rsatkichlarni taqdim etishingizni so'raymiz:

- Kapital etarliligi nisbati (CAR) — Basel III
- Likvidlik qoplash nisbati (LCR)
- Sof barqaror moliyalashtirish nisbati (NSFR)
- Muammoli kreditlar ulushi (NPL)

Ma'lumotlarni belgilangan shaklda elektron tarzda yuborishingiz talab etiladi.

Muddat: 2024-yil 30-aprel.`,
    receivedAt: "2024-04-20T09:00:00",
    hasAttachment: true,
    attachmentName: "shakl_prudensial_2024Q1.xlsx",
    status: "yangi",
    aiProcessed: false,
    priority: "urgent",
  },
  {
    id: "email-004",
    from: "moliya@soliq.gov.uz",
    fromName: "Soliq inspeksiyasi",
    fromOrg: "Yunusobod tuman soliq inspeksiyasi",
    orgType: "soliq",
    to: "info@yourbank.uz",
    subject: "Transfer pricing tekshiruvi haqida xabar",
    body: `Xabarnoma: 2023-yil xorijiy tranzaksiyalar bo'yicha qo'shimcha ma'lumot talab qilinadi. Javob muddati: 2024-yil 15-may.`,
    receivedAt: "2024-04-18T11:20:00",
    hasAttachment: false,
    status: "qayta_ishlandi",
    aiProcessed: true,
    linkedInquiryId: "INQ-2024-005",
    priority: "low",
  },
];
