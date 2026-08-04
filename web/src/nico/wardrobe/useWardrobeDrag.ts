import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { WardrobeItem } from "./catalog";

export type WardrobeDragState = {
  item: WardrobeItem;
  pointerId: number;
  originX: number;
  originY: number;
  x: number;
  y: number;
  moved: boolean;
  overStage: boolean;
};

export function useWardrobeDrag(onDrop: (item: WardrobeItem) => void) {
  const [drag, setDrag] = useState<WardrobeDragState | null>(null);
  const suppressClick = useRef(false);

  const begin = (event: ReactPointerEvent<HTMLButtonElement>, item: WardrobeItem) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    suppressClick.current = false;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic accessibility/browser-test pointer streams may not create a
      // native capture target. Window-level coordinates and hit testing still
      // provide the same deterministic equip behavior.
    }
    setDrag({
      item,
      pointerId: event.pointerId,
      originX: event.clientX,
      originY: event.clientY,
      x: event.clientX,
      y: event.clientY,
      moved: false,
      overStage: false,
    });
  };

  const move = (event: ReactPointerEvent<HTMLButtonElement>) => {
    setDrag((current) => {
      if (!current || current.pointerId !== event.pointerId) return current;
      const moved = current.moved || Math.hypot(event.clientX - current.originX, event.clientY - current.originY) > 8;
      const target = document.elementFromPoint(event.clientX, event.clientY);
      const overStage = Boolean(target?.closest("[data-nico-wardrobe-stage]"));
      return { ...current, x: event.clientX, y: event.clientY, moved, overStage };
    });
  };

  const end = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const current = drag;
    if (!current || current.pointerId !== event.pointerId) return;
    const target = document.elementFromPoint(event.clientX, event.clientY);
    const overStage = Boolean(target?.closest("[data-nico-wardrobe-stage]"));
    if (current.moved) {
      suppressClick.current = true;
      if (overStage) onDrop(current.item);
    }
    setDrag(null);
  };

  const cancel = () => {
    suppressClick.current = Boolean(drag?.moved);
    setDrag(null);
  };

  const consumeSuppressedClick = (): boolean => {
    if (!suppressClick.current) return false;
    suppressClick.current = false;
    return true;
  };

  return { drag, begin, move, end, cancel, consumeSuppressedClick };
}
