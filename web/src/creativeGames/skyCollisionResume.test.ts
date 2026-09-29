import {describe,it,expect} from 'vitest';
import {makeDrive,stepDrive,terrainAt,carStats} from './carPhysics';
import {STARTER_BUILD,STARTER_PARTS,normalizeDrive} from './save';
import {drawSkyObjects} from './skyArt';
const idle={gas:false,brake:false,tool:false};
function fixture(){const x=4450,r=makeDrive(STARTER_BUILD);Object.assign(r,{x,y:280,distance:(x-90)/12,vx:0,contacts:2});r.sky!.nextDistance=10000;r.sky!.spawnCount=1;r.sky!.active={id:1,kind:0,phase:'warning',x,y:-20,vy:80,radius:22,age:0,hit:false};return r;}
describe('full warning and resume collision scenarios',()=>{
 it('keeps an unpowered fixture on flat ground until the real warned impact',()=>{
  let r=fixture();const s=carStats(r.build);expect(terrainAt(r.x-s.width-s.radius)).toBe(330);expect(terrainAt(r.x+s.width+s.radius)).toBe(330);
  for(let i=0;i<18;i++)stepDrive(r,idle);
  const target=r.sky!.active!.x;r=normalizeDrive(JSON.parse(JSON.stringify(r)),STARTER_PARTS)!;
  for(let i=0;i<336;i++)stepDrive(r,idle);
  expect(Math.abs(r.x-target)).toBeLessThan(1);expect(r.sky!.hits).toBe(1);expect(r.sky!.dodged).toBe(0);expect(r.broken).toEqual([13]);expect(r.debris.map(d=>d.id)).toEqual([91]);
 });
 it('allows acceleration to escape that same fixed target without damage',()=>{
  const r=fixture();for(let i=0;i<18;i++)stepDrive(r,idle);for(let i=0;i<384;i++)stepDrive(r,{...idle,gas:i<360});
  expect(r.sky!.hits).toBe(0);expect(r.sky!.dodged).toBe(1);expect(r.broken).toEqual([]);
 });
 it('keeps a directional marker for a falling object outside the phone view without mutating state',()=>{
  const r=makeDrive(STARTER_BUILD),texts:string[]=[];r.sky!.active={id:1,kind:0,phase:'falling',x:1000,y:100,vy:200,radius:22,age:.3,hit:false};const before=structuredClone(r);
  const target:Record<string,unknown>={fillText:(text:string)=>texts.push(text)};
  const c=new Proxy(target,{get:(object,key)=>key in object?object[String(key)]:(()=>{})}) as unknown as CanvasRenderingContext2D;
  drawSkyObjects(c,r,400,400,true);expect(texts).toContain('→');expect(r).toEqual(before);
 });
});
