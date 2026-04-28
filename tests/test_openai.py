import sys
sys.path.insert(0, 'app')

from app.config import OPENAI_API_KEY
from openai import OpenAI

print("Testing direct OpenAI connection...")
client = OpenAI(api_key=OPENAI_API_KEY, timeout=30)
response = client.embeddings.create(
    model="text-embedding-3-small",
    input="hello"
)
print(f"Success! Embedding length: {len(response.data[0].embedding)}")
