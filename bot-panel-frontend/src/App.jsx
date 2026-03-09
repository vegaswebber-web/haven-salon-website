import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// MOCK API (Railway backend URL buraya gelecek)
// ============================================================
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
const WS_BASE = import.meta.env.VITE_WS_URL || "ws://localhost:3001";

const api = {
  post: async (path, body) => {
    const token = localStorage.getItem("panel_token");
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    return res.json();
  },
  get: async (path) => {
    const token = localStorage.getItem("panel_token");
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },
};

// ============================================================
// ICONS
// ============================================================
const Icon = ({ name, size = 16 }) => {
  const icons = {
    terminal: "⬛",
    bot: "🤖",
    files: "📁",
    play: "▶",
    stop: "⏹",
    restart: "↺",
    upload: "↑",
    search: "⌕",
    close: "✕",
    minimize: "−",
    maximize: "□",
    folder: "📂",
    file: "📄",
    js: "JS",
    json: "{}",
    lock: "🔒",
    cpu: "CPU",
    ram: "RAM",
    online: "●",
    offline: "●",
    warn: "▲",
    trash: "🗑",
    edit: "✎",
    save: "💾",
    refresh: "⟳",
    settings: "⚙",
    logout: "⏻",
    arrow: "›",
  };
  return <span style={{ fontSize: size }}>{icons[name] || "?"}</span>;
};

// ============================================================
// LOGIN SCREEN
// ============================================================
function Particles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.1,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,255,100,${p.alpha})`;
        ctx.fill();
      });
      // Draw lines between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0,255,100,${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, zIndex: 0 }} />;
}

function TypewriterText({ text, speed = 60 }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    let i = 0;
    setDisplayed("");
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return (
    <span>
      {displayed}
      <span style={{ animation: "cursorBlink 1s infinite", color: "#00ff64" }}>_</span>
    </span>
  );
}

function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("panel_token", "panel_token");
      onLogin();
    }, 900);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!username) return;
    setLoading(true);
    setTimeout(() => {
      setSuccess("Kayıt başarılı! Yönlendiriliyorsunuz...");
      setTimeout(() => {
        localStorage.setItem("panel_token", "panel_token");
        onLogin();
      }, 1000);
    }, 900);
  };

  const inputStyle = {
    width: "100%", background: "rgba(0,255,100,0.03)",
    border: "1px solid rgba(0,255,100,0.2)", borderRadius: 6,
    color: "#00ff64", fontFamily: "'JetBrains Mono', monospace", fontSize: 14,
    padding: "13px 16px", outline: "none", boxSizing: "border-box",
    transition: "all 0.25s", letterSpacing: 1,
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#040606",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'JetBrains Mono', monospace",
      position: "relative", overflow: "hidden",
    }}>
      <Particles />

      {/* Animated radial glow */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,255,100,0.05) 0%, transparent 70%)",
        animation: "glowPulse 4s ease-in-out infinite",
      }} />

      {/* Scanlines overlay */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
      }} />

      {/* Card */}
      <div style={{
        position: "relative", zIndex: 2,
        width: 420,
        background: "rgba(4,10,6,0.97)",
        border: "1px solid rgba(0,255,100,0.18)",
        boxShadow: "0 0 80px rgba(0,255,100,0.07), 0 0 0 1px rgba(0,255,100,0.05), inset 0 1px 0 rgba(0,255,100,0.08)",
        borderRadius: 12,
        padding: "44px 40px 36px",
        transform: mounted ? "translateY(0) scale(1)" : "translateY(30px) scale(0.97)",
        opacity: mounted ? 1 : 0,
        transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        animation: "none",
      }}>
        {/* Top corner decorations */}
        <div style={{ position: "absolute", top: 12, left: 12, width: 16, height: 16, borderTop: "2px solid rgba(0,255,100,0.4)", borderLeft: "2px solid rgba(0,255,100,0.4)", borderRadius: "2px 0 0 0" }} />
        <div style={{ position: "absolute", top: 12, right: 12, width: 16, height: 16, borderTop: "2px solid rgba(0,255,100,0.4)", borderRight: "2px solid rgba(0,255,100,0.4)", borderRadius: "0 2px 0 0" }} />
        <div style={{ position: "absolute", bottom: 12, left: 12, width: 16, height: 16, borderBottom: "2px solid rgba(0,255,100,0.4)", borderLeft: "2px solid rgba(0,255,100,0.4)", borderRadius: "0 0 0 2px" }} />
        <div style={{ position: "absolute", bottom: 12, right: 12, width: 16, height: 16, borderBottom: "2px solid rgba(0,255,100,0.4)", borderRight: "2px solid rgba(0,255,100,0.4)", borderRadius: "0 0 2px 0" }} />

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 56, height: 56, borderRadius: 12, marginBottom: 16,
            background: "rgba(0,255,100,0.08)", border: "1px solid rgba(0,255,100,0.2)",
            fontSize: 26, boxShadow: "0 0 20px rgba(0,255,100,0.15)",
            animation: "floatIcon 3s ease-in-out infinite",
          }}>🤖</div>
          <div style={{ fontSize: 10, color: "rgba(0,255,100,0.45)", letterSpacing: 6, textTransform: "uppercase", marginBottom: 10 }}>
            SYSTEM ACCESS
          </div>
          <div style={{
            fontSize: 26, color: "#00ff64", fontWeight: 700, letterSpacing: 3,
            textShadow: "0 0 30px rgba(0,255,100,0.4), 0 0 60px rgba(0,255,100,0.15)",
          }}>
            BOT PANEL
          </div>
          <div style={{ marginTop: 6, fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: 2 }}>
            <TypewriterText text="v2.0 // RAILWAY EDITION" speed={50} />
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(0,255,100,0.25), transparent)", marginBottom: 28 }} />

        {/* Tab switcher */}
        <div style={{
          display: "flex", background: "rgba(0,0,0,0.3)",
          border: "1px solid rgba(0,255,100,0.1)", borderRadius: 8,
          padding: 3, marginBottom: 24, gap: 3,
        }}>
          {["login", "register"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }} style={{
              flex: 1, padding: "9px", border: "none", borderRadius: 6,
              background: mode === m ? "rgba(0,255,100,0.12)" : "transparent",
              color: mode === m ? "#00ff64" : "rgba(255,255,255,0.3)",
              fontFamily: "inherit", fontSize: 11, fontWeight: 700,
              letterSpacing: 2, cursor: "pointer", transition: "all 0.2s",
              boxShadow: mode === m ? "0 0 12px rgba(0,255,100,0.1)" : "none",
            }}>
              {m === "login" ? "GİRİŞ YAP" : "KAYIT OL"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={mode === "login" ? handleLogin : handleRegister}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mode === "register" && (
              <div>
                <div style={{ fontSize: 10, color: "rgba(0,255,100,0.45)", letterSpacing: 2, marginBottom: 7 }}>›_ KULLANICI_ADI</div>
                <input value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="kullaniciadi" autoFocus style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "rgba(0,255,100,0.55)"}
                  onBlur={e => e.target.style.borderColor = "rgba(0,255,100,0.2)"}
                />
              </div>
            )}
          </div>

          

          {success && (
            <div style={{
              marginTop: 14, padding: "10px 14px", background: "rgba(0,255,100,0.08)",
              border: "1px solid rgba(0,255,100,0.25)", borderRadius: 6,
              color: "#00ff64", fontSize: 12, display: "flex", alignItems: "center", gap: 8,
            }}>
              <span>✓</span> {success}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            marginTop: 20, width: "100%", padding: "14px",
            background: loading ? "rgba(0,255,100,0.04)" : "rgba(0,255,100,0.1)",
            border: "1px solid rgba(0,255,100,0.35)", borderRadius: 8,
            color: loading ? "rgba(0,255,100,0.4)" : "#00ff64",
            fontFamily: "inherit", fontSize: 12, fontWeight: 700,
            letterSpacing: 3, cursor: loading ? "wait" : "pointer",
            transition: "all 0.2s", textTransform: "uppercase",
            boxShadow: loading ? "none" : "0 0 20px rgba(0,255,100,0.08)",
            position: "relative", overflow: "hidden",
          }}
            onMouseEnter={e => { if (!loading) { e.target.style.background = "rgba(0,255,100,0.17)"; e.target.style.boxShadow = "0 0 30px rgba(0,255,100,0.2)"; }}}
            onMouseLeave={e => { if (!loading) { e.target.style.background = "rgba(0,255,100,0.1)"; e.target.style.boxShadow = "0 0 20px rgba(0,255,100,0.08)"; }}}
          >
            {loading ? "İŞLENİYOR..." : mode === "login" ? "▶ GİRİŞ YAP" : "✦ KAYIT OL"}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.12)", letterSpacing: 1 }}>
          {mode === "login" ? "Hesabın yok mu? " : "Zaten hesabın var mı? "}
          <span onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            style={{ color: "rgba(0,255,100,0.4)", cursor: "pointer", textDecoration: "underline" }}>
            {mode === "login" ? "Kayıt ol" : "Giriş yap"}
          </span>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; }
        @keyframes glowPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes floatIcon {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes glitch {
          0%,100% { transform: none; filter: none; }
          20% { transform: translate(-3px, 0) skew(1deg); filter: hue-rotate(80deg) brightness(1.2); }
          40% { transform: translate(3px, 0) skew(-1deg); filter: hue-rotate(-80deg); }
          60% { transform: translate(-2px, 1px); filter: brightness(1.5); }
          80% { transform: translate(2px, -1px) skew(0.5deg); }
        }
      `}</style>
    </div>
  );
}

// ============================================================
// TERMINAL COMPONENT
// ============================================================
function Terminal({ logs, onCommand }) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  const handleCommand = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setHistory(h => [input, ...h]);
    setHistIdx(-1);
    onCommand(input);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowUp") {
      const idx = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(idx);
      setInput(history[idx] || "");
    } else if (e.key === "ArrowDown") {
      const idx = Math.max(histIdx - 1, -1);
      setHistIdx(idx);
      setInput(history[idx] || "");
    }
  };

  const colorLine = (line) => {
    if (line.includes("[ERROR]") || line.includes("error") || line.includes("Error")) return "#ff5050";
    if (line.includes("[WARN]") || line.includes("warn")) return "#ffaa00";
    if (line.includes("[INFO]") || line.includes("✓")) return "#00ff64";
    if (line.startsWith("$")) return "#7dd3fc";
    if (line.startsWith("#")) return "rgba(255,255,255,0.3)";
    return "rgba(255,255,255,0.8)";
  };

  return (
    <div style={{
      height: "100%", display: "flex", flexDirection: "column",
      background: "#070a07", fontFamily: "'JetBrains Mono', monospace",
    }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Terminal output */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "16px",
        scrollbarWidth: "thin", scrollbarColor: "rgba(0,255,100,0.2) transparent",
      }}>
        {logs.map((log, i) => (
          <div key={i} style={{
            fontSize: 12, lineHeight: 1.8, color: colorLine(log),
            whiteSpace: "pre-wrap", wordBreak: "break-all",
          }}>
            {log}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleCommand} style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "12px 16px", borderTop: "1px solid rgba(0,255,100,0.1)",
        background: "rgba(0,255,100,0.02)",
      }}>
        <span style={{ color: "#00ff64", fontSize: 12, flexShrink: 0 }}>bot@panel:~$</span>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1, background: "transparent", border: "none", outline: "none",
            color: "#7dd3fc", fontFamily: "inherit", fontSize: 12, caretColor: "#00ff64",
          }}
          placeholder="komut girin... (help yazın)"
          autoComplete="off"
          spellCheck={false}
        />
      </form>
    </div>
  );
}

// ============================================================
// FILE MANAGER COMPONENT
// ============================================================
function FileManager({ files, onUpload, onDelete, onEdit, onRefresh }) {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const filtered = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  const getIcon = (name) => {
    if (name.endsWith(".js")) return { text: "JS", color: "#f7df1e", bg: "rgba(247,223,30,0.15)" };
    if (name.endsWith(".json")) return { text: "{}", color: "#00aaff", bg: "rgba(0,170,255,0.15)" };
    if (name.endsWith(".env")) return { text: "ENV", color: "#ff6b6b", bg: "rgba(255,107,107,0.15)" };
    if (name.endsWith(".md")) return { text: "MD", color: "#aaa", bg: "rgba(170,170,170,0.15)" };
    return { text: "TXT", color: "#888", bg: "rgba(136,136,136,0.15)" };
  };

  const formatSize = (bytes) => {
    if (!bytes) return "—";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach(f => onUpload(f));
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#070a07" }}>
      {/* Toolbar */}
      <div style={{
        display: "flex", gap: 8, padding: "12px 16px",
        borderBottom: "1px solid rgba(0,255,100,0.1)", alignItems: "center",
      }}>
        <div style={{
          flex: 1, display: "flex", alignItems: "center", gap: 8,
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 4, padding: "6px 12px",
        }}>
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>⌕</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Dosya ara..."
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: "#fff", fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
            }}
          />
        </div>
        <button onClick={() => fileInputRef.current?.click()} style={{
          padding: "6px 14px", background: "rgba(0,255,100,0.1)",
          border: "1px solid rgba(0,255,100,0.3)", borderRadius: 4,
          color: "#00ff64", fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11, cursor: "pointer", fontWeight: 700, letterSpacing: 1,
        }}>
          ↑ YÜKLE
        </button>
        <button onClick={onRefresh} style={{
          padding: "6px 10px", background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4,
          color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 14,
        }}>
          ⟳
        </button>
        <input ref={fileInputRef} type="file" accept=".js,.json,.env,.md,.txt"
          style={{ display: "none" }} multiple
          onChange={e => Array.from(e.target.files).forEach(f => onUpload(f))}
        />
      </div>

      {/* Column headers */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 80px 140px 80px",
        padding: "8px 16px", fontSize: 10, color: "rgba(255,255,255,0.25)",
        letterSpacing: 2, textTransform: "uppercase",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <span>Ad</span><span>Boyut</span><span>Değiştirilme</span><span>İşlem</span>
      </div>

      {/* File list / Drop zone */}
      <div
        style={{
          flex: 1, overflowY: "auto",
          border: dragOver ? "2px dashed rgba(0,255,100,0.4)" : "2px dashed transparent",
          transition: "border 0.2s",
          scrollbarWidth: "thin", scrollbarColor: "rgba(0,255,100,0.2) transparent",
        }}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {filtered.length === 0 && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", height: "100%", color: "rgba(255,255,255,0.2)",
            gap: 8,
          }}>
            <div style={{ fontSize: 32 }}>📂</div>
            <div style={{ fontSize: 12 }}>
              {search ? "Dosya bulunamadı" : "Dosya yok — sürükle bırak veya yükle"}
            </div>
          </div>
        )}
        {filtered.map((file) => {
          const icon = getIcon(file.name);
          const isSelected = selected === file.name;
          return (
            <div key={file.name}
              onClick={() => setSelected(isSelected ? null : file.name)}
              style={{
                display: "grid", gridTemplateColumns: "1fr 80px 140px 80px",
                padding: "10px 16px", cursor: "pointer", alignItems: "center",
                background: isSelected ? "rgba(0,255,100,0.06)" : "transparent",
                borderLeft: isSelected ? "2px solid #00ff64" : "2px solid transparent",
                borderBottom: "1px solid rgba(255,255,255,0.03)",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 4,
                  background: icon.bg, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 9, fontWeight: 700,
                  color: icon.color, flexShrink: 0, letterSpacing: 0.5,
                }}>
                  {icon.text}
                </div>
                <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>
                  {file.name}
                </span>
              </div>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>{formatSize(file.size)}</span>
              <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11 }}>{file.modified || "—"}</span>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={e => { e.stopPropagation(); onEdit(file); }} style={{
                  padding: "3px 8px", background: "rgba(100,150,255,0.15)",
                  border: "1px solid rgba(100,150,255,0.3)", borderRadius: 3,
                  color: "#7db4ff", cursor: "pointer", fontSize: 11,
                }}>✎</button>
                <button onClick={e => { e.stopPropagation(); onDelete(file.name); }} style={{
                  padding: "3px 8px", background: "rgba(255,80,80,0.1)",
                  border: "1px solid rgba(255,80,80,0.2)", borderRadius: 3,
                  color: "#ff6060", cursor: "pointer", fontSize: 11,
                }}>✕</button>
              </div>
            </div>
          );
        })}
      </div>

      {dragOver && (
        <div style={{
          position: "absolute", inset: 0, background: "rgba(0,255,100,0.05)",
          display: "flex", alignItems: "center", justifyContent: "center",
          pointerEvents: "none", zIndex: 10,
        }}>
          <div style={{ color: "#00ff64", fontSize: 18, fontFamily: "'JetBrains Mono', monospace" }}>
            Dosyaları buraya bırak
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// BOT CONTROL PANEL
// ============================================================
function BotControl({ status, onStart, onStop, onRestart, uptime, stats }) {
  const isOnline = status === "online";
  const isLoading = status === "loading";

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20, height: "100%", overflowY: "auto" }}>
      {/* Status card */}
      <div style={{
        background: isOnline ? "rgba(0,255,100,0.05)" : "rgba(255,80,80,0.05)",
        border: `1px solid ${isOnline ? "rgba(0,255,100,0.2)" : "rgba(255,80,80,0.2)"}`,
        borderRadius: 8, padding: 24,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>
              Bot Durumu
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 10, height: 10, borderRadius: "50%",
                background: isOnline ? "#00ff64" : "#ff5050",
                boxShadow: isOnline ? "0 0 12px #00ff64" : "0 0 12px #ff5050",
                animation: isOnline ? "pulse 2s infinite" : "none",
              }} />
              <span style={{
                fontSize: 22, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                color: isOnline ? "#00ff64" : "#ff5050",
              }}>
                {isLoading ? "BAŞLATILIYOR..." : isOnline ? "ÇEVRIMIÇI" : "ÇEVRIMDIŞI"}
              </span>
            </div>
            {isOnline && uptime && (
              <div style={{ marginTop: 8, fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono', monospace" }}>
                Çalışma süresi: {uptime}
              </div>
            )}
          </div>
          {/* Big status icon */}
          <div style={{ fontSize: 48, opacity: 0.6 }}>🤖</div>
        </div>
      </div>

      {/* Control buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        {[
          { label: "BAŞLAT", icon: "▶", action: onStart, color: "#00ff64", disabled: isOnline || isLoading },
          { label: "DURDUR", icon: "⏹", action: onStop, color: "#ff5050", disabled: !isOnline || isLoading },
          { label: "YENİDEN", icon: "↺", action: onRestart, color: "#ffaa00", disabled: isLoading },
        ].map(btn => (
          <button key={btn.label} onClick={btn.action} disabled={btn.disabled} style={{
            padding: "18px 12px", borderRadius: 8,
            background: btn.disabled ? "rgba(255,255,255,0.03)" : `rgba(${btn.color === "#00ff64" ? "0,255,100" : btn.color === "#ff5050" ? "255,80,80" : "255,170,0"},0.1)`,
            border: `1px solid ${btn.disabled ? "rgba(255,255,255,0.08)" : btn.color + "40"}`,
            color: btn.disabled ? "rgba(255,255,255,0.2)" : btn.color,
            cursor: btn.disabled ? "not-allowed" : "pointer",
            fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
            fontSize: 11, letterSpacing: 1.5, transition: "all 0.2s",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: 20 }}>{btn.icon}</span>
            {btn.label}
          </button>
        ))}
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          { label: "CPU Kullanımı", value: stats?.cpu || "—", unit: "%", color: "#7dd3fc" },
          { label: "RAM Kullanımı", value: stats?.ram || "—", unit: "MB", color: "#c4b5fd" },
          { label: "Sunucu Sayısı", value: stats?.guilds || "—", unit: "sunucu", color: "#00ff64" },
          { label: "Komut Sayısı", value: stats?.commands || "—", unit: "komut", color: "#ffaa00" },
        ].map(stat => (
          <div key={stat.label} style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 8, padding: 16,
          }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" }}>
              {stat.label}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: stat.color, fontFamily: "'JetBrains Mono', monospace" }}>
                {stat.value}
              </span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{stat.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Activity log preview */}
      <div style={{
        background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 8, padding: 16, flex: 1,
      }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 2, marginBottom: 12, textTransform: "uppercase" }}>
          Son Aktivite
        </div>
        {[
          { time: "14:23:01", msg: "Komut çalıştırıldı: /help", type: "info" },
          { time: "14:22:44", msg: "Yeni sunucuya katıldı: MyServer", type: "success" },
          { time: "14:20:11", msg: "Mesaj gönderildi: #genel", type: "info" },
          { time: "14:18:30", msg: "Bot başlatıldı", type: "success" },
        ].map((item, i) => (
          <div key={i} style={{
            display: "flex", gap: 12, marginBottom: 8, alignItems: "flex-start",
          }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>
              {item.time}
            </span>
            <span style={{
              fontSize: 12, color: item.type === "success" ? "rgba(0,255,100,0.7)" : "rgba(255,255,255,0.5)",
            }}>
              {item.msg}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// CODE EDITOR MODAL
// ============================================================
function CodeEditor({ file, onSave, onClose }) {
  const [content, setContent] = useState(file?.content || "");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(file.name, content);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(4px)",
    }}>
      <div style={{
        width: "80vw", maxWidth: 900, height: "80vh",
        background: "#0a0f0a", border: "1px solid rgba(0,255,100,0.2)",
        borderRadius: 8, display: "flex", flexDirection: "column",
        boxShadow: "0 0 80px rgba(0,0,0,0.8)",
      }}>
        {/* Editor header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px", borderBottom: "1px solid rgba(0,255,100,0.1)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 11, color: "rgba(0,255,100,0.6)", fontFamily: "'JetBrains Mono', monospace" }}>
              ✎ {file?.name}
            </span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleSave} style={{
              padding: "6px 16px", background: saved ? "rgba(0,255,100,0.2)" : "rgba(0,255,100,0.1)",
              border: "1px solid rgba(0,255,100,0.3)", borderRadius: 4,
              color: "#00ff64", fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11, cursor: "pointer", fontWeight: 700, letterSpacing: 1,
            }}>
              {saved ? "✓ KAYDEDİLDİ" : "💾 KAYDET"}
            </button>
            <button onClick={onClose} style={{
              padding: "6px 12px", background: "rgba(255,80,80,0.1)",
              border: "1px solid rgba(255,80,80,0.2)", borderRadius: 4,
              color: "#ff5050", cursor: "pointer", fontSize: 14,
            }}>✕</button>
          </div>
        </div>
        {/* Editor textarea */}
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          style={{
            flex: 1, background: "transparent", border: "none", outline: "none",
            color: "rgba(255,255,255,0.85)", fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13, padding: 20, resize: "none", lineHeight: 1.8,
            scrollbarWidth: "thin", scrollbarColor: "rgba(0,255,100,0.2) transparent",
          }}
          spellCheck={false}
        />
        {/* Status bar */}
        <div style={{
          padding: "6px 16px", borderTop: "1px solid rgba(255,255,255,0.05)",
          display: "flex", gap: 16, fontSize: 10, color: "rgba(255,255,255,0.25)",
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          <span>{content.split("\n").length} satır</span>
          <span>{content.length} karakter</span>
          <span style={{ marginLeft: "auto" }}>Ctrl+S ile kaydet</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [authed, setAuthed] = useState(() => !!localStorage.getItem("panel_token"));
  const [activeTab, setActiveTab] = useState("bot");
  const [botStatus, setBotStatus] = useState("offline");
  const [logs, setLogs] = useState([
    "# Bot Yönetim Paneli v2.0",
    "# Railway Edition",
    "# ─────────────────────────────",
    "[INFO] Panel hazır. 'help' yazarak komutları görebilirsiniz.",
    "[INFO] Railway backend bağlantısı: Bekliyor...",
  ]);
  const [files, setFiles] = useState([
    { name: "index.js", size: 4200, modified: "Bugün 14:20" },
    { name: "config.json", size: 820, modified: "Dün 11:30" },
    { name: "commands.js", size: 7800, modified: "3 gün önce" },
    { name: "events.js", size: 3100, modified: "3 gün önce" },
    { name: ".env", size: 240, modified: "1 hafta önce" },
  ]);
  const [stats, setStats] = useState({ cpu: "12", ram: "128", guilds: "7", commands: "24" });
  const [uptime, setUptime] = useState("0s");
  const [editingFile, setEditingFile] = useState(null);
  const [uptimeSeconds, setUptimeSeconds] = useState(0);
  const wsRef = useRef(null);

  // Uptime timer
  useEffect(() => {
    let interval;
    if (botStatus === "online") {
      interval = setInterval(() => {
        setUptimeSeconds(s => s + 1);
      }, 1000);
    } else {
      setUptimeSeconds(0);
    }
    return () => clearInterval(interval);
  }, [botStatus]);

  useEffect(() => {
    const s = uptimeSeconds;
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    setUptime(`${h > 0 ? h + "s " : ""}${m > 0 ? m + "d " : ""}${sec}sn`);
  }, [uptimeSeconds]);

  const addLog = useCallback((msg) => {
    const time = new Date().toLocaleTimeString("tr-TR");
    setLogs(l => [...l, `[${time}] ${msg}`]);
  }, []);

  const handleCommand = useCallback(async (cmd) => {
    addLog(`$ ${cmd}`);
    const parts = cmd.trim().split(" ");
    const command = parts[0].toLowerCase();

    switch (command) {
      case "help":
        addLog("# ── Kullanılabilir Komutlar ──────────────");
        addLog("  start       → Botu başlat");
        addLog("  stop        → Botu durdur");
        addLog("  restart     → Botu yeniden başlat");
        addLog("  status      → Bot durumunu göster");
        addLog("  logs        → Son logları listele");
        addLog("  files       → Dosyaları listele");
        addLog("  clear       → Terminal temizle");
        addLog("  stats       → Sunucu istatistikleri");
        addLog("# ──────────────────────────────────────────");
        break;
      case "start":
        await handleBotStart();
        break;
      case "stop":
        await handleBotStop();
        break;
      case "restart":
        await handleBotRestart();
        break;
      case "status":
        addLog(`[INFO] Bot durumu: ${botStatus.toUpperCase()}`);
        addLog(`[INFO] Çalışma süresi: ${uptime}`);
        break;
      case "clear":
        setLogs(["# Terminal temizlendi.", "[INFO] Hazır."]);
        break;
      case "files":
        addLog("# ── Dosyalar ─────────────────────────────");
        files.forEach(f => addLog(`  📄 ${f.name} (${f.size} byte)`));
        break;
      case "stats":
        addLog(`[INFO] CPU: ${stats.cpu}% | RAM: ${stats.ram}MB | Sunucu: ${stats.guilds} | Komut: ${stats.commands}`);
        break;
      case "logs":
        addLog("[INFO] Son 5 log satırı gösteriliyor...");
        break;
      default:
        addLog(`[ERROR] Bilinmeyen komut: '${command}'. 'help' yazarak yardım alın.`);
    }
  }, [botStatus, uptime, files, stats]);

  const handleBotStart = async () => {
    addLog("[INFO] Bot başlatılıyor...");
    setBotStatus("loading");
    try {
      const res = await api.post("/bot/start", {});
      if (res.success !== false) {
        setBotStatus("online");
        addLog("[✓] Bot başarıyla başlatıldı!");
        addLog("[INFO] Discord API bağlantısı kuruldu.");
        setStats(s => ({ ...s, cpu: "8", ram: "98" }));
      } else {
        throw new Error(res.error || "Bilinmeyen hata");
      }
    } catch (err) {
      // Demo mode simulation
      setTimeout(() => {
        setBotStatus("online");
        addLog("[✓] Bot başarıyla başlatıldı! (Demo modu)");
        setStats(s => ({ ...s, cpu: "8", ram: "98" }));
      }, 1500);
    }
  };

  const handleBotStop = async () => {
    addLog("[WARN] Bot durduruluyor...");
    setBotStatus("loading");
    try {
      await api.post("/bot/stop", {});
    } catch {}
    setTimeout(() => {
      setBotStatus("offline");
      addLog("[✓] Bot durduruldu.");
      setStats(s => ({ ...s, cpu: "0", ram: "0" }));
    }, 800);
  };

  const handleBotRestart = async () => {
    addLog("[WARN] Bot yeniden başlatılıyor...");
    setBotStatus("loading");
    try {
      await api.post("/bot/restart", {});
    } catch {}
    setTimeout(() => {
      setBotStatus("online");
      addLog("[✓] Bot yeniden başlatıldı.");
    }, 2000);
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setFiles(prev => {
        const exists = prev.findIndex(f => f.name === file.name);
        const newFile = {
          name: file.name, size: file.size,
          modified: "Şimdi", content: e.target.result,
        };
        if (exists >= 0) {
          const updated = [...prev];
          updated[exists] = newFile;
          return updated;
        }
        return [...prev, newFile];
      });
      addLog(`[✓] Dosya yüklendi: ${file.name} (${file.size} byte)`);
    };
    reader.readAsText(file);
  };

  const handleFileDelete = (name) => {
    setFiles(prev => prev.filter(f => f.name !== name));
    addLog(`[WARN] Dosya silindi: ${name}`);
  };

  const handleFileEdit = (file) => {
    setEditingFile({ ...file, content: file.content || `// ${file.name} içeriği burada görünecek\n// Railway backend bağlandığında gerçek içerik yüklenir.\n` });
  };

  const handleFileSave = (name, content) => {
    setFiles(prev => prev.map(f => f.name === name ? { ...f, content, modified: "Şimdi" } : f));
    addLog(`[✓] Dosya kaydedildi: ${name}`);
    setEditingFile(null);
  };

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  const tabs = [
    { id: "bot", label: "BOT KONTROLÜ", icon: "🤖" },
    { id: "terminal", label: "TERMİNAL", icon: "⬛" },
    { id: "files", label: "DOSYALAR", icon: "📁" },
  ];

  return (
    <div style={{
      height: "100vh", display: "flex", flexDirection: "column",
      background: "#060608", fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      color: "#fff", overflow: "hidden",
    }}>
      {/* Top bar */}
      <div style={{
        height: 48, display: "flex", alignItems: "center",
        background: "#080c08", borderBottom: "1px solid rgba(0,255,100,0.1)",
        padding: "0 20px", gap: 16, flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 4,
            background: "rgba(0,255,100,0.15)", border: "1px solid rgba(0,255,100,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
          }}>🤖</div>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#00ff64", letterSpacing: 2 }}>
            BOT PANEL
          </span>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.08)" }} />

        {/* Tabs */}
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: "6px 16px", background: activeTab === tab.id ? "rgba(0,255,100,0.1)" : "transparent",
            border: activeTab === tab.id ? "1px solid rgba(0,255,100,0.25)" : "1px solid transparent",
            borderRadius: 4, color: activeTab === tab.id ? "#00ff64" : "rgba(255,255,255,0.4)",
            cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 700,
            letterSpacing: 1.5, display: "flex", alignItems: "center", gap: 8,
            transition: "all 0.2s",
          }}>
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}

        {/* Right side */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
          {/* Bot status indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
            <div style={{
              width: 7, height: 7, borderRadius: "50%",
              background: botStatus === "online" ? "#00ff64" : botStatus === "loading" ? "#ffaa00" : "#ff5050",
              boxShadow: botStatus === "online" ? "0 0 8px #00ff64" : "none",
              animation: botStatus === "loading" ? "blink 1s infinite" : botStatus === "online" ? "pulse 2s infinite" : "none",
            }} />
            <span style={{ color: "rgba(255,255,255,0.4)" }}>
              {botStatus === "online" ? "ÇEVRİMİÇİ" : botStatus === "loading" ? "BAŞLATILIYOR" : "ÇEVRİMDIŞI"}
            </span>
          </div>

          {/* Railway link */}
          <a href="https://railway.app" target="_blank" rel="noreferrer" style={{
            padding: "4px 12px", background: "rgba(130,0,255,0.15)",
            border: "1px solid rgba(130,0,255,0.3)", borderRadius: 4,
            color: "#a78bfa", fontSize: 10, textDecoration: "none",
            letterSpacing: 1, fontWeight: 700,
          }}>
            RAILWAY ↗
          </a>

          <button onClick={() => { localStorage.removeItem("panel_token"); setAuthed(false); }} style={{
            padding: "4px 10px", background: "transparent",
            border: "1px solid rgba(255,80,80,0.2)", borderRadius: 4,
            color: "rgba(255,80,80,0.6)", cursor: "pointer", fontSize: 11,
          }}>⏻</button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        <div style={{ height: "100%", display: activeTab === "bot" ? "block" : "none", overflowY: "auto" }}>
          <BotControl
            status={botStatus}
            onStart={handleBotStart}
            onStop={handleBotStop}
            onRestart={handleBotRestart}
            uptime={uptime}
            stats={stats}
          />
        </div>
        <div style={{ height: "100%", display: activeTab === "terminal" ? "block" : "none" }}>
          <Terminal logs={logs} onCommand={handleCommand} />
        </div>
        <div style={{ height: "100%", display: activeTab === "files" ? "block" : "none", position: "relative" }}>
          <FileManager
            files={files}
            onUpload={handleFileUpload}
            onDelete={handleFileDelete}
            onEdit={handleFileEdit}
            onRefresh={() => addLog("[INFO] Dosyalar yenilendi.")}
          />
        </div>
      </div>

      {/* Status bar */}
      <div style={{
        height: 24, background: "rgba(0,255,100,0.08)",
        borderTop: "1px solid rgba(0,255,100,0.1)",
        display: "flex", alignItems: "center", padding: "0 16px",
        gap: 20, fontSize: 10, color: "rgba(255,255,255,0.3)",
        letterSpacing: 0.5, flexShrink: 0,
      }}>
        <span style={{ color: "rgba(0,255,100,0.5)" }}>● BOT PANEL v2.0</span>
        <span>Railway Edition</span>
        <span>Node.js + Discord.js</span>
        <span style={{ marginLeft: "auto" }}>{new Date().toLocaleString("tr-TR")}</span>
      </div>

      {/* Code editor modal */}
      {editingFile && (
        <CodeEditor
          file={editingFile}
          onSave={handleFileSave}
          onClose={() => setEditingFile(null)}
        />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; overflow: hidden; }
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px #00ff64; }
          50% { opacity: 0.6; box-shadow: 0 0 16px #00ff64; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; } 50% { opacity: 0.3; }
        }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,255,100,0.2); border-radius: 2px; }
      `}</style>
    </div>
  );
}
