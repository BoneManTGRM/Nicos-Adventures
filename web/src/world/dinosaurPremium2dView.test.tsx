import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { DinosaurRecord } from "../types";
import { BrachiosaurusFossilExpedition } from "./BrachiosaurusFossilExpedition";
import { DinosaurValleyOverlook } from "./DinosaurValleyOverlook";

const brachiosaurus: DinosaurRecord = {
  id: "brachiosaurus",
  name: "Brachiosaurus",
  period: "Jurassic",
  emoji: "🦕",
  discovered: false,
};

describe("premium illustrated Dinosaur Valley views", () => {
  it("renders the localized overlook without a canvas or WebGL contract", () => {
    const html = renderToStaticMarkup(<DinosaurValleyOverlook language="es-MX" announce={vi.fn()} />);
    expect(html).toContain('data-dinosaur-renderer="premium-2d"');
    expect(html).toContain('data-dinosaur-overlook-stage="0"');
    expect(html).toContain("premium-dinosaur-overlook-atlas");
    expect(html).toContain("Lee las huellas");
    expect(html).not.toContain("<canvas");
    expect(html).not.toContain("game-canvas");
  });

  it("renders the localized fossil survey without a canvas or WebGL contract", () => {
    const html = renderToStaticMarkup(
      <BrachiosaurusFossilExpedition
        dinosaur={brachiosaurus}
        language="en"
        discovered={false}
        announce={vi.fn()}
        completeDiscovery={vi.fn()}
        close={vi.fn()}
        nextDinosaur={vi.fn()}
      />,
    );
    expect(html).toContain('data-dinosaur-renderer="premium-2d"');
    expect(html).toContain('data-fossil-stage="survey"');
    expect(html).toContain("premium-fossil-expedition-atlas");
    expect(html).toContain("Survey the fossil layer");
    expect(html).not.toContain("<canvas");
    expect(html).not.toContain("game-canvas");
  });
});
