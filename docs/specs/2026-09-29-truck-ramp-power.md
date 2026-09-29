# Starter truck: second-ramp power repair

Owner report: the truck needs more power and cannot get past the second ramp.
Baseline: main 8a304b972f80aa64e40e92c69425d83cac0b6516; carPhysics.ts blob 0b389dccc0b7446425d9ecc295c9d5d8b737fa21.

## Reproduced failure
Run the unchanged production simulation at 120 Hz, using the starter build, held accelerator and no brake/tool. Start at x=1350 on level ground immediately before the second authored ramp. Require a live vehicle with grounded wheels and |angle| < 0.7 beyond x=1990 (past the second ramp landing area) within 25 simulated seconds. All six combinations of the three routes and starter/large wheels failed before implementation: the starter stopped near x=1460-1469; the large-wheel build stopped near x=1404-1468. This is an observed stalled climb, not an assumed user's exact custom build.

## Bounded change
Only carPhysics.ts changes gameplay. Add low-speed engine pulling force that tapers back to the old force at 260 world units/s; retain each engine's existing maximum-speed cutoff. Scale passive pitch damping with rotational inertia so the added power does not turn ordinary early jumps into uncontrolled spins. This is arcade tuning, not an engineering-realism claim. No terrain is moved or flattened; no automatic forward thrust while airborne, without throttle or after engine detachment; no invulnerability. Brake and both air-tilt directions remain active.

Do not change art, unicorn code, parts, prices, reward rules, ownership, or save schema. Existing saves continue to work. Heavy or deliberately unbalanced custom builds are not guaranteed to clear every course with the smallest motor.

## Evidence and release gate
The identical local six-case ramp contract failed before and passed after the change. An expanded local harness passed 22 checks: twelve start-line/near-ramp route-wheel combinations plus damage, debris-distance, detached motor/axle, braking, air tilt, speed cutoff, idle, determinism and reward preservation. Strict TypeScript checking of the production simulation passed. Local checks use the real transpiled production modules, not a physics mock; they are not claimed as the full repository suite.

New Vitest ramp coverage repeats all twelve routes/build/start combinations plus control invariants. New browser coverage must hold the actual on-screen pedal, land beyond ramp two without an upgrade, bank rewards, and preserve starter ownership across Chromium/WebKit English/es-MX. Existing game/unicorn/offline/save checks stay enabled. The live production verification is extended to require passage and landing beyond ramp two, rather than only a three-second drive. CI and post-deploy evidence must complete before claiming the live issue fixed.
