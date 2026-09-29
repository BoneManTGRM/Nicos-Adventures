import {afterEach,describe,expect,it,vi} from 'vitest';
import type {UnicornPose} from './unicornSprite';
afterEach(()=>{vi.restoreAllMocks();vi.unstubAllGlobals();});
async function fresh(){vi.resetModules();return import('./unicornSprite');}
const fakeImage=(src:string)=>({src,naturalWidth:820,naturalHeight:820}) as HTMLImageElement;
function context(){return {save:vi.fn(),restore:vi.fn(),translate:vi.fn(),scale:vi.fn(),drawImage:vi.fn(),imageSmoothingEnabled:false,imageSmoothingQuality:'low'} as unknown as CanvasRenderingContext2D;}
describe('the existing site unicorn becomes the playable character',()=>{
 it('loads the exact four Becca Corner assets once even with simultaneous consumers',async()=>{
  const s=await fresh(),loader=vi.fn(async(url:string)=>fakeImage(url));
  await Promise.all([s.loadUnicornArt(loader),s.loadUnicornArt(loader)]);await s.loadUnicornArt(loader);
  expect(loader).toHaveBeenCalledTimes(4);expect(s.unicornArtReady()).toBe(true);
  for(const pose of ['prance','float','turn','rest'] as const)expect(s.UNICORN_ART[pose]).toContain(`unicorn-${pose}-v2.webp`);
 });
 it('draws the decoded raster art at a consistent feet baseline for every pose',async()=>{
  const s=await fresh();await s.loadUnicornArt(async(url)=>fakeImage(url));const c=context();
  for(const pose of ['prance','float','turn','rest'] as UnicornPose[]){
   expect(s.drawUnicornSprite(c,120,335,0,0,1,pose,true)).toBe(true);
   expect(c.drawImage).toHaveBeenLastCalledWith(expect.objectContaining({src:s.UNICORN_ART[pose]}),-78,-760*(156/820),156,156);
  }
  expect(c.translate).toHaveBeenLastCalledWith(120,335);
 });
 it('does not claim a drawable character before images decode; failures can be retried',async()=>{
  const s=await fresh(),c=context();expect(s.drawUnicornSprite(c,0,0)).toBe(false);expect(c.drawImage).not.toHaveBeenCalled();
  await expect(s.loadUnicornArt(async()=>{throw Error('network failure');})).rejects.toThrow('network failure');expect(s.unicornArtReady()).toBe(false);
  await s.loadUnicornArt(async(url)=>fakeImage(url));expect(s.unicornArtReady()).toBe(true);expect(s.drawUnicornSprite(c,0,0)).toBe(true);
 });
 it('uses movement and airborne poses without mutating gameplay or save state',async()=>{
  const s=await fresh(),r={x:75,t:0,grounded:true,completed:false};
  expect(s.unicornMotion(r)).toEqual({direction:1,pose:'turn'});
  r.x=100;r.t=.1;const before={...r};expect(s.unicornMotion(r)).toEqual({direction:1,pose:'prance'});expect(r).toEqual(before);
  expect(s.unicornMotion(r)).toEqual({direction:1,pose:'prance'});
  r.x=90;r.t=.2;expect(s.unicornMotion(r)).toEqual({direction:-1,pose:'prance'});
  r.grounded=false;r.t=.3;expect(s.unicornMotion(r).pose).toBe('float');
  r.completed=true;expect(s.unicornMotion(r).pose).toBe('rest');
 });
 it('suppresses pose bounce for reduced motion while preserving ground anchoring',async()=>{
  const s=await fresh();await s.loadUnicornArt(async(url)=>fakeImage(url));const c=context();
  s.drawUnicornSprite(c,120,335,.23,0,1,'prance',true);expect(c.translate).toHaveBeenLastCalledWith(120,335);
  s.drawUnicornSprite(c,120,335,.23,0,1,'prance',false);expect(c.translate).not.toHaveBeenLastCalledWith(120,335);
 });
});
