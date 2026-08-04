import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const parts = Array.from({ length: 6 }, (_, index) =>
  path.join(root, `public/assets/nico/photo/nico-photo-body.part${index + 1}.b64`),
);

for (const file of parts) {
  if (!fs.existsSync(file)) throw new Error(`Missing Nico photo chunk: ${path.basename(file)}`);
}

const encoded = parts.map((file) => fs.readFileSync(file, "utf8").replace(/\s+/g, "")).join("");
if (encoded.length !== 110_880) throw new Error(`Nico photo base64 length mismatch: ${encoded.length}`);

const bytes = Buffer.from(encoded, "base64");
if (bytes.length !== 83_160) throw new Error(`Nico photo byte length mismatch: ${bytes.length}`);
if (bytes.subarray(0, 4).toString("ascii") !== "RIFF" || bytes.subarray(8, 12).toString("ascii") !== "WEBP") {
  throw new Error("Nico photo asset is not a valid WebP RIFF container");
}

const digest = crypto.createHash("sha256").update(bytes).digest("hex");
const expected = "502d8ea9c01fac8caff92119f515f9fac588992279e28c5d588020e5d7f39b01";
if (digest !== expected) throw new Error(`Nico photo SHA-256 mismatch: ${digest}`);

console.log(`Nico photo asset validation passed: ${bytes.length} bytes, SHA-256 ${digest}.`);
