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

The canonical Nico foundation supplies `Idle`, `Walk`, `Run`, and `Celebrate` clips on a hierarchical transform rig. Locomotion clips must articulate shoulders, elbows, hips, knees, and feet; full-vector translation and scale tracks are required so animation binding cannot collapse character geometry. Runtime changes cross-fade clips and must not restart the active clip on unrelated React renders.

These foundation clips establish a safe motion contract. They do not replace the final in-scene locomotion pass, where controller velocity drives playback speed and blend weights, foot placement is reviewed against ground contact, and start/stop/turn transitions are added as the playable bridge slice demands them.

## Interaction

Use authored animation plus IK where exact contact materially improves the result, including tools, robot parts, switches, books, fossils, doors, petting, placement, and pointing.

## Procedural life

Allowed restrained behaviors include blinking, breathing, weight shifts, gaze tracking, head tracking, stance adjustment, BoltBot antenna/sensor reactions, and species-appropriate animal idle behavior. Never use random jitter.

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
