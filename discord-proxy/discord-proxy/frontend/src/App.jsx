import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
// Railway backend URL'ini buraya yaz (deploy sonrası)
const API = import.meta.env.VITE_BACKEND_URL || "https://your-app.up.railway.app";
const SESSION_KEY = "dproxy_session";

// Keep-alive: Railway sunucusu uyumasın, her 4 dakikada ping
function useKeepAlive() {
  useEffect(() => {
    const ping = () => fetch(`${API}/ping`, { credentials: "include" }).catch(() => {});
    ping();
    const id = setInterval(ping, 4 * 60 * 1000);
    return () => clearInterval(id);
  }, []);
}

// Kalıcı oturum: localStorage + backend cookie
function useSession() {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)) || null; }
    catch { return null; }
  });

  const saveSession = useCallback(async (data) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
    setSession(data);
    // Backend'e cookie kaydet
    await fetch(`${API}/session/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ token: data.token }),
    });
  }, []);

  const clearSession = useCallback(async () => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    await fetch(`${API}/session/clear`, { method: "POST", credentials: "include" });
  }, []);

  return { session, saveSession, clearSession };
}

// ─── SCREENS ─────────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }) {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | error

  const handleLogin = async () => {
    if (!token.trim()) return;
    setStatus("loading");
    try {
      // Token'ı kaydet ve Discord'u proxy ile yükle
      await onLogin({ token: token.trim(), loginTime: Date.now() });
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div style={styles.loginWrap}>
      <div style={styles.loginCard}>
        <div style={styles.discordLogo}>
          <svg width="48" height="48" viewBox="0 0 127.14 96.36" fill="#5865F2">
            <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
          </svg>
        </div>

        <h1 style={styles.loginTitle}>Discord Proxy</h1>
        <p style={styles.loginSub}>
          Token'ını gir, Discord'a erişimini aç.<br />
          <span style={{ color: "#f59e0b", fontSize: "0.78rem" }}>
            ⚠️ Token'ını kimseyle paylaşma.
          </span>
        </p>

        <div style={styles.tokenBox}>
          <label style={styles.label}>Discord User Token</label>
          <input
            style={styles.input}
            type="password"
            placeholder="MTk4NjIyNDgzNDcxOTI1MjQ4.Cl2FDQ..."
            value={token}
            onChange={e => setToken(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            autoFocus
          />
          <p style={styles.hint}>
            Token nasıl bulunur? Discord web'de F12 → Network → herhangi istek → Authorization header
          </p>
        </div>

        <button
          style={{
            ...styles.btn,
            opacity: status === "loading" ? 0.6 : 1,
          }}
          onClick={handleLogin}
          disabled={status === "loading"}
        >
          {status === "loading" ? "Bağlanıyor..." : "Giriş Yap & Oturumu Kaydet"}
        </button>

        {status === "error" && (
          <p style={{ color: "#f87171", fontSize: "0.82rem", marginTop: 12 }}>
            Bağlantı hatası. Token'ı kontrol et.
          </p>
        )}

        <p style={styles.note}>
          🔒 Oturumun tarayıcı kapansa bile 365 gün açık kalır.
        </p>
      </div>
    </div>
  );
}

function ProxyFrame({ session, onLogout }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const iframeRef = useRef(null);
  const discordUrl = `${API}/proxy/discord/app`;

  return (
    <div style={styles.frameWrap}>
      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.toolbarLeft}>
          <div style={styles.discordDot} />
          <span style={styles.toolbarTitle}>Discord — Proxy Modu</span>
          <span style={styles.sessionBadge}>
            🔐 Oturum aktif · {new Date(session.loginTime).toLocaleDateString("tr-TR")}
          </span>
        </div>
        <div style={styles.toolbarRight}>
          <button
            style={styles.reloadBtn}
            onClick={() => {
              setLoading(true);
              setError(false);
              if (iframeRef.current) iframeRef.current.src = discordUrl;
            }}
          >
            ↺ Yenile
          </button>
          <button style={styles.logoutBtn} onClick={onLogout}>
            Çıkış
          </button>
        </div>
      </div>

      {/* Loading overlay */}
      {loading && !error && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingInner}>
            <div style={styles.spinner} />
            <p style={{ color: "#a5b4fc", marginTop: 16, fontFamily: "monospace" }}>
              Discord'a bağlanıyor...
            </p>
          </div>
        </div>
      )}

      {error && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingInner}>
            <p style={{ fontSize: "2rem" }}>⚠️</p>
            <p style={{ color: "#f87171", margin: "12px 0", fontFamily: "monospace" }}>
              Proxy bağlantısı kurulamadı
            </p>
            <button
              style={styles.btn}
              onClick={() => { setError(false); setLoading(true); }}
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      )}

      {/* Discord iframe */}
      <iframe
        ref={iframeRef}
        src={discordUrl}
        style={{ ...styles.iframe, display: error ? "none" : "block" }}
        onLoad={() => setLoading(false)}
        onError={() => { setLoading(false); setError(true); }}
        title="Discord Proxy"
        allow="microphone; camera; clipboard-read; clipboard-write"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
      />
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const { session, saveSession, clearSession } = useSession();
  useKeepAlive();

  return session ? (
    <ProxyFrame session={session} onLogout={clearSession} />
  ) : (
    <LoginScreen onLogin={saveSession} />
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = {
  loginWrap: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0b0c1a 0%, #111827 50%, #0b0c1a 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    padding: 20,
  },
  loginCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(88,101,242,0.3)",
    borderRadius: 20,
    padding: "48px 40px",
    maxWidth: 440,
    width: "100%",
    textAlign: "center",
    backdropFilter: "blur(20px)",
    boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(88,101,242,0.1) inset",
  },
  discordLogo: {
    marginBottom: 20,
    display: "flex",
    justifyContent: "center",
  },
  loginTitle: {
    fontSize: "1.8rem",
    fontWeight: 800,
    color: "#e2e8f0",
    marginBottom: 8,
    letterSpacing: "-0.5px",
  },
  loginSub: {
    color: "#94a3b8",
    fontSize: "0.9rem",
    lineHeight: 1.6,
    marginBottom: 28,
  },
  tokenBox: {
    textAlign: "left",
    marginBottom: 20,
  },
  label: {
    display: "block",
    color: "#94a3b8",
    fontSize: "0.78rem",
    fontWeight: 600,
    letterSpacing: "1px",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    background: "rgba(0,0,0,0.35)",
    border: "1.5px solid rgba(88,101,242,0.3)",
    borderRadius: 10,
    padding: "14px 16px",
    color: "#e2e8f0",
    fontSize: "0.9rem",
    fontFamily: "monospace",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  },
  hint: {
    color: "#64748b",
    fontSize: "0.74rem",
    marginTop: 6,
    lineHeight: 1.5,
  },
  btn: {
    width: "100%",
    background: "#5865F2",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "14px 0",
    fontSize: "0.95rem",
    fontWeight: 700,
    cursor: "pointer",
    transition: "background 0.2s, transform 0.1s",
    letterSpacing: "0.3px",
  },
  note: {
    color: "#475569",
    fontSize: "0.75rem",
    marginTop: 20,
    lineHeight: 1.5,
  },
  frameWrap: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    background: "#202225",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#2f3136",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    padding: "8px 16px",
    height: 44,
    flexShrink: 0,
  },
  toolbarLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  discordDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#57F287",
    boxShadow: "0 0 6px #57F287",
  },
  toolbarTitle: {
    color: "#e2e8f0",
    fontSize: "0.82rem",
    fontWeight: 700,
  },
  sessionBadge: {
    background: "rgba(88,101,242,0.2)",
    border: "1px solid rgba(88,101,242,0.3)",
    color: "#a5b4fc",
    fontSize: "0.7rem",
    padding: "2px 10px",
    borderRadius: 999,
    fontFamily: "monospace",
  },
  toolbarRight: {
    display: "flex",
    gap: 8,
  },
  reloadBtn: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#94a3b8",
    padding: "4px 12px",
    borderRadius: 6,
    fontSize: "0.78rem",
    cursor: "pointer",
  },
  logoutBtn: {
    background: "rgba(239,68,68,0.15)",
    border: "1px solid rgba(239,68,68,0.3)",
    color: "#f87171",
    padding: "4px 12px",
    borderRadius: 6,
    fontSize: "0.78rem",
    cursor: "pointer",
    fontWeight: 600,
  },
  iframe: {
    flex: 1,
    border: "none",
    width: "100%",
  },
  loadingOverlay: {
    position: "absolute",
    inset: 44,
    background: "#202225",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  loadingInner: {
    textAlign: "center",
  },
  spinner: {
    width: 40,
    height: 40,
    border: "3px solid rgba(88,101,242,0.2)",
    borderTop: "3px solid #5865F2",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    margin: "0 auto",
  },
};
