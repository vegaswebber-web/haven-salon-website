const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function json(data, status = 200) {
  return Response.json(data, { status, headers: CORS })
}

// ─── Welkomstmail via Resend ─────────────────────────────────────────
// Vereist: wrangler secret put RESEND_API_KEY  (haal op via resend.com)
// Vereist: info@havensalon.nl als geverifieerd afzenderdomein in Resend
async function sendWelcomeEmail(naam, email, env) {
  if (!env.RESEND_API_KEY) return // Stil doorgaan als key niet is ingesteld
  const html = `
    <!DOCTYPE html>
    <html lang="nl">
    <head><meta charset="UTF-8"><style>
      body{font-family:Georgia,serif;background:#0f0f0f;color:#c8c2bc;margin:0;padding:0}
      .wrap{max-width:520px;margin:40px auto;background:#1a1a1a;border:1px solid rgba(201,169,110,.15);padding:48px 40px}
      .logo{font-size:1.6rem;letter-spacing:3px;color:#c9a96e;margin-bottom:4px}
      .sub{font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#555;margin-bottom:32px}
      h2{font-size:1.4rem;color:#f0ece6;margin:0 0 16px}
      p{font-size:14px;line-height:1.8;color:#9e9890;margin:0 0 16px}
      .gold{color:#c9a96e}
      .btn{display:inline-block;padding:14px 32px;background:#c9a96e;color:#0f0f0f;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;text-decoration:none;margin-top:8px}
      .footer{margin-top:40px;padding-top:24px;border-top:1px solid rgba(201,169,110,.12);font-size:11px;color:#555}
    </style></head>
    <body>
      <div class="wrap">
        <div class="logo">Haven Salon</div>
        <div class="sub">Volendam</div>
        <h2>Welkom, <span class="gold">${naam}</span>!</h2>
        <p>Bedankt voor je registratie bij Haven Salon. Wij zijn blij je te verwelkomen.</p>
        <p>Je kunt nu eenvoudig online een afspraak maken. Wij zorgen voor een look die écht bij jou past.</p>
        <a href="https://havensalon.nl" class="btn">Afspraak maken</a>
        <div class="footer">
          <p>Haven Salon · Volendam<br>
          <a href="mailto:info@havensalon.nl" style="color:#c9a96e">info@havensalon.nl</a></p>
          <p style="color:#444">Dit bericht is verzonden omdat je je hebt geregistreerd op havensalon.nl.</p>
        </div>
      </div>
    </body>
    </html>
  `
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Haven Salon <info@havensalon.nl>',
      to: [email],
      subject: `Welkom bij Haven Salon, ${naam}!`,
      html,
    }),
  }).catch(() => {}) // Stille fout — mail niet kritisch
}

function isAdmin(request, env) {
  const auth = request.headers.get('Authorization') || ''
  return auth === `Bearer ${env.ADMIN_PASSWORD}`
}

// ─── Admin panel HTML ───────────────────────────────────────────
const ADMIN_HTML = `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Haven Salon · Admin</title>
<style>
  :root{--gold:#c9a96e;--gold-l:#e0bc86;--bg:#0f0f0f;--bg2:#1a1a1a;--bg3:#111;--text:#c8c2bc;--muted:#555;--border:rgba(201,169,110,.15)}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,sans-serif;background:var(--bg);color:var(--text);min-height:100vh}
  .logo{font-size:1.4rem;letter-spacing:2px;color:var(--gold);font-weight:300}
  header{display:flex;align-items:center;justify-content:space-between;padding:20px 32px;border-bottom:1px solid var(--border);background:var(--bg3)}
  .btn{padding:10px 22px;border:1px solid var(--border);background:transparent;color:var(--gold);font-size:12px;letter-spacing:1px;text-transform:uppercase;cursor:pointer;transition:.2s}
  .btn:hover{background:var(--gold);color:#0f0f0f;border-color:var(--gold)}
  .btn-danger{border-color:#a03030;color:#e07070}
  .btn-danger:hover{background:#a03030;color:#fff;border-color:#a03030}
  .btn-success{border-color:#2a7a3a;color:#5dc878}
  .btn-success:hover{background:#2a7a3a;color:#fff;border-color:#2a7a3a}
  main{max-width:900px;margin:0 auto;padding:40px 24px}
  h2{font-size:1rem;font-weight:500;letter-spacing:1px;text-transform:uppercase;color:var(--gold);margin-bottom:20px}
  .card{background:var(--bg2);border:1px solid var(--border);padding:28px;margin-bottom:24px}
  .status-row{display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap}
  .status-badge{font-size:13px;display:flex;align-items:center;gap:8px}
  .dot{width:10px;height:10px;border-radius:50%;background:#555}
  .dot.open{background:#4caf50}
  .dot.closed{background:#e07070}
  .appt-card{border:1px solid var(--border);padding:20px 24px;margin-bottom:12px;background:var(--bg)}
  .appt-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:8px}
  .appt-name{font-weight:600;color:#f0ece6}
  .appt-date{font-size:11px;color:var(--muted)}
  .appt-contact{font-size:12px;color:var(--muted);margin-bottom:8px}
  .appt-msg{font-size:13px;color:var(--text);line-height:1.6;background:var(--bg3);padding:10px 14px;border-left:2px solid var(--gold)}
  .empty{text-align:center;padding:48px;color:var(--muted);font-size:14px}
  /* Login */
  #login{display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}
  .login-box{width:100%;max-width:360px;background:var(--bg2);border:1px solid var(--border);padding:48px 36px;text-align:center}
  .login-title{font-size:1.4rem;color:#f0ece6;margin-bottom:8px}
  .login-sub{font-size:13px;color:var(--muted);margin-bottom:32px}
  .login-input{width:100%;padding:13px 16px;background:var(--bg);border:1px solid var(--border);color:#f0ece6;font-size:14px;outline:none;margin-bottom:14px;text-align:center}
  .login-input:focus{border-color:var(--gold)}
  .login-btn{width:100%;padding:13px;background:var(--gold);border:none;color:#0f0f0f;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;cursor:pointer}
  .login-btn:hover{background:var(--gold-l)}
  .error-msg{font-size:12px;color:#e07070;margin-top:10px}
  .hidden{display:none!important}
  .logout-btn{background:none;border:none;color:var(--muted);font-size:12px;cursor:pointer;letter-spacing:1px}
  .logout-btn:hover{color:var(--gold)}
  .refresh-btn{font-size:11px}
</style>
</head>
<body>

<!-- LOGIN -->
<div id="login">
  <div class="login-box">
    <div class="login-title">Haven Salon</div>
    <div class="login-sub">Admin Panel</div>
    <input class="login-input" type="password" id="pw" placeholder="Wachtwoord" onkeydown="if(event.key==='Enter')login()">
    <button class="login-btn" onclick="login()">Inloggen</button>
    <div class="error-msg hidden" id="login-err">Verkeerd wachtwoord</div>
  </div>
</div>

<!-- DASHBOARD -->
<div id="dashboard" class="hidden">
  <header>
    <span class="logo">HAVEN SALON · ADMIN</span>
    <div style="display:flex;gap:12px;align-items:center">
      <button class="btn refresh-btn" onclick="load()">Vernieuwen</button>
      <button class="logout-btn" onclick="logout()">Uitloggen</button>
    </div>
  </header>

  <main>
    <!-- Status card -->
    <div class="card">
      <h2>Website Status</h2>
      <div class="status-row">
        <div class="status-badge">
          <div class="dot" id="status-dot"></div>
          <span id="status-text">–</span>
        </div>
        <button class="btn" id="toggle-btn" onclick="toggleStatus()">–</button>
      </div>
      <p style="margin-top:14px;font-size:12px;color:var(--muted)">
        Preview de site (terwijl coming soon actief is):
        <a href="/?preview=1" target="_blank" style="color:var(--gold)">Website openen ↗</a>
      </p>
    </div>

    <!-- Appointments -->
    <div class="card">
      <h2>Afspraken aanvragen <span id="count" style="color:var(--muted)"></span></h2>
      <div id="appointments"><div class="empty">Laden…</div></div>
    </div>
  </main>
</div>

<script>
let token = localStorage.getItem('haven_token') || ''
const BASE = location.origin

async function login() {
  token = document.getElementById('pw').value
  const res = await fetch(BASE + '/api/appointments', {
    headers: { Authorization: 'Bearer ' + token }
  })
  if (res.ok) {
    localStorage.setItem('haven_token', token)
    document.getElementById('login').classList.add('hidden')
    document.getElementById('dashboard').classList.remove('hidden')
    load()
  } else {
    document.getElementById('login-err').classList.remove('hidden')
  }
}

function logout() {
  localStorage.removeItem('haven_token')
  location.reload()
}

async function load() {
  await Promise.all([loadStatus(), loadAppointments()])
}

async function loadStatus() {
  const r = await fetch(BASE + '/api/status')
  const { status } = await r.json()
  updateStatusUI(status)
}

function updateStatusUI(status) {
  const dot = document.getElementById('status-dot')
  const text = document.getElementById('status-text')
  const btn = document.getElementById('toggle-btn')
  if (status === 'open') {
    dot.className = 'dot open'
    text.textContent = 'Website is OPEN'
    btn.textContent = 'Sluiten (coming soon)'
    btn.className = 'btn btn-danger'
  } else {
    dot.className = 'dot closed'
    text.textContent = 'Website is GESLOTEN — Coming Soon actief'
    btn.textContent = 'Website openen'
    btn.className = 'btn btn-success'
  }
}

async function toggleStatus() {
  const r = await fetch(BASE + '/api/toggle', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token }
  })
  const { status } = await r.json()
  updateStatusUI(status)
}

async function loadAppointments() {
  const r = await fetch(BASE + '/api/appointments', {
    headers: { Authorization: 'Bearer ' + token }
  })
  const { appointments } = await r.json()
  const container = document.getElementById('appointments')
  const count = document.getElementById('count')
  if (!appointments || !appointments.length) {
    container.innerHTML = '<div class="empty">Nog geen afspraken aangevraagd.</div>'
    count.textContent = ''
    return
  }
  count.textContent = '(' + appointments.length + ')'
  const sorted = appointments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  container.innerHTML = sorted.map(a => \`
    <div class="appt-card">
      <div class="appt-head">
        <span class="appt-name">\${esc(a.naam)}</span>
        <span class="appt-date">\${new Date(a.timestamp).toLocaleString('nl-NL')}</span>
      </div>
      <div class="appt-contact">
        \${a.email !== '-' ? '📧 ' + esc(a.email) : ''}
        \${a.telefoon ? ' &nbsp;·&nbsp; 📞 ' + esc(a.telefoon) : ''}
      </div>
      <div class="appt-msg">\${esc(a.bericht)}</div>
    </div>
  \`).join('')
}

function esc(s) {
  if (!s) return ''
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

// Auto login if token in storage
if (token) {
  fetch(BASE + '/api/appointments', { headers: { Authorization: 'Bearer ' + token } })
    .then(r => {
      if (r.ok) {
        document.getElementById('login').classList.add('hidden')
        document.getElementById('dashboard').classList.remove('hidden')
        load()
      }
    })
}
</script>
</body>
</html>`

// ─── Worker ──────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const path = url.pathname
    const method = request.method

    if (method === 'OPTIONS') {
      return new Response(null, { headers: CORS })
    }

    // ── Admin panel HTML ──
    if (path === '/' || path === '/admin') {
      return new Response(ADMIN_HTML, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
      })
    }

    // ── Public: site status ──
    if (path === '/api/status' && method === 'GET') {
      const status = (await env.HAVEN_KV.get('site_status')) ?? 'coming_soon'
      return json({ status })
    }

    // ── Public: submit contact/appointment ──
    if (path === '/api/contact' && method === 'POST') {
      try {
        const body = await request.json()
        if (!body.naam || !body.bericht) return json({ error: 'Missing fields' }, 400)
        const id = `appointment:${Date.now()}`
        await env.HAVEN_KV.put(id, JSON.stringify({
          ...body,
          timestamp: new Date().toISOString(),
        }))
        return json({ success: true })
      } catch {
        return json({ error: 'Invalid request' }, 400)
      }
    }

    // ── Public: register → stuur welkomstmail ──
    if (path === '/api/register' && method === 'POST') {
      try {
        const { naam, email } = await request.json()
        if (!naam || !email) return json({ error: 'Missing fields' }, 400)
        await sendWelcomeEmail(naam, email, env)
        return json({ success: true })
      } catch {
        return json({ error: 'Invalid request' }, 400)
      }
    }

    // ── Admin: list appointments ──
    if (path === '/api/appointments' && method === 'GET') {
      if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401)
      const list = await env.HAVEN_KV.list({ prefix: 'appointment:' })
      const appointments = await Promise.all(
        list.keys.map(k => env.HAVEN_KV.get(k.name, 'json'))
      )
      return json({ appointments: appointments.filter(Boolean) })
    }

    // ── Admin: toggle open/coming_soon ──
    if (path === '/api/toggle' && method === 'POST') {
      if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401)
      const current = (await env.HAVEN_KV.get('site_status')) ?? 'coming_soon'
      const next = current === 'open' ? 'coming_soon' : 'open'
      await env.HAVEN_KV.put('site_status', next)
      return json({ status: next })
    }

    return new Response('Not found', { status: 404, headers: CORS })
  },
}
