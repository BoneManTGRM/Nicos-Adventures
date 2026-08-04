import { useMemo } from "react";
import type { NicoWardrobe, WardrobeSlot } from "../../types";
import { garmentSvgDataUrl, wardrobeSvgDataUrl } from "./wardrobeSvg";
import { resolveWardrobeItem, type WardrobeItem } from "./catalog";
import "./wardrobe.css";

export function NicoLayeredCharacter({
  wardrobe,
  alt,
  compact = false,
  className = "",
  highlightedSlot = null,
}: {
  wardrobe: NicoWardrobe;
  alt: string;
  compact?: boolean;
  className?: string;
  highlightedSlot?: WardrobeSlot | null;
}) {
  const source = useMemo(() => wardrobeSvgDataUrl(wardrobe), [wardrobe]);
  return (
    <figure
      className={`nico-layered-character ${compact ? "nico-layered-character--compact" : ""} ${className}`.trim()}
      data-layered-nico="true"
      data-highlighted-slot={highlightedSlot ?? undefined}
    >
      <img src={source} alt={alt} draggable={false} decoding="async" data-asset-recovery="ignore" />
      {highlightedSlot && <span className={`nico-layered-character__slot nico-layered-character__slot--${highlightedSlot}`} aria-hidden="true" />}
    </figure>
  );
}

export function GarmentThumbnail({ item, className = "" }: { item: WardrobeItem; className?: string }) {
  const source = useMemo(() => garmentSvgDataUrl(item), [item]);
  return <img className={`wardrobe-garment-thumbnail ${className}`.trim()} src={source} alt="" draggable={false} decoding="async" data-asset-recovery="ignore" />;
}

export function EquippedGarmentList({
  wardrobe,
  language,
  onRemove,
}: {
  wardrobe: NicoWardrobe;
  language: "en" | "es-MX";
  onRemove: (slot: WardrobeSlot) => void;
}) {
  const slots: WardrobeSlot[] = ["headwear", "eyewear", "top", "outerwear", "bottoms", "shoes", "backpack", "badge", "prop"];
  const labels: Record<WardrobeSlot, { en: string; "es-MX": string }> = {
    headwear: { en: "Headwear", "es-MX": "Sombrero" },
    eyewear: { en: "Face", "es-MX": "Rostro" },
    top: { en: "Top", "es-MX": "Camisa" },
    outerwear: { en: "Outerwear", "es-MX": "Chaqueta" },
    bottoms: { en: "Bottoms", "es-MX": "Pantalón" },
    shoes: { en: "Shoes", "es-MX": "Zapatos" },
    backpack: { en: "Backpack", "es-MX": "Mochila" },
    badge: { en: "Badge", "es-MX": "Insignia" },
    prop: { en: "Prop", "es-MX": "Accesorio" },
  };
  return (
    <div className="wardrobe-equipped-list" aria-label={language === "es-MX" ? "Prendas equipadas" : "Equipped pieces"}>
      {slots.map((slot) => {
        const equipped = resolveWardrobeItem(wardrobe[slot]);
        return (
          <article key={slot} className={equipped ? "equipped" : "empty"}>
            <span>{labels[slot][language]}</span>
            <strong>{equipped ? equipped.name[language] : (language === "es-MX" ? "Vacío" : "Empty")}</strong>
            {equipped && <button type="button" onClick={() => onRemove(slot)} aria-label={`${language === "es-MX" ? "Quitar" : "Remove"}: ${equipped.name[language]}`}>×</button>}
          </article>
        );
      })}
    </div>
  );
}
