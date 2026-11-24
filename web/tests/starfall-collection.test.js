import { readFileSync, existsSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";

const root = new URL("../public/games/starfall-anglers/", import.meta.url);
const modules = ["waters", "voyage", "dive", "lantern", "legends", "angler-log"]
  .map(name => readFileSync(new URL(name + ".js", root), "utf8")).join("\n");
const {waters, voyage, dive, lantern, legends, log} = runInNewContext(modules +
  "\n;({waters:Waters,voyage:Voyage,dive:Dive,lantern:Lantern,legends:Legends,log:AnglerLog})");

describe("Starfall Anglers collection", () => {
  it("makes all 105 species catchable and keeps their original water and valid artwork", () => {
    expect(new Set(waters.fish.map(f => f.id)).size).toBe(105);
    for (const [place, pool] of waters.pools.entries()) {
      const records = {};
      for (let n=0; n<pool.length+8; n++) {
        const f=waters.choose(place,records,.1,.6,()=>.42);
        log.updateRecord(records,f,f.min);
      }
      expect(Object.keys(records).length).toBe(pool.length);
      expect(dive.school(place, 4).map(s => s.f.id).sort()).toEqual(pool.filter(f=>f.tier!==3).map(f=>f.id).sort());
      for(const f of pool) expect(existsSync(new URL("assets/"+f.id+".png",root))).toBe(true);
    }
    expect(waters.sharks).toHaveLength(6);
    expect(new Set(waters.sharks.map(f=>f.place)).size).toBe(6);
    for(const f of waters.fish.filter(f=>waters.places[f.place].salt)) expect(waters.layerOf(f.id)).toBeGreaterThanOrEqual(0);
  });
  it("provides two complete hunts per water, each with a film and a permanent gift", () => {
    for (const [place, port] of waters.places.entries()) {
      const choices=waters.legends(place);
      expect(choices).toHaveLength(2);
      for(const f of choices) {
        expect(waters.legend(place,f.id).id).toBe(f.id);
        expect(legends.stories[f.id].signs).toHaveLength(3);
        expect(existsSync(new URL("clips/"+f.id+".mp4", root))).toBe(true);
        expect(existsSync(new URL("clips/"+f.id+".webp", root))).toBe(true);
        const saved=waters.clean({records:{[f.id]:{n:1,best:f.min}},charm:f.id,display:[]});
        expect(log.equipped(saved)).toEqual(log.gifts[f.id]);
        expect(voyage.clean({hunts:{[port.id]:f.id}},waters).hunts[port.id]).toBe(f.id);
      }
    }
    expect(waters.clean({charm:"greatwhite",photos:{greatwhite:true}}).charm).toBe(null);
    const fight={tension:1};expect(log.rescue(fight,log.gifts.greatwhite.effects)).toBe(true);
    expect(fight.tension).toBeLessThan(.5);expect(log.rescue(fight,log.gifts.greatwhite.effects)).toBe(false);
    expect(log.sizeRoll(.50,log.gifts.crown.effects)).toBeGreaterThan(.50);
  });
  it("retains every species best and its original date until a heavier catch occurs", () => {
    const f=waters.fish.find(f=>f.id==="greatwhite"),r=waters.clean({records:{greatwhite:{n:2,best:700}}}).records;
    log.updateRecord(r,f,620,100);expect(r[f.id]).toEqual({n:3,best:700});
    expect(log.updateRecord(r,f,802,200)).toEqual({first:false,previous:700,improved:true});
    log.updateRecord(r,f,802,300);
    expect(waters.clean({records:r}).records[f.id]).toEqual({n:5,best:802,bestAt:200});
    expect(r.crown).toBeUndefined();
  });
  it("adds 48 aquarium spaces while keeping older exhibits and personal fish", () => {
    expect(waters.aquariumLimit).toBe(144);
    const save=waters.clean({records:{brook:{n:1,best:1.4}},display:["brook"],fishHomes:{brook:"ice"}});
    expect(waters.fishInTank(save,"ice")).toEqual(["brook"]);
    for(const tank of ["mangrove","trench"]){
      expect(waters.moveFish(save,"brook",tank)).toBe(true);
      expect(waters.fishInTank(waters.clean(save),tank)).toEqual(["brook"]);
      expect(existsSync(new URL("assets/exhibit-"+tank+".webp",root))).toBe(true);
    }
  });
  it("preserves paired tournament draws for matches started before this release", () => {
    const saved=lantern.create(8,"float",true,1234);saved.roster=2;
    const restored=lantern.restore(saved,waters);
    for(let i=0;i<6;i++){
      const old=lantern.round(restored,i);
      const options=waters.pools[8].slice(0,6).filter(f=>f.tier===old.tier);
      expect(waters.cupFish(8,old).id).toBe(options[Math.floor(old.variant*options.length)].id);
    }
    expect(lantern.create(8,"float",true,1234).roster).toBe(4);
  });
});
