import { readFileSync, existsSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";

const root = new URL("../public/games/starfall-anglers/", import.meta.url);
const modules = ["waters", "voyage", "dive", "lantern", "legends", "angler-log"]
  .map(name => readFileSync(new URL(name + ".js", root), "utf8")).join("\n");
const {waters, voyage, dive, lantern, legends, log} = runInNewContext(modules +
  "\n;({waters:Waters,voyage:Voyage,dive:Dive,lantern:Lantern,legends:Legends,log:AnglerLog})");

describe("Starfall Anglers collection", () => {
  it("makes all 129 species catchable and keeps their original water and valid artwork", () => {
    expect(new Set(waters.fish.map(f => f.id)).size).toBe(129);
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
  it("can keep each new catch, feed it individually, and retain its record after release", () => {
    const additions=waters.fish.slice(105);
    expect(additions).toHaveLength(24);
    expect(additions.filter(f=>waters.places[f.place].salt)).toHaveLength(12);
    expect(new Set(additions.map(f=>f.place)).size).toBe(10);
    for(const f of additions){
      expect([...f.name,...f.note].every(label=>label.trim().length>0)).toBe(true);
      const save=waters.clean({records:{brook:{n:2,best:1.4}}});
      log.updateRecord(save.records,f,f.min,100);
      log.updateRecord(save.records,f,f.max,200);
      const tank=waters.places[f.place].salt?"reef":"fresh";
      const [first,second]=waters.specimens(f.id,save.records,save.photos);
      expect(waters.setExhibited(save,first,false,true,tank)).toBe(true);
      expect(waters.setExhibited(save,second,false,true,tank)).toBe(true);
      save.care[second]={meals:1,name:"Pepita"};
      expect(waters.setExhibited(save,first,false,false,tank)).toBe(true);
      const restored=waters.clean(save);
      expect(waters.fishInTank(restored,tank)).toEqual([second]);
      expect(restored.care[second]).toMatchObject({meals:1,name:"Pepita"});
      expect(restored.records[f.id]).toEqual({n:2,best:f.max,bestAt:200});
      expect(restored.records.brook).toMatchObject({n:2,best:1.4});
    }
  });
  it("preserves paired tournament draws on each saved roster and uses the full roster for new matches", () => {
    const newMatch=lantern.create(8,"float",true,1234);
    expect(newMatch.roster).toBe(5);
    for(const [roster,size] of [[2,6],[3,95],[4,105],[5,129]]){
      const match=lantern.restore({...newMatch,roster},waters);
      expect(match.roster).toBe(roster);
      for(let place=0; place<waters.places.length; place++){
        const pool=roster===2 ? waters.pools[place].slice(0,size) : waters.fish.slice(0,size).filter(f=>f.place===place);
        for(let tier=0; tier<3; tier++){
          const options=pool.filter(f=>f.tier===tier);
          for(const [index,f] of options.entries()){
            const variant=(index+.5)/options.length;
            expect(waters.cupFish(place,{roster:match.roster,tier,variant}).id).toBe(f.id);
          }
        }
      }
    }
  });
});
