import operator
from collections.abc import Sequence

from langchain_community.retrievers import BM25Retriever
from langchain_classic.retrievers import EnsembleRetriever, ContextualCompressionRetriever
from langchain_classic.retrievers.document_compressors import CrossEncoderReranker
from langchain_community.cross_encoders import HuggingFaceCrossEncoder
from langchain_core.callbacks import Callbacks
from langchain_core.documents import Document

from .config import (
    RETRIEVER_K,
    ENSEMBLE_K,
    VECTOR_WEIGHT,
    BM25_WEIGHT,
    RERANKER_MODEL,
    RERANKER_SCORE_THRESHOLD,
    RERANKER_TOP_N
)
from .vector_store import get_vector_store

class ThresholdReranker(CrossEncoderReranker):
    # CrossEncoderReranker with a minimum score cutoff.
   
    score_threshold: float = 0.0

    def compress_documents(self, documents: Sequence[Document], query: str, callbacks: Callbacks | None = None) -> Sequence[Document]:

        scores = self.model.score([(query, doc.page_content) for doc in documents])
        docs_with_scores = list(zip(documents, scores, strict=False))
        result = sorted(docs_with_scores, key=operator.itemgetter(1), reverse=True)
        return [doc for doc, score in result[:self.top_n] if score >= self.score_threshold]


def _fetch_all_documents_from_chroma(user_id: str, mode: str = "public") -> list[Document]:
    # Pulls all chunks from the user's ChromaDB collection to build the in-memory BM25 index.

    vector_store = get_vector_store(user_id, mode)
    result = vector_store.get(include=["documents", "metadatas"])

    texts = result.get("documents") or []
    metadatas = result.get("metadatas") or []

    if not texts:
        print(
            "Warning: ChromaDB collection is empty. BM25 retriever will return no results.")
        return []

    documents = []

    for text, meta in zip(texts, metadatas):
        if meta is None:
            meta = {}
        doc = Document(page_content=text, metadata=meta) 
        documents.append(doc)

    print(f"Loaded {len(documents)} chunks from ChromaDB for BM25 index.")
    return documents 


def get_retriever(user_id: str, mode: str = "public", k: int = RETRIEVER_K):

    if k < 1:
        raise ValueError(f"k must be at least 1, got {k}")

    vector_store = get_vector_store(user_id, mode)

    vector_retriever = vector_store.as_retriever(
        search_type="mmr",
        search_kwargs={"k": ENSEMBLE_K, "fetch_k": ENSEMBLE_K * 3, "lambda_mult": 0.5},
    )

    all_docs = _fetch_all_documents_from_chroma(user_id, mode)

    if not all_docs:
        print("Falling back to vector-only retriever (no documents in store yet).")
        return vector_store.as_retriever(
            search_type="similarity",
            search_kwargs={"k": k},
        )

    bm25_retriever = BM25Retriever.from_documents(all_docs, k=ENSEMBLE_K)

    # Combine both retrievers
    ensemble_retriever = EnsembleRetriever(
        retrievers=[vector_retriever, bm25_retriever],
        weights=[VECTOR_WEIGHT, BM25_WEIGHT],
    )

    # Reranker — top_n uses RERANKER_TOP_N as a pre-filter ceiling, then k limits final output
    cross_encoder = HuggingFaceCrossEncoder(model_name=RERANKER_MODEL)
    reranker = ThresholdReranker(
        model=cross_encoder,
        top_n=min(RERANKER_TOP_N, k),
        score_threshold=RERANKER_SCORE_THRESHOLD,
    )

    hybrid_retriever = ContextualCompressionRetriever(
        base_compressor=reranker,
        base_retriever=ensemble_retriever,
    )

    print(
        f"Hybrid retriever ready: vector(k={ENSEMBLE_K}) + BM25(k={ENSEMBLE_K}) → rerank → top {min(RERANKER_TOP_N, k)}")
    return hybrid_retriever
