import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { CanonicalNico, type NicoAnimation } from "./CanonicalNico";
import { GameCanvas } from "../GameCanvas";

const clips: NicoAnimation[] = ["Idle", "Walk", "Run", "Celebrate"];

function Preview() {
  const [animation, setAnimation] = useState<NicoAnimation>("Idle");
  return (
    <main className="preview">
      <h1>Canonical Nico 3D Review · {animation}</h1>
      <GameCanvas
        controls={clips.map((clip) => <button type="button" key={clip} onClick={() => setAnimation(clip)}>{clip}</button>)}
        labels={{
          scene: "Canonical Nico 3D review",
          loading: "Loading Nico.",
          ready: "Nico is ready.",
          contextLost: "The 3D view paused.",
          contextRestored: "The 3D view resumed.",
          unavailable: "The 3D review is unavailable.",
          instructions: "Review Nico's identity, proportions, materials, and animation clips.",
        }}
      >
        <CanonicalNico animation={animation} />
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <circleGeometry args={[3.5, 64]} />
          <meshStandardMaterial color="#162848" roughness={0.92} />
        </mesh>
      </GameCanvas>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<StrictMode><Preview /></StrictMode>);
