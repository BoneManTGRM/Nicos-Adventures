import {describe,it,expect} from 'vitest';
import {normalizeGames,magicPrice,buyMagic} from './save';
import {makeRide} from './kingdomPhysics';
import {settleKingdomRide} from './kingdomRewards';
describe('repeatable kingdom rewards',()=>{
 it('pays a completed replay so every magical item remains earnable',()=>{const k={...normalizeGames(null).kingdom,completed:[0],rescued:[0,1,2],sequence:2,paidThrough:1,lastReward:0};const r={...makeRide(2),x:2010,found:[0,1,2],completed:true};const result=settleKingdomRide(k,r,0);expect(result.petals).toBe(15);expect(settleKingdomRide(result,r,0)).toBe(result);});
 it('cannot pay for entering the gate without finding the friends',()=>{const k={...normalizeGames(null).kingdom,sequence:1,paidThrough:0,lastReward:0};const r={...makeRide(1),x:2010,found:[0],completed:false};expect(settleKingdomRide(k,r,0)).toBe(k);});
 it('ignores an old ride after a new one has started',()=>{const k={...normalizeGames(null).kingdom,sequence:3,paidThrough:1};const r={...makeRide(2),x:2010,found:[0,1,2],completed:true};expect(settleKingdomRide(k,r,0)).toBe(k);});
 it('combines the first garden bonus and one ride reward, then preserves the receipt',()=>{const k={...normalizeGames(null).kingdom,sequence:1,rescued:[0,1,2]};const r={...makeRide(1),x:2010,found:[0,1,2],completed:true};const result=settleKingdomRide(k,r,0);expect(result.petals).toBe(45);expect(result.lastReward).toBe(45);expect(normalizeGames({kingdom:result}).kingdom).toEqual(result);});
 it('makes all remaining items earnable without a purchase, expiry, or new creatures',()=>{let k={...normalizeGames(null).kingdom,completed:[0,1,2],rescued:[0,1,2,3,4,5,6,7,8]};for(let id=4;id<=12;id++){while(k.petals<magicPrice(id)){k={...k,sequence:k.sequence+1};k=settleKingdomRide(k,{...makeRide(k.sequence),x:2010,found:[0,1,2],completed:true},0);}k=buyMagic(k,id);}expect(k.owned).toHaveLength(12);expect(k.petals).toBeGreaterThanOrEqual(0);});
});
