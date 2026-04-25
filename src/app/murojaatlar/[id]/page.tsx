"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import { ORG_LABELS, STATUS_LABELS, MOCK_LEGAL_DOCS } from "@/lib/mock-data";
import { Brain, CheckCircle, XCircle, Edit3, Send, Clock, Shield, ChevronLeft, Loader2, AlertTriangle, BookOpen, X, Volume2, Play, Square } from "lucide-react";

type AuditEntry = { id: string; timestamp: string; action: string; userName: string; userRole: string; details: string };
type InquiryData = {
  id: string; displayId: string; title: string; orgType: string; orgName: string;
  orgEmail: string; status: string; riskLevel: string; aiRiskScore: number;
  deadline: string; receivedDate: string; description: string; topic: string;
  aiResponse: string; aiKeywords: string; aiSummary: string; aiMissingDocs: string; compliancePassed: boolean;
  complianceIssues: string; complianceLaws: string; version: number;
  fileName: string;
  auditEntries: AuditEntry[];
  assignedTo?: { name: string };
};



export default function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [inquiry, setInquiry] = useState<InquiryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"detail" | "ai" | "audit">("detail");
  const [generating, setGenerating] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [generated, setGenerated] = useState(false);
  const [checking, setChecking] = useState(false);
  const [complianceResult, setComplianceResult] = useState<{ passed: boolean; issues: string[]; laws: string[] } | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    fetch(`/api/inquiries/${id}`)
      .then(r => r.json())
      .then(data => {
        setInquiry(data);
        if (data.aiResponse) { setAiResponse(data.aiResponse); setGenerated(true); }
        if (data.compliancePassed !== undefined) {
          setComplianceResult({
            passed: data.compliancePassed,
            issues: safeJSON(data.complianceIssues, []),
            laws: safeJSON(data.complianceLaws, []),
          });
        }
        if (data.status === "yuborilgan") setSendSuccess(true);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleSpeak = () => {
    if (!inquiry?.aiSummary) return;
    
    if (isSpeaking) {
      // Har ikki turdagi ovozni ham to'xtatish
      const audio = document.getElementById("ai-audio-element") as HTMLAudioElement;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Google Translate TTS (uz-UZ) - Barqarorroq parametr bilan
    const text = encodeURIComponent(inquiry.aiSummary);
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${text}&tl=uz&client=gtx`;
    
    let audio = document.getElementById("ai-audio-element") as HTMLAudioElement;
    if (!audio) {
      audio = document.createElement("audio");
      audio.id = "ai-audio-element";
      document.body.appendChild(audio);
    }
    
    audio.src = url;
    audio.onended = () => setIsSpeaking(false);
    
    // Agar Google TTS ishlamay qolsa, standart brauzer ovoziga o'tish (Fallback)
    audio.onerror = () => {
      console.warn("Google TTS xatosi, brauzer ovoziga o'tilmoqda...");
      const utterance = new SpeechSynthesisUtterance(inquiry.aiSummary);
      utterance.lang = "tr-TR"; // O'zbekchaga yaqinroq turkcha aksent
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    };
    
    setIsSpeaking(true);
    audio.play().catch(() => {
      // Audio play rad etilsa (masalan, CORS), brauzer ovozidan foydalanamiz
      const utterance = new SpeechSynthesisUtterance(inquiry.aiSummary);
      utterance.lang = "tr-TR";
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    });
  };

  const safeJSON = <T,>(str: string, fallback: T): T => {
    try { return JSON.parse(str); } catch { return fallback; }
  };

  const refetch = async () => {
    const res = await fetch(`/api/inquiries/${id}`);
    const data = await res.json();
    setInquiry(data);
  };

  const handleGenerate = async () => {
    if (!inquiry) return;
    setGenerating(true); setGenerated(false);
    const relevantLaws = MOCK_LEGAL_DOCS.filter(d => d.relevantOrgs.includes(inquiry.orgType as never));
    try {
      const res = await fetch("/api/generate-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inquiryText: inquiry.description,
          orgName: inquiry.orgName, orgType: inquiry.orgType, topic: inquiry.topic,
          laws: relevantLaws.map(l => `${l.title} (${l.number})`),
          inquiryId: inquiry.displayId,
        }),
      });
      if (res.ok) { const data = await res.json(); setAiResponse(data.response || ""); }
      else { setAiResponse(`${inquiry.orgName}ga,\n\nSizning murojaatingiz qabul qilindi.\n\nHurmat bilan,\nBank rahbariyati`); }
    } catch { setAiResponse(`${inquiry.orgName}ga,\n\nSizning murojaatingiz qabul qilindi.\n\nHurmat bilan,\nBank rahbariyati`); }
    setGenerating(false); setGenerated(true);
  };

  const handleComplianceCheck = async () => {
    if (!inquiry) return;
    setChecking(true);
    try {
      const res = await fetch("/api/compliance-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responseText: aiResponse, orgType: inquiry.orgType, inquiryId: inquiry.displayId }),
      });
      if (res.ok) {
        const data = await res.json();
        setComplianceResult({ passed: data.passed, issues: data.issues || [], laws: data.suggestions || [] });
      }
    } catch { /* ignore */ }
    setChecking(false);
  };

  const handleSave = async () => {
    if (!inquiry) return;
    await fetch(`/api/inquiries/${inquiry.displayId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aiResponse, auditAction: "Javob tahrirlandi", auditDetails: "Operator tomonidan qo'lda tahrirlandi" }),
    });
    await refetch();
  };

  const handleSend = async () => {
    if (!inquiry || !aiResponse) return;
    setSending(true);
    try {
      const res = await fetch(`/api/inquiries/${inquiry.displayId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        setSendSuccess(true);
        await refetch();
      } else {
        const err = await res.json();
        alert(err.error || "Yuborishda xatolik");
      }
    } catch { alert("Tarmoq xatoligi"); }
    setSending(false);
  };

  const handleReject = async () => {
    if (!inquiry) return;
    setRejecting(true);
    try {
      const res = await fetch(`/api/inquiries/${inquiry.displayId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason || "Sabab ko'rsatilmagan" }),
      });
      if (res.ok) {
        setShowRejectModal(false);
        await refetch();
      }
    } catch { /* ignore */ }
    setRejecting(false);
  };

  if (loading) return (
    <>
      <TopBar title="..." subtitle="Yuklanmoqda..." />
      <div className="page-body" style={{ display: "flex", justifyContent: "center", padding: 80 }}>
        <Loader2 size={36} style={{ color: "var(--color-primary)", animation: "spin 1s linear infinite" }} />
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes wave {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
      `}</style>
    </>
  );

  if (!inquiry) return (
    <div className="page-body" style={{ textAlign: "center", paddingTop: 60 }}>
      <p style={{ fontSize: 18, fontWeight: 600 }}>Murojaat topilmadi</p>
      <Link href="/murojaatlar" className="btn btn-primary" style={{ marginTop: 16, display: "inline-flex" }}>← Orqaga</Link>
    </div>
  );

  const relevantLaws = MOCK_LEGAL_DOCS.filter(d => d.relevantOrgs.includes(inquiry.orgType as never));
  const riskColor = inquiry.riskLevel === "yuqori" ? "#dc2626" : inquiry.riskLevel === "o'rta" || inquiry.riskLevel === "oʻrta" ? "#f59e0b" : "#16a34a";
  const riskScore = inquiry.aiRiskScore || 50;
  const isRejected = inquiry.status === "rad_etilgan";
  const isSent = inquiry.status === "yuborilgan";

  return (
    <>
      {/* Reject Modal */}
      {showRejectModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="card" style={{ width: 420, padding: 0 }}>
            <div className="card-header">
              <span className="card-title" style={{ color: "#dc2626" }}><XCircle size={16} style={{ display: "inline", marginRight: 6 }} />Rad etish sababi</span>
              <button onClick={() => setShowRejectModal(false)} className="btn btn-ghost btn-icon btn-sm"><X size={14} /></button>
            </div>
            <div className="card-body">
              <textarea className="form-input" rows={4} placeholder="Rad etish sababini kiriting..."
                value={rejectReason} onChange={e => setRejectReason(e.target.value)} style={{ resize: "vertical" }} />
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={handleReject} disabled={rejecting}>
                  {rejecting ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <XCircle size={13} />} Rad etish
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => setShowRejectModal(false)}>Bekor qilish</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <TopBar title={inquiry.displayId} subtitle={inquiry.title}>
        <Link href="/murojaatlar" className="btn btn-ghost btn-sm"><ChevronLeft size={15} /> Orqaga</Link>
      </TopBar>

      <div className="page-body fade-in">
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <span className={`badge badge-${inquiry.orgType === "markaziy_bank" ? "mb" : inquiry.orgType}`}>
            {ORG_LABELS[inquiry.orgType as keyof typeof ORG_LABELS]}
          </span>
          <span className={`badge badge-${inquiry.status === "rad_etilgan" ? "rad" : inquiry.status}`}>
            {STATUS_LABELS[inquiry.status as keyof typeof STATUS_LABELS] || inquiry.status}
          </span>
          <span style={{ fontSize: 13, color: riskColor, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
            <AlertTriangle size={13} /> Risk: {riskScore}%
          </span>
          {inquiry.orgEmail && (
            <span style={{ fontSize: 13, color: "var(--color-muted)", display: "flex", alignItems: "center", gap: 4 }}>
              📧 {inquiry.orgEmail}
            </span>
          )}
          <span style={{ fontSize: 13, color: "var(--color-muted)", marginLeft: "auto" }}>
            <Clock size={13} style={{ display: "inline" }} /> Muddat: <strong>{inquiry.deadline}</strong>
          </span>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "var(--bg-surface)", padding: 4, borderRadius: 10, width: "fit-content", border: "1px solid var(--color-border)" }}>
          {(["detail", "ai", "audit"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} id={`tab-${t}`} className="btn btn-sm" style={{
              background: tab === t ? "var(--grad-primary)" : "transparent",
              color: tab === t ? "#fff" : "var(--color-muted)",
              boxShadow: tab === t ? "0 2px 8px rgba(102,126,234,0.3)" : "none",
            }}>
              {t === "detail" ? "📋 Ma'lumotlar" : t === "ai" ? "🤖 AI Javob" : "📜 Audit"}
            </button>
          ))}
        </div>

        {tab === "detail" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
            <div className="card">
              <div className="card-header"><span className="card-title">Murojaat tafsilotlari</span></div>
              <div className="card-body" style={{ display: "grid", gap: 16 }}>
                <div><div style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 4 }}>Tashkilot</div><div style={{ fontWeight: 600 }}>{inquiry.orgName}</div></div>
                <div><div style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 4 }}>Email</div><div style={{ fontWeight: 600 }}>{inquiry.orgEmail || "Ko'rsatilmagan"}</div></div>
                <div><div style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 4 }}>Mavzu</div><div style={{ fontWeight: 600 }}>{inquiry.title}</div></div>
                <div><div style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 4 }}>Tavsif</div><div style={{ fontSize: 13.5, lineHeight: 1.6 }}>{inquiry.description}</div></div>
                
                {inquiry.fileName && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 8 }}>Biriktirilgan fayllar</div>
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: 12, 
                      padding: "10px 14px", 
                      background: "var(--bg-base)", 
                      borderRadius: 10, 
                      border: "1px solid var(--color-border)",
                      width: "fit-content"
                    }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(102,126,234,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)" }}>
                        <BookOpen size={16} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{inquiry.fileName}</span>
                        <span style={{ fontSize: 11, color: "var(--color-muted)" }}>{(Math.random() * 5 + 1).toFixed(1)} MB • PDF Hujjat</span>
                      </div>
                      <button className="btn btn-ghost btn-sm btn-icon" style={{ marginLeft: 12 }}>
                        <Clock size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {inquiry.aiKeywords && safeJSON<string[]>(inquiry.aiKeywords, []).length > 0 && (
                  <div className="ai-panel">
                    <div className="ai-header" style={{ marginBottom: 12 }}>
                      <div className="ai-icon"><Brain size={16} /></div>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>AI Klassifikatsiya</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                      {safeJSON<string[]>(inquiry.aiKeywords, []).map(k => <span key={k} className="badge badge-yangi">{k}</span>)}
                    </div>
                    {inquiry.aiSummary && (
                      <div style={{ position: "relative", padding: "12px 16px", background: "rgba(102,126,234,0.06)", borderRadius: 12, borderLeft: "4px solid var(--color-primary)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                          <strong style={{ fontSize: 13, color: "var(--color-primary)" }}>AI Xulosasi (Audio):</strong>
                          <button onClick={handleSpeak} className="btn btn-primary btn-sm btn-icon" style={{ borderRadius: "50%", width: 32, height: 32, padding: 0 }}>
                            {isSpeaking ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" style={{ marginLeft: 2 }} />}
                          </button>
                        </div>
                        <div style={{ fontSize: 13.5, color: "var(--color-text)", lineHeight: 1.6 }}>
                          {inquiry.aiSummary}
                        </div>
                        {isSpeaking && (
                          <div style={{ display: "flex", gap: 3, marginTop: 10, height: 16, alignItems: "flex-end" }}>
                            {[...Array(12)].map((_, i) => (
                              <div key={i} style={{ 
                                width: 3, 
                                background: "var(--color-primary)", 
                                borderRadius: 1,
                                height: "100%",
                                animation: `wave 0.8s ease-in-out infinite ${i * 0.1}s` 
                              }} />
                            ))}
                          </div>
                        )}
                        {inquiry.aiMissingDocs && safeJSON<string[]>(inquiry.aiMissingDocs, []).length > 0 && (
                          <div style={{ marginTop: 12, padding: "12px", background: "rgba(245,158,11,0.08)", borderRadius: 10, border: "1px solid rgba(245,158,11,0.2)" }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#b45309", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                              <AlertTriangle size={14} /> ⚠️ Kerakli qo'shimcha hujjatlar:
                            </div>
                            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12.5, color: "#92400e" }}>
                              {safeJSON<string[]>(inquiry.aiMissingDocs, []).map((doc, i) => (
                                <li key={i}>{doc}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="card">
                <div className="card-header"><span className="card-title">Risk tahlili</span></div>
                <div className="card-body">
                  <div style={{ textAlign: "center", marginBottom: 12 }}>
                    <div style={{ fontSize: 36, fontWeight: 800, color: riskColor }}>{riskScore}%</div>
                    <div style={{ fontSize: 12, color: "var(--color-muted)" }}>Risk darajasi</div>
                  </div>
                  <div className="risk-bar"><div className="risk-fill" style={{ width: `${riskScore}%`, background: riskColor }} /></div>
                </div>
              </div>
              <div className="card">
                <div className="card-header"><span className="card-title"><BookOpen size={14} style={{ display: "inline", marginRight: 4 }} /> Qonuniy asoslar</span></div>
                <div className="card-body" style={{ paddingTop: 12 }}>
                  {relevantLaws.map(law => (
                    <div key={law.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--color-border)" }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600 }}>{law.title}</div>
                      <div style={{ fontSize: 11, color: "var(--color-muted)", marginTop: 2 }}>{law.number} • {law.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "ai" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
            <div className="card">
              <div className="card-header">
                <span className="card-title">🤖 AI Javob Generatsiyasi</span>
                {!generated && !isSent && !isRejected && (
                  <button id="generate-btn" className="btn btn-primary btn-sm" onClick={handleGenerate} disabled={generating}>
                    {generating ? <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Generatsiya...</> : <><Brain size={13} /> Javob yaratish</>}
                  </button>
                )}
              </div>
              <div className="card-body">
                {!generated && !generating && (
                  <div className="ai-panel" style={{ textAlign: "center", padding: 40 }}>
                    <Brain size={40} style={{ color: "var(--color-primary)", margin: "0 auto 12px" }} />
                    <p style={{ fontWeight: 600, marginBottom: 6 }}>AI javob tayyorlash uchun</p>
                    <p style={{ fontSize: 13, color: "var(--color-muted)" }}>Yuqoridagi &quot;Javob yaratish&quot; tugmasini bosing</p>
                  </div>
                )}
                {generating && (
                  <div style={{ textAlign: "center", padding: 40 }}>
                    <div className="ai-typing" style={{ justifyContent: "center", marginBottom: 16 }}>
                      <div className="ai-dot" /><div className="ai-dot" /><div className="ai-dot" />
                    </div>
                    <p style={{ fontWeight: 600 }}>Gemini AI javob tayyorlamoqda...</p>
                    <p style={{ fontSize: 13, color: "var(--color-muted)", marginTop: 4 }}>Qonunchilik bazasidan ma&apos;lumot olinmoqda</p>
                  </div>
                )}
                {generated && (
                  <div className="slide-in">
                    {editMode ? (
                      <textarea className="form-input" rows={14} value={aiResponse}
                        onChange={e => setAiResponse(e.target.value)}
                        style={{ resize: "vertical", fontSize: 13.5, lineHeight: 1.7 }} id="ai-response-textarea" />
                    ) : (
                      <div style={{ whiteSpace: "pre-wrap", fontSize: 13.5, lineHeight: 1.8, padding: "16px", background: "var(--bg-base)", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}>
                        {aiResponse}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
                      {!isSent && !isRejected && (
                        <>
                          <button id="edit-toggle-btn" className="btn btn-outline btn-sm" onClick={async () => { if (editMode) await handleSave(); setEditMode(p => !p); }}>
                            <Edit3 size={13} /> {editMode ? "Saqlash" : "Tahrirlash"}
                          </button>
                          <button id="compliance-btn" className="btn btn-ghost btn-sm" onClick={handleComplianceCheck} disabled={checking}>
                            {checking ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Shield size={13} />} Compliance
                          </button>
                          <button id="regenerate-btn" className="btn btn-ghost btn-sm" onClick={handleGenerate}>
                            <Brain size={13} /> Qayta yaratish
                          </button>
                          <button id="reject-btn" className="btn btn-danger btn-sm" onClick={() => setShowRejectModal(true)}>
                            <XCircle size={13} /> Rad etish
                          </button>
                          <button id="send-btn" className="btn btn-success btn-sm" style={{ marginLeft: "auto" }} onClick={handleSend} disabled={sending}>
                            {sending ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={13} />}
                            {sending ? "Yuborilmoqda..." : "Yuborish"}
                          </button>
                        </>
                      )}
                      {isSent && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#16a34a", fontWeight: 600, fontSize: 13 }}>
                          <CheckCircle size={16} /> Javob {inquiry.orgEmail || "tashkilotga"} yuborildi
                        </div>
                      )}
                      {isRejected && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#dc2626", fontWeight: 600, fontSize: 13 }}>
                          <XCircle size={16} /> Murojaat rad etildi
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {complianceResult && (
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">
                      {complianceResult.passed ? <CheckCircle size={15} color="#16a34a" style={{ display: "inline", marginRight: 4 }} /> : <XCircle size={15} color="#dc2626" style={{ display: "inline", marginRight: 4 }} />}
                      Compliance
                    </span>
                    <span className={`badge ${complianceResult.passed ? "compliance-passed" : "compliance-failed"}`}>
                      {complianceResult.passed ? "O'tdi ✓" : "Xatolik ✗"}
                    </span>
                  </div>
                  <div className="card-body" style={{ paddingTop: 12 }}>
                    {complianceResult.issues && complianceResult.issues.length > 0 ? (
                      <div style={{ marginBottom: 16, padding: 12, background: "#fef2f2", borderRadius: 10, border: "1px solid #fee2e2" }}>
                        <div style={{ fontSize: 11, color: "#b91c1c", fontWeight: 700, marginBottom: 6 }}>Aniqlangan kamchiliklar:</div>
                        {complianceResult.issues.map((issue, i) => (
                          <div key={i} style={{ fontSize: 12.5, color: "#991b1b", marginBottom: 4, display: "flex", gap: 6, lineHeight: 1.5 }}>
                            <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 2 }} /> {issue}
                          </div>
                        ))}
                      </div>
                    ) : (
                      !complianceResult.passed && (
                        <div style={{ marginBottom: 16, padding: 12, background: "#fffbeb", borderRadius: 10, border: "1px solid #fef3c7", fontSize: 12.5, color: "#92400e" }}>
                          <AlertTriangle size={13} style={{ display: "inline", marginRight: 6 }} /> AI javobni shubhali deb topdi, lekin aniq sabab ko'rsatmadi.
                        </div>
                      )
                    )}
                    {complianceResult.laws && complianceResult.laws.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ fontSize: 11, color: "var(--color-muted)", marginBottom: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Tavsiya etilgan qonuniy asoslar:</div>
                        {complianceResult.laws.map((law, i) => (
                          <div key={i} style={{ 
                            fontSize: 12, 
                            color: "var(--color-primary)", 
                            background: "rgba(102,126,234,0.08)", 
                            padding: "8px 12px", 
                            borderRadius: 8, 
                            marginBottom: 6, 
                            lineHeight: 1.5,
                            border: "1px solid rgba(102,126,234,0.15)",
                            display: "flex",
                            gap: 8,
                            alignItems: "flex-start"
                          }}>
                            <BookOpen size={13} style={{ flexShrink: 0, marginTop: 3 }} />
                            <span>{law}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {sendSuccess && (
                <div className="card" style={{ border: "1.5px solid #16a34a" }}>
                  <div className="card-body" style={{ textAlign: "center", padding: 20 }}>
                    <CheckCircle size={32} color="#16a34a" style={{ margin: "0 auto 8px" }} />
                    <p style={{ fontWeight: 700, color: "#15803d" }}>Yuborildi!</p>
                    <p style={{ fontSize: 12, color: "var(--color-muted)" }}>{inquiry.orgEmail || inquiry.orgName}ga javob yuborildi</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "audit" && (
          <div className="card" style={{ maxWidth: 700 }}>
            <div className="card-header"><span className="card-title">📜 Audit Tarixi (v{inquiry.version})</span></div>
            <div className="card-body">
              <div className="timeline">
                {inquiry.auditEntries.map(entry => (
                  <div key={entry.id} className="timeline-item slide-in">
                    <div className="timeline-dot" />
                    <div className="timeline-time">{new Date(entry.timestamp).toLocaleString("uz-UZ")}</div>
                    <div className="timeline-action">{entry.action}</div>
                    <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 2 }}>
                      {entry.userName} • <span style={{ textTransform: "capitalize" }}>{entry.userRole}</span>
                    </div>
                    {entry.details && <div className="timeline-detail">{entry.details}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes wave {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
      `}</style>
    </>
  );
}
