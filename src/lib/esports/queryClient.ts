import { QueryClient } from "@tanstack/react-query";
import {
  createInitialTournament,
  loadTournament,
  saveTournament,
} from "./storage";
import type { Tournament } from "./types";

// QueryClientを作成
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity, // localStorageから読み込むので、常に最新とみなす
      gcTime: Infinity, // ガベージコレクションしない
    },
  },
});

// localStorageからデータを読み込んでQueryClientに設定
export function initializeQueryClient(): void {
  const tournament = loadTournament() ?? createInitialTournament();

  queryClient.setQueryData<Tournament>(["tournament"], tournament);
}

// QueryClientの変更を監視してlocalStorageに保存（クライアントサイドでのみ）
if (typeof window !== "undefined") {
  queryClient.getQueryCache().subscribe((event) => {
    if (event?.type === "updated") {
      const data = queryClient.getQueryData<Tournament>(["tournament"]);
      if (data) {
        saveTournament(data);
      }
    }
  });
}
