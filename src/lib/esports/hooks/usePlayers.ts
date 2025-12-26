import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MAX_PLAYERS } from "../constants";
import { saveTournament } from "../storage";
import type { Player, Tournament } from "../types";

// 参加者を追加
export function useAddPlayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const tournament = queryClient.getQueryData<Tournament>(["tournament"]);
      if (!tournament) {
        throw new Error("Tournament data not found");
      }

      // 最大人数チェック
      if (tournament.players.length >= MAX_PLAYERS) {
        throw new Error(`最大${MAX_PLAYERS}人まで登録できます`);
      }

      // 重複チェック
      if (tournament.players.some((p) => p.name === name.trim())) {
        throw new Error("同じ名前の参加者が既に登録されています");
      }

      const newPlayer: Player = {
        id: crypto.randomUUID(),
        name: name.trim(),
      };

      const updated: Tournament = {
        ...tournament,
        players: [...tournament.players, newPlayer],
      };

      saveTournament(updated);
      return updated;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["tournament"], data);
    },
  });
}

// 参加者を更新
export function useUpdatePlayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const tournament = queryClient.getQueryData<Tournament>(["tournament"]);
      if (!tournament) {
        throw new Error("Tournament data not found");
      }

      // 重複チェック（自分以外）
      if (
        tournament.players.some((p) => p.id !== id && p.name === name.trim())
      ) {
        throw new Error("同じ名前の参加者が既に登録されています");
      }

      const updated: Tournament = {
        ...tournament,
        players: tournament.players.map((p) =>
          p.id === id ? { ...p, name: name.trim() } : p,
        ),
      };

      saveTournament(updated);
      return updated;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["tournament"], data);
    },
  });
}

// 参加者を削除
export function useDeletePlayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const tournament = queryClient.getQueryData<Tournament>(["tournament"]);
      if (!tournament) {
        throw new Error("Tournament data not found");
      }

      // 順位データからも削除
      const updated: Tournament = {
        ...tournament,
        players: tournament.players.filter((p) => p.id !== id),
        ranks: {
          mariokart: Object.fromEntries(
            Object.entries(tournament.ranks.mariokart).filter(
              ([pid]) => pid !== id,
            ),
          ),
          marioparty: Object.fromEntries(
            Object.entries(tournament.ranks.marioparty).filter(
              ([pid]) => pid !== id,
            ),
          ),
          bomberman: Object.fromEntries(
            Object.entries(tournament.ranks.bomberman).filter(
              ([pid]) => pid !== id,
            ),
          ),
        },
      };

      saveTournament(updated);
      return updated;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["tournament"], data);
    },
  });
}
