"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import { ORG_LABELS, STATUS_LABELS, RISK_LABELS } from "@/lib/mock-data";
import { Plus, Search, Filter, Eye } from "lucide-react";

type Inquiry = {
  id: string;
  displayId: string;
  title: string;
  orgType: string;
  orgName: string;
  status: string;
  riskLevel: string;
  department: string;
  deadline: string;
  version: number;
};

export default function MurojaatlarPage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [orgFilter, setOrgFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (orgFilter !== "all") params.set("orgType", orgFilter);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (riskFilter !== "all") params.set("riskLevel", riskFilter);

    try {
      const res = await fetch(`/api/inquiries?${params}`);
      if (!res.ok) throw new Error("API error");
      const result = await res.json();
      setInquiries(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  }, [search, orgFilter, statusFilter, riskFilter]);

  useEffect(() => {
    const t = setTimeout(fetchData, 300);
    return () => clearTimeout(t);
  }, [fetchData]);

  const isOverdue = (deadline: string, status: string) =>
    new Date(deadline) < new Date() && status !== "yuborilgan" && status !== "rad_etilgan";

  const statusMap: Record<string, string> = {
    yangi: "badge-yangi", jarayonda: "badge-jarayonda", tekshiruv: "badge-tekshiruv",
    tasdiqlangan: "badge-tasdiqlangan", rad_etilgan: "badge-rad", yuborilgan: "badge-yuborilgan",
  };
  const riskMap: Record<string, string> = { yuqori: "badge-yuqori", "o'rta": "badge-orta", "oʻrta": "badge-orta", past: "badge-past" };
  const orgMap: Record<string, string> = { prokuratura: "badge-prokuratura", soliq: "badge-soliq", markaziy_bank: "badge-mb", davlat: "badge-davlat" };

  return (
    <>
      <TopBar title="Murojaatlar" subtitle={`${inquiries.length} ta murojaat`}>
        <Link href="/murojaatlar/yangi" className="btn btn-primary" id="add-murojaat-btn">
          <Plus size={15} /> Yangi
        </Link>
      </TopBar>

      <div className="page-body fade-in">
        <div className="filter-bar">
          <div className="search-input">
            <Search size={14} className="search-icon" />
            <input
              className="form-input"
              placeholder="ID, mavzu yoki tashkilot bo'yicha..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 36 }}
              id="search-input"
            />
          </div>
          <select className="form-input" style={{ width: "auto" }} value={orgFilter} onChange={e => setOrgFilter(e.target.value)} id="org-filter">
            <option value="all">Barcha tashkilotlar</option>
            {Object.entries(ORG_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select className="form-input" style={{ width: "auto" }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)} id="status-filter">
            <option value="all">Barcha statuslar</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select className="form-input" style={{ width: "auto" }} value={riskFilter} onChange={e => setRiskFilter(e.target.value)} id="risk-filter">
            <option value="all">Barcha risk</option>
            <option value="yuqori">Yuqori</option>
            <option value="o'rta">O&apos;rta</option>
            <option value="past">Past</option>
          </select>
          <span style={{ fontSize: 13, color: "var(--color-muted)", marginLeft: "auto" }}>
            <Filter size={13} style={{ display: "inline", marginRight: 4 }} />
            {inquiries.length} natija
          </span>
        </div>

        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Mavzu</th><th>Tashkilot</th><th>Bo'lim</th><th>Holat</th><th>Risk</th><th>Muddat</th><th>Versiya</th><th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(9)].map((_, j) => (
                      <td key={j}><div style={{ height: 16, background: "var(--color-border)", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite" }} /></td>
                    ))}
                  </tr>
                ))
              ) : inquiries.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: "center", padding: "40px", color: "var(--color-muted)" }}>Hech qanday natija topilmadi</td></tr>
              ) : inquiries.map(inq => (
                <tr 
                  key={inq.id} 
                  onClick={() => router.push(`/murojaatlar/${inq.displayId}`)}
                  style={{ cursor: "pointer", transition: "background 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(102,126,234,0.03)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td>
                    <span style={{ color: "var(--color-primary)", fontWeight: 700, fontSize: 13 }}>
                      {inq.displayId}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: 13.5, fontWeight: 600, maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inq.title}</div>
                    <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 2 }}>{inq.orgName}</div>
                  </td>
                  <td><span className={`badge ${orgMap[inq.orgType] || "badge-davlat"}`}>{ORG_LABELS[inq.orgType as keyof typeof ORG_LABELS] || inq.orgType}</span></td>
                  <td><span style={{ fontSize: 13, fontWeight: 500 }}>{inq.department}</span></td>
                  <td><span className={`badge ${statusMap[inq.status] || "badge-yangi"}`}>{STATUS_LABELS[inq.status as keyof typeof STATUS_LABELS] || inq.status}</span></td>
                  <td><span className={`badge ${riskMap[inq.riskLevel] || "badge-orta"}`}>{RISK_LABELS[inq.riskLevel as keyof typeof RISK_LABELS] || inq.riskLevel}</span></td>
                  <td>
                    <span style={{ fontSize: 13, color: isOverdue(inq.deadline, inq.status) ? "#dc2626" : "var(--color-muted)", fontWeight: isOverdue(inq.deadline, inq.status) ? 600 : 400 }}>
                      {isOverdue(inq.deadline, inq.status) ? "⚠️ " : ""}{inq.deadline}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: "var(--color-muted)" }}>v{inq.version}</td>
                  <td>
                    <div className="btn btn-ghost btn-sm btn-icon"><Eye size={14} /></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </>
  );
}
