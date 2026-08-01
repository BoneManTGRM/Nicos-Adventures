import type { Robot } from "./types";

type Props = { robot: Robot; pose?: "idle" | "launch" | "celebrate" };

export function RobotStage({ robot, pose = "idle" }: Props) {
  const primary = robot.color === "Electric Blue" ? "#38bdf8" : "#8b5cf6";
  const secondary = robot.secondary_color === "Sunny Yellow" ? "#facc15" : "#fb7185";
  const poseClass = `mecha mecha--${pose}`;

  return (
    <section className="hangar" aria-label={`${robot.name} robot preview`}>
      <div className="hangar__light" />
      <svg className={poseClass} viewBox="0 0 420 520" role="img">
        <defs>
          <linearGradient id="armor" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f8fafc" />
            <stop offset="0.35" stopColor={primary} />
            <stop offset="1" stopColor="#172554" />
          </linearGradient>
          <linearGradient id="accent" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" />
            <stop offset="0.4" stopColor={secondary} />
            <stop offset="1" stopColor="#b45309" />
          </linearGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="7" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>

        <g className="thrusters" filter="url(#glow)">
          <path d="M135 245 L92 315 L142 292 Z" fill="#67e8f9" opacity=".75" />
          <path d="M285 245 L328 315 L278 292 Z" fill="#67e8f9" opacity=".75" />
        </g>

        <g className="backpack">
          <path d="M128 170 L83 117 L101 241 L145 222 Z" fill="url(#armor)" stroke="#0f172a" strokeWidth="9" />
          <path d="M292 170 L337 117 L319 241 L275 222 Z" fill="url(#armor)" stroke="#0f172a" strokeWidth="9" />
          <path d="M105 128 L70 78 L92 171" fill="none" stroke={secondary} strokeWidth="13" strokeLinecap="round" />
          <path d="M315 128 L350 78 L328 171" fill="none" stroke={secondary} strokeWidth="13" strokeLinecap="round" />
        </g>

        <g className="legs">
          <path d="M155 337 L135 426 L167 480 L203 462 L194 353 Z" fill="url(#armor)" stroke="#0f172a" strokeWidth="10" />
          <path d="M265 337 L285 426 L253 480 L217 462 L226 353 Z" fill="url(#armor)" stroke="#0f172a" strokeWidth="10" />
          <circle cx="174" cy="365" r="15" fill="#111827" stroke={secondary} strokeWidth="7" />
          <circle cx="246" cy="365" r="15" fill="#111827" stroke={secondary} strokeWidth="7" />
          <path d="M130 470 L188 466 L184 500 L107 500 Z" fill="#172554" stroke="#0f172a" strokeWidth="9" />
          <path d="M290 470 L232 466 L236 500 L313 500 Z" fill="#172554" stroke="#0f172a" strokeWidth="9" />
        </g>

        <g className="arms">
          <path d="M132 208 L69 235 L51 333 L88 344 L122 278 L151 255 Z" fill="url(#armor)" stroke="#0f172a" strokeWidth="10" />
          <path d="M288 208 L351 235 L369 333 L332 344 L298 278 L269 255 Z" fill="url(#armor)" stroke="#0f172a" strokeWidth="10" />
          <circle cx="77" cy="329" r="20" fill="#111827" stroke={secondary} strokeWidth="8" />
          <circle cx="343" cy="329" r="20" fill="#111827" stroke={secondary} strokeWidth="8" />
          <path d="M49 341 L30 395 L75 375 L91 342" fill="url(#accent)" stroke="#0f172a" strokeWidth="8" />
          <path d="M371 341 L390 395 L345 375 L329 342" fill="url(#accent)" stroke="#0f172a" strokeWidth="8" />
        </g>

        <g className="torso">
          <path d="M126 191 L162 154 L258 154 L294 191 L276 337 L144 337 Z" fill="url(#armor)" stroke="#0f172a" strokeWidth="11" />
          <path d="M153 194 L210 225 L267 194 L255 287 L210 318 L165 287 Z" fill="#111827" stroke={secondary} strokeWidth="9" />
          <circle cx="210" cy="254" r="28" fill="#22d3ee" stroke="#e0f2fe" strokeWidth="9" filter="url(#glow)" />
          <path d="M126 191 L82 196 L104 237 L149 224 Z" fill="url(#accent)" stroke="#0f172a" strokeWidth="9" />
          <path d="M294 191 L338 196 L316 237 L271 224 Z" fill="url(#accent)" stroke="#0f172a" strokeWidth="9" />
        </g>

        <g className="head">
          <path d="M155 70 L186 43 L234 43 L265 70 L253 142 L210 165 L167 142 Z" fill="url(#armor)" stroke="#0f172a" strokeWidth="10" />
          <path d="M170 91 L210 77 L250 91 L238 119 L182 119 Z" fill="#07142d" stroke="#67e8f9" strokeWidth="8" filter="url(#glow)" />
          <path d="M210 46 L210 12" stroke={secondary} strokeWidth="12" strokeLinecap="round" />
          <path d="M204 48 L151 22 L180 76" fill="url(#accent)" stroke="#0f172a" strokeWidth="7" />
          <path d="M216 48 L269 22 L240 76" fill="url(#accent)" stroke="#0f172a" strokeWidth="7" />
          <path d="M185 130 L210 143 L235 130" fill="none" stroke={secondary} strokeWidth="8" strokeLinecap="round" />
        </g>
      </svg>
      <div className="robot-readout">
        <span className="robot-readout__status">ONLINE</span>
        <strong>{robot.name}</strong>
        <small>{robot.personality} · LV {robot.level}</small>
      </div>
    </section>
  );
}
