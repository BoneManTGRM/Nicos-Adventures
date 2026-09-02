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

function faceArt(treatment: MonsterFaceTreatment, { color, eyeFill, glow }: FaceRenderContext): ReactNode {
  switch (treatment) {
    case "blob-mischief":
      return <g className="monster-face-shell monster-face-shell--blob" filter={glow}>
        <path d="M168 224Q178 166 260 157Q342 166 352 224L337 274Q309 299 260 299Q211 299 183 274Z" fill={color} fillOpacity=".24" stroke="#063048" strokeWidth="11" strokeLinejoin="round" />
        <path d="M184 222Q209 181 247 199L242 249Q208 264 183 242ZM336 216Q304 177 270 198L277 250Q313 261 339 236Z" fill="#071522" stroke="#8b5cf6" strokeWidth="7" strokeLinejoin="round" />
        <ellipse cx="220" cy="226" rx="12" ry="19" fill={eyeFill} />
        <ellipse cx="298" cy="223" rx="14" ry="21" fill={eyeFill} />
        <ellipse cx="216" cy="219" rx="4" ry="7" fill="#fff" />
        <ellipse cx="293" cy="215" rx="5" ry="8" fill="#fff" />
        <path d="M178 203Q211 175 248 188M342 198Q306 170 270 187" fill="none" stroke="#082c41" strokeWidth="15" strokeLinecap="round" />
        <path d="M190 272Q213 289 231 280M330 269Q307 289 289 280" fill="none" stroke="#cffafe" strokeOpacity=".38" strokeWidth="5" strokeLinecap="round" />
      </g>;
    case "sculpted-dragon":
      return <g className="monster-face-shell monster-face-shell--dragon" filter={glow}>
        <path d="M162 220L190 176 232 158 260 178 288 158 330 176 358 220 338 277 292 286 260 307 228 286 182 277Z" fill={color} fillOpacity=".32" stroke="#061c2c" strokeWidth="12" strokeLinejoin="round" />
        <path d="M177 211L199 187 249 199 237 249 194 251Z" fill="#07131b" stroke="#f97316" strokeWidth="7" strokeLinejoin="round" />
        <path d="M343 211L321 187 271 199 283 249 326 251Z" fill="#07131b" stroke="#f97316" strokeWidth="7" strokeLinejoin="round" />
        <path d="M210 207L232 244M310 207L288 244" stroke="#fff7ed" strokeWidth="9" strokeLinecap="round" />
        <path d="M170 191L244 174M350 191L276 174" fill="none" stroke="#071a29" strokeWidth="17" strokeLinecap="round" />
        <path d="M260 180L244 214 260 239 276 214Z" fill="#072436" stroke="#67e8f9" strokeOpacity=".65" strokeWidth="5" />
        <path d="M174 259L203 269M346 259L317 269" stroke="#e0f2fe" strokeOpacity=".42" strokeWidth="6" strokeLinecap="round" />
      </g>;
    case "feral-guardian":
      return <g className="monster-face-shell monster-face-shell--guardian" filter={glow}>
        <path d="M166 208L186 177 213 185 232 157 260 181 288 157 307 185 334 177 354 208 335 280 296 294 260 312 224 294 185 280Z" fill={color} fillOpacity=".25" stroke="#0b2a22" strokeWidth="12" strokeLinejoin="round" />
        <path d="M178 218Q214 184 252 207L237 255Q207 263 181 239Z" fill="#071811" stroke="#86efac" strokeWidth="7" />
        <path d="M342 218Q306 184 268 207L283 255Q313 263 339 239Z" fill="#071811" stroke="#86efac" strokeWidth="7" />
        <path d="M211 211L232 248M309 211L288 248" stroke="#ecfccb" strokeWidth="9" strokeLinecap="round" />
        <path d="M169 192L244 181M351 192L276 181" stroke="#0d2b25" strokeWidth="18" strokeLinecap="round" />
        <path d="M180 261L155 275M340 261L365 275" stroke="#dcfce7" strokeOpacity=".56" strokeWidth="6" strokeLinecap="round" />
      </g>;
    case "carved-golem":
      return <g className="monster-face-shell monster-face-shell--golem" filter={glow}>
        <path d="M169 188L214 158 306 158 351 188 340 277 300 305H220L180 277Z" fill="#203741" fillOpacity=".48" stroke="#10232c" strokeWidth="13" strokeLinejoin="round" />
        <path d="M181 220L218 190 253 209 239 252 195 258Z" fill="#041219" stroke="#4fd1c5" strokeOpacity=".72" strokeWidth="7" />
        <path d="M339 220L302 190 267 209 281 252 325 258Z" fill="#041219" stroke="#4fd1c5" strokeOpacity=".72" strokeWidth="7" />
        <path d="M205 226L239 216 228 244 207 247ZM315 226L281 216 292 244 313 247Z" fill={eyeFill} />
        <path d="M260 168L242 198 260 221 278 198Z" fill="#071820" stroke={color} strokeWidth="7" />
        <path d="M177 205L214 178M343 205L306 178M216 277L236 258M304 277L284 258" fill="none" stroke="#6b8790" strokeOpacity=".55" strokeWidth="7" strokeLinecap="round" />
      </g>;
    case "mystic-spirit":
      return <g className="monster-face-shell monster-face-shell--spirit" filter={glow}>
        <path d="M164 224Q188 166 260 162Q332 166 356 224L322 281Q260 313 198 281Z" fill="#24124a" fillOpacity=".56" stroke="#d8b4fe" strokeOpacity=".82" strokeWidth="7" />
        <path d="M178 228Q215 183 251 221Q221 267 178 228Z" fill="#050815" stroke="#e9d5ff" strokeWidth="7" />
        <path d="M342 228Q305 183 269 221Q299 267 342 228Z" fill="#050815" stroke="#e9d5ff" strokeWidth="7" />
        <ellipse cx="220" cy="228" rx="11" ry="17" fill={eyeFill} />
        <ellipse cx="300" cy="228" rx="11" ry="17" fill={eyeFill} />
        <circle cx="216" cy="221" r="4" fill="#fff" /><circle cx="296" cy="221" r="4" fill="#fff" />
        <path d="M260 164Q230 198 260 222Q290 198 260 164Z" fill="none" stroke="#f5d0fe" strokeWidth="7" />
        <path d="M174 269Q201 246 218 270M346 269Q319 246 302 270" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
      </g>;
    case "cosmic-mask":
      return <g className="monster-face-shell monster-face-shell--cosmic" filter={glow}>
        <path d="M158 207Q260 145 362 207L340 282Q260 324 180 282Z" fill="#040617" stroke="#a78bfa" strokeWidth="9" strokeLinejoin="round" />
        <path d="M184 224L221 190 254 222 224 260Z" fill="#0b1028" stroke="#67e8f9" strokeWidth="6" />
        <path d="M336 224L299 190 266 222 296 260Z" fill="#0b1028" stroke="#67e8f9" strokeWidth="6" />
        <path d="M206 224L224 205 242 224 224 247Z" fill={eyeFill} />
        <path d="M278 224L296 205 314 224 296 247Z" fill={eyeFill} />
        <path d="M260 165L270 191 298 193 276 211 283 239 260 224 237 239 244 211 222 193 250 191Z" fill="#fef3c7" stroke={color} strokeWidth="4" />
        <circle cx="178" cy="195" r="5" fill="#fff" /><circle cx="338" cy="184" r="4" fill="#bae6fd" /><circle cx="351" cy="256" r="4" fill="#f5d0fe" />
      </g>;
    case "aqua-creature":
      return <g className="monster-face-shell monster-face-shell--aqua" filter={glow}>
        <path d="M160 220Q178 168 222 162L260 183 298 162Q342 168 360 220L337 279 301 295 260 309 219 295 183 279Z" fill={color} fillOpacity=".34" stroke="#083344" strokeWidth="11" strokeLinejoin="round" />
        <path d="M174 224Q210 181 252 214L239 258Q204 266 176 243Z" fill="#031923" stroke="#a5f3fc" strokeWidth="7" />
        <path d="M346 224Q310 181 268 214L281 258Q316 266 344 243Z" fill="#031923" stroke="#a5f3fc" strokeWidth="7" />
        <ellipse cx="216" cy="229" rx="10" ry="19" fill={eyeFill} /><ellipse cx="304" cy="229" rx="10" ry="19" fill={eyeFill} />
        <ellipse cx="212" cy="221" rx="4" ry="7" fill="#fff" /><ellipse cx="300" cy="221" rx="4" ry="7" fill="#fff" />
        <path d="M161 246L137 233M164 260L136 260M359 246L383 233M356 260L384 260" stroke="#67e8f9" strokeWidth="8" strokeLinecap="round" />
        <path d="M179 198Q212 172 247 194M341 198Q308 172 273 194" fill="none" stroke="#07566a" strokeWidth="12" strokeLinecap="round" />
      </g>;
    case "candy-smile":
      return <g className="monster-face-shell monster-face-shell--candy" filter={glow}>
        <path d="M164 218Q184 166 229 165L260 187 291 165Q336 166 356 218L338 278Q307 304 260 304Q213 304 182 278Z" fill="#b83280" fillOpacity=".48" stroke="#4a153c" strokeWidth="11" />
        <path d="M176 221Q212 181 251 209L239 254Q207 265 179 242Z" fill="#250c2d" stroke="#f9a8d4" strokeWidth="7" />
        <path d="M344 221Q308 181 269 209L281 254Q313 265 341 242Z" fill="#250c2d" stroke="#f9a8d4" strokeWidth="7" />
        <ellipse cx="216" cy="226" rx="11" ry="17" fill={eyeFill} /><ellipse cx="304" cy="226" rx="11" ry="17" fill={eyeFill} />
        <circle cx="212" cy="220" r="4" fill="#fff" /><circle cx="300" cy="220" r="4" fill="#fff" />
        <path d="M174 197Q211 171 246 190M346 197Q309 171 274 190" stroke="#581947" strokeWidth="14" strokeLinecap="round" />
        <path d="M190 270C205 247 220 291 236 266M330 270C315 247 300 291 284 266" fill="none" stroke="#fef08a" strokeWidth="7" strokeLinecap="round" />
      </g>;
    case "mecha-visor":
      return <g className="monster-face-shell monster-face-shell--mecha" filter={glow}>
        <path d="M160 208L193 169H327L360 208 342 280 309 302H211L178 280Z" fill="#102335" fillOpacity=".78" stroke="#07131f" strokeWidth="13" strokeLinejoin="round" />
        <path d="M175 207L202 183H318L345 207 329 264H191Z" fill="#030914" stroke={color} strokeWidth="8" strokeLinejoin="round" />
        <path d="M198 217H322L312 251H208Z" fill={eyeFill} />
        <path d="M220 219V248M260 219V248M300 219V248" stroke="#e6fbff" strokeWidth="6" opacity=".88" />
        <path d="M177 188L150 210 173 231M343 188L370 210 347 231" fill="none" stroke="#94a3b8" strokeWidth="8" strokeLinejoin="round" />
        <path d="M207 279H313" stroke="#67e8f9" strokeOpacity=".5" strokeWidth="5" />
      </g>;
    case "royal-crest":
      return <g className="monster-face-shell monster-face-shell--royal" filter={glow}>
        <path d="M166 217Q184 166 225 160L260 183 295 160Q336 166 354 217L337 278Q306 307 260 307Q214 307 183 278Z" fill={color} fillOpacity=".3" stroke="#352151" strokeWidth="12" />
        <path d="M177 222Q212 184 252 210L239 257Q205 265 178 243Z" fill="#120d2b" stroke="#fde68a" strokeWidth="7" />
        <path d="M343 222Q308 184 268 210L281 257Q315 265 342 243Z" fill="#120d2b" stroke="#fde68a" strokeWidth="7" />
        <path d="M210 213L233 249M310 213L287 249" stroke="#fff7d6" strokeWidth="9" strokeLinecap="round" />
        <path d="M217 178L238 193 260 151 282 193 303 178 294 222H226Z" fill="#3b1d65" stroke="#fde68a" strokeWidth="7" strokeLinejoin="round" />
        <circle cx="260" cy="192" r="10" fill={eyeFill} stroke="#fff7d6" strokeWidth="3" />
        <path d="M178 197L246 183M342 197L274 183" stroke="#29163f" strokeWidth="14" strokeLinecap="round" />
      </g>;
    case "molten-beast":
      return <g className="monster-face-shell monster-face-shell--molten" filter={glow}>
        <path d="M164 211L188 174 229 166 260 186 291 166 332 174 356 211 340 282 300 304H220L180 282Z" fill="#3b1208" fillOpacity=".72" stroke="#180605" strokeWidth="13" />
        <path d="M174 220L207 187 252 207 238 260 190 255Z" fill="#170504" stroke="#fb923c" strokeWidth="8" />
        <path d="M346 220L313 187 268 207 282 260 330 255Z" fill="#170504" stroke="#fb923c" strokeWidth="8" />
        <path d="M208 207L234 250M312 207L286 250" stroke="#fff7ed" strokeWidth="10" strokeLinecap="round" />
        <path d="M171 187L210 198 225 164M349 187L310 198 295 164M260 164L247 203 264 222 249 258" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" />
        <path d="M202 278L222 258M318 278L298 258" stroke="#fdba74" strokeWidth="6" />
      </g>;
    case "frost-beast":
      return <g className="monster-face-shell monster-face-shell--frost" filter={glow}>
        <path d="M164 211L190 173 228 166 260 186 292 166 330 173 356 211 340 282 300 304H220L180 282Z" fill="#0b2940" fillOpacity=".66" stroke="#051522" strokeWidth="13" />
        <path d="M174 220L207 187 252 207 238 260 190 255Z" fill="#061522" stroke="#bae6fd" strokeWidth="8" />
        <path d="M346 220L313 187 268 207 282 260 330 255Z" fill="#061522" stroke="#bae6fd" strokeWidth="8" />
        <path d="M209 207L234 251M311 207L286 251" stroke="#f0f9ff" strokeWidth="9" strokeLinecap="round" />
        <path d="M174 168L207 196 229 156 252 203M346 168L313 196 291 156 268 203" fill="none" stroke="#e0f2fe" strokeWidth="8" strokeLinejoin="round" />
        <path d="M260 155V216M242 174L260 196 278 174" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" />
      </g>;
    case "integrated-visor":
      return <g className="monster-face-shell monster-face-shell--alien" filter={glow}>
        <path d="M151 207Q175 157 260 151Q345 157 369 207L349 278Q308 309 260 309Q212 309 171 278Z" fill={color} fillOpacity=".22" stroke="#08283b" strokeWidth="11" />
        <path d="M165 202L190 177H330L355 202 339 267H181Z" fill="#030914" stroke={color} strokeWidth="8" strokeLinejoin="round" />
        <path d="M181 214H339L327 253H193Z" fill={eyeFill} />
        {[211, 260, 309].map((position) => <g key={position}>
          <ellipse cx={position} cy="234" rx="10" ry="14" fill="#dffcff" />
          <circle cx={position - 3} cy="229" r="3.5" fill="#fff" />
        </g>)}
        <path d="M184 275Q260 292 336 275" fill="none" stroke="#67e8f9" strokeOpacity=".48" strokeWidth="5" />
      </g>;
    case "dino-predator":
      return <g className="monster-face-shell monster-face-shell--dino" filter={glow}>
        <path d="M158 216Q180 164 225 157L260 180 295 157Q340 164 362 216L342 281 305 296 260 315 215 296 178 281Z" fill={color} fillOpacity=".35" stroke="#142410" strokeWidth="12" strokeLinejoin="round" />
        <path d="M168 218Q207 176 252 207L237 262Q201 271 171 243Z" fill="#06120a" stroke="#bef264" strokeWidth="8" />
        <path d="M352 218Q313 176 268 207L283 262Q319 271 349 243Z" fill="#06120a" stroke="#bef264" strokeWidth="8" />
        <path d="M207 207L234 254M313 207L286 254" stroke="#f7fee7" strokeWidth="10" strokeLinecap="round" />
        <path d="M165 194L244 175M355 194L276 175" stroke="#172a13" strokeWidth="18" strokeLinecap="round" />
        <path d="M188 274L215 285M332 274L305 285" stroke="#d9f99d" strokeOpacity=".48" strokeWidth="7" strokeLinecap="round" />
      </g>;
    case "cloud-dreamer":
      return <g className="monster-face-shell monster-face-shell--cloud" filter={glow}>
        <path d="M166 226Q177 185 214 179Q230 151 260 170Q290 151 306 179Q343 185 354 226L338 276Q304 302 260 302Q216 302 182 276Z" fill="#e0f2fe" fillOpacity=".22" stroke="#c7e7fb" strokeOpacity=".72" strokeWidth="10" />
        <path d="M177 225Q211 184 251 213L239 257Q205 266 179 244Z" fill="#071522" stroke="#dbeafe" strokeWidth="7" />
        <path d="M343 225Q309 184 269 213L281 257Q315 266 341 244Z" fill="#071522" stroke="#dbeafe" strokeWidth="7" />
        <path d="M211 216L233 250M309 216L287 250" stroke="#f8fafc" strokeWidth="9" strokeLinecap="round" />
        <path d="M183 202Q212 177 245 195M337 202Q308 177 275 195" stroke="#cbe8f8" strokeWidth="13" strokeLinecap="round" />
        <path d="M260 168L270 187 291 190 276 205 280 226 260 216 240 226 244 205 229 190 250 187Z" fill="#fef3c7" stroke={color} strokeWidth="4" />
      </g>;
    case "integrated-lizard":
      return null;
  }
}

function mouthArt(treatment: MonsterFaceTreatment, { color }: FaceRenderContext): ReactNode {
  switch (treatment) {
    case "blob-mischief":
      return <g className="monster-snout monster-snout--blob">
        <path d="M198 302Q260 276 322 302L311 348Q260 378 209 348Z" fill="#06121c" stroke="#0a3246" strokeWidth="10" />
        <path d="M217 313Q260 348 303 313Q294 356 260 364Q226 356 217 313Z" fill="#190b25" stroke="#a78bfa" strokeWidth="6" />
        <path d="M226 316L240 338 252 319M294 316L280 338 268 319" fill="#fff" stroke="#dff7fb" strokeWidth="2" strokeLinejoin="round" />
        <path d="M243 353Q260 342 277 353" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" />
      </g>;
    case "sculpted-dragon":
      return <g className="monster-snout monster-snout--dragon">
        <path d="M176 296Q260 256 344 296L330 350Q260 382 190 350Z" fill={color} fillOpacity=".31" stroke="#061a28" strokeWidth="12" />
        <ellipse cx="229" cy="310" rx="10" ry="6" fill="#020617" /><ellipse cx="291" cy="310" rx="10" ry="6" fill="#020617" />
        <path d="M193 328L214 356 231 334 249 362 270 333 289 358 327 326" fill="#fff7ed" stroke="#cbd5e1" strokeWidth="2" strokeLinejoin="round" />
        <path d="M210 347Q260 366 310 347" fill="none" stroke="#07131b" strokeWidth="8" strokeLinecap="round" />
      </g>;
    case "feral-guardian":
      return <g className="monster-snout monster-snout--guardian">
        <path d="M184 296Q260 270 336 296L324 349Q260 377 196 349Z" fill={color} fillOpacity=".28" stroke="#0a261f" strokeWidth="11" />
        <path d="M231 301L260 286 289 301 279 327H241Z" fill="#09130f" stroke="#86efac" strokeWidth="5" />
        <path d="M198 328L219 354 238 333 260 361 282 333 301 354 322 328" fill="#f7fee7" stroke="#d1d5db" strokeWidth="2" strokeLinejoin="round" />
      </g>;
    case "carved-golem":
      return <g className="monster-snout monster-snout--golem">
        <path d="M184 303L222 284 260 300 298 284 336 303 320 353 280 369 240 369 200 353Z" fill="#1a3039" stroke="#0d2028" strokeWidth="12" />
        <path d="M204 328L229 340 260 330 291 340 316 328" fill="none" stroke="#06151b" strokeWidth="12" strokeLinecap="square" />
        <path d="M222 333L238 345M282 345L298 333" stroke={color} strokeOpacity=".72" strokeWidth="6" />
      </g>;
    case "mystic-spirit":
      return <g className="monster-snout monster-snout--spirit">
        <path d="M208 306Q260 285 312 306Q300 350 260 359Q220 350 208 306Z" fill="#090716" fillOpacity=".82" stroke="#e9d5ff" strokeWidth="6" />
        <path d="M226 320Q260 344 294 320" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" />
        <path d="M242 340Q260 350 278 340" fill="none" stroke="#f5d0fe" strokeWidth="4" strokeLinecap="round" />
      </g>;
    case "cosmic-mask":
      return <g className="monster-snout monster-snout--cosmic">
        <path d="M205 302Q260 281 315 302L301 351Q260 371 219 351Z" fill="#040617" stroke="#a78bfa" strokeWidth="7" />
        <path d="M226 322Q260 348 294 322" fill="none" stroke="#fef3c7" strokeWidth="7" strokeLinecap="round" />
        <circle cx="241" cy="337" r="3" fill="#67e8f9" /><circle cx="279" cy="337" r="3" fill="#f5d0fe" />
      </g>;
    case "aqua-creature":
      return <g className="monster-snout monster-snout--aqua">
        <path d="M184 298Q260 270 336 298L322 350Q260 378 198 350Z" fill={color} fillOpacity=".31" stroke="#083344" strokeWidth="11" />
        <ellipse cx="229" cy="312" rx="9" ry="5" fill="#020617" /><ellipse cx="291" cy="312" rx="9" ry="5" fill="#020617" />
        <path d="M214 329Q260 359 306 329Q297 365 260 371Q223 365 214 329Z" fill="#031923" stroke="#67e8f9" strokeWidth="6" />
        <path d="M237 351Q260 361 283 351" fill="none" stroke="#cffafe" strokeWidth="4" strokeLinecap="round" />
      </g>;
    case "candy-smile":
      return <g className="monster-snout monster-snout--candy">
        <path d="M187 300Q260 269 333 300L322 350Q260 383 198 350Z" fill="#8f2467" fillOpacity=".54" stroke="#4a153c" strokeWidth="11" />
        <path d="M209 316Q260 366 311 316Q302 368 260 377Q218 368 209 316Z" fill="#250c2d" stroke="#f9a8d4" strokeWidth="7" />
        <path d="M222 321L238 347 251 324M298 321L282 347 269 324" fill="#fff7ed" stroke="#fecdd3" strokeWidth="2" strokeLinejoin="round" />
        <path d="M240 360Q260 348 280 360" fill="none" stroke="#fef08a" strokeWidth="5" strokeLinecap="round" />
      </g>;
    case "mecha-visor":
      return <g className="monster-snout monster-snout--mecha">
        <path d="M207 299H313L300 353H220Z" fill="#07111f" stroke={color} strokeWidth="7" strokeLinejoin="round" />
        <path d="M229 312H291V339H229Z" fill="#020617" stroke="#67e8f9" strokeOpacity=".65" strokeWidth="4" />
        <path d="M239 316V335M250 316V335M260 316V335M270 316V335M281 316V335" stroke="#dffcff" strokeWidth="4" />
      </g>;
    case "royal-crest":
      return <g className="monster-snout monster-snout--royal">
        <path d="M188 299Q260 270 332 299L319 350Q260 379 201 350Z" fill={color} fillOpacity=".3" stroke="#352151" strokeWidth="11" />
        <path d="M213 321Q260 361 307 321" fill="none" stroke="#fde68a" strokeWidth="9" strokeLinecap="round" />
        <path d="M237 348Q260 360 283 348" fill="none" stroke="#fff7d6" strokeWidth="5" strokeLinecap="round" />
      </g>;
    case "molten-beast":
      return <g className="monster-snout monster-snout--molten">
        <path d="M180 296Q260 265 340 296L325 352Q260 383 195 352Z" fill="#3b1208" stroke="#180605" strokeWidth="12" />
        <ellipse cx="229" cy="309" rx="9" ry="5" fill="#020617" /><ellipse cx="291" cy="309" rx="9" ry="5" fill="#020617" />
        <path d="M196 326L219 356 239 331 258 363 279 331 301 356 324 326" fill="#fff7ed" stroke="#fed7aa" strokeWidth="2" />
        <path d="M236 354L249 336 263 348 276 329 287 354" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
      </g>;
    case "frost-beast":
      return <g className="monster-snout monster-snout--frost">
        <path d="M180 296Q260 265 340 296L325 352Q260 383 195 352Z" fill="#0b2940" stroke="#051522" strokeWidth="12" />
        <ellipse cx="229" cy="309" rx="9" ry="5" fill="#020617" /><ellipse cx="291" cy="309" rx="9" ry="5" fill="#020617" />
        <path d="M196 326L219 356 239 331 258 363 279 331 301 356 324 326" fill="#f0f9ff" stroke="#dbeafe" strokeWidth="2" />
        <path d="M260 335L248 361H272Z" fill={color} stroke="#e0f2fe" strokeWidth="3" />
      </g>;
    case "integrated-visor":
      return <g className="monster-snout monster-snout--alien">
        <path d="M207 300H313L302 352H218Z" fill="#07111f" stroke={color} strokeWidth="7" />
        <rect x="229" y="316" width="62" height="22" rx="10" fill="#020617" stroke="#67e8f9" strokeWidth="4" />
        <path d="M239 327h6m7 0h6m7 0h6m7 0h4" stroke="#dffcff" strokeWidth="4" strokeLinecap="round" />
      </g>;
    case "dino-predator":
      return <g className="monster-snout monster-snout--dino">
        <path d="M174 294Q260 256 346 294L331 351Q260 386 189 351Z" fill={color} fillOpacity=".34" stroke="#142410" strokeWidth="13" />
        <ellipse cx="226" cy="308" rx="11" ry="6" fill="#020617" /><ellipse cx="294" cy="308" rx="11" ry="6" fill="#020617" />
        <path d="M191 327L216 357 235 333 255 365 276 333 300 357 329 325" fill="#fff7e8" stroke="#d9e3e8" strokeWidth="2" strokeLinejoin="round" />
        <path d="M208 346Q260 368 312 346" fill="none" stroke="#07130e" strokeWidth="9" strokeLinecap="round" />
      </g>;
    case "cloud-dreamer":
      return <g className="monster-snout monster-snout--cloud">
        <path d="M198 302Q260 279 322 302Q310 350 260 363Q210 350 198 302Z" fill="#e0f2fe" fillOpacity=".19" stroke="#c7e7fb" strokeWidth="8" />
        <path d="M218 320Q260 359 302 320" fill="none" stroke="#f8fafc" strokeWidth="9" strokeLinecap="round" />
        <path d="M244 346L260 360 276 346" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      </g>;
    case "integrated-lizard":
      return null;
  }
}

function coreGlyph(treatment: MonsterFaceTreatment, { color, coreFill }: FaceRenderContext): ReactNode {
  switch (treatment) {
    case "blob-mischief":
      return <><circle cx="260" cy="387" r="14" fill={coreFill} /><circle cx="255" cy="382" r="4" fill="#fff" opacity=".8" /></>;
    case "sculpted-dragon":
      return <path d="M260 369L275 382 269 403H251L245 382Z" fill={coreFill} stroke={color} strokeWidth="3" />;
    case "feral-guardian":
      return <path d="M247 400L260 372 273 400 260 391Z" fill="#dcfce7" stroke={color} strokeWidth="3" />;
    case "carved-golem":
      return <path d="M260 368L278 382 270 404H250L242 382Z" fill="#071820" stroke={color} strokeWidth="4" />;
    case "mystic-spirit":
      return <path d="M260 370Q244 386 260 404Q276 386 260 370Z" fill="none" stroke={color} strokeWidth="5" />;
    case "cosmic-mask":
      return <><ellipse cx="260" cy="387" rx="21" ry="8" fill="none" stroke={color} strokeWidth="4" /><circle cx="260" cy="387" r="6" fill="#fef3c7" /></>;
    case "aqua-creature":
      return <path d="M248 392Q260 372 272 392Q260 404 248 392Z" fill="#cffafe" stroke={color} strokeWidth="3" />;
    case "candy-smile":
      return <path d="M260 373C276 373 276 401 260 401C244 401 244 381 260 381C269 381 269 394 260 394" fill="none" stroke="#fef08a" strokeWidth="5" strokeLinecap="round" />;
    case "mecha-visor":
      return <><path d="M260 367L278 378V398L260 409 242 398V378Z" fill="#06111f" stroke={color} strokeWidth="4" /><path d="M251 380H269V396H251Z" fill={coreFill} /></>;
    case "royal-crest":
      return <><path d="M260 369L276 387 260 406 244 387Z" fill={coreFill} stroke="#fde68a" strokeWidth="4" /><circle cx="260" cy="387" r="5" fill="#fff7d6" /></>;
    case "molten-beast":
      return <path d="M260 369L252 384 264 390 252 406M275 375L266 387 275 399" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />;
    case "frost-beast":
      return <path d="M260 369V405M245 378L275 397M275 378L245 397" fill="none" stroke="#e0f2fe" strokeWidth="4" strokeLinecap="round" />;
    case "integrated-visor":
      return <><path d="M249 378H271V397H249Z" fill="#06111f" stroke={color} strokeWidth="3" /><circle cx="260" cy="387" r="5" fill="#fff" /></>;
    case "dino-predator":
      return <path d="M249 400L254 378 260 393 267 378 273 400" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" />;
    case "cloud-dreamer":
      return <path d="M249 395Q243 384 252 380Q260 369 268 380Q279 380 275 392Q271 401 249 395Z" fill="#f8fafc" stroke={color} strokeWidth="2" />;
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
      className="monster-face monster-face--integrated"
      data-monster-face-signature={treatment}
      data-monster-face-integration="sculpted-shell"
      transform={monsterAccessoryTransform("face", layout.face)}
    >
      {faceArt(treatment, context)}
    </g>
    <g
      className="monster-mouth monster-mouth--integrated"
      data-monster-mouth-signature={treatment}
      transform={monsterAccessoryTransform("mouth", layout.mouth)}
    >
      {mouthArt(treatment, context)}
    </g>
    <g
      className="monster-core monster-core--subtle"
      data-monster-core-signature={treatment}
      transform={monsterAccessoryTransform("core", layout.core)}
      filter={context.glow}
    >
      <circle cx="260" cy="387" r="25" fill="#051525" fillOpacity=".78" stroke="#a5f3fc" strokeOpacity=".38" strokeWidth="3" />
      {coreGlyph(treatment, context)}
    </g>
  </>;
}
