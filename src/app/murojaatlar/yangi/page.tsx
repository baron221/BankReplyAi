"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import { ORG_LABELS } from "@/lib/mock-data";
import { Upload, FileText, Loader2, CheckCircle, Brain, AtSign } from "lucide-react";

import { useLanguage } from "@/components/LanguageContext";

export default function YangiMurojaatPage() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [step, setStep] = useState<"form" | "classifying" | "done">("form");
  const [dragOver, setDragOver] = useState(false);
  const [form, setForm] = useState({
    title: "", orgType: "prokuratura", orgName: "", orgEmail: "",
    description: "", deadline: "", file: null as File | null,
  });
  const [classification, setClassification] = useState<{
    topic: string; riskScore: number; keywords: string[]; summary?: string;
  } | null>(null);
  const [savedInquiry, setSavedInquiry] = useState<{ displayId: string } | null>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(",")[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep("classifying");

    try {
      let fileBase64 = "";
      if (form.file) {
        fileBase64 = await fileToBase64(form.file);
      }

      // 1. Register and Classify in one call
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          orgType: form.orgType,
          orgName: form.orgName,
          orgEmail: form.orgEmail,
          description: form.description,
          deadline: form.deadline,
          fileName: form.file?.name || "",
          fileBase64: fileBase64,
          language: lang,
        }),
      });

      const inquiry = await res.json();
      if (!res.ok) throw new Error(inquiry.details || inquiry.error || "Registratsiyada xatolik");
      
      setSavedInquiry(inquiry);
      setClassification({
        topic: inquiry.topic,
        riskScore: inquiry.aiRiskScore,
        keywords: JSON.parse(inquiry.aiKeywords || "[]"),
        summary: inquiry.aiSummary,
        department: inquiry.department,
      });
      setStep("done");
    } catch (err: any) {
      console.error(err);
      setStep("form");
      alert("Xatolik yuz berdi: " + err.message);
    }
  };

  if (step === "classifying") {
    return (
      <>
        <TopBar title="Yangi Murojaat" subtitle="Saqlanmoqda va AI tahlil qilmoqda..." />
        <div className="page-body" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
          <div style={{ textAlign: "center" }}>
            <div className="ai-typing" style={{ justifyContent: "center", marginBottom: 20 }}>
              <div className="ai-dot" /><div className="ai-dot" /><div className="ai-dot" />
            </div>
            <Loader2 size={48} style={{ color: "var(--color-primary)", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
            <p style={{ fontWeight: 600, fontSize: 16 }}>AI klassifikatsiya qilmoqda...</p>
            <p style={{ color: "var(--color-muted)", fontSize: 13, marginTop: 6 }}>Mavzu, risk darajasi va muddat aniqlanmoqda</p>
          </div>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </>
    );
  }

  if (step === "done" && classification && savedInquiry) {
    return (
      <>
        <TopBar title="Yangi Murojaat" subtitle="AI klassifikatsiya natijasi" />
        <div className="page-body fade-in">
          <div className="card" style={{ maxWidth: 600, margin: "0 auto" }}>
            <div className="card-header">
              <span className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle size={18} color="#16a34a" /> Murojaat saqlandi — {savedInquiry.displayId}
              </span>
            </div>
            <div className="card-body">
              <div className="ai-panel">
                <div className="ai-header">
                  <div className="ai-icon"><Brain size={18} /></div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>Gemini AI Tahlili</div>
                    <div style={{ fontSize: 12, color: "var(--color-muted)" }}>Avtomatik klassifikatsiya</div>
                  </div>
                </div>
                <div style={{ display: "grid", gap: 14 }}>
                   <div>
                    <div style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 4 }}>Mavzu</div>
                    <div style={{ fontWeight: 600 }}>{classification.topic}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 4 }}>Yo'naltirilgan bo'lim</div>
                    <div style={{ fontWeight: 600, color: "var(--color-primary)" }}>{classification.department}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 6 }}>Risk darajasi: {classification.riskScore}%</div>
                    <div className="risk-bar">
                      <div className="risk-fill" style={{
                        width: `${classification.riskScore}%`,
                        background: classification.riskScore > 70 ? "#dc2626" : classification.riskScore > 40 ? "#f59e0b" : "#16a34a"
                      }} />
                    </div>
                  </div>
                  {classification.keywords?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 6 }}>Kalit so&apos;zlar</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {classification.keywords.map(k => (
                          <span key={k} className="badge badge-yangi">{k}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => router.push(`/murojaatlar/${savedInquiry.displayId}`)}
                >
                  Javob tayyorlash →
                </button>
                <button className="btn btn-outline" onClick={() => { setStep("form"); setClassification(null); setSavedInquiry(null); }}>
                  Yangi murojaat
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title="Yangi Murojaat" subtitle="Yangi tashqi murojaat kiritish" />
      <div className="page-body fade-in">
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <form onSubmit={handleSubmit}>
            {/* File upload */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header"><span className="card-title">📎 Fayl yuklash (ixtiyoriy)</span></div>
              <div className="card-body">
                <div
                  id="upload-zone"
                  className={`upload-zone ${dragOver ? "active" : ""}`}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) setForm(p => ({ ...p, file: f })); }}
                  onClick={() => document.getElementById("file-input")?.click()}
                >
                  {form.file ? (
                    <div>
                      <FileText size={32} style={{ margin: "0 auto 10px", color: "var(--color-primary)" }} />
                      <p style={{ fontWeight: 600 }}>{form.file.name}</p>
                      <p style={{ fontSize: 12, color: "var(--color-muted)" }}>{(form.file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <div>
                      <Upload size={32} style={{ margin: "0 auto 10px", color: "var(--color-muted)" }} />
                      <p style={{ fontWeight: 600, marginBottom: 6 }}>PDF, Word yoki Email faylini yuklang</p>
                      <p style={{ fontSize: 12, color: "var(--color-muted)" }}>Yoki bu yerga tashlang</p>
                      <p style={{ fontSize: 11, color: "var(--color-muted)", marginTop: 6 }}>PDF, DOC, DOCX, EML • Maks 20MB</p>
                    </div>
                  )}
                  <input id="file-input" type="file" accept=".pdf,.doc,.docx,.eml" style={{ display: "none" }}
                    onChange={e => setForm(p => ({ ...p, file: e.target.files?.[0] || null }))} />
                </div>
              </div>
            </div>

            {/* Form fields */}
            <div className="card">
              <div className="card-header"><span className="card-title">📋 Murojaat ma&apos;lumotlari</span></div>
              <div className="card-body">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Tashkilot turi *</label>
                    <select id="org-type-select" className="form-input" value={form.orgType} onChange={e => setForm(p => ({ ...p, orgType: e.target.value }))} required>
                      {Object.entries(ORG_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tashkilot nomi *</label>
                    <input id="org-name-input" className="form-input" placeholder="Masalan: Toshkent shahar prokuraturasi"
                      value={form.orgName} onChange={e => setForm(p => ({ ...p, orgName: e.target.value }))} required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label"><AtSign size={13} style={{ display: "inline", marginRight: 4 }} />Tashkilot email (javob yuborish uchun)</label>
                  <input id="org-email-input" className="form-input" type="email" placeholder="prokuratura@gov.uz"
                    value={form.orgEmail} onChange={e => setForm(p => ({ ...p, orgEmail: e.target.value }))} />
                </div>

                <div className="form-group">
                  <label className="form-label">Murojaat mavzusi *</label>
                  <input id="title-input" className="form-input" placeholder="Qisqacha mavzuni kiriting"
                    value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Murojaat matni *</label>
                  <textarea id="description-input" className="form-input" rows={5}
                    placeholder="Murojaat matnini kiriting... AI bu matn asosida klassifikatsiya va javob tayyorlaydi."
                    value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    required style={{ resize: "vertical" }} />
                </div>

                <div className="form-group">
                  <label className="form-label">Javob berish muddati</label>
                  <input id="deadline-input" className="form-input" type="date"
                    value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} />
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button id="submit-btn" type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    <Brain size={15} /> AI bilan saqlash va klassifikatsiya
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => window.history.back()}>Bekor qilish</button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
