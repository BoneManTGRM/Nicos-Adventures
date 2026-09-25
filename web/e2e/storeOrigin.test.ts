import { expect, it } from "vitest";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { startStoreOrigin } from "./storeOrigin";

it("test-owned origin serves disk artifacts and becomes genuinely unreachable after stop", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "store-origin-harness-"));
  await writeFile(path.join(root, "index.html"), "<h1>TEST DISK ARTIFACT</h1>");
  await writeFile(path.join(root, "sw.js"), "/* TEST WORKER FILE */");
  const origin = await startStoreOrigin(root);
  try {
    expect(await (await fetch(`${origin.url}/store`)).text()).toContain("TEST DISK ARTIFACT");
    const worker = await fetch(`${origin.url}/sw.js`);
    expect(worker.headers.get("content-type")).toBe("application/javascript");
    expect(await worker.text()).toBe("/* TEST WORKER FILE */");
    expect((await fetch(`${origin.url}/missing.json`)).status).toBe(404);
    await origin.stop();
    expect(origin.listening()).toBe(false);
    await expect(fetch(`${origin.url}/store`)).rejects.toThrow();
  } finally { await origin.stop(); await rm(root, { recursive: true, force: true }); }
});
