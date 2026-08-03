import fs from "node:fs";
import path from "node:path";

const webRoot = path.resolve(import.meta.dirname, "..");
const repositoryRoot = path.resolve(webRoot, "..");
const redirectsPath = path.join(webRoot, "public", "_redirects");
const wranglerPath = path.join(repositoryRoot, "wrangler.jsonc");

const redirects = fs.readFileSync(redirectsPath, "utf8");
const wrangler = fs.readFileSync(wranglerPath, "utf8");

const hasSpaAssetFallback = wrangler.includes('"not_found_handling": "single-page-application"');
const hasCatchAllIndexRewrite = redirects
  .split(/\r?\n/)
  .map((line) => line.trim())
  .some((line) => /^\/\*\s+\/index\.html\s+200(?:\s|$)/.test(line));

if (hasSpaAssetFallback && hasCatchAllIndexRewrite) {
  throw new Error(
    "Invalid Cloudflare routing: wrangler.jsonc already enables SPA fallback, so `/* /index.html 200` would create an infinite redirect loop.",
  );
}

if (!redirects.includes("/assets/nico/nico-fullbody.b64 /assets/nico/nico-guide-art.b64 200")) {
  throw new Error("The local Nico artwork compatibility rewrite is missing.");
}

console.log("Cloudflare routing validation passed.");
