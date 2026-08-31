import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ROBOT_ACTIONS } from "../FeatureArt";
import { RobotStage } from "../RobotStage";
import { starterRobot } from "../storage";
import { ROBOT_MOVEMENTS } from "../world/RoboLab";
import { PremiumBoltBotSprite } from "./PremiumBoltBotSprite";
import { PREMIUM_BOLTBOT_POSES, premiumBoltBotPose } from "./canonicalBoltBotArt";

describe("premium illustrated BoltBot art", () => {
  it("provides eight authored 2D poses and maps every existing action", () => {
    expect(PREMIUM_BOLTBOT_POSES).toHaveLength(8);
    for (const action of ROBOT_ACTIONS) {
      expect(PREMIUM_BOLTBOT_POSES).toContain(premiumBoltBotPose(action.pose));
    }
  });

  it("offers only movements with six distinct authored poses", () => {
    expect(ROBOT_MOVEMENTS).toHaveLength(6);
    expect(new Set(ROBOT_MOVEMENTS.map((action) => premiumBoltBotPose(action.pose))).size).toBe(6);
  });

  it("renders the local atlas instead of the angular SVG placeholder", () => {
    const robot = starterRobot("Nico");
    const html = renderToStaticMarkup(<RobotStage robot={robot} pose="repair" />);

    expect(html).toContain('data-robot-stage="premium-2d"');
    expect(html).toContain('data-boltbot-renderer="premium-2d"');
    expect(html).toContain('data-boltbot-pose="repair"');
    expect(html).toContain("boltbot-premium-poses-atlas");
    expect(html).not.toContain("<svg");
  });

  it("keeps the saved robot palette visible as local art direction", () => {
    const robot = { ...starterRobot("Nico"), color: "Emerald", secondary_color: "Gold" };
    const html = renderToStaticMarkup(<PremiumBoltBotSprite robot={robot} action="scan" alt="Scanning BoltBot" />);

    expect(html).toContain('data-boltbot-pose="scan"');
    expect(html).toContain('aria-label="Scanning BoltBot"');
    expect(html).toContain("--boltbot-primary");
    expect(html).toContain("--boltbot-accent");
  });
});
