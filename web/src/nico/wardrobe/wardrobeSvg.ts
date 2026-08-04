import type { NicoWardrobe, WardrobeSlot } from "../../types";
import { resolveWardrobeItem, type WardrobeItem } from "./catalog";

export const NICO_WARDROBE_VIEWBOX = "0 0 360 720";

const esc = (value: string): string => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

const dataUrl = (svg: string): string => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

const slotBoxes: Record<WardrobeSlot, string> = {
  headwear: "55 20 250 175",
  eyewear: "85 110 190 100",
  top: "70 215 220 215",
  outerwear: "55 210 250 265",
  bottoms: "80 385 200 225",
  shoes: "65 565 230 110",
  backpack: "35 190 290 300",
  badge: "175 255 95 105",
  prop: "245 235 110 305",
};

const stroke = (item: WardrobeItem) => `stroke="${item.accent}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"`;

function eyewear(item: WardrobeItem): string {
  if (item.variant === "mask") {
    return `<g data-slot="eyewear" data-item="${esc(item.id)}"><path d="M118 157Q180 188 242 157L235 203Q180 226 125 203Z" fill="${item.primary}" ${stroke(item)}/><path d="M118 165 96 154m146 11 22-11" fill="none" ${stroke(item)}/></g>`;
  }
  const radius = item.variant === "goggles" ? 42 : 34;
  return `<g data-slot="eyewear" data-item="${esc(item.id)}"><rect x="99" y="130" width="${radius * 2}" height="${radius * 1.5}" rx="${radius / 2}" fill="${item.secondary}" fill-opacity=".72" ${stroke(item)}/><rect x="193" y="130" width="${radius * 2}" height="${radius * 1.5}" rx="${radius / 2}" fill="${item.secondary}" fill-opacity=".72" ${stroke(item)}/><path d="M${99 + radius * 2} 153h${94 - radius * 2}" fill="none" ${stroke(item)}/><path d="M99 147 78 137m199 10 20-10" fill="none" ${stroke(item)}/></g>`;
}

function headwear(item: WardrobeItem): string {
  const common = `data-slot="headwear" data-item="${esc(item.id)}"`;
  switch (item.variant) {
    case "helmet":
      return `<g ${common}><path d="M82 132Q82 24 180 20q98 4 98 112v62H82Z" fill="${item.primary}" ${stroke(item)}/><path d="M105 78q75-52 150 0v72H105Z" fill="#93c5fd" fill-opacity=".72" ${stroke(item)}/><path d="M92 188h176" ${stroke(item)}/><circle cx="255" cy="170" r="15" fill="${item.accent}"/></g>`;
    case "hardhat":
      return `<g ${common}><path d="M79 135Q91 58 180 54q89 4 101 81Z" fill="${item.primary}" ${stroke(item)}/><path d="M67 137h226v24H67Z" fill="${item.secondary}" ${stroke(item)}/><path d="M180 55v78" ${stroke(item)}/></g>`;
    case "safari":
    case "sun-hat":
    case "straw-hat":
      return `<g ${common}><ellipse cx="180" cy="145" rx="126" ry="30" fill="${item.secondary}" ${stroke(item)}/><path d="M104 135Q105 56 180 52q75 4 76 83Z" fill="${item.primary}" ${stroke(item)}/><path d="M112 112h136" stroke="${item.accent}" stroke-width="13"/></g>`;
    case "fire-helmet":
      return `<g ${common}><path d="M88 140Q91 52 180 47q89 5 92 93Z" fill="${item.primary}" ${stroke(item)}/><path d="M68 140h224l-20 31H88Z" fill="${item.secondary}" ${stroke(item)}/><path d="M155 68h50v48h-50Z" fill="${item.accent}"/><text x="180" y="104" text-anchor="middle" fill="#fff" font-size="25" font-weight="900">23</text></g>`;
    case "chef-hat":
      return `<g ${common}><path d="M104 134V91q0-34 31-34 8-35 45-35t45 35q31 0 31 34v43Z" fill="${item.primary}" ${stroke(item)}/><rect x="105" y="128" width="150" height="39" rx="10" fill="${item.secondary}" ${stroke(item)}/></g>`;
    case "beret":
      return `<g ${common}><path d="M94 130q20-79 112-74 58 4 74 50-54 11-112 49Z" fill="${item.primary}" ${stroke(item)}/><circle cx="192" cy="52" r="10" fill="${item.accent}"/></g>`;
    case "pilot-cap":
    case "police-cap":
      return `<g ${common}><path d="M96 128q13-72 84-76 71 4 84 76Z" fill="${item.primary}" ${stroke(item)}/><path d="M91 126q89-19 178 0l-32 28H123Z" fill="${item.secondary}" ${stroke(item)}/><path d="M165 81h30l15 23-30 18-30-18Z" fill="${item.accent}"/></g>`;
    case "headphones":
      return `<g ${common}><path d="M92 139q0-86 88-90 88 4 88 90" fill="none" stroke="${item.primary}" stroke-width="22"/><rect x="68" y="125" width="48" height="78" rx="22" fill="${item.secondary}" ${stroke(item)}/><rect x="244" y="125" width="48" height="78" rx="22" fill="${item.secondary}" ${stroke(item)}/></g>`;
    case "top-hat":
      return `<g ${common}><path d="M116 135V36h128v99Z" fill="${item.primary}" ${stroke(item)}/><path d="M88 132h184v33H88Z" fill="${item.primary}" ${stroke(item)}/><path d="M118 99h124v22H118Z" fill="${item.secondary}"/><path d="m180 62 9 19 21 3-15 15 4 21-19-10-19 10 4-21-15-15 21-3Z" fill="${item.accent}"/></g>`;
    case "headband":
      return `<g ${common}><path d="M93 112q87-42 174 0v31q-87-31-174 0Z" fill="${item.primary}" ${stroke(item)}/></g>`;
    case "visor":
      return `<g ${common}><path d="M101 108q79-39 158 0v29q-79-28-158 0Z" fill="${item.primary}" ${stroke(item)}/><path d="M174 130q70-5 109 22-50 22-108 10Z" fill="${item.secondary}" ${stroke(item)}/></g>`;
    case "fedora":
      return `<g ${common}><path d="M108 129q12-74 72-75 60 1 72 75Z" fill="${item.primary}" ${stroke(item)}/><path d="M71 131q109-27 218 0-23 32-109 32T71 131Z" fill="${item.secondary}" ${stroke(item)}/><path d="M113 111h134" stroke="${item.accent}" stroke-width="14"/></g>`;
    case "scrub-cap":
      return `<g ${common}><path d="M94 139q2-79 86-83 84 4 86 83Z" fill="${item.primary}" ${stroke(item)}/><path d="M101 131q79 24 158 0" fill="none" stroke="${item.secondary}" stroke-width="12"/></g>`;
    default:
      return `<g ${common}><path d="M97 125q17-68 83-72 66 4 83 72Z" fill="${item.primary}" ${stroke(item)}/><path d="M173 124q74-2 110 30-56 19-113 7Z" fill="${item.secondary}" ${stroke(item)}/></g>`;
  }
}

function top(item: WardrobeItem): string {
  const collar = item.variant === "polo"
    ? `<path d="m151 244 29 34 29-34" fill="${item.secondary}" ${stroke(item)}/><path d="M180 276v72" stroke="${item.accent}" stroke-width="6"/>`
    : item.variant === "scrubs"
      ? `<path d="m141 244 39 47 39-47" fill="${item.secondary}" ${stroke(item)}/>`
      : `<path d="M151 244h58l-10 34h-38Z" fill="${item.secondary}" ${stroke(item)}/>`;
  const stripes = item.variant === "jersey"
    ? `<path d="M124 275h112M124 309h112" stroke="${item.secondary}" stroke-width="12" opacity=".85"/>`
    : item.variant === "work-shirt"
      ? `<rect x="200" y="285" width="34" height="28" rx="5" fill="${item.secondary}" ${stroke(item)}/>`
      : "";
  return `<g data-slot="top" data-item="${esc(item.id)}"><path d="M112 247q68-33 136 0l29 50-32 25-14-24v114H129V298l-14 24-32-25Z" fill="${item.primary}" ${stroke(item)}/>${collar}${stripes}</g>`;
}

function outerwear(item: WardrobeItem): string {
  const common = `data-slot="outerwear" data-item="${esc(item.id)}"`;
  if (item.variant === "cape") {
    return `<g ${common}><path d="M113 242q67-26 134 0l49 211-116 73-116-73Z" fill="${item.primary}" fill-opacity=".88" ${stroke(item)}/><path d="M151 241q29 31 58 0" fill="none" stroke="${item.accent}" stroke-width="12"/></g>`;
  }
  if (item.variant === "overalls") {
    return `<g ${common}><path d="M132 270h96v151h-96Z" fill="${item.primary}" ${stroke(item)}/><path d="M132 277 111 238m117 39 21-39" fill="none" stroke="${item.primary}" stroke-width="20"/><rect x="154" y="310" width="52" height="42" rx="6" fill="${item.secondary}" ${stroke(item)}/></g>`;
  }
  if (item.variant === "apron") {
    return `<g ${common}><path d="M139 270h82l18 164H121Z" fill="${item.primary}" ${stroke(item)}/><path d="M148 268q32-44 64 0" fill="none" stroke="${item.secondary}" stroke-width="12"/><rect x="148" y="351" width="64" height="46" rx="9" fill="${item.secondary}" ${stroke(item)}/></g>`;
  }
  const length = ["coat", "fire-coat", "trench", "spacesuit"].includes(item.variant) ? 455 : 405;
  const open = ["vest", "coat", "blazer", "cardigan", "trench", "jacket"].includes(item.variant);
  const lapels = open ? `<path d="m142 246 38 55-25 36-39-83m102-8-38 55 25 36 39-83" fill="${item.secondary}" ${stroke(item)}/>` : "";
  const reflect = ["safety-vest", "fire-coat"].includes(item.variant)
    ? `<path d="M109 325h142" stroke="${item.secondary}" stroke-width="17"/><path d="M126 249 156 410m78-161-30 161" stroke="${item.secondary}" stroke-width="13"/>`
    : "";
  const shell = item.variant === "spacesuit"
    ? `<rect x="137" y="279" width="86" height="67" rx="12" fill="${item.secondary}" ${stroke(item)}/><circle cx="158" cy="307" r="9" fill="#ef4444"/><circle cx="184" cy="307" r="9" fill="#22c55e"/><circle cx="210" cy="307" r="9" fill="#3b82f6"/>`
    : "";
  return `<g ${common}><path d="M106 246q74-36 148 0l29 61-34 21-17-31 13 ${length - 297}H115l13-${length - 297}-17 31-34-21Z" fill="${item.primary}" fill-opacity=".93" ${stroke(item)}/>${lapels}${reflect}${shell}</g>`;
}

function bottoms(item: WardrobeItem): string {
  if (item.variant === "shorts" || item.variant === "sport-shorts") {
    return `<g data-slot="bottoms" data-item="${esc(item.id)}"><path d="M118 397h124l13 106-62 5-13-70-13 70-62-5Z" fill="${item.primary}" ${stroke(item)}/><path d="M180 401v38" ${stroke(item)}/><path d="M124 424h112" stroke="${item.secondary}" stroke-width="10"/></g>`;
  }
  const pockets = item.variant === "cargo"
    ? `<rect x="111" y="466" width="42" height="45" rx="7" fill="${item.secondary}" ${stroke(item)}/><rect x="207" y="466" width="42" height="45" rx="7" fill="${item.secondary}" ${stroke(item)}/>`
    : "";
  const reflect = item.variant === "fire-pants"
    ? `<path d="M108 532h58m28 0h58" stroke="${item.secondary}" stroke-width="15"/>`
    : "";
  return `<g data-slot="bottoms" data-item="${esc(item.id)}"><path d="M119 397h122l20 195h-63l-18-129-18 129H99Z" fill="${item.primary}" ${stroke(item)}/><path d="M180 399v70" ${stroke(item)}/>${pockets}${reflect}</g>`;
}

function shoes(item: WardrobeItem): string {
  if (item.variant === "sandals") {
    return `<g data-slot="shoes" data-item="${esc(item.id)}"><path d="M78 614q51-16 94 0v35H69q-7-22 9-35Zm110 0q43-16 94 0 16 13 9 35H188Z" fill="${item.primary}" ${stroke(item)}/><path d="m91 615 52 31m127-31-52 31" stroke="${item.secondary}" stroke-width="12"/></g>`;
  }
  const height = item.variant === "moon-boots" || item.variant === "boots" ? 83 : 59;
  const sole = item.variant === "cleats"
    ? `<path d="M76 661h102m9 0h102" stroke="${item.accent}" stroke-width="9" stroke-dasharray="8 12"/>`
    : `<path d="M70 654h106m8 0h106" stroke="${item.secondary}" stroke-width="11"/>`;
  return `<g data-slot="shoes" data-item="${esc(item.id)}"><path d="M91 ${650 - height}h66l18 ${height - 15}q2 20-22 20H71q-13-28 20-48Zm112 0h66q33 20 20 48h-82q-24 0-22-20Z" fill="${item.primary}" ${stroke(item)}/>${sole}</g>`;
}

function backpack(item: WardrobeItem): string {
  const tanks = item.variant === "tank" || item.variant === "life-pack"
    ? `<rect x="75" y="239" width="48" height="160" rx="24" fill="${item.secondary}" ${stroke(item)}/><rect x="237" y="239" width="48" height="160" rx="24" fill="${item.secondary}" ${stroke(item)}/>`
    : "";
  return `<g data-slot="backpack" data-item="${esc(item.id)}"><path d="M70 261q110-74 220 0l-22 190H92Z" fill="${item.primary}" ${stroke(item)}/><path d="M93 292q87-59 174 0" fill="none" stroke="${item.secondary}" stroke-width="18"/>${tanks}<rect x="139" y="338" width="82" height="74" rx="16" fill="${item.secondary}" ${stroke(item)}/></g>`;
}

function badge(item: WardrobeItem): string {
  return `<g data-slot="badge" data-item="${esc(item.id)}"><circle cx="220" cy="305" r="30" fill="${item.primary}" ${stroke(item)}/><circle cx="220" cy="305" r="20" fill="${item.secondary}"/><text x="220" y="315" text-anchor="middle" fill="${item.accent}" font-size="27" font-weight="900">${esc(item.symbol ?? "★")}</text></g>`;
}

function prop(item: WardrobeItem): string {
  return `<g data-slot="prop" data-item="${esc(item.id)}"><path d="M280 278q49 0 49 49v131q0 49-49 49-31 0-40-24l20-18q10 14 20 9 13-6 13-26V338q0-28-22-28Z" fill="${item.primary}" fill-opacity=".22" ${stroke(item)}/><circle cx="289" cy="371" r="48" fill="${item.primary}" ${stroke(item)}/><text x="289" y="389" text-anchor="middle" font-size="49" font-family="Arial, sans-serif">${esc(item.symbol ?? "★")}</text></g>`;
}

function layer(item: WardrobeItem): string {
  switch (item.slot) {
    case "eyewear": return eyewear(item);
    case "headwear": return headwear(item);
    case "top": return top(item);
    case "outerwear": return outerwear(item);
    case "bottoms": return bottoms(item);
    case "shoes": return shoes(item);
    case "backpack": return backpack(item);
    case "badge": return badge(item);
    case "prop": return prop(item);
  }
}

function baseBody(): string {
  return `<g data-nico-body="true">
    <ellipse cx="180" cy="674" rx="120" ry="24" fill="#0f172a" fill-opacity=".22"/>
    <path d="M126 466h46l-10 150h-49Z" fill="#f1a56f" stroke="#7c2d12" stroke-width="7"/><path d="M188 466h46l13 150h-49Z" fill="#f1a56f" stroke="#7c2d12" stroke-width="7"/>
    <path d="M108 268q-43 23-47 116 2 37 33 38 25 0 27-30l10-93Z" fill="#f1a56f" stroke="#7c2d12" stroke-width="7"/><path d="M252 268q43 23 47 116-2 37-33 38-25 0-27-30l-10-93Z" fill="#f1a56f" stroke="#7c2d12" stroke-width="7"/>
    <rect x="150" y="218" width="60" height="52" rx="20" fill="#f1a56f" stroke="#7c2d12" stroke-width="7"/>
    <path d="M112 246q68-34 136 0l18 163H94Z" fill="#f8fafc" stroke="#94a3b8" stroke-width="7"/>
    <path d="M117 397h126l12 102-62 6-13-67-13 67-62-6Z" fill="#d6d3d1" stroke="#78716c" stroke-width="7"/>
    <ellipse cx="180" cy="153" rx="102" ry="113" fill="#f1a56f" stroke="#7c2d12" stroke-width="8"/>
    <ellipse cx="78" cy="162" rx="20" ry="29" fill="#f1a56f" stroke="#7c2d12" stroke-width="7"/><ellipse cx="282" cy="162" rx="20" ry="29" fill="#f1a56f" stroke="#7c2d12" stroke-width="7"/>
    <path d="M86 126q6-94 97-101 94 6 102 101-30-23-57-34-26 31-74 21-24 25-68 13Z" fill="#17120f" stroke="#0c0a09" stroke-width="8"/>
    <path d="M100 93q25-47 78-53m-28 54q36-57 79-46m-25 56q36-43 62-25" fill="none" stroke="#3f2d23" stroke-width="11" stroke-linecap="round"/>
    <path d="M113 132q23-17 47 0m40 0q23-17 47 0" fill="none" stroke="#3f2d23" stroke-width="9" stroke-linecap="round"/>
    <ellipse cx="138" cy="157" rx="13" ry="17" fill="#2b211d"/><ellipse cx="222" cy="157" rx="13" ry="17" fill="#2b211d"/><circle cx="142" cy="152" r="4" fill="#fff"/><circle cx="226" cy="152" r="4" fill="#fff"/>
    <path d="M180 163q-10 20 5 25" fill="none" stroke="#b45309" stroke-width="6" stroke-linecap="round"/>
    <path d="M137 207q43 35 86 0" fill="#fff" stroke="#9a3412" stroke-width="7" stroke-linejoin="round"/>
    <circle cx="105" cy="186" r="15" fill="#fb7185" fill-opacity=".3"/><circle cx="255" cy="186" r="15" fill="#fb7185" fill-opacity=".3"/>
  </g>`;
}

const slotsInPaintOrder: WardrobeSlot[] = ["backpack", "bottoms", "top", "outerwear", "shoes", "headwear", "eyewear", "badge", "prop"];

export function buildNicoWardrobeSvg(wardrobe: NicoWardrobe): string {
  const layers = slotsInPaintOrder.map((slot) => {
    const selected = resolveWardrobeItem(wardrobe[slot]);
    return selected && selected.slot === slot ? layer(selected) : "";
  });
  const backpackLayer = layers[0];
  const foregroundLayers = layers.slice(1).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${NICO_WARDROBE_VIEWBOX}" role="img"><defs><filter id="soft-shadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="12" stdDeviation="10" flood-color="#020617" flood-opacity=".28"/></filter></defs><g filter="url(#soft-shadow)">${backpackLayer}${baseBody()}${foregroundLayers}</g></svg>`;
}

export function wardrobeSvgDataUrl(wardrobe: NicoWardrobe): string {
  return dataUrl(buildNicoWardrobeSvg(wardrobe));
}

export function buildGarmentSvg(item: WardrobeItem): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${slotBoxes[item.slot]}" role="img"><g filter="url(#s)">${layer(item)}</g><defs><filter id="s" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="7" stdDeviation="6" flood-color="#020617" flood-opacity=".28"/></filter></defs></svg>`;
}

export function garmentSvgDataUrl(item: WardrobeItem): string {
  return dataUrl(buildGarmentSvg(item));
}

export function loadNicoWardrobeImage(wardrobe: NicoWardrobe): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The layered Nico wardrobe could not be rendered."));
    image.src = wardrobeSvgDataUrl(wardrobe);
  });
}
