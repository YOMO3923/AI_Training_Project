import { Home } from 'lucide-react'
import { Link, Outlet, useLocation } from 'react-router-dom'

// ヘッダー中央に表示するアプリ名
const APP_TITLE = 'SAMPLE APP COLLECTION'

const Layout = () => {
  // 現在の URL 情報を取得（ホームボタン表示の判定に使用）
  const location = useLocation()
  const showHomeButton = location.pathname !== '/'

  return (
    // 背景全体（グラデーション + 装飾）
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f7f3ed] via-[#f0e6d7] to-[#d7e1ee] text-[#1f2937]">
      {/* ぼかしの装飾パーツ（absolute で配置） */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-12 h-56 w-56 rounded-full bg-[#f4c7a1]/60 blur-3xl" />
        <div className="absolute right-8 top-20 h-64 w-64 rounded-full bg-[#b8d7d9]/70 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-[#f6e2b3]/70 blur-[100px]" />
      </div>

      {/* 画面中央に寄せるメイン枠（Flex で縦配置） */}
      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-5 pb-16 pt-10">
        {/* ヘッダー行（Grid で左右の幅を均等に確保） */}
        <header className="grid grid-cols-[auto_1fr_auto] items-center text-[#1f2937]">
          {showHomeButton ? (
            // サブページでだけ「ホーム」ボタンを表示
            <Link
              to="/"
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[#1f2937]/15 bg-white/80 px-4 py-2 text-lg font-semibold shadow-sm transition hover:bg-white"
            >
              <Home className="h-5 w-5" />
              ホーム
            </Link>
          ) : (
            <div className="min-h-12" />
          )}
          {/* 中央タイトル */}
          <h1 className="text-center text-2xl font-bold tracking-[0.2em] text-[#1f2937] md:text-3xl">
            {APP_TITLE}
          </h1>
          <div className="min-h-12" />
        </header>

        {/* 子ページをここに描画する差し込み口 */}
        <div className="mt-10 flex flex-1 items-start justify-center">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Layout
