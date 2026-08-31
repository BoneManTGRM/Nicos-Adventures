# Nico's World Animation Bible

## Motion target

Movement must feel natural, fluid, weighted, expressive, and readable. Final character motion must not rely primarily on arbitrary CSS rotation loops, fixed bounce timers, instant turns, or disconnected pose swaps.

## Locomotion

Input flows through desired movement, heading, acceleration, velocity, character control, animation state, playback speed, blend weights, foot placement, and camera response.

Required qualities:

- anticipation before large movement;
- acceleration and deceleration;
- momentum appropriate to body size;
- turn-in-place at low speed where appropriate;
- curved turning while moving;
- planted-foot contact without obvious sliding;
- subtle hip motion and shoulder counter-rotation;
- stable head motion;
- natural settle into idle.

## State blending

Representative sequences:

`Idle -> WalkStart -> Walk -> Jog -> Run`

`Run -> Jog -> Walk -> Stop -> Settle -> Idle`

`Walk -> Slow -> Reach -> Grab -> Carry -> Place -> React -> Idle`

Transitions must blend without visible pose resets.

The canonical 2D Nico foundation supplies `Idle`, `Walk`, `Run`, and `Celebrate` states through a consistent layered rig or normalized frame sequence. Every state shares the approved silhouette, scale, bottom-center anchor, facial identity, lighting model, and wardrobe attachment points. Locomotion must articulate shoulders, elbows, hips, knees, and feet while preserving volume and preventing layer separation. Runtime state changes blend or transition without restarting the active animation on unrelated React renders.

These foundation clips establish a safe motion contract. They do not replace the final in-scene locomotion pass, where controller velocity drives playback speed and blend weights, foot placement is reviewed against ground contact, and start/stop/turn transitions are added as the playable bridge slice demands them.

BoltBot's test-chamber route is a discrete locomotion reference: command input produces ordered waypoints, not a final-pose shortcut. The route controller brakes at each pad, turns in place before a new heading, accelerates into each forward segment, and selects `Drive` plus its playback rate from measured linear or angular speed. Resetting a route returns BoltBot to the start under the same controller rather than teleporting it. Reduced motion may show the stable final pose because the accessible DOM controls remain the authoritative gameplay path.

## Interaction

Use authored 2D animation plus targeted mesh deformation, hand targets, and constrained attachment points where exact contact materially improves the result, including tools, robot parts, switches, books, fossils, doors, petting, placement, and pointing.

## Procedural life

Allowed restrained behaviors include blinking, breathing, weight shifts, gaze tracking, head tracking, stance adjustment, BoltBot antenna/sensor reactions, and species-appropriate animal idle behavior. Never use random jitter.

Large creatures must derive gait phase from measured travel speed, ease into and out of movement, turn through damped headings, carry weight through the torso, and let the neck and tail settle after the body. A quadruped may use diagonal leg pairs for a readable slow walk, but limb swing must fade to a planted stance as velocity reaches zero. Reduced motion uses stable authored poses while preserving every observation and control.

## Acceptance gate

Major motion must have:

- no obvious foot sliding;
- no snapping or teleporting;
- no joint popping;
- no detached clothing;
- no uncontrolled rotation jumps;
- no ordinary React-rerender animation resets;
- believable hand/object contact where expected;
- correct iPhone background/foreground recovery;
- a usable reduced-motion path.

An animation is not complete merely because it plays; rendered motion must look natural during browser playtesting.
