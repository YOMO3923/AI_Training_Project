// 持ち物アイテムの型を定義する（any禁止のため明示的に型定義を行う）
export type PackingItem = {
  id: string // この行は持ち物を一意に識別するIDの型を指定する
  name: string // この行は持ち物名の型を指定する
  checked: boolean // この行は準備済みかどうかの状態の型を指定する
} // この行は型定義の終わりを示す

// カテゴリの型を定義する（items に持ち物配列を持たせる）
export type PackingCategory = {
  id: string // この行はカテゴリを一意に識別するIDの型を指定する
  name: string // この行はカテゴリ名の型を指定する
  items: PackingItem[] // この行はカテゴリ内の持ち物配列の型を指定する
} // この行は型定義の終わりを示す

// 初期表示用のカテゴリデータを用意する（外部から読み込むためにexportする）
export const initialPackingCategories: PackingCategory[] = [
  {
    id: "cloths", // この行はカテゴリIDを設定する
    name: "衣類", // この行はカテゴリ名を設定する
    items: [
      { id: "cloth-1", name: "Tシャツ", checked: false }, // この行は持ち物（Tシャツ）の初期データ
      { id: "cloth-2", name: "下着", checked: false }, // この行は持ち物（下着）の初期データ
    ], // この行は持ち物配列の定義を閉じる
  },
  {
    id: "valuables", // この行はカテゴリIDを設定する
    name: "貴重品", // この行はカテゴリ名を設定する
    items: [
      { id: "val-1", name: "財布", checked: false }, // この行は持ち物（財布）の初期データ
      { id: "val-2", name: "パスポート", checked: false }, // この行は持ち物（パスポート）の初期データ
    ], // この行は持ち物配列の定義を閉じる
  },
  { 
    id: "toiletries", 
    name: "洗面用具" ,
    items: [
      { id: "toiletry-1", name: "歯ブラシ", checked: false },
      { id: "toiletry-2", name: "シャンプー", checked: false },
    ],
  },
  { 
    id: "electronics", 
    name: "電子機器",
    items: [
      { id: "electronic-1", name: "スマートフォン", checked: false },
      { id: "electronic-2", name: "充電器", checked: false },
    ],
  },
  { 
    id: "tickets", 
    name: "チケット類",
    items: [
      { id: "ticket-1", name: "航空券", checked: false },
      { id: "ticket-2", name: "ホテル予約確認書", checked: false },
    ],
  },
  { 
    id: "daily-essentials", 
    name: "日用品",
    items: [
      { id: "daily-1", name: "タオル", checked: false },
      { id: "daily-2", name: "ハンカチ", checked: false },
    ],
  },
  { 
    id: "others", 
    name: "その他",
    items: [
      { id: "other-1", name: "本", checked: false },
      { id: "other-2", name: "薬", checked: false },
    ],
  },
] // この行は初期データ配列の終わりを示す