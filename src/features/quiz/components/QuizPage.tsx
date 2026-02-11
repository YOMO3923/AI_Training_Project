// 目的: クイズの出題・回答・結果画面への遷移を行う画面です
// ここでは「表示」「選択」「確定」「全問終了の遷移」を動く形に整えます

// =========================================
// 1) 必要なimport
// - useEffect: 状態変化に合わせて遷移するため
// - useNavigate: 結果画面に移動するため
// - useQuiz: クイズの状態と操作を使うため
// =========================================
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuiz } from "../hooks/useQuiz";


export default function QuizPage() {
  // =========================================
  // 2) useQuizから必要な値をまとめて取得
  // - ロジック: 状態と操作を1回の呼び出しで受け取る
  // =========================================
  const {
    currentQuestion,
    selectedOptionIndex,
    handleSelectionOption,
    handleConfirmAnswer,
    isFinished,
    score,
    totalQuestions,
    resetQuiz,
  } = useQuiz();

  // =========================================
  // 2.5) リトライ時のリセット処理
  // - ロジック: Resultページから渡されたresetKeyが変わったら状態を初期化
  // =========================================
  const location = useLocation();
  const resetKey = (location.state as { resetKey?: number } | null)?.resetKey;
  // ロジック: リトライの初回だけリセットを走らせるためのフラグ
  const hasResetRef = useRef(false);
  useEffect(() => {
    if (!resetKey) {
      // ロジック: resetKeyがないときは次のリトライに備えてフラグを戻す
      hasResetRef.current = false;
      return;
    }
    if (!hasResetRef.current) {
      resetQuiz();
      hasResetRef.current = true;
    }
  }, [resetKey, resetQuiz]);

  // =========================================
  // 3) 全問終了したら結果画面へ遷移
  // - ロジック: isFinished が true になったら画面移動
  // - 構造: useEffect 内で遷移処理を書く
  // =========================================
  const navigate = useNavigate();
  useEffect(() => {
    if (isFinished) {
      // ロジック: 結果画面でスコアを表示できるようにstateで渡す
      navigate("/quiz/result", {
        state: { score, totalQuestions },
      });
    }
  }, [isFinished, navigate, score, totalQuestions]);

  // =========================================
  // 4) 終了時は描画を止める（undefined参照を防ぐ）
  // =========================================
  if (isFinished) return null;

  // =========================================
  // 5) CSSクラスをまとめて見通しをよくする
  // - CSS: baseClassは共通の見た目
  // - CSS: selectedClassは選択時だけ色を変更
  // =========================================
  const baseClass = "rounded-lg border px-4 py-2 mb-2 cursor-pointer";
  const selectedClass = "bg-[#0f766e] text-white";

  return (
    <main className="mx-auto flex min-h-[calc(100vh-200px)] w-full max-w-2xl items-center justify-center animate-[fade-up_0.7s_ease-out]">
      <div className="text-center rounded-[28px] border border-white/70 bg-white/80 p-7 shadow-[0_24px_80px_rgba(31,41,55,0.18)] backdrop-blur">
        {/* 構造: 問題文の見出し */}
        {/* CSS: text-2xlで大きく、font-boldで強調 */}
        <h1 className="text-2xl font-bold mb-4">{currentQuestion.question}</h1>
        {/* 構造: 選択肢のリスト */}
        <ul>
          {currentQuestion.options.map((option, index) => {
            // ロジック: 選択済みの選択肢だけハイライトする
            const isSelected = selectedOptionIndex === index;
            return (
              <li
                key={index}
                className={`${baseClass} ${isSelected ? selectedClass : ""}`}
                onClick={() => handleSelectionOption(index)}
              >
                {option}
              </li>
            );
          })}
        </ul>
        {/* 構造: 回答確定ボタン */}
        {/* CSS: 目立つ色・横幅いっぱいで押しやすく */}
        <button
          onClick={handleConfirmAnswer}
          className="mt-4 w-full rounded-lg bg-[#0f766e] px-4 py-2 text-white"
        >
          回答を確定
        </button>
      </div>
    </main>
  )
}