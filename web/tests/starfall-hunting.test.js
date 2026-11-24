import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { expect, it } from "vitest";

const source = ["trail-field.js", "trail-hunt.js"].map(file => readFileSync(new URL("../public/games/starfall-anglers/"+file, import.meta.url), "utf8")).join("\n");
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
  expect(log).toEqual({gift:null, rally:{day:"",scores:[],best:0}, region: "canyon", steady: false, records: {fox: {count: 3, best: 94}}});
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

const field = runInNewContext(source + "\nTrailField");

it("restores legendary gifts only for legends already in the trophy journal", () => {
  for (const {id} of field.gifts) {
    const records = {[id]: {count: 2, best: 93}};
    expect(hunt.clean({records}).records[id]).toEqual({count: 2, best: 93});
    expect(hunt.clean({records, gift: id}).gift).toBe(id);
    expect(hunt.clean({records: {}, gift: id}).gift).toBeNull();
  }
});

it("schedules a repeatable route through all three habitats for each local date", () => {
  const routes = new Set();
  for (let date = 1; date <= 30; date++) {
    const day = field.dayKey(new Date(2026, 10, date, 23, 59));
    expect(day).toBe("2026-11-" + String(date).padStart(2,"0"));
    const route = field.rallyTargets(day);
    expect(route).toEqual(field.rallyTargets(day));
    expect(new Set(route.map(i => Math.floor(i/3))).size).toBe(3);
    expect(route.every(i => i % 3 !== 2)).toBe(true);
    routes.add(route.join("-"));
  }
  expect(routes.size).toBeGreaterThan(5);
});

it("resumes a rally, scores each leg once, and retains the highest finished score", () => {
  const day = "2026-11-24", [first, second, third] = field.rallyTargets(day);
  const rally = field.cleanRally({day, best: 275, scores: [78, -1, 90]});
  expect(rally.scores).toEqual([78]);
  expect(field.advanceRally(rally, day, first, 90)).toBe(false);
  expect(field.advanceRally(rally, day, second, 101)).toBe(false);
  expect(field.advanceRally(rally, "2026-11-25", second, 90)).toBe(false);
  expect(field.advanceRally(rally, day, second, 85)).toBe(true);
  const resumed = field.cleanRally(rally);
  expect(field.advanceRally(resumed, day, third, 99)).toBe(true);
  expect(resumed).toEqual({day, scores: [78,85,99], best: 275});
  expect(field.advanceRally(resumed, day, third, 100)).toBe(false);
  const improved = field.cleanRally({day, best: 275, scores: [99,100]});
  expect(field.advanceRally(improved, day, third, 100)).toBe(true);
  expect(improved.best).toBe(299);
});

it("gives all nine animals distinct on-screen paths and reachable binocular sightings", () => {
  const paths = new Set();
  for (let id = 0; id < hunt.animals.length; id++) {
    const positions = Array.from({length: 100}, (_, i) => field.motion(id, i * 113));
    expect(positions.every(p => p.x >= .1 && p.x <= .9 && p.lift >= 0 && p.lift <= 21)).toBe(true);
    paths.add(positions.map(p => p.x.toFixed(3)).join(","));
  }
  expect(paths.size).toBe(9);
  for (let region = 0; region < 3; region++) {
    const sights = field.sightings(region, () => .98);
    expect(new Set(sights.map(s => s.id))).toEqual(new Set([0,1,2].map(i => i+3*region)));
    expect(sights.every(s => s.x >= .22 && s.x <= .78)).toBe(true);
  }
});
