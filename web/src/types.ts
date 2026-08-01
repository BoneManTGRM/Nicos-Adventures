export type Robot = {
  id: string;
  name: string;
  color: string;
  secondary_color: string;
  head: string;
  eyes: string;
  body: string;
  arms: string;
  base: string;
  backpack: string;
  power: string;
  personality: string;
  level: number;
  xp: number;
};

export type WorldLocation = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  stars_required: number;
  route: string;
};

export type Mission = {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  reward_stars: number;
  destination: string;
};

export type Bootstrap = {
  api_version: string;
  save_schema_version: number;
  locations: WorldLocation[];
  missions: Mission[];
  starter_robot: Robot;
};
