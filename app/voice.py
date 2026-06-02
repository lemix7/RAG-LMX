"""Voice helpers: speech-to-text (OpenAI Whisper) and text-to-speech (ElevenLabs).

Speech-to-text reuses the existing OpenAI key. Text-to-speech uses ElevenLabs and
is optional — if ELEVENLABS_API_KEY is unset, synthesize() raises a clear error so
the caller can degrade gracefully while text chat keeps working.
"""
import io

import httpx
from openai import OpenAI

from .config import (
    ELEVENLABS_API_KEY,
    ELEVENLABS_TTS_MODEL,
    ELEVENLABS_VOICE_ID,
    OPENAI_API_KEY,
    WHISPER_MODEL,
)

ELEVENLABS_TTS_URL = "https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"


def transcribe(audio_bytes: bytes, filename: str = "audio.webm") -> str:
    """Transcribe recorded audio to text using OpenAI Whisper."""
    if not audio_bytes:
        raise ValueError("No audio data to transcribe.")

    client = OpenAI(api_key=OPENAI_API_KEY)
    # The SDK infers the format from the filename, so keep the original extension.
    buffer = io.BytesIO(audio_bytes)
    buffer.name = filename

    try:
        result = client.audio.transcriptions.create(
            model=WHISPER_MODEL,
            file=buffer,
        )
    except Exception as e:
        raise RuntimeError(f"Transcription failed: {e}") from e

    return result.text.strip()


def synthesize(text: str) -> bytes:
    """Synthesize text to speech with ElevenLabs. Returns MP3 bytes."""
    if not text or not text.strip():
        raise ValueError("No text to synthesize.")
    if not ELEVENLABS_API_KEY:
        raise RuntimeError(
            "ELEVENLABS_API_KEY is not set. Add it to your .env file to enable voice replies."
        )

    url = ELEVENLABS_TTS_URL.format(voice_id=ELEVENLABS_VOICE_ID)
    try:
        response = httpx.post(
            url,
            headers={
                "xi-api-key": ELEVENLABS_API_KEY,
                "Content-Type": "application/json",
            },
            json={"text": text, "model_id": ELEVENLABS_TTS_MODEL},
            timeout=60,
        )
        response.raise_for_status()
    except httpx.HTTPStatusError as e:
        detail = e.response.text[:300]
        raise RuntimeError(f"ElevenLabs TTS failed ({e.response.status_code}): {detail}") from e
    except Exception as e:
        raise RuntimeError(f"ElevenLabs TTS request failed: {e}") from e

    return response.content
