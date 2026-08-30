export type RouteWaypoint = {
  x: number;
  z: number;
  heading: number;
};

export type RouteMotorConfig = {
  maxSpeed: number;
  acceleration: number;
  deceleration: number;
  maxTurnSpeed: number;
  turnAcceleration: number;
  turnGain: number;
  positionEpsilon: number;
  headingEpsilon: number;
};

export type RouteMotorSnapshot = RouteWaypoint & {
  speed: number;
  angularSpeed: number;
  waypointIndex: number;
  settled: boolean;
};

const defaultConfig: RouteMotorConfig = {
  maxSpeed: 0.95,
  acceleration: 2.4,
  deceleration: 3.2,
  maxTurnSpeed: Math.PI * 1.15,
  turnAcceleration: Math.PI * 5,
  turnGain: 5.5,
  positionEpsilon: 0.008,
  headingEpsilon: 0.008,
};

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const moveTowards = (current: number, target: number, maxDelta: number): number => {
  if (Math.abs(target - current) <= maxDelta) return target;
  return current + Math.sign(target - current) * maxDelta;
};

const shortestAngle = (from: number, to: number): number =>
  Math.atan2(Math.sin(to - from), Math.cos(to - from));

export class RouteMotor {
  readonly config: RouteMotorConfig;
  private route: RouteWaypoint[] = [];
  private snapshot: RouteMotorSnapshot;

  constructor(start: RouteWaypoint, config: Partial<RouteMotorConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.snapshot = {
      ...start,
      speed: 0,
      angularSpeed: 0,
      waypointIndex: 0,
      settled: true,
    };
  }

  get state(): RouteMotorSnapshot {
    return { ...this.snapshot };
  }

  setRoute(route: readonly RouteWaypoint[]): void {
    this.route = route.map((waypoint) => ({ ...waypoint }));
    this.snapshot = {
      ...this.snapshot,
      waypointIndex: 0,
      settled: this.route.length === 0,
    };
  }

  step(deltaSeconds: number): RouteMotorSnapshot {
    const delta = clamp(Number.isFinite(deltaSeconds) ? deltaSeconds : 0, 0, 0.05);
    let { x, z, heading, speed, angularSpeed, waypointIndex } = this.snapshot;
    const target = this.route[waypointIndex];

    if (!target || delta === 0) {
      speed = moveTowards(speed, 0, this.config.deceleration * delta);
      angularSpeed = moveTowards(angularSpeed, 0, this.config.turnAcceleration * delta);
      this.snapshot = {
        x,
        z,
        heading,
        speed,
        angularSpeed,
        waypointIndex,
        settled: !target && speed === 0 && angularSpeed === 0,
      };
      return this.state;
    }

    const dx = target.x - x;
    const dz = target.z - z;
    const distance = Math.hypot(dx, dz);
    const atPosition = distance <= this.config.positionEpsilon;
    const desiredHeading = atPosition ? target.heading : Math.atan2(dx, dz);
    const headingError = shortestAngle(heading, desiredHeading);
    const desiredAngularSpeed = clamp(
      headingError * this.config.turnGain,
      -this.config.maxTurnSpeed,
      this.config.maxTurnSpeed,
    );
    angularSpeed = moveTowards(
      angularSpeed,
      desiredAngularSpeed,
      this.config.turnAcceleration * delta,
    );
    const turnDelta = Math.sign(headingError) * Math.min(Math.abs(headingError), Math.abs(angularSpeed * delta));
    heading += turnDelta;

    const alignment = clamp(Math.cos(headingError), 0, 1);
    const brakingSpeed = Math.sqrt(2 * this.config.deceleration * Math.max(0, distance));
    const desiredSpeed = atPosition
      ? 0
      : Math.min(this.config.maxSpeed, brakingSpeed) * alignment;
    speed = moveTowards(
      speed,
      desiredSpeed,
      (desiredSpeed > speed ? this.config.acceleration : this.config.deceleration) * delta,
    );

    if (!atPosition && speed > 0) {
      const travel = Math.min(speed * delta, distance);
      x += Math.sin(heading) * travel;
      z += Math.cos(heading) * travel;
      const remainingX = target.x - x;
      const remainingZ = target.z - z;
      if ((dx * remainingX) + (dz * remainingZ) < 0) {
        x = target.x;
        z = target.z;
      }
    }

    const remainingDistance = Math.hypot(target.x - x, target.z - z);
    const remainingHeading = Math.abs(shortestAngle(heading, target.heading));
    const stopped = speed <= 0.012 && Math.abs(angularSpeed) <= 0.035;
    if (remainingDistance <= this.config.positionEpsilon && remainingHeading <= this.config.headingEpsilon && stopped) {
      x = target.x;
      z = target.z;
      heading = target.heading;
      speed = 0;
      angularSpeed = 0;
      waypointIndex += 1;
    }

    this.snapshot = {
      x,
      z,
      heading,
      speed,
      angularSpeed,
      waypointIndex,
      settled: waypointIndex >= this.route.length && speed === 0 && angularSpeed === 0,
    };
    return this.state;
  }
}

export function routePlaybackRate(snapshot: Pick<RouteMotorSnapshot, "speed" | "angularSpeed">, config: Pick<RouteMotorConfig, "maxSpeed" | "maxTurnSpeed">): number {
  const travelEffort = Math.abs(snapshot.speed) / Math.max(config.maxSpeed, 0.001);
  const turnEffort = Math.abs(snapshot.angularSpeed) / Math.max(config.maxTurnSpeed, 0.001);
  return 0.55 + clamp(Math.max(travelEffort, turnEffort), 0, 1) * 0.75;
}
