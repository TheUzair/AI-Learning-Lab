import json
from pathlib import Path

FILE_PATH = Path("data/chat_history.json")

def load_history():
    if not FILE_PATH.exists():
        return []
    
    with open(FILE_PATH, "r", encoding="utf-8") as file:
        return json.load(file)

def save_history(history):
    FILE_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(FILE_PATH, "w", encoding="utf-8") as file:
        json.dump(history, file, ensure_ascii=False, indent=2)

def trim_history(history):
    return history[-10:]
