import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ROBOT_ACTIONS, ROBOT_JOBS, type RobotPose } from "../FeatureArt";
import { RobotStage } from "../RobotStage";
import type { LocalProfile, SectionId } from "../types";
import { tr, ui } from "../i18n/core";
import { optionLabel } from "../i18n/options";
import { boltBotChamberStage } from "../game/boltBot";
import type { StarBridgeEvent } from "../game/goldenAdventure";
import { applyStarBridgeEvent } from "../game/goldenAdventureProfile";
import type { Announce, UpdateProfile } from "./common";
import "./robo-lab.css";

const BoltBotTestChamber = lazy(() => import("./BoltBotTestChamber").then((module) => ({
  default: module.BoltBotTestChamber,
})));

const RELIABLE_MOVEMENT_POSES = new Set<RobotPose>(["wave", "launch", "scan", "repair", "lights", "celebrate"]);
export const ROBOT_MOVEMENTS = ROBOT_ACTIONS.filter((action) => RELIABLE_MOVEMENT_POSES.has(action.pose));

export function RoboLab({
  profile,
  update,
  announce,
  open,
}: {
  profile: LocalProfile;
  update: UpdateProfile;
  announce: Announce;
  open: (id: SectionId) => void;
}) {
  const language = profile.language;
  const [pose, setPose] = useState<RobotPose>("idle");
  const motionTimer = useRef<number | null>(null);
  const robot = profile.robot;
  const selectedJob = robot.job || ROBOT_JOBS[0];
  const chamberStage = boltBotChamberStage(profile.adventures.starBridge.step);

  useEffect(() => () => {
    if (motionTimer.current !== null) window.clearTimeout(motionTimer.current);
  }, []);

  const play = (next: RobotPose) => {
    if (motionTimer.current !== null) window.clearTimeout(motionTimer.current);
    setPose(next);
    motionTimer.current = window.setTimeout(() => {
      setPose("idle");
      motionTimer.current = null;
    }, 1800);
  };

  const configureForAdventure = () => {
    const configured = applyStarBridgeEvent(profile, { type: "CONFIGURE_ROBOT" });
    update(configured);
    play("celebrate");
    announce(language === "es-MX"
      ? `${robot.name} está listo para la cámara de pruebas.`
      : `${robot.name} is ready for the test chamber.`);
  };

  const advanceAdventure = (event: StarBridgeEvent) => {
    const next = applyStarBridgeEvent(profile, event);
    if (next === profile) return;
    update(next);
    const messages: Partial<Record<StarBridgeEvent["type"], { en: string; "es-MX": string }>> = {
      PASS_MOVEMENT_TEST: { en: "Movement test passed.", "es-MX": "Prueba de movimiento aprobada." },
      PASS_SCANNER_TEST: { en: "Scanner test passed.", "es-MX": "Prueba del escáner aprobada." },
      PASS_LOGIC_TEST: { en: "BoltBot passed the test chamber!", "es-MX": "¡BoltBot aprobó la cámara de pruebas!" },
    };
    const message = messages[event.type];
    if (message) announce(message[language]);
  };

  return (
    <>
      {chamberStage !== "inactive" && chamberStage !== "configuration" ? (
        <Suspense fallback={<div className="fw-empty" role="status">{language === "es-MX" ? "Preparando la cámara de pruebas…" : "Preparing the test chamber…"}</div>}>
          <BoltBotTestChamber
            state={profile.adventures.starBridge}
            robot={robot}
            language={language}
            advance={advanceAdventure}
            returnToMap={() => open("world-map")}
          />
        </Suspense>
      ) : null}

      <div className="robo-lab-workbench robo-lab-workbench--simple">
        <section className="robo-lab-stage" aria-label={tr(ui.robotPreview, language)}>
          <RobotStage
            robot={robot}
            pose={pose}
            statusLabel={optionLabel(selectedJob, language)}
            levelLabel={tr(ui.levelShort, language)}
          />
          <details className="robo-lab-disclosure robo-lab-motion" open>
            <summary>{language === "es-MX" ? "Movimientos de BoltBot" : "BoltBot movements"}</summary>
            <div className="robot-action-grid" role="group" aria-label={language === "es-MX" ? "Movimientos del robot" : "Robot movements"}>
              {ROBOT_MOVEMENTS.map((action) => (
                <button
                  type="button"
                  key={action.pose}
                  aria-pressed={pose === action.pose}
                  className={pose === action.pose ? "active" : ""}
                  onClick={() => play(action.pose)}
                >
                  <span aria-hidden="true">{action.icon}</span> {language === "es-MX" ? action.es : action.en}
                </button>
              ))}
            </div>
            {chamberStage === "configuration" ? (
              <button type="button" className="fw-primary robo-lab-test-button" onClick={configureForAdventure}>
                🧪 {language === "es-MX" ? "Continuar a la cámara de pruebas" : "Continue to the test chamber"}
              </button>
            ) : null}
          </details>
        </section>
      </div>
    </>
  );
}
