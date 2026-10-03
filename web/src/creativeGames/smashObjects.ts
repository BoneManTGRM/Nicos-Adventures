import type {Drive} from './save';
export type SmashState={cleared:number[];bolts:number;impactAt:number};
export const INTRO_CRATE={id:1,x:450,width:26,height:44,reward:3};
/** A single forgiving obstacle for the integration slice; particles have no colliders. */
export function tickIntroSmash(r:Drive,previousX:number,width:number,ground:number){
 const state=r.smash??(r.smash={cleared:[],bolts:0,impactAt:-100});
 const o=INTRO_CRATE;if(r.ended||state.cleared.includes(o.id))return;
 // Sweep the truck footprint, including its largest one-step boost displacement.
 if(Math.max(previousX,r.x)+width<o.x-o.width||Math.min(previousX,r.x)-width>o.x+o.width||r.y-30>ground||r.y+35<ground-o.height)return;
 if(Math.abs(r.vx)>=45){state.cleared.push(o.id);state.bolts+=o.reward;state.impactAt=r.t;r.vx*=.92;return;}
 // Low-speed contact can build pulling force without damage or repeated rewards.
 const fromLeft=previousX<=o.x;r.x=fromLeft?Math.min(r.x,o.x-o.width-width):Math.max(r.x,o.x+o.width+width);
}
