import { useNavigate } from "react-router-dom";

export default function QuizTopPage() {
  const navigate = useNavigate();
  const handleStartQuiz = () => {
    navigate("/quiz/play");
  };
  return (
    <main className="mx-auto flex min-h-[calc(100vh-200px)] w-full max-w-2xl items-center justify-center animate-[fade-up_0.7s_ease-out]">
      <div className="text-center rounded-[28px] border border-white/70 bg-white/80 p-7 shadow-[0_24px_80px_rgba(31,41,55,0.18)] backdrop-blur">
        <h1 className="text-2xl font-bold mb-4">クイズへようこそ！</h1>
        <button
          className="bg-[#0f766e] text-white px-4 py-2 rounded"
          onClick={handleStartQuiz}
        >
          クイズを始める
        </button>
      </div>
    </main>
  )
}
