import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const encodedDirectory = join(scriptDirectory, "reference-monsters", "encoded");
const outputDirectory = join(scriptDirectory, "..", "src", "assets", "monsters", "reference");

const rows = [
  {
    output: "reference-monsters-row-1.webp",
    sha256: "aa113f3cbda32f0b4c30df23a1021a3436a749dd0c2db6fa2baa485891f02772",
    parts: ["row-1.part-01.b64", "row-1.part-02.b64", "row-1.part-03.b64"],
  },
  {
    output: "reference-monsters-row-2.webp",
    sha256: "03606843e3e8ab4c7b88a4db0b4d0c0a499bfe9f3e40de335ef5ac07437cf495",
    parts: ["row-2.part-01.b64", "row-2.part-02.b64", "row-2.part-03.b64"],
  },
  {
    output: "reference-monsters-row-3.webp",
    sha256: "6cf82039367a95ce6c005073591eecfde58b1b21f496dd275515668939853453",
    parts: ["row-3.part-01.b64", "row-3.part-02.b64", "row-3.part-03.b64"],
  },
  {
    output: "reference-monsters-row-4.webp",
    sha256: "7a5569a72a018c37e0202b82c14d5d1f53560ea63cebcf2b9a0a21d950408bc6",
    parts: ["row-4.fixed-01.b64", "row-4.fixed-02.b64", "row-4.part-02.b64", "row-4.part-03.b64"],
  },
];

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function readEncoded(parts) {
  return parts.map((part) => {
    const path = join(encodedDirectory, part);
    if (!existsSync(path)) throw new Error(`Missing encoded Monster Lab asset chunk: ${part}`);
    return readFileSync(path, "utf8").replace(/\s+/g, "");
  }).join("");
}

function assertWebp(bytes, output) {
  if (bytes.length < 12 || bytes.subarray(0, 4).toString("ascii") !== "RIFF" || bytes.subarray(8, 12).toString("ascii") !== "WEBP") {
    throw new Error(`${output} did not reconstruct as a valid WebP file.`);
  }
}

mkdirSync(outputDirectory, { recursive: true });
let changed = 0;

for (const row of rows) {
  const bytes = Buffer.from(readEncoded(row.parts), "base64");
  assertWebp(bytes, row.output);

  const digest = sha256(bytes);
  if (digest !== row.sha256) {
    throw new Error(`${row.output} checksum mismatch: expected ${row.sha256}, received ${digest}.`);
  }

  const outputPath = join(outputDirectory, row.output);
  const current = existsSync(outputPath) ? readFileSync(outputPath) : null;
  if (!current || !current.equals(bytes)) {
    writeFileSync(outputPath, bytes);
    changed += 1;
  }
}

console.log(`Approved Monster Lab artwork ready: ${rows.length} sprite rows (${changed} updated).`);
