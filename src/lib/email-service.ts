import nodemailer from "nodemailer";

// ─── SMTP Transporter ─────────────────────────────────────────────────────────

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false, // TLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// ─── Send Response Email ──────────────────────────────────────────────────────

export interface SendEmailOptions {
  to: string;
  toName: string;
  subject: string;
  body: string;
  inquiryId: string;
  attachmentPath?: string;
}

export async function sendResponseEmail(opts: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Demo rejimi: Agar SMTP ma'lumotlari kiritilmagan bo'lsa, yuborishni simulyatsiya qilamiz
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log("⚠️ SMTP sozlanmagan. Demo rejimida email simulyatsiya qilindi:", opts.to);
      return { success: true, messageId: "demo-id-" + Date.now() };
    }

    const transporter = createTransporter();

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Arial', sans-serif; color: #1e293b; line-height: 1.6; }
    .container { max-width: 680px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #667eea, #764ba2); padding: 24px 32px; border-radius: 10px 10px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 18px; }
    .header p { color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px; }
    .body { background: #fff; padding: 32px; border: 1px solid #e2e8f0; border-top: none; }
    .footer { background: #f8fafc; padding: 16px 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 10px 10px; font-size: 12px; color: #64748b; }
    .ref-badge { display: inline-block; background: #ede9fe; color: #6d28d9; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏛️ Rasmiy Javob</h1>
      <p>AI Murojaat Tizimi orqali tayyorlangan</p>
    </div>
    <div class="body">
      <span class="ref-badge">Murojaat raqami: ${opts.inquiryId}</span>
      <div>${opts.body.replace(/\n/g, "<br>")}</div>
    </div>
    <div class="footer">
      Bu xat AI yordamida tayyorlangan va mas'ul xodim tomonidan tasdiqlangan.
      Saqlaning: ${new Date().toLocaleDateString("uz-UZ")}
    </div>
  </div>
</body>
</html>`;

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `"AI Murojaat Tizimi" <${process.env.SMTP_USER}>`,
      to: `"${opts.toName}" <${opts.to}>`,
      subject: opts.subject,
      text: opts.body,
      html: htmlBody,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email yuborishda xato:", error);
    return { success: false, error: String(error) };
  }
}

// ─── Parse Inbound Email (from webhook payload) ───────────────────────────────

export interface ParsedEmail {
  from: string;
  fromName: string;
  subject: string;
  body: string;
  receivedAt: string;
  attachments: { filename: string; size: number }[];
}

export function parseInboundEmailPayload(payload: Record<string, string>): ParsedEmail {
  // SendGrid format
  if (payload.from && payload.text) {
    return {
      from: extractEmail(payload.from),
      fromName: extractName(payload.from),
      subject: payload.subject || "(Mavzusiz)",
      body: payload.text || payload.html?.replace(/<[^>]*>/g, "") || "",
      receivedAt: new Date().toISOString(),
      attachments: [],
    };
  }
  // Mailgun format
  if (payload.sender && payload["body-plain"]) {
    return {
      from: payload.sender,
      fromName: payload.From ? extractName(payload.From) : payload.sender,
      subject: payload.subject || "(Mavzusiz)",
      body: payload["body-plain"] || "",
      receivedAt: new Date().toISOString(),
      attachments: [],
    };
  }
  // Generic fallback
  return {
    from: payload.from || payload.sender || "unknown@example.com",
    fromName: payload.fromName || "Noma'lum",
    subject: payload.subject || "(Mavzusiz)",
    body: payload.body || payload.text || payload["body-plain"] || "",
    receivedAt: new Date().toISOString(),
    attachments: [],
  };
}

function extractEmail(str: string): string {
  const match = str.match(/<([^>]+)>/);
  return match ? match[1] : str.trim();
}

function extractName(str: string): string {
  const match = str.match(/^([^<]+)</);
  return match ? match[1].trim().replace(/"/g, "") : str;
}

// ─── Detect Org Type from Email Domain ───────────────────────────────────────

export function detectOrgType(email: string): "prokuratura" | "soliq" | "markaziy_bank" | "davlat" {
  const domain = email.split("@")[1]?.toLowerCase() || "";
  if (domain.includes("prokuratura") || domain.includes("prokuror")) return "prokuratura";
  if (domain.includes("soliq") || domain.includes("tax")) return "soliq";
  if (domain.includes("cbu") || domain.includes("markaziybank") || domain.includes("centralbank")) return "markaziy_bank";
  return "davlat";
}
