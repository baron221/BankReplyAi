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
    system: "Tizimi"
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
    missingDocs: "Необходимые дополнительные документы",
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
    system: "Система"
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
