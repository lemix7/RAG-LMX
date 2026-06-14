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

QUERY_EXPANSION_PROMPT = """You are a search query optimizer. Given a user question, generate 3 alternative phrasings that capture the same information need but use different vocabulary. These will be used to search a document corpus.

Return only the 3 alternatives as a numbered list, no explanation.

Question: {question}"""

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

def expand_query(question: str, llm) -> list[str]:
    """Generate alternative phrasings of the question to improve retrieval recall."""
    prompt = ChatPromptTemplate.from_messages([
        ("user", QUERY_EXPANSION_PROMPT),
    ])
    chain = prompt | llm | StrOutputParser()
    result = chain.invoke({"question": question})
    lines = [l.strip().lstrip("123456789.-) ") for l in result.strip().splitlines() if l.strip()]
    return [question] + lines[:3]

def build_rag_chain(user_id: str):
    retriever = get_retriever(user_id)
    llm = ChatOpenAI(model=LLM_MODEL, temperature=0, timeout=30, max_retries=2)

    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        ("user", "{question}"),
    ])

    chain = prompt | llm | StrOutputParser()
    return chain, retriever, llm




def _retrieve_with_expansion(question: str, retriever, llm) -> list:
    """Retrieve docs using the original query plus expanded alternatives, deduplicated."""
    queries = expand_query(question, llm)
    seen = set()
    all_docs = []
    for q in queries:
        for doc in retriever.invoke(q):
            key = doc.page_content[:100]
            if key not in seen:
                seen.add(key)
                all_docs.append(doc)
    return all_docs


def ask(question: str, chain, retriever, llm=None) -> dict:
    if not question or not question.strip():
        raise ValueError("Question cannot be empty")

    try:
        source_docs = _retrieve_with_expansion(question, retriever, llm) if llm else retriever.invoke(question)
        answer = chain.invoke({'context': format_docs(source_docs), 'question': question})
    except Exception as e:
        raise RuntimeError(f"Failed to answer question: {e}") from e

    return {
        'answer': answer,
        'source_docs': source_docs,
    }

# does the same job as ask() but with token streaming effect
def stream_ask(question: str, chain, retriever, llm=None) -> dict:
    if not question or not question.strip():
        raise ValueError("Question cannot be empty")

    try:
        source_docs = _retrieve_with_expansion(question, retriever, llm) if llm else retriever.invoke(question)
    except Exception as e:
        raise RuntimeError(f"Failed to retrieve documents: {e}") from e

    stream = chain.stream({'context': format_docs(source_docs), 'question': question})
    return {
        'stream': stream,
        'source_docs': source_docs,
    }