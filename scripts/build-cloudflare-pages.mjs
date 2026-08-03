import { cpSync, existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const web = resolve(root, "web");
const webDist = resolve(web, "dist");
const rootDist = resolve(root, "dist");

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status}`);
  }
}

console.log(`Using Node ${process.version}`);
run("npm", ["ci", "--no-audit", "--no-fund"], web);
run("npm", ["run", "build"], web);

if (!existsSync(webDist)) {
  throw new Error("The web build completed without creating web/dist.");
}

rmSync(rootDist, { recursive: true, force: true });
cpSync(webDist, rootDist, { recursive: true });
console.log("Cloudflare Pages output is available at both web/dist and dist.");
