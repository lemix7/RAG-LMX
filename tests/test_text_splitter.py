import sys
sys.path.insert(0, '/Users/ahmad/Desktop/RAG-LMX/app')

from langchain_core.documents import Document
from text_splitter import split_documents


def test_empty_list():
    print("\n--- Test 1: Empty list returns [] ---")
    result = split_documents([])
    assert result == [], f"Expected [], got {result}"
    print("PASSED")


def test_single_short_document():
    print("\n--- Test 2: Short document produces at least one chunk ---")
    docs = [Document(page_content="Hello, this is a short document.")]
    result = split_documents(docs)
    assert len(result) >= 1, "Expected at least one chunk"
    print("PASSED")


def test_large_document_is_split():
    print("\n--- Test 3: Large document is split into multiple chunks ---")
    long_text = "word " * 1000  # well above default chunk size of 1000
    docs = [Document(page_content=long_text)]
    result = split_documents(docs)
    assert len(result) > 1, "Expected multiple chunks for a large document"
    print("PASSED")


def test_chunks_respect_chunk_size():
    print("\n--- Test 4: Each chunk respects the chunk size limit ---")
    from config import CHUNK_SIZE
    long_text = "word " * 1000
    docs = [Document(page_content=long_text)]
    result = split_documents(docs)
    for chunk in result:
        assert len(chunk.page_content) <= CHUNK_SIZE, (
            f"Chunk exceeded CHUNK_SIZE: {len(chunk.page_content)}"
        )
    print("PASSED")


def test_multiple_documents():
    print("\n--- Test 5: Multiple documents are all split ---")
    docs = [
        Document(page_content="word " * 500),
        Document(page_content="word " * 500),
    ]
    result = split_documents(docs)
    assert len(result) > 2, "Expected more chunks than input documents"
    print("PASSED")


if __name__ == "__main__":
    test_empty_list()
    test_single_short_document()
    test_large_document_is_split()
    test_chunks_respect_chunk_size()
    test_multiple_documents()
    print("\nAll tests passed!")
