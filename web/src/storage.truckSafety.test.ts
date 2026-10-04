import {afterEach,describe,it,expect,vi} from 'vitest';
import {createProfile,loadLocalStore,saveLocalStore} from './storage';
import {normalizeGames} from './creativeGames/save';
const key='nicos-world-local-save-v4';
function fixture(failures:number){
 const p=createProfile('Isolated truck fixture','es-MX');p.creativeGames=normalizeGames(null);p.creativeGames.garage.bolts=777;p.creativeGames.garage.blueprints=[{...p.creativeGames.garage.build,name:'Saved vehicle',paint:3}];
 const original=JSON.stringify({schemaVersion:4,activeProfileId:p.id,profiles:[p]}),values=new Map([[key,original]]);let reads=0,writes=0;
 vi.stubGlobal('localStorage',{getItem:(k:string)=>{if(k===key&&reads++<failures)throw new Error('Isolated read denial');return values.get(k)??null;},setItem:(k:string,v:string)=>{writes++;values.set(k,v);}});
 return {p,original,values,writes:()=>writes};
}
afterEach(()=>{loadLocalStore();vi.unstubAllGlobals();});
describe('truck save read failures must never replace a good owner profile',()=>{
 it('retries a transient denied read and recovers the existing vehicle/wallet',()=>{const f=fixture(1),s=loadLocalStore();expect(s.activeProfileId).toBe(f.p.id);expect(s.profiles[0].creativeGames!.garage.bolts).toBe(777);expect(s.profiles[0].creativeGames!.garage.blueprints).toEqual(f.p.creativeGames!.garage.blueprints);});
 it('blocks default-store writes after two denied reads, preserving the exact good save',()=>{const f=fixture(2),temporary=loadLocalStore();expect(saveLocalStore(temporary,'app')).toBe(false);expect(f.writes()).toBe(0);expect(f.values.get(key)).toBe(f.original);const recovered=loadLocalStore();expect(recovered.activeProfileId).toBe(f.p.id);recovered.profiles[0].creativeGames!.garage.bolts+=2;expect(saveLocalStore(recovered,'app')).toBe(true);expect(JSON.parse(f.values.get(key)!).profiles[0].creativeGames.garage.bolts).toBe(779);expect(recovered.profiles[0].creativeGames!.garage.blueprints).toEqual(f.p.creativeGames!.garage.blueprints);});
});
