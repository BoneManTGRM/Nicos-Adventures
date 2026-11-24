import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { expect, it } from "vitest";

const source = readFileSync(new URL("../public/games/starfall-anglers/trail-hunt.js", import.meta.url), "utf8");
const hunt = runInNewContext(source + "\nTrailHunt");

it("unlocks each legend only through the two animals from its own habitat", () => {
  const {records} = hunt.clean();
  for (const index of [2, 5, 8]) {
    expect(hunt.unlocked(index, records)).toBe(false);
    hunt.record(records, hunt.animals[index - 1][0], 84);
    expect(hunt.unlocked(index, records)).toBe(false);
    hunt.record(records, hunt.animals[index - 2][0], 100);
    expect(hunt.unlocked(index, records)).toBe(true);
  }
});

it("restores known animals, keeps the high score and counts repeat tags", () => {
  const old = {region: "canyon", steady: false, records: {fox: {count: 3, best: 94}, hare: {count: -1, best: 75}, goblin: {count: 1, best: 88}}};
  const log = hunt.clean(old);
  expect(log).toEqual({region: "canyon", steady: false, records: {fox: {count: 3, best: 94}}});
  expect(hunt.record(log.records, "fox", 70)).toBe(false);
  expect(hunt.record(log.records, "fox", 99)).toBe(true);
  expect(hunt.clean(log).records.fox).toEqual({count: 5, best: 99});
  expect(hunt.clean({region: "unknown"}).region).toBe("forest");
});

it("shows two to four distinct successive trail marks for each hunt difficulty", () => {
  for (let i=0; i<hunt.animals.length; i++) {
    for (const r of [0, .49, .99]) {
      const sequence=hunt.makeTrail(i,()=>r);
      expect(sequence).toHaveLength(2+i%3);
      expect(sequence.every((mark,j)=>mark>=0&&mark<3&&mark!==sequence[j-1])).toBe(true);
    }
  }
});
