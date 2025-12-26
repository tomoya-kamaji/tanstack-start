import { STORAGE_KEY } from "./constants";
import type { Tournament } from "./types";

// 大会データをlocalStorageから読み込む
export function loadTournament(): Tournament | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }
    return JSON.parse(stored) as Tournament;
  } catch (error) {
    console.error("Failed to load tournament data:", error);
    return null;
  }
}

// 大会データをlocalStorageに保存
export function saveTournament(tournament: Tournament): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tournament));
  } catch (error) {
    console.error("Failed to save tournament data:", error);
  }
}

// 大会データを削除（リセット）
export function clearTournament(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear tournament data:", error);
  }
}

// 初期データを作成
export function createInitialTournament(): Tournament {
  return {
    players: [],
    ranks: {
      mariokart: {},
      marioparty: {},
      bomberman: {},
    },
  };
}
