import type { LocalProfile } from "../types";
import {
  reduceStarBridge,
  type StarBridgeEvent,
} from "./goldenAdventure";

export function applyStarBridgeEvent(
  profile: LocalProfile,
  event: StarBridgeEvent,
  now?: () => string,
): LocalProfile {
  const current = profile.adventures.starBridge;
  const next = reduceStarBridge(current, event, now);
  if (next === current) return profile;

  return {
    ...awardHomecoming(profile, next.step === "complete"),
    adventures: {
      ...profile.adventures,
      starBridge: next,
    },
  };
}

export const CONSTELLATION = "Star Bridge Constellation";
export function awardHomecoming(profile: LocalProfile, complete = profile.adventures.starBridge.step === "complete"): LocalProfile {
  if (!complete || profile.completedMissions.includes("homecoming:star-bridge")) return profile;
  const es = profile.language === "es-MX";
  const pet = profile.pets.find(item => item.id === profile.activePetId);
  const team = ["Nico", profile.robot.name, pet?.name].filter(Boolean).join(", ");
  return { ...profile,
    completedMissions: [...profile.completedMissions, "homecoming:star-bridge"],
    decorations: [...new Set([...profile.decorations, CONSTELLATION])],
    stories: [...profile.stories, {
      id: "adventure-star-bridge", language: profile.language,
      title: es ? "El puente que volvimos a iluminar" : "The bridge we brought back to life",
      hero: "Nico", companion: team, place: es ? "Puente Estelar" : "Star Bridge",
      problem: es ? "El puente se quedó sin luz." : "The bridge had gone dark.",
      ending: es ? "Volvimos a casa con una constelación." : "We brought a constellation home.",
      pages: es ? [
        `${team} salieron de casa para explorar juntos.`,
        `En el laboratorio, ${profile.robot.name} probó movimiento, escáner y lógica.`,
        "Inspeccionamos el puente y encontramos la falla. Instalamos el Núcleo Estelar.",
        "¡El puente se iluminó! Ahora podemos explorar el Valle de Dinosaurios.",
        "Trajimos una constelación a casa. Cada estrella nos recuerda lo que hicimos juntos."
      ] : [
        `${team} left home to explore together.`,
        `In the lab, ${profile.robot.name} tested movement, scanning and logic.`,
        "We inspected the bridge and found the fault. We installed the Star Core.",
        "The bridge lit up! Now we can explore Dinosaur Valley.",
        "We brought a constellation home. Every star reminds us what we did together."
      ]
    }].slice(-60)
  };
}
