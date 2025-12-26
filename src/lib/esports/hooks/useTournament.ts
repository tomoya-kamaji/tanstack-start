import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createInitialTournament,
  loadTournament,
  saveTournament,
} from "../storage";
import type { Tournament } from "../types";

// 大会データを取得
export function useTournament() {
  return useQuery<Tournament>({
    queryKey: ["tournament"],
    queryFn: () => {
      // localStorageから読み込む
      return loadTournament() ?? createInitialTournament();
    },
    initialData: createInitialTournament(),
  });
}

// 大会データをリセット
export function useResetTournament() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const initial = createInitialTournament();
      saveTournament(initial);
      return initial;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["tournament"], data);
    },
  });
}
