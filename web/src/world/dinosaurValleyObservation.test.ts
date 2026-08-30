import { describe, expect, it } from "vitest";
import {
  initialDinosaurValleyObservationState,
  isDinosaurValleyObservationComplete,
  nextDinosaurValleyObservation,
  observeDinosaurValleyClue,
} from "./dinosaurValleyObservation";

describe("Dinosaur Valley observation", () => {
  it("requires the three visual clues in field order", () => {
    const initial = initialDinosaurValleyObservationState();
    const skipped = observeDinosaurValleyClue(initial, "canopy");
    const footprints = observeDinosaurValleyClue(skipped, "footprints");
    const canopy = observeDinosaurValleyClue(footprints, "canopy");
    const complete = observeDinosaurValleyClue(canopy, "herd-path");

    expect(skipped).toBe(initial);
    expect(nextDinosaurValleyObservation(initial)).toBe("footprints");
    expect(nextDinosaurValleyObservation(footprints)).toBe("canopy");
    expect(nextDinosaurValleyObservation(canopy)).toBe("herd-path");
    expect(isDinosaurValleyObservationComplete(complete)).toBe(true);
  });

  it("keeps completed clues idempotent and reset creates a clean watch", () => {
    const footprints = observeDinosaurValleyClue(initialDinosaurValleyObservationState(), "footprints");

    expect(observeDinosaurValleyClue(footprints, "footprints")).toBe(footprints);
    expect(initialDinosaurValleyObservationState()).toEqual({ completed: [] });
  });
});
