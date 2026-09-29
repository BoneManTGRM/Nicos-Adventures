import {describe,it,expect,vi,afterEach} from 'vitest';
import {createProfile,normalizeStore} from '../storage';
import {renderToStaticMarkup} from 'react-dom/server';
import {createElement} from 'react';
import {Arcade} from '../world/Arcade';
afterEach(()=>vi.unstubAllGlobals());
describe('approved creative games integration',()=>{
 it('preserves earned garage bolts and kingdom petals in the canonical profile',()=>{
  const p={...createProfile('Nico'),creativeGames:{garage:{bolts:64,owned:[1,11,26,31,71,81,91,12]},kingdom:{petals:30,owned:[1,2,3,4]}}};
  const store=normalizeStore({schemaVersion:4,activeProfileId:p.id,profiles:[p]});
  expect(store.profiles[0]).toHaveProperty('creativeGames.garage.bolts',64);
  expect(store.profiles[0]).toHaveProperty('creativeGames.kingdom.petals',30);
 });
 it('offers both real games from the existing arcade',()=>{
  vi.stubGlobal('window',{location:{search:''}});
  const html=renderToStaticMarkup(createElement(Arcade,{profile:createProfile('Nico'),update:()=>{},announce:()=>{}}));
  expect(html).toContain('open-monster-garage');expect(html).toContain('open-rainbow-kingdom');
 });
});
