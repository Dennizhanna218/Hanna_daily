const pad = (n: number) => String(n).padStart(2, '0');

/** 기기 현지 시간 기준 YYYY-MM-DD */
export function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, days: number): string {
  const d = fromDateKey(key);
  d.setDate(d.getDate() + days);
  return toDateKey(d);
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

/** 예: 11월 3일 (화) */
export function formatKoreanDate(key: string): string {
  const d = fromDateKey(key);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAYS[d.getDay()]})`;
}

/** 예: 11월 3일 화요일 */
export function formatKoreanDateLong(key: string): string {
  const d = fromDateKey(key);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${WEEKDAYS[d.getDay()]}요일`;
}

export function weekdayOf(key: string): string {
  return WEEKDAYS[fromDateKey(key).getDay()];
}

/** ISO 시간 → 오후 6:42 */
export function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const h = d.getHours();
  return `${h < 12 ? '오전' : '오후'} ${h % 12 || 12}:${pad(d.getMinutes())}`;
}

export function formatWon(n: number): string {
  return `${n.toLocaleString('ko-KR')}원`;
}

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
