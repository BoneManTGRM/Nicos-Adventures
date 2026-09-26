export const SIGNAL_RUN_ID = "signal-run"; // Keep saved arcade scores and mission IDs compatible.
export const CHECKPOINT_COUNT = 12;
export const ANSWERS_PER_CHECKPOINT = 5;
export const SPRINT_SECONDS = 75;

export type DashQuestion = {
  prompt: string;
  answer: number;
  choices: number[];
  explanation: { en: string; "es-MX": string };
};

// A seeded generator keeps a question stable while React rerenders the timer.
export function makeQuestion(seed: number, checkpoint: number): DashQuestion {
  let state = (seed >>> 0) || 1;
  const pick = (limit: number) => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state % limit;
  };
  const kind = checkpoint < 1 ? 0 : checkpoint < 3 ? pick(2) : pick(3);
  const range = checkpoint < 2 ? 9 : checkpoint < 5 ? 15 : 20;
  let first = 2 + pick(range - 1), second = 1 + pick(checkpoint < 2 ? 7 : 9);
  if (kind === 1 && second > first) [first, second] = [second, first];
  if (kind === 2) { first = 2 + pick(Math.min(7, 3 + Math.floor(checkpoint / 2))); second = 2 + pick(8); }
  const answer = kind === 0 ? first + second : kind === 1 ? first - second : first * second;
  const symbol = kind === 0 ? "+" : kind === 1 ? "−" : "×";
  const distractors = new Set<number>();
  for (const offset of [1, -1, 2, -2, second, -second, 10]) {
    const candidate = answer + offset;
    if (candidate >= 0 && candidate !== answer) distractors.add(candidate);
    if (distractors.size >= 2) break;
  }
  const choices = [answer, ...Array.from(distractors).slice(0, 2)];
  const shift = pick(3);
  return {
    prompt: `${first} ${symbol} ${second} = ?`, answer,
    choices: choices.map((_, index) => choices[(index + shift) % 3]),
    explanation: {
      en: kind === 2 ? `${first} groups of ${second} make ${answer}.` : kind === 1 ? `Take ${second} away from ${first} to get ${answer}.` : `Start at ${first} and count ${second} more to reach ${answer}.`,
      "es-MX": kind === 2 ? `${first} grupos de ${second} son ${answer}.` : kind === 1 ? `Quita ${second} de ${first} y quedan ${answer}.` : `Empieza en ${first} y suma ${second} para llegar a ${answer}.`,
    },
  };
}
