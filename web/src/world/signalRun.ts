export type Command = "forward" | "left" | "right";
export type Point = { x: number; y: number };
export type Direction = 0 | 1 | 2 | 3; // north, east, south, west
export type Board = { start: Point; facing: Direction; battery: Point; beacon: Point; walls: Point[] };
export type RobotState = Point & { facing: Direction; charged: boolean };
export type StepResult = { state: RobotState; outcome: "moving" | "blocked" | "won" };

export const GRID_SIZE = 5;
export const PROGRAM_LIMIT = 24;
export const LEVEL_COUNT = 12;
export const SIGNAL_RUN_ID = "signal-run";

const layouts: Board[] = [
  { start: { x: 0, y: 4 }, facing: 1, battery: { x: 2, y: 4 }, beacon: { x: 4, y: 4 }, walls: [] },
  { start: { x: 0, y: 4 }, facing: 1, battery: { x: 1, y: 3 }, beacon: { x: 4, y: 2 }, walls: [{ x: 2, y: 4 }, { x: 2, y: 3 }, { x: 0, y: 2 }] },
  { start: { x: 0, y: 4 }, facing: 1, battery: { x: 2, y: 2 }, beacon: { x: 4, y: 0 }, walls: [{ x: 2, y: 4 }, { x: 2, y: 3 }, { x: 1, y: 1 }, { x: 3, y: 2 }] },
];

export function samePoint(a: Point, b: Point): boolean { return a.x === b.x && a.y === b.y; }

export function boardFor(level: number): Board {
  const source = layouts[Math.floor(level / 4) % layouts.length];
  const quarterTurns = level % 4;
  const rotate = (point: Point): Point => {
    let { x, y } = point;
    for (let turn = 0; turn < quarterTurns; turn++) [x, y] = [GRID_SIZE - 1 - y, x];
    return { x, y };
  };
  return { start: rotate(source.start), facing: ((source.facing + quarterTurns) % 4) as Direction,
    battery: rotate(source.battery), beacon: rotate(source.beacon), walls: source.walls.map(rotate) };
}

export function initialRobot(board: Board): RobotState {
  return { ...board.start, facing: board.facing, charged: false };
}

export function stepRobot(board: Board, state: RobotState, command: Command): StepResult {
  if (command !== "forward") return { state: { ...state, facing: ((state.facing + (command === "right" ? 1 : 3)) % 4) as Direction }, outcome: "moving" };
  const offsets: Point[] = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
  const offset = offsets[state.facing];
  const next = { ...state, x: state.x + offset.x, y: state.y + offset.y };
  if (next.x < 0 || next.y < 0 || next.x >= GRID_SIZE || next.y >= GRID_SIZE || board.walls.some(wall => samePoint(wall, next))) {
    return { state, outcome: "blocked" };
  }
  next.charged = state.charged || samePoint(next, board.battery);
  return { state: next, outcome: next.charged && samePoint(next, board.beacon) ? "won" : "moving" };
}
