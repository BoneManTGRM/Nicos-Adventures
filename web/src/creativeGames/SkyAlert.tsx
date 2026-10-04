import type {SkyState} from './skyObjects';
import './sky-objects.css';
export default function SkyAlert({sky,spanish}:{sky:SkyState|null;spanish:boolean}){
 const a=sky?.active;if(!a)return null;
 const names=spanish?['Caja','Roca grande','Cristal diagonal','Rayo doble']:['Crate','Big boulder','Diagonal crystal','Double bolt'];
 const label=a.phase==='warning'?names[a.kind]+' · '+(a.safeAction==='gas'?(spanish?'¡Acelera!':'Speed up!'):(a.targetX===undefined?(spanish?'Frena o acelera':'Brake or speed up'):(spanish?'¡Frena!':'Brake!'))):
 a.phase==='falling'?(spanish?'¡Mira la trayectoria!':'Watch the marked path!'):
 a.hit?(spanish?'¡Golpe! Piloto a salvo.':'Bump! Driver safe.'):(spanish?'¡Lo esquivaste!':'You dodged it!');
 return <div className={`cg-sky-alert cg-sky-${a.phase}`} role="status" aria-live="polite" data-testid="sky-warning"><span aria-hidden="true">{a.phase==='burst'?'✦':a.kind>=2?'↙':'↓'}</span>{label}</div>;
}
