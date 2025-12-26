import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveTournament } from "../storage";
import type { GameType, Tournament } from "../types";

// 順位を更新
export function useUpdateRanks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      gameType,
      ranks,
    }: {
      gameType: GameType;
      ranks: Record<string, number>;
    }) => {
      const tournament = queryClient.getQueryData<Tournament>(["tournament"]);
      if (!tournament) {
        throw new Error("Tournament data not found");
      }

      const updated: Tournament = {
        ...tournament,
        ranks: {
          ...tournament.ranks,
          [gameType]: ranks,
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
