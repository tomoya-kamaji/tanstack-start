import { createFileRoute, Link } from "@tanstack/react-router";
import { TIMELINE } from "../../lib/esports/constants";

export const Route = createFileRoute("/esports/")({
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* ヘッダー */}
      <header className="border-b border-cyan-500/20 bg-[#1a1a2e]">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-cyan-400 via-magenta-400 to-yellow-400 bg-clip-text text-transparent">
            🎮 E-SPORTS 大会
          </h1>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-8">
        {/* タイムライン */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-cyan-400">
            ■ タイムライン
          </h2>
          <div className="bg-[#1a1a2e]/80 backdrop-blur-sm rounded-lg border border-cyan-500/20 p-6">
            <div className="space-y-3">
              {TIMELINE.map((item, index) => (
                <div
                  key={`${item.time}-${item.title}`}
                  className="flex items-center gap-4 p-3 rounded border border-cyan-500/10 hover:border-cyan-500/30 transition-colors"
                >
                  <span className="text-cyan-400 font-mono text-sm min-w-[100px]">
                    {item.time}
                  </span>
                  <span className="text-white">{item.title}</span>
                  {index === 1 && (
                    <span className="ml-auto px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded">
                      ◀ NOW
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ルール */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-magenta-400">■ ルール</h2>
          <div className="bg-[#1a1a2e]/80 backdrop-blur-sm rounded-lg border border-magenta-500/20 p-6">
            <ul className="space-y-2 text-gray-300">
              <li>・3種目の合計ポイントで優勝決定</li>
              <li>・各種目の順位でポイント獲得</li>
              <li>・優勝者にはAmazonギフト券！</li>
            </ul>
          </div>
        </section>

        {/* ナビゲーションボタン */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-yellow-400">
            ■ メニュー
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/esports/players"
              className="group relative overflow-hidden rounded-lg border-2 border-cyan-500/30 bg-[#1a1a2e]/80 backdrop-blur-sm p-6 hover:border-cyan-500 transition-all hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]"
            >
              <div className="text-4xl mb-2">👥</div>
              <h3 className="text-xl font-bold text-cyan-400 mb-2">
                参加者管理
              </h3>
              <p className="text-sm text-gray-400">参加者を登録・編集</p>
            </Link>

            <Link
              to="/esports/score"
              className="group relative overflow-hidden rounded-lg border-2 border-magenta-500/30 bg-[#1a1a2e]/80 backdrop-blur-sm p-6 hover:border-magenta-500 transition-all hover:shadow-[0_0_20px_rgba(255,0,255,0.3)]"
            >
              <div className="text-4xl mb-2">📊</div>
              <h3 className="text-xl font-bold text-magenta-400 mb-2">
                スコア入力
              </h3>
              <p className="text-sm text-gray-400">各種目の順位を入力</p>
            </Link>

            <Link
              to="/esports/result"
              className="group relative overflow-hidden rounded-lg border-2 border-yellow-500/30 bg-[#1a1a2e]/80 backdrop-blur-sm p-6 hover:border-yellow-500 transition-all hover:shadow-[0_0_20px_rgba(255,255,0,0.3)]"
            >
              <div className="text-4xl mb-2">🏆</div>
              <h3 className="text-xl font-bold text-yellow-400 mb-2">
                結果発表
              </h3>
              <p className="text-sm text-gray-400">最終結果を確認</p>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
