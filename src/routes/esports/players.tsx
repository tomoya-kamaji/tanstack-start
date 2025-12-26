import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MAX_PLAYERS } from "../../lib/esports/constants";
import {
  useAddPlayer,
  useDeletePlayer,
  useUpdatePlayer,
} from "../../lib/esports/hooks/usePlayers";
import { useTournament } from "../../lib/esports/hooks/useTournament";

export const Route = createFileRoute("/esports/players")({
  component: PlayersPage,
});

function PlayersPage() {
  const { data: tournament } = useTournament();
  const addPlayer = useAddPlayer();
  const updatePlayer = useUpdatePlayer();
  const deletePlayer = useDeletePlayer();

  const [newPlayerName, setNewPlayerName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleAdd = async () => {
    if (!newPlayerName.trim()) return;

    try {
      await addPlayer.mutateAsync(newPlayerName);
      setNewPlayerName("");
    } catch (error) {
      alert(error instanceof Error ? error.message : "エラーが発生しました");
    }
  };

  const handleStartEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editingName.trim()) return;

    try {
      await updatePlayer.mutateAsync({ id: editingId, name: editingName });
      setEditingId(null);
      setEditingName("");
    } catch (error) {
      alert(error instanceof Error ? error.message : "エラーが発生しました");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("この参加者を削除しますか？")) return;

    try {
      await deletePlayer.mutateAsync(id);
    } catch (error) {
      alert(error instanceof Error ? error.message : "エラーが発生しました");
    }
  };

  const canAdd = tournament.players.length < MAX_PLAYERS;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* ヘッダー */}
      <header className="border-b border-cyan-500/20 bg-[#1a1a2e]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-cyan-400">👥 参加者管理</h1>
            <Link
              to="/esports"
              className="px-4 py-2 rounded border border-cyan-500/30 hover:border-cyan-500 hover:bg-cyan-500/10 transition-colors"
            >
              ← 戻る
            </Link>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-8">
        {/* 参加者登録 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-cyan-400">
            参加者登録（{tournament.players.length}/{MAX_PLAYERS}人）
          </h2>
          <div className="bg-[#1a1a2e]/80 backdrop-blur-sm rounded-lg border border-cyan-500/20 p-6">
            <div className="flex gap-4">
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="名前を入力..."
                disabled={!canAdd || addPlayer.isPending}
                className="flex-1 px-4 py-2 bg-[#0a0a0f] border border-cyan-500/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleAdd}
                disabled={
                  !canAdd || addPlayer.isPending || !newPlayerName.trim()
                }
                className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed rounded font-bold transition-colors"
              >
                追加
              </button>
            </div>
            {!canAdd && (
              <p className="mt-2 text-sm text-yellow-400">
                最大{MAX_PLAYERS}人まで登録できます
              </p>
            )}
            {addPlayer.isError && (
              <p className="mt-2 text-sm text-red-400">
                {addPlayer.error instanceof Error
                  ? addPlayer.error.message
                  : "エラーが発生しました"}
              </p>
            )}
          </div>
        </section>

        {/* 登録済み参加者 */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-magenta-400">
            登録済み参加者
          </h2>
          {tournament.players.length === 0 ? (
            <div className="bg-[#1a1a2e]/80 backdrop-blur-sm rounded-lg border border-magenta-500/20 p-6 text-center text-gray-400">
              参加者が登録されていません
            </div>
          ) : (
            <div className="space-y-2">
              {tournament.players.map((player, index) => (
                <div
                  key={player.id}
                  className="bg-[#1a1a2e]/80 backdrop-blur-sm rounded-lg border border-magenta-500/20 p-4 flex items-center gap-4"
                >
                  <span className="text-magenta-400 font-bold min-w-[40px]">
                    {index + 1}.
                  </span>
                  {editingId === player.id ? (
                    <>
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit();
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                        className="flex-1 px-3 py-1 bg-[#0a0a0f] border border-magenta-500/30 rounded text-white focus:outline-none focus:border-magenta-500"
                      />
                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        disabled={updatePlayer.isPending}
                        className="px-4 py-1 bg-magenta-500 hover:bg-magenta-600 disabled:opacity-50 rounded text-sm transition-colors"
                      >
                        保存
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-4 py-1 bg-gray-600 hover:bg-gray-700 rounded text-sm transition-colors"
                      >
                        キャンセル
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-white">{player.name}</span>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(player.id, player.name)}
                        className="px-4 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded text-sm transition-colors"
                      >
                        編集
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(player.id)}
                        disabled={deletePlayer.isPending}
                        className="px-4 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded text-sm transition-colors disabled:opacity-50"
                      >
                        削除
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
