"use client";
import { Bell, Search, RefreshCw } from "lucide-react";

interface TopBarProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export default function TopBar({ title, subtitle, children }: TopBarProps) {
  return (
    <div className="topbar">
      <div className="topbar-title">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="topbar-actions">
        {children}
        <button className="icon-btn" title="Yangilash">
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
