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
  headwear: "66 24 228 166",
  eyewear: "96 118 168 88",
  top: "78 218 204 205",
  outerwear: "70 214 220 250",
  bottoms: "94 388 172 214",
  shoes: "82 570 196 100",
  backpack: "68 210 224 235",
  badge: "188 272 64 68",
  prop: "246 275 96 220",
};

const stroke = (item: WardrobeItem) => `stroke="${item.accent}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"`;

function fitTransform(item: WardrobeItem): string {
  switch (item.slot) {
    case "headwear":
      return item.variant === "helmet"
        ? "translate(180 112) scale(.94 .96) translate(-180 -112)"
        : "translate(180 125) scale(.91 .93) translate(-180 -125)";
    case "eyewear": return "translate(180 160) scale(.91 .92) translate(-180 -160)";
    case "backpack": return "translate(180 335) scale(.86 .90) translate(-180 -335)";
    case "badge": return "translate(218 306) scale(.76) translate(-218 -306)";
    case "prop": return "translate(283 383) scale(.76) translate(-283 -383)";
    default: return "";
  }
}

function eyewear(item: WardrobeItem): string {
  if (item.variant === "mask") {
    return `<g data-slot="eyewear" data-item="${esc(item.id)}"><path d="M119 158Q180 181 241 158L235 198Q180 219 125 198Z" fill="${item.primary}" ${stroke(item)}/><path d="M119 165 99 155m142 10 20-10" fill="none" ${stroke(item)}/></g>`;
  }
  const width = item.variant === "goggles" ? 72 : 62;
  const height = item.variant === "goggles" ? 50 : 44;
  const leftX = 108;
  const rightX = 190;
  return `<g data-slot="eyewear" data-item="${esc(item.id)}"><rect x="${leftX}" y="132" width="${width}" height="${height}" rx="18" fill="${item.secondary}" fill-opacity=".72" ${stroke(item)}/><rect x="${rightX}" y="132" width="${width}" height="${height}" rx="18" fill="${item.secondary}" fill-opacity=".72" ${stroke(item)}/><path d="M${leftX + width} 153h${rightX - leftX - width}" fill="none" ${stroke(item)}/><path d="M108 147 84 138m168 9 24-9" fill="none" ${stroke(item)}/></g>`;
}

function headwear(item: WardrobeItem): string {
  const common = `data-slot="headwear" data-item="${esc(item.id)}"`;
  switch (item.variant) {
    case "helmet":
      return `<g ${common}><path d="M90 134Q90 32 180 27q90 5 90 107v48H90Z" fill="${item.primary}" ${stroke(item)}/><path d="M111 82q69-43 138 0v64H111Z" fill="#93c5fd" fill-opacity=".72" ${stroke(item)}/><path d="M98 178h164" ${stroke(item)}/><circle cx="250" cy="164" r="13" fill="${item.accent}"/></g>`;
    case "hardhat":
      return `<g ${common}><path d="M91 136Q101 65 180 61q79 4 89 75Z" fill="${item.primary}" ${stroke(item)}/><path d="M80 137h200v22H80Z" fill="${item.secondary}" ${stroke(item)}/><path d="M180 62v72" ${stroke(item)}/></g>`;
    case "safari":
    case "sun-hat":
    case "straw-hat":
      return `<g ${common}><ellipse cx="180" cy="145" rx="108" ry="27" fill="${item.secondary}" ${stroke(item)}/><path d="M111 136Q112 65 180 61q68 4 69 75Z" fill="${item.primary}" ${stroke(item)}/><path d="M119 113h122" stroke="${item.accent}" stroke-width="12"/></g>`;
    case "fire-helmet":
      return `<g ${common}><path d="M96 140Q99 60 180 55q81 5 84 85Z" fill="${item.primary}" ${stroke(item)}/><path d="M81 140h198l-18 28H99Z" fill="${item.secondary}" ${stroke(item)}/><path d="M158 73h44v42h-44Z" fill="${item.accent}"/><text x="180" y="104" text-anchor="middle" fill="#fff" font-size="22" font-weight="900">23</text></g>`;
    case "chef-hat":
      return `<g ${common}><path d="M111 137V96q0-29 27-29 8-30 42-30t42 30q27 0 27 29v41Z" fill="${item.primary}" ${stroke(item)}/><rect x="112" y="130" width="136" height="34" rx="9" fill="${item.secondary}" ${stroke(item)}/></g>`;
    case "beret":
      return `<g ${common}><path d="M104 132q18-69 101-65 52 4 66 44-49 10-101 43Z" fill="${item.primary}" ${stroke(item)}/><circle cx="191" cy="63" r="9" fill="${item.accent}"/></g>`;
    case "pilot-cap":
    case "police-cap":
      return `<g ${common}><path d="M105 130q12-64 75-68 63 4 75 68Z" fill="${item.primary}" ${stroke(item)}/><path d="M101 128q79-17 158 0l-29 25H130Z" fill="${item.secondary}" ${stroke(item)}/><path d="M166 87h28l13 20-27 16-27-16Z" fill="${item.accent}"/></g>`;
    case "headphones":
      return `<g ${common}><path d="M102 140q0-78 78-82 78 4 78 82" fill="none" stroke="${item.primary}" stroke-width="20"/><rect x="82" y="128" width="39" height="67" rx="19" fill="${item.secondary}" ${stroke(item)}/><rect x="239" y="128" width="39" height="67" rx="19" fill="${item.secondary}" ${stroke(item)}/></g>`;
    case "top-hat":
      return `<g ${common}><path d="M123 137V48h114v89Z" fill="${item.primary}" ${stroke(item)}/><path d="M96 134h168v29H96Z" fill="${item.primary}" ${stroke(item)}/><path d="M125 103h110v20H125Z" fill="${item.secondary}"/><path d="m180 72 8 16 18 3-13 12 3 19-16-9-16 9 3-19-13-12 18-3Z" fill="${item.accent}"/></g>`;
    case "headband":
      return `<g ${common}><path d="M104 115q76-35 152 0v27q-76-26-152 0Z" fill="${item.primary}" ${stroke(item)}/></g>`;
    case "visor":
      return `<g ${common}><path d="M108 111q72-34 144 0v26q-72-25-144 0Z" fill="${item.primary}" ${stroke(item)}/><path d="M177 132q62-4 96 19-44 19-95 9Z" fill="${item.secondary}" ${stroke(item)}/></g>`;
    case "fedora":
      return `<g ${common}><path d="M115 131q11-66 65-68 54 2 65 68Z" fill="${item.primary}" ${stroke(item)}/><path d="M83 132q97-23 194 0-21 28-97 28t-97-28Z" fill="${item.secondary}" ${stroke(item)}/><path d="M120 114h120" stroke="${item.accent}" stroke-width="12"/></g>`;
    case "scrub-cap":
      return `<g ${common}><path d="M103 141q2-70 77-74 75 4 77 74Z" fill="${item.primary}" ${stroke(item)}/><path d="M110 134q70 21 140 0" fill="none" stroke="${item.secondary}" stroke-width="11"/></g>`;
    default:
      return `<g ${common}><path d="M105 128q15-61 75-65 60 4 75 65Z" fill="${item.primary}" ${stroke(item)}/><path d="M174 127q65-2 97 27-50 17-99 6Z" fill="${item.secondary}" ${stroke(item)}/></g>`;
  }
}

function top(item: WardrobeItem): string {
  const collar = item.variant === "polo"
    ? `<path d="m150 245 30 35 30-35" fill="${item.secondary}" ${stroke(item)}/><path d="M180 278v67" stroke="${item.accent}" stroke-width="6"/>`
    : item.variant === "scrubs"
      ? `<path d="m143 245 37 44 37-44" fill="${item.secondary}" ${stroke(item)}/>`
      : `<path d="M151 245h58l-10 33h-38Z" fill="${item.secondary}" ${stroke(item)}/>`;
  const detail = item.variant === "jersey"
    ? `<path d="M119 278h122M115 313h130" stroke="${item.secondary}" stroke-width="11" opacity=".86"/>`
    : item.variant === "work-shirt"
      ? `<rect x="203" y="284" width="31" height="26" rx="5" fill="${item.secondary}" ${stroke(item)}/>`
      : "";
  return `<g data-slot="top" data-item="${esc(item.id)}"><path d="M116 246Q180 218 244 246L272 292 246 316 232 294 257 410H103L128 294 114 316 88 292Z" fill="${item.primary}" ${stroke(item)}/>${collar}${detail}</g>`;
}

function outerwear(item: WardrobeItem): string {
  const common = `data-slot="outerwear" data-item="${esc(item.id)}"`;
  if (item.variant === "cape") {
    return `<g ${common}><path d="M119 243q61-24 122 0l43 192-104 66-104-66Z" fill="${item.primary}" fill-opacity=".88" ${stroke(item)}/><path d="M153 242q27 28 54 0" fill="none" stroke="${item.accent}" stroke-width="11"/></g>`;
  }
  if (item.variant === "overalls") {
    return `<g ${common}><path d="M130 274h100v140H130Z" fill="${item.primary}" ${stroke(item)}/><path d="M132 279 116 240m112 39 16-39" fill="none" stroke="${item.primary}" stroke-width="18"/><rect x="154" y="312" width="52" height="40" rx="6" fill="${item.secondary}" ${stroke(item)}/></g>`;
  }
  if (item.variant === "apron") {
    return `<g ${common}><path d="M139 274h82l17 153H122Z" fill="${item.primary}" ${stroke(item)}/><path d="M149 272q31-40 62 0" fill="none" stroke="${item.secondary}" stroke-width="11"/><rect x="150" y="350" width="60" height="42" rx="8" fill="${item.secondary}" ${stroke(item)}/></g>`;
  }
  const isVest = ["vest", "safety-vest", "police-vest"].includes(item.variant);
  const long = ["coat", "fire-coat", "trench", "spacesuit"].includes(item.variant);
  const endY = long ? 452 : 412;
  const shape = isVest
    ? `M121 244Q180 219 239 244L252 ${endY}H108Z`
    : `M111 244Q180 213 249 244L279 300 248 325 233 294 259 ${endY}H101L127 294 112 325 81 300Z`;
  const open = ["vest", "coat", "blazer", "cardigan", "trench", "jacket"].includes(item.variant);
  const lapels = open ? `<path d="m142 247 38 51-24 34-37-78m99-7-38 51 24 34 37-78" fill="${item.secondary}" ${stroke(item)}/>` : "";
  const reflect = ["safety-vest", "fire-coat"].includes(item.variant)
    ? `<path d="M111 326h138" stroke="${item.secondary}" stroke-width="15"/><path d="M128 253 155 406m77-153-27 153" stroke="${item.secondary}" stroke-width="11"/>`
    : "";
  const shell = item.variant === "spacesuit"
    ? `<rect x="139" y="280" width="82" height="62" rx="11" fill="${item.secondary}" ${stroke(item)}/><circle cx="159" cy="307" r="8" fill="#ef4444"/><circle cx="180" cy="307" r="8" fill="#22c55e"/><circle cx="201" cy="307" r="8" fill="#3b82f6"/>`
    : "";
  return `<g ${common}><path d="${shape}" fill="${item.primary}" fill-opacity=".95" ${stroke(item)}/>${lapels}${reflect}${shell}</g>`;
}

function bottoms(item: WardrobeItem): string {
  if (item.variant === "shorts" || item.variant === "sport-shorts") {
    return `<g data-slot="bottoms" data-item="${esc(item.id)}"><path d="M108 397H252L248 503 194 507 180 438 166 507 112 503Z" fill="${item.primary}" ${stroke(item)}/><path d="M180 401v38" ${stroke(item)}/><path d="M116 424h128" stroke="${item.secondary}" stroke-width="9"/></g>`;
  }
  const pockets = item.variant === "cargo"
    ? `<rect x="116" y="463" width="38" height="42" rx="7" fill="${item.secondary}" ${stroke(item)}/><rect x="206" y="463" width="38" height="42" rx="7" fill="${item.secondary}" ${stroke(item)}/>`
    : "";
  const reflect = item.variant === "fire-pants"
    ? `<path d="M116 532h48m32 0h48" stroke="${item.secondary}" stroke-width="13"/>`
    : "";
  return `<g data-slot="bottoms" data-item="${esc(item.id)}"><path d="M108 397H252L248 590H196L180 466 164 590H112Z" fill="${item.primary}" ${stroke(item)}/><path d="M180 401v67" ${stroke(item)}/>${pockets}${reflect}</g>`;
}

function shoes(item: WardrobeItem): string {
  if (item.variant === "sandals") {
    return `<g data-slot="shoes" data-item="${esc(item.id)}"><path d="M96 613q40-13 75 0v34H88q-6-21 8-34Zm93 0q35-13 75 0 14 13 8 34h-83Z" fill="${item.primary}" ${stroke(item)}/><path d="m106 615 43 28m105-28-43 28" stroke="${item.secondary}" stroke-width="10"/></g>`;
  }
  const boots = item.variant === "moon-boots" || item.variant === "boots";
  const startY = boots ? 578 : 600;
  const sole = item.variant === "cleats"
    ? `<path d="M90 657h88m4 0h88" stroke="${item.accent}" stroke-width="8" stroke-dasharray="7 10"/>`
    : `<path d="M88 653h90m4 0h90" stroke="${item.secondary}" stroke-width="9"/>`;
  return `<g data-slot="shoes" data-item="${esc(item.id)}"><path d="M101 ${startY}h56l16 ${650 - startY}q2 17-19 17H88q-10-24 13-40Zm102 0h56q23 16 13 40h-86q-21 0-19-17Z" fill="${item.primary}" ${stroke(item)}/>${sole}</g>`;
}

function backpack(item: WardrobeItem): string {
  const tanks = item.variant === "tank" || item.variant === "life-pack"
    ? `<rect x="91" y="248" width="39" height="143" rx="19" fill="${item.secondary}" ${stroke(item)}/><rect x="230" y="248" width="39" height="143" rx="19" fill="${item.secondary}" ${stroke(item)}/>`
    : "";
  return `<g data-slot="backpack" data-item="${esc(item.id)}"><path d="M88 261q92-55 184 0l-20 168H108Z" fill="${item.primary}" ${stroke(item)}/><path d="M108 292q72-44 144 0" fill="none" stroke="${item.secondary}" stroke-width="15"/>${tanks}<rect x="145" y="337" width="70" height="63" rx="14" fill="${item.secondary}" ${stroke(item)}/></g>`;
}

function badge(item: WardrobeItem): string {
  return `<g data-slot="badge" data-item="${esc(item.id)}"><circle cx="218" cy="306" r="22" fill="${item.primary}" ${stroke(item)}/><circle cx="218" cy="306" r="14" fill="${item.secondary}"/><text x="218" y="313" text-anchor="middle" fill="${item.accent}" font-size="19" font-weight="900">${esc(item.symbol ?? "★")}</text></g>`;
}

function prop(item: WardrobeItem): string {
  return `<g data-slot="prop" data-item="${esc(item.id)}"><path d="M278 292q40 0 40 40v105q0 40-40 40-24 0-31-18l17-15q7 10 15 7 10-5 10-21v-88q0-21-18-21Z" fill="${item.primary}" fill-opacity=".2" ${stroke(item)}/><circle cx="283" cy="383" r="36" fill="${item.primary}" ${stroke(item)}/><text x="283" y="397" text-anchor="middle" font-size="37" font-family="Arial, sans-serif">${esc(item.symbol ?? "★")}</text></g>`;
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

function tailoredLayer(item: WardrobeItem): string {
  const transform = fitTransform(item);
  return `<g data-tailored-fit="${item.slot}"${transform ? ` transform="${transform}"` : ""}>${layer(item)}</g>`;
}

function baseBody(wardrobe: NicoWardrobe): string {
  const neutralTop = wardrobe.top
    ? ""
    : `<g data-base-shirt="visible"><path d="M116 246Q180 218 244 246L259 408H101Z" fill="#f8fafc" stroke="#94a3b8" stroke-width="7"/></g>`;
  const neutralBottoms = wardrobe.bottoms
    ? ""
    : `<g data-base-shorts="visible"><path d="M108 397H252L248 503 194 507 180 438 166 507 112 503Z" fill="#d6d3d1" stroke="#78716c" stroke-width="7"/></g>`;
  const neutralShoes = wardrobe.shoes
    ? ""
    : `<g data-base-shoes="visible"><path d="M98 609q39-12 72 0l8 42H88q-7-25 10-42Zm92 0q33-12 72 0 17 17 10 42h-90Z" fill="#f8fafc" stroke="#64748b" stroke-width="7"/><path d="M88 652h90m4 0h90" stroke="#16a34a" stroke-width="9"/></g>`;
  return `<g data-nico-body="true">
    <ellipse cx="180" cy="674" rx="108" ry="22" fill="#0f172a" fill-opacity=".2"/>
    <path d="M128 447h42l-10 171h-45Z" fill="#f1a56f" stroke="#7c2d12" stroke-width="7"/><path d="M190 447h42l13 171h-45Z" fill="#f1a56f" stroke="#7c2d12" stroke-width="7"/>
    <path d="M113 266q-39 24-43 112 2 35 29 36 22 0 25-29l10-88Z" fill="#f1a56f" stroke="#7c2d12" stroke-width="7"/><path d="M247 266q39 24 43 112-2 35-29 36-22 0-25-29l-10-88Z" fill="#f1a56f" stroke="#7c2d12" stroke-width="7"/>
    <rect x="151" y="218" width="58" height="52" rx="20" fill="#f1a56f" stroke="#7c2d12" stroke-width="7"/>
    <path d="M116 246Q180 218 244 246L259 408H101Z" fill="#f1a56f" stroke="#7c2d12" stroke-width="7"/>
    ${neutralTop}${neutralBottoms}${neutralShoes}
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
    return selected && selected.slot === slot ? tailoredLayer(selected) : "";
  });
  const backpackLayer = layers[0];
  const foregroundLayers = layers.slice(1).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${NICO_WARDROBE_VIEWBOX}" role="img"><defs><filter id="soft-shadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="12" stdDeviation="10" flood-color="#020617" flood-opacity=".28"/></filter></defs><g filter="url(#soft-shadow)">${backpackLayer}${baseBody(wardrobe)}${foregroundLayers}</g></svg>`;
}

export function wardrobeSvgDataUrl(wardrobe: NicoWardrobe): string {
  return dataUrl(buildNicoWardrobeSvg(wardrobe));
}

export function buildGarmentSvg(item: WardrobeItem): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${slotBoxes[item.slot]}" role="img"><g filter="url(#s)">${tailoredLayer(item)}</g><defs><filter id="s" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="7" stdDeviation="6" flood-color="#020617" flood-opacity=".28"/></filter></defs></svg>`;
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
