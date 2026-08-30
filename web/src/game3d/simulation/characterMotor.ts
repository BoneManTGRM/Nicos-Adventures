export type MovementInput = {
  x: number;
  z: number;
};

export type CharacterMotorConfig = {
  walkSpeed: number;
  runSpeed: number;
  acceleration: number;
  deceleration: number;
  turnSpeed: number;
};

export type CharacterMotorSnapshot = {
  position: MovementInput;
  velocity: MovementInput;
  speed: number;
  heading: number;
};

const defaultConfig: CharacterMotorConfig = {
  walkSpeed: 2.2,
  runSpeed: 4.5,
  acceleration: 8,
  deceleration: 10,
  turnSpeed: Math.PI * 2.2,
};

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const moveTowards = (current: number, target: number, maxDelta: number): number => {
  if (Math.abs(target - current) <= maxDelta) return target;
  return current + Math.sign(target - current) * maxDelta;
};

const shortestAngle = (from: number, to: number): number =>
  Math.atan2(Math.sin(to - from), Math.cos(to - from));

export class CharacterMotor {
  readonly config: CharacterMotorConfig;
  private snapshot: CharacterMotorSnapshot;

  constructor(config: Partial<CharacterMotorConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.snapshot = {
      position: { x: 0, z: 0 },
      velocity: { x: 0, z: 0 },
      speed: 0,
      heading: 0,
    };
  }

  get state(): CharacterMotorSnapshot {
    return {
      ...this.snapshot,
      position: { ...this.snapshot.position },
      velocity: { ...this.snapshot.velocity },
    };
  }

  reset(position: MovementInput = { x: 0, z: 0 }, heading = 0): void {
    this.snapshot = {
      position: { ...position },
      velocity: { x: 0, z: 0 },
      speed: 0,
      heading,
    };
  }

  step(input: MovementInput, deltaSeconds: number, running = false): CharacterMotorSnapshot {
    const delta = clamp(Number.isFinite(deltaSeconds) ? deltaSeconds : 0, 0, 0.05);
    const magnitude = Math.hypot(input.x, input.z);
    const hasInput = magnitude > 0.001;
    const direction = hasInput
      ? { x: input.x / magnitude, z: input.z / magnitude }
      : { x: 0, z: 0 };
    const targetSpeed = hasInput ? (running ? this.config.runSpeed : this.config.walkSpeed) : 0;
    const rate = targetSpeed > this.snapshot.speed
      ? this.config.acceleration
      : this.config.deceleration;
    const speed = moveTowards(this.snapshot.speed, targetSpeed, rate * delta);
    let heading = this.snapshot.heading;

    if (hasInput) {
      const desiredHeading = Math.atan2(direction.x, direction.z);
      const turn = shortestAngle(heading, desiredHeading);
      heading += clamp(turn, -this.config.turnSpeed * delta, this.config.turnSpeed * delta);
    }

    const velocity = {
      x: Math.sin(heading) * speed,
      z: Math.cos(heading) * speed,
    };
    const position = {
      x: this.snapshot.position.x + velocity.x * delta,
      z: this.snapshot.position.z + velocity.z * delta,
    };

    this.snapshot = { position, velocity, speed, heading };
    return this.state;
  }
}
