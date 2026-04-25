"use client";
import TopBar from "@/components/TopBar";
import { Copy, CheckCircle } from "lucide-react";
import { useState } from "react";

function CodeBlock({ code, language = "json" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ position: "relative", background: "#0f172a", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 16px", background: "#1e293b" }}>
        <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>{language}</span>
        <button onClick={handleCopy} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
          {copied ? <CheckCircle size={13} color="#16a34a" /> : <Copy size={13} />}
          {copied ? "Nusxalandi!" : "Nusxalash"}
        </button>
      </div>
      <pre style={{ padding: "16px", margin: 0, fontSize: 12.5, lineHeight: 1.6, color: "#e2e8f0", overflowX: "auto", fontFamily: "monospace" }}>
        {code}
      </pre>
    </div>
  );
}

function Section({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="card-header">
        <span className="card-title">{title}</span>
        {badge && <span className="badge badge-yangi" style={{ fontSize: 11 }}>{badge}</span>}
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}

export default function ApiDocsPage() {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://yourdomain.com";

  return (
    <>
      <TopBar title="API Hujjatlar" subtitle="Tashqi tizim integratsiyasi uchun" />
      <div className="page-body fade-in">
        <div className="grad-header" style={{ background: "linear-gradient(135deg,#0f172a,#1e3a5f)" }}>
          <h1>🔗 AI Murojaat Tizimi — API</h1>
          <p>Markaziy bank, Soliq portali va boshqa tizimlar uchun integratsiya hujjatlari</p>
          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <span className="badge" style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}>REST API</span>
            <span className="badge" style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}>JSON</span>
            <span className="badge" style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}>API Key Auth</span>
            <span className="badge" style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}>Email Webhook</span>
          </div>
        </div>

        <div style={{ maxWidth: 860, margin: "0 auto" }}>

          {/* Authentication */}
          <Section title="🔑 Autentifikatsiya">
            <p style={{ fontSize: 13.5, color: "var(--color-muted)", marginBottom: 14 }}>
              Barcha API so'rovlarda <code style={{ background: "#f0f4ff", padding: "2px 6px", borderRadius: 4 }}>X-API-Key</code> header jo'nating.
            </p>
            <CodeBlock language="http" code={`POST ${baseUrl}/api/webhook/inquiry HTTP/1.1
X-API-Key: your_api_key_here
Content-Type: application/json`} />
          </Section>

          {/* External Inquiry Webhook */}
          <Section title="📤 1. Tashqi Murojaat Yuborish" badge="POST /api/webhook/inquiry">
            <p style={{ fontSize: 13.5, color: "var(--color-muted)", marginBottom: 12 }}>
              Markaziy bank, Soliq portali yoki boshqa davlat tizimlari JSON formatida murojaat yuboradi.
              Avtomatik ravishda AI klassifikatsiya qilinadi.
            </p>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>So'rov (Request):</div>
            <CodeBlock code={`{
  "title": "Kapital etarliligi nisbati bo'yicha so'rov",
  "orgName": "O'zbekiston Respublikasi Markaziy banki",
  "orgEmail": "nazorat@cbu.uz",
  "description": "2024-yil I choragi uchun CAR, LCR, NSFR ko'rsatkichlarini taqdim eting.",
  "deadline": "2024-05-15",
  "priority": "urgent",
  "referenceNumber": "MB-2024-456"
}`} />
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, marginTop: 16 }}>Javob (Response — 201 Created):</div>
            <CodeBlock code={`{
  "success": true,
  "inquiryId": "INQ-API-1714000000000",
  "status": "yangi",
  "orgType": "markaziy_bank",
  "receivedAt": "2024-04-25T10:30:00.000Z",
  "referenceNumber": "MB-2024-456",
  "aiClassification": {
    "topic": "Prudensial nazorat / Kapital etarliligi",
    "riskScore": 78,
    "keywords": ["kapital", "CAR", "prudensial"]
  },
  "links": {
    "detail": "/murojaatlar/INQ-API-1714000000000"
  }
}`} />
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, marginTop: 16 }}>curl misoli:</div>
            <CodeBlock language="bash" code={`curl -X POST ${baseUrl}/api/webhook/inquiry \\
  -H "X-API-Key: your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Soliq tekshiruvi",
    "orgName": "Davlat Soliq Qo'\''mitasi",
    "orgEmail": "tekshiruv@soliq.gov.uz",
    "description": "2023-yil moliyaviy hisobot tekshiruvi.",
    "deadline": "2024-05-10",
    "priority": "normal"
  }'`} />
          </Section>

          {/* Email Webhook */}
          <Section title="📧 2. Email Webhook (SendGrid / Mailgun)" badge="POST /api/email/webhook">
            <p style={{ fontSize: 13.5, color: "var(--color-muted)", marginBottom: 14 }}>
              Email orqali kelgan murojaatlar avtomatik tizimga tushishi uchun email provayderida webhook sozlang.
            </p>
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 8 }}>SendGrid sozlash:</div>
                <ol style={{ fontSize: 13, color: "var(--color-muted)", lineHeight: 2, paddingLeft: 20 }}>
                  <li>SendGrid → Mail Settings → Inbound Parse</li>
                  <li>MX record qo'shing: <code style={{ background: "#f0f4ff", padding: "2px 6px", borderRadius: 4 }}>mx.sendgrid.net</code></li>
                  <li>Webhook URL: <code style={{ background: "#f0f4ff", padding: "2px 6px", borderRadius: 4 }}>{baseUrl}/api/email/webhook</code></li>
                </ol>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 8 }}>Mailgun sozlash:</div>
                <ol style={{ fontSize: 13, color: "var(--color-muted)", lineHeight: 2, paddingLeft: 20 }}>
                  <li>Mailgun → Receiving → Routes</li>
                  <li>Filter: <code style={{ background: "#f0f4ff", padding: "2px 6px", borderRadius: 4 }}>match_recipient("info@yourbank.uz")</code></li>
                  <li>Action: <code style={{ background: "#f0f4ff", padding: "2px 6px", borderRadius: 4 }}>{`forward("${baseUrl}/api/email/webhook")`}</code></li>
                </ol>
              </div>
              <CodeBlock code={`// Webhook qabul qilish formati (SendGrid)
POST /api/email/webhook
Content-Type: multipart/form-data

from: "Prokuratura <info@prokuratura.gov.uz>"
to: "info@yourbank.uz"
subject: "So'rov №45/2024"
text: "Hurmatli bank rahbariyati..."

// Avtomatik AI tahlil qilinadi va Inbox ga tushadi`} />
            </div>
          </Section>

          {/* Send Email */}
          <Section title="📨 3. Javob Email Yuborish" badge="POST /api/email/send">
            <p style={{ fontSize: 13.5, color: "var(--color-muted)", marginBottom: 12 }}>
              AI tomonidan tayyorlangan javobni tasdiqlangandan so'ng email orqali yuborish.
            </p>
            <CodeBlock code={`{
  "to": "info@prokuratura.gov.uz",
  "toName": "Toshkent shahar prokuraturasi",
  "subject": "Re: So'rov №45/2024 — Bank javobi",
  "responseText": "Hurmatli prokuratura...\\n\\nJavob matni...",
  "inquiryId": "INQ-2024-001"
}`} />
            <CodeBlock language="bash" code={`curl -X POST ${baseUrl}/api/email/send \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "info@prokuratura.gov.uz",
    "toName": "Toshkent shahar prokuraturasi",
    "subject": "Re: So'\''rov №45/2024",
    "responseText": "Hurmatli prokuratura...",
    "inquiryId": "INQ-2024-001"
  }'`} />
          </Section>

          {/* Error Codes */}
          <Section title="⚠️ Xato Kodlari">
            <table className="data-table">
              <thead><tr><th>Kod</th><th>Ma'no</th><th>Sabab</th></tr></thead>
              <tbody>
                {[
                  ["200", "OK", "Muvaffaqiyatli"],
                  ["201", "Created", "Yangi murojaat yaratildi"],
                  ["400", "Bad Request", "Majburiy maydon yetishmayapti"],
                  ["401", "Unauthorized", "API key noto'g'ri yoki yo'q"],
                  ["500", "Server Error", "Ichki xato"],
                ].map(([code, name, desc]) => (
                  <tr key={code}>
                    <td><span className={`badge ${code === "200" || code === "201" ? "badge-yuborilgan" : code === "400" ? "badge-orta" : code === "401" ? "badge-prokuratura" : "badge-rad"}`}>{code}</span></td>
                    <td style={{ fontWeight: 600 }}>{name}</td>
                    <td style={{ color: "var(--color-muted)", fontSize: 13 }}>{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        </div>
      </div>
    </>
  );
}
