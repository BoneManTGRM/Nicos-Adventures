import { useEffect, useState } from "react";
import type { Language } from "../types";

const AUTH_URL = "https://ep-proud-recipe-ars04tvu.neonauth.c-4.us-west-2.aws.neon.tech/neondb/auth";
const DATA_API_URL = "https://ep-proud-recipe-ars04tvu.apirest.c-4.us-west-2.aws.neon.tech/neondb/rest/v1";
const COUNTED_KEY = "nicos-world-visitor-counted-v1";
let visitorRequest: Promise<number> | null = null;

function readToken(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  if (typeof record.token === "string") return record.token;
  if (typeof record.access_token === "string") return record.access_token;
  if (record.data && typeof record.data === "object") return readToken(record.data);
  return null;
}

async function requestVisitorCount(): Promise<number> {
  const shouldCount = localStorage.getItem(COUNTED_KEY) !== "yes";
  const tokenResponse = await fetch(`${AUTH_URL}/token/anonymous`, {
    headers: { Accept: "application/json" },
    credentials: "omit",
  });
  if (!tokenResponse.ok) throw new Error("Anonymous visitor token unavailable");
  const token = readToken(await tokenResponse.json());
  if (!token) throw new Error("Anonymous visitor token missing");

  const response = await fetch(`${DATA_API_URL}/rpc/register_site_visit`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ count_visit: shouldCount }),
    credentials: "omit",
  });
  if (!response.ok) throw new Error("Visitor count unavailable");
  const payload = await response.json() as unknown;
  const count = Number(Array.isArray(payload) ? payload[0] : payload);
  if (!Number.isFinite(count) || count < 0) throw new Error("Invalid visitor count");
  if (shouldCount) localStorage.setItem(COUNTED_KEY, "yes");
  return Math.round(count);
}

export function VisitorCounter({ language }: { language: Language }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const isProduction = ["nicos-world.com", "www.nicos-world.com"].includes(window.location.hostname);
    if (!isProduction) return;
    visitorRequest ??= requestVisitorCount();
    visitorRequest.then(setCount).catch(() => setCount(null));
  }, []);

  const copy = language === "es-MX"
    ? { label: "exploradores han visitado este mundo", private: "Solo contamos este navegador una vez. No guardamos datos personales." }
    : { label: "explorers have visited this world", private: "This browser is counted once. No personal data is stored." };

  return (
    <div className="visitor-counter" aria-label={count === null ? copy.private : `${count.toLocaleString()} ${copy.label}`}>
      <span aria-hidden="true">🚀</span>
      <div>
        <strong>{count === null ? "—" : count.toLocaleString()}</strong>
        <span>{copy.label}</span>
      </div>
      <small>🔒 {copy.private}</small>
    </div>
  );
}
