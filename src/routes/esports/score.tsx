import { createFileRoute, Link } from "@tanstack/react-router";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { GAME_ICONS, GAME_NAMES, POINTS } from "../../lib/esports/constants";
import { useUpdateRanks } from "../../lib/esports/hooks/useRanks";
import { useTournament } from "../../lib/esports/hooks/useTournament";
import type { GameType, Player } from "../../lib/esports/types";

// ランキングデータの型
type RankingRow = {
  rank: number;
  player: Player;
  mariokart: number;
  marioparty: number;
  bomberman: number;
  total: number;
};

export const Route = createFileRoute("/esports/score")({
  component: ScorePage,
});

// テーブルカラム定義
const columns: ColumnDef<RankingRow>[] = [
  {
    accessorKey: "rank",
    header: "順位",
    cell: ({ getValue }) => (
      <span className="text-cyan-400 font-bold">{getValue() as number}</span>
    ),
  },
  {
    accessorKey: "player.name",
    header: "名前",
    cell: ({ row }) => row.original.player.name,
  },
  {
    accessorKey: "mariokart",
    header: "マリカ",
    cell: ({ getValue }) => {
      const v = getValue() as number;
      return <span className="text-right block">{v || "-"}</span>;
    },
  },
  {
    accessorKey: "marioparty",
    header: "マリパ",
    cell: ({ getValue }) => {
      const v = getValue() as number;
      return <span className="text-right block">{v || "-"}</span>;
    },
  },
  {
    accessorKey: "bomberman",
    header: "ボンバー",
    cell: ({ getValue }) => {
      const v = getValue() as number;
      return <span className="text-right block">{v || "-"}</span>;
    },
  },
  {
    accessorKey: "total",
    header: "合計",
    cell: ({ getValue }) => (
      <span className="text-right block font-bold text-yellow-400">
        {getValue() as number}
      </span>
    ),
  },
];

function ScorePage() {
  const { data: tournament } = useTournament();
  const updateRanks = useUpdateRanks();

  const [selectedGame, setSelectedGame] = useState<GameType>("mariokart");
  const [ranks, setRanks] = useState<Record<string, number>>({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: "total", desc: true },
  ]);

  // 現在の種目の順位データを初期化
  const currentRanks = tournament.ranks[selectedGame];

  // 編集中の順位をマージしたランクデータ
  const mergedRanks = useMemo(() => {
    return { ...currentRanks, ...ranks };
  }, [currentRanks, ranks]);

  // ランキングを計算
  const ranking = useMemo((): RankingRow[] => {
    const playerScores = tournament.players.map((player) => {
      // 編集中の順位を優先、なければ保存済みの順位を使用
      const getRank = (gameType: "mariokart" | "marioparty" | "bomberman") => {
        const merged =
          gameType === selectedGame ? mergedRanks : tournament.ranks[gameType];
        return merged[player.id];
      };

      const mariokartRank = getRank("mariokart");
      const mariopartyRank = getRank("marioparty");
      const bombermanRank = getRank("bomberman");

      const mariokartPoints = mariokartRank
        ? (POINTS.mariokart[mariokartRank - 1] ?? 0)
        : 0;
      const mariopartyPoints = mariopartyRank
        ? (POINTS.marioparty[mariopartyRank - 1] ?? 0)
        : 0;
      const bombermanPoints = bombermanRank
        ? (POINTS.bomberman[bombermanRank - 1] ?? 0)
        : 0;

      return {
        rank: 0, // 後で設定
        player,
        mariokart: mariokartPoints,
        marioparty: mariopartyPoints,
        bomberman: bombermanPoints,
        total: mariokartPoints + mariopartyPoints + bombermanPoints,
      };
    });

    // ソートして順位を設定
    const sorted = playerScores.sort((a, b) => b.total - a.total);
    return sorted.map((item, index) => ({ ...item, rank: index + 1 }));
  }, [tournament, selectedGame, mergedRanks]);

  // TanStack Table 設定
  const table = useReactTable({
    data: ranking,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleRankChange = (rank: number, playerId: string) => {
    setRanks((prev) => {
      const newRanks = { ...prev };

      // 同じ順位が既に選択されている場合は解除
      if (newRanks[playerId] === rank) {
        delete newRanks[playerId];
        return newRanks;
      }

      // 同じ順位を他のプレイヤーが持っている場合は解除
      Object.keys(newRanks).forEach((pid) => {
        if (newRanks[pid] === rank && pid !== playerId) {
          delete newRanks[pid];
        }
      });

      newRanks[playerId] = rank;
      return newRanks;
    });
  };

  const handleSave = async () => {
    try {
      await updateRanks.mutateAsync({
        gameType: selectedGame,
        ranks: mergedRanks,
      });
      setRanks({});
    } catch (error) {
      alert(error instanceof Error ? error.message : "エラーが発生しました");
    }
  };

  const availablePlayers = tournament.players.filter(
    (p) => !ranks[p.id] || ranks[p.id] === currentRanks[p.id],
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* ヘッダー */}
      <header className="border-b border-magenta-500/20 bg-[#1a1a2e]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-magenta-400">
              📊 ポイント入力
            </h1>
            <Link
              to="/esports"
              className="px-4 py-2 rounded border border-magenta-500/30 hover:border-magenta-500 hover:bg-magenta-500/10 transition-colors"
            >
              ← 戻る
            </Link>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-8">
        {/* 種目タブ */}
        <section className="mb-8">
          <div className="flex gap-4 border-b border-magenta-500/20">
            {(["mariokart", "marioparty", "bomberman"] as GameType[]).map(
              (game) => (
                <button
                  key={game}
                  type="button"
                  onClick={() => {
                    setSelectedGame(game);
                    setRanks({});
                  }}
                  className={`px-6 py-3 font-bold transition-colors ${
                    selectedGame === game
                      ? "border-b-2 border-magenta-500 text-magenta-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {GAME_ICONS[game]} {GAME_NAMES[game]}
                </button>
              ),
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 順位入力 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-magenta-400">
              順位入力
            </h2>
            <div className="bg-[#1a1a2e]/80 backdrop-blur-sm rounded-lg border border-magenta-500/20 p-6">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6, 7].map((rank) => {
                  const playerId =
                    Object.keys(ranks).find((pid) => ranks[pid] === rank) ??
                    Object.keys(currentRanks).find(
                      (pid) => currentRanks[pid] === rank,
                    );
                  const player = playerId
                    ? tournament.players.find((p) => p.id === playerId)
                    : null;

                  return (
                    <div
                      key={rank}
                      className="flex items-center gap-4 p-3 rounded border border-magenta-500/10"
                    >
                      <span className="text-magenta-400 font-bold min-w-[60px]">
                        {rank}位:
                      </span>
                      <select
                        value={playerId || ""}
                        onChange={(e) => {
                          if (e.target.value) {
                            handleRankChange(rank, e.target.value);
                          }
                        }}
                        className="flex-1 px-3 py-2 bg-[#0a0a0f] border border-magenta-500/30 rounded text-white focus:outline-none focus:border-magenta-500"
                      >
                        <option value="">---</option>
                        {availablePlayers.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      {player && (
                        <span className="text-gray-400 text-sm">
                          {player.name}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={handleSave}
                disabled={updateRanks.isPending}
                className="mt-6 w-full px-6 py-3 bg-magenta-500 hover:bg-magenta-600 disabled:opacity-50 disabled:cursor-not-allowed rounded font-bold transition-colors"
              >
                保存
              </button>
            </div>

            {/* ポイント表 */}
            <div className="mt-6 bg-[#1a1a2e]/80 backdrop-blur-sm rounded-lg border border-yellow-500/20 p-6">
              <h3 className="text-lg font-bold mb-3 text-yellow-400">
                ポイント表
              </h3>
              <div className="space-y-1 text-sm">
                {POINTS[selectedGame].map((point, index) => (
                  <div
                    key={`${selectedGame}-${index}-${point}`}
                    className="flex justify-between"
                  >
                    <span className="text-gray-300">{index + 1}位:</span>
                    <span className="text-yellow-400 font-bold">{point}pt</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ランキング（TanStack Table） */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-cyan-400">
              現在のランキング
              <span className="text-sm font-normal text-gray-400 ml-2">
                （ヘッダーをクリックでソート）
              </span>
            </h2>
            <div className="bg-[#1a1a2e]/80 backdrop-blur-sm rounded-lg border border-cyan-500/20 p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr
                        key={headerGroup.id}
                        className="border-b border-cyan-500/20"
                      >
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className={`py-2 text-cyan-400 cursor-pointer select-none hover:text-cyan-300 transition-colors ${
                              header.id === "total"
                                ? "text-right font-bold"
                                : header.id.includes("mariokart") ||
                                    header.id.includes("marioparty") ||
                                    header.id.includes("bomberman")
                                  ? "text-right"
                                  : "text-left"
                            }`}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            <div className="flex items-center gap-1">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                              {{
                                asc: " 🔼",
                                desc: " 🔽",
                              }[header.column.getIsSorted() as string] ?? ""}
                            </div>
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-cyan-500/10 hover:bg-cyan-500/5 transition-colors"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="py-2">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
