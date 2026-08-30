# BoltBot Golden Adventure Contract

## Purpose

BoltBot is Nico's canonical robot partner for The Broken Star Bridge. The foundation establishes one reusable 3D identity, a profile-compatible configuration gate, and deterministic test-chamber rules without creating a second save system or mounting unfinished 3D in the current Robo Lab.

## Existing profile integration

Golden Adventure configuration continues to use the schema-v4 `Robot` fields already saved in `profile.robot`, `profile.robots`, and `activeRobotId`:

- `base` supplies movement capability;
- `eyes` supplies scanner capability;
- `arms` supplies repair capability;
- `power` supplies Star Bridge power compatibility;
- `color` and `secondary_color` recolor the canonical 3D materials at runtime.

`evaluateBoltBotReadiness` is a pure gate over those existing fields. The Golden Adventure UI may dispatch `CONFIGURE_ROBOT` only after the gate is ready. User-created robot names and canonical profile IDs remain unchanged and untranslated.

## Test chamber contract

The short chamber has three deterministic, age-appropriate proofs:

1. Movement: follow `forward → right → forward` in order.
2. Scanner: identify the unique strongest signal at the Star Core socket.
3. Logic: continue the alternating `star → bolt → star → bolt` pattern.

These pure rules do not persist a competing chamber state. The existing Golden Adventure reducer remains the only authority that records `movement_passed`, `scanner_passed`, and `logic_passed` in the profile.

Every essential interaction must receive tap and keyboard controls, centralized English and Mexican Spanish copy, no mandatory time pressure, non-color-only feedback, and a reduced-motion presentation when the chamber UI is mounted.

## 3D asset contract

`web/public/assets/3d/boltbot/canonical-boltbot.glb` provides named scanner, Star Core, gripper, drive-base, wheel, head, torso, and articulated arm nodes. Its repository-owned generator must be deterministic. Generated metadata records dimensions, ground origin, anchors, animation durations, materials, provenance, privacy, byte budget, and SHA-256.

Foundation clips are `Idle`, `Drive`, `Scan`, `Think`, `Repair`, and `Celebrate`. Runtime changes cross-fade clips; unrelated React renders must not reset them. The final bridge slice still requires browser review of wheel contact, tool contact, scanner response, handoff with Nico, reduced motion, and iPhone/WebKit recovery before production acceptance.
