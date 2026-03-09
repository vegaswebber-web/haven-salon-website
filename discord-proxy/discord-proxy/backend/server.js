const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 3001;

// ─── CORS: Cloudflare Pages domainine izin ver ───────────────────────────────
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  /\.pages\.dev$/,          // tüm *.pages.dev subdomainleri
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const allowed = ALLOWED_ORIGINS.some(o =>
      typeof o === "string" ? o === origin : o.test(origin)
    );
    cb(allowed ? null : new Error("CORS blocked"), allowed);
  },
  credentials: true,
}));

app.use(cookieParser());

// ─── Keep-Alive: Railway sleep'e almasın ─────────────────────────────────────
app.get("/ping", (_req, res) => res.json({ ok: true, ts: Date.now() }));

// ─── Discord Proxy ────────────────────────────────────────────────────────────
// discord.com  →  /proxy/discord/
app.use(
  "/proxy/discord",
  createProxyMiddleware({
    target: "https://discord.com",
    changeOrigin: true,
    secure: true,
    pathRewrite: { "^/proxy/discord": "" },
    on: {
      proxyReq: (proxyReq, req) => {
        // Gerçek tarayıcı gibi görün
        proxyReq.setHeader("User-Agent",
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36");
        proxyReq.setHeader("Accept-Language", "tr-TR,tr;q=0.9,en;q=0.8");

        // Kullanıcının Discord token'ını ilet
        if (req.cookies?.discord_token) {
          proxyReq.setHeader("Authorization", req.cookies.discord_token);
        }
      },
      proxyRes: (proxyRes, _req, res) => {
        // Güvenlik başlıklarını gevşet ki iframe çalışsın
        proxyRes.headers["access-control-allow-origin"] = "*";
        delete proxyRes.headers["x-frame-options"];
        delete proxyRes.headers["content-security-policy"];
        delete proxyRes.headers["x-content-type-options"];

        // Cookieleri SameSite=None yaparak cross-site iletmeye izin ver
        const sc = proxyRes.headers["set-cookie"];
        if (sc) {
          proxyRes.headers["set-cookie"] = sc.map(c =>
            c.replace(/SameSite=\w+/i, "SameSite=None").replace(/Secure;?/i, "") + "; SameSite=None; Secure"
          );
        }
      },
      error: (err, _req, res) => {
        console.error("Proxy error:", err.message);
        res.status(502).json({ error: "Proxy bağlantı hatası", detail: err.message });
      },
    },
    // WebSocket desteği (Discord gerçek zamanlı)
    ws: true,
  })
);

// ─── Discord CDN Proxy (resim/medya) ─────────────────────────────────────────
app.use(
  "/proxy/cdn",
  createProxyMiddleware({
    target: "https://cdn.discordapp.com",
    changeOrigin: true,
    secure: true,
    pathRewrite: { "^/proxy/cdn": "" },
    on: {
      proxyRes: (proxyRes) => {
        delete proxyRes.headers["x-frame-options"];
        proxyRes.headers["cache-control"] = "public, max-age=86400";
      },
    },
  })
);

// ─── Session token kaydet (frontend'den çağrılır) ─────────────────────────────
app.use(express.json());

app.post("/session/save", (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Token gerekli" });

  // HttpOnly cookie → XSS koruması, 365 gün
  res.cookie("discord_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 365 * 24 * 60 * 60 * 1000,
    path: "/",
  });
  res.json({ ok: true });
});

app.post("/session/clear", (_req, res) => {
  res.clearCookie("discord_token");
  res.json({ ok: true });
});

app.get("/session/check", (req, res) => {
  res.json({ loggedIn: !!req.cookies?.discord_token });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`🚀 Proxy sunucusu çalışıyor: http://localhost:${PORT}`));
