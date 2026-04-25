"use client";
import { useState, useEffect } from "react";
import TopBar from "@/components/TopBar";
import { Search, BookOpen, FileText, Plus, ExternalLink, X, Loader2, Brain, Edit3, Save } from "lucide-react";
import { toast } from "sonner";

const typeColors: Record<string, string> = { qonun: "badge-prokuratura", farmon: "badge-mb", nizom: "badge-yangi", "yoʻriqnoma": "badge-orta" };
const typeLabels: Record<string, string> = { qonun: "Qonun", farmon: "Farmon", nizom: "Nizom", "yoʻriqnoma": "Yo'riqnoma" };
const orgLabels: Record<string, string> = { prokuratura: "Prokuratura", soliq: "Soliq", markaziy_bank: "M.Bank", davlat: "Davlat" };

export default function KnowledgeBasePage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  
  // New document form state
  const [newDoc, setNewDoc] = useState({
    title: "",
    fullText: "",
    docType: "qonun",
    number: "",
    date: new Date().toISOString().split("T")[0]
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/knowledge-base");
      const data = await res.json();
      setDocs(data);
    } catch (err) {
      toast.error("Hujjatlarni yuklashda xatolik");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!newDoc.fullText || !newDoc.title) {
      toast.error("Sarlavha va matnni to'ldiring");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/knowledge-base", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDoc)
      });
      if (res.ok) {
        toast.success("Hujjat muvaffaqiyatli qo'shildi va AI tomonidan tahlil qilindi");
        setShowModal(false);
        setNewDoc({ title: "", fullText: "", docType: "qonun", number: "", date: new Date().toISOString().split("T")[0] });
        fetchDocs();
      }
    } catch (err) {
      toast.error("Hujjatni saqlashda xatolik");
    }
    setSaving(false);
  };

  const handleUpdate = async () => {
    if (!viewingDoc) return;
    setSaving(true);
    try {
      const res = await fetch("/api/knowledge-base", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(viewingDoc)
      });
      if (res.ok) {
        toast.success("Hujjat yangilandi va AI tomonidan qayta o'qitildi (Retrained)");
        setEditMode(false);
        fetchDocs();
        const updated = await res.json();
        setViewingDoc(updated);
      }
    } catch (err) {
      toast.error("Yangilashda xatolik");
    }
    setSaving(false);
  };

  const filtered = docs.filter(d =>
    !search || d.title.toLowerCase().includes(search.toLowerCase()) || d.number.toLowerCase().includes(search.toLowerCase())
  );

  const safeJSON = (str: string) => {
    try { return JSON.parse(str); } catch { return []; }
  };

  return (
    <>
      <TopBar title="Bilimlar Bazasi" subtitle="Qonunchilik hujjatlari va normativlar">
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}><Plus size={14} /> Hujjat qo'shish</button>
      </TopBar>

      {/* View/Edit Document Modal */}
      {viewingDoc && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="card" style={{ width: 800, padding: 0, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div className="card-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                <BookOpen size={18} color="var(--color-primary)" />
                {editMode ? (
                  <input className="form-input" value={viewingDoc.title} onChange={e => setViewingDoc({...viewingDoc, title: e.target.value})} style={{ fontWeight: 700, fontSize: 14 }} />
                ) : (
                  <span className="card-title">{viewingDoc.title}</span>
                )}
              </div>
              <button onClick={() => { setViewingDoc(null); setEditMode(false); }} className="btn btn-ghost btn-icon btn-sm"><X size={14} /></button>
            </div>
            <div className="card-body" style={{ overflowY: "auto", padding: "24px" }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
                {editMode ? (
                  <>
                    <select className="form-input" style={{ width: 120 }} value={viewingDoc.docType} onChange={e => setViewingDoc({...viewingDoc, docType: e.target.value})}>
                      <option value="qonun">Qonun</option>
                      <option value="farmon">Farmon</option>
                      <option value="nizom">Nizom</option>
                      <option value="yoʻriqnoma">Yo'riqnoma</option>
                    </select>
                    <input className="form-input" style={{ width: 120 }} value={viewingDoc.number} onChange={e => setViewingDoc({...viewingDoc, number: e.target.value})} />
                  </>
                ) : (
                  <>
                    <span className={`badge ${typeColors[viewingDoc.docType] || "badge-yangi"}`}>{typeLabels[viewingDoc.docType] || viewingDoc.docType}</span>
                    <span style={{ fontSize: 13, color: "var(--color-muted)", fontWeight: 600 }}>{viewingDoc.number}</span>
                    <span style={{ fontSize: 13, color: "var(--color-muted)" }}>• {viewingDoc.date}</span>
                  </>
                )}
              </div>

              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <Brain size={14} color="var(--color-primary)" /> AI Xulosasi:
              </div>
              <div style={{ fontSize: 14, color: "var(--color-muted)", padding: 16, background: "var(--bg-base)", borderRadius: 12, marginBottom: 20, border: "1px solid var(--color-border)", fontStyle: "italic" }}>
                {viewingDoc.summary || "AI tahlili mavjud emas"}
              </div>

              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Hujjatning to'liq matni:</div>
              {editMode ? (
                <textarea className="form-input" rows={15} value={viewingDoc.fullText} 
                  onChange={e => setViewingDoc({...viewingDoc, fullText: e.target.value})}
                  style={{ fontSize: 13.5, lineHeight: 1.7, background: "#fff" }} />
              ) : (
                <div style={{ fontSize: 14, lineHeight: 1.8, whiteSpace: "pre-wrap", color: "var(--color-text)", padding: 16, background: "var(--bg-base)", borderRadius: 12, border: "1px solid var(--color-border)" }}>
                  {viewingDoc.fullText || "Matn mavjud emas. Tahrirlash orqali matn kiriting."}
                </div>
              )}
            </div>
            <div className="card-footer" style={{ borderTop: "1px solid var(--color-border)", padding: "12px 20px", display: "flex", gap: 10, justifyContent: "flex-end" }}>
              {editMode ? (
                <button className="btn btn-primary btn-sm" onClick={handleUpdate} disabled={saving}>
                  {saving ? <><Loader2 size={14} className="spin" /> AI Tahlil (Retrain)...</> : <><Save size={14} /> Saqlash va AI Tahlil</>}
                </button>
              ) : (
                <button className="btn btn-outline btn-sm" onClick={() => setEditMode(true)}><Edit3 size={14} /> Tahrirlash</button>
              )}
              <button className="btn btn-ghost btn-sm" onClick={() => { setViewingDoc(null); setEditMode(false); }}>Yopish</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="card" style={{ width: 600, padding: 0, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div className="card-header">
              <span className="card-title"><Plus size={16} style={{ display: "inline", marginRight: 6 }} /> Yangi Hujjat Qo'shish</span>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-icon btn-sm"><X size={14} /></button>
            </div>
            <div className="card-body" style={{ overflowY: "auto", display: "grid", gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, display: "block" }}>Hujjat sarlavhasi</label>
                <input className="form-input" placeholder="Masalan: Banklar va bank faoliyati to'g'risidagi qonun"
                  value={newDoc.title} onChange={e => setNewDoc({...newDoc, title: e.target.value})} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, display: "block" }}>Hujjat turi</label>
                  <select className="form-input" value={newDoc.docType} onChange={e => setNewDoc({...newDoc, docType: e.target.value})}>
                    <option value="qonun">Qonun</option>
                    <option value="farmon">Farmon</option>
                    <option value="nizom">Nizom</option>
                    <option value="yoʻriqnoma">Yo'riqnoma</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, display: "block" }}>Hujjat raqami</label>
                  <input className="form-input" placeholder="Masalan: O'RQ-580"
                    value={newDoc.number} onChange={e => setNewDoc({...newDoc, number: e.target.value})} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, display: "block" }}>To'liq matn (AI buni tahlil qiladi)</label>
                <textarea className="form-input" rows={10} placeholder="Hujjat matnini bu yerga nusxalab qo'ying..."
                  value={newDoc.fullText} onChange={e => setNewDoc({...newDoc, fullText: e.target.value})} />
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>
                  {saving ? <><Loader2 size={16} className="spin" /> AI Tahlil qilmoqda (Train)...</> : <><Brain size={16} /> Qo'shish va Tahlil qilish</>}
                </button>
                <button className="btn btn-outline" onClick={() => setShowModal(false)}>Bekor qilish</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="page-body fade-in">
        <div className="grad-header">
          <h1>📚 Qonunchilik Bazasi</h1>
          <p>{docs.length} ta hujjat • AI javob generatsiyasida ishlatiladi</p>
        </div>

        <div className="filter-bar" style={{ marginBottom: 24 }}>
          <div className="search-input" style={{ flex: 1 }}>
            <Search size={14} className="search-icon" />
            <input id="kb-search" className="form-input" placeholder="Hujjat nomi yoki raqami bo'yicha qidirish..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
          </div>
          <span style={{ fontSize: 13, color: "var(--color-muted)" }}>{filtered.length} ta hujjat</span>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}><Loader2 size={32} className="spin" style={{ color: "var(--color-primary)" }} /></div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {filtered.map(doc => (
              <div key={doc.id} className="card" style={{ transition: "all 0.2s" }}>
                <div className="card-body" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "start" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#dbeafe,#bfdbfe)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <BookOpen size={15} color="#3b82f6" />
                      </div>
                      <span className={`badge ${typeColors[doc.docType] || "badge-yangi"}`}>{typeLabels[doc.docType] || doc.docType}</span>
                      <span style={{ fontSize: 12, color: "var(--color-muted)", fontWeight: 600 }}>{doc.number}</span>
                      <span style={{ fontSize: 12, color: "var(--color-muted)" }}>• {doc.date}</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 8, color: "var(--color-text)" }}>{doc.title}</div>
                    <div style={{ fontSize: 13, color: "var(--color-muted)", lineHeight: 1.6, marginBottom: 10 }}>{doc.summary}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {safeJSON(doc.relevantOrgs).map((org: string) => (
                        <span key={org} className="badge badge-yangi" style={{ fontSize: 11 }}>{orgLabels[org] || org}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => setViewingDoc(doc)}><FileText size={13} /> Ko'rish</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => toast.info("Hujjat manbasiga o'tilmoqda...")}><ExternalLink size={13} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
