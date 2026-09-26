import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";

const headers = readFileSync(new URL("../../public/_headers", import.meta.url), "utf8");
const worker = readFileSync(new URL("../../public/sw.js", import.meta.url), "utf8");
const canonical = ["/", "/index.html"];

async function navigation(path: string, contentType = "text/html") {
  const listeners: Record<string, (event: unknown) => void> = {};
  const stored: Array<{ key: string; body: string }> = [];
  let response: Promise<Response> | undefined;
  const origin = "https://example.invalid";
  runInNewContext(worker, {
    URL, Response,
    self: { location: new URL(origin), addEventListener: (name: string, callback: (event: unknown) => void) => { listeners[name] = callback; } },
    fetch: async () => new Response("navigation body", { headers: { "content-type": contentType } }),
    caches: { open: async () => ({ put: async (key: string, body: Response) => { stored.push({ key, body: await body.text() }); } }) },
  });
  listeners.fetch({
    request: { method: "GET", mode: "navigate", url: new URL(path, origin).href },
    respondWith: (value: Promise<Response>) => { response = value; },
  });
  const result = await response;
  expect(await result?.text()).toBe("navigation body");
  return stored;
}

describe("edge-injected analytics and offline shell regression", () => {
  it.each(canonical)("prevents proxy script injection on the canonical HTML entry %s", path => {
    const block = headers.split(/\n\s*\n/).find(block => block.split("\n")[0] === path);
    expect(block, `Missing explicit response policy for ${path}`).toBeDefined();
    expect(block).toMatch(/Cache-Control: public, max-age=0, must-revalidate, no-transform/);
  });
  it.each(canonical)("still refreshes the offline shell from canonical same-origin HTML %s", async path => {
    expect(await navigation(path)).toEqual([{ key: "/index.html", body: "navigation body" }]);
  });
  it.each(["/store", "/store/", "/storehouse", "/unlisted-route", "https://other.invalid/store"])("does not replace the protected offline shell from %s", async path => {
    expect(await navigation(path)).toEqual([]);
  });
  it("does not cache a non-HTML response as the offline application shell", async () => {
    expect(await navigation("/", "application/json")).toEqual([]);
  });
});
