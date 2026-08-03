import { useEffect, useState } from "react";

type AssetState = {
  source: string;
  loading: boolean;
  error: string | null;
};

export function useLocalBase64Asset(path: string, mimeType: string, expectedPrefix?: string): AssetState {
  const [state, setState] = useState<AssetState>({ source: "", loading: true, error: null });

  useEffect(() => {
    const controller = new AbortController();
    setState({ source: "", loading: true, error: null });

    fetch(path, { cache: "force-cache", signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Local asset request failed: ${response.status}`);
        return response.text();
      })
      .then((payload) => {
        const encoded = payload.trim();
        if (!encoded || (expectedPrefix && !encoded.startsWith(expectedPrefix))) {
          throw new Error("Local asset payload is invalid");
        }
        setState({ source: `data:${mimeType};base64,${encoded}`, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({ source: "", loading: false, error: error instanceof Error ? error.message : "Local asset failed" });
      });

    return () => controller.abort();
  }, [expectedPrefix, mimeType, path]);

  return state;
}
