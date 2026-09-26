import { describe, expect, it } from "vitest";
import { makeQuestion } from "./signalRun";

describe("Number Dash questions", () => {
  it("makes three distinct choices with exactly one correct answer for every checkpoint", () => {
    for (let checkpoint = 0; checkpoint < 12; checkpoint++) for (let seed = 1; seed <= 100; seed++) {
      const question = makeQuestion(seed, checkpoint);
      const match = question.prompt.match(/^(\d+) ([+−×]) (\d+) = \?$/);
      expect(match).not.toBeNull();
      const a = Number(match![1]), b = Number(match![3]);
      expect(question.answer).toBe(match![2] === "+" ? a + b : match![2] === "−" ? a - b : a * b);
      expect(new Set(question.choices).size).toBe(3);
      expect(question.choices.filter(choice => choice === question.answer)).toHaveLength(1);
      expect(question.choices.every(choice => choice >= 0)).toBe(true);
    }
  });

  it("starts with addition and introduces subtraction and multiplication later", () => {
    expect(makeQuestion(1, 0).prompt).toContain("+");
    expect(new Set(Array.from({ length: 100 }, (_, index) => makeQuestion(index + 1, 8).prompt.match(/[+−×]/)?.[0]))).toEqual(new Set(["+", "−", "×"]));
  });
});
