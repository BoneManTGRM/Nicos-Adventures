import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Group, Mesh, Sprite, SRGBColorSpace, TextureLoader } from 'three';
import boltAtlas from '../assets/boltbot/boltbot-premium-poses-atlas.webp';
import sparkyArt from '../assets/pets/sparky-idle-v2.webp';
import alienArt from '../assets/monsters/premium-lizard-alien.webp';
import { ARENA_WALLS, stepTag, slide } from '../game/starTag';
import type { ArenaInput, TagState, TagMonster, TagShot, TagSpark, Point } from '../game/starTag';
export type TagSnapshot = Pick<TagState,'status'|'shield'|'score'|'wave'|'tags'|'shotsFired'|'distance'|'dashCooldown'|'nextWave'> & {monsters:TagMonster[];shots:TagShot[];sparks:TagSpark[];crystals:(Point&{id:number})[]};
export const snapshotTag=(s:TagState):TagSnapshot=>({status:s.status,shield:s.shield,score:s.score,wave:s.wave,tags:s.tags,shotsFired:s.shotsFired,distance:s.distance,dashCooldown:s.dashCooldown,nextWave:s.nextWave,monsters:[...s.monsters],shots:[...s.shots],sparks:[...s.sparks],crystals:[...s.crystals]});
type Runtime=MutableRefObject<TagState>;
type SceneProps={runtime:Runtime;input:MutableRefObject<ArenaInput>;snapshot:TagSnapshot;notify:(s:TagSnapshot)=>void;pausedLabel:string;ready:()=>void;failed:()=>void};
function Character({source,entity,runtime,companion,atlas=false}:{source:string;entity?:TagMonster;runtime:Runtime;companion?:'robot'|'pet';atlas?:boolean}){
 const original=useLoader(TextureLoader,source);
 const texture=useMemo(()=>{const t=original.clone();t.colorSpace=SRGBColorSpace;if(atlas){t.repeat.set(.25,.5);t.offset.set(0,.5);}t.needsUpdate=true;return t;},[original,atlas]);
 useEffect(()=>()=>texture.dispose(),[texture]);
 const sprite=useRef<Sprite>(null),position=useRef<Point>({x:companion==='pet'?2.5:-2.5,z:3});
 useFrame((_,delta)=>{
  if(!sprite.current)return;const s=runtime.current;
  if(entity){sprite.current.visible=entity.hp>0;sprite.current.position.set(entity.x,1.25+Math.sin(s.time*3+entity.id)*.07,entity.z);sprite.current.material.color.set(entity.flash>0?'#fff5b0':['#ffffff','#a8f6ff','#f2c5ff'][entity.kind]);}
  else{
   if(s.status==='playing'){
    const side=companion==='pet'?2.4:-2.4;
    const goal={x:s.player.x+Math.cos(s.yaw)*side+Math.sin(s.yaw)*4,z:s.player.z+Math.sin(s.yaw)*side-Math.cos(s.yaw)*4};
    const dt=Math.min(delta,.05),p=position.current;
    position.current=slide(p,(goal.x-p.x)*Math.min(1,dt*2),(goal.z-p.z)*Math.min(1,dt*2),.35);
   }
   sprite.current.position.set(position.current.x,companion==='pet'?.6:1.1,position.current.z);
  }
 });
 return <sprite ref={sprite} scale={companion==='pet'?[1.55,1.15,1]:companion==='robot'?[1.65,2.2,1]:[2.3,2.3,1]}><spriteMaterial map={texture} transparent alphaTest={.08} depthWrite={false}/></sprite>;
}
function Shot({entity}:{entity:TagShot}){
 const mesh=useRef<Mesh>(null);useFrame((_,dt)=>{if(mesh.current){mesh.current.visible=entity.life>0;mesh.current.position.set(entity.x,1.25,entity.z);mesh.current.rotation.z+=dt*8;}});
 return <mesh ref={mesh}>{entity.friendly?<octahedronGeometry args={[.16]}/>:<sphereGeometry args={[.23,10,8]}/>}<meshBasicMaterial color={entity.friendly?'#fff7ad':'#d18bff'} transparent opacity={entity.friendly?1:.72}/></mesh>;
}
function Spark({entity}:{entity:TagSpark}){
 const mesh=useRef<Mesh>(null);useFrame(({camera})=>{if(mesh.current){mesh.current.visible=entity.life>0;mesh.current.position.set(entity.x,1.3,entity.z);mesh.current.quaternion.copy(camera.quaternion);mesh.current.scale.setScalar(1.8-entity.life*2);}});
 return <mesh ref={mesh}><ringGeometry args={[.18,.24,12]}/><meshBasicMaterial color={entity.friendly?'#fff5aa':'#b197ff'} transparent opacity={.65} depthWrite={false}/></mesh>;
}
function Crystal({point}:{point:Point}){
 const mesh=useRef<Mesh>(null);useFrame(({clock})=>{if(mesh.current){mesh.current.rotation.y=clock.elapsedTime;mesh.current.position.y=.7+Math.sin(clock.elapsedTime*2)*.12;}});
 return <mesh ref={mesh} position={[point.x,.7,point.z]}><octahedronGeometry args={[.38]}/><meshStandardMaterial color="#7affdd" emissive="#2baea0" emissiveIntensity={.8}/></mesh>;
}
function Launcher({runtime}:{runtime:Runtime}){
 const group=useRef<Group>(null),barrel=useRef<Group>(null);
 useFrame(({camera})=>{if(group.current){group.current.position.copy(camera.position);group.current.quaternion.copy(camera.quaternion);}if(barrel.current)barrel.current.position.z=-.8+Math.max(0,runtime.current.cooldown-.2)*.45;});
 return <group ref={group}><group ref={barrel} position={[.34,-.43,-.8]} rotation={[Math.PI/2,0,0]} scale={.7}>
  <mesh><cylinderGeometry args={[.13,.21,.58,12]}/><meshStandardMaterial color="#26a6b7" metalness={.5} roughness={.3}/></mesh>
  <mesh position={[0,.28,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.15,.048,8,16]}/><meshBasicMaterial color="#fff3a0"/></mesh>
  <mesh position={[0,.08,.12]}><boxGeometry args={[.18,.3,.16]}/><meshStandardMaterial color="#544193"/></mesh>
  <mesh position={[0,.32,0]}><sphereGeometry args={[.1,12,10]}/><meshBasicMaterial color="#bdfff5"/></mesh>
 </group></group>;
}
function Scene({runtime,input,snapshot,notify,ready,failed}:SceneProps){
 useLoader(TextureLoader,[boltAtlas,sparkyArt,alienArt]);
 const cadence=useRef(0),gl=useThree(state=>state.gl);
 useEffect(()=>{const canvas=gl.domElement;canvas.addEventListener('webglcontextlost',failed);ready();return()=>canvas.removeEventListener('webglcontextlost',failed);},[gl,ready,failed]);
 useFrame(({camera},delta)=>{const s=runtime.current;stepTag(s,input.current,delta);camera.position.set(s.player.x,1.55,s.player.z);camera.rotation.set(0,-s.yaw,0);cadence.current+=delta;if(cadence.current>=.1||s.status!==snapshot.status){cadence.current=0;notify(snapshotTag(s));}});
 return <>
  <color attach="background" args={['#11213f']}/><fog attach="fog" args={['#11213f',14,30]}/><ambientLight intensity={1.3}/><hemisphereLight args={['#badbff','#384672',2]}/><directionalLight position={[4,9,3]} intensity={2} color="#fff2ce"/>
  <mesh rotation={[-Math.PI/2,0,0]}><planeGeometry args={[23,23]}/><meshStandardMaterial color="#24395b" roughness={.82}/></mesh><gridHelper args={[22,22,'#598aaa','#345472']} position={[0,.012,0]}/>
  {ARENA_WALLS.map((wall,index)=><group key={index} position={[wall.x,0,wall.z]}>
   <mesh position={[0,2.1,0]}><boxGeometry args={[wall.w,4.2,wall.d]}/><meshStandardMaterial color={index<4?'#263c67':'#4b5088'} roughness={.7}/></mesh>
   <mesh position={[0,.25,0]}><boxGeometry args={[wall.w+.035,.08,wall.d+.035]}/><meshBasicMaterial color="#53d9ed"/></mesh><mesh position={[0,3.6,0]}><boxGeometry args={[wall.w+.035,.09,wall.d+.035]}/><meshBasicMaterial color="#c4afff"/></mesh>
  </group>)}
  {[-8,-4,0,4,8].map(x=><group key={x} position={[x,2,-10.35]}><mesh><torusGeometry args={[.6,.065,8,6]}/><meshBasicMaterial color="#ffc96d"/></mesh><mesh rotation={[0,0,Math.PI/4]}><planeGeometry args={[.25,.25]}/><meshBasicMaterial color="#7cebdd"/></mesh></group>)}
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,.02,-5]}><ringGeometry args={[2,2.12,40]}/><meshBasicMaterial color="#d1b2ff"/></mesh>
  <Character source={boltAtlas} runtime={runtime} companion="robot" atlas/><Character source={sparkyArt} runtime={runtime} companion="pet"/>
  {snapshot.monsters.map(entity=><Character key={entity.id} source={alienArt} entity={entity} runtime={runtime}/>)}
  {snapshot.shots.map(entity=><Shot key={entity.id} entity={entity}/>)}{snapshot.sparks.map(entity=><Spark key={entity.id} entity={entity}/>)}{snapshot.crystals.map(point=><Crystal key={point.id} point={point}/>)}<Launcher runtime={runtime}/>
 </>;
}
function supportsWebGL2(): boolean {
 if (typeof document === 'undefined') return true;
 try {
  const context = document.createElement('canvas').getContext('webgl2');
  if (!context) return false;
  context.getExtension('WEBGL_lose_context')?.loseContext();
  return true;
 } catch { return false; }
}
export default function StarTagScene(props:SceneProps){
 const [supported] = useState(supportsWebGL2);
 useEffect(() => { if (!supported) props.failed(); }, [supported, props.failed]);
 if (!supported) return <p role="status">{props.pausedLabel}</p>;
 // Canvas fallback is mounted inside the native canvas even on supported
 // browsers. It must be passive text, never an effect that marks startup failed.
 return <Canvas camera={{position:[0,1.55,7],fov:72,near:.08,far:40}} dpr={[1,1.5]} gl={{antialias:true,powerPreference:'high-performance'}} fallback={<p>{props.pausedLabel}</p>}><Suspense fallback={null}><Scene {...props}/></Suspense></Canvas>;
}
