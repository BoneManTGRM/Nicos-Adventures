# Nico's World Art Bible

## Canonical direction

Nico's World uses premium stylized storybook realism: believable anatomy, materials, light, shadow, depth, perspective, and environmental integration without uncanny photorealism.

Visual quality is more important than forcing a single rendering technique. Production art may be polished 2D illustration, layered 2.5D, or 3D when that medium best serves the scene. Regardless of technique, reject flat clip-art treatment, emoji as finished character art, heavy generic cartoon outlines, pasted-on characters, and effects that substitute glow for material definition.

The minimum professional bar is:

- clear foreground, midground, and background separation;
- one coherent key light with supporting ambient and rim light;
- contact shadows and believable grounding;
- material-specific highlights, texture, and edge treatment;
- consistent perspective, scale, and color script within a destination;
- expressive, child-friendly silhouettes without anatomical or facial distortion;
- restrained detail that remains readable on an iPhone screen.

## Canonical Nico

The approved illustrated Nico references are the visual source of truth. Production assets must preserve:

- dark textured hair;
- round red glasses;
- expressive dark eyes;
- warm stylized facial proportions;
- consistent apparent age and silhouette;
- green/cream identity;
- khaki explorer styling;
- green sneakers;
- curious, smart, kind, adventurous character.

The private family photograph is reference-only and must never be committed, cached, bundled, or shipped.

## Consistency gate

Reject production assets that materially drift in face, glasses, hair, eye appearance, body proportions, apparent age, skin tone, silhouette, or wardrobe geometry.

## Rendering

- coherent physically believable lighting;
- contact shadows;
- environment color influence;
- dimensional foreground/midground/background composition;
- restrained atmospheric effects;
- readable child-friendly silhouettes;
- consistent camera scale and perspective.

Characters must look present in the environment, not pasted over it.

## Asset contract

2D production assets should use an appropriate web format (SVG for controlled layered illustration; AVIF/WebP with a PNG fallback when raster transparency is required), documented provenance, deterministic optimization, and responsive sizing. Important characters should remain layerable or riggable where motion or wardrobe changes require it.

When 3D is the chosen technique, runtime assets ship as GLB/glTF 2.0. Source DCC formats are not runtime contracts. Asset metadata should include identity, version, hash, dimensions, scale, pivots, anchors, skeleton/animations where applicable, texture data, provenance, and license.

The canonical Nico foundation lives at `web/public/assets/3d/nico/canonical-nico.glb`. Its generated metadata is the machine-readable contract for scale, bounds, anchors, articulated nodes, animation clips, provenance, and privacy. The repository-owned generator must produce the same hash from the same source revision.

`canonical-foundation` is an implementation status, not a claim that visual acceptance is complete. Nico becomes production-approved only after representative desktop and iPhone/WebKit scene reviews confirm the front, three-quarter, and side silhouettes, materials, lighting response, motion, and environment integration. Refinement may change geometry and materials without breaking the named node and anchor contract.

## Performance

Visual fidelity may scale by device quality tier, but character identity, gameplay readability, and interaction semantics must not change.

## Dinosaur Valley

The Sunrise Overlook establishes the destination's environment language: warm early light, cool atmospheric depth, layered rock and plant silhouettes, readable river reflections, and restrained storybook color. Dinosaurs use believable species silhouettes and grounded contact shadows without chasing photorealism. Procedural geometry is an arrival foundation; future authored GLB creatures must preserve the same scale, framing, accessibility, and mobile performance contract.
