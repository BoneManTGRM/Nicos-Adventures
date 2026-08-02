(() => {
  const species = {
    "Tyrannosaurus rex": { kind: "theropod", sky: "#f59e0b", ground: "#4d7c0f", body: "#7c3f16", accent: "#fbbf24" },
    "Triceratops": { kind: "ceratopsian", sky: "#60a5fa", ground: "#365314", body: "#64748b", accent: "#e2e8f0" },
    "Velociraptor": { kind: "raptor", sky: "#a78bfa", ground: "#14532d", body: "#92400e", accent: "#fde68a" },
    "Brachiosaurus": { kind: "sauropod", sky: "#38bdf8", ground: "#166534", body: "#4d7c0f", accent: "#bef264" },
    "Stegosaurus": { kind: "stegosaur", sky: "#fb7185", ground: "#3f6212", body: "#6b7280", accent: "#f97316" },
    "Ankylosaurus": { kind: "ankylosaur", sky: "#fbbf24", ground: "#57534e", body: "#57534e", accent: "#d6d3d1" },
    "Spinosaurus": { kind: "spinosaur", sky: "#22d3ee", ground: "#0f766e", body: "#0f766e", accent: "#f97316" },
    "Pteranodon": { kind: "pterosaur", sky: "#93c5fd", ground: "#1e3a8a", body: "#475569", accent: "#f8fafc" },
    "Parasaurolophus": { kind: "hadrosaur", sky: "#fb923c", ground: "#166534", body: "#a16207", accent: "#fde047" },
    "Pachycephalosaurus": { kind: "pachy", sky: "#f0abfc", ground: "#365314", body: "#7c2d12", accent: "#fef3c7" },
    "Mosasaurus": { kind: "marine", sky: "#0ea5e9", ground: "#082f49", body: "#334155", accent: "#67e8f9" },
    "Dilophosaurus": { kind: "theropod", sky: "#f472b6", ground: "#14532d", body: "#166534", accent: "#facc15" }
  };

  const esc = (value) => String(value || "Dinosaur").replace(/[<>&"']/g, "");
  const pathFor = (kind) => {
    switch (kind) {
      case "ceratopsian": return '<path d="M180 390c30-115 155-155 275-95l83-62 70 24-32 38 62 34-76 24c15 82-20 145-96 157l-22-85-112 3-15 82-58 0 8-102z"/><path d="M488 267l-28-90 73 71M520 253l17-88 35 99" fill="none" stroke="var(--accent)" stroke-width="18" stroke-linecap="round"/>';
      case "sauropod": return '<path d="M150 430c35-125 188-160 310-91 22-45 12-131 65-211 23-35 73-35 92 0-57 27-55 133-46 232 44 16 71 52 65 97h-62l-17-63-96 27-9 72h-58l-10-70-104-9-26 79h-61l14-83z"/>';
      case "stegosaur": return '<path d="M140 420c18-120 168-179 307-105l102 28 58 48-79 30-19 75h-61l-7-68-126 4-18 64h-59l8-77z"/><path d="M219 315l34-74 28 65 38-92 31 82 45-88 25 102" fill="var(--accent)" stroke="#111827" stroke-width="8"/>';
      case "ankylosaur": return '<path d="M132 421c24-117 171-168 316-100l95 18 67 38-62 29 52 40-69 19-42-44-43 70h-61l-5-65-132 7-21 58h-58l12-73z"/><g fill="var(--accent)"><circle cx="245" cy="319" r="17"/><circle cx="300" cy="297" r="16"/><circle cx="358" cy="294" r="16"/><circle cx="414" cy="312" r="15"/></g>';
      case "spinosaur": return '<path d="M165 432c15-102 120-157 235-112l69-80 67 6 80 45-72 23 47 42-95 17-35 57-18 66h-57l-8-69-105 7-19 62h-56l13-74z"/><path d="M254 320l34-126 42 111 46-146 37 164" fill="var(--accent)" opacity=".8"/>';
      case "pterosaur": return '<path d="M115 330l180-102 88 51 145-115-74 155 128 70-171-14-73 90-48-112-175-23z"/><path d="M377 280l62-80 17 92" fill="var(--accent)"/>';
      case "marine": return '<path d="M104 364c91-121 273-139 414-45l92-42-35 76 53 48-105-6c-115 95-296 84-419-31z"/><path d="M489 343l65-77 5 97M300 402l-29 78 77-60" fill="var(--accent)" opacity=".85"/>';
      case "hadrosaur": return '<path d="M146 422c20-107 155-166 287-106l83-44 72 21 43 54-84 16 28 55-92-10-30 78h-57l-8-68-113 8-21 60h-58l12-73z"/><path d="M512 278c22-52 63-77 104-55-40 6-51 35-43 67" fill="var(--accent)"/>';
      case "pachy": return '<path d="M154 426c25-112 166-169 293-100l69-42 77 21 43 52-81 13 20 53-91-12-28 74h-58l-8-68-112 7-22 61h-57l12-73z"/><ellipse cx="548" cy="295" rx="49" ry="36" fill="var(--accent)"/>';
      case "raptor": return '<path d="M170 426c12-87 104-135 211-102l72-72 70 9 91 54-76 21 42 43-99 9-35 46-13 61h-51l-14-63-91 6-23 57h-50l13-71z"/><path d="M281 438l-25 59 46-22M402 431l19 59 28-48" fill="none" stroke="var(--accent)" stroke-width="13" stroke-linecap="round"/>';
      default: return '<path d="M157 430c15-101 121-157 239-113l67-72 65 6 93 56-76 21 44 42-101 13-34 51-15 62h-55l-10-67-106 7-21 60h-55l13-75z"/><path d="M540 284l68-42-37 72" fill="var(--accent)"/>';
    }
  };

  const art = (name) => {
    const config = species[name] || { kind: "theropod", sky: "#38bdf8", ground: "#365314", body: "#64748b", accent: "#fbbf24" };
    const safe = esc(name);
    return `<figure class="dinosaur-paleoart" style="--body:${config.body};--accent:${config.accent}"><svg viewBox="0 0 760 520" role="img" aria-label="Scientific reconstruction of ${safe}"><defs><linearGradient id="sky-${safe.replace(/\W/g,'')}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${config.sky}"/><stop offset="1" stop-color="#0f172a"/></linearGradient><linearGradient id="body-${safe.replace(/\W/g,'')}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${config.accent}"/><stop offset=".35" stop-color="${config.body}"/><stop offset="1" stop-color="#111827"/></linearGradient><filter id="shadow-${safe.replace(/\W/g,'')}"><feDropShadow dx="0" dy="16" stdDeviation="12" flood-opacity=".45"/></filter></defs><rect width="760" height="520" rx="32" fill="url(#sky-${safe.replace(/\W/g,'')})"/><circle cx="620" cy="105" r="58" fill="#fef3c7" opacity=".75"/><path d="M0 377c110-72 204-51 309-11 126 48 270-21 451-49v203H0z" fill="${config.ground}"/><path d="M0 416c131-45 221-14 326 18 118 36 264-9 434-38v124H0z" fill="#0f172a" opacity=".65"/><g fill="url(#body-${safe.replace(/\W/g,'')})" stroke="#020617" stroke-width="10" stroke-linejoin="round" filter="url(#shadow-${safe.replace(/\W/g,'')})" style="--accent:${config.accent}">${pathFor(config.kind)}</g><text x="42" y="68" fill="#fff" font-size="34" font-family="Arial,sans-serif" font-weight="700">${safe}</text><text x="42" y="104" fill="#dbeafe" font-size="20" font-family="Arial,sans-serif">Paleoart reconstruction</text></svg><figcaption>${safe} · reconstructed prehistoric life</figcaption></figure>`;
  };

  const enhance = () => {
    const heading = [...document.querySelectorAll('h1')].find((node) => /Dinosaur Valley|Valle de dinosaurios/i.test(node.textContent || ''));
    if (!heading) return;
    document.querySelectorAll('.fw-creature-card').forEach((card) => {
      const title = card.querySelector('h3');
      if (!title || card.querySelector('.dinosaur-paleoart')) return;
      const name = (title.textContent || '').trim();
      if (!name || !species[name]) return;
      const first = card.firstElementChild;
      const wrapper = document.createElement('div');
      wrapper.innerHTML = art(name);
      card.insertBefore(wrapper.firstElementChild, first);
      if (first && first.textContent && first.textContent.trim().length <= 4) first.remove();
    });
  };

  const observer = new MutationObserver(enhance);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  addEventListener('DOMContentLoaded', enhance);
  setInterval(enhance, 1200);
})();
