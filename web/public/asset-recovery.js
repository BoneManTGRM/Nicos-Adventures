(() => {
  const fallback = (name) => {
    const safe = String(name || "Wildlife photo").replace(/[<>&"']/g, "");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#0b2a55"/><stop offset="1" stop-color="#07142d"/></linearGradient><radialGradient id="r"><stop stop-color="#22d3ee" stop-opacity=".32"/><stop offset="1" stop-color="#22d3ee" stop-opacity="0"/></radialGradient></defs><rect width="1200" height="700" fill="url(#g)"/><circle cx="600" cy="320" r="260" fill="url(#r)"/><g fill="none" stroke="#67e8f9" stroke-width="18" stroke-linecap="round" opacity=".7"><path d="M410 380c70-150 310-150 380 0"/><circle cx="505" cy="300" r="42"/><circle cx="695" cy="300" r="42"/><path d="M520 455c55 42 105 42 160 0"/></g><text x="600" y="585" fill="#e0f2fe" font-size="48" font-family="Arial,sans-serif" text-anchor="middle">${safe}</text><text x="600" y="640" fill="#94a3b8" font-size="28" font-family="Arial,sans-serif" text-anchor="middle">Wildlife image temporarily unavailable</text></svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };

  const ignoresRecovery = (img) => img.dataset.assetRecovery === "ignore";
  const eligible = (img) => img instanceof HTMLImageElement
    && !ignoresRecovery(img)
    && img.dataset.recoverable === "wildlife";

  const tune = (img) => {
    if (!eligible(img)) return;
    img.decoding = "async";
    img.referrerPolicy = "no-referrer";
  };

  document.addEventListener("error", (event) => {
    const img = event.target;
    if (!eligible(img) || img.dataset.recovered === "true") return;
    img.dataset.recovered = "true";
    img.removeAttribute("srcset");
    img.src = fallback(img.alt);
    img.classList.add("image-recovered");
  }, true);

  const scan = (root = document) => root.querySelectorAll?.('img[data-recoverable="wildlife"]').forEach(tune);
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches('img[data-recoverable="wildlife"]')) tune(node);
        scan(node);
      }
    }
  });

  window.addEventListener("DOMContentLoaded", () => {
    scan();
    observer.observe(document.documentElement, { childList: true, subtree: true });
  });
})();
