import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { expect, it } from "vitest";

const source = ["expedition-photo.js","expedition.js"].map(file =>
  readFileSync(new URL("../public/games/starfall-anglers/" + file, import.meta.url), "utf8")
).join("\n");
const {game, camera} = runInNewContext(source + "\n({game: StarExpedition, camera: ExpeditionPhoto})");
const pose = {x: .45, y: .57, flip: false, glow: true};
const perfect = camera.capture(pose, .45);

it("uses both independent clues and the regional song before a guardian photo can unlock a seal", () => {
  const data = game.clean();
  for (const [region, route] of game.routes.entries()) {
    expect(game.keep(data, region, perfect)).toBe(false);
    expect(game.noteClue(data, region, 1)).toBe(true);
    expect(game.noteClue(data, region, 1)).toBe(false);
    expect(game.light(data, region, route.order)).toBe(false);
    expect(game.noteClue(data, region, 0)).toBe(true);
    expect(game.light(data, region, [...route.order].reverse())).toBe(false);
    expect(game.light(data, region, route.order)).toBe(true);
    expect(game.keep(data, 3, perfect)).toBe(false);
    expect(game.keep(data, region, perfect)).toBe(true);
  }
  expect(game.seals(data)).toBe(3);
  expect(game.keep(data, 3, perfect)).toBe(true);
  expect(game.clean(JSON.parse(JSON.stringify(data)))).toEqual(data);
});

it("retains the best composition, and derives the rating from the position and pose", () => {
  expect(camera.capture(pose, .9)).toBeNull();
  const one = camera.capture(pose, .6);
  expect(one.stars).toBe(1);
  expect(camera.capture({...pose, glow: false}, .48).stars).toBe(2);
  const data = game.clean({clues: [3], lit: [true]});
  expect(game.keep(data, 0, one)).toBe(true);
  expect(game.keep(data, 0, perfect)).toBe(true);
  expect(game.keep(data, 0, one)).toBe(false);
  expect(data.photos[0]).toEqual(perfect);
  expect(camera.clean({...one, stars: 500})).toEqual(one);
  expect(camera.clean({...one, x: NaN})).toBeNull();
});

it("opens an older save and excludes incomplete encounters from a partially damaged album", () => {
  const legacy = game.clean({region: "canyon", records: {fox: {count: 4, best: 98}}});
  expect(legacy.region).toBe(0);
  expect(legacy.photos).toEqual([null,null,null,null]);
  const partial = game.clean({clues:[1,3,3], lit:[true,true,true], wisps:[true,0,true], seen:[0,2,3], photos:[perfect,perfect,perfect,perfect]});
  expect(game.seals(partial)).toBe(2);
  expect(partial.photos[3]).toBeNull();
  expect(game.gold(partial)).toBe(false);
  partial.wisps[1]=true;
  expect(game.gold(partial)).toBe(true);
});

it("keeps every guardian in the camera range and provides an accessible still pose", () => {
  for (let i=0; i<4; i++) {
    const positions = Array.from({length:100}, (_,n)=>camera.moment(i,n*100,false));
    expect(positions.every(p=>p.x>=.1&&p.x<=.9&&p.y>=.3&&p.y<=.8)).toBe(true);
    expect(positions.some(p=>!p.glow)).toBe(true);
    expect(camera.capture(camera.moment(i,500,true),.5).stars).toBe(3);
  }
});
