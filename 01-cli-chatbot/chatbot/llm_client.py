from groq import Groq
from dotenv import load_dotenv
import os

load_dotenv()

API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

if API_KEY is None:
    raise ValueError("GROQ_API_KEY environment variable not set.")

client = Groq(api_key=API_KEY)

SYSTEM_PROMPT = {
    "role": "system",
    "content": "You are a helpful assistant. You reply with concise answers."
}

def get_response(conversation_history):
    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[SYSTEM_PROMPT] + conversation_history
    )

    return response.choices[0].message.content