# 🧪 AI Learning Lab

A structured, hands-on journey toward AI Engineering — progressing from core Python fundamentals to full-stack AI applications, neural network architectures, and deep learning models.

---

## 🗺️ Project Roadmap

| # | Project | Description | Tech Stack | Status |
| :--- | :--- | :--- | :--- | :--- |
| **00** | [**Setup & Python Basics**](00-setup-and-python-basics/) | Tooling setup, modern environment configuration, and Python fundamentals | Python, VS Code, Git | **Complete** |
| **01** | [**CLI Chatbot**](01-cli-chatbot/) | Interactive terminal chatbot with conversation memory and LLM integration | Python, Groq API, `python-dotenv` | **Complete** |
| **02** | [**Web Chatbot**](02-web-chatbot/) | Full-stack conversational AI with dark glassmorphic UI, streaming feedback & rich markdown | FastAPI, Next.js 16, React 19, Tailwind v4, Groq LPU, UV | **Complete** |
| **03** | [**Data Explorer**](03-data-explorer/) | Exploratory data analysis, visualization, and preprocessing for ML datasets | Pandas, NumPy, Matplotlib, Seaborn | *Planned* |
| **04** | [**ML API**](04-ml-api/) | Training classical machine learning models and deploying prediction endpoints | Scikit-Learn, FastAPI, Docker | *Planned* |
| **05** | [**Micrograd**](05-micrograd/) | Building an autograd engine and neural network framework from scratch | Pure Python, Math, Backpropagation | *Planned* |
| **06** | [**Makemore**](06-makemore/) | Character-level language model implementation (Bigram, MLP, RNN, Transformer) | PyTorch, Neural Networks | *Planned* |
| **07** | [**Hugging Face Sentiment**](07-hf-sentiment/) | Fine-tuning and deploying transformer models for NLP sentiment analysis | Transformers, Hugging Face, PyTorch | *Planned* |

---

## 🚀 Completed Milestones

### 00 · Setup & Python Basics
- Configured modern development workflow and virtual environments.
- Practiced core Python constructs, functions, data structures, and script execution.

### 01 · CLI Chatbot
- Built an interactive terminal-based AI assistant powered by the Groq API.
- Implemented environment variable management using `python-dotenv`.
- Designed conversational memory with sliding-window retention to maintain context across turns.
- Handled graceful session exit commands (`exit`, `quit`, `bye`).

### 02 · Modern Web Chatbot (Nova AI)
- **Full-Stack Architecture**: Decoupled high-performance **FastAPI** backend and **Next.js 16 (App Router)** frontend.
- **Groq LPU Acceleration**: Ultra-low latency token generation using `openai/gpt-oss-120b`.
- **Modern Glassmorphic UI**: Translucent dark theme built with React 19 and Tailwind CSS v4, featuring starter prompt cards, real-time generation stopwatch, and pulsing typing animations.
- **Rich Markdown & Code**: Integrated `react-markdown` and `remark-gfm` with language-badged fenced code blocks and single-click copy buttons.
- **Persistent Memory & Sync**: Server-side sliding-window memory saved to JSON, with automatic client history loading and clear chat support.
- **Production-Grade API**: Type-safe Pydantic v2 schemas, W3C-compliant explicit CORS configuration, and interactive OpenAPI documentation at `/docs`.

---

## 🛠️ Repository Tech Stack

- **Languages**: Python 3.11+, TypeScript, JavaScript
- **Frameworks & Libraries**: FastAPI, Next.js 16, React 19, Tailwind CSS v4, Pydantic v2
- **AI / LLM Providers**: Groq Cloud API (LPU Inference Engine)
- **Package & Project Managers**: `uv` (Python), `pnpm` (Node.js)
- **Styling & Markdown**: Tailwind CSS, PostCSS, `react-markdown`, `remark-gfm`
- **Version Control & CI/CD**: Git, GitHub

---

## 🏃 Quick Start Guide

### Running the CLI Chatbot (`01-cli-chatbot`)
```bash
cd 01-cli-chatbot
python -m venv .venv
# On Windows: .venv\Scripts\activate | On macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env # Add your GROQ_API_KEY
python main.py
```

### Running the Web Chatbot (`02-web-chatbot`)

1. **Backend (FastAPI)**:
   ```bash
   cd 02-web-chatbot
   cp .env.example .env # Add your GROQ_API_KEY
   uv sync
   uv run fastapi dev
   # Backend runs on http://127.0.0.1:8000 (Swagger docs at /docs)
   ```

2. **Frontend (Next.js)**:
   ```bash
   cd 02-web-chatbot/frontend
   pnpm install
   pnpm run dev
   # Open http://localhost:3000 in your browser
   ```

---

## 👨‍💻 Author & License

- **Author**: Uzair ([@TheUzair](https://github.com/TheUzair))
- **Repository**: [TheUzair/AI-Learning-Lab](https://github.com/TheUzair/AI-Learning-Lab)
- **License**: MIT
