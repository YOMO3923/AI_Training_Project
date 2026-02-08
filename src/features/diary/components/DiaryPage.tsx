import { useEffect, useMemo, useState } from "react";

type DiaryMap = {
  // 日付文字列(YYYY-MM-DD)をキーにして、日記本文を保存するための型
  [dateString: string]: string;
};

const DAYS = ["日", "月", "火", "水", "木", "金", "土"] as const;

const formatDateKey = (date: Date): string => {
  // DateをYYYY-MM-DDに変換し、辞書のキーとして統一する
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isSameDate = (a: Date, b: Date): boolean => {
  // 年月日だけを比較して、同じ日かどうかを判定する
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const isFutureDate = (date: Date, base: Date): boolean => {
  // 時刻を無視して「未来日かどうか」を判定する
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const today = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  return target.getTime() > today.getTime();
};

const buildCalendarCells = (baseDate: Date): Array<Date | null> => {
  // 1か月のカレンダーを「曜日の空白 + 日付」配列として作る
  const firstDay = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const lastDay = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
  const leadingEmptyCount = firstDay.getDay();

  const cells: Array<Date | null> = [];
  for (let i = 0; i < leadingEmptyCount; i += 1) {
    // 月初の曜日までの空白セル
    cells.push(null);
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    // 実際の日付セル
    cells.push(new Date(baseDate.getFullYear(), baseDate.getMonth(), day));
  }

  return cells;
};

// ローカルストレージに保存する時のキーを固定しておく
// こうしておくと「どこに保存したか」が一目で分かる
const STORAGE_KEY = "diary-map";

const DiaryPage = () => {
  // 表示中の月(=カレンダーの基準日)
  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date());
  // 日記データの保存先(キー: YYYY-MM-DD)
  // 初期化時にローカルストレージから読むことで、StrictModeの二重実行でも上書きを防ぐ
  const [diaryMap, setDiaryMap] = useState<DiaryMap>(() => {
    if (typeof window === "undefined") {
      return {};
    }

    const storedJson = localStorage.getItem(STORAGE_KEY);
    if (!storedJson) {
      return {};
    }

    try {
      // 文字列(JSON)をオブジェクトに戻して、画面の状態に反映する
      return JSON.parse(storedJson) as DiaryMap;
    } catch {
      // JSONが壊れている場合は空の状態に戻す
      return {};
    }
  });
  // 選択中の日付(モーダル表示のトリガーにも使う)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  // 入力中の一言日記(モーダル内で編集する下書き)
  const [draftText, setDraftText] = useState<string>("");

  const today = useMemo(() => new Date(), []);

  const calendarCells = useMemo(() => {
    // currentMonthが変わるたびに、その月のセル配列を作り直す
    return buildCalendarCells(currentMonth);
  }, [currentMonth]);

  useEffect(() => {
    // diaryMapが変わるたびにローカルストレージへ保存する
    // CRUDの「C(Create)」「U(Update)」「D(Delete)」後の永続化に相当
    // 状態 = 画面のメモリ、localStorage = ブラウザの保存棚 というイメージ
    localStorage.setItem(STORAGE_KEY, JSON.stringify(diaryMap));
  }, [diaryMap]);

  useEffect(() => {
    if (!selectedDate) {
      // 何も選ばれていないときは入力欄を初期化しておく
      setDraftText("");
      return;
    }

    // 日付が変わるたびに、その日の日記を読み込む
    // CRUDの「R(Read)」にあたる処理
    const key = formatDateKey(selectedDate);
    const storedText = diaryMap[key] ?? "";
    setDraftText(storedText);
  }, [selectedDate, diaryMap]);

  const handlePrevMonth = (): void => {
    // 前月を表示するために、月を-1する
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = (): void => {
    // 次月を表示するために、月を+1する
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const handleSelectDate = (date: Date): void => {
    // クリックされた日を選択し、モーダルを開く
    setSelectedDate(date);
  };

  const handleCloseModal = (): void => {
    // モーダルを閉じる時は選択日をリセットする
    setSelectedDate(null);
  };

  const handleSave = (): void => {
    if (!selectedDate) {
      return;
    }

    // CRUDの「C(Create)」「U(Update)」にあたる処理
    // 既存のキーがあれば更新、なければ新規作成になる
    const key = formatDateKey(selectedDate);
    setDiaryMap((prev) => ({
      ...prev,
      [key]: draftText,
    }));
    handleCloseModal();
  };

  const monthLabel = `${currentMonth.getFullYear()}年 ${
    currentMonth.getMonth() + 1
  }月`;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <div className="mx-auto w-full max-w-4xl">
        {/* タイトル: 画面の役割がひと目で分かる見出し */}
        <h1 className="text-2xl font-bold tracking-wide">一言日記カレンダー</h1>
        <p className="mt-2 text-sm text-slate-600">
          日付をクリックして一言日記を記録できます。
        </p>

        {/* 月移動ボタン: 操作エリアとして視覚的にまとめる */}
        <div className="mt-6 flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            前月
          </button>
          <div className="text-lg font-semibold text-slate-800">{monthLabel}</div>
          <button
            type="button"
            onClick={handleNextMonth}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            次月
          </button>
        </div>

        {/* カレンダー本体: 7列のグリッドで曜日を表現 */}
        <div className="mt-4 rounded-xl bg-white p-4 shadow">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold">
            {DAYS.map((day, index) => {
              const isSunday = index === 0;
              const isSaturday = index === 6;
              return (
                <div
                  key={day}
                  className={`py-2 ${
                    isSunday
                      ? "text-red-600"
                      : isSaturday
                        ? "text-blue-600"
                        : "text-slate-500"
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-2">
            {calendarCells.map((cell, index) => {
              if (!cell) {
                // 月の先頭に必要な空白セル
                return <div key={`empty-${index}`} className="h-16" />;
              }

              const isToday = isSameDate(cell, today);
              const isFuture = isFutureDate(cell, today);
              const key = formatDateKey(cell);
              const hasDiary = Boolean(diaryMap[key]);

              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => handleSelectDate(cell)}
                  disabled={isFuture}
                  aria-disabled={isFuture}
                  className={`relative flex h-16 flex-col items-center justify-center rounded-lg border text-sm font-semibold transition ${
                    isFuture ? "cursor-not-allowed opacity-40" : "hover:bg-slate-50"
                  } ${
                    isToday
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-700"
                  }`}
                >
                  <span>{cell.getDate()}</span>
                  {hasDiary && (
                    <span className="absolute bottom-2 h-2 w-2 rounded-full bg-blue-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* モーダル: 選択日があるときだけ表示 */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                {formatDateKey(selectedDate)} の一言日記
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-full px-2 py-1 text-sm font-semibold text-slate-500 hover:bg-slate-100"
              >
                閉じる
              </button>
            </div>

            {/* 入力欄: 日記本文を編集するためのフォーム */}
            <textarea
              value={draftText}
              onChange={(event) => setDraftText(event.target.value)}
              placeholder="今日の一言を書いてみよう"
              className="mt-4 h-32 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />

            {/* 保存ボタン: CRUDのC/Uを確定する操作 */}
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                保存する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiaryPage;
