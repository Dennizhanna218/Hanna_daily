// 하루 기록 데이터 구조.
// 화면(UI)과 저장 방식에 의존하지 않는 순수 데이터라서
// 웹앱 → 네이티브 앱으로 옮겨도 그대로 재사용됩니다.

export type Score = 1 | 2 | 3 | 4 | 5;

export interface Meals {
  breakfast: string;
  lunch: string;
  dinner: string;
  snack: string;
}

export interface Expense {
  id: string;
  item: string;
  amount: number; // 원 단위
}

export interface DailyEntry {
  date: string; // YYYY-MM-DD
  mood: Score | null;
  energy: Score | null;
  diary: string;
  gratitude: string;
  wentWell: string;
  toImprove: string;
  tomorrow: string;
  meals: Meals;
  expenses: Expense[];
  updatedAt: string; // ISO 시간
}

export function emptyEntry(date: string): DailyEntry {
  return {
    date,
    mood: null,
    energy: null,
    diary: '',
    gratitude: '',
    wentWell: '',
    toImprove: '',
    tomorrow: '',
    meals: { breakfast: '', lunch: '', dinner: '', snack: '' },
    expenses: [],
    updatedAt: new Date().toISOString(),
  };
}

export function isEntryEmpty(e: DailyEntry): boolean {
  return (
    e.mood === null &&
    e.energy === null &&
    !e.diary.trim() &&
    !e.gratitude.trim() &&
    !e.wentWell.trim() &&
    !e.toImprove.trim() &&
    !e.tomorrow.trim() &&
    !Object.values(e.meals).some((m) => m.trim()) &&
    e.expenses.length === 0
  );
}

export function totalExpense(e: DailyEntry): number {
  return e.expenses.reduce((sum, x) => sum + (Number.isFinite(x.amount) ? x.amount : 0), 0);
}
