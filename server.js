require('dotenv').config();
const express = require('express');
const fetch   = require('node-fetch');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;
const ANTHROPIC_KEY   = process.env.ANTHROPIC_API_KEY;
const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

/* ── Anthropic proxy ── */
app.post('/api/ai', async (req, res) => {
  if (!ANTHROPIC_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' });
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify(req.body),
    });
    res.status(r.status).json(await r.json());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── Replicate: flux-kontext-pro (clearance) ── */
app.post('/api/replicate', async (req, res) => {
  if (!REPLICATE_TOKEN) return res.status(500).json({ error: 'REPLICATE_API_TOKEN not set' });
  try {
    const r = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-kontext-pro/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${REPLICATE_TOKEN}`, 'Prefer': 'wait=5' },
      body: JSON.stringify(req.body),
    });
    res.status(r.status).json(await r.json());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── Replicate: crystal-upscaler ── */
app.post('/api/upscale', async (req, res) => {
  if (!REPLICATE_TOKEN) return res.status(500).json({ error: 'REPLICATE_API_TOKEN not set' });
  try {
    const r = await fetch('https://api.replicate.com/v1/models/philz1337x/crystal-upscaler/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${REPLICATE_TOKEN}` },
      body: JSON.stringify(req.body),
    });
    res.status(r.status).json(await r.json());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── Replicate: poll prediction by ID ── */
app.get('/api/replicate/:id', async (req, res) => {
  if (!REPLICATE_TOKEN) return res.status(500).json({ error: 'REPLICATE_API_TOKEN not set' });
  try {
    const r = await fetch(`https://api.replicate.com/v1/predictions/${req.params.id}`, {
      headers: { 'Authorization': `Token ${REPLICATE_TOKEN}` }
    });
    res.status(r.status).json(await r.json());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

/* ── HTTP server (localhost) ── */
app.listen(PORT, () => {
  console.log(`\n  ┌──────────────────────────────────────────────────┐`);
  console.log(`  │  SUMIKA  →  http://localhost:${PORT}                   │`);
  console.log(`  │  Anthropic : ${ANTHROPIC_KEY ? '✓' : '✗ NOT SET'}                              │`);
  console.log(`  │  Replicate : ${REPLICATE_TOKEN ? '✓' : '✗ NOT SET'}                              │`);
  console.log(`  └──────────────────────────────────────────────────┘\n`);
});

/* ── HTTPS server (for mobile camera access on LAN) ── */
try {
  const https = require('https');
  const fs    = require('fs');
  const HTTPS_PORT = process.env.HTTPS_PORT || 3443;
  const certPath = path.join(__dirname, 'cert.pem');
  const keyPath  = path.join(__dirname, 'key.pem');
  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    const opts = { cert: fs.readFileSync(certPath), key: fs.readFileSync(keyPath) };
    https.createServer(opts, app).listen(HTTPS_PORT, () => {
      // Get local IP
      const nets = require('os').networkInterfaces();
      let localIP = 'YOUR_PC_IP';
      for (const iface of Object.values(nets)) {
        for (const alias of iface) {
          if (alias.family === 'IPv4' && !alias.internal) { localIP = alias.address; break; }
        }
        if (localIP !== 'YOUR_PC_IP') break;
      }
      console.log(`  ┌──────────────────────────────────────────────────┐`);
      console.log(`  │  📱 MOBILE (HTTPS) →  https://${localIP}:${HTTPS_PORT}  │`);
      console.log(`  │  ⚠ Accept self-signed cert warning in browser    │`);
      console.log(`  └──────────────────────────────────────────────────┘\n`);
    });
  }
} catch(e) { /* HTTPS optional */ }

/* ── Replicate: Gemini 3.1 Pro (vision) ── */
app.post('/api/gemini', async (req, res) => {
  if (!REPLICATE_TOKEN) return res.status(500).json({ error: 'REPLICATE_API_TOKEN not set' });
  try {
    const r = await fetch('https://api.replicate.com/v1/models/google/gemini-3.1-pro/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${REPLICATE_TOKEN}` },
      body: JSON.stringify(req.body),
    });
    const text = await r.text();
    res.status(r.status).type('json').send(text);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── Replicate: flux-2-pro (text-to-image + img ref) ── */
app.post('/api/flux2pro', async (req, res) => {
  if (!REPLICATE_TOKEN) return res.status(500).json({ error: 'REPLICATE_API_TOKEN not set' });
  try {
    const r = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-2-pro/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${REPLICATE_TOKEN}` },
      body: JSON.stringify(req.body),
    });
    const text = await r.text();
    res.status(r.status).type('json').send(text);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
