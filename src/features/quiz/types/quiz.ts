export type QuizQuestion = {
  // 問題番号
  number: number;
 // クイズの質問文
  question: string;
  // 選択肢
  options: string[];
  // 正解の選択肢のインデックス
  answerIndex: number;
}