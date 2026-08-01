import { useEffect, useMemo, useState } from "react";
import { RobotStage } from "./RobotStage";
import type { Bootstrap, Mission, WorldLocation } from "./types";
import "./styles.css";

const fallback: Bootstrap = {
  api_version: "offline",
  save_schema_version: 4,
  starter_robot: {
    id: "starter-boltbot", name: "BoltBot", color: "Electric Blue",
    secondary_color: "Sunny Yellow", head: "mecha_vanguard", eyes: "mecha_visor",
    body: "mecha_reactor_frame", arms: "mecha_photon_blades",
    base: "mecha_vernier_legs", backpack: "mecha_wing_binders",
    power: "mecha_star_reactor", personality: "Brave Guardian", level: 1, xp: 0
  },
  locations: [
    { id: "robo-city", name: "Robo City", emoji: "🤖", description: "Build and train robot friends.", stars_required: 0, route: "/robots" },
    { id: "animal-forest", name: "Animal Forest", emoji: "🌳", description: "Explore habitats and rescue animals.", stars_required: 0, route: "/animals" },
    { id: "monster-mountain", name: "Monster Mountain", emoji: "👾", description: "Create friendly monsters.", stars_required: 8, route: "/monsters" },
    { id: "story-castle", name: "Story Castle", emoji: "🏰", description: "Turn creations into adventures.", stars_required: 12, route: "/stories" }
  ],
  missions: []
};

function LocationCard({ location, stars, onOpen }: { location: WorldLocation; stars: number; onOpen: () => void }) {
  const locked = stars < location.stars_required;
  return (
    <button className={`location-card ${locked ? "location-card--locked" : ""}`} onClick={onOpen} disabled={locked}>
      <span className="location-card__icon">{location.emoji}</span>
      <span><strong>{location.name}</strong><small>{location.description}</small></span>
      <span className="location-card__gate">{locked ? `🔒 ${location.stars_required}⭐` : "ENTER"}</span>
    </button>
  );
}

function MissionPanel({ mission }: { mission: Mission | undefined }) {
  if (!mission) return <div className="mission-card"><span>📡</span><p>New missions will arrive from Robo Command.</p></div>;
  return (
    <article className="mission-card">
      <header><span>MISSION</span><b>+{mission.reward_stars} ⭐</b></header>
      <h2>{mission.title}</h2><p>{mission.description}</p>
      <ol>{mission.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ol>
      <button>Start Mission</button>
    </article>
  );
}

export default function App() {
  const [data, setData] = useState<Bootstrap>(fallback);
  const [stars, setStars] = useState(() => Number(localStorage.getItem("nicos-stars") || 0));
  const [selected, setSelected] = useState("robo-city");
  const [pose, setPose] = useState<"idle" | "launch" | "celebrate">("idle");

  useEffect(() => {
    fetch("/api/v1/bootstrap").then((response) => response.ok ? response.json() : Promise.reject())
      .then(setData).catch(() => setData(fallback));
    navigator.serviceWorker?.register("/sw.js").catch(() => undefined);
  }, []);

  const chosen = useMemo(() => data.locations.find((item) => item.id === selected) ?? data.locations[0], [data, selected]);
  const mission = data.missions[0];

  const testReward = () => {
    const next = stars + 1;
    setStars(next); localStorage.setItem("nicos-stars", String(next));
    setPose("celebrate"); window.setTimeout(() => setPose("idle"), 1200);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div><span className="eyebrow">ROBO COMMAND ONLINE</span><h1>Nico’s World</h1></div>
        <div className="star-counter"><span>⭐</span><strong>{stars}</strong><small>WORLD STARS</small></div>
      </header>

      <section className="command-grid">
        <div className="robot-column">
          <RobotStage robot={data.starter_robot} pose={pose} />
          <div className="action-row">
            <button onClick={() => setPose("launch")}>🚀 Launch Pose</button>
            <button onClick={testReward}>✨ Test Reward</button>
          </div>
        </div>

        <div className="world-column">
          <div className="world-heading"><span>SELECT DESTINATION</span><b>{chosen?.name}</b></div>
          <div className="world-map">
            {data.locations.map((location) => (
              <LocationCard key={location.id} location={location} stars={stars} onOpen={() => setSelected(location.id)} />
            ))}
          </div>
          <MissionPanel mission={mission} />
        </div>
      </section>

      <nav className="dock" aria-label="Main navigation">
        <button className="dock__active">🌐<span>World</span></button>
        <button>🤖<span>Robots</span></button>
        <button>📜<span>Missions</span></button>
        <button>🏠<span>Home</span></button>
        <button>⚙️<span>Parent</span></button>
      </nav>
    </main>
  );
}
