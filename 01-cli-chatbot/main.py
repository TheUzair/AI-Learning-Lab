from groq import Groq
from dotenv import load_dotenv
import os

load_dotenv()

# Returns None if variable doesn't exist
API_KEY = os.getenv("GROQ_API_KEY")
# Returns None if variable doesn't exist
# API_KEY = os.environ["GROQ_API_KEY"]
if API_KEY is None:
    print("Error: GROQ_API_KEY environment variable not set.")
    exit(1)
# create a Groq client

client=Groq(api_key=API_KEY)

# Set the system prompt
system_prompt = {
    "role": "system",
    "content": "You are a helpful assistant. You reply with concise answers."
}

#store history of conversation
conversation_history = []

# send a query to the Groq API
while True:

  user_input = input("Enter your message: ")
  print("You entered:", user_input)
  if user_input.lower() in ["exit", "quit", "bye", "goodbye", "see you", "farewell", "later", "take care", "catch you later", "talk to you later", "see you later", "have a good day", "have a nice day"]:
      print("Exiting the chatbot. Goodbye!")
      break
  conversation_history.append({"role": "user", "content": user_input})
  response = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[system_prompt] + conversation_history
  )
  conversation_history.append({"role": "assistant", "content": response.choices[0].message.content})

  conversation_history = conversation_history[-10:]
  # print("Response from Groq:", response)
  # Response from Groq: ChatCompletion(id='chatcmpl-63d6fc01-4789-4834-b9e9-5af833643246', choices=[Choice(finish_reason='stop', index=0, logprobs=None, message=ChatCompletionMessage(content="I'm fine, thanks.", role='assistant', annotations=None, executed_tools=None, function_call=None, reasoning=None, tool_calls=None))], created=1780768729, model='llama-3.3-70b-versatile', object='chat.completion', mcp_list_tools=None, service_tier='on_demand', system_fingerprint='fp_dae98b5ecb', usage=CompletionUsage(completion_tokens=7, prompt_tokens=53, total_tokens=60, completion_time=0.017658556, completion_tokens_details=None, prompt_time=0.005223298, prompt_tokens_details=None, queue_time=0.056652278, total_time=0.022881854), usage_breakdown=None, x_groq=XGroq(id='req_01ktf1csxhecbtr8eakjwmxs03', debug=None, seed=1388496705, usage=None))
  print("Response from Groq API:", response.choices[0].message.content)