from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from .retriever import get_retriever
from .config import LLM_MODEL

SYSTEM_PROMPT = """You are a helpful document assistant. Your primary knowledge source is the context provided below.

Guidelines:
- Base your answers on the context provided. You may explain, summarize, and draw reasonable conclusions from it.
- If the context contains relevant information, use it to give a clear and helpful answer — even if the question is phrased differently from how the document words it.
- You may use your general knowledge to clarify terms or concepts that appear in the context, but always ground your answer in what the documents say.
- If the context has no relevant information at all, say: "I don't have information about that in the provided documents."
- Keep answers concise and focused on what the user asked.

Context:
{context}"""

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

def build_rag_chain():
    retriever = get_retriever()
    llm = ChatOpenAI(model=LLM_MODEL, temperature=0, timeout=30, max_retries=2)

    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        ("user", "{question}"),
    ])

    chain = prompt | llm | StrOutputParser()
    return chain, retriever




def ask(question: str, chain, retriever) -> dict:
    if not question or not question.strip():
        raise ValueError("Question cannot be empty")

    try:
        source_docs = retriever.invoke(question)
        answer = chain.invoke({'context': format_docs(source_docs), 'question': question})
    except Exception as e:
        raise RuntimeError(f"Failed to answer question: {e}") from e

    return {
        'answer': answer,
        'source_docs': source_docs,
    }

# does the same job as ask() but with token streaming effect
def stream_ask(question: str, chain, retriever) -> dict:
    if not question or not question.strip():
        raise ValueError("Question cannot be empty")

    try:
        source_docs = retriever.invoke(question)
    except Exception as e:
        raise RuntimeError(f"Failed to retrieve documents: {e}") from e

    stream = chain.stream({'context': format_docs(source_docs), 'question': question})
    return {
        'stream': stream,
        'source_docs': source_docs,
    }