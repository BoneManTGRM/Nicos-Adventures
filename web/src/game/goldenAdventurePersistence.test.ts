import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createProfile,
  exportProfile,
  importProfile,
  loadLocalStore,
  normalizeStore,
  saveLocalStore,
} from "../storage";
import {
  STAR_BRIDGE_ENGINEER,
  isStarBridgeComplete,
  type StarBridgeEvent,
} from "./goldenAdventure";
import { applyStarBridgeEvent } from "./goldenAdventureProfile";

const completionEvents: StarBridgeEvent[] = [
  { type: "REVEAL_BRIDGE" },
  { type: "CONFIGURE_ROBOT" },
  { type: "PASS_MOVEMENT_TEST" },
  { type: "PASS_SCANNER_TEST" },
  { type: "PASS_LOGIC_TEST" },
  { type: "INSPECT_BRIDGE" },
  { type: "INSTALL_STAR_CORE" },
  { type: "COMPLETE_ADVENTURE" },
];

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Golden Adventure profile persistence", () => {
  it("adds clean adventure progress to existing profiles", () => {
    const profile = normalizeStore({
      schemaVersion: 4,
      activeProfileId: "player-1",
      profiles: [{ id: "player-1", playerName: "Nico", stars: 27 }],
    }).profiles[0];

    expect(profile.stars).toBe(27);
    expect(profile.adventures.starBridge.step).toBe("briefing");
    expect(profile.adventures.starBridge.dinosaurValleyUnlocked).toBe(false);
  });

  it("survives save, reload, export, and restore after ordered completion", () => {
    const values = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    });

    let profile = createProfile("Nico", "es-MX");
    for (const event of completionEvents) {
      profile = applyStarBridgeEvent(profile, event, () => "2026-08-30T15:00:00.000Z");
    }
    const store = { schemaVersion: 4 as const, activeProfileId: profile.id, profiles: [profile] };

    expect(saveLocalStore(store)).toBe(true);
    const reloaded = loadLocalStore().profiles[0];
    expect(isStarBridgeComplete(reloaded.adventures.starBridge)).toBe(true);
    expect(reloaded.language).toBe("es-MX");

    const restored = importProfile(exportProfile(reloaded));
    expect(restored.id).not.toBe(reloaded.id);
    expect(restored.adventures.starBridge.completedAt).toBe("2026-08-30T15:00:00.000Z");
    expect(restored.adventures.starBridge.museumAchievements).toEqual([STAR_BRIDGE_ENGINEER]);
  });

  it("cannot unlock Dinosaur Valley with skipped or malformed progress", () => {
    const initial = createProfile("Nico", "en");
    const skipped = applyStarBridgeEvent(initial, { type: "PASS_LOGIC_TEST" });
    expect(skipped).toBe(initial);
    expect(skipped.adventures.starBridge.dinosaurValleyUnlocked).toBe(false);

    const normalized = normalizeStore({
      schemaVersion: 4,
      activeProfileId: initial.id,
      profiles: [{
        ...initial,
        adventures: {
          starBridge: {
            step: "complete",
            bridgeRepaired: false,
            dinosaurValleyUnlocked: true,
            museumAchievements: [STAR_BRIDGE_ENGINEER, STAR_BRIDGE_ENGINEER],
            completedAt: "not-a-date",
          },
        },
      }],
    }).profiles[0];

    expect(normalized.adventures.starBridge.step).toBe("briefing");
    expect(normalized.adventures.starBridge.dinosaurValleyUnlocked).toBe(false);
    expect(normalized.adventures.starBridge.museumAchievements).toEqual([]);
  });

  it("keeps the persistent completion reward idempotent", () => {
    let profile = createProfile("Nico", "en");
    for (const event of completionEvents) {
      profile = applyStarBridgeEvent(profile, event, () => "2026-08-30T15:00:00.000Z");
    }

    const completed = profile;
    profile = applyStarBridgeEvent(profile, { type: "COMPLETE_ADVENTURE" }, () => "later");

    expect(profile).toBe(completed);
    expect(profile.adventures.starBridge.museumAchievements).toEqual([STAR_BRIDGE_ENGINEER]);
  });
});
