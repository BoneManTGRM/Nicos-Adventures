import { useEffect, useState } from "react";

type AssetState = {
  source: string;
  loading: boolean;
  error: string | null;
};

const NICO_GUIDE_FALLBACK = "/assets/nico/nico-guide-art.b64?v=2";

export function useLocalBase64Asset(path: string, mimeType: string, expectedPrefix?: string): AssetState {
  const [state, setState] = useState<AssetState>({ source: "", loading: true, error: null });

  useEffect(() => {
    const controller = new AbortController();
    setState({ source: "", loading: true, error: null });

    const candidates = path.includes("nico-fullbody.b64") ? [path, NICO_GUIDE_FALLBACK] : [path];

    const load = async () => {
      let lastError: unknown = null;
      for (const candidate of candidates) {
        try {
          const response = await fetch(candidate, { cache: "force-cache", signal: controller.signal });
          if (!response.ok) throw new Error(`Local asset request failed: ${response.status}`);
          const encoded = (await response.text()).trim();
          if (!encoded || (expectedPrefix && !encoded.startsWith(expectedPrefix))) {
            throw new Error("Local asset payload is invalid");
          }
          setState({ source: `data:${mimeType};base64,${encoded}`, loading: false, error: null });
          return;
        } catch (error) {
          if (controller.signal.aborted) return;
          lastError = error;
        }
      }
      setState({
        source: "",
        loading: false,
        error: lastError instanceof Error ? lastError.message : "Local asset failed",
      });
    };

    void load();
    return () => controller.abort();
  }, [expectedPrefix, mimeType, path]);

  return state;
}
