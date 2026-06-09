# MindSpace - AI Psychology PWA Setup

## Prerequisites
- Node.js 18+, Python 3.10+
- [Ollama](https://ollama.ai) installed

## Quick Start

### 1. Install Ollama & Model
```bash
# Install Ollama from https://ollama.ai
ollama pull llama3.1
ollama serve  # Keep running in background
```

### 2. Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
# Runs on http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

Open http://localhost:5173 in your browser.

## PWA Icons (optional)
Add `pwa-192x192.png` and `pwa-512x512.png` to `frontend/public/` for full PWA support.

## Deploy for Free
- **Backend**: [Render.com](https://render.com) free tier (set `OLLAMA_URL` env var)
- **Frontend**: [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
- **Ollama**: Run locally or self-host on a free VPS

## Features
- 🧠 AI Therapy with Dr. Aria (CBT, DBT, Mindfulness, Grief, Anxiety)
- 😊 Mood Tracking with AI insights
- 📔 Therapeutic Journaling with AI analysis
- 📊 Mental Health Assessments (PHQ-9, GAD-7, WEMWBS, PSS-10)
- 🌬️ Breathing exercises & affirmations
- 📱 Full PWA (installable on mobile)
- 🔒 100% local AI via Ollama - complete privacy
