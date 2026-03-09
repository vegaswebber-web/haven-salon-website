# Discord Proxy — Kurulum & Deploy Rehberi

## 📁 Proje Yapısı

```
discord-proxy/
├── backend/          → Railway'e deploy edilir (Node.js proxy sunucu)
│   ├── server.js
│   ├── package.json
│   └── railway.toml
├── frontend/         → Cloudflare Pages'e deploy edilir (React UI)
│   ├── src/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   │   ├── _headers
│   │   └── _redirects
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── .env.example
```

---

## 🚂 1. BACKEND → Railway Deploy

### Adım 1: GitHub'a yükle
```bash
cd backend
git init
git add .
git commit -m "initial"
git remote add origin https://github.com/KULLANICIN/discord-proxy-backend.git
git push -u origin main
```

### Adım 2: Railway'de proje oluştur
1. https://railway.app → New Project → Deploy from GitHub Repo
2. `backend` klasörünü seç
3. **Environment Variables** ekle:
   ```
   FRONTEND_URL = https://discord-proxy.pages.dev
   ```
4. Deploy tamamlandıktan sonra **domain URL'ini kopyala** (örn: `https://discord-proxy-backend.up.railway.app`)

### ⚠️ Railway Sleep Sorunu (ÖNEMLİ)
Railway ücretsiz planda sunucuyu uyutabilir. Bunu engellemek için:
- **Seçenek A**: Railway'de **Hobby Plan** ($5/ay) al → sleep yok
- **Seçenek B**: UptimeRobot.com'da ücretsiz monitor oluştur:
  - URL: `https://your-app.up.railway.app/ping`
  - Interval: 5 dakika
  - → Sunucu hiç uyumaz ✅

---

## ☁️ 2. FRONTEND → Cloudflare Pages Deploy

### Adım 1: GitHub'a yükle
```bash
cd frontend
git init
git add .
git commit -m "initial"
git remote add origin https://github.com/KULLANICIN/discord-proxy-frontend.git
git push -u origin main
```

### Adım 2: Cloudflare Pages'te proje oluştur
1. https://dash.cloudflare.com → Workers & Pages → Create Application → Pages
2. GitHub reposunu bağla (`discord-proxy-frontend`)
3. **Build settings:**
   ```
   Framework preset : Vite
   Build command    : npm run build
   Build output dir : dist
   ```
4. **Environment Variables:**
   ```
   VITE_BACKEND_URL = https://discord-proxy-backend.up.railway.app
   ```
5. "Save and Deploy" → birkaç dakika bekle

### Adım 3: CORS güncelle
Cloudflare Pages URL'ini (örn: `https://discord-proxy.pages.dev`) Railway'deki
`FRONTEND_URL` environment variable'ına ekle ve Railway'i yeniden deploy et.

---

## 🔐 Oturum Sistemi

- Giriş yapıldığında token **localStorage**'a kaydedilir
- Aynı anda backend'de **HttpOnly cookie** (365 gün) oluşturulur
- Tarayıcı kapansa, bilgisayar yeniden başlatılsa bile oturum açık kalır
- "Çıkış" butonuna basılmadıkça oturum silinmez

---

## 🔑 Discord Token Nasıl Bulunur?

1. https://discord.com/app adresine git (tarayıcıda)
2. F12 → Network sekmesi
3. Herhangi bir isteğe tıkla (örn: `science`, `users/@me`)
4. Request Headers → `Authorization` değerini kopyala
5. Proxy giriş ekranına yapıştır

> ⚠️ Token'ını kimseyle paylaşma. Bu token hesabına tam erişim sağlar.

---

## 🌐 Keep-Alive Detayı

Frontend her 4 dakikada bir `GET /ping` isteği gönderir.
Bu, Railway sunucusunun uyumasını engeller (ücretsiz plan için UptimeRobot ile birlikte kullanılmalı).

---

## 📝 Notlar

- Discord iframe yüklenmezse: Discord'un bazı sayfaları iframe'i engeller.
  Bu durumda proxy URL'ini doğrudan yeni sekmede aç.
- WebSocket bağlantısı için Railway'de **TCP Proxy** özelliği aktif olmalı.
