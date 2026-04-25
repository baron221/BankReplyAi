"use client";
import { useState } from "react";
import TopBar from "@/components/TopBar";
import { MOCK_LEGAL_DOCS } from "@/lib/mock-data";
import { Search, BookOpen, FileText, Plus, ExternalLink } from "lucide-react";

const typeColors: Record<string, string> = { qonun: "badge-prokuratura", farmon: "badge-mb", nizom: "badge-yangi", "yoʻriqnoma": "badge-orta" };
const typeLabels: Record<string, string> = { qonun: "Qonun", farmon: "Farmon", nizom: "Nizom", "yoʻriqnoma": "Yo'riqnoma" };
const orgLabels: Record<string, string> = { prokuratura: "Prokuratura", soliq: "Soliq", markaziy_bank: "M.Bank", davlat: "Davlat" };

export default function KnowledgeBasePage() {
  const [search, setSearch] = useState("");
  const filtered = MOCK_LEGAL_DOCS.filter(d =>
    !search || d.title.toLowerCase().includes(search.toLowerCase()) || d.number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <TopBar title="Bilimlar Bazasi" subtitle="Qonunchilik hujjatlari va normativlar">
        <button className="btn btn-primary btn-sm" id="add-law-btn"><Plus size={14} /> Hujjat qo'shish</button>
      </TopBar>
      <div className="page-body fade-in">
        <div className="grad-header">
          <h1>📚 Qonunchilik Bazasi</h1>
          <p>{MOCK_LEGAL_DOCS.length} ta hujjat • AI javob generatsiyasida ishlatiladi</p>
        </div>

        <div className="filter-bar" style={{ marginBottom: 24 }}>
          <div className="search-input" style={{ flex: 1 }}>
            <Search size={14} className="search-icon" />
            <input id="kb-search" className="form-input" placeholder="Hujjat nomi yoki raqami bo'yicha qidirish..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
          </div>
          <span style={{ fontSize: 13, color: "var(--color-muted)" }}>{filtered.length} ta hujjat</span>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          {filtered.map(doc => (
            <div key={doc.id} className="card" style={{ transition: "all 0.2s" }} onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-1px)")} onMouseLeave={e => (e.currentTarget.style.transform = "")}>
              <div className="card-body" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#dbeafe,#bfdbfe)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <BookOpen size={15} color="#3b82f6" />
                    </div>
                    <span className={`badge ${typeColors[doc.type] || "badge-yangi"}`}>{typeLabels[doc.type] || doc.type}</span>
                    <span style={{ fontSize: 12, color: "var(--color-muted)", fontWeight: 600 }}>{doc.number}</span>
                    <span style={{ fontSize: 12, color: "var(--color-muted)" }}>• {doc.date}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 8, color: "var(--color-text)" }}>{doc.title}</div>
                  <div style={{ fontSize: 13, color: "var(--color-muted)", lineHeight: 1.6, marginBottom: 10 }}>{doc.summary}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {doc.relevantOrgs.map(org => (
                      <span key={org} className="badge badge-yangi" style={{ fontSize: 11 }}>{orgLabels[org] || org}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-outline btn-sm" id={`view-law-${doc.id}`}><FileText size={13} /> Ko'rish</button>
                  <button className="btn btn-ghost btn-sm"><ExternalLink size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
