import {recoverDrive} from './survival';
import {courseRamps} from './courseLayout';
import {PARTS,copy} from './catalog';
import {carStats,makeDrive,terrainAt} from './carPhysics';
import {finishDrive,normalizeBuild,type Build,type Drive,type GarageSave} from './save';

export type PartFilter='all'|'owned'|'affordable';
export function findGarageParts(g:GarageSave,group:number,query:string,filter:PartFilter) {
  const clean=query.trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  return PARTS.filter(p=>{
    const name=`${p.name.en} ${p.name['es-MX']}`.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    return (clean?name.includes(clean):p.group===group) && (filter==='all'||(filter==='owned'?g.owned.includes(p.id):!g.owned.includes(p.id)&&g.bolts>=p.price));
  });
}

/** Prepare a new run and settle the preceding one through the existing one-payment ledger. */
export function startGarageAttempt(g:GarageSave,options:{build?:Build;track:number;practice?:boolean;trial?:boolean;previous?:Drive|null;recovery?:boolean}) {
  const trial=options.trial===true;
  const settled=trial?g:options.previous?finishDrive(g,options.previous):g.resume?finishDrive(g,g.resume):g;
  const build=normalizeBuild(options.build??g.build,trial?PARTS.map(p=>p.id):g.owned);
  const run=makeDrive(build,trial?0:settled.sequence+1,Math.max(0,Math.min(2,Math.floor(options.track))),trial||options.practice===true);
  if(options.recovery&&options.previous){
   const previous=options.previous,stats=carStats(previous.build),copyRun=structuredClone(previous);
   Object.assign(run,copyRun,{id:run.id,bankedDistance:previous.distance,ended:false,reason:0});
   if(run.smash){run.smash.paid=[...run.smash.cleared];run.smash.bolts=0;}
   if(run.survival)run.survival.reward=0;
   recoverDrive(run,(x)=>terrainAt(x,run.track,run.bridges),stats.radius,stats.clearance);
  }
  return {run,garage:trial?g:{...settled,sequence:run.id,resume:structuredClone(run),last:null}};
}

export function wheelsRemaining(r:Drive) {
  const total=carStats(r.build).wheelCount;
  return {total,remaining:total-r.broken.filter(id=>id>=0&&id<total).length};
}
export function nextRampDistance(x:number):number {
  const crest=courseRamps().find(crest=>crest>x+6);
  return crest===undefined?999:Math.max(0,Math.ceil((crest-x)/12));
}
export function runHint(r:Drive) {
  if (r.broken.includes(14)) return copy('Motor lost — rebuild for free.','Motor desprendido — reconstruye gratis.');
  const wheels=wheelsRemaining(r);
  if (wheels.remaining<wheels.total) return copy('Wheel lost — your car can still move.','Perdiste una rueda — tu auto aún puede avanzar.');
  if (r.broken.length) return copy('Body damage — all wheels still attached.','Daño de carrocería — todas las ruedas siguen puestas.');
  if (r.air>.18) return copy('Airborne — ease off for the landing.','En el aire — suelta el pedal para aterrizar.');
  return copy('All wheels attached.','Todas las ruedas están puestas.');
}
export type DriveObservation=Pick<Drive,'air'|'broken'|'landings'|'x'|'launchX'|'a'|'ended'>;
export function landingFeedback(before:DriveObservation,after:DriveObservation) {
  if(before.air<.18||after.landings<=before.landings||after.ended||after.broken.length>before.broken.length||Math.abs(after.a)>.8)return null;
  const meters=Math.max(0,Math.floor((after.x-before.launchX)/12));
  return meters>=2?meters:null;
}

// These are the existing permanent projects and their existing rewards, not a new economy.
export const GARAGE_PROJECTS=[
  {id:1,reward:20,title:copy('First expedition','Primera expedición'),task:copy('Drive 50 meters.','Recorre 50 metros.')},
  {id:2,reward:30,title:copy('Over the ramps','Sobre las rampas'),task:copy('Drive 150 meters.','Recorre 150 metros.')},
  {id:3,reward:40,title:copy('Trail explorer','Explorador de caminos'),task:copy('Drive 300 meters.','Recorre 300 metros.')},
  {id:4,reward:25,title:copy('Big air','Gran salto'),task:copy('Land an 8-meter jump.','Aterriza un salto de 8 metros.')},
  {id:5,reward:25,title:copy('Jump practice','Práctica de saltos'),task:copy('Make three landings in one drive.','Haz tres aterrizajes en un recorrido.')},
  {id:6,reward:30,title:copy('Special delivery','Entrega especial'),task:copy('Carry a parcel 100 meters with the Honeybee Cargo Tray.','Lleva un paquete 100 metros con la bandeja de carga abeja.')},
  {id:7,reward:20,title:copy('Keep it together','Todo en su lugar'),task:copy('Reach 100 meters without losing a wheel.','Llega a 100 metros sin perder ruedas.')},
];
