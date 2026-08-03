import { useId, type CSSProperties } from "react";

export type NicoPose = "avatar" | "guide" | "explorer" | "reading" | "celebrate";

type NicoCharacterProps = {
  pose?: NicoPose;
  className?: string;
  title?: string;
  decorative?: boolean;
  style?: CSSProperties;
};

const outline = "#3f261f";

export function NicoCharacter({
  pose = "guide",
  className = "",
  title = "Nico",
  decorative = false,
  style,
}: NicoCharacterProps) {
  const uid = useId().replaceAll(":", "");
  const skin = `${uid}-skin`;
  const shirt = `${uid}-shirt`;
  const shorts = `${uid}-shorts`;
  const hair = `${uid}-hair`;
  const shadow = `${uid}-shadow`;
  const isAvatar = pose === "avatar";

  return (
    <svg
      className={`nico-character-svg nico-character-svg--${pose} ${className}`.trim()}
      viewBox={isAvatar ? "38 18 164 165" : "0 0 240 360"}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : title}
      focusable="false"
      style={style}
    >
      {!decorative && <title>{title}</title>}
      <defs>
        <linearGradient id={skin} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffd2ae" />
          <stop offset="0.58" stopColor="#f3a276" />
          <stop offset="1" stopColor="#d97950" />
        </linearGradient>
        <linearGradient id={shirt} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffdf2" />
          <stop offset="1" stopColor="#e8e4d4" />
        </linearGradient>
        <linearGradient id={shorts} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9a06a" />
          <stop offset="1" stopColor="#9c7446" />
        </linearGradient>
        <linearGradient id={hair} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#32231d" />
          <stop offset="0.55" stopColor="#171311" />
          <stop offset="1" stopColor="#070707" />
        </linearGradient>
        <filter id={shadow} x="-40%" y="-40%" width="180%" height="190%">
          <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#020617" floodOpacity="0.38" />
        </filter>
      </defs>

      {!isAvatar && (
        <>
          <ellipse cx="120" cy="342" rx="65" ry="10" fill="#020617" opacity="0.2" />

          {pose === "explorer" && (
            <path
              d="M76 154 Q55 174 58 226 L75 238 L91 170 Z"
              fill="#245f39"
              stroke={outline}
              strokeWidth="4"
              strokeLinejoin="round"
            />
          )}

          <g filter={`url(#${shadow})`}>
            <path d="M82 258 Q84 294 80 319" fill="none" stroke={`url(#${skin})`} strokeWidth="24" strokeLinecap="round" />
            <path d="M151 258 Q151 295 155 319" fill="none" stroke={`url(#${skin})`} strokeWidth="24" strokeLinecap="round" />
            <path d="M65 320 Q92 308 108 326 L106 342 Q72 350 52 338 Z" fill="#2f7a45" stroke={outline} strokeWidth="4" strokeLinejoin="round" />
            <path d="M136 325 Q164 310 190 331 L188 344 Q154 350 127 340 Z" fill="#2f7a45" stroke={outline} strokeWidth="4" strokeLinejoin="round" />
            <path d="M65 326 L103 330 M139 329 L181 334" stroke="#f7f0dc" strokeWidth="4" strokeLinecap="round" />
            <path d="M76 305 L98 305 M143 305 L166 305" stroke="#f5efe3" strokeWidth="10" strokeLinecap="round" />

            <path d="M68 214 Q119 201 171 214 L167 273 Q145 282 120 267 Q94 282 71 272 Z" fill={`url(#${shorts})`} stroke={outline} strokeWidth="4" strokeLinejoin="round" />
            <path d="M120 219 L120 266 M77 231 L101 230" stroke="#7a5636" strokeWidth="3" strokeLinecap="round" />
            <path d="M71 231 Q83 238 98 232 L97 253 Q82 259 70 250" fill="#b88c57" stroke="#7a5636" strokeWidth="2.5" />

            <path d="M77 143 Q119 128 163 143 Q174 176 168 222 Q119 242 72 222 Q66 177 77 143 Z" fill={`url(#${shirt})`} stroke={outline} strokeWidth="4" strokeLinejoin="round" />
            <path d="M84 143 L103 162 L120 149 L137 162 L157 143" fill="#1e7b3b" stroke={outline} strokeWidth="3" strokeLinejoin="round" />
            <path d="M112 151 L128 151 L128 195 L112 195 Z" fill="#188342" stroke={outline} strokeWidth="2.5" />
            <circle cx="120" cy="163" r="2.2" fill="#f3d56b" />
            <circle cx="120" cy="176" r="2.2" fill="#f3d56b" />
            <path d="M139 176 L158 176 L158 195 Q148 199 139 194 Z" fill="#ffffff" stroke="#188342" strokeWidth="2.5" />
            <path d="M148 182 l4 8 m-4-8 l-4 8 m4-8 v11" stroke="#188342" strokeWidth="2" strokeLinecap="round" />

            {pose === "reading" ? (
              <>
                <path d="M80 170 Q62 187 72 218" fill="none" stroke={`url(#${skin})`} strokeWidth="18" strokeLinecap="round" />
                <path d="M160 170 Q178 188 168 218" fill="none" stroke={`url(#${skin})`} strokeWidth="18" strokeLinecap="round" />
              </>
            ) : pose === "celebrate" ? (
              <>
                <path d="M78 157 Q51 163 40 122" fill="none" stroke={`url(#${skin})`} strokeWidth="19" strokeLinecap="round" />
                <path d="M40 124 L35 103 Q35 93 43 93 Q50 95 49 105 L53 117" fill={`url(#${skin})`} stroke={outline} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M161 158 Q181 172 170 209" fill="none" stroke={`url(#${skin})`} strokeWidth="19" strokeLinecap="round" />
                <path d="M171 209 Q162 213 154 207" fill="none" stroke={outline} strokeWidth="3" strokeLinecap="round" />
              </>
            ) : pose === "explorer" ? (
              <>
                <path d="M79 157 Q55 163 60 197" fill="none" stroke={`url(#${skin})`} strokeWidth="19" strokeLinecap="round" />
                <path d="M159 158 Q178 178 164 211" fill="none" stroke={`url(#${skin})`} strokeWidth="19" strokeLinecap="round" />
                <circle cx="65" cy="130" r="29" fill="#bfe8f6" fillOpacity="0.42" stroke="#2f3135" strokeWidth="7" />
                <circle cx="65" cy="130" r="21" fill="#dff6ff" fillOpacity="0.2" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="2" />
                <path d="M49 153 L32 183" stroke="#2f3135" strokeWidth="9" strokeLinecap="round" />
                <path d="M33 183 L29 191" stroke="#9a6334" strokeWidth="10" strokeLinecap="round" />
              </>
            ) : (
              <>
                <path d="M79 158 Q59 180 72 212" fill="none" stroke={`url(#${skin})`} strokeWidth="19" strokeLinecap="round" />
                <path d="M160 158 Q183 146 187 116" fill="none" stroke={`url(#${skin})`} strokeWidth="19" strokeLinecap="round" />
                <path d="M187 118 Q198 102 196 88 M188 104 L178 91 M193 105 L205 94" fill="none" stroke={`url(#${skin})`} strokeWidth="8" strokeLinecap="round" />
              </>
            )}
          </g>
        </>
      )}

      <g filter={`url(#${shadow})`}>
        <ellipse cx="66" cy="91" rx="13" ry="17" fill={`url(#${skin})`} stroke={outline} strokeWidth="3" />
        <ellipse cx="174" cy="91" rx="13" ry="17" fill={`url(#${skin})`} stroke={outline} strokeWidth="3" />
        <ellipse cx="120" cy="89" rx="56" ry="59" fill={`url(#${skin})`} stroke={outline} strokeWidth="4" />

        <path
          d="M65 79 Q58 38 83 25 Q102 8 129 19 Q151 12 171 31 Q188 49 176 79 Q164 58 151 48 Q130 55 112 42 Q89 56 65 79 Z"
          fill={`url(#${hair})`}
          stroke={outline}
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path d="M74 51 Q89 35 105 38 M96 31 Q114 22 132 31 M128 31 Q149 24 163 44 M80 65 Q97 48 115 53 M122 47 Q143 42 164 58" fill="none" stroke="#4d3930" strokeWidth="4" strokeLinecap="round" opacity="0.72" />

        <path d="M77 82 Q92 69 107 79" fill="none" stroke="#2b211d" strokeWidth="4" strokeLinecap="round" />
        <path d="M133 79 Q149 69 164 82" fill="none" stroke="#2b211d" strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="92" cy="92" rx="26" ry="23" fill="#25394a" fillOpacity="0.8" stroke="#b32626" strokeWidth="7" />
        <ellipse cx="148" cy="92" rx="26" ry="23" fill="#25394a" fillOpacity="0.8" stroke="#b32626" strokeWidth="7" />
        <path d="M118 91 Q120 87 122 91" fill="none" stroke="#b32626" strokeWidth="7" strokeLinecap="round" />
        <path d="M66 86 L55 82 M174 86 L185 82" stroke="#b32626" strokeWidth="5" strokeLinecap="round" />
        <ellipse cx="92" cy="92" rx="7" ry="9" fill="#121820" />
        <ellipse cx="148" cy="92" rx="7" ry="9" fill="#121820" />
        <circle cx="89" cy="88" r="2.7" fill="white" />
        <circle cx="145" cy="88" r="2.7" fill="white" />
        <path d="M119 96 Q115 108 122 109" fill="none" stroke="#bf694b" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M96 120 Q120 137 145 119" fill="#fff3e2" stroke="#9e4c3c" strokeWidth="3" strokeLinecap="round" />
        <path d="M100 121 Q120 129 141 120" fill="none" stroke="#e7a49a" strokeWidth="2" strokeLinecap="round" />
      </g>

      {pose === "reading" && !isAvatar && (
        <g filter={`url(#${shadow})`}>
          <path d="M64 189 Q92 179 120 198 L120 254 Q92 235 64 242 Z" fill="#7b3f1f" stroke={outline} strokeWidth="4" strokeLinejoin="round" />
          <path d="M176 189 Q148 179 120 198 L120 254 Q148 235 176 242 Z" fill="#8d4b22" stroke={outline} strokeWidth="4" strokeLinejoin="round" />
          <path d="M69 194 Q93 188 116 203 L116 243 Q93 230 69 234 Z" fill="#fff1c9" stroke="#d6c28e" strokeWidth="2" />
          <path d="M171 194 Q147 188 124 203 L124 243 Q147 230 171 234 Z" fill="#fff1c9" stroke="#d6c28e" strokeWidth="2" />
          <path d="M120 198 L120 254" stroke="#4b2d1f" strokeWidth="3" />
          <path d="M77 207 L108 211 M77 216 L108 220 M132 211 L163 207 M132 220 L163 216" stroke="#b18b54" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}
