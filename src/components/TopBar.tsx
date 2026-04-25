"use client";
import { Bell, Search, RefreshCw, Languages } from "lucide-react";
import { useLanguage } from "./LanguageContext";

interface TopBarProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export default function TopBar({ title, subtitle, children }: TopBarProps) {
  const { lang, setLang, t } = useLanguage();

  return (
    <div className="topbar">
      <div className="topbar-title">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="topbar-actions">
        {children}
        
        <div style={{ display: "flex", background: "var(--bg-base)", borderRadius: 8, padding: 2, border: "1px solid var(--color-border)", marginRight: 8 }}>
          <button 
            onClick={() => setLang("uz")}
            className={`btn btn-sm ${lang === "uz" ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "4px 8px", fontSize: 11, height: "auto", minWidth: 36 }}
          >UZ</button>
          <button 
            onClick={() => setLang("ru")}
            className={`btn btn-sm ${lang === "ru" ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "4px 8px", fontSize: 11, height: "auto", minWidth: 36 }}
          >RU</button>
        </div>

        <button className="icon-btn" title={t("refresh")}>
          <RefreshCw size={15} />
        </button>
        <button className="icon-btn" title="Qidiruv">
          <Search size={15} />
        </button>
        <button className="icon-btn" title="Bildirishnomalar">
          <Bell size={15} />
          <span className="notif-dot" />
        </button>
      </div>
    </div>
  );
}
