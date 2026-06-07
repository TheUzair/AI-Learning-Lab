from groq import Groq
from dotenv import load_dotenv
import os

load_dotenv()

API_KEY = os.getenv("GROQ_API_KEY")

if API_KEY is None:
    raise ValueError("GROQ_API_KEY environment variable not set.")

client = Groq(api_key=API_KEY)

SYSTEM_PROMPT = {
    "role": "system",
    "content": "You are a helpful assistant. You reply with concise answers."
}

def get_response(conversation_history):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[SYSTEM_PROMPT] + conversation_history
    )

    return response.choices[0].message.content