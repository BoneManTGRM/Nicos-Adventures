# Use the site's unicorn in Rainbow Kingdom

Owner request: the unicorn needs a substantial visual improvement and must use the same artwork as the rest of Nico's World. Trucks need only limited adjustments. Publish the games, not another mockup or prompt.

Baseline: 25b14837c5d6790198adf60913f0c090153be987. Reuse the exact existing BeccaCorner assets: unicorn-prance-v2.webp, unicorn-float-v2.webp, unicorn-turn-v2.webp, unicorn-rest-v2.webp. They are transparent raster illustrations, not a new 3D renderer. The playable character, portrait and arcade card must agree. Keep a shared scale and feet baseline across poses. Select poses from observed game motion without editing simulation state. Preload before play and provide an explicit retry on load failure. Cache palette variants; do not process pixels every frame. Respect reduced motion.

Truck scope: selected paint reaches the main body and detached panels; clearer rim detailing and small card/workbench finish adjustments. Preserve the 100-part catalog, all physics, controls, prices, rewards, ownership, profile isolation and save schema.

Local evidence: the original playable unicorn failed a real-canvas assertion requiring raster drawImage; the original truck failed a pixel-difference assertion requiring selected body paint. Both assertions then passed on the updated renderer. All 100 parts rendered and the car snapshot stayed unchanged. Strict renderer TypeScript validation passed. Full app and browser acceptance must still run on this branch; local artwork previews are not production evidence.

Release: existing CI/Creative Games Acceptance, plus targeted asset-loading/retry and screenshot tests. Inspect actual mobile frames. Merge only the exact passing head, then confirm release.json and both games on nicos-world.com. Do not clear localStorage or existing child progress. Do not claim live deployment before verification.
