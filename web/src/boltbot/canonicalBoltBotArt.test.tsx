import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ROBOT_ACTIONS } from "../FeatureArt";
import { RobotStage } from "../RobotStage";
import { starterRobot } from "../storage";
import { PremiumBoltBotSprite } from "./PremiumBoltBotSprite";
import { PREMIUM_BOLTBOT_POSES, premiumBoltBotPose } from "./canonicalBoltBotArt";

describe("premium illustrated BoltBot art", () => {
  it("provides eight authored 2D poses and maps every existing action", () => {
    expect(PREMIUM_BOLTBOT_POSES).toHaveLength(8);
    for (const action of ROBOT_ACTIONS) expect(PREMIUM_BOLTBOT_POSES).toContain(premiumBoltBotPose(action.pose));
  });

  it("renders the premium atlas with a fitted customization layer", () => {
    const html = renderToStaticMarkup(<RobotStage robot={starterRobot("Nico")} pose="repair" />);
    expect(html).toContain('data-robot-stage="premium-2d"');
    expect(html).toContain('data-boltbot-renderer="premium-customized-2d"');
    expect(html).toContain('data-boltbot-pose="repair"');
    expect(html).toContain("boltbot-premium-poses-atlas");
    expect(html).toContain("premium-boltbot-sprite__custom");
    expect(html).toContain('data-boltbot-head=');
  });

  it("makes every saved visual choice part of the rendered robot", () => {
    const robot = {
      ...starterRobot("Nico"),
      color: "Emerald Green", secondary_color: "Gold", head: "Crystal Crown",
      eyes: "Six Sensor Array", body: "Heavy Titan", arms: "Rocket Fists",
      base: "Hover Ring", backpack: "Solar Wings", power: "Portal Generator",
      personality: "Curious Explorer", mood: "Focused", voice: "Musical Chime",
    };
    const html = renderToStaticMarkup(<PremiumBoltBotSprite robot={robot} action="scan" alt="Scanning BoltBot" />);
    for (const value of [robot.head, robot.eyes, robot.body, robot.arms, robot.base, robot.backpack, robot.power, robot.personality, robot.mood, robot.voice]) {
      expect(html).toContain(value);
    }
    expect(html).toContain("--boltbot-primary");
    expect(html).toContain("--boltbot-accent");
    expect(html).toContain("<svg");
  });
});
