import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { initialStarBridgeState, reduceStarBridge } from "../game/goldenAdventure";
import { createProfile } from "../storage";
import { StarBridgeMap, starBridgeMissionPhase } from "./StarBridgeMap";
import { WORLD_SECTIONS } from "./catalogs";
import { WorldMap } from "./WorldMap";

const handlers = {
  begin: vi.fn(),
  openRoboLab: vi.fn(),
  openDinosaurValley: vi.fn(),
};

describe("Star Bridge living map", () => {
  it("preserves every existing destination alongside the mission landmark", () => {
    const markup = renderToStaticMarkup(
      <WorldMap profile={createProfile("Nico")} open={vi.fn()} beginStarBridge={vi.fn()} />,
    );
    expect(markup.match(/class="fw-destination"/g)).toHaveLength(WORLD_SECTIONS.length - 1);
    expect(markup).toContain("class=\"fw-star-bridge is-broken\"");
  });

  it("shows the broken bridge and bilingual mission entry", () => {
    const state = initialStarBridgeState();
    const english = renderToStaticMarkup(<StarBridgeMap state={state} language="en" {...handlers} />);
    const spanish = renderToStaticMarkup(<StarBridgeMap state={state} language="es-MX" {...handlers} />);

    expect(english).toContain("The Broken Star Bridge");
    expect(english).toContain("Star Bridge broken");
    expect(english).toContain("Begin the adventure");
    expect(spanish).toContain("El Puente Estelar Roto");
    expect(spanish).toContain("Puente Estelar roto");
    expect(spanish).toContain("Comenzar la aventura");
  });

  it("maps persisted progress to stable mission phases", () => {
    expect(starBridgeMissionPhase(initialStarBridgeState())).toBe("discover");
    expect(starBridgeMissionPhase({ ...initialStarBridgeState(), step: "scanner_passed" })).toBe("prepare");
    expect(starBridgeMissionPhase({ ...initialStarBridgeState(), step: "bridge_inspected" })).toBe("repair");
  });

  it("shows the restored bridge and Dinosaur Valley action only after valid completion", () => {
    let state = initialStarBridgeState();
    for (const type of [
      "REVEAL_BRIDGE",
      "CONFIGURE_ROBOT",
      "PASS_MOVEMENT_TEST",
      "PASS_SCANNER_TEST",
      "PASS_LOGIC_TEST",
      "INSPECT_BRIDGE",
      "INSTALL_STAR_CORE",
      "COMPLETE_ADVENTURE",
    ] as const) state = reduceStarBridge(state, { type }, () => "2026-08-30T16:00:00.000Z");

    const markup = renderToStaticMarkup(<StarBridgeMap state={state} language="en" {...handlers} />);
    expect(markup).toContain("The Star Bridge shines again!");
    expect(markup).toContain("Bridge restored · Valley unlocked");
    expect(markup).toContain("Visit Dinosaur Valley");
    expect(markup).not.toContain("Star Bridge broken");
  });
});
