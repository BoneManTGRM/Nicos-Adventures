# Nico's World art and media deep scan

## Scope

This review covered the React PWA's Nico character pipeline, Dress-Up Studio, Ask Nico, Animal Forest, Dinosaur Valley, image recovery scripts, PWA cache behavior, and the world-module integration loaded by `FullApp.tsx`.

## Confirmed production defects fixed

### 1. Nico preferred a small drag sprite over the approved artwork

Compact appearances in the persistent guide, World Map, Robot Home, Clubhouse, and Ask Nico used the small body-plus-outfit sprite even when the larger approved Nico character and outfit artwork had already loaded. Enlarging that sprite made Nico look soft or blurry.

**Fix:** `NicoCostumeFigure` now prioritizes the approved finished outfit art, then the approved character art, and uses the small draggable sprite only as a last-resort fallback.

### 2. Tall outfit cells were stretched into square placements

The approved profession cells are tall character illustrations. Compact launchers forced them into square frames without preserving their crop geometry.

**Fix:** compact placements now crop the tall artwork inside an overflow-hidden square rather than stretching its width and height.

### 3. Dress-Up thumbnails and drag previews still used the blurry sprite

The large result could use approved art, while the closet thumbnails and dragged ghost still used the lower-resolution sprite.

**Fix:** every profession with approved finished artwork now uses it in the thumbnail and drag preview. Additional professions keep the composed fallback until dedicated finished art is available.

### 4. Ask Nico displayed a separate low-resolution About image

Ask Nico used the small `about.webp.b64` asset instead of the same saved-outfit character used throughout the rest of the app.

**Fix:** Ask Nico now uses the shared `NicoCostumeFigure`, so it displays the saved profession and benefits from the approved-art priority.

### 5. Animal Forest required a live Wikipedia request to show an image

When offline, on a weak connection, or when the REST endpoint or Wikimedia image failed, the card lost its visual and fell back to a generic placeholder.

**Fix:** every card now renders a local habitat illustration immediately. A Wikimedia photograph is an optional enhancement layered on top after it loads successfully. Network failure never removes the local visual.

### 6. Dinosaur Valley had reverted to emoji-only cards

The previous `dinosaur-art.js` enhancement did not render inside the newer React Dinosaur Valley module, leaving only emoji in the cards.

**Fix:** the React module now owns six distinct, resolution-independent SVG dinosaur silhouettes and uses them in both collection cards and expedition panels.

### 7. The global recovery script could replace unrelated images

`asset-recovery.js` listened for failures from every image in the document unless a component explicitly opted out. That made it possible for failed Nico or interface art to be replaced by a wildlife placeholder.

**Fix:** recovery is now opt-in and only applies to images marked `data-recoverable="wildlife"`. Protected Nico and React media are never rewritten by this script.

### 8. Completed C2 destinations existed but were not mounted

The enhanced Art Studio, Story Castle, Robot Home, Memory Museum, Badge Observatory, and Parent & Settings modules were present in the repository, but `FullApp.tsx` still imported their older grouped implementations.

**Fix:** production now imports the completed focused modules and their `creative-memory.css` styling.

### 9. Safari could remain on the previous media bundle

The service worker was still on cache v18 after the art restoration work.

**Fix:** cache and refresh version advance to v19, old caches are removed, and the active page reloads once when the new worker takes control.

## New release protections

- local wildlife art renders without a network response
- all six supported dinosaur IDs have a distinct SVG silhouette
- Dinosaur Valley cannot return to emoji-only cards
- Nico must prioritize approved art before the draggable fallback
- Dress-Up thumbnails and drag previews must use approved art when available
- image recovery must remain explicitly scoped
- completed creative, home, memory, badge, and settings modules must remain mounted
- mobile and reduced-motion media styling is required

## Follow-up priorities

These items are useful future improvements but were not required to restore reliable production art:

1. Replace text-encoded `.b64` art payloads with directly served WebP or AVIF files and add dimension checks.
2. Produce dedicated finished outfit art for all 26 professions instead of using aliases for the additional roles.
3. Remove the legacy `window.fetch` monkeypatch in `wildlife-director.js` after the local-first wildlife pipeline has proven stable.
4. Add screenshot regression tests at common iPhone widths for Nico, wildlife, dinosaurs, and the Clubhouse.
5. Add an asset manifest containing dimensions, intended crop, focal point, and accessibility text.
6. Measure offline cache usage and provide a parent-facing cache/storage diagnostic.
7. Add broader local animal silhouette families so species differ beyond their emoji while remaining fully offline.

## Privacy

The changes add no account, analytics, advertisement, external generative AI, cloud profile storage, or child-content upload. Wildlife photographs remain optional third-party reads; all required visual content is local.
