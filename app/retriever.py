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
)
from .vector_store import get_vector_store

# This class overrides the methods of langchain original corss encoder reranker since it does not have the ability of dropping the doc under certain condtions 
class ThresholdReranker(CrossEncoderReranker):
   
    score_threshold: float = 0.0

    def compress_documents(self, documents: Sequence[Document], query: str, callbacks: Callbacks | None = None) -> Sequence[Document]:

        scores = self.model.score([(query, doc.page_content)  # Score every chunk against the question
                                  for doc in documents])

        # pair each chunk with it relevance score
        docs_with_scores = list(zip(documents, scores, strict=False))

        result = sorted(docs_with_scores,
                        # sort chunks by the highest score
                        key=operator.itemgetter(1), reverse=True)

        final_docs = []

        for doc, score in result[:self.top_n]: # create a list copy of the top N docs and loop them
            if score >= self.score_threshold:
                final_docs.append(doc) # insert only the docs that are above the threshold score

        return final_docs


def _fetch_all_documents_from_chroma() -> list[Document]: 
    # return a list of chunks in raw text alongside their metadata for conduction the keyword search (BM25) 
    
    vector_store = get_vector_store()
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


def get_retriever(k: int = RETRIEVER_K):
    """
    Builds the full hybrid retrieval pipeline:
      Vector retriever + BM25 retriever → EnsembleRetriever → CrossEncoder reranker
    Falls back to vector-only if ChromaDB is empty (e.g. before first ingest).
    """
    if k < 1:
        raise ValueError(f"k must be at least 1, got {k}")

    vector_store = get_vector_store()

    vector_retriever = vector_store.as_retriever(
        search_type="similarity",
        search_kwargs={"k": ENSEMBLE_K},
    )

    all_docs = _fetch_all_documents_from_chroma()

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

    # Reranker
    cross_encoder = HuggingFaceCrossEncoder(model_name=RERANKER_MODEL)
    reranker = ThresholdReranker( # This is the object of the class that overrides the original langchain class
        model=cross_encoder,
        top_n=k,
        score_threshold=RERANKER_SCORE_THRESHOLD,
    )

    hybrid_retriever = ContextualCompressionRetriever(
        base_compressor=reranker,
        base_retriever=ensemble_retriever,
    )

    print(
        f"Hybrid retriever ready: vector(k={ENSEMBLE_K}) + BM25(k={ENSEMBLE_K}) → rerank → top {k}")
    return hybrid_retriever
