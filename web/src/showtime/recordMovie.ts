export type MovieRecordingResult = {
  blob: Blob;
  mimeType: string;
  durationMs: number;
};

export type RecordCanvasMovieOptions = {
  canvas: HTMLCanvasElement;
  durationMs: number;
  drawFrame: (elapsedMs: number) => void | Promise<void>;
  fps?: number;
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
};

export const MOVIE_MIME_TYPES = [
  "video/webm;codecs=vp9",
  "video/webm;codecs=vp8",
  "video/webm",
] as const;

export function selectSupportedMimeType(
  mediaRecorder: Pick<typeof MediaRecorder, "isTypeSupported"> | undefined = globalThis.MediaRecorder,
): string | null {
  if (!mediaRecorder || typeof mediaRecorder.isTypeSupported !== "function") return null;
  return MOVIE_MIME_TYPES.find((mimeType) => mediaRecorder.isTypeSupported(mimeType)) ?? null;
}

export function canRecordCanvasMovie(): boolean {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") return false;
  const canvas = document.createElement("canvas") as HTMLCanvasElement & { captureStream?: (fps?: number) => MediaStream };
  return typeof canvas.captureStream === "function" && selectSupportedMimeType() !== null;
}

const waitForRecorderStop = (recorder: MediaRecorder): Promise<void> => new Promise((resolve, reject) => {
  recorder.addEventListener("stop", () => resolve(), { once: true });
  recorder.addEventListener("error", () => reject(new Error("The browser could not finish the video recording.")), { once: true });
});

export async function recordCanvasMovie({
  canvas,
  durationMs,
  drawFrame,
  fps = 30,
  onProgress,
  signal,
}: RecordCanvasMovieOptions): Promise<MovieRecordingResult> {
  const captureCanvas = canvas as HTMLCanvasElement & { captureStream?: (fps?: number) => MediaStream };
  const mimeType = selectSupportedMimeType();
  if (!captureCanvas.captureStream || typeof MediaRecorder === "undefined" || !mimeType) {
    throw new Error("Video recording is not supported by this browser.");
  }

  const safeDuration = Math.max(4000, Math.min(8000, Math.round(durationMs)));
  const stream = captureCanvas.captureStream(Math.max(12, Math.min(60, Math.round(fps))));
  const chunks: BlobPart[] = [];
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 4_000_000 });
  recorder.addEventListener("dataavailable", (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  });

  const stopped = waitForRecorderStop(recorder);
  recorder.start(250);
  const startedAt = performance.now();

  try {
    await new Promise<void>((resolve, reject) => {
      let frameRequest = 0;
      const frame = async (now: number) => {
        if (signal?.aborted) {
          cancelAnimationFrame(frameRequest);
          reject(new DOMException("Recording cancelled", "AbortError"));
          return;
        }

        const elapsed = Math.min(safeDuration, Math.max(0, now - startedAt));
        try {
          await drawFrame(elapsed);
          onProgress?.(elapsed / safeDuration);
        } catch (error) {
          cancelAnimationFrame(frameRequest);
          reject(error);
          return;
        }

        if (elapsed >= safeDuration) {
          resolve();
          return;
        }
        frameRequest = requestAnimationFrame(frame);
      };
      frameRequest = requestAnimationFrame(frame);
    });
  } finally {
    if (recorder.state !== "inactive") recorder.stop();
    await stopped.catch(() => undefined);
    stream.getTracks().forEach((track) => track.stop());
  }

  if (!chunks.length) throw new Error("The browser finished without producing video data.");
  return { blob: new Blob(chunks, { type: mimeType }), mimeType, durationMs: safeDuration };
}

export function downloadMovieBlob(blob: Blob, fileName: string): void {
  const safeName = fileName
    .trim()
    .replace(/[^a-z0-9-_]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "nicos-world-movie";
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${safeName}.webm`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
