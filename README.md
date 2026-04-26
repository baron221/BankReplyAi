# 🏛️ BankReplyAI (Compliance & AI Response)

**BankReplyAI** — bu banklar va davlat tashkilotlari uchun mo'ljallangan, sun'iy intellekt (Gemini 2.5 Flash dan foydalanildi yanada yuqora aniqlik va sifafat uchun Gemini pro versiyalaridan foydalaning) yordamida kiruvchi murojaatlarni tahlil qilish va ularga qonuniy asoslangan javoblar tayyorlashni avtomatlashtiruvchi premium platforma.

## 🚀 Asosiy Imkoniyatlar

- **🤖 AI Klassifikatsiya**: Kiruvchi murojaatlarni mavzu, risk darajasi va muddat bo'yicha avtomatik tahlil qilish.
- **📝 Aqlli Javob Generatsiyasi**: Murojaat turi va bilimlar bazasidagi qonun hujjatlariga tayanib, rasmiy javob matnini tayyorlash.
- **⚖️ Compliance Nazorati**: Tayyorlangan javobning O'zbekiston qonunchiligi va bank ichki qoidalariga mosligini SI orqali tekshirish.
- **🔊 Ovozli SI Xulosasi**: Murojaat mazmunini o'zbek va rus tillarida ovozli eshitish imkoniyati.
- **📂 Hujjatlar Analizi**: Biriktirilgan PDF fayllarni o'qish va ulardagi ma'lumotlarni hisobga olish.
- **🌍 Ko'p tilli tizim (i18n)**: To'liq o'zbek va rus tillarida ishlash imkoniyati (interfeys + AI).
- **📊 Audit va Monitoring**: Tizimdagi barcha harakatlarning to'liq tarixi (Audit Log).

## 🛠 Texnik Stek

- **Frontend**: Next.js 15 (App Router), React, TailwindCSS (Glassmorphism UI).
- **Backend**: Next.js Serverless Functions.
- **AI**: Google Gemini 2.0 Flash API.
- **Database**: Prisma + SQLite (Better-SQLite3).
- **Authentication**: Next-Auth.js.
- **Icons**: Lucide React.

## 📦 O'rnatish va Ishga Tushirish

1.  **Repozitoriyani yuklab oling**:
    ```bash
    git clone https://github.com/baron221/BankReplyAi.git
    cd BankReplyAi
    ```

2.  **Kutubxonalarni o'rnating**:
    ```bash
    npm install
    ```

3.  **Environment variables (.env)** sozlang:
    ```env
    DATABASE_URL="file:./dev.db"
    GEMINI_API_KEY="Sizning_API_Kalitingiz"
    NEXTAUTH_SECRET="secret_kalit"
    ```

4.  **Bazani tayyorlang**:
    ```bash
    npx prisma generate
    npx prisma db push
    npx tsx prisma/seed.ts
    ```

5.  **Loyiha ishga tushiring**:
    ```bash
    npm run dev
    ```

## 🏛 Hackathon Maxsus

Ushbu loyiha bank sohasida byurokratiyani kamaytirish va javob xatlarining sifatini 90% ga oshirish uchun kontseptual yechim sifatida ishlab chiqilgan.

---
**Muallif**: Bobur Karimov
**Versiya**: 1.0.0-Premium
