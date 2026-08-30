# Golden Adventure 3D runtime foundation

The Broken Star Bridge uses React Three Fiber inside the existing React application. The current router, AppShell, schema-v4 profile store, localization system, settings, and accessibility surfaces remain canonical.

## Runtime boundary

```text
serializable simulation -> renderer adapters -> R3F scene
                         -> DOM controls and announcements
                         -> schema-v4 persistence at milestones
```

- `web/src/game/goldenAdventure.ts` owns ordered, saveable progression.
- `web/src/game3d/simulation` owns high-frequency movement without React state.
- `web/src/game3d/animation` derives animation states and blend weights.
- `web/src/game3d/input` maps keyboard, tap, and future controller surfaces into shared actions.
- `web/src/game3d` owns scene composition, camera, lighting, assets, quality, audio, and renderer lifecycle.
- DOM components remain responsible for essential controls, text, settings, focus, and announcements.

React state must not become the per-frame simulation loop. Three.js objects must not be persisted in the local profile.

## Coordinate and asset conventions

- metres are the world unit;
- positive Y is up;
- character forward is positive Z before model-specific correction;
- GLB/glTF 2.0 is the runtime asset format;
- asset manifest keys, not filenames, are the public runtime contract;
- character origins sit at ground contact between the feet;
- environment pivots use stable authored origins documented in asset metadata.

## Initial dependency scope

The foundation installs only:

- `three`;
- `@react-three/fiber`;
- `@react-three/drei`.

Rapier is deferred until collision or physics tests prove it improves required gameplay. Post-processing is deferred until representative iPhone performance is measured. Essential accessibility is provided through semantic DOM controls rather than requiring canvas-only interaction.

## Quality policy

Quality tiers may change device-pixel ratio, antialiasing, and dynamic shadows. They may not change progression, interaction semantics, timing requirements, or available gameplay. Data-saving and constrained devices start conservatively.

The renderer reports WebGL context loss and restoration to the DOM accessibility bridge. Future scene integration must pause or safely resume simulation and audio during background, foreground, and context lifecycle changes.

## Integration gate

This foundation is intentionally not mounted into a production destination yet. The first consumer must be the narrow Golden Adventure vertical slice and must provide:

- bilingual labels and instructions;
- tap and keyboard alternatives for every essential interaction;
- a representative mobile performance measurement;
- context-loss and background/foreground recovery proof;
- no change to current destination access until the bridge flow is playable.
