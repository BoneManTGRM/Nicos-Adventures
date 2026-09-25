import type { StarBridgeStep } from '../game/goldenAdventure';
import type { Language } from '../types';

export type JourneyAction = 'begin' | 'lab' | 'bridge' | 'home';
const steps: Record<StarBridgeStep, {action:JourneyAction; en:string; 'es-MX':string}> = {
  briefing: {action:'begin', en:'Start my adventure', 'es-MX':'Empezar mi aventura'},
  map_revealed: {action:'lab', en:'Prepare BoltBot', 'es-MX':'Preparar a BoltBot'},
  robot_configured: {action:'lab', en:'Try the movement test', 'es-MX':'Probar el movimiento'},
  movement_passed: {action:'lab', en:'Try the scanner test', 'es-MX':'Probar el escáner'},
  scanner_passed: {action:'lab', en:'Try the logic test', 'es-MX':'Resolver la prueba de lógica'},
  logic_passed: {action:'bridge', en:'Inspect the Star Bridge', 'es-MX':'Revisar el Puente Estelar'},
  bridge_inspected: {action:'bridge', en:'Install the Star Core', 'es-MX':'Instalar el Núcleo Estelar'},
  star_core_installed: {action:'bridge', en:'Light up the bridge', 'es-MX':'Encender el puente'},
  complete: {action:'home', en:'Bring the adventure home', 'es-MX':'Llevar la aventura a casa'},
};
/** Presentation only: never advances progress or awards rewards. */
export function nextAdventure(step:StarBridgeStep, language:Language) {
  const next=steps[step];
  return {action:next.action,label:next[language]};
}
