import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
import {expect,it} from "vitest";

const source=["waters","bluewater"].map(name=>readFileSync(new URL("../public/games/starfall-anglers/"+name+".js",import.meta.url),"utf8")).join("\n");
const {world,expansion}=runInNewContext(source+"\n;({world: Waters, expansion: Bluewater})");

it("restores discoveries without activating undiscovered secret grounds",()=>{
  expect(expansion.clean().active).toBe(null);
  expect(expansion.clean({active:2,marks:[true]}).active).toBe(null);
  expect(expansion.clean({active:2,marks:[false,false,true]}).active).toBe(2);
});

it("gives each secret ground a fishing pool and keeps its effect local",()=>{
  for(const [i,site] of expansion.sites.entries()){
    const state=expansion.clean({active:i,marks:[true,true,true]});
    const f=world.pools[site.port][0];
    expect(site.fish).toContain(expansion.visitCandidate(f,site.port,state,false,()=>0).id);
    expect(expansion.visitCandidate(f,(site.port+1)%10,state,false,()=>0)).toBe(f);
  }
});

it("matches active retrieves to fish and gives the shark, marlin and eel different counters",()=>{
  const f=id=>world.fish.find(item=>item.id===id);
  expect(new Set(["greatwhite","marlin","prismeel"].map(id=>expansion.signature(f(id)))).size).toBe(3);
  for(let gear=0;gear<3;gear++){
    const result=expansion.visitCandidate(f("brook"),0,expansion.clean({gear}),true,()=>0);
    expect(expansion.technique(result)).toBe(gear);
  }
});
