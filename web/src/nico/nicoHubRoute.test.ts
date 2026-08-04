import { describe, expect, it } from "vitest";
import {
  isNicoHubHistoryState,
  makeNicoHubHistoryState,
  nicoHubHash,
  parseNicoHubHash,
} from "./nicoHubRoute";

describe("Nico Clubhouse route helpers", () => {
  it("recognizes only supported Nico tabs", () => {
    expect(parseNicoHubHash("#nico/ask")).toBe("ask");
    expect(parseNicoHubHash("#nico/dress")).toBe("dress");
    expect(parseNicoHubHash("#nico/showtime")).toBe("showtime");
    expect(parseNicoHubHash("#nico/movies")).toBe("movies");
    expect(parseNicoHubHash("#nico/unknown")).toBeNull();
    expect(parseNicoHubHash("#world-map")).toBeNull();
  });

  it("creates stable hashes without stacking unrelated state", () => {
    expect(nicoHubHash("showtime")).toBe("#nico/showtime");
    const state = makeNicoHubHistoryState({ source: "test" });
    expect(state).toMatchObject({ source: "test", nicosWorldHub: true });
    expect(isNicoHubHistoryState(state)).toBe(true);
    expect(isNicoHubHistoryState({})).toBe(false);
  });
});
