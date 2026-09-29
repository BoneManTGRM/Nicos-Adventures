import {describe,it,expect,vi,afterEach} from 'vitest';
import {createProfile,normalizeStore,exportProfile,importProfile} from '../storage';
import {renderToStaticMarkup} from 'react-dom/server';
import {createElement} from 'react';
import {Arcade} from '../world/Arcade';
import {normalizeGames} from './save';
afterEach(()=>vi.unstubAllGlobals());
describe('approved creative games integration',()=>{
 it('preserves earned garage bolts and kingdom petals in the canonical profile',()=>{
  const p={...createProfile('Nico'),creativeGames:{garage:{bolts:64,owned:[1,11,26,31,71,81,91,12]},kingdom:{petals:30,owned:[1,2,3,4]}}};
  const store=normalizeStore({schemaVersion:4,activeProfileId:p.id,profiles:[p]});
  expect(store.profiles[0]).toHaveProperty('creativeGames.garage.bolts',64);expect(store.profiles[0]).toHaveProperty('creativeGames.kingdom.petals',30);
 });
 it('offers both real games from the existing arcade',()=>{vi.stubGlobal('window',{location:{search:''}});const html=renderToStaticMarkup(createElement(Arcade,{profile:createProfile('Nico'),update:()=>{},announce:()=>{}}));expect(html).toContain('open-monster-garage');expect(html).toContain('open-rainbow-kingdom');expect(html).toContain('open-monster-rift');});
 it('round-trips both games in the existing parent backup format without changing other creations',()=>{
  const p=createProfile('Nico');
  // Compare against the established import boundary, which supplies defaults such as upgrades: [].
  const beforeGames=importProfile(exportProfile(p));
  p.creativeGames=normalizeGames(null);p.creativeGames.garage.bolts=82;p.creativeGames.garage.blueprints=[p.creativeGames.garage.build];p.creativeGames.kingdom.layouts[1][3]=2;p.creativeGames.kingdom.rescued=[0,3];p.creativeGames.kingdom.sequence=4;p.creativeGames.kingdom.paidThrough=3;
  const imported=importProfile(exportProfile(p));
  expect(imported.creativeGames).toEqual(p.creativeGames);
  expect(imported.robot).toEqual(beforeGames.robot);expect(imported.robots).toEqual(beforeGames.robots);expect(imported.animals).toEqual(beforeGames.animals);expect(imported.pets).toEqual(beforeGames.pets);expect(imported.adventures).toEqual(beforeGames.adventures);expect(imported.id).not.toBe(p.id);
 });
 it('does not add another child’s wallet to a profile that has never opened either game',()=>{const a=createProfile('Nico'),b=createProfile('Becca');a.creativeGames=normalizeGames(null);a.creativeGames.garage.bolts=500;const saved=normalizeStore({schemaVersion:4,activeProfileId:b.id,profiles:[a,b]});expect(saved.profiles[0].creativeGames!.garage.bolts).toBe(500);expect(saved.profiles[1].creativeGames).toBeUndefined();});
});
