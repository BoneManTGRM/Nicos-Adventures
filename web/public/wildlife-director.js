(() => {
  const articleByLabel = {
    "Jaguar": "Panthera_onca",
    "Toucan": "Toco_toucan",
    "Sloth": "Brown-throated_sloth",
    "Poison Dart Frog": "Dyeing_poison_dart_frog",
    "Blue Whale": "Blue_whale",
    "Giant Pacific Octopus": "Giant_Pacific_octopus",
    "Sea Turtle": "Green_sea_turtle",
    "Manta Ray": "Giant_oceanic_manta_ray",
    "Lion": "Lion",
    "African Elephant": "African_bush_elephant",
    "Giraffe": "Giraffe",
    "Meerkat": "Meerkat",
    "Polar Bear": "Polar_bear",
    "Arctic Fox": "Arctic_fox",
    "Emperor Penguin": "Emperor_penguin",
    "Walrus": "Walrus",
    "Fennec Fox": "Fennec_fox",
    "Camel": "Dromedary",
    "Roadrunner": "Greater_roadrunner",
    "Gila Monster": "Gila_monster",
    "Red Panda": "Red_panda",
    "Flying Squirrel": "Southern_flying_squirrel",
    "Great Horned Owl": "Great_horned_owl",
    "Beaver": "North_American_beaver",
    "Axolotl": "Axolotl",
    "Capybara": "Capybara",
    "Flamingo": "Greater_flamingo",
    "Platypus": "Platypus",
    "Snow Leopard": "Snow_leopard",
    "Mountain Goat": "Mountain_goat",
    "Andean Condor": "Andean_condor",
    "Yak": "Domestic_yak"
  };

  const focalPoints = {
    "Blue Whale": "50% 48%",
    "Giant Pacific Octopus": "50% 52%",
    "Manta Ray": "50% 52%",
    "African Elephant": "50% 38%",
    "Giraffe": "50% 28%",
    "Polar Bear": "50% 38%",
    "Camel": "50% 38%",
    "Flying Squirrel": "50% 38%",
    "Beaver": "50% 42%",
    "Platypus": "50% 44%",
    "Snow Leopard": "50% 38%",
    "Mountain Goat": "50% 38%",
    "Andean Condor": "50% 34%",
    "Yak": "50% 40%",
    "Red Panda": "50% 34%"
  };

  const nativeFetch = window.fetch.bind(window);
  const summaryPrefix = "https://en.wikipedia.org/api/rest_v1/page/summary/";
  const labelFromRequestedTitle = (rawTitle) => {
    const decoded = decodeURIComponent(rawTitle).replaceAll("_", " ").toLowerCase();
    return Object.keys(articleByLabel).find((label) => label.toLowerCase() === decoded) || null;
  };

  window.fetch = async (input, init) => {
    const requestUrl = typeof input === "string" ? input : input instanceof Request ? input.url : String(input);
    if (!requestUrl.startsWith(summaryPrefix)) return nativeFetch(input, init);
    const requestedTitle = requestUrl.slice(summaryPrefix.length).split(/[?#]/)[0];
    const label = labelFromRequestedTitle(requestedTitle);
    const article = label ? articleByLabel[label] : requestedTitle;
    const response = await nativeFetch(`${summaryPrefix}${article}`, { ...init, cache: "no-store" });
    if (!response.ok) return response;
    const data = await response.json();
    const source = data?.thumbnail?.source || data?.originalimage?.source || "";
    const normalized = source ? source.replace(/\/\d+px-/, "/960px-") : "";
    const body = JSON.stringify({
      ...data,
      originalimage: normalized ? { source: normalized } : undefined,
      thumbnail: normalized ? { source: normalized } : data?.thumbnail
    });
    return new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
    });
  };

  const fallbackSvg = (name) => {
    const safe = String(name || "Wildlife").replace(/[<>&"']/g, "");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#0f4c5c"/><stop offset="1" stop-color="#07142d"/></linearGradient></defs><rect width="1200" height="700" fill="url(#g)"/><circle cx="600" cy="300" r="220" fill="#22d3ee" opacity=".14"/><path d="M390 400c90-165 330-165 420 0" fill="none" stroke="#67e8f9" stroke-width="22" stroke-linecap="round"/><circle cx="505" cy="300" r="42" fill="none" stroke="#67e8f9" stroke-width="18"/><circle cx="695" cy="300" r="42" fill="none" stroke="#67e8f9" stroke-width="18"/><path d="M510 470c62 44 118 44 180 0" fill="none" stroke="#67e8f9" stroke-width="18" stroke-linecap="round"/><text x="600" y="590" text-anchor="middle" fill="#e0f2fe" font-family="Arial,sans-serif" font-size="48" font-weight="700">${safe}</text><text x="600" y="642" text-anchor="middle" fill="#94a3b8" font-family="Arial,sans-serif" font-size="27">Wildlife image unavailable</text></svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };

  const tune = (img) => {
    if (!(img instanceof HTMLImageElement)) return;
    const label = img.alt?.trim();
    if (!label || !articleByLabel[label]) return;
    img.referrerPolicy = "no-referrer";
    img.decoding = "async";
    img.style.objectPosition = focalPoints[label] || "50% 40%";
    img.dataset.wildlifeManaged = "true";
  };

  document.addEventListener("error", (event) => {
    const img = event.target;
    if (!(img instanceof HTMLImageElement) || img.dataset.wildlifeManaged !== "true") return;
    if (img.dataset.finalFallback === "true") return;
    img.dataset.finalFallback = "true";
    img.removeAttribute("srcset");
    img.src = fallbackSvg(img.alt);
  }, true);

  const scan = (root = document) => root.querySelectorAll?.("img").forEach(tune);
  const observer = new MutationObserver((records) => {
    records.forEach((record) => record.addedNodes.forEach((node) => {
      if (!(node instanceof Element)) return;
      if (node.matches("img")) tune(node);
      scan(node);
    }));
  });

  addEventListener("DOMContentLoaded", () => {
    scan();
    observer.observe(document.documentElement, { childList: true, subtree: true });
  });
})();
