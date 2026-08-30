import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { createProfile } from "../storage";
import { BoltBotConfigurationGate } from "./BoltBotConfigurationGate";

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
