import { LayoutGrid, ListTodo, MoonStar } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

// カードに表示するアプリ情報の型
type AppCard = {
  title: string
  description: string
  path: string
  icon: typeof MoonStar
  status: string
}

// 一覧表示するアプリのデータ（配列）
const apps: AppCard[] = [
  {
    title: 'ナイトルーティーン',
    description: '就寝前のタスク管理と実行記録を保存します。',
    path: '/night-routine',
    icon: MoonStar,
    status: 'Active',
  },
  {
    title: 'ToDo List',
    description: '準備中のサンプルページです。',
    path: '/todo',
    icon: ListTodo,
    status: 'Planned',
  },
]

const DashboardPage = () => {
  return (
    // main はページの主要コンテンツ領域
    <main className="w-full max-w-3xl animate-[fade-up_0.7s_ease-out] space-y-6">
      {/* 見出しエリア（flex で左右に配置） */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6b7280]">
            Portal
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[#111827]">サンプルアプリ一覧</h2>
        </div>
        <div className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[#111827]/10 bg-[#fdf6e9] px-4 text-lg font-semibold text-[#92400e]">
          <LayoutGrid className="h-5 w-5" />
          {apps.length} Apps
        </div>
      </div>

      {/* カード一覧（grid で縦に並べる） */}
      <div className="grid gap-4">
        {/* map で配列の要素数だけカードを生成 */}
        {apps.map((app) => {
          const Icon = app.icon
          return (
            // Link はクリックで URL を変える React Router のリンク
            <Link
              key={app.path}
              to={app.path}
              className="group block min-h-12 transition"
            >
              {/* hover 時に浮き上がるアニメーションを付与 */}
              <Card className="transition duration-200 group-hover:-translate-y-1 group-hover:bg-slate-50 group-hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)] group-active:translate-y-0 group-active:scale-[0.99]">
                {/* 横並びのヘッダー（flex-row） */}
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ecf4f5] text-[#0f766e]">
                      <Icon className="h-6 w-6" />
                    </span>
                    <div>
                      <CardTitle className="text-lg">{app.title}</CardTitle>
                      <CardDescription className="mt-1 text-sm">{app.description}</CardDescription>
                    </div>
                  </div>
                  <span className="rounded-full border border-[#111827]/10 bg-white px-4 py-2 text-sm font-semibold text-[#6b7280]">
                    {app.status}
                  </span>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-[#4b5563]">
                    クリックして詳細ページへ移動します。
                  </p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </main>
  )
}

export default DashboardPage
