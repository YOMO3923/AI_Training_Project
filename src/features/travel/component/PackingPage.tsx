import { useEffect, useState } from "react" // この行は外部データと型を読み込む
import { Luggage, Package, Shirt, Sparkles, Ticket, Wallet, Settings } from "lucide-react"
import { Link } from "react-router-dom"
import { initialPackingCategories } from "../data/PackingData"
import type { PackingCategory } from "../data/PackingData" // PackingCategory 型をインポート

const STORAGE_KEY = "travel_packing_categories" // この行はローカル保存に使うキーを定義する

// カテゴリIDに合わせてアイコンを表示するための対応表
const categoryIconMap = {
  cloths: Shirt,
  valuables: Wallet,
  toiletries: Sparkles,
  electronics: Luggage,
  tickets: Ticket,
  others: Package,
} as const // この行はカテゴリIDとアイコンの対応表を固定する

const PackingPage = () => {
  const [categories, setCategories] = useState<PackingCategory[]>(() => {
    // 初回表示ではローカル保存のデータを優先し、なければ初期データを使う
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return initialPackingCategories

    try {
      const parsed = JSON.parse(saved) as PackingCategory[]
      return parsed
    } catch {
      return initialPackingCategories
    }
  })

  const [newCategoryName, setNewCategoryName] = useState<string>('')
  const [newItemCategoryId, setNewItemCategoryId] = useState<string>(
    initialPackingCategories[0]?.id ?? '' // この行は「追加対象カテゴリ」の初期値を決める
  )
  const [newItemName, setNewItemName] = useState<string>('')
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<string[]>([]) // この行は開いているカテゴリIDを配列で保持する（複数開閉対応）
  const [expandedEditCategoryIds, setExpandedEditCategoryIds] = useState<string[]>([]) // この行は編集モーダル内で開いているカテゴリIDを保持する
  const [isEditMode, setIsEditMode] = useState<boolean>(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [isItemDeleteConfirmOpen, setIsItemDeleteConfirmOpen] = useState<boolean>(false)
  const [itemDeleteTarget, setItemDeleteTarget] = useState<{
    categoryId: string
    itemId: string
    itemName: string
  } | null>(null)

  useEffect(() => {
    // カテゴリの状態が変わるたびにローカルへ保存して、再読み込みでも維持する
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories))

    // 追加先カテゴリが消えた時の調整（先頭を選び直す）
    if (categories.length === 0) {
      setNewItemCategoryId('')
    } else if (!categories.some((category) => category.id === newItemCategoryId)) {
      setNewItemCategoryId(categories[0].id)
    }

    // 展開状態の整理（削除済みカテゴリを除外）
    setExpandedCategoryIds((prev) =>
      prev.filter((categoryId) => categories.some((category) => category.id === categoryId))
    )
  }, [categories, newItemCategoryId])

  const handleAddCategory = () => {
    if (newCategoryName.trim() === '') return

    const newCategory: PackingCategory = {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      items: [],
    }
    setCategories((prev) => [...prev, newCategory])
    setNewCategoryName('')

    if (newItemCategoryId === '') {
      setNewItemCategoryId(newCategory.id) // この行はカテゴリが未選択の時に自動で選択する
    }
  }

  const handleAddItem = () => {
    const itemName = newItemName.trim()
    if (!itemName || newItemCategoryId === '') return

    setCategories((prev) =>
      prev.map((category) =>
        category.id === newItemCategoryId
          ? {
            ...category,
            items: [...category.items, { id: Date.now().toString(), name: itemName, checked: false }],
            }
          : category
      )
    )
    setNewItemName('')
  }

  const handleDeleteCategory = (id: string) => {
    setCategories((prev) => {
      const nextCategories = prev.filter((category) => category.id !== id)

      if (newItemCategoryId === id) {
        setNewItemCategoryId(nextCategories[0]?.id ?? '') // この行は削除されたカテゴリを選択中だった場合の退避
      }

      setExpandedCategoryIds((prevExpanded) =>
        prevExpanded.filter((categoryId) => categoryId !== id)
      )

      return nextCategories
    })
  }

  const handleToggleCategory = (id: string) => {
    // 既に開いているなら閉じ、閉じているなら開く（複数開ける仕様）
    setExpandedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((categoryId) => categoryId !== id) : [...prev, id]
    )
  }

  const handleToggleItemChecked = (categoryId: string, itemId: string) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? {
            ...category,
            items: category.items.map((item) =>
              item.id === itemId ? { ...item, checked: !item.checked } : item
            ),
          }
          : category
      )
    )
  }

  const handleDeleteItem = (categoryId: string, itemId: string) => {
    // 削除対象のアイテムだけ除外し、画面とデータを更新する
    setCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? { ...category, items: category.items.filter((item) => item.id !== itemId) }
          : category
      )
    )
  }

  const handleToggleEditMode = () => {
    setIsEditMode((prev) => !prev) // この行は編集モードをトグルする
  }

  const handleToggleEditCategory = (id: string) => {
    // 編集モーダル内のカテゴリ開閉を切り替える
    setExpandedEditCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((categoryId) => categoryId !== id) : [...prev, id]
    )
  }

  const handleRequestDeleteCategory = (id: string, name: string) => {
    setDeleteTarget({ id, name })
    setIsDeleteConfirmOpen(true)
  }

  const handleRequestDeleteItem = (categoryId: string, itemId: string, itemName: string) => {
    setItemDeleteTarget({ categoryId, itemId, itemName })
    setIsItemDeleteConfirmOpen(true)
  }

  const handleConfirmDeleteCategory = () => {
    if (!deleteTarget) return

    handleDeleteCategory(deleteTarget.id)
    setDeleteTarget(null)
    setIsDeleteConfirmOpen(false)
  }

  const handleConfirmDeleteItem = () => {
    if (!itemDeleteTarget) return

    handleDeleteItem(itemDeleteTarget.categoryId, itemDeleteTarget.itemId)
    setItemDeleteTarget(null)
    setIsItemDeleteConfirmOpen(false)
  }

  return (
    // main はページの主要コンテンツ領域（w-full: 幅100%, max-w-3xl: 最大幅, space-y-6: 縦余白, animate...: ふわっと表示）
    <main className='w-full max-w-3xl animate-[fade-up_0.7s_ease-out] space-y-6'>
      {/* 見出しエリア（space-y-2: 縦方向の余白を均一に） */}
      <div className="space-y-2">
        {/* 小さなラベル（text-xs: 小さい文字, uppercase: 大文字, tracking: 文字間隔, text-gray: 色） */}
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6b7280]">
          packing
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* 戻るボタン（タイトルと同じ行に配置） */}
            <Link
              to="/travel"
              className="inline-flex items-center gap-2 rounded-full border border-[#111827]/10 bg-white px-4 py-2 text-xs font-semibold text-[#111827] hover:bg-slate-50"
            >
              戻る
            </Link>
            {/* メインタイトル（text-2xl: 大きな文字, font-semibold: 太字, text-[#111827]:濃い文字色） */}
            <h2 className="text-2xl font-semibold text-[#111827]">パッキング管理</h2>
          </div>
          <button
            type="button" // この行はフォーム送信を防ぐ
            onClick={handleToggleEditMode} // この行は編集モードの切替を行う
            className="inline-flex items-center justify-center rounded-full border border-[#111827]/10 bg-white p-2 text-[#6b7280] hover:bg-slate-50" // この行は歯車ボタンの見た目を整える
            aria-label="カテゴリ編集"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
        {/* 説明文（text-sm: 小さめ文字, text-[#4b5563]: グレー） */}
        <p className="text-sm text-[#4b5563]">
          カテゴリごとに持ち物を整理し、準備状況を確認できます。
        </p>
      </div>

      {/* カテゴリ一覧のカード（border/bg/p/rounded/shadow は上と同じ理由） */}
      <div className="rounded-2xl border border-[#111827]/10 bg-white p-6 shadow-sm">
        {/* セクションタイトル */}
        <h3 className="text-lg font-semibold text-[#111827]">カテゴリ一覧</h3>
        {/* 一覧（mt-4: 上余白, space-y-2: 各行の縦間隔） */}
        <ul className="mt-4 space-y-2">
          {categories.map((category) => {
            // 各カテゴリの進捗表示を作るため、チェック数と合計数を先に計算する
            const checkedCount = category.items.filter((item) => item.checked).length
            const totalCount = category.items.length
            const progressPercent = totalCount === 0 ? 0 : Math.round((checkedCount / totalCount) * 100)
            const CategoryIcon =
              categoryIconMap[category.id as keyof typeof categoryIconMap] ?? Package

            return (
              <li
                key={category.id}
                className="rounded-lg border border-[#111827]/10 px-4 py-3 text-sm text-[#111827]"
              >
              <button
                type="button"
                onClick={() => handleToggleCategory(category.id)}
                className="flex w-full items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {/* アイコン + タイトルの並び（flex で横並びにする） */}
                  <span className="inline-flex items-center gap-2 font-semibold">
                      <CategoryIcon className="h-4 w-4 text-[#0f766e]" />
                      {category.name}
                  </span>
                  {/* 進捗表示（チェック済み数/合計 + ％） */}
                  <span className="rounded-full border border-[#111827]/10 bg-white px-2 py-0.5 text-[10px] text-[#6b7280]">
                      {checkedCount}/{totalCount} ({progressPercent}%)
                  </span>
                </div>
                <span className="text-xs text-[#6b7280]">
                  {expandedCategoryIds.includes(category.id) ? "閉じる" : "開く"}
                </span>
              </button>
              {expandedCategoryIds.includes(category.id) && (
                <div className="mt-3 space-y-2">
                  {/* アイテム一覧（カテゴリ内の持ち物を表示） */}
                  {category.items.length === 0 ? (
                    <p className="text-xs text-[#6b7280]">
                      まだ持ち物が登録されていません。
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {category.items.map((item) => (
                        <li
                          key={item.id}
                          className="rounded-md border border-[#111827]/10 px-3 py-2 text-xs text-[#111827]"
                        >
                          <label className="flex cursor-pointer items-center gap-2">
                            <input
                              type="checkbox"
                              checked={item.checked}
                              onChange={() => handleToggleItemChecked(category.id, item.id)}
                              className="h-4 w-4 rounded border-[#111827]/20 text-[#0f766e]"
                            />
                            <span className={item.checked ? "text-[#6b7280] line-through" : ""}>
                              {item.name}
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
            )
          })}
        </ul>
      </div>

      {/* 画面下部のアイテム追加エリア（カテゴリ選択 + 入力欄） */}
      <div className="rounded-2xl border border-[#111827]/10 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[#111827]">持ち物を追加</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_2fr_auto]">
          {/* カテゴリ選択（select によって追加先を指定） */}
          <select
            value={newItemCategoryId}
            onChange={(e) => setNewItemCategoryId(e.target.value)}
            className="rounded-lg border border-[#111827]/10 px-3 py-2 text-sm text-[#111827]"
            disabled={categories.length === 0}
          >
            {categories.length === 0 ? (
              <option value="">カテゴリがありません</option>
            ) : (
              categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))
            )}
          </select>
          {/* 持ち物名入力（input は自由入力欄） */}
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="例：充電器"
            className="rounded-lg border border-[#111827]/10 px-3 py-2 text-sm text-[#111827] placeholder:text-[#9ca3af]"
            disabled={categories.length === 0}
          />
          {/* 追加ボタン（カテゴリが無い場合は無効化） */}
          <button
            type="button"
            onClick={handleAddItem}
            className="rounded-lg bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#115e59] disabled:cursor-not-allowed disabled:opacity-40"
            disabled={categories.length === 0}
          >
            追加
          </button>
        </div>
      </div>

      {/* 編集モーダル（カテゴリの追加・削除をここで管理） */}
      {isEditMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          {/* モーダル本体（背景・余白・角丸でカード化） */}
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#111827]">カテゴリ編集</h3>
              <button
                type="button"
                onClick={handleToggleEditMode}
                className="rounded-full border border-[#111827]/10 bg-white px-3 py-1 text-xs font-semibold text-[#111827] hover:bg-slate-50"
              >
                閉じる
              </button>
            </div>

            {/* 追加フォーム（input + button を横並び） */}
            <div className="mt-6 space-y-2">
              <p className="text-sm font-semibold text-[#111827]">新しいカテゴリを追加</p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="カテゴリ名を入力"
                  className="flex-1 rounded-lg border border-[#111827]/10 px-3 py-2 text-sm text-[#111827] placeholder:text-[#9ca3af]"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="rounded-lg bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#115e59]"
                >
                  追加
                </button>
              </div>
            </div>

            {/* 既存カテゴリの削除一覧（削除ボタンで整理） */}
            <div className="mt-6 space-y-2">
              <p className="text-sm font-semibold text-[#111827]">カテゴリを削除</p>
              {categories.length === 0 ? (
                <p className="text-xs text-[#6b7280]">削除できるカテゴリがありません。</p>
              ) : (
                <ul className="space-y-2">
                  {categories.map((category) => (
                    <li
                      key={category.id}
                      className="rounded-lg border border-[#111827]/10 px-3 py-2 text-sm"
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleEditCategory(category.id)}
                        className="flex w-full items-center justify-between"
                      >
                        <span className="font-semibold text-[#111827]">{category.name}</span>
                        <span
                          className={`text-xs text-[#6b7280] transition-transform ${
                            expandedEditCategoryIds.includes(category.id)
                              ? "rotate-90"
                              : "rotate-0"
                          }`}
                        >
                          ＞
                        </span>
                      </button>

                      {expandedEditCategoryIds.includes(category.id) && (
                        <div className="mt-3 space-y-3">
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleRequestDeleteCategory(category.id, category.name)}
                              className="rounded-md bg-[#ef4444] px-3 py-1 text-xs font-semibold text-white hover:bg-[#dc2626]"
                            >
                              カテゴリを削除
                            </button>
                          </div>

                          {category.items.length === 0 ? (
                            <p className="text-xs text-[#6b7280]">削除できる持ち物がありません。</p>
                          ) : (
                            <ul className="space-y-2">
                              {category.items.map((item) => (
                                <li
                                  key={item.id}
                                  className="flex items-center justify-between rounded-md border border-[#111827]/10 px-3 py-2 text-xs"
                                >
                                  <span className="text-[#111827]">{item.name}</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRequestDeleteItem(category.id, item.id, item.name)
                                    }
                                    className="rounded-md bg-[#ef4444] px-2 py-1 text-[10px] font-semibold text-white hover:bg-[#dc2626]"
                                  >
                                    削除
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 削除確認モーダル（削除前にユーザーへ最終確認） */}
      {isDeleteConfirmOpen && deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-[#111827]">カテゴリを削除しますか？</h3>
            <p className="mt-2 text-sm text-[#4b5563]">
              「{deleteTarget.name}」内の持ち物も一緒に削除されます。
            </p>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteConfirmOpen(false)
                  setDeleteTarget(null)
                }}
                className="rounded-full border border-[#111827]/10 bg-white px-4 py-2 text-xs font-semibold text-[#111827] hover:bg-slate-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCategory}
                className="rounded-full bg-[#ef4444] px-4 py-2 text-xs font-semibold text-white hover:bg-[#dc2626]"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* アイテム削除の確認モーダル（削除前にユーザーへ最終確認） */}
      {isItemDeleteConfirmOpen && itemDeleteTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-[#111827]">持ち物を削除しますか？</h3>
            <p className="mt-2 text-sm text-[#4b5563]">
              「{itemDeleteTarget.itemName}」を削除します。
            </p>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsItemDeleteConfirmOpen(false)
                  setItemDeleteTarget(null)
                }}
                className="rounded-full border border-[#111827]/10 bg-white px-4 py-2 text-xs font-semibold text-[#111827] hover:bg-slate-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteItem}
                className="rounded-full bg-[#ef4444] px-4 py-2 text-xs font-semibold text-white hover:bg-[#dc2626]"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default PackingPage