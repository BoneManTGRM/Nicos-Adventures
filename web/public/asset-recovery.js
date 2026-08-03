(() => {
  const fallback = (name) => {
    const safe = String(name || "Wildlife photo").replace(/[<>&"']/g, "");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#0b2a55"/><stop offset="1" stop-color="#07142d"/></linearGradient><radialGradient id="r"><stop stop-color="#22d3ee" stop-opacity=".32"/><stop offset="1" stop-color="#22d3ee" stop-opacity="0"/></radialGradient></defs><rect width="1200" height="700" fill="url(#g)"/><circle cx="600" cy="320" r="260" fill="url(#r)"/><g fill="none" stroke="#67e8f9" stroke-width="18" stroke-linecap="round" opacity=".7"><path d="M410 380c70-150 310-150 380 0"/><circle cx="505" cy="300" r="42"/><circle cx="695" cy="300" r="42"/><path d="M520 455c55 42 105 42 160 0"/></g><text x="600" y="585" fill="#e0f2fe" font-size="48" font-family="Arial,sans-serif" text-anchor="middle">${safe}</text><text x="600" y="640" fill="#94a3b8" font-size="28" font-family="Arial,sans-serif" text-anchor="middle">Wildlife image temporarily unavailable</text></svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };

  const verifiedSources = {
    "jaguar": "https://upload.wikimedia.org/wikipedia/commons/0/0a/Standing_jaguar.jpg",
    "red panda": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Red_Panda%2C_Gentle_Tree-Dweller_of_the_Himalayas.jpg/1280px-Red_Panda%2C_Gentle_Tree-Dweller_of_the_Himalayas.jpg",
    "platypus": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Duck-billed_platypus_%28Ornithorhynchus_anatinus%29_Scottsdale.jpg/1280px-Duck-billed_platypus_%28Ornithorhynchus_anatinus%29_Scottsdale.jpg",
    "yak": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Sarlyk_Yak2.jpg/1280px-Sarlyk_Yak2.jpg"
  };

  const focalPoints = {
    camel: "50% 36%",
    "andean condor": "50% 28%",
    "mountain goat": "50% 32%",
    beaver: "50% 36%",
    "snow leopard": "50% 30%",
    platypus: "50% 42%",
    yak: "50% 42%",
    "red panda": "50% 38%",
    jaguar: "50% 36%"
  };

  const ignoresRecovery = (img) => img.dataset.assetRecovery === "ignore";
  const animalName = (img) => (img.alt || img.closest("figure")?.querySelector("figcaption")?.textContent || "").toLowerCase().trim();

  const tune = (img) => {
    if (!(img instanceof HTMLImageElement) || ignoresRecovery(img)) return;
    const alt = animalName(img);
    const focal = Object.entries(focalPoints).find(([key]) => alt.includes(key));
    if (focal) img.style.objectPosition = focal[1];
    img.decoding = "async";
    img.referrerPolicy = "no-referrer";
    const verified = Object.entries(verifiedSources).find(([key]) => alt.includes(key));
    if (verified && img.dataset.verifiedSource !== verified[0]) {
      img.dataset.verifiedSource = verified[0];
      img.dataset.recovered = "false";
      img.src = verified[1];
    }
  };

  document.addEventListener("error", (event) => {
    const img = event.target;
    if (!(img instanceof HTMLImageElement) || ignoresRecovery(img)) return;
    const alt = animalName(img);
    const verified = Object.entries(verifiedSources).find(([key]) => alt.includes(key));
    if (verified && img.dataset.verifiedRetry !== "true") {
      img.dataset.verifiedRetry = "true";
      img.removeAttribute("srcset");
      img.src = verified[1];
      return;
    }
    if (img.dataset.recovered === "true") return;
    img.dataset.recovered = "true";
    img.removeAttribute("srcset");
    img.src = fallback(img.alt);
    img.classList.add("image-recovered");
  }, true);

  const observer = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches("img")) tune(node);
        node.querySelectorAll?.("img").forEach(tune);
      }
    }
  });

  window.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("img").forEach(tune);
    observer.observe(document.documentElement, { childList: true, subtree: true });
  });
})();
