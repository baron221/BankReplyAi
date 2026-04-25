"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "uz" | "ru";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  uz: {
    dashboard: "Dashboard",
    inquiries: "Murojaatlar",
    newInquiry: "Yangi Murojaat",
    reports: "Hisobotlar",
    settings: "Sozlamalar",
    search: "Qidiruv",
    notifications: "Bildirishnomalar",
    refresh: "Yangilash",
    back: "Orqaga",
    generate: "Javob yaratish",
    generating: "Generatsiya...",
    send: "Yuborish",
    sending: "Yuborilmoqda...",
    save: "Saqlash",
    edit: "Tahrirlash",
    reject: "Rad etish",
    compliance: "Compliance",
    aiTahlil: "AI Tahlil",
    missingDocs: "Kerakli qo'shimcha hujjatlar",
    risk: "Risk",
    deadline: "Muddat",
    org: "Tashkilot",
    status: "Status",
    topic: "Mavzu",
    description: "Tavsif",
    files: "Biriktirilgan fayllar",
    kanselyariya: "Kanselyariya",
    knowledgeBase: "Bilimlar bazasi",
    emailInbox: "Email Inbox",
    apiDocs: "API Docs",
    logout: "Chiqish",
    user: "Foydalanuvchi",
    system: "Tizimi",
    allInquiries: "Jami murojaatlar",
    newPending: "Yangi (kutilmoqda)",
    sentResponses: "Yuborilgan javoblar",
    overdue: "Muddat o'tgan",
    recentInquiries: "So'nggi murojaatlar",
    viewAll: "Barchasi",
    byOrg: "Tashkilot bo'yicha",
    quickActions: "Tezkor amallar",
    prokuratura: "Prokuratura",
    soliq: "Soliq organi",
    mb: "Markaziy bank",
    allTime: "Barcha davr",
    urgent: "Zudlik bilan!",
    success: "Muvaffaqiyatli",
    needHelp: "Tez yordam kerak",
    noData: "Ma'lumot yo'q",
    searchPlaceholder: "ID, mavzu yoki tashkilot bo'yicha...",
    allOrgs: "Barcha tashkilotlar",
    allStatus: "Barcha statuslar",
    allRisks: "Barcha risklar",
    results: "natija",
    department: "Bo'lim",
    version: "Versiya",
    noResults: "Hech qanday natija topilmadi",
    high: "Yuqori",
    medium: "O'rta",
    low: "Past",
    davlat: "Davlat organi",
    yangi: "Yangi",
    jarayonda: "Jarayonda",
    tekshiruv: "Tekshiruvda",
    tasdiqlangan: "Tasdiqlangan",
    rad_etilgan: "Rad etilgan",
    yuborilgan: "Yuborilgan",
    detail: "Batafsil",
    audit: "Audit",
    aiResponse: "AI Javobi",
    complianceCheck: "Compliance Tekshiruvi",
    compliancePassed: "Compliance muvaffaqiyatli o'tdi",
    complianceFailed: "Compliance kamchiliklar topdi",
    referencedLaws: "Asoslangan qonun hujjatlari",
    riskScore: "Risk balli",
    summary: "Qisqacha mazmun",
    listen: "Eshitish",
    stop: "To'xtatish",
    assignedTo: "Mas'ul",
    receivedDate: "Kelgan sana",
    keywords: "Kalit so'zlar"
  },
  ru: {
    dashboard: "Панель управления",
    inquiries: "Обращения",
    newInquiry: "Новое обращение",
    reports: "Отчеты",
    settings: "Настройки",
    search: "Поиск",
    notifications: "Уведомления",
    refresh: "Обновить",
    back: "Назад",
    generate: "Создать ответ",
    generating: "Генерация...",
    send: "Отправить",
    sending: "Отправка...",
    save: "Сохранить",
    edit: "Редактировать",
    reject: "Отклонить",
    compliance: "Комплаенс",
    aiTahlil: "ИИ Анализ",
    missingDocs: "Необходимые доп. документы",
    risk: "Риск",
    deadline: "Срок",
    org: "Организация",
    status: "Статус",
    topic: "Тема",
    description: "Описание",
    files: "Прикрепленные файлы",
    kanselyariya: "Канцелярия",
    knowledgeBase: "База знаний",
    emailInbox: "Email Почта",
    apiDocs: "API Документы",
    logout: "Выйти",
    user: "Пользователь",
    system: "Система",
    allInquiries: "Всего обращений",
    newPending: "Новые (ожидают)",
    sentResponses: "Отправленные ответы",
    overdue: "Просроченные",
    recentInquiries: "Последние обращения",
    viewAll: "Все",
    byOrg: "По организациям",
    quickActions: "Быстрые действия",
    prokuratura: "Прокуратура",
    soliq: "Налоговый орган",
    mb: "Центральный банк",
    allTime: "За все время",
    urgent: "Срочно!",
    success: "Успешно",
    needHelp: "Нужна помощь",
    noData: "Нет данных",
    searchPlaceholder: "По ID, теме или организации...",
    allOrgs: "Все организации",
    allStatus: "Все статусы",
    allRisks: "Все риски",
    results: "результатов",
    department: "Отдел",
    version: "Версия",
    noResults: "Ничего не найдено",
    high: "Высокий",
    medium: "Средний",
    low: "Низкий",
    davlat: "Гос. орган",
    yangi: "Новый",
    jarayonda: "В процессе",
    tekshiruv: "На проверке",
    tasdiqlangan: "Утвержден",
    rad_etilgan: "Отклонен",
    yuborilgan: "Отправлен",
    detail: "Детали",
    audit: "Аудит",
    aiResponse: "Ответ ИИ",
    complianceCheck: "Проверка комплаенс",
    compliancePassed: "Комплаенс пройден успешно",
    complianceFailed: "Комплаенс нашел недостатки",
    referencedLaws: "Ссылочные законы",
    riskScore: "Балл риска",
    summary: "Краткое содержание",
    listen: "Слушать",
    stop: "Остановить",
    assignedTo: "Ответственный",
    receivedDate: "Дата получения",
    keywords: "Ключевые слова"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("uz");

  useEffect(() => {
    const saved = localStorage.getItem("app-lang") as Language;
    if (saved && (saved === "uz" || saved === "ru")) {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("app-lang", newLang);
  };

  const t = (key: string) => {
    return (translations[lang] as any)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
