import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { NicoLayeredCharacter } from "./NicoLayeredCharacter";
import {
  PROFESSION_WARDROBE_PRESETS,
  WARDROBE_ITEMS,
  resolveWardrobeItem,
  wardrobeForPreset,
} from "./catalog";
import { wardrobeForDisplay } from "./wardrobeCompatibility";
import { buildGarmentSvg, buildNicoWardrobeSvg } from "./wardrobeSvg";
import {
  PHOTO_NICO_VIEWBOX,
  buildPhotoWardrobeBackgroundSvg,
  buildPhotoWardrobeForegroundSvg,
} from "./photoWardrobeSvg";
import { createWardrobeHistory, wardrobeReducer } from "./wardrobeReducer";

const slots = ["headwear", "eyewear", "top", "outerwear", "bottoms", "shoes", "backpack", "badge", "prop"] as const;

describe("true Nico wardrobe catalog", () => {
  it("defines a valid independent piece for every occupied preset slot", () => {
    for (const [presetId, wardrobe] of Object.entries(PROFESSION_WARDROBE_PRESETS)) {
      expect(wardrobe.presetId).toBe(presetId);
      for (const slot of slots) {
        const itemId = wardrobe[slot];
        if (!itemId) continue;
        const item = resolveWardrobeItem(itemId);
        expect(item, `${presetId}:${slot}`).toBeDefined();
        expect(item?.slot).toBe(slot);
      }
    }
  });

  it("has garment choices in every supported slot", () => {
    for (const slot of slots) expect(WARDROBE_ITEMS.some((item) => item.slot === slot), slot).toBe(true);
  });

  it("renders one vector fallback body plus independent selected garment layers", () => {
    const wardrobe = wardrobeForPreset("chef");
    const svg = buildNicoWardrobeSvg(wardrobe);
    expect(svg.match(/data-nico-body="true"/g)).toHaveLength(1);
    expect(svg).toContain('data-item="chef-hat"');
    expect(svg).toContain('data-item="chef-shirt"');
    expect(svg).toContain('data-item="chef-apron"');
    expect(svg).toContain('data-item="spoon-prop"');
  });

  it("tailors every fallback layer to the fixed vector anchors", () => {
    const svg = buildNicoWardrobeSvg(wardrobeForPreset("firefighter"));
    for (const slot of slots) {
      const itemId = wardrobeForPreset("firefighter")[slot];
      if (itemId) expect(svg).toContain(`data-tailored-fit="${slot}"`);
    }
  });

  it("does not show neutral vector underlayers through occupied clothing slots", () => {
    const dressed = buildNicoWardrobeSvg(wardrobeForPreset("explorer"));
    expect(dressed).not.toContain('data-base-shirt="visible"');
    expect(dressed).not.toContain('data-base-shorts="visible"');
    expect(dressed).not.toContain('data-base-shoes="visible"');
  });

  it("renders a dragged garment without the Nico body", () => {
    const shirt = resolveWardrobeItem("soccer-jersey")!;
    const svg = buildGarmentSvg(shirt);
    expect(svg).toContain('data-item="soccer-jersey"');
    expect(svg).toContain('data-tailored-fit="top"');
    expect(svg).not.toContain("data-nico-body");
  });
});

describe("supplied Nico photo body", () => {
  it("uses a dedicated 510 by 1467 coordinate system for the supplied image", () => {
    expect(PHOTO_NICO_VIEWBOX).toBe("0 0 510 1467");
    const foreground = buildPhotoWardrobeForegroundSvg(wardrobeForPreset("doctor"));
    expect(foreground).toContain('viewBox="0 0 510 1467"');
    for (const slot of ["headwear", "top", "outerwear", "bottoms", "shoes"]) {
      expect(foreground).toContain(`data-photo-fit="${slot}"`);
    }
  });

  it("does not redraw clothing that already exists on the supplied base image", () => {
    const foreground = buildPhotoWardrobeForegroundSvg(wardrobeForPreset("explorer"));
    expect(foreground).not.toContain('data-item="nico-red-glasses"');
    expect(foreground).not.toContain('data-item="nico-green-polo"');
    expect(foreground).not.toContain('data-item="nico-khaki-shorts"');
    expect(foreground).not.toContain('data-item="nico-green-sneakers"');
  });

  it("keeps backpacks behind the supplied body and all other clothing in front", () => {
    const astronaut = wardrobeForPreset("astronaut");
    expect(buildPhotoWardrobeBackgroundSvg(astronaut)).toContain('data-item="life-support-pack"');
    expect(buildPhotoWardrobeForegroundSvg(astronaut)).not.toContain('data-item="life-support-pack"');
  });

  it("renders the supplied image between transparent clothing layers", () => {
    const html = renderToStaticMarkup(
      <NicoLayeredCharacter wardrobe={wardrobeForPreset("tennis-player")} alt="Tennis Nico" photoBodySource="data:image/webp;base64,photo-body" />,
    );
    expect(html).toContain('data-photo-nico-body="true"');
    expect(html).toContain("nico-photo-layer--back");
    expect(html).toContain("nico-photo-layer--body");
    expect(html).toContain("nico-photo-layer--front");
    expect(html).toContain('alt="Tennis Nico"');
  });

  it("retains the vector renderer as a local offline fallback", () => {
    const html = renderToStaticMarkup(<NicoLayeredCharacter wardrobe={wardrobeForPreset("astronaut")} alt="Astronaut Nico" />);
    expect(html).toContain('data-layered-nico="true"');
    expect(html).toContain("nico-vector-fallback");
    expect(html).toContain("data:image/svg+xml");
  });
});

describe("wardrobe editing history", () => {
  it("equips one slot without replacing the other clothes", () => {
    const start = wardrobeForPreset("explorer");
    const next = wardrobeReducer(createWardrobeHistory(start), { type: "equip", slot: "headwear", itemId: "magician-top-hat" });
    expect(next.present.headwear).toBe("magician-top-hat");
    expect(next.present.top).toBe(start.top);
    expect(next.present.bottoms).toBe(start.bottoms);
    expect(next.present.shoes).toBe(start.shoes);
    expect(next.present.presetId).toBeNull();
  });

  it("supports remove, undo, and redo", () => {
    const start = createWardrobeHistory(wardrobeForPreset("doctor"));
    const removed = wardrobeReducer(start, { type: "remove", slot: "outerwear" });
    expect(removed.present.outerwear).toBeNull();
    const undone = wardrobeReducer(removed, { type: "undo" });
    expect(undone.present.outerwear).toBe("lab-coat");
    const redone = wardrobeReducer(undone, { type: "redo" });
    expect(redone.present.outerwear).toBeNull();
  });

  it("applies a preset and remains editable piece by piece", () => {
    const preset = wardrobeReducer(createWardrobeHistory(wardrobeForPreset("explorer")), { type: "preset", presetId: "firefighter" });
    const customized = wardrobeReducer(preset, { type: "equip", slot: "headwear", itemId: "chef-hat" });
    expect(customized.present.headwear).toBe("chef-hat");
    expect(customized.present.outerwear).toBe("fire-coat");
    expect(customized.present.presetId).toBeNull();
  });
});

describe("legacy wardrobe compatibility", () => {
  it("expands a profession-only migrated wardrobe into the complete preset", () => {
    const legacy = {
      presetId: "doctor" as const,
      headwear: null,
      eyewear: "nico-red-glasses",
      top: "nico-green-polo",
      outerwear: null,
      bottoms: "nico-khaki-shorts",
      shoes: "nico-green-sneakers",
      backpack: null,
      badge: "nico-world-leaf",
      prop: null,
      accentColor: "#0d9488",
    };
    const resolved = wardrobeForDisplay(legacy, "doctor");
    expect(resolved.headwear).toBe("scrub-cap");
    expect(resolved.outerwear).toBe("lab-coat");
    expect(resolved.prop).toBe("stethoscope-prop");
  });
});
