const fs = require('fs');
const path = require('path');
let createCanvas, loadImage;
try {
  // prefer napi canvas if installed
  ({ createCanvas, loadImage } = require('@napi-rs/canvas'));
} catch (e) {
  try { ({ createCanvas, loadImage } = require('canvas')); } catch (e2) { /* will fallback later */ }
}
const axios = require('axios');

async function fetchImageBuffer(url) {
  const resp = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(resp.data);
}

// Simple on-disk cache for album art
function ensureCacheDir() {
  const dir = path.join(process.cwd(), 'cache', 'art');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

async function getCachedArt(url) {
  if (!url) return null;
  const id = Buffer.from(url).toString('base64').slice(0, 20);
  const dir = ensureCacheDir();
  const fp = path.join(dir, `${id}.jpg`);
  if (fs.existsSync(fp)) return fp;
  try {
    const buf = await fetchImageBuffer(url);
    fs.writeFileSync(fp, buf);
    return fp;
  } catch (e) { return null; }
}

async function generateNowPlayingCard({ track, user, avatarUrl }) {
  if (!createCanvas || !loadImage) {
    throw new Error('Canvas library not found. Install @napi-rs/canvas or canvas.');
  }

  const width = 900, height = 300;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  ctx.clearRect(0, 0, width, height);
  const padding = 30;
  const artSize = 240;
  const artX = width - padding - artSize;
  const artY = (height - artSize) / 2;
  const cardX = padding; const cardY = padding; const cardW = width - padding * 3 - artSize; const cardH = height - padding * 2; const radius = 20;

  // Background card
  ctx.fillStyle = '#111'; roundRect(ctx, cardX, cardY, cardW, cardH, radius); ctx.fill();
  ctx.fillStyle = '#0f0f0f'; roundRect(ctx, cardX + 4, cardY + 4, cardW - 8, cardH - 8, radius - 2); ctx.fill();

  // Title
  ctx.fillStyle = '#fff'; ctx.font = 'bold 36px Sans'; const titleText = (track.title || '').toUpperCase();
  const maxTitleWidth = cardW - 40; let drawTitle = titleText;
  if (ctx.measureText(drawTitle).width > maxTitleWidth) { while (ctx.measureText(drawTitle + '...').width > maxTitleWidth && drawTitle.length > 0) drawTitle = drawTitle.slice(0, -1); drawTitle += '...'; }
  ctx.fillText(drawTitle, cardX + 20, cardY + 70);

  // Artist
  ctx.fillStyle = '#bdbdbd'; ctx.font = '22px Sans'; ctx.fillText(track.artists || '', cardX + 20, cardY + 110);

  // progress
  const s = track.progress_ms || 0; const dur = track.duration_ms || 1; const progress = Math.max(0, Math.min(1, s / dur));
  const barX = cardX + 20; const barW = cardW - 40; const barY = cardY + cardH - 70; const barH = 18;
  ctx.fillStyle = '#2f3136'; roundRect(ctx, barX, barY, barW, barH, 10); ctx.fill();
  const filledW = Math.max(6, Math.round(barW * progress)); ctx.fillStyle = '#1DB954'; roundRect(ctx, barX, barY, filledW, barH, 10); ctx.fill();
  const handleX = barX + filledW; const handleY = barY + barH / 2; ctx.beginPath(); ctx.fillStyle = '#1DB954'; ctx.arc(handleX, handleY, 10, 0, Math.PI * 2); ctx.fill();

  // time
  const fmt = ms => { const t = Math.floor(ms / 1000); const mm = Math.floor(t / 60).toString().padStart(2, '0'); const ss = (t % 60).toString().padStart(2, '0'); return `${mm}:${ss}`; };
  ctx.fillStyle = '#fff'; ctx.font = '16px Sans'; ctx.fillText(fmt(s), barX, barY + barH + 22); const rightTxt = fmt(dur); const rightWidth = ctx.measureText(rightTxt).width; ctx.fillText(rightTxt, barX + barW - rightWidth, barY + barH + 22);

  // album art
  if (track.albumArt) {
    try {
      const cached = await getCachedArt(track.albumArt);
      const img = await loadImage(cached || track.albumArt);
      const r = 12; ctx.save(); roundRect(ctx, artX, artY, artSize, artSize, r); ctx.clip(); ctx.drawImage(img, artX, artY, artSize, artSize); ctx.restore();
      const redH = 8; const redY = artY + artSize - redH; ctx.fillStyle = '#b80d0d'; ctx.fillRect(artX, redY, Math.max(2, Math.round(artSize * progress)), redH);
    } catch (e) { ctx.fillStyle = '#202020'; roundRect(ctx, artX, artY, artSize, artSize, 12); ctx.fill(); }
  } else { ctx.fillStyle = '#202020'; roundRect(ctx, artX, artY, artSize, artSize, 12); ctx.fill(); }

  // user's avatar circle
  try {
    const avatarBuf = await fetchImageBuffer(avatarUrl);
    const img = await loadImage(avatarBuf);
    const ax = cardX + 20; const ay = cardY + cardH - 20 - 64; const aw = 64; const ah = 64; ctx.save(); ctx.beginPath(); ctx.arc(ax + aw/2, ay + ah/2, aw/2, 0, Math.PI*2); ctx.closePath(); ctx.clip(); ctx.drawImage(img, ax, ay, aw, ah); ctx.restore();
  } catch (e) {}

  return canvas.toBuffer('image/png');
}

module.exports = { generateNowPlayingCard };
