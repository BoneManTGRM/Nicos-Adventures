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
    for (const slot of slots) {
      expect(WARDROBE_ITEMS.some((item) => item.slot === slot), slot).toBe(true);
    }
  });

  it("renders one body plus independent selected garment layers", () => {
    const wardrobe = wardrobeForPreset("chef");
    const svg = buildNicoWardrobeSvg(wardrobe);
    expect(svg.match(/data-nico-body="true"/g)).toHaveLength(1);
    expect(svg).toContain('data-item="chef-hat"');
    expect(svg).toContain('data-item="chef-shirt"');
    expect(svg).toContain('data-item="chef-apron"');
    expect(svg).toContain('data-item="spoon-prop"');
  });

  it("tailors every equipped layer to the fixed body anchors", () => {
    const svg = buildNicoWardrobeSvg(wardrobeForPreset("firefighter"));
    for (const slot of slots) {
      const itemId = wardrobeForPreset("firefighter")[slot];
      if (!itemId) continue;
      expect(svg).toContain(`data-tailored-fit="${slot}"`);
    }
    expect(svg).toContain("scale(.91 .93)");
    expect(svg).toContain("scale(.76)");
  });

  it("does not show neutral underlayers through occupied clothing slots", () => {
    const dressed = buildNicoWardrobeSvg(wardrobeForPreset("explorer"));
    expect(dressed).not.toContain('data-base-shirt="visible"');
    expect(dressed).not.toContain('data-base-shorts="visible"');
    expect(dressed).not.toContain('data-base-shoes="visible"');

    const empty = {
      ...wardrobeForPreset("explorer"),
      top: null,
      outerwear: null,
      bottoms: null,
      shoes: null,
    };
    const neutral = buildNicoWardrobeSvg(empty);
    expect(neutral).toContain('data-base-shirt="visible"');
    expect(neutral).toContain('data-base-shorts="visible"');
    expect(neutral).toContain('data-base-shoes="visible"');
  });

  it("renders a dragged garment without the Nico body", () => {
    const shirt = resolveWardrobeItem("soccer-jersey")!;
    const svg = buildGarmentSvg(shirt);
    expect(svg).toContain('data-item="soccer-jersey"');
    expect(svg).toContain('data-tailored-fit="top"');
    expect(svg).not.toContain("data-nico-body");
  });

  it("uses premium canonical 2D art for a supported profession preset", () => {
    const html = renderToStaticMarkup(
      <NicoLayeredCharacter wardrobe={wardrobeForPreset("astronaut")} alt="Astronaut Nico" />,
    );
    expect(html).toContain('data-layered-nico="true"');
    expect(html).toContain('data-nico-renderer="canonical-2d"');
    expect(html).toContain('data-nico-preset="astronaut"');
    expect(html).toContain('aria-label="Astronaut Nico"');
    expect(html).not.toContain("data:image/svg+xml");
  });

  it("keeps the editable layered SVG renderer for a customized outfit", () => {
    const customized = { ...wardrobeForPreset("astronaut"), presetId: null };
    const html = renderToStaticMarkup(
      <NicoLayeredCharacter wardrobe={customized} alt="Custom Nico" />,
    );
    expect(html).toContain('data-nico-renderer="layered-svg"');
    expect(html).toContain('alt="Custom Nico"');
    expect(html).toContain("data:image/svg+xml");
  });
});

describe("wardrobe editing history", () => {
  it("equips one slot without replacing the other clothes", () => {
    const start = wardrobeForPreset("explorer");
    const history = createWardrobeHistory(start);
    const next = wardrobeReducer(history, { type: "equip", slot: "headwear", itemId: "magician-top-hat" });
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
    const start = createWardrobeHistory(wardrobeForPreset("explorer"));
    const preset = wardrobeReducer(start, { type: "preset", presetId: "firefighter" });
    expect(preset.present.headwear).toBe("firefighter-helmet");
    expect(preset.present.outerwear).toBe("fire-coat");
    const customized = wardrobeReducer(preset, { type: "equip", slot: "headwear", itemId: "chef-hat" });
    expect(customized.present.headwear).toBe("chef-hat");
    expect(customized.present.outerwear).toBe("fire-coat");
    expect(customized.present.presetId).toBeNull();
  });

  it("randomizes valid independent items", () => {
    const start = createWardrobeHistory(wardrobeForPreset("explorer"));
    const randomized = wardrobeReducer(start, { type: "randomize", random: () => .75 });
    for (const slot of slots) {
      const itemId = randomized.present[slot];
      if (!itemId) continue;
      expect(resolveWardrobeItem(itemId)?.slot).toBe(slot);
    }
    expect(randomized.present.presetId).toBeNull();
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
