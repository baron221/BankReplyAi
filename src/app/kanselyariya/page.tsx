"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import { Inbox, Send, Search, Eye } from "lucide-react";
import { ORG_LABELS } from "@/lib/mock-data";

type Inquiry = {
  id: string;
  displayId: string;
  title: string;
  orgType: string;
  orgName: string;
  status: string;
  receivedDate: string;
  department: string;
};

export default function KanselyariyaPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"kirish" | "chiqish">("kirish");
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    // Agar "chiqish" tabida bo'lsak, faqat "yuborilgan" statusli murojaatlarni olamiz.
    // Agar "kirish" tabida bo'lsak, barcha kelib tushgan murojaatlarni (yoki faqat yangi/jarayonda bo'lganlarni) olamiz.
    if (activeTab === "chiqish") {
      params.set("status", "yuborilgan");
    } else {
      // Kirish xatlari: Yuborilgan bo'lmaganlari yoki barchasi. Elektron jurnalda odatda barchasi "kirish" bo'ladi.
      // Keling, kirishda hamma tushgan xatlarni ko'rsatamiz.
    }

    const res = await fetch(`/api/inquiries?${params}`);
    const result = await res.json();
    let data = Array.isArray(result.data) ? result.data : [];
    
    // Agar "kirish" tabida bo'lsak, ixtiyoriy ravishda filterlashimiz mumkin, 
    // lekin backendda status filter ishlaydi. 
    // Yoki "chiqish" dagi xatlarni kirishdan olib tashlash mumkin, biroq rasmiy jurnalda barchasi kirish raqamiga ega.
    setInquiries(data);
    setLoading(false);
  }, [search, activeTab]);

  useEffect(() => {
    const t = setTimeout(fetchData, 300);
    return () => clearTimeout(t);
  }, [fetchData]);

  const orgMap: Record<string, string> = { prokuratura: "badge-prokuratura", soliq: "badge-soliq", markaziy_bank: "badge-mb", davlat: "badge-davlat" };

  return (
    <>
      <TopBar title="Kanselyariya (Elektron Jurnal)" subtitle="Kirish va chiqish xatlari ro'yxati" />

      <div className="page-body fade-in">
        <div style={{ display: "flex", gap: 20, marginBottom: 20, borderBottom: "1px solid var(--color-border)" }}>
          <button
            onClick={() => setActiveTab("kirish")}
            style={{
              padding: "10px 16px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "kirish" ? "2px solid var(--color-primary)" : "2px solid transparent",
              color: activeTab === "kirish" ? "var(--color-primary)" : "var(--color-muted)",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.2s"
            }}
          >
            <Inbox size={16} /> Kirish xatlari
          </button>
          <button
            onClick={() => setActiveTab("chiqish")}
            style={{
              padding: "10px 16px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "chiqish" ? "2px solid var(--color-primary)" : "2px solid transparent",
              color: activeTab === "chiqish" ? "var(--color-primary)" : "var(--color-muted)",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.2s"
            }}
          >
            <Send size={16} /> Chiqish xatlari
          </button>
        </div>

        <div className="filter-bar" style={{ marginBottom: 20 }}>
          <div className="search-input" style={{ flex: 1, maxWidth: 400 }}>
            <Search size={14} className="search-icon" />
            <input
              className="form-input"
              placeholder="Jurnal raqami, mavzu yoki tashkilot bo'yicha..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 36 }}
            />
          </div>
          <span style={{ fontSize: 13, color: "var(--color-muted)", marginLeft: "auto" }}>
            Jami: {inquiries.length} ta xat
          </span>
        </div>

        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>{activeTab === "kirish" ? "Kirish No" : "Chiqish No"}</th>
                <th>Sana</th>
                <th>Tashkilot</th>
                <th>Mavzu / Qisqacha mazmuni</th>
                <th>Yo'naltirilgan bo'lim</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j}><div style={{ height: 16, background: "var(--color-border)", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite" }} /></td>
                    ))}
                  </tr>
                ))
              ) : inquiries.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--color-muted)" }}>Hozircha xatlar yo'q</td></tr>
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
                      {activeTab === "kirish" ? `K-${inq.displayId}` : `CH-${inq.displayId}`}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: 13, color: "var(--color-text)" }}>{inq.receivedDate}</span>
                  </td>
                  <td>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{inq.orgName}</div>
                    <div style={{ marginTop: 4 }}>
                      <span className={`badge ${orgMap[inq.orgType] || "badge-davlat"}`}>{ORG_LABELS[inq.orgType as keyof typeof ORG_LABELS] || inq.orgType}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 13.5, fontWeight: 500, maxWidth: 350, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inq.title}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{inq.department}</span>
                  </td>
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
