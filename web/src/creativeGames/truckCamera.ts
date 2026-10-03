import type {Drive} from './save';
/** One camera transform shared by terrain, impacts, warnings, and boost. */
export function truckCamera(r:Drive,width:number,height:number){return {x:Math.max(0,r.x-width*.28),y:r.y-Math.min(height*.57,325)};}
