import { describe, expect, it } from "vitest";
import { answerNicoQuestion } from "./knowledge";

describe("answerNicoQuestion", () => {
  it("answers from the local bilingual knowledge catalog", () => {
    const answer = answerNicoQuestion("Are you an AI?", "en");
    expect(answer.id).toBe("safe-question");
    expect(answer.confidence).not.toBe("fallback");
    expect(answer.text).toContain("local helper");
  });

  it("matches Mexican Spanish questions", () => {
    const answer = answerNicoQuestion("¿Cómo gano estrellas?", "es-MX");
    expect(answer.id).toBe("stars");
    expect(answer.text).toContain("Ganas estrellas");
  });

  it("performs bounded arithmetic without evaluating arbitrary code", () => {
    expect(answerNicoQuestion("12 * 7", "en").text).toBe("The answer is 84.");
    expect(answerNicoQuestion("10 / 0", "en").id).toBe("math-divide-zero");
  });

  it("fails safely when the catalog has no supported answer", () => {
    const answer = answerNicoQuestion("Tell me a secret password", "en");
    expect(answer.confidence).toBe("fallback");
    expect(answer.text).toContain("safe answer");
  });
});
