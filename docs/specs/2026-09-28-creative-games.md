# Monster Garage and Rainbow Kingdom

Approved scope: both games in the existing arcade; preserve existing destinations; 100 named car parts (70 functional, 30 cosmetic); repeatable ramps; break-apart crashes; free rebuilding; chosen rewards; saved builds; build-and-ride unicorn gardens. No voice, payment, child accounts, public chat or added hosted service.

Architecture: creativeGames/save.ts is a bounded optional schema-v4 extension for profile-specific wallets, unlocks, builds, monotonic drive settlement and resumable snapshots. Existing backup/restore includes it. Never create an independent localStorage owner. catalog.ts has 100 bilingual items with permanent prices and 12 magic pieces. carPhysics.ts/carArt.ts separate deterministic fixed-step simulation from Canvas drawing. MonsterGarage.tsx provides accessible touch/keyboard building and driving. kingdomPhysics.ts/RainbowKingdom.tsx provide authored islands, build pads, playable unicorns and one-time rescue rewards. Lazy arcade entries are keyed by active profile. Existing Becca workshop remains unchanged.

Acceptance: exact inventory; profile migration/isolation/round-trip; duplicate/insufficient purchases; single run settlement; real grounded/airborne/detachment physics; repeatable tracks; functional magic placement and rescue rewards. Browser checks cover driving, pause/resume, purchase/reload, course building/riding, portrait English/es-MX, keyboard, WebKit, reduced motion and offline. Preserve full existing unit/build gates.

Release through feat/monster-garage-rainbow-kingdom. Add only this exact branch to the preview guard, not a wildcard. CI and preview evidence precede merge/activation. A Cloudflare version upload is not production activation. Preserve approval gates and never claim physical-iPhone testing without observing it.

Physics and prices are initial tuning, not claims of engineering realism or validated educational outcomes. Advanced attachment compatibility must be visible. No unresolved first-implementation product decisions.

Recorded pre-implementation failures: profile.test.ts lost creativeGames.garage.bolts during normalization and found neither new arcade entry (both assertion failures after providing the window boundary). carPhysics.test.ts observed a stationary chassis and no detached pieces in the initial simulation contract. Other reward/catalog tests were added after their implementation and are not claimed as red-green evidence.
