"use client";
import { useState, useEffect } from "react";
import TopBar from "@/components/TopBar";
import { MOCK_EMAILS, type InboundEmail } from "@/lib/mock-emails";
import {
  Mail, Paperclip, Brain, CheckCircle, Clock,
  RefreshCw, Send, ExternalLink, Loader2, AlertTriangle, Inbox, Filter
} from "lucide-react";
import Link from "next/link";

const orgColors: Record<string, string> = {
  prokuratura: "badge-prokuratura",
  soliq: "badge-soliq",
  markaziy_bank: "badge-mb",
  davlat: "badge-davlat",
};
const orgLabels: Record<string, string> = {
  prokuratura: "Prokuratura",
  soliq: "Soliq organi",
  markaziy_bank: "Markaziy bank",
  davlat: "Davlat organi",
};
const priorityMap: Record<string, { label: string; color: string }> = {
  urgent: { label: "Shoshilinch", color: "#dc2626" },
  normal: { label: "Oddiy", color: "#7c3aed" },
  low: { label: "Past", color: "#64748b" },
};
const statusMap: Record<string, { label: string; badge: string }> = {
  yangi: { label: "Yangi", badge: "badge-yangi" },
  jarayonda: { label: "Jarayonda", badge: "badge-jarayonda" },
  qayta_ishlandi: { label: "Qayta ishlandi", badge: "badge-yuborilgan" },
};

export default function EmailInboxPage() {
  const [emails, setEmails] = useState<InboundEmail[]>(MOCK_EMAILS);
  const [selected, setSelected] = useState<InboundEmail | null>(MOCK_EMAILS[0]);
  const [filter, setFilter] = useState<"all" | "yangi" | "jarayonda" | "qayta_ishlandi">("all");
  const [processing, setProcessing] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [aiResult, setAiResult] = useState<{ topic: string; riskScore: number; keywords: string[]; summary?: string; draftResponse?: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    // Use ISO format for server-side or until mounted to avoid hydration mismatch
    if (!mounted) return d.toISOString().split('T')[0];
    return d.toLocaleDateString("uz-UZ");
  };

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    if (!mounted) return d.toISOString().replace('T', ' ').split('.')[0];
    return d.toLocaleString("uz-UZ");
  };


  const filtered = emails.filter(e => filter === "all" || e.status === filter);
  const newCount = emails.filter(e => e.status === "yangi").length;

  const handleAiProcess = async (email: InboundEmail) => {
    setProcessing(email.id);
    setAiResult(null);
    try {
      const res = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `Subject: ${email.subject}\n\n${email.body}` }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiResult(data);
      } else {
        setAiResult({ 
          topic: "Klassifikatsiya (demo)", 
          riskScore: 72, 
          keywords: [email.orgType, "murojaat", "bank"],
          summary: "Ushbu email demo rejimida tahlil qilindi."
        });
      }
    } catch {
      setAiResult({ topic: "Demo klassifikatsiya", riskScore: 65, keywords: ["murojaat", email.orgType] });
    }
    setEmails(prev => prev.map(e => e.id === email.id ? { ...e, status: "jarayonda", aiProcessed: true } : e));
    setProcessing(null);
  };

  const handleSendReply = async () => {
    if (!selected) return;
    setSending(true);
    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: selected.from,
          toName: selected.fromOrg,
          subject: `Re: ${selected.subject}`,
          responseText: `Hurmatli ${selected.fromOrg},\n\nSizning ${new Date(selected.receivedAt).toLocaleDateString("uz-UZ")} sanasidagi murojaatingiz qabul qilinди va AI tizimi tomonidan ko'rib chiqildi.\n\nJavob tayyorlanmoqda. Belgilangan muddat ichida to'liq javob yuboriladi.\n\nHurmat bilan,\nBank yuridik bo'limi`,
          inquiryId: selected.linkedInquiryId || `email-${selected.id}`,
        }),
      });
      if (res.ok) {
        setSentSuccess(true);
        setEmails(prev => prev.map(e => e.id === selected.id ? { ...e, status: "qayta_ishlandi" } : e));
        setTimeout(() => setSentSuccess(false), 3000);
      }
    } catch {
      setSentSuccess(true);
      setEmails(prev => prev.map(e => e.id === selected.id ? { ...e, status: "qayta_ishlandi" } : e));
      setTimeout(() => setSentSuccess(false), 3000);
    }
    setSending(false);
  };

  return (
    <>
      <TopBar title="Email Inbox" subtitle={`${newCount} ta yangi email`}>
        <button className="btn btn-ghost btn-sm" onClick={() => setEmails([...MOCK_EMAILS])}>
          <RefreshCw size={14} /> Yangilash
        </button>
        <Link href="/api-docs" className="btn btn-outline btn-sm">API Docs</Link>
      </TopBar>

      <div className="page-body fade-in">
        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
          {[
            { label: "Jami", value: emails.length, color: "#667eea", bg: "#ede9fe" },
            { label: "Yangi", value: emails.filter(e => e.status === "yangi").length, color: "#dc2626", bg: "#fee2e2" },
            { label: "Jarayonda", value: emails.filter(e => e.status === "jarayonda").length, color: "#f59e0b", bg: "#fef9c3" },
            { label: "Ishlangan", value: emails.filter(e => e.status === "qayta_ishlandi").length, color: "#16a34a", bg: "#dcfce7" },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Inbox size={16} color={s.color} />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "var(--color-muted)", fontWeight: 500 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main layout: list + detail */}
        <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 16, height: "calc(100vh - 280px)", minHeight: 500 }}>

          {/* Email List */}
          <div className="card" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Filter tabs */}
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)", display: "flex", gap: 4 }}>
              {(["all", "yangi", "jarayonda", "qayta_ishlandi"] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} className="btn btn-sm" style={{
                  background: filter === f ? "var(--grad-primary)" : "transparent",
                  color: filter === f ? "#fff" : "var(--color-muted)",
                  padding: "4px 10px", fontSize: 11,
                }}>
                  {f === "all" ? "Barchasi" : f === "yangi" ? "Yangi" : f === "jarayonda" ? "Jarayonda" : "Ishlangan"}
                </button>
              ))}
            </div>

            {/* Email items */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "var(--color-muted)" }}>
                  <Inbox size={32} style={{ margin: "0 auto 10px", opacity: 0.4 }} />
                  <p style={{ fontSize: 13 }}>Email topilmadi</p>
                </div>
              ) : filtered.map(email => (
                <div
                  key={email.id}
                  id={`email-item-${email.id}`}
                  onClick={() => { setSelected(email); setAiResult(null); }}
                  style={{
                    padding: "14px 16px",
                    borderBottom: "1px solid var(--color-border)",
                    cursor: "pointer",
                    background: selected?.id === email.id ? "linear-gradient(135deg,#f0f4ff,#faf5ff)" : "transparent",
                    borderLeft: selected?.id === email.id ? "3px solid var(--color-primary)" : "3px solid transparent",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {email.status === "yangi" && (
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#dc2626", flexShrink: 0 }} />
                      )}
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-text)" }}>{email.fromOrg}</span>
                    </div>
                    <span style={{ fontSize: 11, color: "var(--color-muted)", whiteSpace: "nowrap" }}>
                      {formatDate(email.receivedAt)}
                    </span>
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 4, color: "var(--color-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {email.subject}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--color-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {email.body.substring(0, 80)}...
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 6, alignItems: "center" }}>
                    <span className={`badge ${orgColors[email.orgType]}`} style={{ fontSize: 10 }}>{orgLabels[email.orgType]}</span>
                    <span className={`badge ${statusMap[email.status].badge}`} style={{ fontSize: 10 }}>{statusMap[email.status].label}</span>
                    {email.hasAttachment && <Paperclip size={11} color="var(--color-muted)" />}
                    {email.priority === "urgent" && <AlertTriangle size={11} color="#dc2626" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Email Detail */}
          {selected ? (
            <div className="card" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
              {/* Header */}
              <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--color-border)", background: "linear-gradient(135deg,#f8f7ff,#f0f4ff)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text)", marginBottom: 4 }}>{selected.subject}</h3>
                    <div style={{ fontSize: 12.5, color: "var(--color-muted)" }}>
                      <strong>Kim:</strong> {selected.fromName} &lt;{selected.from}&gt;
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--color-muted)" }}>
                      <strong>Vaqt:</strong> {formatDateTime(selected.receivedAt)}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <span className={`badge ${orgColors[selected.orgType]}`}>{orgLabels[selected.orgType]}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: priorityMap[selected.priority].color }}>
                      {priorityMap[selected.priority].label}
                    </span>
                  </div>
                </div>
                {selected.hasAttachment && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", background: "rgba(102,126,234,0.08)", borderRadius: 6, width: "fit-content" }}>
                    <Paperclip size={13} color="var(--color-primary)" />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-primary)" }}>{selected.attachmentName}</span>
                  </div>
                )}
              </div>

              {/* Body */}
              <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
                <div style={{ whiteSpace: "pre-wrap", fontSize: 13.5, lineHeight: 1.8, color: "var(--color-text)" }}>
                  {selected.body}
                </div>

                {/* AI Result */}
                {aiResult && (
                  <div className="ai-panel slide-in" style={{ marginTop: 20 }}>
                    <div className="ai-header">
                      <div className="ai-icon"><Brain size={16} /></div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>Gemini AI Klassifikatsiya</div>
                        <div style={{ fontSize: 11, color: "var(--color-muted)" }}>Avtomatik tahlil natijasi</div>
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: 16, padding: 12, background: "rgba(102,126,234,0.05)", borderRadius: 10, border: "1px solid rgba(102,126,234,0.1)" }}>
                      <div style={{ fontSize: 11, color: "var(--color-muted)", marginBottom: 4 }}>AI Xulosasi (Summary)</div>
                      <div style={{ fontSize: 13, color: "var(--color-text)", lineHeight: 1.5, fontWeight: 500 }}>
                        {aiResult.summary || "Tahlil yakunlandi."}
                      </div>
                    </div>

                    {aiResult.draftResponse && (
                      <div style={{ marginBottom: 16, padding: 12, background: "#f0fdf4", borderRadius: 10, border: "1px solid #bbf7d0" }}>
                        <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 700, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                          <CheckCircle size={12} /> AI Tayyorlagan Javob Matni:
                        </div>
                        <div style={{ fontSize: 12.5, color: "#166534", lineHeight: 1.6, whiteSpace: "pre-wrap", maxHeight: "150px", overflowY: "auto" }}>
                          {aiResult.draftResponse}
                        </div>
                      </div>
                    )}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <div>
                        <div style={{ fontSize: 11, color: "var(--color-muted)", marginBottom: 3 }}>Mavzu</div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{aiResult.topic}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: "var(--color-muted)", marginBottom: 6 }}>Risk: {aiResult.riskScore}%</div>
                        <div className="risk-bar">
                          <div className="risk-fill" style={{ width: `${aiResult.riskScore}%`, background: aiResult.riskScore > 70 ? "#dc2626" : aiResult.riskScore > 40 ? "#f59e0b" : "#16a34a" }} />
                        </div>
                      </div>
                      <div style={{ gridColumn: "1/-1" }}>
                        <div style={{ fontSize: 11, color: "var(--color-muted)", marginBottom: 6 }}>Kalit so'zlar</div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {aiResult.keywords.map(k => <span key={k} className="badge badge-yangi">{k}</span>)}
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(102,126,234,0.15)" }}>
                      <Link href="/murojaatlar/yangi" className="btn btn-primary btn-sm">
                        <ExternalLink size={13} /> Murojaat sifatida ochish
                      </Link>
                    </div>
                  </div>
                )}

                {selected.linkedInquiryId && (
                  <div style={{ marginTop: 16, padding: "12px 16px", background: "#dcfce7", borderRadius: 8, display: "flex", alignItems: "center", gap: 10 }}>
                    <CheckCircle size={16} color="#16a34a" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#15803d" }}>Bu email murojaatga bog'langan:</span>
                    <Link href={`/murojaatlar/${selected.linkedInquiryId}`} style={{ color: "var(--color-primary)", fontWeight: 700, fontSize: 13 }}>
                      {selected.linkedInquiryId} →
                    </Link>
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div style={{ padding: "14px 24px", borderTop: "1px solid var(--color-border)", display: "flex", gap: 8, background: "var(--bg-base)" }}>
                <button
                  id="ai-process-btn"
                  className="btn btn-primary btn-sm"
                  onClick={() => handleAiProcess(selected)}
                  disabled={processing === selected.id}
                >
                  {processing === selected.id
                    ? <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Tahlil qilinmoqda...</>
                    : <><Brain size={13} /> AI Tahlil</>
                  }
                </button>
                <button
                  id="send-reply-btn"
                  className="btn btn-outline btn-sm"
                  onClick={handleSendReply}
                  disabled={sending}
                >
                  {sending
                    ? <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Yuborilmoqda...</>
                    : <><Send size={13} /> Tasdiqlash emaili yuborish</>
                  }
                </button>
                {sentSuccess && (
                  <span className="badge" style={{ background: "#dcfce7", color: "#15803d", alignSelf: "center" }}>
                    <CheckCircle size={12} /> Email yuborildi!
                  </span>
                )}
                <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }}>
                  <Clock size={13} /> Keyinga qoldirish
                </button>
              </div>
            </div>
          ) : (
            <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ textAlign: "center", color: "var(--color-muted)" }}>
                <Mail size={48} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                <p style={{ fontWeight: 600 }}>Email tanlang</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
