import { useCallback, useEffect, useRef, useState } from "react";
import { readCatalog } from "./model";
import type { Catalog } from "./types";
export type CatalogSnapshot = { catalog: Catalog | null; checkedAt: number; loading: boolean; failed: boolean };
export const CATALOG_FRESH_MS = 60_000;
export function useCatalog() {
  const [snapshot, setSnapshot] = useState<CatalogSnapshot>({ catalog: null, checkedAt: 0, loading: true, failed: false });
  const [online, setOnline] = useState(() => navigator.onLine);
  const [clock, setClock] = useState(Date.now);
  const controller = useRef<AbortController | null>(null);
  const generation = useRef(0);
  const refresh = useCallback(async (): Promise<CatalogSnapshot | null> => {
    const current = ++generation.current;
    controller.current?.abort();
    if (!navigator.onLine) { setSnapshot(value => ({ ...value, checkedAt: 0, loading: false, failed: true })); return null; }
    const abort = new AbortController(); controller.current = abort;
    setSnapshot(value => ({ ...value, checkedAt: 0, loading: true, failed: false }));
    const timeout = window.setTimeout(() => abort.abort(), 8000);
    try {
      const response = await fetch("/store-catalog.json", { cache: "no-store", credentials: "omit", referrerPolicy: "no-referrer", signal: abort.signal });
      if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) throw new Error("Catalog unavailable");
      const text = await response.text();
      if (text.length > 1_000_000) throw new Error("Catalog too large");
      const catalog = readCatalog(JSON.parse(text));
      if (current !== generation.current || !navigator.onLine) return null;
      const next = { catalog, checkedAt: Date.now(), loading: false, failed: false };
      setSnapshot(next); setClock(Date.now()); return next;
    } catch {
      if (current === generation.current) setSnapshot(value => ({ ...value, checkedAt: 0, loading: false, failed: true }));
      return null;
    } finally { window.clearTimeout(timeout); }
  }, []);
  useEffect(() => {
    void refresh();
    const connect = () => { setOnline(true); void refresh(); };
    const disconnect = () => {
      setOnline(false); ++generation.current; controller.current?.abort();
      setSnapshot(value => ({ ...value, checkedAt: 0, loading: false }));
    };
    const focus = () => { if (navigator.onLine) void refresh(); };
    window.addEventListener("online", connect); window.addEventListener("offline", disconnect); window.addEventListener("focus", focus);
    const interval = window.setInterval(() => setClock(Date.now()), 1000);
    return () => { ++generation.current; controller.current?.abort(); window.clearInterval(interval); window.removeEventListener("online", connect); window.removeEventListener("offline", disconnect); window.removeEventListener("focus", focus); };
  }, [refresh]);
  return { snapshot, online, refresh, fresh: online && !snapshot.loading && !snapshot.failed && snapshot.checkedAt > 0 && clock - snapshot.checkedAt < CATALOG_FRESH_MS };
}
