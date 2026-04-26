"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import { useLanguage } from "@/components/LanguageContext";
import { ORG_LABELS, STATUS_LABELS, RISK_LABELS } from "@/lib/mock-data";
import { FileText, Clock, CheckCircle, AlertTriangle, Plus, TrendingUp, Building2, Scale, Landmark, Paperclip } from "lucide-react";

type StatData = {
  total: number;
  yangi: number;
  yuborilgan: number;
  muddatOtgan: number;
  jarayonda: number;
  orgStats: { orgType: string; _count: number }[];
};

type RecentInquiry = {
  id: string;
  displayId: string;
  title: string;
  orgType: string;
  riskLevel: string;
  status: string;
  deadline: string;
  fileName: string;
};

function StatusBadge({ status }: { status: string }) {
  const { t } = useLanguage();
  const map: Record<string, string> = {
    yangi: "badge-yangi", jarayonda: "badge-jarayonda", tekshiruv: "badge-tekshiruv",
    tasdiqlangan: "badge-tasdiqlangan", rad_etilgan: "badge-rad", yuborilgan: "badge-yuborilgan",
  };
  // We should add these to translations too
  const labelMap: Record<string, string> = {
    yangi: "Yangi", jarayonda: "Jarayonda", tekshiruv: "Tekshiruv",
    tasdiqlangan: "Tasdiqlangan", rad_etilgan: "Rad etilgan", yuborilgan: "Yuborilgan"
  };
  return <span className={`badge ${map[status] || "badge-yangi"}`}>{t(status) || labelMap[status] || status}</span>;
}

function RiskBadge({ risk }: { risk: string }) {
  const { t } = useLanguage();
  const map: Record<string, string> = { yuqori: "badge-yuqori", "o'rta": "badge-orta", "oʻrta": "badge-orta", past: "badge-past" };
  const labelKeyMap: Record<string, string> = { yuqori: "high", "o'rta": "medium", "oʻrta": "medium", past: "low" };
  return <span className={`badge ${map[risk] || "badge-orta"}`}>{t(risk) || t(labelKeyMap[risk]) || risk}</span>;
}

function OrgBadge({ orgType }: { orgType: string }) {
  const { t } = useLanguage();
  const map: Record<string, string> = { prokuratura: "badge-prokuratura", soliq: "badge-soliq", markaziy_bank: "badge-mb", davlat: "badge-davlat" };
  const labelKeyMap: Record<string, string> = { prokuratura: "prokuratura", soliq: "soliq", markaziy_bank: "mb", davlat: "davlat" };
  return <span className={`badge ${map[orgType] || "badge-davlat"}`}>{t(orgType) || t(labelKeyMap[orgType]) || orgType}</span>;
}

export default function Dashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<StatData | null>(null);
  const [recent, setRecent] = useState<RecentInquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/inquiries?stats=true").then(r => r.json()),
      fetch("/api/inquiries").then(r => r.json()),
    ]).then(([s, result]) => {
      setStats(s);
      setRecent(Array.isArray(result.data) ? result.data.slice(0, 5) : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const orgCounts = {
    prokuratura: stats?.orgStats?.find(o => o.orgType === "prokuratura")?._count || 0,
    soliq: stats?.orgStats?.find(o => o.orgType === "soliq")?._count || 0,
    markaziy_bank: stats?.orgStats?.find(o => o.orgType === "markaziy_bank")?._count || 0,
  };

  return (
    <>
      <TopBar title={t("dashboard")} subtitle={t("allTime")}>
        <Link href="/murojaatlar/yangi" className="btn btn-primary" id="new-inquiry-btn">
          <Plus size={15} /> {t("newInquiry")}
        </Link>
      </TopBar>

      <div className="page-body fade-in">
        <div className="grad-header">
          <h1>🏛️ BankReplyAI</h1>
          <p>Prokuratura · Soliq organlari · Markaziy bank — qonunchilikka mos javoblar</p>
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="stat-card" style={{ height: 120, background: "var(--bg-surface)", animation: "pulse 1.5s ease-in-out infinite" }} />
            ))}
          </div>
        ) : (
          <div className="stats-grid">
            <div className="stat-card stat-blue">
              <div className="stat-card-icon"><FileText size={20} /></div>
              <div className="stat-card-value">{stats?.total ?? 0}</div>
              <div className="stat-card-label">{t("allInquiries")}</div>
              <div className="stat-card-change" style={{ color: "#3b82f6" }}><TrendingUp size={12} /> {t("allTime")}</div>
            </div>
            <div className="stat-card stat-purple">
              <div className="stat-card-icon"><Clock size={20} /></div>
              <div className="stat-card-value">{stats?.yangi ?? 0}</div>
              <div className="stat-card-label">{t("newPending")}</div>
              <div className="stat-card-change" style={{ color: "#7c3aed" }}>{t("needHelp")}</div>
            </div>
            <div className="stat-card stat-green">
              <div className="stat-card-icon"><CheckCircle size={20} /></div>
              <div className="stat-card-value">{stats?.yuborilgan ?? 0}</div>
              <div className="stat-card-label">{t("sentResponses")}</div>
              <div className="stat-card-change" style={{ color: "#16a34a" }}>{t("success")}</div>
            </div>
            <div className="stat-card stat-red">
              <div className="stat-card-icon"><AlertTriangle size={20} /></div>
              <div className="stat-card-value">{stats?.muddatOtgan ?? 0}</div>
              <div className="stat-card-label">{t("overdue")}</div>
              <div className="stat-card-change" style={{ color: "#dc2626" }}>{t("urgent")}</div>
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">{t("recentInquiries")}</span>
              <Link href="/murojaatlar" className="btn btn-outline btn-sm">{t("viewAll")} →</Link>
            </div>
            <table className="data-table">
              <thead>
                <tr><th>ID</th><th>Mavzu</th><th>Tashkilot</th><th>Risk</th><th>Status</th><th>Muddat</th></tr>
              </thead>
              <tbody>
                {recent.length === 0 && !loading ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: 32, color: "var(--color-muted)" }}>{t("noData")}</td></tr>
                ) : recent.map(inq => (
                  <tr key={inq.id}>
                    <td>
                      <Link href={`/murojaatlar/${inq.displayId}`} style={{ color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}>
                        {inq.displayId}
                      </Link>
                    </td>
                    <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {inq.title}
                      {inq.fileName && <Paperclip size={12} style={{ marginLeft: 6, color: "var(--color-muted)", display: "inline" }} />}
                    </td>
                    <td><OrgBadge orgType={inq.orgType} /></td>
                    <td><RiskBadge risk={inq.riskLevel} /></td>
                    <td><StatusBadge status={inq.status} /></td>
                    <td style={{ fontSize: 12, color: "var(--color-muted)" }}>{inq.deadline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card">
              <div className="card-header"><span className="card-title">{t("byOrg")}</span></div>
              <div className="card-body" style={{ paddingTop: 16 }}>
                {[
                  { label: t("prokuratura"), count: orgCounts.prokuratura, icon: Scale, color: "#dc2626" },
                  { label: t("soliq"), count: orgCounts.soliq, icon: Building2, color: "#c2410c" },
                  { label: t("mb"), count: orgCounts.markaziy_bank, icon: Landmark, color: "#7c3aed" },
                ].map(({ label, count, icon: Icon, color }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={16} color={color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                        <span>{label}</span><span>{count}</span>
                      </div>
                      <div className="risk-bar">
                        <div className="risk-fill" style={{ width: `${stats?.total ? (count / stats.total) * 100 : 0}%`, background: color }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-header"><span className="card-title">{t("quickActions")}</span></div>
              <div className="card-body" style={{ paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                <Link href="/murojaatlar/yangi" className="btn btn-primary" style={{ justifyContent: "center" }}>
                  <Plus size={15} /> {t("newInquiry")}
                </Link>
                <Link href="/murojaatlar" className="btn btn-outline" style={{ justifyContent: "center" }}>
                  <FileText size={15} /> {t("inquiries")}
                </Link>
                <Link href="/hisobotlar" className="btn btn-ghost" style={{ justifyContent: "center" }}>
                  {t("reports")} →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </>
  );
}
