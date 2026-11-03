// 운동 종류, 생리 증상 목록, 생리 주기 계산.
import { Flow } from './types';
import { addDays, fromDateKey } from './utils/date';

export const WORKOUT_TYPES: { name: string; emoji: string }[] = [
  { name: '걷기', emoji: '🚶' },
  { name: '러닝', emoji: '🏃' },
  { name: '헬스', emoji: '🏋️' },
  { name: '요가', emoji: '🧘' },
  { name: '필라테스', emoji: '🤸' },
  { name: '스트레칭', emoji: '🙆' },
  { name: '홈트', emoji: '🏠' },
  { name: '수영', emoji: '🏊' },
  { name: '자전거', emoji: '🚴' },
  { name: '등산', emoji: '🥾' },
];

export function workoutEmoji(type: string): string {
  return WORKOUT_TYPES.find((t) => t.name === type)?.emoji ?? '💪';
}

export const MINUTE_PRESETS = [15, 30, 45, 60, 90];

export const FLOW_OPTIONS: { key: Flow; label: string }[] = [
  { key: 'light', label: '💧 적음' },
  { key: 'medium', label: '💧💧 보통' },
  { key: 'heavy', label: '💧💧💧 많음' },
];

export const SYMPTOM_GROUPS: { title: string; items: string[] }[] = [
  {
    title: '몸',
    items: [
      '생리통', '허리 통증', '두통', '가슴 통증', '붓기', '복부 팽만', '피로', '졸림', '불면',
      '어지러움', '피부 트러블', '근육통', '오한', '열감', '다리 저림',
    ],
  },
  {
    title: '마음',
    items: [
      '예민해짐', '짜증', '우울감', '불안', '감정 기복', '눈물 많아짐', '무기력', '집중력 저하',
      '의욕 저하', '외로움',
    ],
  },
  {
    title: '식욕 · 소화',
    items: [
      '식욕 증가', '식욕 감소', '단 거 땡김', '짠 거 땡김', '매운 거 땡김', '탄수화물 땡김',
      '야식 땡김', '소화불량', '메스꺼움', '설사', '변비',
    ],
  },
];

const DAY = 24 * 60 * 60 * 1000;
const daysBetween = (a: string, b: string) => Math.round((fromDateKey(b).getTime() - fromDateKey(a).getTime()) / DAY);

export interface PeriodStats {
  lastStart: string | null;
  avgCycle: number | null; // 두 번 이상 기록해야 계산돼요
  nextStart: string | null;
  dDay: number | null; // 다음 예정일까지 남은 날
  dayOfPeriod: number | null; // 오늘이 생리 며칠째인지 (생리 중일 때)
}

/**
 * 생리한 날짜 목록으로 시작일·평균 주기·다음 예정일을 계산합니다.
 * 3일 넘게 비면 새 생리가 시작된 것으로 봅니다.
 */
export function periodStats(activeDates: string[], today: string): PeriodStats {
  const dates = [...new Set(activeDates)].filter((d) => d <= today).sort();
  const starts: string[] = [];
  dates.forEach((d, i) => {
    if (i === 0 || daysBetween(dates[i - 1], d) > 3) starts.push(d);
  });
  if (starts.length === 0) return { lastStart: null, avgCycle: null, nextStart: null, dDay: null, dayOfPeriod: null };

  const cycles = starts
    .slice(1)
    .map((s, i) => daysBetween(starts[i], s))
    .filter((n) => n >= 18 && n <= 45)
    .slice(-6);
  const avgCycle = cycles.length ? Math.round(cycles.reduce((a, b) => a + b, 0) / cycles.length) : null;
  const lastStart = starts[starts.length - 1];
  const nextStart = addDays(lastStart, avgCycle ?? 28);
  const inPeriod = dates[dates.length - 1] === today;
  return {
    lastStart,
    avgCycle,
    nextStart,
    dDay: daysBetween(today, nextStart),
    dayOfPeriod: inPeriod ? daysBetween(lastStart, today) + 1 : null,
  };
}
