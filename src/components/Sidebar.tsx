"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Plus, BarChart3, BookOpen, Mail, Settings, LogOut, Wifi } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/murojaatlar", icon: FileText, label: "Murojaatlar" },
  { href: "/murojaatlar/yangi", icon: Plus, label: "Yangi murojaat" },
  { href: "/hisobotlar", icon: BarChart3, label: "Hisobotlar" },
  { href: "/knowledge-base", icon: BookOpen, label: "Bilim bazasi" },
  { href: "/email-inbox", icon: Mail, label: "Email Inbox" },
  { href: "/api-docs", icon: Wifi, label: "API Docs" },
  { href: "/sozlamalar", icon: Settings, label: "Sozlamalar" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const userRole = (user as { role?: string })?.role || "operator";

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🏛️</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, color: "#fff" }}>AI Murojaat</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>Tizimi</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 8,
                color: active ? "#ffffff" : "rgba(255,255,255,0.72)",
                fontSize: 13.5,
                fontWeight: 500,
                textDecoration: "none",
                marginBottom: 2,
                position: "relative",
                background: active ? "rgba(102,126,234,0.3)" : "transparent",
                boxShadow: active ? "inset 0 0 0 1px rgba(102,126,234,0.4)" : "none",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)";
                  (e.currentTarget as HTMLElement).style.color = "#fff";
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.72)";
                }
              }}
            >
              {active && (
                <span style={{
                  position: "absolute", left: 0, top: "20%", bottom: "20%",
                  width: 3, borderRadius: 99,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }} />
              )}
              <Icon size={16} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User info at bottom */}
      <div style={{ marginTop: "auto", padding: "16px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 13, color: "#fff", flexShrink: 0,
          }}>
            {user?.name?.charAt(0) || "U"}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.name || "Foydalanuvchi"}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", textTransform: "capitalize" }}>
              {userRole}
            </div>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "var(--radius-sm)", padding: "8px 12px", cursor: "pointer",
            color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 500,
            transition: "background 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
          id="logout-btn"
        >
          <LogOut size={14} /> Chiqish
        </button>
      </div>
    </aside>
  );
}
