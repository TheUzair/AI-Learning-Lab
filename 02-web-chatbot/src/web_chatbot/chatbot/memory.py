import json
from pathlib import Path

FILE_PATH = Path(__file__).resolve().parent.parent / "data" / "chat_history.json"

def load_history():
    if not FILE_PATH.exists() or FILE_PATH.stat().st_size == 0:
        return []
    
    try:
        with open(FILE_PATH, "r", encoding="utf-8") as file:
            return json.load(file)
    except json.JSONDecodeError:
        return []

def save_history(history):
    FILE_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(FILE_PATH, "w", encoding="utf-8") as file:
        json.dump(history, file, ensure_ascii=False, indent=2)

def trim_history(history):
    return history[-10:]