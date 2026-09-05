import { Suspense, useEffect, useMemo, useRef } from 'react';
import type { MutableRefObject } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Group, Mesh, Sprite, SRGBColorSpace, TextureLoader } from 'three';
import boltAtlas from '../assets/boltbot/boltbot-premium-poses-atlas.webp';
import sparkyArt from '../assets/pets/sparky-idle-v2.webp';
import alienArt from '../assets/monsters/premium-lizard-alien.webp';
import { ARENA_WALLS, stepTag } from '../game/starTag';
import type { ArenaInput, TagState, TagMonster, TagShot, TagSpark, Point } from '../game/starTag';

export type TagSnapshot = Pick<TagState, 'status' | 'shield' | 'score' | 'wave' | 'tags' | 'shotsFired' | 'distance' | 'dashCooldown' | 'nextWave'> & {
  monsters: TagMonster[]; shots: TagShot[]; sparks: TagSpark[]; crystals: (Point & { id: number })[];
};
export const snapshotTag = (s: TagState): TagSnapshot => ({
  status: s.status, shield: s.shield, score: s.score, wave: s.wave, tags: s.tags,
  shotsFired: s.shotsFired, distance: s.distance, dashCooldown: s.dashCooldown, nextWave: s.nextWave,
  monsters: [...s.monsters], shots: [...s.shots], sparks: [...s.sparks], crystals: [...s.crystals],
});
type Runtime = MutableRefObject<TagState>;
type SceneProps = { runtime: Runtime; input: MutableRefObject<ArenaInput>; snapshot: TagSnapshot; notify: (s: TagSnapshot) => void; pausedLabel: string; ready: () => void; failed: () => void };

function Character({ source, entity, runtime, companion, atlas = false }: {
  source: string; entity?: TagMonster; runtime: Runtime; companion?: 'robot' | 'pet'; atlas?: boolean;
}) {
  const original = useLoader(TextureLoader, source);
  const texture = useMemo(() => {
    const t = original.clone(); t.colorSpace = SRGBColorSpace;
    if (atlas) { t.repeat.set(.25, .5); t.offset.set(0, .5); }
    t.needsUpdate = true; return t;
  }, [original, atlas]);
  useEffect(() => () => texture.dispose(), [texture]);
  const sprite = useRef<Sprite>(null);
  useFrame(() => {
    if (!sprite.current) return;
    const s = runtime.current;
    if (entity) {
      sprite.current.visible = entity.hp > 0;
      sprite.current.position.set(entity.x, 1.3 + Math.sin(s.time * 3 + entity.id) * .08, entity.z);
      const flash = entity.flash > 0;
      sprite.current.material.color.set(flash ? '#fff5b0' : ['#ffffff', '#a8f6ff', '#f2c5ff'][entity.kind]);
    } else {
      // Companions stay beside the player instead of obscuring the aiming lane.
      const side = companion === 'pet' ? 1.4 : -1.8;
      sprite.current.position.set(s.player.x + Math.cos(s.yaw) * side - Math.sin(s.yaw) * 1.4,
        companion === 'pet' ? .65 : 1.15, s.player.z + Math.sin(s.yaw) * side + Math.cos(s.yaw) * 1.4);
    }
  });
  return <sprite ref={sprite} scale={companion === 'pet' ? [1.4, 1.35, 1] : [2.1, 2.7, 1]}>
    <spriteMaterial map={texture} transparent alphaTest={.08} depthWrite={false} />
  </sprite>;
}
function Shot({ entity }: { entity: TagShot }) {
  const mesh = useRef<Mesh>(null);
  useFrame((_, dt) => {
    if (!mesh.current) return;
    mesh.current.visible = entity.life > 0;
    mesh.current.position.set(entity.x, 1.25, entity.z);
    mesh.current.rotation.z += dt * 8;
  });
  return <mesh ref={mesh}>
    {entity.friendly ? <octahedronGeometry args={[.16]} /> : <sphereGeometry args={[.23, 10, 8]} />}
    <meshBasicMaterial color={entity.friendly ? '#fff7ad' : '#d18bff'} transparent opacity={entity.friendly ? 1 : .72} />
  </mesh>;
}
function Spark({ entity }: { entity: TagSpark }) {
  const mesh = useRef<Mesh>(null);
  useFrame(({ camera }) => {
    if (!mesh.current) return;
    mesh.current.visible = entity.life > 0;
    mesh.current.position.set(entity.x, 1.3, entity.z);
    mesh.current.quaternion.copy(camera.quaternion);
    mesh.current.scale.setScalar(1.8 - entity.life * 2);
  });
  return <mesh ref={mesh}><ringGeometry args={[.18, .24, 12]} /><meshBasicMaterial color={entity.friendly ? '#fff5aa' : '#b197ff'} transparent opacity={.65} depthWrite={false} /></mesh>;
}
function Crystal({ point }: { point: Point }) {
  const mesh = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (mesh.current) { mesh.current.rotation.y = clock.elapsedTime; mesh.current.position.y = .7 + Math.sin(clock.elapsedTime * 2) * .12; }
  });
  return <mesh ref={mesh} position={[point.x, .7, point.z]}><octahedronGeometry args={[.38]} /><meshStandardMaterial color="#7affdd" emissive="#2baea0" emissiveIntensity={.8} /></mesh>;
}
function Launcher({ runtime }: { runtime: Runtime }) {
  const group = useRef<Group>(null);
  useFrame(({ camera }) => {
    if (!group.current) return;
    group.current.position.copy(camera.position); group.current.quaternion.copy(camera.quaternion);
  });
  return <group ref={group}>
    <group position={[.39, -.43, -.8]} rotation={[Math.PI / 2, 0, 0]} scale={.7}>
      <mesh><cylinderGeometry args={[.13, .21, .58, 12]} /><meshStandardMaterial color="#26a6b7" metalness={.5} roughness={.3} /></mesh>
      <mesh position={[0, .28, 0]}><torusGeometry args={[.15, .048, 8, 16]} /><meshBasicMaterial color="#fff3a0" /></mesh>
      <mesh position={[0, .08, .12]}><boxGeometry args={[.18, .3, .16]} /><meshStandardMaterial color="#544193" /></mesh>
      <mesh position={[0, .32, 0]}><sphereGeometry args={[.1, 12, 10]} /><meshBasicMaterial color="#bdfff5" /></mesh>
    </group>
  </group>;
}
function Scene({ runtime, input, snapshot, notify, ready }: Omit<SceneProps, 'pausedLabel' | 'failed'>) {
  const cadence = useRef(0);
  useEffect(ready, [ready]);
  useFrame(({ camera }, delta) => {
    const s = runtime.current;
    stepTag(s, input.current, delta);
    camera.position.set(s.player.x, 1.55, s.player.z);
    camera.rotation.set(0, -s.yaw, 0);
    cadence.current += delta;
    if (cadence.current >= .1 || s.status !== snapshot.status) { cadence.current = 0; notify(snapshotTag(s)); }
  });
  return <>
    <color attach="background" args={['#11213f']} />
    <fog attach="fog" args={['#11213f', 14, 30]} />
    <ambientLight intensity={1.3} />
    <hemisphereLight args={['#badbff', '#384672', 2]} />
    <directionalLight position={[4, 9, 3]} intensity={2} color="#fff2ce" />
    <mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[23, 23]} /><meshStandardMaterial color="#24395b" roughness={.82} /></mesh>
    <gridHelper args={[22, 22, '#598aaa', '#345472']} position={[0, .012, 0]} />
    {ARENA_WALLS.map((wall, index) => <group key={index} position={[wall.x, 0, wall.z]}>
      <mesh position={[0, 2.1, 0]}><boxGeometry args={[wall.w, 4.2, wall.d]} /><meshStandardMaterial color={index < 4 ? '#263c67' : '#4b5088'} roughness={.7} /></mesh>
      <mesh position={[0, .25, 0]}><boxGeometry args={[wall.w + .035, .08, wall.d + .035]} /><meshBasicMaterial color="#53d9ed" /></mesh>
      <mesh position={[0, 3.6, 0]}><boxGeometry args={[wall.w + .035, .09, wall.d + .035]} /><meshBasicMaterial color="#c4afff" /></mesh>
    </group>)}
    {[-8, -4, 0, 4, 8].map(x => <group key={x} position={[x, 2, -10.35]}>
      <mesh><torusGeometry args={[.6, .065, 8, 6]} /><meshBasicMaterial color="#ffc96d" /></mesh>
      <mesh rotation={[0, 0, Math.PI / 4]}><planeGeometry args={[.25, .25]} /><meshBasicMaterial color="#7cebdd" /></mesh>
    </group>)}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .02, -5]}><ringGeometry args={[2, 2.12, 40]} /><meshBasicMaterial color="#d1b2ff" /></mesh>
    <Suspense fallback={null}>
      <Character source={boltAtlas} runtime={runtime} companion="robot" atlas />
      <Character source={sparkyArt} runtime={runtime} companion="pet" />
      {snapshot.monsters.map(monster => <Character key={monster.id} source={alienArt} entity={monster} runtime={runtime} />)}
    </Suspense>
    {snapshot.shots.map(shot => <Shot key={shot.id} entity={shot} />)}
    {snapshot.sparks.map(spark => <Spark key={spark.id} entity={spark} />)}
    {snapshot.crystals.map(crystal => <Crystal key={crystal.id} point={crystal} />)}
    <Launcher runtime={runtime} />
  </>;
}
export default function StarTagScene(props: SceneProps) {
  return <Canvas camera={{ position: [0, 1.55, 7], fov: 72, near: .08, far: 40 }} dpr={[1, 1.5]}
    gl={{ antialias: true, powerPreference: 'high-performance' }}
    onCreated={({ gl }) => {
      const canvas = gl.domElement;
      canvas.setAttribute('aria-label', props.pausedLabel);
      canvas.addEventListener('webglcontextlost', props.failed, { once: true });
    }}
    fallback={<div role="status">{props.pausedLabel}</div>}>
    <Scene {...props} />
  </Canvas>;
}
