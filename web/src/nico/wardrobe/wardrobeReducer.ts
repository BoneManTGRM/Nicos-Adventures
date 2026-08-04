import type { NicoProfessionId, NicoWardrobe, WardrobeSlot } from "../../types";
import { itemsForSlot, wardrobeForPreset } from "./catalog";

export type WardrobeHistory = {
  past: NicoWardrobe[];
  present: NicoWardrobe;
  future: NicoWardrobe[];
};

export type WardrobeAction =
  | { type: "equip"; slot: WardrobeSlot; itemId: string }
  | { type: "remove"; slot: WardrobeSlot }
  | { type: "preset"; presetId: NicoProfessionId; accentColor?: string }
  | { type: "reset"; wardrobe: NicoWardrobe }
  | { type: "randomize"; random?: () => number }
  | { type: "undo" }
  | { type: "redo" };

const LIMIT = 40;

export function createWardrobeHistory(wardrobe: NicoWardrobe): WardrobeHistory {
  return { past: [], present: { ...wardrobe }, future: [] };
}

function commit(history: WardrobeHistory, next: NicoWardrobe): WardrobeHistory {
  if (JSON.stringify(history.present) === JSON.stringify(next)) return history;
  return {
    past: [...history.past, history.present].slice(-LIMIT),
    present: next,
    future: [],
  };
}

export function wardrobeReducer(history: WardrobeHistory, action: WardrobeAction): WardrobeHistory {
  switch (action.type) {
    case "equip":
      return commit(history, {
        ...history.present,
        [action.slot]: action.itemId,
        presetId: null,
      });
    case "remove":
      return commit(history, {
        ...history.present,
        [action.slot]: null,
        presetId: null,
      });
    case "preset":
      return commit(history, wardrobeForPreset(action.presetId, action.accentColor));
    case "reset":
      return commit(history, { ...action.wardrobe });
    case "randomize": {
      const random = action.random ?? Math.random;
      const next: NicoWardrobe = { ...history.present, presetId: null };
      const slots: WardrobeSlot[] = ["headwear", "eyewear", "top", "outerwear", "bottoms", "shoes", "backpack", "badge", "prop"];
      for (const slot of slots) {
        const items = itemsForSlot(slot);
        const allowNone = ["headwear", "outerwear", "backpack", "badge", "prop"].includes(slot);
        const options = allowNone ? [null, ...items.map((item) => item.id)] : items.map((item) => item.id);
        const index = Math.min(options.length - 1, Math.floor(Math.max(0, Math.min(.999999, random())) * options.length));
        next[slot] = options[index] ?? null;
      }
      return commit(history, next);
    }
    case "undo": {
      const previous = history.past.at(-1);
      if (!previous) return history;
      return {
        past: history.past.slice(0, -1),
        present: previous,
        future: [history.present, ...history.future].slice(0, LIMIT),
      };
    }
    case "redo": {
      const next = history.future[0];
      if (!next) return history;
      return {
        past: [...history.past, history.present].slice(-LIMIT),
        present: next,
        future: history.future.slice(1),
      };
    }
  }
}
