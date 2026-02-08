import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// クラス名の衝突を解決しつつ結合するユーティリティ
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
