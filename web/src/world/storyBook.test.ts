import { describe, expect, it } from "vitest";
import type { StoryRecord } from "../types";
import { buildStoryPages, storyCombinationCount, storyPages } from "./storyBook";

const story: StoryRecord = {
  id: "story-1",
  title: "The Test",
  hero: "Nico",
  companion: "BoltBot",
  place: "a moon base",
  problem: "the stars went quiet",
  ending: "everyone celebrated",
  theme: "Friendship",
  magicItem: "a star lantern",
  specialDetail: "A purple comet drew an arrow",
  language: "en",
};

describe("multi-page Story Castle books", () => {
  it("builds a six-page story from user choices", () => {
    const pages = buildStoryPages(story);
    expect(pages).toHaveLength(6);
    expect(pages.join(" ")).toContain("Nico");
    expect(pages.join(" ")).toContain("BoltBot");
    expect(pages.join(" ")).toContain("purple comet");
  });

  it("offers an extensive combination range and preserves saved pages", () => {
    expect(storyCombinationCount).toBeGreaterThan(30_000);
    expect(storyPages({ ...story, pages: ["Saved page"] })).toEqual(["Saved page"]);
  });
});
