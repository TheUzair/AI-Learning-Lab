# CLI Chatbot

A simple command-line chatbot built with Python and the Groq API.

## Features

- Chat with an LLM directly from the terminal
- Uses environment variables for API key management
- Maintains conversation history for contextual responses
- Supports exit commands such as `exit`, `quit`, and `bye`
- Uses a system prompt to control assistant behavior

## Tech Stack

- Python
- Groq API
- python-dotenv

## Project Structure

```text
01-cli-chatbot/
├── chatbot/
│   └── controller.py
├── main.py
├── requirements.txt
├── .env.example
└── README.md
```

## Setup

### Clone the repository

```bash
git clone https://github.com/TheUzair/AI-Learning-Lab
cd 01-cli-chatbot
```

### Create a virtual environment

```bash
python -m venv .venv
```

### Activate the virtual environment

Windows:

```bash
.venv\Scripts\activate
```

### Install dependencies

```bash
pip install -r requirements.txt
```

### Configure environment variables

Create a `.env` file:

```env
GROQ_API_KEY=your_api_key_here
```

### Run the chatbot

```bash
python main.py
```

## Example

```text
Enter your message: What is Python?

Response from Groq API: Python is a high-level programming language used for web development, automation, data science, and more.
```

## What I Learned

- Working with APIs in Python
- Managing secrets using environment variables
- Maintaining conversation state
- Structuring Python projects
