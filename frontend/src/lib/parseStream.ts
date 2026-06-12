import type { StreamEvent, Source } from "./types";

const SOURCES_MARKER = "\n\n__sources__:";

/**
 * Async generator that reads the streaming chat response and yields:
 * - { type: "token", content } for each new chunk of text
 * - { type: "sources", sources } once the __sources__ sentinel is found
 * - { type: "error", message } on failure
 *
 * The generator yields only the *delta* (new text since last yield),
 * not the accumulated full string.
 */
export async function* parseStream(response: Response): AsyncGenerator<StreamEvent> {
  if (!response.body) {
    yield { type: "error", message: "No response body" };
    return;
  }

  const reader = response.body.getReader(); // read the stream chunk by chunk
  const decoder = new TextDecoder(); // decoder to convert binary into raw text
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true }); // convert binary into raw text
      buffer += chunk;

      const markerIndex = buffer.indexOf(SOURCES_MARKER); // index that points to the sources in the raw text

      if (markerIndex === -1) {
        // Marker not yet found  yield the new chunk as a token
        yield { type: "token", content: chunk };
      } else {
        // Marker found  yield text before the marker, then parse sources
        const textBefore = buffer.slice(0, markerIndex);
        // Calculate what's new since last yield
        const previousLength = buffer.length - chunk.length;
        const newText = textBefore.slice(previousLength);
        if (newText) {
          yield { type: "token", content: newText };
        }

        const sourcesJson = buffer.slice(markerIndex + SOURCES_MARKER.length);
        if (sourcesJson.trim()) {
          try {
            const rawSources: Array<{ path: string; page?: number | null }> = JSON.parse(sourcesJson);
            const sources: Source[] = rawSources.map((s) => ({
              path: s.path,
              name: s.path.split("/").pop() ?? s.path,
              page: s.page ?? null,
            }));
            yield { type: "sources", sources };
          } catch {
            // Malformed JSON — just skip sources
          }
        }
        break;
      }
    }

  } catch (err) {
    yield { type: "error", message: err instanceof Error ? err.message : "Stream read failed" };
  } finally {
    reader.releaseLock();
  }
}
