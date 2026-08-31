import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { createProfile } from "../storage";
import { initialStarBridgeState } from "../game/goldenAdventure";
import { BoltBotConfigurationGate } from "./BoltBotConfigurationGate";
import { BoltBotTestChamber } from "./BoltBotTestChamber";

describe("BoltBot mission configuration", () => {
  it("explains missing systems without advancing or replacing the existing editor", () => {
    const profile = createProfile("Nico");
    const markup = renderToStaticMarkup(
      <BoltBotConfigurationGate
        robot={profile.robot}
        language="en"
        configure={vi.fn()}
      />,
    );

    expect(markup).toContain("Build a bridge-ready BoltBot");
    expect(markup).toContain("Repair arms");
    expect(markup).toContain("disabled=\"\"");
    expect(markup).toContain("Complete the missing systems first");
  });

  it("offers natural Mexican Spanish copy when all systems are ready", () => {
    const profile = createProfile("Nico", "es-MX");
    const markup = renderToStaticMarkup(
      <BoltBotConfigurationGate
        robot={{ ...profile.robot, arms: "Tool Arms" }}
        language="es-MX"
        configure={vi.fn()}
      />,
    );

    expect(markup).toContain("Construye un BoltBot listo para el puente");
    expect(markup).toContain("Usar este BoltBot");
    expect(markup).not.toContain("disabled=\"\"");
  });
});

describe("premium illustrated BoltBot test chamber", () => {
  it("uses a semantic 2D scene without a WebGL canvas", () => {
    const profile = createProfile("Nico");
    const state = { ...initialStarBridgeState(), step: "robot_configured" as const };
    const markup = renderToStaticMarkup(
      <BoltBotTestChamber
        state={state}
        robot={profile.robot}
        language="en"
        advance={vi.fn()}
        returnToMap={vi.fn()}
      />,
    );

    expect(markup).toContain('data-renderer="premium-2d"');
    expect(markup).toContain("Illustrated BoltBot test chamber");
    expect(markup).toContain('data-boltbot-renderer="premium-2d"');
    expect(markup).not.toContain("<canvas");
  });
});
