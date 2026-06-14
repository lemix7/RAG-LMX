from app.document_loader import load_documents
from pathlib import Path
import tempfile


def test_folder_does_not_exist():
    print("\n--- Test 1: Folder does not exist ---")
    fake_path = Path("/tmp/nonexistent_folder_xyz")
    result = load_documents("test-user", fake_path)
    assert result == [], f"Expected [], got {result}"
    print("PASSED")


def test_empty_file_is_skipped():
    print("\n--- Test 2: Empty file is skipped ---")
    with tempfile.TemporaryDirectory() as tmpdir:
        empty_file = Path(tmpdir) / "empty.txt"
        empty_file.touch()  # creates a 0-byte file
        result = load_documents("test-user", Path(tmpdir))
        assert result == [], f"Expected [], got {result}"
    print("PASSED")


def test_subfolder_is_skipped():
    print("\n--- Test 3: Subfolder is skipped without crashing ---")
    with tempfile.TemporaryDirectory() as tmpdir:
        subfolder = Path(tmpdir) / "subfolder"
        subfolder.mkdir()
        result = load_documents("test-user", Path(tmpdir))
        assert result == [], f"Expected [], got {result}"
    print("PASSED")


def test_corrupted_file_does_not_crash():
    print("\n--- Test 4: Corrupted file does not crash the function ---")
    with tempfile.TemporaryDirectory() as tmpdir:
        bad_file = Path(tmpdir) / "broken.pdf"
        bad_file.write_bytes(b"this is not a valid pdf")  # fake PDF content
        result = load_documents("test-user", Path(tmpdir))
        assert result == [], f"Expected [], got {result}"
    print("PASSED")


def test_valid_txt_file_is_loaded():
    print("\n--- Test 5: Valid .txt file is loaded correctly ---")
    with tempfile.TemporaryDirectory() as tmpdir:
        txt_file = Path(tmpdir) / "hello.txt"
        txt_file.write_text("Hello, this is a test document.")
        result = load_documents("test-user", Path(tmpdir))
        assert len(result) > 0, "Expected documents to be loaded"
        assert "Hello" in result[0].page_content
    print("PASSED")


if __name__ == "__main__":
    test_folder_does_not_exist()
    test_empty_file_is_skipped()
    test_subfolder_is_skipped()
    test_corrupted_file_does_not_crash()
    test_valid_txt_file_is_loaded()
    print("\nAll tests passed!")
