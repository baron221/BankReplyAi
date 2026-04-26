"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles } from "lucide-react";

type Message = {
  role: "user" | "model";
  text: string;
};

export default function CopilotChat({ inquiry }: { inquiry: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { role: "model", text: "Assalomu alaykum! Men BankReplyAI Copilot - sizning shaxsiy yordamchingizman. Ushbu murojaat bo'yicha qanday yordam bera olaman?" }
      ]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput("");
    
    const newMessages: Message[] = [...messages, { role: "user", text: userText }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const apiMessages = newMessages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          contextData: {
            orgName: inquiry.orgName,
            orgType: inquiry.orgType,
            topic: inquiry.topic,
            description: inquiry.description,
            aiSummary: inquiry.aiSummary,
            aiKeywords: inquiry.aiKeywords ? JSON.parse(inquiry.aiKeywords) : [],
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: "model", text: data.response }]);
      } else {
        setMessages(prev => [...prev, { role: "model", text: "Kechirasiz, xatolik yuz berdi." }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "model", text: "Kechirasiz, tarmoq xatosi." }]);
    }

    setIsLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "var(--grad-primary)",
          color: "white",
          border: "none",
          boxShadow: "0 8px 24px rgba(102, 126, 234, 0.4)",
          display: isOpen ? "none" : "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 1000,
          transition: "transform 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 360,
            height: 500,
            background: "var(--bg-surface)",
            borderRadius: 16,
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.2)",
            border: "1px solid var(--color-border)",
            display: "flex",
            flexDirection: "column",
            zIndex: 1000,
            overflow: "hidden",
            animation: "slideIn 0.3s ease-out forwards",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              background: "var(--grad-primary)",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles size={18} />
              <span style={{ fontWeight: 600, fontSize: 15 }}>AI Copilot</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                cursor: "pointer",
                padding: 4,
                display: "flex",
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              padding: 16,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              background: "var(--bg-base)",
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "flex-end",
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                }}
              >
                {msg.role === "model" && (
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "var(--grad-primary)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Bot size={14} />
                  </div>
                )}
                
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 14,
                    background: msg.role === "user" ? "var(--color-primary)" : "var(--bg-surface)",
                    color: msg.role === "user" ? "white" : "var(--color-text)",
                    border: msg.role === "user" ? "none" : "1px solid var(--color-border)",
                    fontSize: 13.5,
                    lineHeight: 1.5,
                    borderBottomRightRadius: msg.role === "user" ? 4 : 14,
                    borderBottomLeftRadius: msg.role === "model" ? 4 : 14,
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div style={{ display: "flex", gap: 8, alignItems: "center", alignSelf: "flex-start", maxWidth: "85%" }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "var(--grad-primary)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Bot size={14} />
                </div>
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 14,
                    background: "var(--bg-surface)",
                    border: "1px solid var(--color-border)",
                    borderBottomLeftRadius: 4,
                  }}
                >
                  <Loader2 size={14} className="spin" style={{ color: "var(--color-primary)" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div
            style={{
              padding: 16,
              background: "var(--bg-surface)",
              borderTop: "1px solid var(--color-border)",
              display: "flex",
              gap: 8,
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Savol bering..."
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 20,
                border: "1px solid var(--color-border)",
                background: "var(--bg-base)",
                color: "var(--color-text)",
                outline: "none",
                fontSize: 13.5,
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: input.trim() && !isLoading ? "var(--color-primary)" : "var(--color-border)",
                color: "white",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
                transition: "background 0.2s",
              }}
            >
              <Send size={16} style={{ marginLeft: -2 }} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </>
  );
}
