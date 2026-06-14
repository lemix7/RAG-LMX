
from unittest.mock import MagicMock, patch
from langchain_core.documents import Document

import app.retriever as retriever_module
from app.retriever import ThresholdReranker, _fetch_all_documents_from_chroma, get_retriever


# ---------------------------------------------------------------------------
# ThresholdReranker
# ---------------------------------------------------------------------------

def test_threshold_reranker_keeps_docs_above_threshold():
    print("\n--- Test 1: ThresholdReranker keeps docs that score at or above threshold ---")
    mock_model = MagicMock()
    mock_model.score.return_value = [0.8, 0.1, 0.5]

    reranker = ThresholdReranker(model=mock_model, top_n=3, score_threshold=0.4)
    docs = [
        Document(page_content="high score"),
        Document(page_content="low score"),
        Document(page_content="medium score"),
    ]

    result = reranker.compress_documents(docs, query="test")
    contents = [d.page_content for d in result]
    assert "high score" in contents
    assert "medium score" in contents
    assert "low score" not in contents
    print("PASSED")


def test_threshold_reranker_returns_sorted_by_score():
    print("\n--- Test 2: ThresholdReranker returns docs sorted highest score first ---")
    mock_model = MagicMock()
    mock_model.score.return_value = [0.3, 0.9, 0.6]

    reranker = ThresholdReranker(model=mock_model, top_n=3, score_threshold=0.0)
    docs = [
        Document(page_content="low"),
        Document(page_content="high"),
        Document(page_content="mid"),
    ]

    result = reranker.compress_documents(docs, query="test")
    assert result[0].page_content == "high"
    assert result[1].page_content == "mid"
    assert result[2].page_content == "low"
    print("PASSED")


def test_threshold_reranker_respects_top_n():
    print("\n--- Test 3: ThresholdReranker respects top_n limit ---")
    mock_model = MagicMock()
    mock_model.score.return_value = [0.9, 0.8, 0.7]

    reranker = ThresholdReranker(model=mock_model, top_n=2, score_threshold=0.0)
    docs = [Document(page_content=str(i)) for i in range(3)]

    result = reranker.compress_documents(docs, query="test")
    assert len(result) == 2
    print("PASSED")


def test_threshold_reranker_drops_all_below_threshold():
    print("\n--- Test 4: ThresholdReranker returns empty list when all docs are below threshold ---")
    mock_model = MagicMock()
    mock_model.score.return_value = [0.1, 0.2]

    reranker = ThresholdReranker(model=mock_model, top_n=5, score_threshold=0.5)
    docs = [Document(page_content="a"), Document(page_content="b")]

    result = reranker.compress_documents(docs, query="test")
    assert result == []
    print("PASSED")


# ---------------------------------------------------------------------------
# _fetch_all_documents_from_chroma
# ---------------------------------------------------------------------------

def test_fetch_all_documents_returns_documents():
    print("\n--- Test 5: _fetch_all_documents_from_chroma returns Document objects ---")
    mock_store = MagicMock()
    mock_store.get.return_value = {
        "documents": ["chunk one", "chunk two"],
        "metadatas": [{"source": "a.txt"}, {"source": "b.txt"}],
    }

    with patch.object(retriever_module, "get_vector_store", return_value=mock_store):
        docs = _fetch_all_documents_from_chroma("test-user")

    assert len(docs) == 2
    assert all(isinstance(d, Document) for d in docs)
    assert docs[0].page_content == "chunk one"
    assert docs[0].metadata == {"source": "a.txt"}
    print("PASSED")


def test_fetch_all_documents_returns_empty_on_empty_store():
    print("\n--- Test 6: _fetch_all_documents_from_chroma returns [] when collection is empty ---")
    mock_store = MagicMock()
    mock_store.get.return_value = {"documents": [], "metadatas": []}

    with patch.object(retriever_module, "get_vector_store", return_value=mock_store):
        docs = _fetch_all_documents_from_chroma("test-user")

    assert docs == []
    print("PASSED")


# ---------------------------------------------------------------------------
# get_retriever
# ---------------------------------------------------------------------------

def test_get_retriever_raises_on_invalid_k():
    print("\n--- Test 7: get_retriever raises ValueError when k < 1 ---")
    try:
        get_retriever("test-user", k=0)
        assert False, "Expected ValueError"
    except ValueError as e:
        assert "k must be at least 1" in str(e)
    print("PASSED")


def test_get_retriever_falls_back_to_vector_only_when_store_empty():
    print("\n--- Test 8: get_retriever falls back to vector-only when ChromaDB is empty ---")
    mock_store = MagicMock()
    mock_store.get.return_value = {"documents": [], "metadatas": []}

    with patch.object(retriever_module, "get_vector_store", return_value=mock_store):
        result = get_retriever("test-user", k=5)

    # vector-only fallback — not an EnsembleRetriever / ContextualCompressionRetriever
    from langchain_classic.retrievers import ContextualCompressionRetriever
    assert not isinstance(result, ContextualCompressionRetriever)
    print("PASSED")


def test_get_retriever_returns_hybrid_when_documents_exist():
    print("\n--- Test 9: get_retriever returns ContextualCompressionRetriever when docs exist ---")
    mock_store = MagicMock()
    mock_store.get.return_value = {
        "documents": ["doc one", "doc two"],
        "metadatas": [{}, {}],
    }

    mock_cross_encoder = MagicMock()
    mock_cross_encoder.score.return_value = [0.9, 0.8]

    with patch.object(retriever_module, "get_vector_store", return_value=mock_store), \
         patch("app.retriever.BM25Retriever") as MockBM25, \
         patch("app.retriever.HuggingFaceCrossEncoder", return_value=mock_cross_encoder):

        MockBM25.from_documents.return_value = MagicMock()
        result = get_retriever("test-user", k=5)

    from langchain_classic.retrievers import ContextualCompressionRetriever
    assert isinstance(result, ContextualCompressionRetriever)
    print("PASSED")


def test_get_retriever_uses_bm25_with_all_docs():
    print("\n--- Test 10: get_retriever passes all ChromaDB docs to BM25Retriever ---")
    mock_store = MagicMock()
    mock_store.get.return_value = {
        "documents": ["alpha", "beta", "gamma"],
        "metadatas": [{}, {}, {}],
    }

    mock_cross_encoder = MagicMock()

    with patch.object(retriever_module, "get_vector_store", return_value=mock_store), \
         patch("app.retriever.BM25Retriever") as MockBM25, \
         patch("app.retriever.HuggingFaceCrossEncoder", return_value=mock_cross_encoder):

        MockBM25.from_documents.return_value = MagicMock()
        get_retriever("test-user", k=5)

        call_args = MockBM25.from_documents.call_args
        passed_docs = call_args[0][0]
        assert len(passed_docs) == 3
        assert passed_docs[0].page_content == "alpha"
    print("PASSED")


if __name__ == "__main__":
    test_threshold_reranker_keeps_docs_above_threshold()
    test_threshold_reranker_returns_sorted_by_score()
    test_threshold_reranker_respects_top_n()
    test_threshold_reranker_drops_all_below_threshold()
    test_fetch_all_documents_returns_documents()
    test_fetch_all_documents_returns_empty_on_empty_store()
    test_get_retriever_raises_on_invalid_k()
    test_get_retriever_falls_back_to_vector_only_when_store_empty()
    test_get_retriever_returns_hybrid_when_documents_exist()
    test_get_retriever_uses_bm25_with_all_docs()
    print("\nAll tests passed!")
