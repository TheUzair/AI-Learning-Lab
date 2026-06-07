from chatbot.memory import (
    load_history,
    save_history,
    trim_history
)
from chatbot.llm_client import get_response

def chat(user_input):
    conversation_history = load_history()

    conversation_history.append({
        "role": "user",
        "content": user_input
    })

    assistant_response = get_response(
        conversation_history
    )

    conversation_history.append({
        "role": "assistant",
        "content": assistant_response
    })

    conversation_history = trim_history(
        conversation_history
    )

    save_history(conversation_history)

    return assistant_response