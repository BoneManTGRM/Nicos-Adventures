import type { NicoWardrobe, WardrobeSlot } from "../../types";
import { resolveWardrobeItem, type WardrobeItem } from "./catalog";
import { PHOTO_NICO_HEIGHT, PHOTO_NICO_WIDTH, loadImageSource } from "./photoNicoBody";

export const PHOTO_NICO_VIEWBOX = `0 0 ${PHOTO_NICO_WIDTH} ${PHOTO_NICO_HEIGHT}`;

const PHOTO_BASE_ITEMS: Partial<Record<WardrobeSlot, string>> = {
  eyewear: "nico-red-glasses",
  top: "nico-green-polo",
  bottoms: "nico-khaki-shorts",
  shoes: "nico-green-sneakers",
  badge: "nico-world-leaf",
};

const esc = (value: string): string => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

const dataUrl = (svg: string): string => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
const outline = 'stroke="#1f2937" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"';

function gradient(item: WardrobeItem, id: string): string {
  return `<linearGradient id="${id}" x1="0" y1="0" x2="0.9" y2="1"><stop stop-color="${item.secondary}"/><stop offset=".42" stop-color="${item.primary}"/><stop offset="1" stop-color="${item.primary}" stop-opacity=".84"/></linearGradient>`;
}

function wrap(item: WardrobeItem, body: string): string {
  const id = `g-${item.id.replace(/[^a-z0-9-]/gi, "-")}`;
  return `<g data-photo-fit="${item.slot}" data-slot="${item.slot}" data-item="${esc(item.id)}"><defs>${gradient(item, id)}</defs>${body.replaceAll("__FILL__", `url(#${id})`)}</g>`;
}

function headwear(item: WardrobeItem): string {
  switch (item.variant) {
    case "helmet":
      return wrap(item, `<path d="M92 218Q96 42 255 22q159 20 163 196v88H92Z" fill="__FILL__" ${outline}/><path d="M128 111q127-79 254 0v116H128Z" fill="#bae6fd" fill-opacity=".74" ${outline}/><path d="M111 292h288" ${outline}/>`);
    case "hardhat":
      return wrap(item, `<path d="M116 226Q131 91 255 80q124 11 139 146Z" fill="__FILL__" ${outline}/><path d="M91 222h328v42H91Z" fill="${item.secondary}" ${outline}/><path d="M255 84v132" ${outline}/>`);
    case "safari":
    case "sun-hat":
    case "straw-hat":
      return wrap(item, `<ellipse cx="255" cy="235" rx="198" ry="45" fill="${item.secondary}" ${outline}/><path d="M143 222Q145 93 255 79q110 14 112 143Z" fill="__FILL__" ${outline}/><path d="M157 180h196" stroke="${item.accent}" stroke-width="18"/>`);
    case "fire-helmet":
      return wrap(item, `<path d="M125 231Q130 82 255 67q125 15 130 164Z" fill="__FILL__" ${outline}/><path d="M92 228h326l-29 51H121Z" fill="${item.secondary}" ${outline}/><path d="M220 102h70v72h-70Z" fill="${item.accent}"/><text x="255" y="154" text-anchor="middle" fill="#fff" font-size="38" font-weight="900">23</text>`);
    case "chef-hat":
      return wrap(item, `<path d="M150 228V139q0-57 48-57 12-58 57-58t57 58q48 0 48 57v89Z" fill="__FILL__" ${outline}/><rect x="150" y="216" width="210" height="57" rx="14" fill="${item.secondary}" ${outline}/>`);
    case "beret":
      return wrap(item, `<path d="M134 220q33-130 187-120 95 6 119 79-92 20-188 76Z" fill="__FILL__" ${outline}/><circle cx="275" cy="91" r="15" fill="${item.accent}"/>`);
    case "pilot-cap":
    case "police-cap":
      return wrap(item, `<path d="M150 219q23-116 105-124 82 8 105 124Z" fill="__FILL__" ${outline}/><path d="M143 215q112-30 224 0l-49 49H192Z" fill="${item.secondary}" ${outline}/><path d="M230 132h50l23 36-48 30-48-30Z" fill="${item.accent}"/>`);
    case "headphones":
      return wrap(item, `<path d="M133 235q0-137 122-146 122 9 122 146" fill="none" stroke="${item.primary}" stroke-width="31"/><rect x="102" y="214" width="57" height="108" rx="27" fill="${item.secondary}" ${outline}/><rect x="351" y="214" width="57" height="108" rx="27" fill="${item.secondary}" ${outline}/>`);
    case "top-hat":
      return wrap(item, `<path d="M170 225V45h170v180Z" fill="__FILL__" ${outline}/><path d="M125 218h260v53H125Z" fill="${item.primary}" ${outline}/><path d="M173 157h164v30H173Z" fill="${item.secondary}"/><text x="255" y="133" text-anchor="middle" font-size="52">★</text>`);
    case "headband":
      return wrap(item, `<path d="M129 171q126-67 252 0v46q-126-51-252 0Z" fill="__FILL__" ${outline}/>`);
    case "visor":
      return wrap(item, `<path d="M145 164q110-59 220 0v43q-110-43-220 0Z" fill="__FILL__" ${outline}/><path d="M246 201q115-8 172 40-82 38-177 20Z" fill="${item.secondary}" ${outline}/>`);
    case "fedora":
      return wrap(item, `<path d="M154 219q20-122 101-126 81 4 101 126Z" fill="__FILL__" ${outline}/><path d="M111 219q144-44 288 0-39 55-144 55t-144-55Z" fill="${item.secondary}" ${outline}/><path d="M162 187h186" stroke="${item.accent}" stroke-width="19"/>`);
    case "scrub-cap":
      return wrap(item, `<path d="M137 230q4-127 118-135 114 8 118 135Z" fill="__FILL__" ${outline}/><path d="M151 215q104 38 208 0" fill="none" stroke="${item.secondary}" stroke-width="17"/>`);
    default:
      return wrap(item, `<path d="M143 205q31-106 112-113 81 7 112 113Z" fill="__FILL__" ${outline}/><path d="M245 204q119-4 174 48-87 34-181 14Z" fill="${item.secondary}" ${outline}/>`);
  }
}

function eyewear(item: WardrobeItem): string {
  if (PHOTO_BASE_ITEMS.eyewear === item.id) return "";
  if (item.variant === "mask") {
    return wrap(item, `<path d="M158 284Q255 329 352 284L342 357Q255 397 168 357Z" fill="__FILL__" ${outline}/><path d="M159 296 118 277m233 19 41-19" fill="none" ${outline}/>`);
  }
  const width = item.variant === "goggles" ? 120 : 104;
  const height = item.variant === "goggles" ? 82 : 72;
  const left = 142;
  const right = 271;
  return wrap(item, `<rect x="${left}" y="228" width="${width}" height="${height}" rx="29" fill="${item.secondary}" fill-opacity=".86" ${outline}/><rect x="${right}" y="228" width="${width}" height="${height}" rx="29" fill="${item.secondary}" fill-opacity=".86" ${outline}/><path d="M${left + width} 267h${right - left - width}" fill="none" ${outline}/><path d="M142 250 103 231m372 19-39-19" fill="none" ${outline}/>`);
}

function top(item: WardrobeItem): string {
  if (PHOTO_BASE_ITEMS.top === item.id) return "";
  const collar = item.variant === "polo"
    ? `<path d="m211 421 44 57 44-57" fill="${item.secondary}" ${outline}/><path d="M255 474v105" stroke="${item.accent}" stroke-width="8"/>`
    : item.variant === "scrubs"
      ? `<path d="m196 421 59 69 59-69" fill="${item.secondary}" ${outline}/>`
      : `<path d="M213 417h84l-15 52h-54Z" fill="${item.secondary}" ${outline}/>`;
  const details = item.variant === "jersey"
    ? `<path d="M157 512h196M157 565h196" stroke="${item.secondary}" stroke-width="17" opacity=".9"/>`
    : item.variant === "work-shirt"
      ? `<rect x="307" y="493" width="52" height="44" rx="8" fill="${item.secondary}" ${outline}/>`
      : "";
  return wrap(item, `<path d="M146 423q109-61 218 0l57 75-45 43-26-42v265H160V499l-26 42-45-43Z" fill="__FILL__" ${outline}/>${collar}${details}<path d="M167 718q88 25 176 0" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="9"/>`);
}

function outerwear(item: WardrobeItem): string {
  if (item.variant === "cape") {
    return wrap(item, `<path d="M157 411q98-47 196 0l75 401-173 122L82 812Z" fill="__FILL__" fill-opacity=".94" ${outline}/><path d="M211 413q44 49 88 0" fill="none" stroke="${item.accent}" stroke-width="18"/>`);
  }
  if (item.variant === "overalls") {
    return wrap(item, `<path d="M184 483h142v301H184Z" fill="__FILL__" ${outline}/><path d="M186 501 145 420m179 81 41-81" fill="none" stroke="${item.primary}" stroke-width="30"/><rect x="216" y="569" width="78" height="65" rx="10" fill="${item.secondary}" ${outline}/>`);
  }
  if (item.variant === "apron") {
    return wrap(item, `<path d="M191 478h128l31 322H160Z" fill="__FILL__" ${outline}/><path d="M204 478q51-83 102 0" fill="none" stroke="${item.secondary}" stroke-width="18"/><rect x="207" y="647" width="96" height="70" rx="13" fill="${item.secondary}" ${outline}/>`);
  }
  const long = ["coat", "fire-coat", "trench", "spacesuit"].includes(item.variant);
  const hem = long ? 840 : 735;
  const open = ["vest", "coat", "blazer", "cardigan", "trench", "jacket"].includes(item.variant);
  const lapels = open ? `<path d="m200 418 55 85-37 55-61-129m153-11-55 85 37 55 61-129" fill="${item.secondary}" ${outline}/>` : "";
  const reflect = ["safety-vest", "fire-coat"].includes(item.variant)
    ? `<path d="M151 563h208" stroke="${item.secondary}" stroke-width="23"/><path d="M178 438 222 734m110-296-44 296" stroke="${item.secondary}" stroke-width="18"/>`
    : "";
  const panel = item.variant === "spacesuit"
    ? `<rect x="194" y="498" width="122" height="94" rx="17" fill="${item.secondary}" ${outline}/><circle cx="224" cy="540" r="12" fill="#ef4444"/><circle cx="255" cy="540" r="12" fill="#22c55e"/><circle cx="286" cy="540" r="12" fill="#3b82f6"/>`
    : "";
  return wrap(item, `<path d="M141 421q114-66 228 0l59 95-49 45-29-54 22 ${hem - 507}H138l22-${hem - 507}-29 54-49-45Z" fill="__FILL__" fill-opacity=".96" ${outline}/>${lapels}${reflect}${panel}`);
}

function bottoms(item: WardrobeItem): string {
  if (PHOTO_BASE_ITEMS.bottoms === item.id) return "";
  if (item.variant === "shorts" || item.variant === "sport-shorts") {
    return wrap(item, `<path d="M151 742h208l19 265-102 10-21-175-21 175-102-10Z" fill="__FILL__" ${outline}/><path d="M255 748v104" ${outline}/><path d="M161 786h188" stroke="${item.secondary}" stroke-width="15"/>`);
  }
  const pockets = item.variant === "cargo"
    ? `<rect x="143" y="925" width="68" height="76" rx="11" fill="${item.secondary}" ${outline}/><rect x="299" y="925" width="68" height="76" rx="11" fill="${item.secondary}" ${outline}/>`
    : "";
  const reflect = item.variant === "fire-pants"
    ? `<path d="M138 1128h94m46 0h94" stroke="${item.secondary}" stroke-width="22"/>`
    : "";
  return wrap(item, `<path d="M151 742h208l27 545h-104l-27-386-27 386H124Z" fill="__FILL__" ${outline}/><path d="M255 748v166" ${outline}/>${pockets}${reflect}`);
}

function shoes(item: WardrobeItem): string {
  if (PHOTO_BASE_ITEMS.shoes === item.id) return "";
  if (item.variant === "sandals") {
    return wrap(item, `<path d="M44 1319q102-31 187 2v86H28q-13-55 16-88Zm235 2q85-33 187-2 29 33 16 88H279Z" fill="__FILL__" ${outline}/><path d="m67 1323 115 76m261-76-115 76" stroke="${item.secondary}" stroke-width="20"/>`);
  }
  const tall = item.variant === "moon-boots" || item.variant === "boots";
  const y = tall ? 1265 : 1310;
  const cleats = item.variant === "cleats" ? 'stroke-dasharray="12 14"' : "";
  return wrap(item, `<path d="M53 ${y}h128l52 90q7 43-42 43H25q-25-58 28-96Zm276 0h128q53 38 28 96H319q-49 0-42-43Z" fill="__FILL__" ${outline}/><path d="M27 1435h207m42 0h207" stroke="${item.secondary}" stroke-width="17" ${cleats}/>`);
}

function backpack(item: WardrobeItem): string {
  const tanks = item.variant === "tank" || item.variant === "life-pack"
    ? `<rect x="100" y="461" width="71" height="300" rx="35" fill="${item.secondary}" ${outline}/><rect x="339" y="461" width="71" height="300" rx="35" fill="${item.secondary}" ${outline}/>`
    : "";
  return wrap(item, `<path d="M78 487q177-132 354 0l-38 385H116Z" fill="__FILL__" ${outline}/><path d="M116 541q139-104 278 0" fill="none" stroke="${item.secondary}" stroke-width="26"/>${tanks}<rect x="190" y="668" width="130" height="130" rx="24" fill="${item.secondary}" ${outline}/>`);
}

function badge(item: WardrobeItem): string {
  if (PHOTO_BASE_ITEMS.badge === item.id) return "";
  return wrap(item, `<circle cx="352" cy="543" r="42" fill="__FILL__" ${outline}/><circle cx="352" cy="543" r="29" fill="${item.secondary}"/><text x="352" y="558" text-anchor="middle" fill="${item.accent}" font-size="42" font-weight="900">${esc(item.symbol ?? "★")}</text>`);
}

function prop(item: WardrobeItem): string {
  return wrap(item, `<path d="M401 583q78 0 78 78v226q0 78-78 78-45 0-61-36l31-28q14 23 30 14 20-10 20-43V679q0-43-35-43Z" fill="${item.primary}" fill-opacity=".26" ${outline}/><circle cx="414" cy="735" r="72" fill="__FILL__" ${outline}/><text x="414" y="760" text-anchor="middle" font-size="72" font-family="Arial, sans-serif">${esc(item.symbol ?? "★")}</text>`);
}

function layer(item: WardrobeItem): string {
  switch (item.slot) {
    case "headwear": return headwear(item);
    case "eyewear": return eyewear(item);
    case "top": return top(item);
    case "outerwear": return outerwear(item);
    case "bottoms": return bottoms(item);
    case "shoes": return shoes(item);
    case "backpack": return backpack(item);
    case "badge": return badge(item);
    case "prop": return prop(item);
  }
}

function svgDocument(layers: string, label: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${PHOTO_NICO_VIEWBOX}" role="img" aria-label="${esc(label)}"><defs><filter id="photo-clothes-shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#020617" flood-opacity=".28"/></filter></defs><g filter="url(#photo-clothes-shadow)">${layers}</g></svg>`;
}

export function buildPhotoWardrobeBackgroundSvg(wardrobe: NicoWardrobe): string {
  const item = resolveWardrobeItem(wardrobe.backpack);
  return svgDocument(item?.slot === "backpack" ? layer(item) : "", "Nico backpack layer");
}

export function buildPhotoWardrobeForegroundSvg(wardrobe: NicoWardrobe): string {
  const slots: WardrobeSlot[] = ["bottoms", "top", "outerwear", "shoes", "headwear", "eyewear", "badge", "prop"];
  const layers = slots.map((slot) => {
    const item = resolveWardrobeItem(wardrobe[slot]);
    return item?.slot === slot ? layer(item) : "";
  }).join("");
  return svgDocument(layers, "Nico clothing layer");
}

export function photoWardrobeBackgroundDataUrl(wardrobe: NicoWardrobe): string {
  return dataUrl(buildPhotoWardrobeBackgroundSvg(wardrobe));
}

export function photoWardrobeForegroundDataUrl(wardrobe: NicoWardrobe): string {
  return dataUrl(buildPhotoWardrobeForegroundSvg(wardrobe));
}

export function loadPhotoWardrobeLayerImage(source: string): Promise<HTMLImageElement> {
  return loadImageSource(source);
}
