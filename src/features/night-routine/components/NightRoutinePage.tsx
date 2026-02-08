import { useEffect, useMemo, useState } from 'react'

// 1つのタスク情報の型
type Task = {
  id: string
  title: string
  checkedAt: string | null
}

// ローカルストレージに保存するときのキー名
const STORAGE_KEY = 'night-routine-tasks'

// 初期表示のタスクリスト
const DEFAULT_TASKS: Task[] = [
  { id: 'lock', title: '鍵の施錠', checkedAt: null },
  { id: 'teeth', title: '歯磨き', checkedAt: null },
  { id: 'water', title: '水分補給', checkedAt: null },
  { id: 'clothes', title: '明日の服の準備', checkedAt: null },
]

// 新規タスクの一意なIDを作る
const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `task-${Date.now()}-${Math.random().toString(16).slice(2)}`

// ローカルストレージからタスクを読み込む
const loadTasks = (): Task[] => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    return DEFAULT_TASKS
  }

  try {
    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) {
      return DEFAULT_TASKS
    }

    // 型の形が崩れていないかをチェック
    const filtered = parsed.filter(
      (item): item is Task =>
        item &&
        typeof item.id === 'string' &&
        typeof item.title === 'string' &&
        (typeof item.checkedAt === 'string' || item.checkedAt === null),
    )

    return filtered.length > 0 ? filtered : DEFAULT_TASKS
  } catch {
    return DEFAULT_TASKS
  }
}

// ISO文字列を「日本語の日時表示」に変換
const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

const NightRoutinePage = () => {
  // useState は「画面の状態」を持つ React の仕組み
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks())
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])

  // useMemo は計算結果のキャッシュ（タスク数の再計算を必要時だけにする）
  const completedCount = useMemo(
    () => tasks.filter((task) => task.checkedAt).length,
    [tasks],
  )

  // useEffect は「状態が変わったときに実行」する React の仕組み
  useEffect(() => {
    // ローカルストレージへ同期して状態を保持します
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  // チェックを付け外しする処理
  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      // map は配列を1件ずつ加工して新しい配列を作る
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              // チェック済みなら日時を消し、未チェックなら現在時刻を入れる
              checkedAt: task.checkedAt ? null : new Date().toISOString(),
            }
          : task,
      ),
    )
  }

  // 新しいタスクを追加する処理
  const handleAddTask = () => {
    const trimmed = newTaskTitle.trim()
    if (!trimmed) {
      return
    }

    setTasks((prev) => [
      ...prev,
      {
        id: createId(),
        title: trimmed,
        checkedAt: null,
      },
    ])
    setNewTaskTitle('')
  }

  // 削除対象のチェックをON/OFF
  const toggleSelectedTask = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId],
    )
  }

  // 選択したタスクを削除
  const handleDeleteSelected = () => {
    if (selectedTaskIds.length === 0) {
      setIsEditing(false)
      return
    }

    setTasks((prev) => prev.filter((task) => !selectedTaskIds.includes(task.id)))
    setSelectedTaskIds([])
    setIsEditing(false)
  }

  // 編集モードをキャンセル
  const handleCancelEdit = () => {
    setSelectedTaskIds([])
    setIsEditing(false)
  }

  return (
    // main はページ本体（幅を固定し中央寄せ）
    <main className="w-full max-w-2xl animate-[fade-up_0.7s_ease-out]">
      {/* カード風のメイン枠 */}
      <div className="rounded-[28px] border border-white/70 bg-white/80 p-7 shadow-[0_24px_80px_rgba(31,41,55,0.18)] backdrop-blur">
        {/* 見出しエリア（flex で左右に配置） */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6b7280]">
              Tonight checklist
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[#111827]">
              就寝前のナイトルーティーン
            </h2>
          </div>
          <div className="rounded-full border border-[#111827]/10 bg-[#fdf6e9] px-4 py-2 text-sm font-semibold text-[#92400e]">
            {completedCount}/{tasks.length} 完了
          </div>
        </div>

        {/* タスクリスト（配列から生成） */}
        <div className="mt-6 space-y-3">
          {tasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-white/70 px-4 py-6 text-center text-sm text-[#6b7280]">
              タスクがありません。下のフォームから追加してください。
            </div>
          ) : (
            tasks.map((task) => (
              <label
                key={task.id}
                className={`group flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition ${
                  task.checkedAt
                    ? 'border-[#c7e6d5] bg-[#f3fbf7]'
                    : 'border-white/60 bg-white/70'
                }`}
              >
                {/* カード全体を label にして、どこをタップしても切り替わるようにする */}
                <span className="flex items-center gap-3 text-base font-medium text-[#111827]">
                  <input
                    type="checkbox"
                    checked={Boolean(task.checkedAt)}
                    onChange={() => handleToggleTask(task.id)}
                    className="h-5 w-5 rounded border-[#9ca3af] text-[#0f766e] focus:ring-[#0f766e]"
                  />
                  {task.title}
                </span>
                <span className="text-xs text-[#6b7280]">
                  {task.checkedAt ? `記録: ${formatDateTime(task.checkedAt)}` : '未記録'}
                </span>
              </label>
            ))
          )}
        </div>

        {/* 編集ボタン */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[#111827]/15 bg-white px-4 py-2 text-lg font-semibold text-[#111827] transition hover:border-[#111827]/30"
          >
            タスク編集
          </button>
          <div className="text-xs text-[#6b7280]">
            チェックした時刻を自動で記録します。
          </div>
        </div>

        {/* 編集モード時の削除UI */}
        {isEditing && (
          <div className="mt-5 rounded-2xl border border-[#fee2e2] bg-[#fff7f7] p-4">
            <p className="text-sm font-semibold text-[#b91c1c]">
              削除するタスクを選んでください
            </p>
            <div className="mt-3 grid gap-2">
              {tasks.map((task) => (
                <label
                  key={task.id}
                  className="flex items-center gap-3 rounded-xl border border-white/70 bg-white/80 px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedTaskIds.includes(task.id)}
                    onChange={() => toggleSelectedTask(task.id)}
                    className="h-4 w-4 rounded border-[#fca5a5] text-[#b91c1c] focus:ring-[#b91c1c]"
                  />
                  {task.title}
                </label>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleDeleteSelected}
                className="min-h-12 rounded-full bg-[#b91c1c] px-5 py-2 text-lg font-semibold text-white transition hover:bg-[#991b1b]"
              >
                OK
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="min-h-12 rounded-full border border-[#111827]/20 px-5 py-2 text-lg font-semibold text-[#111827]"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}

        {/* 新規タスクの追加エリア */}
        <div className="mt-7 border-t border-dashed border-[#e5e7eb] pt-5">
          <p className="text-sm font-semibold text-[#374151]">タスク追加</p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(event) => setNewTaskTitle(event.target.value)}
              placeholder="例: アロマを焚く"
              className="min-h-12 flex-1 rounded-2xl border border-[#e5e7eb] bg-white px-4 py-3 text-lg shadow-sm focus:border-[#0f766e] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20"
            />
            <button
              type="button"
              onClick={handleAddTask}
              className="min-h-12 rounded-2xl bg-[#0f766e] px-5 py-3 text-lg font-semibold text-white transition hover:bg-[#115e59]"
            >
              追加する
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default NightRoutinePage
