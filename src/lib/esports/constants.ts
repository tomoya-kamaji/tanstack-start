import type { GameType } from "./types";

// ポイント配分テーブル（順位1-7に対応）
export const POINTS: Record<GameType, number[]> = {
  mariokart: [15, 10, 7, 5, 4, 3, 2],
  marioparty: [15, 10, 7, 5, 4, 3, 2],
  bomberman: [20, 14, 10, 7, 5, 4, 3],
};

// 種目名
export const GAME_NAMES: Record<GameType, string> = {
  mariokart: "マリオカート",
  marioparty: "マリオパーティ",
  bomberman: "ボンバーマン",
};

// 種目アイコン（絵文字）
export const GAME_ICONS: Record<GameType, string> = {
  mariokart: "🏎️",
  marioparty: "🎲",
  bomberman: "💣",
};

// タイムライン
export type TimelineItem = {
  time: string;
  title: string;
  description?: string;
};

export const TIMELINE: TimelineItem[] = [
  { time: "0:00〜0:10", title: "開会・ルール説明" },
  { time: "0:10〜1:00", title: "種目① マリオカート" },
  { time: "1:00〜1:10", title: "休憩" },
  { time: "1:10〜2:00", title: "種目② マリオパーティ" },
  { time: "2:00〜2:10", title: "休憩" },
  { time: "2:10〜2:50", title: "種目③ ボンバーマン" },
  { time: "2:50〜3:00", title: "結果発表・表彰" },
];

// 最大参加者数
export const MAX_PLAYERS = 7;

// localStorage キー
export const STORAGE_KEY = "esports-tournament";
