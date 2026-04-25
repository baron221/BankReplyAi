"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@bank.uz");
  const [password, setPassword] = useState("admin123");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Email yoki parol noto'g'ri");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-base)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    }}>
      {/* Background decoration */}
      <div style={{
        position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0,
      }}>
        <div style={{
          position: "absolute", top: "-20%", left: "-10%",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(102,126,234,0.15) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", bottom: "-20%", right: "-10%",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(118,75,162,0.12) 0%, transparent 70%)",
        }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: "var(--grad-primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 8px 32px rgba(102,126,234,0.4)",
            fontSize: 28,
          }}>🏛️</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--color-text)", margin: "0 0 6px" }}>
            AI Murojaat Tizimi
          </h1>
          <p style={{ color: "var(--color-muted)", fontSize: 14 }}>
            Tizimga kirish uchun ma&apos;lumotlaringizni kiriting
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)",
                borderRadius: "var(--radius-sm)", padding: "10px 14px",
                marginBottom: 20, color: "#dc2626", fontSize: 13,
              }}>
                <AlertCircle size={15} />
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email manzil</label>
              <div style={{ position: "relative" }}>
                <Mail size={15} style={{
                  position: "absolute", left: 12, top: "50%",
                  transform: "translateY(-50%)", color: "var(--color-muted)",
                }} />
                <input
                  id="email-input"
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: 36 }}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@bank.uz"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Parol</label>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={{
                  position: "absolute", left: 12, top: "50%",
                  transform: "translateY(-50%)", color: "var(--color-muted)",
                }} />
                <input
                  id="password-input"
                  type={showPass ? "text" : "password"}
                  className="form-input"
                  style={{ paddingLeft: 36, paddingRight: 40 }}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Parolingizni kiriting"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={{
                    position: "absolute", right: 12, top: "50%",
                    transform: "translateY(-50%)", background: "none",
                    border: "none", cursor: "pointer", color: "var(--color-muted)", padding: 0,
                  }}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              id="login-btn"
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", marginTop: 8, height: 44 }}
              disabled={loading}
            >
              {loading ? (
                <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Kirish...</>
              ) : (
                "Tizimga kirish →"
              )}
            </button>
          </form>

          <div style={{
            marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--color-border)",
            textAlign: "center",
          }}>
            <p style={{ fontSize: 12, color: "var(--color-muted)" }}>
              Default: <strong>admin@bank.uz</strong> / <strong>admin123</strong>
            </p>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
