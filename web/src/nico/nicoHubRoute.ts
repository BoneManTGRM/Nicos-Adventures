export type NicoHubTab = "ask" | "showtime" | "movies";

export const NICO_HUB_STATE_KEY = "nicosWorldHub";

export function parseNicoHubHash(hash: string): NicoHubTab | null {
  if (hash === "#nico/dress") return "ask";
  const match = hash.match(/^#nico\/(ask|showtime|movies)$/);
  return match ? match[1] as NicoHubTab : null;
}

export function nicoHubHash(tab: NicoHubTab): string {
  return `#nico/${tab}`;
}

export function isNicoHubHistoryState(state: unknown): boolean {
  return Boolean(state && typeof state === "object" && (state as Record<string, unknown>)[NICO_HUB_STATE_KEY] === true);
}

export function makeNicoHubHistoryState(previous: unknown): Record<string, unknown> {
  const safe = previous && typeof previous === "object" ? previous as Record<string, unknown> : {};
  return { ...safe, [NICO_HUB_STATE_KEY]: true };
}
