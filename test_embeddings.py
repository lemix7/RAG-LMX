import sys
sys.path.insert(0, 'app')

from config import EMBEDDING_MODEL
from langchain_openai import OpenAIEmbeddings

print("Testing embeddings...")
e = OpenAIEmbeddings(model=EMBEDDING_MODEL, timeout=30)
result = e.embed_query("hello")
print(f"Success! Embedding length: {len(result)}")
