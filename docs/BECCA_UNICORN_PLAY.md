# Becca unicorn playground

Adds a play area near the top of Becca's existing workshop using the four existing unicorn poses and current sparkle color. Feed an apple, brush the mane, or cuddle for visible responses. Magic Dance teaches repeating three authored sequences (3/4/5 steps); wrong moves retain the current step and the sequence can be viewed again. Star Hunt uses three nine-tile boards with 3/4/5 distinct stars, shape distractors, duplicate protection and an explicit next challenge.

English and Mexican Spanish, semantic buttons, keyboard/tap operation, 44px minimum targets, no audio or timer. No decay, penalties, new stars, persistence claims, network requests, dependencies or services. This play session resets on leaving or creating a new unicorn, as visibly explained. Existing profiles/rewards are untouched. The existing workshop itself was already session-only.

Verification: new game tests first failed because the engine was absent, then passed. 484 unit tests pass. Full build/type/performance checks run. Whole-site browser journey extended for care response, dance mistake/recovery/completion and keyboard star collection; published CI execution required. Explicitly allow this feature branch through the existing version-preview build boundary; unknown branches remain blocked, production still requires main.

Rollback: remove the new playground import/render and component; no data migration exists. Native-speaker review and physical iPhone acceptance not claimed.

Release regression: Spanish iPhone WebKit reported 18px page overflow on both attempts at 385ff944 and 9374fb83. Failure diagnostics localized it to the pet editor's accessory label (146px field, 207px scroll width). The label's implicit auto grid track retained the native select's intrinsic option width. Constrain that track with minmax(0, 1fr), preserving the existing field and options. Add per-field overflow assertions to the pet regression, keep the unchanged whole-page width gate, and rerun both. No global clipping or reduced acceptance thresholds.
