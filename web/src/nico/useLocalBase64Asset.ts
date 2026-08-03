import { useEffect, useState } from "react";

type AssetState = {
  source: string;
  loading: boolean;
  error: string | null;
};

export const NICO_GUIDE_FALLBACK = "/assets/nico/nico-guide-art.b64?v=3";
const APPROVED_CHARACTER_PARTS = [
  "/assets/nico/approved/character.part1.b64?v=1",
  "/assets/nico/approved/character.part2.b64?v=1",
  "/assets/nico/approved/character.part3.b64?v=1",
] as const;

async function fetchPayload(path: string, signal: AbortSignal): Promise<string> {
  const response = await fetch(path, { cache: "no-store", signal });
  if (!response.ok) throw new Error(`Local asset request failed: ${response.status}`);
  return (await response.text()).replace(/^\uFEFF/, "").trim();
}

export function useLocalBase64Asset(path: string, mimeType: string, expectedPrefix?: string): AssetState {
  const [state, setState] = useState<AssetState>({ source: "", loading: true, error: null });

  useEffect(() => {
    const controller = new AbortController();
    setState({ source: "", loading: true, error: null });

    const load = async () => {
      let lastError: unknown = null;

      if (path.includes("nico-fullbody.b64")) {
        try {
          const chunks = await Promise.all(APPROVED_CHARACTER_PARTS.map((part) => fetchPayload(part, controller.signal)));
          const encoded = chunks.join("");
          if (!encoded.startsWith("/9j/") || encoded.length < 10000) throw new Error("Approved Nico character payload is invalid");
          setState({ source: `data:${mimeType};base64,${encoded}`, loading: false, error: null });
          return;
        } catch (error) {
          if (controller.signal.aborted) return;
          lastError = error;
        }
      }

      const requested = path.includes("nico-fullbody.b64") ? NICO_GUIDE_FALLBACK : path;
      const candidates = [...new Set([requested, requested.split("?")[0], NICO_GUIDE_FALLBACK, NICO_GUIDE_FALLBACK.split("?")[0]])];
      for (const candidate of candidates) {
        try {
          const encoded = await fetchPayload(candidate, controller.signal);
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
