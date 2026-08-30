import { describe, expect, it } from "vitest";
import { RouteMotor, routePlaybackRate, type RouteWaypoint } from "./routeMotor";

const start: RouteWaypoint = { x: -0.8, z: -0.75, heading: 0 };
const route: RouteWaypoint[] = [
  { x: -0.8, z: 0.1, heading: 0 },
  { x: -0.8, z: 0.1, heading: Math.PI / 2 },
  { x: 0.05, z: 0.1, heading: Math.PI / 2 },
];

function settle(motor: RouteMotor, maxFrames = 900) {
  const snapshots = [];
  for (let frame = 0; frame < maxFrames; frame += 1) {
    const snapshot = motor.step(1 / 60);
    snapshots.push(snapshot);
    if (snapshot.settled) return snapshots;
  }
  throw new Error("Route motor did not settle");
}

describe("route motor", () => {
  it("accelerates, stops for the turn, and settles through every waypoint", () => {
    const motor = new RouteMotor(start);
    motor.setRoute(route);
    const first = motor.step(1 / 60);
    const snapshots = [first, ...settle(motor)];
    const final = snapshots.at(-1)!;

    expect(first.speed).toBeGreaterThan(0);
    expect(first.speed).toBeLessThan(motor.config.maxSpeed);
    expect(first.z).toBeGreaterThan(start.z);
    expect(final).toMatchObject({ ...route.at(-1), waypointIndex: route.length, settled: true });
    expect(snapshots.length).toBeLessThan(600);
    expect(snapshots.some((snapshot) => snapshot.waypointIndex === 1 && snapshot.speed === 0 && Math.abs(snapshot.angularSpeed) > 0)).toBe(true);

    const largestTravel = Math.max(...snapshots.slice(1).map((snapshot, index) => {
      const previous = snapshots[index];
      return Math.hypot(snapshot.x - previous.x, snapshot.z - previous.z);
    }));
    const largestTurn = Math.max(...snapshots.slice(1).map((snapshot, index) =>
      Math.abs(snapshot.heading - snapshots[index].heading)));
    expect(largestTravel).toBeLessThanOrEqual(motor.config.maxSpeed / 60 + 0.001);
    expect(largestTurn).toBeLessThanOrEqual(motor.config.maxTurnSpeed / 60 + 0.001);
  });

  it("returns to the start under motion control when a route is reset", () => {
    const motor = new RouteMotor(start);
    motor.setRoute(route.slice(0, 1));
    for (let frame = 0; frame < 30; frame += 1) motor.step(1 / 60);
    const beforeReset = motor.state;

    motor.setRoute([start]);
    const afterReset = motor.step(1 / 60);
    const final = settle(motor).at(-1)!;

    expect(afterReset.z).not.toBe(start.z);
    expect(Math.hypot(afterReset.x - beforeReset.x, afterReset.z - beforeReset.z)).toBeLessThan(0.03);
    expect(final).toMatchObject({ ...start, settled: true });
  });

  it("scales authored playback from measured travel or turning effort", () => {
    const motor = new RouteMotor(start);
    expect(routePlaybackRate({ speed: 0, angularSpeed: 0 }, motor.config)).toBeCloseTo(0.55);
    expect(routePlaybackRate({ speed: motor.config.maxSpeed, angularSpeed: 0 }, motor.config)).toBeCloseTo(1.3);
    expect(routePlaybackRate({ speed: 0, angularSpeed: motor.config.maxTurnSpeed / 2 }, motor.config)).toBeCloseTo(0.925);
  });
});
