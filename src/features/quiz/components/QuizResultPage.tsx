import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type ResultState = {
  score: number;
  totalQuestions: number;
};

export default function QuizResultPage() {
  // ロジック: QuizPageから渡されたスコアを受け取る
  const location = useLocation();
  const state = location.state as ResultState | null;
  const score = state?.score ?? 0;
  const totalQuestions = state?.totalQuestions ?? 0;
  const isPerfectScore = totalQuestions > 0 && score === totalQuestions;

  // ロジック: カーテンコールを1.2秒だけ表示して消す
  const [showCurtain, setShowCurtain] = useState(true);
  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setShowCurtain(false);
    }, 1200);
    return () => window.clearTimeout(timerId);
  }, []);

  // ロジック: クラッカー用の紙吹雪を生成
  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 14 }, (_, index) => ({
        id: index,
        left: `${8 + index * 6}%`,
        delay: `${(index % 7) * 0.15}s`,
        duration: `${1.6 + (index % 5) * 0.2}s`,
        color: ["#f97316", "#10b981", "#3b82f6", "#eab308"][index % 4],
      })),
    []
  );

  const navigate = useNavigate();

  return (
    <main className="relative mx-auto flex min-h-[calc(100vh-200px)] w-full items-center justify-center">
      {/* 構造: カーテンコール（最初だけ表示） */}
      {showCurtain && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[28px] bg-[#0f172a] text-white">
          <p className="text-lg font-semibold">結果を集計中...</p>
        </div>
      )}

      {/* 構造: クラッカー（紙吹雪） */}
      {/* ロジック: 満点の時だけ表示する */}
      {isPerfectScore && (
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
          {confettiPieces.map((piece) => (
            <span
              key={piece.id}
              className="confetti-piece"
              style={{
                left: piece.left,
                backgroundColor: piece.color,
                animationDelay: piece.delay,
                animationDuration: piece.duration,
              }}
            />
          ))}
        </div>
      )}

      {/* 構造: 結果表示のカード */}
      <div className="relative z-0 flex min-h-[calc(100vh-200px)] w-full flex-col justify-center text-center rounded-[28px] border border-white/70 bg-white/80 p-10 shadow-[0_24px_80px_rgba(31,41,55,0.18)] backdrop-blur">
        {/* 構造: 結果の見出し */}
        <h1 className="text-2xl font-bold mb-4">結果</h1>
        {/* 構造: スコア本文 */}
        <p className="text-lg">
          {totalQuestions > 0 ? `${score} / ${totalQuestions}` : "スコアを取得できませんでした"}
        </p>

        {/* 構造: 操作ボタン */}
        <div className="mt-6 flex flex-col gap-3">
          <button
            className="w-full rounded-lg bg-[#0f766e] px-4 py-2 text-white"
            onClick={() => navigate("/quiz/play", { state: { resetKey: Date.now() } })}
          >
            リトライ
          </button>
          <button
            className="w-full rounded-lg border border-[#0f766e] px-4 py-2 text-[#0f766e]"
            onClick={() => navigate("/dashboard")}
          >
            終了
          </button>
        </div>
      </div>

      {/* CSS: 紙吹雪の簡易アニメーション */}
      <style>{`
        .confetti-piece {
          position: absolute;
          top: -12px;
          width: 10px;
          height: 16px;
          border-radius: 2px;
          opacity: 0.9;
          animation-name: confetti-fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(520px) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </main>
  );
}
