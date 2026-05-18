from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from .retriever import get_retriever
from .config import LLM_MODEL

SYSTEM_PROMPT = """You are a document assistant. Your only knowledge source is the context provided below.

Rules:
- Answer ONLY using information explicitly stated in the context.
- If the context does not contain the answer, respond with exactly: "I don't have information about that in the provided documents."
- Do NOT use your training knowledge, general knowledge, or any information not present in the context.
- Do NOT make assumptions or inferences beyond what the context states.

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