import type { ReactNode } from "react";
import type { MonsterRecord } from "../types";
import {
  monsterAccessoryTransform,
  type MonsterAccessoryLayout,
  type PremiumMonsterBody,
} from "./monsterArt";

export const MONSTER_FACE_TREATMENTS = {
  Blob: "blob-mischief",
  Dragon: "sculpted-dragon",
  "Jungle Beast": "feral-guardian",
  "Stone Golem": "carved-golem",
  Spirit: "mystic-spirit",
  Cosmic: "cosmic-mask",
  Aquatic: "aqua-creature",
  Candy: "candy-smile",
  Mecha: "mecha-visor",
  Royal: "royal-crest",
  Volcano: "molten-beast",
  "Ice Beast": "frost-beast",
  Alien: "integrated-visor",
  "Lizard Alien": "integrated-lizard",
  Dinosaur: "dino-predator",
  Cloud: "cloud-dreamer",
} as const satisfies Record<PremiumMonsterBody, string>;

export type MonsterFaceTreatment = typeof MONSTER_FACE_TREATMENTS[PremiumMonsterBody];

export const PREMIUM_MONSTER_FACE_BODIES = Object.freeze(
  Object.keys(MONSTER_FACE_TREATMENTS) as PremiumMonsterBody[],
);

export function monsterFaceTreatment(body: string): MonsterFaceTreatment {
  return MONSTER_FACE_TREATMENTS[body as PremiumMonsterBody] ?? MONSTER_FACE_TREATMENTS.Blob;
}

export function monsterHasIntegratedFace(body: string): boolean {
  return monsterFaceTreatment(body) === "integrated-lizard";
}

type MonsterFaceArtProps = Readonly<{
  body: MonsterRecord["body"] | string;
  monsterId: string;
  color: string;
  layout: MonsterAccessoryLayout;
}>;

type FaceRenderContext = Readonly<{
  color: string;
  eyeFill: string;
  coreFill: string;
  glow: string;
}>;

function faceEyes(treatment: MonsterFaceTreatment, { color, eyeFill, glow }: FaceRenderContext): ReactNode {
  switch (treatment) {
    case "blob-mischief":
      return <g className="monster-eye monster-eye--blob" filter={glow}>
        <ellipse cx="222" cy="234" rx="23" ry="27" fill="#07131f" stroke="#dff7fb" strokeOpacity=".46" strokeWidth="4" />
        <ellipse cx="298" cy="230" rx="28" ry="31" fill="#07131f" stroke={color} strokeWidth="5" />
        <ellipse cx="224" cy="238" rx="9" ry="14" fill={eyeFill} />
        <ellipse cx="299" cy="234" rx="11" ry="17" fill={eyeFill} />
        <circle cx="219" cy="230" r="4" fill="#fff" />
        <circle cx="294" cy="224" r="5" fill="#fff" />
        <path d="M197 208Q219 195 244 207M277 204Q302 187 326 201" fill="none" stroke="#102f3c" strokeWidth="8" strokeLinecap="round" />
      </g>;
    case "sculpted-dragon":
      return <g className="monster-eye monster-eye--dragon" filter={glow}>
        <path d="M191 218Q221 190 253 211L241 249Q213 252 194 235Z" fill="#07131b" stroke={color} strokeWidth="5" strokeLinejoin="round" />
        <path d="M329 218Q299 190 267 211L279 249Q307 252 326 235Z" fill="#07131b" stroke={color} strokeWidth="5" strokeLinejoin="round" />
        <path d="M217 219L235 242M303 219L285 242" stroke="#e6fbff" strokeWidth="8" strokeLinecap="round" />
        <path d="M190 207L248 193M330 207L272 193" stroke="#102f3c" strokeWidth="11" strokeLinecap="round" />
      </g>;
    case "feral-guardian":
      return <g className="monster-eye monster-eye--feral" filter={glow}>
        <path d="M194 218Q222 197 251 214L239 248Q213 248 197 234Z" fill="#07131b" stroke={color} strokeWidth="5" />
        <path d="M326 218Q298 197 269 214L281 248Q307 248 323 234Z" fill="#07131b" stroke={color} strokeWidth="5" />
        <path d="M222 219L233 241M298 219L287 241" stroke="#e6fbff" strokeWidth="7" strokeLinecap="round" />
        <path d="M194 208L248 197M326 208L272 197" stroke="#102f3c" strokeWidth="9" strokeLinecap="round" />
        <path d="M181 236L198 230M339 236L322 230" stroke="#86efac" strokeWidth="5" strokeLinecap="round" />
      </g>;
    case "carved-golem":
      return <g className="monster-eye monster-eye--carved" filter={glow}>
        <path d="M192 221Q221 193 253 211L241 246Q215 252 194 234Z" fill="#07131b" stroke="#173947" strokeWidth="7" strokeLinejoin="round" />
        <path d="M328 221Q299 193 267 211L279 246Q305 252 326 234Z" fill="#07131b" stroke="#173947" strokeWidth="7" strokeLinejoin="round" />
        <path d="M211 226L239 219 231 239 215 241Z" fill={eyeFill} />
        <path d="M309 226L281 219 289 239 305 241Z" fill={eyeFill} />
        <path d="M194 213L250 195M326 213L270 195" fill="none" stroke="#0a2530" strokeWidth="11" strokeLinecap="round" />
        <path d="M260 187L247 203 260 216 273 203Z" fill="none" stroke={color} strokeOpacity=".72" strokeWidth="5" />
      </g>;
    case "mystic-spirit":
      return <g className="monster-eye monster-eye--spirit" filter={glow}>
        <path d="M193 228Q222 195 252 226Q222 256 193 228Z" fill="#07131f" stroke="#d8b4fe" strokeWidth="5" />
        <path d="M327 228Q298 195 268 226Q298 256 327 228Z" fill="#07131f" stroke="#d8b4fe" strokeWidth="5" />
        <circle cx="224" cy="228" r="10" fill={eyeFill} />
        <circle cx="296" cy="228" r="10" fill={eyeFill} />
        <path d="M260 181Q235 201 260 218Q285 201 260 181Z" fill="none" stroke="#f5d0fe" strokeWidth="5" />
        <path d="M180 255Q196 240 206 251M340 255Q324 240 314 251" fill="none" stroke={color} strokeOpacity=".7" strokeWidth="5" strokeLinecap="round" />
      </g>;
    case "cosmic-mask":
      return <g className="monster-eye monster-eye--cosmic" filter={glow}>
        <path d="M184 215Q260 174 336 215L318 263Q260 285 202 263Z" fill="#050816" stroke="#c4b5fd" strokeWidth="6" strokeLinejoin="round" />
        <path d="M209 226L226 210 244 226 226 247Z" fill={eyeFill} />
        <path d="M276 226L294 210 311 226 294 247Z" fill={eyeFill} />
        <path d="M260 190L267 204 282 206 271 217 274 232 260 225 246 232 249 217 238 206 253 204Z" fill="#fef3c7" stroke={color} strokeWidth="3" />
        <circle cx="203" cy="203" r="4" fill="#fff" /><circle cx="318" cy="196" r="3" fill="#bae6fd" /><circle cx="331" cy="248" r="3" fill="#e9d5ff" />
      </g>;
    case "aqua-creature":
      return <g className="monster-eye monster-eye--aqua" filter={glow}>
        <ellipse cx="218" cy="228" rx="31" ry="23" fill="#041b2b" stroke="#a5f3fc" strokeWidth="5" />
        <ellipse cx="302" cy="228" rx="31" ry="23" fill="#041b2b" stroke="#a5f3fc" strokeWidth="5" />
        <ellipse cx="220" cy="229" rx="8" ry="16" fill={eyeFill} />
        <ellipse cx="300" cy="229" rx="8" ry="16" fill={eyeFill} />
        <path d="M177 238L159 230M179 250L158 250M343 238L361 230M341 250L362 250" stroke={color} strokeWidth="6" strokeLinecap="round" />
        <path d="M191 204Q218 190 244 203M329 204Q302 190 276 203" fill="none" stroke="#164e63" strokeWidth="7" strokeLinecap="round" />
      </g>;
    case "candy-smile":
      return <g className="monster-eye monster-eye--candy" filter={glow}>
        <path d="M200 229Q218 197 244 217Q249 241 222 253Q196 247 200 229Z" fill="#2a102f" stroke="#f9a8d4" strokeWidth="5" />
        <path d="M320 229Q302 197 276 217Q271 241 298 253Q324 247 320 229Z" fill="#2a102f" stroke="#f9a8d4" strokeWidth="5" />
        <circle cx="222" cy="229" r="10" fill={eyeFill} /><circle cx="298" cy="229" r="10" fill={eyeFill} />
        <path d="M188 205L201 196M212 199L220 187M332 205L319 196M308 199L300 187" stroke="#fef08a" strokeWidth="6" strokeLinecap="round" />
        <circle cx="195" cy="260" r="6" fill="#fda4af" opacity=".8" /><circle cx="325" cy="260" r="6" fill="#fda4af" opacity=".8" />
      </g>;
    case "mecha-visor":
      return <g className="monster-eye monster-eye--mecha" filter={glow}>
        <path d="M184 215L204 198H316L336 215 323 259H197Z" fill="#040b16" stroke={color} strokeWidth="6" strokeLinejoin="round" />
        <path d="M207 219H313L305 244H215Z" fill={eyeFill} />
        <path d="M225 220V243M260 220V243M295 220V243" stroke="#dffcff" strokeWidth="5" opacity=".82" />
        <path d="M195 205L177 218 191 229M325 205L343 218 329 229" fill="none" stroke="#94a3b8" strokeWidth="6" strokeLinejoin="round" />
      </g>;
    case "royal-crest":
      return <g className="monster-eye monster-eye--royal" filter={glow}>
        <path d="M194 222Q221 195 251 213L240 245Q214 250 196 236Z" fill="#11102a" stroke="#fde68a" strokeWidth="5" />
        <path d="M326 222Q299 195 269 213L280 245Q306 250 324 236Z" fill="#11102a" stroke="#fde68a" strokeWidth="5" />
        <path d="M220 217L233 241M300 217L287 241" stroke="#fff7d6" strokeWidth="7" strokeLinecap="round" />
        <path d="M232 190L246 202 260 180 274 202 288 190 282 216H238Z" fill="#3b1d65" stroke="#fde68a" strokeWidth="5" strokeLinejoin="round" />
        <circle cx="260" cy="203" r="6" fill={eyeFill} />
      </g>;
    case "molten-beast":
      return <g className="monster-eye monster-eye--molten" filter={glow}>
        <path d="M190 221L214 198 252 211 238 250 202 244Z" fill="#180605" stroke="#fb923c" strokeWidth="6" />
        <path d="M330 221L306 198 268 211 282 250 318 244Z" fill="#180605" stroke="#fb923c" strokeWidth="6" />
        <path d="M215 215L234 239M305 215L286 239" stroke="#fff7ed" strokeWidth="8" strokeLinecap="round" />
        <path d="M188 194L213 205 224 181M332 194L307 205 296 181M260 182L250 204 263 216 252 239" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
      </g>;
    case "frost-beast":
      return <g className="monster-eye monster-eye--frost" filter={glow}>
        <path d="M190 221L214 196 252 211 239 249 202 245Z" fill="#061522" stroke="#bae6fd" strokeWidth="6" />
        <path d="M330 221L306 196 268 211 281 249 318 245Z" fill="#061522" stroke="#bae6fd" strokeWidth="6" />
        <path d="M216 214L234 241M304 214L286 241" stroke="#f0f9ff" strokeWidth="7" strokeLinecap="round" />
        <path d="M197 188L215 202 229 181 244 204M323 188L305 202 291 181 276 204" fill="none" stroke="#e0f2fe" strokeWidth="6" strokeLinejoin="round" />
        <path d="M259 184V211M247 196L260 211 273 196" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" />
      </g>;
    case "integrated-visor":
      return <g className="monster-eye monster-eye--visor" filter={glow}>
        <rect x="190" y="207" width="140" height="55" rx="25" fill="#06111f" stroke={color} strokeWidth="6" />
        <rect x="200" y="217" width="120" height="35" rx="16" fill={eyeFill} />
        {[210, 260, 310].map((position) => <g key={position}>
          <ellipse cx={position} cy="235" rx="7" ry="10" fill="#dffcff" />
          <circle cx={position - 2} cy="232" r="2.5" fill="#fff" />
        </g>)}
      </g>;
    case "dino-predator":
      return <g className="monster-eye monster-eye--dino" filter={glow}>
        <path d="M190 219Q221 190 253 210L240 246Q212 250 194 234Z" fill="#07130e" stroke="#86efac" strokeWidth="5" />
        <path d="M330 219Q299 190 267 210L280 246Q308 250 326 234Z" fill="#07130e" stroke="#86efac" strokeWidth="5" />
        <path d="M219 214L233 241M301 214L287 241" stroke="#ecfccb" strokeWidth="7" strokeLinecap="round" />
        <path d="M187 205L246 189M333 205L274 189" fill="none" stroke="#173d2a" strokeWidth="12" strokeLinecap="round" />
        <path d="M244 259Q260 247 276 259" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" />
      </g>;
    case "cloud-dreamer":
      return <g className="monster-eye monster-eye--cloud" filter={glow}>
        <path d="M195 229Q222 199 250 225Q222 250 195 229Z" fill="#102038" stroke="#e0f2fe" strokeWidth="5" />
        <path d="M325 229Q298 199 270 225Q298 250 325 229Z" fill="#102038" stroke="#e0f2fe" strokeWidth="5" />
        <path d="M207 228Q222 238 237 228M283 228Q298 238 313 228" fill="none" stroke="#f8fafc" strokeWidth="6" strokeLinecap="round" />
        <path d="M260 184L267 199 283 201 271 212 274 228 260 220 246 228 249 212 237 201 253 199Z" fill="#fff" stroke={color} strokeWidth="3" />
        <path d="M176 251Q191 238 204 250M344 251Q329 238 316 250" fill="none" stroke="#bae6fd" strokeWidth="5" strokeLinecap="round" />
      </g>;
    case "integrated-lizard":
      return null;
  }
}

function mouthArt(treatment: MonsterFaceTreatment, { color }: FaceRenderContext): ReactNode {
  switch (treatment) {
    case "blob-mischief":
      return <>
        <path d="M224 316Q256 344 298 310Q288 348 255 351Q233 347 224 316Z" fill="#160d1d" stroke="#102f3c" strokeWidth="5" />
        <path d="M245 326L253 341 262 327" fill="#fff7e8" stroke="#d9e3e8" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M237 338Q264 349 285 326" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
      </>;
    case "sculpted-dragon":
      return <>
        <path d="M224 316Q260 344 296 316Q290 347 260 352Q230 347 224 316Z" fill="#20151d" stroke="#153746" strokeWidth="5" />
        <path d="m234 320 10 20 9-16m33-4-10 20-9-16" fill="#fff7e8" stroke="#d9e3e8" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M243 344q17-8 34 0" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" />
      </>;
    case "feral-guardian":
      return <>
        <path d="M222 315Q260 335 298 315Q291 345 260 349Q229 345 222 315Z" fill="#101018" stroke="#102f3c" strokeWidth="5" />
        <path d="M232 319L243 338 252 322M288 319L277 338 268 322" fill="#fff7e8" stroke="#cbd5e1" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M245 342Q260 336 275 342" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
      </>;
    case "carved-golem":
      return <>
        <path d="M222 315L241 326 260 319 279 326 298 315" fill="none" stroke="#071820" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M238 330H282" stroke="#74d7df" strokeOpacity=".46" strokeWidth="4" strokeLinecap="round" />
      </>;
    case "mystic-spirit":
      return <>
        <path d="M232 321Q260 342 288 321" fill="none" stroke="#f5d0fe" strokeWidth="6" strokeLinecap="round" />
        <path d="M242 333Q260 343 278 333" fill="none" stroke={color} strokeOpacity=".75" strokeWidth="3" strokeLinecap="round" />
      </>;
    case "cosmic-mask":
      return <>
        <path d="M232 317Q260 337 288 317Q280 344 260 347Q240 344 232 317Z" fill="#08051a" stroke="#c4b5fd" strokeWidth="5" />
        <path d="M246 333Q260 326 274 333" fill="none" stroke="#fef3c7" strokeWidth="4" strokeLinecap="round" />
      </>;
    case "aqua-creature":
      return <>
        <path d="M222 316Q260 302 298 316Q288 343 260 346Q232 343 222 316Z" fill="#041b2b" stroke="#67e8f9" strokeWidth="5" />
        <ellipse cx="244" cy="314" rx="5" ry="3" fill="#020617" /><ellipse cx="276" cy="314" rx="5" ry="3" fill="#020617" />
        <path d="M238 334Q260 342 282 334" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
      </>;
    case "candy-smile":
      return <>
        <path d="M226 315Q260 349 294 315Q289 350 260 356Q231 350 226 315Z" fill="#2a102f" stroke="#f9a8d4" strokeWidth="5" />
        <path d="M238 322L248 340 258 324 268 340 282 321" fill="#fff7ed" stroke="#fecdd3" strokeWidth="2" strokeLinejoin="round" />
        <path d="M244 348Q260 341 276 348" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
      </>;
    case "mecha-visor":
      return <g>
        <path d="M227 315H293L284 343H236Z" fill="#06111f" stroke={color} strokeWidth="4" strokeLinejoin="round" />
        <path d="M244 320V338M252 320V338M260 320V338M268 320V338M276 320V338" stroke="#dffcff" strokeWidth="3" />
      </g>;
    case "royal-crest":
      return <>
        <path d="M229 319Q260 342 291 313" fill="none" stroke="#fde68a" strokeWidth="7" strokeLinecap="round" />
        <path d="M247 339Q263 345 280 333" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
      </>;
    case "molten-beast":
      return <>
        <path d="M219 315Q260 341 301 315Q291 353 260 358Q229 353 219 315Z" fill="#170504" stroke="#fb923c" strokeWidth="6" />
        <path d="M230 319L243 342 253 322M290 319L277 342 267 322" fill="#fff7ed" stroke="#fed7aa" strokeWidth="2" strokeLinejoin="round" />
        <path d="M244 349Q260 336 276 349" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
      </>;
    case "frost-beast":
      return <>
        <path d="M220 315Q260 338 300 315Q291 349 260 354Q229 349 220 315Z" fill="#071522" stroke="#bae6fd" strokeWidth="6" />
        <path d="M232 318L243 344 253 322M288 318L277 344 267 322" fill="#f0f9ff" stroke="#dbeafe" strokeWidth="2" strokeLinejoin="round" />
        <path d="M260 341L252 356H268Z" fill={color} opacity=".8" />
      </>;
    case "integrated-visor":
      return <g>
        <rect x="238" y="318" width="44" height="17" rx="8" fill="#071426" stroke={color} strokeWidth="3" />
        <path d="M246 326h4m5 0h4m5 0h4m5 0h2" stroke="#dffcff" strokeWidth="2" strokeLinecap="round" />
      </g>;
    case "dino-predator":
      return <>
        <path d="M214 315Q260 296 306 315L294 345Q260 359 226 345Z" fill="#07130e" stroke="#4d7c0f" strokeWidth="6" />
        <ellipse cx="240" cy="316" rx="5" ry="3" fill="#020617" /><ellipse cx="280" cy="316" rx="5" ry="3" fill="#020617" />
        <path d="M225 330L237 347 247 333 258 350 269 333 280 347 295 330" fill="#fff7e8" stroke="#d9e3e8" strokeWidth="2" strokeLinejoin="round" />
      </>;
    case "cloud-dreamer":
      return <>
        <path d="M233 319Q260 341 287 319" fill="none" stroke="#f8fafc" strokeWidth="7" strokeLinecap="round" />
        <path d="M250 337L260 346 270 337" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </>;
    case "integrated-lizard":
      return null;
  }
}

function coreGlyph(treatment: MonsterFaceTreatment, { color, coreFill }: FaceRenderContext): ReactNode {
  switch (treatment) {
    case "blob-mischief":
      return <><circle cx="260" cy="387" r="24" fill={coreFill} /><circle cx="252" cy="379" r="7" fill="#fff" opacity=".8" /><circle cx="272" cy="396" r="5" fill={color} /></>;
    case "sculpted-dragon":
      return <><path d="M260 358L281 377 273 407 247 407 239 377Z" fill={coreFill} /><path d="M249 390L260 369 271 390 260 404Z" fill={color} opacity=".8" /></>;
    case "feral-guardian":
      return <><circle cx="260" cy="387" r="25" fill={coreFill} /><path d="M244 397L260 367 276 397 260 389Z" fill="#dcfce7" stroke={color} strokeWidth="3" /></>;
    case "carved-golem":
      return <><path d="M260 357L286 377 276 408 244 408 234 377Z" fill="#071820" stroke={color} strokeWidth="5" /><path d="M247 379L260 367 273 379 260 402Z" fill={coreFill} /></>;
    case "mystic-spirit":
      return <><circle cx="260" cy="387" r="25" fill="#130b2b" stroke="#e9d5ff" strokeWidth="4" /><path d="M260 365Q238 385 260 409Q282 385 260 365Z" fill="none" stroke={color} strokeWidth="6" /></>;
    case "cosmic-mask":
      return <><circle cx="260" cy="387" r="25" fill="#050816" stroke="#c4b5fd" strokeWidth="4" /><ellipse cx="260" cy="387" rx="32" ry="12" fill="none" stroke={color} strokeWidth="4" /><circle cx="260" cy="387" r="8" fill="#fef3c7" /></>;
    case "aqua-creature":
      return <><circle cx="260" cy="387" r="25" fill={coreFill} /><path d="M245 392Q260 365 275 392Q260 407 245 392Z" fill="#cffafe" stroke={color} strokeWidth="3" /></>;
    case "candy-smile":
      return <><circle cx="260" cy="387" r="25" fill="#3b123f" stroke="#f9a8d4" strokeWidth="4" /><path d="M260 367C282 367 282 407 260 407C238 407 238 379 260 379C273 379 273 396 260 396" fill="none" stroke="#fef08a" strokeWidth="6" strokeLinecap="round" /></>;
    case "mecha-visor":
      return <><path d="M260 357L286 372V402L260 417 234 402V372Z" fill="#06111f" stroke={color} strokeWidth="5" /><path d="M248 378H272V397H248Z" fill={coreFill} /><path d="M260 373V402M243 387H277" stroke="#dffcff" strokeWidth="3" /></>;
    case "royal-crest":
      return <><path d="M260 357L283 383 260 413 237 383Z" fill={coreFill} stroke="#fde68a" strokeWidth="5" /><circle cx="260" cy="383" r="8" fill="#fff7d6" /></>;
    case "molten-beast":
      return <><circle cx="260" cy="387" r="26" fill="#1c0704" stroke="#fb923c" strokeWidth="5" /><path d="M260 362L250 383 263 391 250 413M278 370L266 385 278 402" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" /></>;
    case "frost-beast":
      return <><circle cx="260" cy="387" r="26" fill="#071522" stroke="#bae6fd" strokeWidth="5" /><path d="M260 363V411M239 375L281 399M281 375L239 399M245 368L260 382 275 368M245 406L260 392 275 406" fill="none" stroke="#e0f2fe" strokeWidth="4" strokeLinecap="round" /></>;
    case "integrated-visor":
      return <><circle cx="260" cy="387" r="25" fill={coreFill} /><path d="M248 377H272V397H248Z" fill="#06111f" stroke={color} strokeWidth="3" /><circle cx="260" cy="387" r="5" fill="#fff" /></>;
    case "dino-predator":
      return <><circle cx="260" cy="387" r="25" fill="#07130e" stroke="#86efac" strokeWidth="4" /><path d="M246 397L253 374 260 392 267 374 275 397" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" /></>;
    case "cloud-dreamer":
      return <><circle cx="260" cy="387" r="25" fill="#102038" stroke="#e0f2fe" strokeWidth="4" /><path d="M247 394Q239 381 251 376Q260 361 269 376Q283 376 278 391Q273 403 247 394Z" fill="#f8fafc" /><path d="M263 383L255 397H264L258 408" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" /></>;
    case "integrated-lizard":
      return null;
  }
}

export function MonsterFaceArt({ body, monsterId, color, layout }: MonsterFaceArtProps) {
  const treatment = monsterFaceTreatment(body);
  if (treatment === "integrated-lizard") return null;

  const context: FaceRenderContext = {
    color,
    eyeFill: `url(#eye-${monsterId})`,
    coreFill: `url(#core-${monsterId})`,
    glow: `url(#monster-glow-${monsterId})`,
  };

  return <>
    <g
      className="monster-face"
      data-monster-face-signature={treatment}
      transform={monsterAccessoryTransform("face", layout.face)}
    >
      {faceEyes(treatment, context)}
    </g>
    <g
      className="monster-mouth"
      data-monster-mouth-signature={treatment}
      transform={monsterAccessoryTransform("mouth", layout.mouth)}
    >
      {mouthArt(treatment, context)}
    </g>
    <g
      className="monster-core"
      data-monster-core-signature={treatment}
      transform={monsterAccessoryTransform("core", layout.core)}
      filter={context.glow}
    >
      <circle cx="260" cy="387" r="36" fill="#051525" stroke="#a5f3fc" strokeOpacity=".65" strokeWidth="4" />
      {coreGlyph(treatment, context)}
    </g>
  </>;
}
