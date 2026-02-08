import { useEffect, useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'

// 1つのタスク情報の型
type Task = {
  id: string
  title: string
  checkedAt: string | null
}

// ローカルストレージに保存するときのキー名
const STORAGE_KEY = 'night-routine-tasks'

// 18時の自動リセット済み日付を保存するキー（「今日だけ1回」の判定に使う）
const RESET_FLAG_KEY = 'night-routine-last-reset-date'

// 自動リセットを走らせる時刻（18時）
const RESET_HOUR = 18

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

// 日付を「YYYY-MM-DD」の形に整形（リセット判定のキーとして利用）
const getDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

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

  // 編集用モーダルの開閉を管理（削除候補を一覧で見せるための状態）
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // 一括チェック解除の確認モーダル開閉を管理
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false)

  // 削除確認モーダルで対象となるタスクを保持
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)

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

  useEffect(() => {
    // ロジック: 18時以降かつ今日未リセットのときだけ処理する（誤消去防止）
    const now = new Date()
    const todayKey = getDateKey(now)
    const lastReset = localStorage.getItem(RESET_FLAG_KEY)
    const isAfterResetHour = now.getHours() >= RESET_HOUR

    if (isAfterResetHour && lastReset !== todayKey) {
      // ロジック: ここでのみ全タスクのチェックを外す（フラグがあるので1日1回）
      setTasks((prev) =>
        prev.map((task) => ({
          ...task,
          checkedAt: null,
        })),
      )
      // ロジック: 今日分のリセット済み日付を保存し、再実行を防ぐ
      localStorage.setItem(RESET_FLAG_KEY, todayKey)
    }
  }, [])

  // モーダルが開いている間は背景スクロールを止める
  const isAnyModalOpen = isEditModalOpen || isResetConfirmOpen || Boolean(taskToDelete)

  useEffect(() => {
    if (!isAnyModalOpen) {
      // モーダルが閉じたらスクロール制限を解除する
      document.body.style.overflow = ''
      return
    }

    // モーダル表示中は背景を固定して誤操作を防ぐ
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isAnyModalOpen])

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

  // 一括チェック解除を実行（確認モーダルで承認されたときのみ呼ばれる）
  const handleResetAllTasks = () => {
    setTasks((prev) =>
      prev.map((task) => ({
        ...task,
        checkedAt: null,
      })),
    )
    setIsResetConfirmOpen(false)
  }

  // 削除対象のタスクを確定させる（確認モーダルを開く）
  const handleRequestDeleteTask = (task: Task) => {
    setTaskToDelete(task)
    setIsEditModalOpen(false)
  }

  // タスク削除を確定
  const handleConfirmDeleteTask = () => {
    if (!taskToDelete) {
      return
    }

    setTasks((prev) => prev.filter((task) => task.id !== taskToDelete.id))
    setTaskToDelete(null)
  }

  // 削除確認をキャンセル
  const handleCancelDeleteTask = () => {
    setTaskToDelete(null)
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

        {/* 操作ボタン */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          {/* 編集ボタンと一括解除ボタンを横並びで配置する */}
          <div className="flex flex-wrap items-center gap-3">
            {/* 編集ボタンはモーダルを開いて削除一覧を表示 */}
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[#111827]/15 bg-white px-4 py-2 text-lg font-semibold text-[#111827] transition hover:border-[#111827]/30"
            >
              タスク編集
            </button>
            {/* 一括チェック解除のボタン（誤操作防止のためモーダルを開く） */}
            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="min-h-12 rounded-full border border-[#0f766e]/30 bg-white px-4 py-2 text-sm font-semibold text-[#0f766e] transition hover:border-[#0f766e]/50"
            >
              一括チェック解除
            </button>
          </div>
          <div className="text-xs text-[#6b7280]">チェックした時刻を自動で記録します。</div>
        </div>

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

      {/* 一括チェック解除の確認モーダル */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* 背景オーバーレイで画面全体を覆い、背後の操作を遮断する */}
          <div className="absolute inset-0 bg-black/50" />
          {/* モーダル本体（中央配置・角丸・影で浮かせる） */}
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-md rounded-2xl border border-white/60 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.25)]"
          >
            <h3 className="text-lg font-semibold text-[#111827]">
              すべてのチェックを外しますか？
            </h3>
            <p className="mt-2 text-sm text-[#6b7280]">
              誤操作防止のため、確認後にのみ一括リセットが実行されます。
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleResetAllTasks}
                className="min-h-11 rounded-full bg-[#0f766e] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#115e59]"
              >
                解除する
              </button>
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="min-h-11 rounded-full border border-[#111827]/20 px-5 py-2 text-sm font-semibold text-[#111827]"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* タスク編集モーダル（削除対象を一覧で表示） */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* 背景オーバーレイで操作をブロック */}
          <div className="absolute inset-0 bg-black/50" />
          {/* モーダル本体 */}
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-md rounded-2xl border border-white/60 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.25)]"
          >
            <h3 className="text-lg font-semibold text-[#111827]">削除するタスクを選択</h3>
            <p className="mt-2 text-sm text-[#6b7280]">
              ゴミ箱ボタンを押すと、確認モーダルが開きます。
            </p>
            <div className="mt-4 grid gap-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-xl border border-[#e5e7eb] bg-white px-3 py-2"
                >
                  <span className="text-sm font-medium text-[#111827]">{task.title}</span>
                  <button
                    type="button"
                    onClick={() => handleRequestDeleteTask(task)}
                    className="inline-flex items-center gap-1 rounded-full border border-[#fee2e2] bg-[#fff7f7] px-3 py-1 text-xs font-semibold text-[#b91c1c]"
                  >
                    <Trash2 className="h-4 w-4" />
                    削除
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="min-h-11 rounded-full border border-[#111827]/20 px-5 py-2 text-sm font-semibold text-[#111827]"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* タスク削除の確認モーダル */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* 背景オーバーレイで背後をクリックできないようにする */}
          <div className="absolute inset-0 bg-black/50" />
          {/* モーダル本体 */}
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-md rounded-2xl border border-white/60 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.25)]"
          >
            <h3 className="text-lg font-semibold text-[#111827]">
              「{taskToDelete.title}」を削除しますか？
            </h3>
            <p className="mt-2 text-sm text-[#6b7280]">
              削除したタスクは元に戻せません。
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleConfirmDeleteTask}
                className="min-h-11 rounded-full bg-[#b91c1c] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#991b1b]"
              >
                削除する
              </button>
              <button
                type="button"
                onClick={handleCancelDeleteTask}
                className="min-h-11 rounded-full border border-[#111827]/20 px-5 py-2 text-sm font-semibold text-[#111827]"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default NightRoutinePage