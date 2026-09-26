import { describe, expect, it } from "vitest";
import { boardFor, GRID_SIZE, initialRobot, LEVEL_COUNT, PROGRAM_LIMIT, samePoint, stepRobot, type Command, type RobotState } from "./signalRun";

describe("Signal Run programming puzzles", () => {
  it("has twelve distinct, solvable layouts within the command limit", () => {
    const signatures = new Set<string>();
    for (let level = 0; level < LEVEL_COUNT; level++) {
      const board = boardFor(level);
      signatures.add(JSON.stringify(board));
      for (const point of [board.start, board.battery, board.beacon, ...board.walls]) {
        expect(point.x).toBeGreaterThanOrEqual(0); expect(point.x).toBeLessThan(GRID_SIZE);
        expect(point.y).toBeGreaterThanOrEqual(0); expect(point.y).toBeLessThan(GRID_SIZE);
      }
      expect(board.walls.some(wall => samePoint(wall, board.battery) || samePoint(wall, board.beacon) || samePoint(wall, board.start))).toBe(false);
      const seen = new Set<string>(), queue: Array<{ state: RobotState; steps: number }> = [{ state: initialRobot(board), steps: 0 }];
      let found = false;
      for (let index = 0; index < queue.length && !found; index++) {
        const { state, steps } = queue[index];
        if (steps >= PROGRAM_LIMIT) continue;
        for (const command of ["forward", "left", "right"] as Command[]) {
          const result = stepRobot(board, state, command);
          if (result.outcome === "won") { found = true; break; }
          if (result.outcome === "blocked") continue;
          const key = JSON.stringify(result.state);
          if (!seen.has(key)) { seen.add(key); queue.push({ state: result.state, steps: steps + 1 }); }
        }
      }
      expect(found, `Level ${level + 1} must be solvable`).toBe(true);
    }
    expect(signatures.size).toBe(LEVEL_COUNT);
  });

  it("turns in place and stops at a wall without collecting a battery", () => {
    const board = boardFor(4);
    const start = initialRobot(board);
    const turn = stepRobot(board, start, "left");
    expect(turn.state).toMatchObject({ x: start.x, y: start.y, charged: false });
    expect(turn.state.facing).not.toBe(start.facing);
    const wall = stepRobot({ ...board, walls: [{ x: start.x, y: start.y - 1 }] }, { ...start, facing: 0 }, "forward");
    expect(wall).toEqual({ state: { ...start, facing: 0 }, outcome: "blocked" });
  });
});
