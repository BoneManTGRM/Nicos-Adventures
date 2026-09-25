import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";
const root = path.resolve(import.meta.dirname, "../dist");
const catalog = JSON.parse(readFileSync(path.join(root, "store-catalog.json"), "utf8"));
assert.equal(catalog.version, 1);
for (const product of catalog.products) {
  assert.equal(product.publication, "published");
  for (const photo of product.photos) {
    assert.match(photo.src, /^\/store-images\/[a-f0-9]{24}\.webp$/);
    assert.ok(existsSync(path.join(root, photo.src.slice(1))));
  }
}
const manifest = JSON.parse(readFileSync(path.join(root, "offline-assets.json"), "utf8"));
assert.ok(!manifest.assets.some(url => url.includes("store-catalog") || url.includes("/store-images/")));
assert.ok(!existsSync(path.join(root, "store/catalog.json")));
assert.ok(!existsSync(path.join(root, "test-fixtures")));
const walk = directory => readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
for (const file of walk(root).filter(file => /\.(?:js|css|map|json|html)$/.test(file))) {
  assert.doesNotMatch(readFileSync(file, "utf8"), /TEST-ONLY SYNTHETIC SELLER|DO_NOT_EMIT_PRIVATE_SENTINEL|orders@example\.invalid|test-fixtures\/store/, `Test data leaked into ${path.relative(root, file)}`);
}
const chunks = readdirSync(path.join(root, "assets"));
for (const [extension, budget] of [["js", 22000], ["css", 4000]]) {
  const files = chunks.filter(file => new RegExp(`^StorePage-[^.]+\\.${extension}$`).test(file));
  assert.equal(files.length, 1, `Expected one lazy store ${extension} chunk`);
  const bytes = gzipSync(readFileSync(path.join(root, "assets", files[0]))).length;
  assert.ok(bytes <= budget, `Store ${extension} exceeds ${budget} gzip bytes: ${bytes}`);
  console.log(`Store ${extension}: ${bytes} bytes gzip (budget ${budget}).`);
}
console.log(`Public store output verified: ${catalog.products.length} published products; salesEnabled=${catalog.salesEnabled}.`);
