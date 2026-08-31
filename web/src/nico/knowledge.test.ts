import { describe, expect, it } from "vitest";
import { answerNicoQuestion, suggestedQuestions } from "./knowledge";

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

  it("keeps every suggested question actionable in both languages", () => {
    const expectedIds = ["world-overview", "stars", "movies", "safe-question", "backup"];
    for (const language of ["en", "es-MX"] as const) {
      for (const [index, question] of suggestedQuestions(language).entries()) {
        expect(answerNicoQuestion(question, language), `${language}: ${question}`).toMatchObject({
          id: expectedIds[index],
        });
      }
    }
  });

  it("explains Phase 2 jobs in both languages", () => {
    const science = answerNicoQuestion("What does a scientist do?", "en");
    expect(science.id).toBe("science-jobs");
    expect(science.text).toContain("Scientists test ideas");

    const sports = answerNicoQuestion("¿Qué hace un tenista?", "es-MX");
    expect(sports.id).toBe("sports-jobs");
    expect(sports.text).toContain("tenis");
  });

  it("reports the expanded local outfit catalog", () => {
    const answer = answerNicoQuestion("How many outfits does Nico have?", "en");
    expect(answer.id).toBe("nico-clothes");
    expect(answer.text).toContain("26 local outfits");
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
