from chatbot.controller import chat

EXIT_COMMANDS = [
    "exit",
    "quit",
    "bye",
    "goodbye",
    "see you",
    "farewell",
    "later",
    "take care",
    "catch you later",
    "talk to you later",
    "see you later",
    "have a good day",
    "have a nice day",
]

while True:
    user_input = input("Enter your message: ")

    if user_input.lower() in EXIT_COMMANDS:
        print("Exiting the chatbot. Goodbye!")
        break

    response = chat(user_input)

    print("Response from Groq API:", response)