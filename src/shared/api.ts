export type InitResponse = {
  type: "init";
  postId: string;
  count: number;
  username: string;
};

export type IncrementResponse = {
  type: "increment";
  postId: string;
  count: number;
};

export type DecrementResponse = {
  type: "decrement";
  postId: string;
  count: number;
};

export type HighscoreResponse = {
  type: "highscore";
  username: string;
  highscore: number;
};

export type LeaderboardEntry = {
  username: string;
  score: number;
  timestamp: string;
};

export type LeaderboardsData = {
  score: LeaderboardEntry[];
  trident: LeaderboardEntry[];
  lightning: LeaderboardEntry[];
  nova: LeaderboardEntry[];
  poison: LeaderboardEntry[];
};

export type LeaderboardGetResponse = {
  status: 'success';
  leaderboards: LeaderboardsData;
};

export type LeaderboardPostResponse = {
  status: 'success';
  username: string;
  leaderboards: LeaderboardsData;
};

export type UpgradesData = {
  speed: number;
  damage: number;
  hp: number;
  pickup: number;
};

export type WelcomeBonusData = {
  type: 'score' | 'orbs' | 'hp' | 'doubleKills';
  value: number;
  claimed: boolean;
};

export type PlayerProgressResponse = {
  username: string;
  streak: number;
  lastPlayed: string;
  xp: number;
  level: number;
  upgrades: UpgradesData;
  welcomeBonus: WelcomeBonusData;
  lastScore: number;
};

export type StreakResponse = {
  streak: number;
  bonusMultiplier: number;
  lastPlayed: string;
};

export type XpResponse = {
  xp: number;
  level: number;
  leveledUp: boolean;
  availableUpgrades: string[];
};

export type UpgradeResponse = {
  status: 'success';
  upgrades: UpgradesData;
};

export type WelcomeResponse = {
  status: 'success';
  welcomeBonus: WelcomeBonusData;
};
