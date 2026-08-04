# Nico layered wardrobe

## Product behavior

Nico uses one fixed vector body and nine independent wearable slots:

1. headwear
2. eyewear / face accessory
3. top
4. outerwear
5. bottoms
6. shoes
7. backpack
8. badge
9. handheld prop

A garment card renders only that garment. Dragging the card moves the garment preview, not a completed Nico picture. Dropping it on Nico equips only its compatible slot. Existing pieces in other slots remain unchanged.

Tap and keyboard activation equip the same item without requiring drag motion.

## Editing controls

The wardrobe supports:

- equip or replace one slot
- remove one slot
- undo
- redo
- reset to Explorer
- randomize with valid slot-compatible pieces
- apply any of 26 profession presets
- edit any preset piece by piece after applying it
- save lightweight wearable IDs to the local profile

## Shared renderer

The same renderer is used by:

- Wardrobe Studio
- persistent Nico guide
- Clubhouse header
- Ask Nico
- World Map entry
- Robot Home entry
- live Showtime preview
- recorded Showtime canvas frames

`wardrobeSvg.ts` produces both:

- the complete one-body character SVG;
- garment-only SVGs for closet thumbnails and drag feedback.

This prevents geometry drift between React rendering and generated video frames.

## Profile contract

Schema v4 stores only IDs and an accent color:

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

No SVG, image, video, or child-created binary content is stored in localStorage.

## Asset strategy

The initial production wardrobe is generated from local vector geometry and colors. It is resolution-independent, works offline, and avoids stretching a low-resolution sprite.

The catalog can later point individual items to transparent PNG, WebP, or AVIF assets. Any raster replacement must use either:

- the exact `0 0 360 720` canvas; or
- explicit anchor metadata with slot, x, y, width, height, z-index, and rotation.

Existing poster and completed profession sheets remain visual references. They are not used as separable garments because the body, clothing, hands, lighting, and props are flattened together.

## Accessibility and mobile behavior

- pointer capture for mouse, pen, and touch
- movement threshold before a drag is recognized
- hit testing against the wardrobe stage
- highlighted compatible body slot
- tap fallback
- keyboard-focus indicators
- minimum touch targets
- responsive phone/tablet layouts
- reduced-motion behavior
- bilingual names and announcements

## Privacy

The wardrobe performs no network request. It uses no account, analytics, cloud storage, or external generative AI. All wardrobe choices remain in the browser profile.

## Verification

The production build rejects regressions if:

- the flattened profession-image implementation returns;
- any of the nine slots is absent;
- any profession preset references the wrong slot;
- a dragged garment includes the Nico body;
- one slot edit replaces unrelated slots;
- undo, redo, randomize, or editable presets are removed;
- Guide, Clubhouse, Ask Nico, portals, or Showtime stop using the saved wardrobe;
- recorded Showtime frames use a different Nico compositor.
