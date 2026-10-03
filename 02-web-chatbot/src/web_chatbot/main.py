from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from web_chatbot.chatbot.controller import chatbot
from web_chatbot.chatbot.memory import load_history, save_history

app = FastAPI(title="Web Chatbot API")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    message: str

@app.get("/")
async def read_root():
    return {"status": "ok", "message": "AI Chatbot API is operational"}

@app.get("/history")
async def get_chat_history():
    return {"history": load_history()}

@app.delete("/history")
async def clear_chat_history():
    save_history([])
    return {"status": "cleared", "history": []}

@app.post("/chat")
async def chat_endpoint(chat_message: ChatMessage):
    bot_response = chatbot(chat_message.message)
    return {"response": bot_response}