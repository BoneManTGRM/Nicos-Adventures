# Nico's World local profile schema v4

Schema v4 is the canonical profile contract for the React PWA. It remains local-first and stores no video blobs, account credentials, analytics identifiers, or cloud references.

## Storage keys

Current browser store:

```text
nicos-world-local-save-v4
```

Read-only migration keys:

```text
nicos-world-local-save-v3
nicos-world-local-save-v2
nicos-world-local-save-v1
```

The first successful v4 save writes the normalized profile to the v4 key. Older keys are not modified or deleted automatically.

## New v4 fields

### Explicit active selections

```ts
activeRobotId: string
displayedArtworkId: string | null
activePetId: string | null
```

`profile.robot` remains as a compatibility view of the robot selected by `activeRobotId`. New code must update the ID and compatibility view together.

### Nico wardrobe foundation

```ts
wardrobe: {
  presetId: NicoProfessionId | null
  headwear: string | null
  eyewear: string | null
  top: string | null
  outerwear: string | null
  bottoms: string | null
  shoes: string | null
  backpack: string | null
  badge: string | null
  prop: string | null
  accentColor: string
}
```

Only lightweight wearable IDs are persisted. No image data is stored in the profile. The current profession selector writes `presetId`; the true layered wardrobe in issue #47 will fill and edit the individual slots.

### Backup timestamp

```ts
lastBackupAt: string | null
```

This is set only after the browser starts a local JSON backup download.

### Golden Adventure progress

```ts
adventures: {
  starBridge: {
    step: StarBridgeStep
    bridgeRepaired: boolean
    dinosaurValleyUnlocked: boolean
    museumAchievements: string[]
    completedAt?: string
  }
}
```

The Star Bridge reducer is the only supported progression path. Completion, the Dinosaur Valley unlock, and the `star-bridge-engineer` achievement are applied together after the ordered sequence. Loading and importing rebuild this object from a strict whitelist; inconsistent completion data fails closed without granting the unlock or achievement.

## Normalization and limits

Every imported or loaded profile is rebuilt from an explicit whitelist. Unknown fields are discarded.

Current bounds include:

- 12 profiles per browser store
- 50 robots
- 120 animals
- 60 monsters
- 60 pets
- 60 artworks
- 60 stories
- 100 dinosaurs
- 40 movie projects
- 1,000 newest unique completed/reward mission IDs
- 200 fossils
- 200 badges
- 100 decorations

Invalid section IDs return to the World Map. Invalid active IDs fall back to a valid saved item. Numeric values and text lengths are bounded.

## Migration behavior

- v1/v2/v3 profiles migrate in memory to v4.
- Legacy `profile.robot.id` becomes `activeRobotId`.
- The most recently stored artwork becomes `displayedArtworkId` when the field is absent.
- Existing Nico profession and accent values initialize the wardrobe preset and accent.
- Existing creations, discoveries, stars, badges, fossils, movies, and bilingual settings are retained within the documented limits.
- Existing profiles receive clean initial Golden Adventure progress without changing their prior content.
- Movie blobs or unknown imported properties are discarded.

## Backup format

```text
nicos-world-local-profile-v4
```

Restoring a backup creates a new local profile ID, preventing accidental overwrite of the current profile.

## Client parity

The Streamlit client retains its own Version 5 Python profile format. It does not consume the browser profile directly. Shared catalogs and intentional differences remain documented separately until the dual-client consolidation phase.
