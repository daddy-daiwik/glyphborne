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

