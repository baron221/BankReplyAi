"use client";
import { useState, useEffect } from "react";
import TopBar from "@/components/TopBar";
import { STATUS_LABELS, ORG_LABELS } from "@/lib/mock-data";
import { Download, BarChart3, CheckCircle, Clock, XCircle, Send, Loader2 } from "lucide-react";
import Link from "next/link";

type AuditRow = { id: string; timestamp: string; action: string; userName: string; userRole: string; details: string; inquiryId: string; displayId: string; title: string };
type Inquiry = { id: string; displayId: string; title: string; status: string; orgType: string; auditEntries: AuditRow[] };

export default function HisobotlarPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetch("/api/inquiries")
      .then(r => r.json())
      .then(data => { setInquiries(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/export");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `murojaatlar-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch { alert("Eksport xatoligi"); }
    setExporting(false);
  };

  const allAudit = inquiries
    .flatMap(inq => (inq.auditEntries || []).map(a => ({ ...a, displayId: inq.displayId, title: inq.title })))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const stats = {
    total: inquiries.length,
    yuborilgan: inquiries.filter(i => i.status === "yuborilgan").length,
    rad: inquiries.filter(i => i.status === "rad_etilgan").length,
    jarayonda: inquiries.filter(i => ["yangi", "jarayonda", "tekshiruv"].includes(i.status)).length,
  };

  return (
    <>
      <TopBar title="Hisobotlar & Audit" subtitle="Barcha harakatlar tarixi">
        <button className="btn btn-outline btn-sm" id="export-btn" onClick={handleExport} disabled={exporting}>
          {exporting ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Download size={14} />}
          {exporting ? "Yuklanmoqda..." : "CSV Eksport"}
        </button>
      </TopBar>

      <div className="page-body fade-in">
        <div className="grad-header" style={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }}>
          <h1>📊 Audit & Hisobotlar</h1>
          <p>Barcha murojaatlar va harakatlar to&apos;liq qayd etiladi</p>
        </div>

        <div className="stats-grid" style={{ marginBottom: 28 }}>
          {[
            { icon: BarChart3, label: "Jami murojaatlar", value: stats.total, color: "#3b82f6", bg: "#dbeafe" },
            { icon: Send, label: "Yuborilgan javoblar", value: stats.yuborilgan, color: "#16a34a", bg: "#dcfce7" },
            { icon: Clock, label: "Jarayondagi", value: stats.jarayonda, color: "#7c3aed", bg: "#ede9fe" },
            { icon: XCircle, label: "Rad etilgan", value: stats.rad, color: "#dc2626", bg: "#fee2e2" },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="stat-card">
              <div className="stat-card-icon" style={{ background: bg, color }}><Icon size={20} /></div>
              <div className="stat-card-value">{value}</div>
              <div className="stat-card-label">{label}</div>
            </div>
          ))}
        </div>

        {/* By status breakdown */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header"><span className="card-title">📋 Murojaatlar holati</span></div>
          <table className="data-table">
            <thead><tr><th>ID</th><th>Mavzu</th><th>Tashkilot</th><th>Holat</th></tr></thead>
            <tbody>
              {loading ? (
                [...Array(4)].map((_, i) => <tr key={i}><td colSpan={4}><div style={{ height: 14, background: "var(--color-border)", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite" }} /></td></tr>)
              ) : inquiries.map(inq => (
                <tr key={inq.id}>
                  <td><Link href={`/murojaatlar/${inq.displayId}`} style={{ color: "var(--color-primary)", fontWeight: 700, textDecoration: "none" }}>{inq.displayId}</Link></td>
                  <td style={{ fontSize: 13, maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inq.title}</td>
                  <td><span className={`badge badge-${inq.orgType === "markaziy_bank" ? "mb" : inq.orgType}`}>{ORG_LABELS[inq.orgType as keyof typeof ORG_LABELS] || inq.orgType}</span></td>
                  <td><span className={`badge badge-${inq.status === "rad_etilgan" ? "rad" : inq.status}`}>{STATUS_LABELS[inq.status as keyof typeof STATUS_LABELS] || inq.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Audit log */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📜 To&apos;liq Audit Jurnali</span>
            <span style={{ fontSize: 13, color: "var(--color-muted)" }}>{allAudit.length} ta yozuv</span>
          </div>
          <table className="data-table">
            <thead><tr><th>Vaqt</th><th>Murojaat</th><th>Harakat</th><th>Foydalanuvchi</th><th>Rol</th><th>Tafsilot</th></tr></thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => <tr key={i}><td colSpan={6}><div style={{ height: 14, background: "var(--color-border)", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite" }} /></td></tr>)
              ) : allAudit.map(entry => (
                <tr key={entry.id} className="slide-in">
                  <td style={{ fontSize: 12, color: "var(--color-muted)", whiteSpace: "nowrap" }}>
                    {new Date(entry.timestamp).toLocaleString("uz-UZ")}
                  </td>
                  <td>
                    <Link href={`/murojaatlar/${entry.displayId}`} style={{ fontWeight: 600, fontSize: 12.5, color: "var(--color-primary)", textDecoration: "none" }}>{entry.displayId}</Link>
                    <div style={{ fontSize: 11, color: "var(--color-muted)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.title}</div>
                  </td>
                  <td style={{ fontWeight: 600, fontSize: 13 }}>{entry.action}</td>
                  <td style={{ fontSize: 13 }}>{entry.userName}</td>
                  <td><span className="badge badge-yangi" style={{ fontSize: 11 }}>{entry.userRole}</span></td>
                  <td style={{ fontSize: 12, color: "var(--color-muted)", maxWidth: 200 }}>{entry.details || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
    </>
  );
}
