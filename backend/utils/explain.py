# backend/utils/explain.py
import anthropic
import os

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

def explain_match(query: str, standard_title: str, scope: str) -> str:
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=100,
        messages=[{
            "role": "user",
            "content": f"Query: '{query}'. Standard: '{standard_title}' (Scope: {scope}). In 1-2 sentences, explain why this standard matches and what allied standards a procurement officer should also check."
        }]
    )
    return message.content[0].text