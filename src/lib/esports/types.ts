// 参加者
export type Player = {
  id: string;
  name: string;
};

// 種目
export type GameType = "mariokart" | "marioparty" | "bomberman";

// 種目別順位（playerId → 順位 1-7）
export type GameRanks = {
  mariokart: Record<string, number>;
  marioparty: Record<string, number>;
  bomberman: Record<string, number>;
};

// 大会データ
export type Tournament = {
  players: Player[];
  ranks: GameRanks;
};
