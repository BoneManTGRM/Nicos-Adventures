import {num,type Drive} from './save';

/** Turbo is a free, bounded driving resource, never an ownership or wallet item. */
export function tickTurbo(run:Drive,requested:boolean,braking:boolean,dt:number,poweredContact:boolean):boolean {
  if (run.ended || dt<=0) return false;
  const charge=num(run.boostCharge,0,100,100);
  if (!requested) run.boostLocked=false;
  const usable=poweredContact && !run.broken.includes(14) && !braking;
  const active=requested && usable && !run.boostLocked && charge>0;
  if (active) {
    run.boostCharge=Math.max(0,charge-40*dt);
    if (run.boostCharge===0) run.boostLocked=true;
  } else {
    // Release the button and keep driving to recharge; waiting in a menu does nothing.
    run.boostCharge=Math.min(100,charge+(!requested&&usable&&Math.abs(run.vx)>25?14*dt:0));
  }
  run.boostActive=active;
  return active;
}
