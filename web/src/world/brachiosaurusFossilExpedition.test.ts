import { describe, expect, it } from "vitest";
import {
  BRACHIOSAURUS_PERIOD,
  BRUSH_ROUTE,
  brushFossilZone,
  classifyFossilPeriod,
  fossilExpeditionStage,
  initialFossilExpeditionState,
  selectFossilLayer,
} from "./brachiosaurusFossilExpedition";

describe("Brachiosaurus fossil expedition", () => {
  it("rejects skipped work and advances through the safe excavation order", () => {
    const initial = initialFossilExpeditionState();
    const skippedBrush = brushFossilZone(initial, "outer-ridge");
    const wrongLayer = selectFossilLayer(initial, "river-silt");
    const layer = selectFossilLayer(wrongLayer, "fern-shale");
    const skippedZone = brushFossilZone(layer, "vertebra");
    const brushed = BRUSH_ROUTE.reduce(brushFossilZone, layer);
    const wrongPeriod = classifyFossilPeriod(brushed, "Cretaceous");
    const complete = classifyFossilPeriod(wrongPeriod, BRACHIOSAURUS_PERIOD);

    expect(skippedBrush).toBe(initial);
    expect(fossilExpeditionStage(wrongLayer)).toBe("survey");
    expect(skippedZone).toBe(layer);
    expect(fossilExpeditionStage(brushed)).toBe("classify");
    expect(fossilExpeditionStage(wrongPeriod)).toBe("classify");
    expect(fossilExpeditionStage(complete)).toBe("complete");
  });

  it("keeps completed and repeated excavation actions idempotent", () => {
    const layer = selectFossilLayer(initialFossilExpeditionState(), "fern-shale");
    const firstZone = brushFossilZone(layer, "outer-ridge");
    const complete = initialFossilExpeditionState(true);

    expect(brushFossilZone(firstZone, "outer-ridge")).toBe(firstZone);
    expect(classifyFossilPeriod(complete, "Triassic")).toBe(complete);
  });
});
