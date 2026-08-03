# Nico's World Profile and Showtime Schema

Nico's World currently has two local profile formats because the web PWA and Streamlit client have different persistence environments. They share concepts but are not byte-for-byte interchangeable.

## Version matrix

| Client | Current format | Persistence | Showtime behavior |
|---|---:|---|---|
| React/Vite PWA | web store schema **3** | browser localStorage + JSON export/import | full movie editor, metadata persistence, local WebM download |
| Streamlit | portable profile version **5** | session state + JSON export/import | privacy-first deep link; no server-side recording or upload |
| FastAPI foundation | existing API models | optional future use; not required by static PWA | no video endpoint and no upload contract |

The web schema number and Streamlit profile number are separate namespaces. New work must name the client and version explicitly rather than referring to a generic “schema version.”

## Web profile v3 additions

```ts
type NicoPreferences = {
  profession: NicoProfessionId;
  accentColor: string;
  speechEnabled: boolean;
};

type MovieProject = {
  id: string;
  title: string;
  characters: MovieCharacterRef[]; // 1–3
  poseSequence: MoviePoseStep[];   // 1–8
  background: string;
  caption: string;
  language: "en" | "es-MX";
  durationMs: number;              // 4,000–8,000
  createdAt: string;
  lastDownloadedAt?: string;
  lastMimeType?: string;
};

type LocalProfile = {
  schemaVersion: 3;
  // existing fields...
  nico: NicoPreferences;
  movieProjects: MovieProject[];
};
```

`web/src/storage.ts` migrates v1 and v2 stores to v3. Every movie project is reconstructed from allowed fields, bounded, and validated. Unknown fields such as `videoBlob`, object URLs, or arbitrary nested data are discarded.

## Python equivalent

`core/showtime.py` declares `MovieCharacterRef`, `MoviePoseStep`, and `MovieProject` TypedDict contracts and exposes `normalize_movie_project`. The normalizer mirrors the web limits and also drops unknown fields.

The Streamlit portable profile does not yet persist these objects. That is intentional for the initial bridge: remote Streamlit deployments must not become video or child-content upload paths. A later local-only import experience may display these metadata records after a deliberate cross-client backup format is designed.

## Migration rules

- Existing web profiles keep robots, monsters, pets, stars, badges, art, stories, dinosaurs, and other progress.
- Missing `nico` data defaults to the Explorer profession, green accent, and local speech enabled.
- Missing `movieProjects` becomes an empty list.
- Invalid character kinds or poses are removed.
- Projects without at least one valid character and pose are discarded.
- Text and collections are bounded before persistence.
- Full video bytes are never accepted into the normalized profile.

## Cross-client policy

Do not silently treat a Streamlit Version 5 save as a web v3 store or vice versa. A future conversion tool must:

1. identify the source format explicitly;
2. map compatible collections through typed normalizers;
3. report unsupported data instead of silently losing it;
4. keep all conversion local;
5. never include video blobs.
