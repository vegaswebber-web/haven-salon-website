// ============================================================
// BOT PANEL - RAILWAY BACKEND
// ============================================================
// Kurulum: npm install
// Çalıştırma: node server.js
// ============================================================

const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const http = require("http");
const { WebSocketServer } = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// ── CONFIG ──────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
const PANEL_PASSWORD = process.env.PANEL_PASSWORD || "admin123";
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey_change_this";
const BOT_ENTRY = process.env.BOT_ENTRY || path.join(__dirname, "bot", "index.js");
const FILES_DIR = path.join(__dirname, "bot");

// ── MIDDLEWARE ───────────────────────────────────────────────
app.use(cors({ origin: "*" }));
app.use(express.json());

// File upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(FILES_DIR)) fs.mkdirSync(FILES_DIR, { recursive: true });
    cb(null, FILES_DIR);
  },
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage, fileFilter: (req, file, cb) => {
  const allowed = [".js", ".json", ".env", ".md", ".txt"];
  const ext = path.extname(file.originalname).toLowerCase();
  cb(null, allowed.includes(ext));
}});

// ── AUTH ─────────────────────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token gerekli" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Geçersiz token" });
  }
};

app.post("/auth/login", (req, res) => {
  const { password } = req.body;
  if (password !== PANEL_PASSWORD) {
    return res.status(401).json({ error: "Hatalı şifre" });
  }
  const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, success: true });
});

// ── BOT PROCESS MANAGEMENT ───────────────────────────────────
let botProcess = null;
let botLogs = [];
let botStartTime = null;
const MAX_LOGS = 500;

const broadcastLog = (message) => {
  const logEntry = { type: "log", message, timestamp: new Date().toISOString() };
  botLogs.push(logEntry);
  if (botLogs.length > MAX_LOGS) botLogs = botLogs.slice(-MAX_LOGS);
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(logEntry));
    }
  });
};

const broadcastStatus = (status) => {
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({ type: "status", status }));
    }
  });
};

const startBot = () => {
  if (botProcess) return { success: false, error: "Bot zaten çalışıyor" };
  if (!fs.existsSync(BOT_ENTRY)) {
    broadcastLog("[ERROR] Bot dosyası bulunamadı: " + BOT_ENTRY);
    return { success: false, error: "Bot dosyası bulunamadı" };
  }

  botProcess = spawn("node", [BOT_ENTRY], {
    cwd: path.dirname(BOT_ENTRY),
    env: { ...process.env },
    stdio: ["pipe", "pipe", "pipe"],
  });

  botStartTime = Date.now();
  broadcastLog("[✓] Bot süreci başlatıldı. PID: " + botProcess.pid);
  broadcastStatus("online");

  botProcess.stdout.on("data", (data) => {
    data.toString().trim().split("\n").forEach(line => {
      if (line) broadcastLog("[INFO] " + line);
    });
  });

  botProcess.stderr.on("data", (data) => {
    data.toString().trim().split("\n").forEach(line => {
      if (line) broadcastLog("[ERROR] " + line);
    });
  });

  botProcess.on("close", (code) => {
    broadcastLog(`[WARN] Bot süreci kapandı. Çıkış kodu: ${code}`);
    broadcastStatus("offline");
    botProcess = null;
    botStartTime = null;
  });

  botProcess.on("error", (err) => {
    broadcastLog("[ERROR] Süreç hatası: " + err.message);
    broadcastStatus("offline");
    botProcess = null;
  });

  return { success: true };
};

const stopBot = () => {
  if (!botProcess) return { success: false, error: "Bot zaten durmuş" };
  botProcess.kill("SIGTERM");
  broadcastLog("[WARN] Bot durduruldu.");
  broadcastStatus("offline");
  botProcess = null;
  botStartTime = null;
  return { success: true };
};

// ── BOT ROUTES ───────────────────────────────────────────────
app.post("/bot/start", authMiddleware, (req, res) => {
  res.json(startBot());
});

app.post("/bot/stop", authMiddleware, (req, res) => {
  res.json(stopBot());
});

app.post("/bot/restart", authMiddleware, (req, res) => {
  stopBot();
  setTimeout(() => {
    const result = startBot();
    res.json(result);
  }, 1000);
});

app.get("/bot/status", authMiddleware, (req, res) => {
  res.json({
    status: botProcess ? "online" : "offline",
    pid: botProcess?.pid || null,
    uptime: botStartTime ? Math.floor((Date.now() - botStartTime) / 1000) : 0,
    logCount: botLogs.length,
  });
});

app.get("/bot/logs", authMiddleware, (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  res.json({ logs: botLogs.slice(-limit) });
});

// ── FILE ROUTES ───────────────────────────────────────────────
app.get("/files", authMiddleware, (req, res) => {
  if (!fs.existsSync(FILES_DIR)) fs.mkdirSync(FILES_DIR, { recursive: true });
  const files = fs.readdirSync(FILES_DIR)
    .filter(name => !name.startsWith(".") && !fs.statSync(path.join(FILES_DIR, name)).isDirectory())
    .map(name => {
      const stat = fs.statSync(path.join(FILES_DIR, name));
      return {
        name,
        size: stat.size,
        modified: stat.mtime.toLocaleString("tr-TR"),
      };
    });
  res.json({ files });
});

app.get("/files/:name", authMiddleware, (req, res) => {
  const filePath = path.join(FILES_DIR, path.basename(req.params.name));
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Dosya bulunamadı" });
  const content = fs.readFileSync(filePath, "utf8");
  res.json({ name: req.params.name, content });
});

app.put("/files/:name", authMiddleware, (req, res) => {
  const filePath = path.join(FILES_DIR, path.basename(req.params.name));
  const { content } = req.body;
  fs.writeFileSync(filePath, content, "utf8");
  res.json({ success: true });
});

app.delete("/files/:name", authMiddleware, (req, res) => {
  const filePath = path.join(FILES_DIR, path.basename(req.params.name));
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  res.json({ success: true });
});

app.post("/files/upload", authMiddleware, upload.array("files"), (req, res) => {
  const uploaded = req.files.map(f => ({ name: f.originalname, size: f.size }));
  res.json({ success: true, files: uploaded });
});

// ── STATS ROUTE ───────────────────────────────────────────────
app.get("/stats", authMiddleware, (req, res) => {
  const memUsage = process.memoryUsage();
  res.json({
    cpu: Math.floor(Math.random() * 20 + 5) + "%", // gerçek CPU için 'os-usage' paketi kullanın
    ram: Math.floor(memUsage.rss / 1024 / 1024) + " MB",
    uptime: botStartTime ? Math.floor((Date.now() - botStartTime) / 1000) : 0,
    botRunning: !!botProcess,
  });
});

// ── WEBSOCKET ─────────────────────────────────────────────────
wss.on("connection", (ws) => {
  console.log("Panel bağlandı via WebSocket");
  // Son 50 logu gönder
  botLogs.slice(-50).forEach(log => {
    ws.send(JSON.stringify(log));
  });
  ws.send(JSON.stringify({
    type: "status",
    status: botProcess ? "online" : "offline",
  }));
});

// ── START ─────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`Bot Panel Backend çalışıyor: http://localhost:${PORT}`);
  console.log(`Panel şifresi: ${PANEL_PASSWORD}`);
  if (!fs.existsSync(FILES_DIR)) fs.mkdirSync(FILES_DIR, { recursive: true });
});
