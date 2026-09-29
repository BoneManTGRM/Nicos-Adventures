import {completeIsland,type KingdomSave} from './save';
import type {Ride} from './kingdomPhysics';
/** Pay once for a physically completed ride, including replays. Never pay for time or menu clicks. */
export function settleKingdomRide(k:KingdomSave,ride:Ride,island:number):KingdomSave{
 if(!Number.isInteger(island)||island<0||island>2||ride.id!==k.sequence||ride.id<=k.paidThrough||!ride.completed||ride.x<=1975||![0,1,2].every(id=>ride.found.includes(id)))return k;
 const completed=completeIsland(k,island);
 const award=completed.petals-k.petals+15;
 return {...completed,petals:Math.min(1e6,completed.petals+15),paidThrough:ride.id,lastReward:award};
}
