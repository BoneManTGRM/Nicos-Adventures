export const NICO_BASKETBALL_MEDIA = {
  videoParts: [
    "/assets/media/nico-basketball-highlight-v5.part00.b64",
    "/assets/media/nico-basketball-highlight-v5.part01.b64",
    "/assets/media/nico-basketball-highlight-v5.part02.b64",
    "/assets/media/nico-basketball-highlight-v5.part03.b64",
    "/assets/media/nico-basketball-highlight-v5.part04.b64",
    "/assets/media/nico-basketball-highlight-v5.part05.b64",
    "/assets/media/nico-basketball-highlight-v5.part06.b64",
  ],
  posterParts: [
    "/assets/media/nico-basketball-poster-v5.part00.b64",
  ],
  videoBytes: 56_429,
  posterBytes: 8_530,
  videoSha256: "5f08e83d501b49f9ef5c7c12c8996b9e684c6eb5f3c3ceb64558137b93179194",
  posterSha256: "930dbe4bf93e409f86984d3408cfd77aa290469d8ecba8603bb7692c26f67c63",
} as const;

export async function loadBase64Media(
  paths: readonly string[],
  mimeType: string,
  expectedBytes: number,
  signal: AbortSignal,
): Promise<Blob> {
  const responses = await Promise.all(paths.map((path) => fetch(path, {
    cache: "force-cache",
    credentials: "same-origin",
    signal,
  })));

  const failed = responses.find((response) => !response.ok);
  if (failed) throw new Error(`Local Nico media could not be loaded (${failed.status})`);

  const encoded = (await Promise.all(responses.map((response) => response.text())))
    .join("")
    .replace(/\s+/g, "");
  const binary = window.atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  if (bytes.byteLength !== expectedBytes) {
    throw new Error(`Local Nico media size mismatch: expected ${expectedBytes}, received ${bytes.byteLength}`);
  }
  return new Blob([bytes], { type: mimeType });
}
