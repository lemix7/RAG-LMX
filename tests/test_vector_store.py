import sys
sys.path.insert(0, '/Users/ahmad/Desktop/RAG-LMX/app')

from unittest.mock import MagicMock, patch
from langchain_community.docstore.document import Document
from vector_store import get_embeddings, get_vector_store, ingest_documents


def test_get_embeddings_returns_correct_model():
    print("\n--- Test 1: get_embeddings returns OpenAIEmbeddings with correct model ---")
    with patch("vector_store.OpenAIEmbeddings") as MockEmbeddings:
        mock_instance = MagicMock()
        mock_instance.model = "text-embedding-3-small"
        MockEmbeddings.return_value = mock_instance
        embeddings = get_embeddings()
        assert embeddings.model == "text-embedding-3-small"
        MockEmbeddings.assert_called_once_with(model="text-embedding-3-small")
    print("PASSED")


def test_get_vector_store_returns_chroma():
    print("\n--- Test 2: get_vector_store returns a Chroma instance ---")
    with patch("vector_store.Chroma") as MockChroma, \
         patch("vector_store.get_embeddings") as MockEmbeddings:
        mock_instance = MagicMock()
        MockChroma.return_value = mock_instance
        MockEmbeddings.return_value = MagicMock()
        result = get_vector_store()
        assert result == mock_instance
        MockChroma.assert_called_once()
    print("PASSED")


def test_ingest_documents_raises_on_empty_list():
    print("\n--- Test 3: ingest_documents raises ValueError on empty chunks ---")
    try:
        ingest_documents([])
        assert False, "Expected ValueError was not raised"
    except ValueError as e:
        assert "No chunks provided" in str(e)
    print("PASSED")


def test_ingest_documents_calls_add_documents():
    print("\n--- Test 4: ingest_documents calls add_documents with the chunks ---")
    chunks = [
        Document(page_content="Hello world", metadata={"source": "test.txt"}),
        Document(page_content="Second chunk", metadata={"source": "test.txt"}),
    ]

    mock_store = MagicMock()
    with patch("vector_store.get_vector_store", return_value=mock_store):
        result = ingest_documents(chunks)
        mock_store.add_documents.assert_called_once_with(chunks)
        assert result == mock_store
    print("PASSED")


def test_ingest_documents_returns_vector_store():
    print("\n--- Test 5: ingest_documents returns the vector store instance ---")
    chunks = [Document(page_content="Test chunk", metadata={})]
    mock_store = MagicMock()

    with patch("vector_store.get_vector_store", return_value=mock_store):
        result = ingest_documents(chunks)
        assert result == mock_store
    print("PASSED")


def test_ingest_documents_wraps_exception():
    print("\n--- Test 6: ingest_documents wraps unexpected errors in RuntimeError ---")
    chunks = [Document(page_content="Test chunk", metadata={})]
    mock_store = MagicMock()
    mock_store.add_documents.side_effect = Exception("API timeout")

    with patch("vector_store.get_vector_store", return_value=mock_store):
        try:
            ingest_documents(chunks)
            assert False, "Expected RuntimeError was not raised"
        except RuntimeError as e:
            assert "Failed to ingest documents" in str(e)
            assert "API timeout" in str(e)
    print("PASSED")


def test_ingest_documents_prints_chunk_count(capsys=None):
    print("\n--- Test 7: ingest_documents prints the number of ingested chunks ---")
    import io
    from contextlib import redirect_stdout

    chunks = [
        Document(page_content="Chunk one", metadata={}),
        Document(page_content="Chunk two", metadata={}),
    ]
    mock_store = MagicMock()

    with patch("vector_store.get_vector_store", return_value=mock_store):
        f = io.StringIO()
        with redirect_stdout(f):
            ingest_documents(chunks)
        output = f.getvalue()
        assert "2" in output
    print("PASSED")


if __name__ == "__main__":
    test_get_embeddings_returns_correct_model()
    test_get_vector_store_returns_chroma()
    test_ingest_documents_raises_on_empty_list()
    test_ingest_documents_calls_add_documents()
    test_ingest_documents_returns_vector_store()
    test_ingest_documents_wraps_exception()
    test_ingest_documents_prints_chunk_count()
    print("\nAll tests passed!")
