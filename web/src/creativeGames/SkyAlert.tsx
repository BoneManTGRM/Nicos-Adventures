import type {SkyState} from './skyObjects';
import './sky-objects.css';
export default function SkyAlert({sky,spanish}:{sky:SkyState|null;spanish:boolean}){
 const a=sky?.active;if(!a)return null;
 const label=a.phase==='warning'?(spanish?'¡Objeto arriba! Frena o acelera.':'Object above! Brake or speed up.'):
 a.phase==='falling'?(spanish?'¡Cuidado con el objeto que cae!':'Watch the falling object!'):
 a.hit?(spanish?'¡Golpe! Tu piloto está a salvo.':'Hit! Your driver is safe.'):(spanish?'¡Lo esquivaste!':'You dodged it!');
 return <div className={`cg-sky-alert cg-sky-${a.phase}`} role="status" aria-live="polite" data-testid="sky-warning"><span aria-hidden="true">{a.phase==='burst'?'✦':'↓'}</span>{label}</div>;
}
