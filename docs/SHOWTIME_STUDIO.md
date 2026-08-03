# Showtime Studio

Showtime Studio is the web-first, privacy-first little-video maker in Nico's World.

## Product contract

- Recording happens entirely in the browser.
- Nothing is uploaded to Nico's World, Cloudflare, or another service.
- The browser downloads the resulting `.webm` file directly.
- The profile stores only lightweight project metadata: characters, pose steps, scene, caption, language, timestamps, and duration.
- Video `Blob` objects and object URLs never enter local storage or profile exports.
- A grown-up confirmation is required before recording and downloading.
- English and Mexican Spanish are supported.

## User flow

1. Open **Nico's Clubhouse** from the World Map, Robot Home, or Nico's floating guide.
2. Select **Showtime**.
3. Choose one to three owned characters. Nico and the active robot are always available; saved monsters and robot pets are included automatically.
4. Build a four- to eight-step sequence using existing pose names.
5. Choose a stage, title, caption, and four-, six-, or eight-second duration.
6. Preview the sequence using the existing robot and monster animation classes.
7. Confirm that a grown-up is helping.
8. Select **Make Video**. A canvas is recorded with `canvas.captureStream()` and `MediaRecorder`.
9. Download the WebM file. The video is not retained after the browser session unless the family downloads it.

## Browser support

The studio detects `HTMLCanvasElement.captureStream`, `MediaRecorder`, and a supported WebM MIME type. Unsupported browsers retain the live preview and project editor but show a clear message instead of a broken recording button. This progressive fallback is particularly important on versions of iPhone Safari without compatible WebM recording support.

## Architecture

```text
web/src/showtime/
├── ShowtimeStudio.tsx      # editor, parent gate, preview, record/download flow
├── movieRenderer.ts        # deterministic canvas frame rendering
├── recordMovie.ts          # captureStream + MediaRecorder boundary
├── NicoMovieLibrary.tsx    # lightweight project list and recreation flow
├── recordMovie.test.ts     # MIME and timeline tests
└── showtime.css            # touch-first layout and pose animations
```

Catalog data lives in `web/src/catalogs/showtime.json`. The web profile v3 schema is declared in `web/src/types.ts` and normalized in `web/src/storage.ts`.

## Pose reuse

The project uses the existing pose vocabulary rather than creating a second animation system:

- robot: `idle`, `wave`, `celebrate`, `launch`, `dance`, `spin`
- monster: `idle`, `celebrate`, `dance`, `spin`, `bounce`, `roar`, `sleep`
- pet and Nico: matching CSS classes using the same names and timing catalog

The live preview renders the real `RobotStage` and `MonsterStage`. The downloadable canvas uses the same saved pose sequence and durations through a deterministic frame renderer.

## Streamlit bridge

The Streamlit activity intentionally does not record video. It displays the privacy contract and opens `https://nicos-world.com/#nico/showtime`. No Streamlit profile or child content is included in the link. `core/showtime.py` contains the bounded Python equivalent of the movie metadata contract for future local import/display work.

## Development

```bash
cd web
npm ci
npm test
npm run build
```

Node `22.12.0` is recorded in `web/.nvmrc`. Dependencies are exact-pinned in `web/package.json` and the committed lockfile is the install authority.
