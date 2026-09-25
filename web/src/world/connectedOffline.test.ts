import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

const worker=readFileSync(new URL('../../public/sw.js',import.meta.url),'utf8');
// Frozen production release b2eff7a. Changing JS chunks without changing the worker
// leaves returning browsers on the old precache, even after registration.update().
const previousCache='nicos-world-static-v25';
const previousHash='61d686f4bb77951aa44f52de964d30ce989b6621ef30fbe603b1d10454da8084';
const currentAssets=['/assets/JourneyMenu-current.js','/assets/JourneyMenu-current.css','/assets/ArtStudio-current.js'];
async function lifecycle() {
 const handlers:Record<string,(event:{waitUntil:(promise:Promise<unknown>)=>void})=>void>={};
 const caches=new Map<string,string[]>([[previousCache,['/assets/old.js']]]);
 let installedCache='';
 runInNewContext(worker,{
  URL,Response,
  self:{location:new URL('https://example.invalid'),addEventListener:(name:string,handler:typeof handlers[string])=>{handlers[name]=handler;},skipWaiting:()=>{},clients:{claim:()=>{}}},
  fetch:async()=>new Response(JSON.stringify({assets:currentAssets}),{headers:{'content-type':'application/json'}}),
  caches:{open:async(name:string)=>{installedCache=name;return {addAll:async(urls:string[])=>{caches.set(name,urls);}};},keys:async()=>[...caches.keys()],delete:async(name:string)=>caches.delete(name)},
 });
 let pending:Promise<unknown>|undefined;
 handlers.install({waitUntil:promise=>{pending=promise;}});await pending;
 const installed=[...(caches.get(installedCache)??[])];
 handlers.activate({waitUntil:promise=>{pending=promise;}});await pending;
 return {installedCache,installed,caches};
}
describe('connected release offline upgrade',()=>{
 it('changes worker bytes so an installed previous release can discover the update',()=>{
  expect(createHash('sha256').update(worker).digest('hex')).not.toBe(previousHash);
 });
 it('preloads new lazy features into a new cache generation',async()=>{
  const result=await lifecycle();
  expect(result.installedCache).not.toBe(previousCache);
  for(const asset of currentAssets)expect(result.installed).toContain(asset);
  expect(result.installed).toContain('/index.html');
  expect(result.installed).not.toContain('/store-catalog.json');
 });
 it('retires the previous cache only while preserving the newly installed shell',async()=>{
  const result=await lifecycle();
  expect(result.caches.has(previousCache)).toBe(false);
  expect(result.caches.get(result.installedCache)).toEqual(result.installed);
 });
});
