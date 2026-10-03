import json
from pathlib import Path

FILE_PATH = Path("data/chat_history.json")

def load_history():
    if not FILE_PATH.exists():
        return []
    
    with open(FILE_PATH, "r", encoding="utf-8") as file:
        return json.load(file) # reads JSON from the file and converts it into a Python object.

def save_history(history):
    FILE_PATH.parent.mkdir(parents=True, exist_ok=True) # creates the directory path if it doesn't exist, including any parent directories.
    with open(FILE_PATH, "w", encoding="utf-8") as file:
        json.dump(history, file, ensure_ascii=False, indent=2) # writes the Python object to the file in JSON format with indentation for readability and non-ASCII characters handled properly.

def trim_history(history):
    return history[-10:] # returns the last 10 messages from the history, removing older messages.