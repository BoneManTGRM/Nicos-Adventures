import { describe, expect, it } from "vitest";
import { ARCADE_GAMES } from "./catalogs";
import { ARCADE_QUESTIONS } from "./arcadeChallenges";

describe("Arcade challenge catalog", () => {
  it("provides three valid bilingual questions for all six games", () => {
    expect(ARCADE_GAMES).toHaveLength(6);
    for (const game of ARCADE_GAMES) {
      const questions = ARCADE_QUESTIONS[game];
      expect(questions, `${game} has no question bank`).toHaveLength(3);
      expect(new Set(questions.map((question) => question.id)).size).toBe(questions.length);
      for (const question of questions) {
        expect(question.prompt.en.trim()).toBeTruthy();
        expect(question.prompt["es-MX"].trim()).toBeTruthy();
        expect(question.options.length).toBeGreaterThanOrEqual(3);
        expect(question.correctIndex).toBeGreaterThanOrEqual(0);
        expect(question.correctIndex).toBeLessThan(question.options.length);
        expect(question.options.every((option) => option.en.trim() && option["es-MX"].trim())).toBe(true);
        expect(question.explanation.en.trim()).toBeTruthy();
        expect(question.explanation["es-MX"].trim()).toBeTruthy();
      }
    }
  });
});
