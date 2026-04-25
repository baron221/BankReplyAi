"use client";
import { useState, useEffect } from "react";
import TopBar from "@/components/TopBar";
import { Users, Key, Shield, Bell, Save, Plus, Loader2, CheckCircle } from "lucide-react";

type User = { id: string; name: string; email: string; role: string; department: string };

const roleColors: Record<string, string> = { admin: "badge-prokuratura", menejer: "badge-mb", operator: "badge-yangi" };

export default function SozlamalarPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "operator", department: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/users").then(r => r.json()).then(data => {
      setUsers(Array.isArray(data) ? data : []);
      setLoadingUsers(false);
    }).catch(() => setLoadingUsers(false));
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      if (res.ok) {
        const user = await res.json();
        setUsers(prev => [...prev, user]);
        setShowAddUser(false);
        setNewUser({ name: "", email: "", password: "", role: "operator", department: "" });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const err = await res.json();
        alert(err.error || "Xatolik yuz berdi");
      }
    } catch { alert("Tarmoq xatoligi"); }
    setSaving(false);
  };

  return (
    <>
      <TopBar title="Sozlamalar" subtitle="Tizim va foydalanuvchi sozlamalari" />
      <div className="page-body fade-in">
        {saved && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(22,163,74,0.1)", border: "1px solid rgba(22,163,74,0.3)", borderRadius: "var(--radius-sm)", padding: "10px 16px", marginBottom: 20, color: "#16a34a", fontSize: 13 }}>
            <CheckCircle size={15} /> Foydalanuvchi muvaffaqiyatli qo&apos;shildi!
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Users */}
          <div className="card">
            <div className="card-header">
              <span className="card-title"><Users size={15} style={{ display: "inline", marginRight: 6 }} />Foydalanuvchilar (RBAC)</span>
              <button className="btn btn-outline btn-sm" onClick={() => setShowAddUser(p => !p)} id="add-user-btn">
                <Plus size={13} /> Qo&apos;shish
              </button>
            </div>
            <div className="card-body" style={{ paddingTop: 12 }}>
              {showAddUser && (
                <form onSubmit={handleAddUser} style={{ background: "var(--bg-base)", borderRadius: "var(--radius-sm)", padding: 16, marginBottom: 16, border: "1px solid var(--color-border)" }}>
                  <div style={{ display: "grid", gap: 12 }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Ism familiya *</label>
                      <input className="form-input" placeholder="Ism familiya" required
                        value={newUser.name} onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Email *</label>
                      <input className="form-input" type="email" placeholder="email@bank.uz" required
                        value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Parol *</label>
                      <input className="form-input" type="password" placeholder="Kamida 6 ta belgi" required minLength={6}
                        value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Rol</label>
                        <select className="form-input" value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))}>
                          <option value="operator">Operator</option>
                          <option value="menejer">Menejer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Bo&apos;lim</label>
                        <input className="form-input" placeholder="Yuridik bo'lim"
                          value={newUser.department} onChange={e => setNewUser(p => ({ ...p, department: e.target.value }))} />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1 }} disabled={saving}>
                        {saving ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={13} />} Saqlash
                      </button>
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowAddUser(false)}>Bekor</button>
                    </div>
                  </div>
                </form>
              )}

              {loadingUsers ? (
                <div style={{ textAlign: "center", padding: 20 }}><Loader2 size={20} style={{ animation: "spin 1s linear infinite", color: "var(--color-muted)" }} /></div>
              ) : users.map(user => (
                <div key={user.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--color-border)" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--grad-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                    {user.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{user.name}</div>
                    <div style={{ fontSize: 12, color: "var(--color-muted)" }}>{user.department} • {user.email}</div>
                  </div>
                  <span className={`badge ${roleColors[user.role] || "badge-yangi"}`}>{user.role}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Settings */}
          <div className="card">
            <div className="card-header"><span className="card-title"><Key size={15} style={{ display: "inline", marginRight: 6 }} />AI Sozlamalari</span></div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Gemini API Key</label>
                <input id="api-key-input" className="form-input" type="password" disabled value="●●●●●●●●●●●●●●●●" />
                <p style={{ fontSize: 11, color: "var(--color-muted)", marginTop: 4 }}>.env.local faylda GEMINI_API_KEY o&apos;rnatiladi</p>
              </div>
              <div className="form-group">
                <label className="form-label">AI Modeli</label>
                <select className="form-input" id="ai-model-select">
                  <option>gemini-2.0-flash</option>
                  <option>gemini-1.5-pro</option>
                  <option>gemini-1.5-flash</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Javob tili</label>
                <select className="form-input" id="language-select">
                  <option value="uz">O&apos;zbek tili</option>
                  <option value="ru">Русский</option>
                  <option value="en">English</option>
                </select>
              </div>
              <button className="btn btn-primary btn-sm" id="save-ai-settings-btn"><Save size={13} /> Saqlash</button>
            </div>
          </div>

          {/* Compliance */}
          <div className="card">
            <div className="card-header"><span className="card-title"><Shield size={15} style={{ display: "inline", marginRight: 6 }} />Compliance Qoidalari</span></div>
            <div className="card-body" style={{ paddingTop: 12 }}>
              {[
                { label: "Bank siri tekshiruvi", enabled: true },
                { label: "Qonuniy muddat nazorati", enabled: true },
                { label: "Imzo va muhur tekshiruvi", enabled: true },
                { label: "Risk darajasi baholash", enabled: true },
                { label: "Duplicate murojaat aniqlash", enabled: false },
              ].map(rule => (
                <div key={rule.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--color-border)" }}>
                  <span style={{ fontSize: 13.5 }}>{rule.label}</span>
                  <span className={`badge ${rule.enabled ? "compliance-passed" : "badge-rad"}`}>
                    {rule.enabled ? "Yoqilgan" : "O'chirilgan"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Login info */}
          <div className="card">
            <div className="card-header"><span className="card-title"><Bell size={15} style={{ display: "inline", marginRight: 6 }} />Tizimga kirish</span></div>
            <div className="card-body" style={{ paddingTop: 12 }}>
              <div style={{ background: "var(--bg-base)", borderRadius: "var(--radius-sm)", padding: 16, border: "1px solid var(--color-border)" }}>
                <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>📌 Login ma&apos;lumotlari:</p>
                {[
                  { role: "Admin", email: "admin@bank.uz", pass: "admin123" },
                  { role: "Menejer", email: "malika@bank.uz", pass: "menejer123" },
                  { role: "Operator", email: "jamshid@bank.uz", pass: "operator123" },
                ].map(u => (
                  <div key={u.email} style={{ padding: "8px 0", borderBottom: "1px solid var(--color-border)", fontSize: 13 }}>
                    <span className={`badge ${roleColors[u.role.toLowerCase()] || "badge-yangi"}`} style={{ marginRight: 8 }}>{u.role}</span>
                    <strong>{u.email}</strong> / <span style={{ color: "var(--color-muted)" }}>{u.pass}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
