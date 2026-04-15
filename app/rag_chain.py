from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from retriever import get_retriever
from config import LLM_MODEL
from langchain_core.runnables import RunnablePassthrough

SYSTEM_PROMPT = """You are a helpful assistant that answers questions based on the provided context.
Use only the context below to answer the question. If the context doesn't contain enough information, say so.

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

    chain = (
        {'context': retriever | format_docs, 'question': RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )
    return chain, retriever




def ask(question: str, chain, retriever) -> dict:
    if not question or not question.strip():
        raise ValueError("Question cannot be empty")

    try:
        source_docs = retriever.invoke(question)
        answer = chain.invoke(question)
    except Exception as e:
        raise RuntimeError(f"Failed to answer question: {e}") from e

    return {
        'answer': answer,
        'source_docs': source_docs,
    }