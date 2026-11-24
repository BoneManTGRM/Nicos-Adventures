import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const directory = join(import.meta.dirname, "../dist/games/starfall-anglers");
const entry = join(directory, "index.html");
const source = readFileSync(entry, "utf8");

// Publish the small, ordered classic scripts and stylesheet in the document.
// A phone can start playing as soon as the HTML arrives, even if subsequent
// stylesheet or script requests fail. The source modules remain independently testable.
const page = source.replace(/<link rel="stylesheet" href="([^"]+)">/g, (_, file) =>
  "<style>\n" + readFileSync(join(directory, file), "utf8") + "\n</style>")
  .replace(/<script src="([\w-]+\.js)" defer><\/script>/g, (_, file) =>
    "<script>\n" + readFileSync(join(directory, file), "utf8").replace(/<\/script/gi, "<\\/script") + "\n</script>");
if (!page.includes("<style>") || !page.includes("<script>") || /<script\b[^>]*\bsrc=|<link\b[^>]*rel="stylesheet"/i.test(page)) {
  throw new Error("Incomplete Starfall Anglers startup document");
}
writeFileSync(entry, page);
