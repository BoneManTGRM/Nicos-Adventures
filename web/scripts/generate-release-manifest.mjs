import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const dist = path.join(root, "dist");
const packageJson = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
const PROFILE_SCHEMA = 4;
const SHA_PATTERN = /^[0-9a-f]{40}$/i;

function sha256(value) {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function filesBelow(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return filesBelow(absolute);
    return statSync(absolute).isFile() ? [absolute] : [];
  });
}

function directoryHash(directory, excluded = new Set()) {
  const entries = filesBelow(directory)
    .filter((absolute) => !excluded.has(path.relative(directory, absolute).replaceAll(path.sep, "/")))
    .map((absolute) => {
      const relative = path.relative(directory, absolute).replaceAll(path.sep, "/");
      return `${relative}:${sha256(readFileSync(absolute))}`;
    })
    .sort();
  if (entries.length === 0) throw new Error(`Release hash input is empty: ${directory}`);
  return sha256(entries.join("\n"));
}

function resolveCommitSha() {
  try {
    const gitSha = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (SHA_PATTERN.test(gitSha)) return gitSha.toLowerCase();
  } catch {
    // Source archives can supply the exact checked-out SHA explicitly.
  }
  const candidates = [
    process.env.NICO_COMMIT_SHA,
    process.env.CF_PAGES_COMMIT_SHA,
    process.env.GITHUB_SHA,
    process.env.COMMIT_SHA,
  ];
  for (const candidate of candidates) {
    const normalized = candidate?.trim();
    if (normalized && SHA_PATTERN.test(normalized)) return normalized.toLowerCase();
  }
  throw new Error("Cannot prove the release commit. Provide NICO_COMMIT_SHA or build from a Git checkout.");
}

function expectedReleaseHashes() {
  const serviceWorker = path.join(dist, "sw.js");
  if (!existsSync(serviceWorker)) throw new Error("The production service worker is missing from dist/sw.js");
  return {
    assetManifestHash: directoryHash(path.join(dist, "assets")),
    serviceWorkerHash: sha256(readFileSync(serviceWorker)),
    buildHash: directoryHash(dist, new Set(["release.json"])),
  };
}

export function generateReleaseManifest() {
  if (!existsSync(path.join(dist, "index.html"))) {
    throw new Error("Run the Vite production build before generating release.json");
  }
  const release = {
    appVersion: packageJson.version,
    profileSchema: PROFILE_SCHEMA,
    commitSha: resolveCommitSha(),
    buildTimestamp: new Date().toISOString(),
    ...expectedReleaseHashes(),
  };
  writeFileSync(path.join(dist, "release.json"), `${JSON.stringify(release, null, 2)}\n`, "utf8");
  return release;
}

export function verifyReleaseManifest() {
  const releasePath = path.join(dist, "release.json");
  if (!existsSync(releasePath)) throw new Error("dist/release.json was not generated");
  const release = JSON.parse(readFileSync(releasePath, "utf8"));
  const hashes = expectedReleaseHashes();
  if (release.appVersion !== packageJson.version) throw new Error("release.json appVersion does not match package.json");
  if (release.profileSchema !== PROFILE_SCHEMA) throw new Error("release.json profileSchema is not schema v4");
  if (!SHA_PATTERN.test(release.commitSha)) throw new Error("release.json commitSha is not an exact 40-character Git SHA");
  if (release.commitSha !== resolveCommitSha()) throw new Error("release.json commitSha does not match the checked-out deployment commit");
  if (!Number.isFinite(Date.parse(release.buildTimestamp))) throw new Error("release.json buildTimestamp is not an ISO timestamp");
  for (const [key, expected] of Object.entries(hashes)) {
    if (release[key] !== expected) throw new Error(`release.json ${key} does not match the production output`);
  }
  return release;
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  const release = process.argv.includes("--verify")
    ? verifyReleaseManifest()
    : generateReleaseManifest();
  console.log(`${process.argv.includes("--verify") ? "Verified" : "Generated"} release.json for ${release.commitSha}.`);
}
