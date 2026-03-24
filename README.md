# SUMIKA — 住宅会社専用 SaaS

## Setup

```bash
# 1. Install dependencies
npm install

# 2. API key sudah ada di .env — jangan di-commit ke Git!

# 3. Taruh file HTML ke folder public/
#    public/index.html        ← sumika.html (rename)
#    public/sumika-proposal.html

# 4. Jalankan dev server
npm run dev

# Buka browser → http://localhost:3000
```

## Struktur folder

```
sumika/
├── server.js          ← Express server + API proxy
├── .env               ← API key (JANGAN commit!)
├── .gitignore
├── package.json
└── public/            ← Semua file HTML di sini
    ├── index.html
    └── sumika-proposal.html
```

## API Endpoint

`POST /api/ai` — proxy ke Anthropic API  
Request body sama persis dengan Anthropic Messages API.

## ⚠️ Keamanan
- File `.env` sudah masuk `.gitignore`
- API key TIDAK boleh di-hardcode di file HTML lagi
- Untuk production: deploy server ke VPS/cloud, bukan expose lokal
