import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { POINTS } from "../../lib/esports/constants";
import { useTournament } from "../../lib/esports/hooks/useTournament";

export const Route = createFileRoute("/esports/result")({
  component: ResultPage,
});

function ResultPage() {
  const { data: tournament } = useTournament();
  const [revealedCount, setRevealedCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // ランキングを計算
  const ranking = useMemo(() => {
    const playerScores = tournament.players.map((player) => {
      const mariokartPoints = tournament.ranks.mariokart[player.id]
        ? (POINTS.mariokart[tournament.ranks.mariokart[player.id] - 1] ?? 0)
        : 0;

      const mariopartyPoints = tournament.ranks.marioparty[player.id]
        ? (POINTS.marioparty[tournament.ranks.marioparty[player.id] - 1] ?? 0)
        : 0;

      const bombermanPoints = tournament.ranks.bomberman[player.id]
        ? (POINTS.bomberman[tournament.ranks.bomberman[player.id] - 1] ?? 0)
        : 0;

      return {
        player,
        mariokart: mariokartPoints,
        marioparty: mariopartyPoints,
        bomberman: bombermanPoints,
        total: mariokartPoints + mariopartyPoints + bombermanPoints,
      };
    });

    return playerScores.sort((a, b) => b.total - a.total);
  }, [tournament]);

  const handleStart = () => {
    setIsAnimating(true);
    setRevealedCount(0);

    // 順番に表示
    const interval = setInterval(() => {
      setRevealedCount((prev) => {
        if (prev >= ranking.length) {
          clearInterval(interval);
          setIsAnimating(false);
          return ranking.length;
        }
        return prev + 1;
      });
    }, 800);
  };

  const handleReset = () => {
    setRevealedCount(0);
    setIsAnimating(false);
  };

  const winner = ranking[0];
  const isWinnerRevealed = revealedCount >= ranking.length;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* ヘッダー */}
      <header className="border-b border-yellow-500/20 bg-[#1a1a2e]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-yellow-400">🏆 結果発表</h1>
            <Link
              to="/esports"
              className="px-4 py-2 rounded border border-yellow-500/30 hover:border-yellow-500 hover:bg-yellow-500/10 transition-colors"
            >
              ← 戻る
            </Link>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-8">
        {revealedCount === 0 && !isAnimating ? (
          // 開始画面
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center mb-8">
              <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-magenta-400 to-yellow-400 bg-clip-text text-transparent">
                🎮 E-SPORTS 大会
              </h2>
              <p className="text-2xl text-gray-300">結果発表</p>
            </div>
            <button
              type="button"
              onClick={handleStart}
              className="px-12 py-4 bg-gradient-to-r from-cyan-500 via-magenta-500 to-yellow-500 hover:from-cyan-600 hover:via-magenta-600 hover:to-yellow-600 rounded-lg font-bold text-xl transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,0,0.5)]"
            >
              🎮 START 🎮
            </button>
          </div>
        ) : (
          // 結果表示
          <div className="space-y-6">
            {/* 下位から順に表示 */}
            {ranking
              .slice()
              .reverse()
              .map((item, index) => {
                const displayIndex = ranking.length - index;
                const isRevealed = revealedCount >= displayIndex;
                const isWinner = displayIndex === 1;

                if (!isRevealed) return null;

                return (
                  <div
                    key={item.player.id}
                    className={`bg-[#1a1a2e]/80 backdrop-blur-sm rounded-lg border p-6 transition-all duration-500 ${
                      isWinner
                        ? "border-yellow-500 shadow-[0_0_30px_rgba(255,255,0,0.3)] scale-105"
                        : "border-yellow-500/20"
                    }`}
                    style={{
                      animation: isRevealed
                        ? "slideInUp 0.5s ease-out"
                        : undefined,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span
                          className={`text-4xl font-bold ${
                            isWinner ? "text-yellow-400" : "text-gray-400"
                          }`}
                        >
                          {displayIndex}
                        </span>
                        <div>
                          <h3
                            className={`text-2xl font-bold ${
                              isWinner ? "text-yellow-400" : "text-white"
                            }`}
                          >
                            {item.player.name}
                          </h3>
                          <p className="text-sm text-gray-400">
                            マリカ: {item.mariokart}pt / マリパ:{" "}
                            {item.marioparty}pt / ボンバー: {item.bomberman}pt
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-3xl font-bold ${
                            isWinner ? "text-yellow-400" : "text-cyan-400"
                          }`}
                        >
                          {item.total} pt
                        </p>
                        {isWinner && (
                          <p className="text-yellow-400 text-sm mt-1">🥇</p>
                        )}
                        {displayIndex === 2 && (
                          <p className="text-gray-400 text-sm mt-1">🥈</p>
                        )}
                        {displayIndex === 3 && (
                          <p className="text-orange-400 text-sm mt-1">🥉</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

            {/* 優勝者発表 */}
            {isWinnerRevealed && winner && (
              <div className="mt-12 text-center animate-pulse">
                <div className="bg-gradient-to-r from-cyan-500/20 via-magenta-500/20 to-yellow-500/20 rounded-lg border-2 border-yellow-500 p-8">
                  <div className="text-6xl mb-4">✨ ✨ ✨</div>
                  <div className="text-7xl mb-4">👑</div>
                  <h2 className="text-5xl font-bold text-yellow-400 mb-4">
                    🏆 優 勝 🏆
                  </h2>
                  <p className="text-4xl font-bold text-white mb-2">
                    {winner.player.name}
                  </p>
                  <p className="text-3xl text-yellow-400 mb-6">
                    {winner.total} pt
                  </p>
                  <div className="text-2xl text-yellow-400">
                    🎁 Amazonギフト券贈呈！ 🎁
                  </div>
                  <div className="text-6xl mt-4">✨ ✨ ✨</div>
                </div>
              </div>
            )}

            {/* リセットボタン */}
            {isWinnerRevealed && (
              <div className="text-center mt-8">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded font-bold transition-colors"
                >
                  もう一度見る
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* アニメーション定義 */}
      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
