import { useEffect, useMemo, useState } from 'react'

// 1つのタスクを表す型（LocalStorage にも保存する前提）
interface TodoItem {
  id: string
  title: string
  isCompleted: boolean
  createdAt: string
  completedAt?: string
  dueDate?: string
}

type FilterType = 'active' | 'completed' | 'all'

const STORAGE_KEY = 'daily-bloom-todo-items'
const NOTIFICATION_KEY = 'daily-bloom-todo-notified-date'
const COMPLETED_RETENTION_DAYS = 7
const MS_PER_DAY = 24 * 60 * 60 * 1000

// input[type="date"] に合わせて「今日」を YYYY-MM-DD 形式で返す
const getTodayInputValue = () => {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60 * 1000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

// ISO 文字列を input[type="date"] と同じ形式にそろえて比較しやすくする
const toLocalDateInputValue = (isoString: string) => {
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return ''
  const offset = date.getTimezoneOffset() * 60 * 1000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

// JSON を安全に読み取り、期限切れの完了タスクを削除して返す
const loadTodosFromStorage = (): TodoItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    const now = Date.now()

    return parsed
      .filter((item): item is TodoItem => {
        if (!item || typeof item !== 'object') return false

        const record = item as Record<string, unknown>
        return (
          typeof record.id === 'string' &&
          typeof record.title === 'string' &&
          typeof record.isCompleted === 'boolean' &&
          typeof record.createdAt === 'string'
        )
      })
      .filter((item) => {
        // 完了済みだけ期限判定（7日経過なら削除）
        if (!item.isCompleted) return true
        if (!item.completedAt) return false
        const completedTime = new Date(item.completedAt).getTime()
        if (Number.isNaN(completedTime)) return false
        return now - completedTime <= COMPLETED_RETENTION_DAYS * MS_PER_DAY
      })
  } catch {
    return []
  }
}

const ToDoList = () => {
  // 初回レンダリング時にだけ LocalStorage から復元
  const [todos, setTodos] = useState<TodoItem[]>(() => loadTodosFromStorage())
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState(getTodayInputValue())
  const [filter, setFilter] = useState<FilterType>('active')
  const [deleteTarget, setDeleteTarget] = useState<TodoItem | null>(null)

  // アプリ起動時に「今日が期日の未完了タスク」を通知する
  useEffect(() => {
    if (!('Notification' in window)) return

    const storedTodos = loadTodosFromStorage()
    const today = getTodayInputValue()

    // 同じ日に複数回通知しないためのガード
    const lastNotifiedDate = localStorage.getItem(NOTIFICATION_KEY)
    if (lastNotifiedDate === today) return

    const todaysTodos = storedTodos.filter((todo) => {
      if (todo.isCompleted) return false
      if (!todo.dueDate) return false
      return toLocalDateInputValue(todo.dueDate) === today
    })

    if (todaysTodos.length === 0) return

    const notify = async () => {
      // 初回は許可ダイアログを表示し、許可が取れたときだけ通知する
      if (Notification.permission === 'default') {
        try {
          await Notification.requestPermission()
        } catch {
          return
        }
      }

      if (Notification.permission !== 'granted') return

      const body = todaysTodos
        .slice(0, 3)
        .map((todo) => `・${todo.title}`)
        .join('\n')

      new Notification('今日が期日のToDoがあります', {
        body: body || `${todaysTodos.length}件あります。`,
      })

      // 通知した日付を保存して、当日は1回だけにする
      localStorage.setItem(NOTIFICATION_KEY, today)
    }

    void notify()
  }, [])

  // タスクが変わるたびに LocalStorage へ保存
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
    } catch {
      // 保存失敗時は無理に止めず、UI 継続を優先
    }
  }, [todos])

  const activeCount = useMemo(
    () => todos.filter((todo) => !todo.isCompleted).length,
    [todos],
  )

  const completedCount = useMemo(
    () => todos.filter((todo) => todo.isCompleted).length,
    [todos],
  )

  const visibleTodos = useMemo(() => {
    if (filter === 'active') return todos.filter((todo) => !todo.isCompleted)
    if (filter === 'completed') return todos.filter((todo) => todo.isCompleted)
    return todos
  }, [filter, todos])

  const handleAdd = () => {
    const trimmed = title.trim()
    if (!trimmed) return

    // 新規タスクは「未完了」で先頭に追加（即座に目に入るため）
    const newTodo: TodoItem = {
      id: crypto.randomUUID(),
      title: trimmed,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
    }

    setTodos((prev) => [newTodo, ...prev])
    setTitle('')
    setDueDate(getTodayInputValue())
  }

  const handleToggle = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) => {
        if (todo.id !== id) return todo
        const nextCompleted = !todo.isCompleted
        return {
          ...todo,
          isCompleted: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : undefined,
        }
      }),
    )
  }

  const handleDelete = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }

  return (
    <main className="w-full max-w-2xl animate-[fade-up_0.7s_ease-out]">
      {/* カード全体：背景を柔らかく見せて、集中できる作業エリアを作る */}
      <div className="rounded-[28px] border border-white/70 bg-white/80 p-7 shadow-[0_24px_80px_rgba(31,41,55,0.18)] backdrop-blur">
        {/* ヘッダー：タイトルと補足情報をまとめる */}
        <div className="flex flex-col gap-2 text-left">
          <h2 className="text-2xl font-semibold text-[#111827]">ToDo List</h2>
          <p className="text-sm text-[#6b7280]">
            完了タスクは自動で7日後に削除されます
          </p>
        </div>

        {/* 入力エリア：追加という行動に集中できる横並びレイアウト */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleAdd()
            }}
            placeholder="今日やることを入力"
            className="w-full rounded-2xl border border-[#e5e7eb] bg-white px-4 py-3 text-base text-[#111827] outline-none transition focus:border-[#7BAA8E] focus:ring-2 focus:ring-[#7BAA8E]/30"
          />
          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className="rounded-2xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#7BAA8E] focus:ring-2 focus:ring-[#7BAA8E]/30"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="rounded-2xl bg-[#7BAA8E] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#6b9b7d]"
          >
            追加する
          </button>
        </div>

        {/* フィルター：完了済みは既定で非表示（学習要件に合わせる） */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {(
            [
              { label: '未完了', value: 'active' },
              { label: '完了', value: 'completed' },
              { label: '全て', value: 'all' },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === option.value
                  ? 'bg-[#F08C6B] text-white'
                  : 'bg-white text-[#6b7280] hover:bg-[#f9efe9]'
              }`}
            >
              {option.label}
            </button>
          ))}
          <span className="ml-auto text-sm text-[#6b7280]">
            未完了 {activeCount} / 完了 {completedCount}
          </span>
        </div>

        {/* リスト：タスク表示エリア。未完了を主役にするため余白を広めに */}
        <div className="mt-6 space-y-3">
          {visibleTodos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#e5e7eb] p-6 text-center text-sm text-[#6b7280]">
              まだタスクがありません。<br />小さな一歩から始めましょう。
            </div>
          ) : (
            visibleTodos.map((todo) => (
              <div
                key={todo.id}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                  todo.isCompleted
                    ? 'border-[#e5e7eb] bg-[#f5f5f5]'
                    : 'border-white/70 bg-white'
                }`}
              >
                {/* チェック：完了状態を切り替える主要操作 */}
                <button
                  type="button"
                  onClick={() => handleToggle(todo.id)}
                  className={`h-5 w-5 rounded-full border-2 transition ${
                    todo.isCompleted
                      ? 'border-[#7BAA8E] bg-[#7BAA8E]'
                      : 'border-[#cbd5e1] bg-white'
                  }`}
                  aria-label="完了切り替え"
                />
                {/* タイトル：本文は読みやすいサイズで配置 */}
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      todo.isCompleted
                        ? 'text-[#9ca3af] line-through'
                        : 'text-[#111827]'
                    }`}
                  >
                    {todo.title}
                  </p>
                  {todo.dueDate ? (
                    <p className="mt-1 text-xs text-[#6b7280]">
                      期限: {new Date(todo.dueDate).toLocaleDateString('ja-JP')}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(todo)}
                  className="text-sm font-semibold text-[#F08C6B] transition hover:text-[#d97757]"
                >
                  削除
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 削除確認モーダル：誤操作を防ぐためにワンクッション置く */}
      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* 背景の暗幕：モーダルに視線を集める */}
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setDeleteTarget(null)}
            aria-label="削除確認を閉じる"
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-md rounded-3xl border border-white/70 bg-white/95 p-6 text-left shadow-[0_30px_90px_rgba(15,23,42,0.25)] backdrop-blur"
          >
            <h3 className="text-lg font-semibold text-[#111827]">削除の確認</h3>
            <p className="mt-3 text-sm text-[#6b7280]">
              「{deleteTarget.title}」を削除しますか？この操作は取り消せません。
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-full border border-[#e5e7eb] bg-white px-5 py-2 text-sm font-semibold text-[#6b7280] transition hover:bg-[#f9fafb]"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDelete(deleteTarget.id)
                  setDeleteTarget(null)
                }}
                className="rounded-full bg-[#F08C6B] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#d97757]"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}

export default ToDoList
