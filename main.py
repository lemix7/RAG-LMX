import sys

from app.document_loader import load_documents
from app.text_splitter import split_documents
from app.vector_store import ingest_documents
from app.rag_chain import ask, stream_ask, build_rag_chain


def ingest_documents_to_vector_store():
    print("Ingesting documents...")
    documents = load_documents()
    if not documents:
        print("No documents found. Make sure files are in the docs folder.")
        return

    print('Splitting documents...')
    chunks = split_documents(documents)
    if not chunks:
        print("No chunks produced. Documents may be empty.")
        return

    print('Ingesting chunks into vector store...')
    ingest_documents(chunks)
    print('Documents ingested successfully')


def chat():
    print('RAG Chatbot is ready! Type "quit" to exit.')
    chain, retriever = build_rag_chain()

    while True:
        question = input('\nYou: ').strip()
        if not question or question.lower() in ('quit', 'exit', 'q'):
            print('Goodbye!')
            break

        try:
            result = stream_ask(question, chain, retriever)
        except RuntimeError as e:
            print(f"Error: {e}")
            continue

        print("\nAssistant: ", end="", flush=True)
        for chunk in result['stream']:
            print(chunk, end="", flush=True)
        print()

        print(f"\n--- Sources ({len(result['source_docs'])} chunks) ---")
        for i, doc in enumerate(result['source_docs'], 1):
            source = doc.metadata.get('source', 'unknown')
            page = doc.metadata.get('page', '')
            label = f'{source}' + (f' (page {page})' if page != '' else '')
            print(f' [{i}] {label}')

def main():
    if len(sys.argv) < 2:
        print('Usage: python -m app.main [ingest|chat]')
        sys.exit(1)

    command = sys.argv[1]
    if command == 'ingest':
        ingest_documents_to_vector_store()
    elif command == 'chat':
        chat()
    else:
        print(f"Unknown command: {command}")
        print("Usage: python -m app.main [ingest|chat]")
        sys.exit(1)


if __name__ == "__main__":
    main()
