# 🚀 Deployment Guide: FastAPI on Render & Next.js on Vercel

This guide provides step-by-step instructions to deploy the **FastAPI backend on Render** and the **Next.js frontend on Vercel**, complete with seamless cross-origin communication (CORS).

---

## 📋 Overview & Prerequisites

### Architecture
- **Backend**: FastAPI running on Render (`https://<your-service>.onrender.com`)
- **Frontend**: Next.js 16 running on Vercel (`https://<your-app>.vercel.app`)
- **CORS**: Configured in FastAPI to automatically allow all `*.vercel.app` domains, localhost, and custom domains via the `FRONTEND_URL` environment variable.

### Prerequisites
1. A [GitHub](https://github.com/) account with this repository pushed (`TheUzair/AI-Learning-Lab`).
2. A free [Render](https://render.com/) account.
3. A free [Vercel](https://vercel.com/) account.
4. Your [Groq Cloud API Key](https://console.groq.com/keys).

---

## Part 1: Deploy FastAPI Backend on Render

### Step 1: Create a New Web Service
1. Go to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → **Web Service**.
3. Choose **Build and deploy from a Git repository**.
4. Connect and select your repository: `TheUzair/AI-Learning-Lab`.

### Step 2: Configure Service Settings
In the setup screen, fill in the following fields:

| Field | Value | Notes |
| :--- | :--- | :--- |
| **Name** | `web-chatbot-api` | Or any unique name you prefer |
| **Region** | Choose closest to you (e.g. *Frankfurt / Oregon / Singapore*) | |
| **Branch** | `main` | |
| **Root Directory** | `02-web-chatbot` | **Crucial:** Monorepo subfolder |
| **Runtime** | `Python 3` | |
| **Build Command** | `pip install -r requirements.txt` | |
| **Start Command** | `uvicorn web_chatbot.main:app --host 0.0.0.0 --port $PORT` | |
| **Instance Type** | **Free** | |

### Step 3: Add Environment Variables
Scroll down to **Environment Variables** and add:

| Key | Value | Description |
| :--- | :--- | :--- |
| `GROQ_API_KEY` | `gsk_...` | Your actual Groq Cloud API Key |
| `GROQ_MODEL` | `openai/gpt-oss-120b` | High-intelligence model on Groq LPUs |
| `PYTHON_VERSION` | `3.11.9` | Ensures Python 3.11 runtime |
| `FRONTEND_URL` | *(Optional)* | Custom frontend domain if not on `*.vercel.app` |

### Step 4: Deploy & Verify
1. Click **Create Web Service**.
2. Render will build and start your application.
3. Once the deployment finishes, copy your Render service URL (e.g., `https://web-chatbot-api.onrender.com`).
4. Test the health check in your browser:
   - `https://web-chatbot-api.onrender.com/` → should return `{"status":"ok","message":"AI Chatbot API is operational"}`
   - `https://web-chatbot-api.onrender.com/docs` → interactive Swagger UI.

---

## Part 2: Deploy Next.js Frontend on Vercel

### Step 1: Import Project into Vercel
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository: `TheUzair/AI-Learning-Lab`.

### Step 2: Configure Project & Root Directory
In the configuration screen:

1. Click **Edit** next to **Root Directory**.
2. Select **`02-web-chatbot/frontend`** and click **Continue**.
3. **Framework Preset**: Vercel will automatically detect `Next.js`.
4. Keep the default Build and Output Settings.

### Step 3: Set Environment Variables
Expand the **Environment Variables** section and add:

| Key | Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://web-chatbot-api.onrender.com` | **Your Render service URL from Part 1** (without trailing slash) |

### Step 4: Deploy & Test
1. Click **Deploy**.
2. Vercel will build and deploy the Next.js application in ~1 minute.
3. Once complete, click your deployment URL (e.g., `https://ai-learning-lab-frontend.vercel.app`).
4. You will see the **Nova AI** interface:
   - Check the top navbar: the status badge should show **FastAPI Online** in green.
   - The footer will display `FastAPI: web-chatbot-api.onrender.com`.
   - Send a message to confirm real-time answers from Groq!

---

## Part 3: How CORS is Connected

In [`02-web-chatbot/src/web_chatbot/main.py`](src/web_chatbot/main.py), CORS is configured dynamically:

```python
frontend_env = os.getenv("FRONTEND_URL", "")
frontend_urls = [url.strip().rstrip("/") for url in frontend_env.split(",") if url.strip()]

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
] + frontend_urls

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Why this works seamlessly:
- **`allow_origin_regex=r"https://.*\.vercel\.app"`**: Automatically authorizes **all Vercel deployments** (production URLs, preview URLs, branch URLs) without requiring any manual origin changes.
- **`FRONTEND_URL`**: Allows adding custom domains (e.g., `https://chat.yourdomain.com`).
- **`origins`**: Preserves local development on `localhost:3000`.

---

## 🛠️ Troubleshooting

### 1. Render Free Tier Cold Starts
- On Render's Free tier, the service spins down after 15 minutes of inactivity.
- The first request after sleep may take ~30–50 seconds while the container boots up. The frontend status badge will display `Connecting...` until the backend is active.

### 2. CORS Error in Browser Console
- If using a custom domain (not `*.vercel.app`), go to your Render Web Service settings → **Environment Variables** → add `FRONTEND_URL=https://your-custom-domain.com`.
- Render will automatically redeploy with the new allowed origin.

### 3. Vercel 404 on API requests
- Ensure `NEXT_PUBLIC_API_URL` on Vercel is set to your Render URL starting with `https://` (e.g. `https://web-chatbot-api.onrender.com`).
- Note: Environment variables prefixed with `NEXT_PUBLIC_` are baked in at build time; if you change the value on Vercel, click **Redeploy** to trigger a fresh build.
