// 앱 설정(색감·글씨체·보이는 항목 등) 저장. 기록과 마찬가지로 기기에만 저장합니다.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_FONT_ID } from '../settings/fontOptions';
import { DEFAULT_THEME_ID } from '../settings/themes';

export type SectionKey = 'moments' | 'diary' | 'reflection' | 'workout' | 'period' | 'meals' | 'expenses';

export const SECTION_LABELS: Record<SectionKey, string> = {
  moments: '기분 좋은 순간',
  diary: '오늘의 일기',
  reflection: '돌아보기',
  workout: '운동',
  period: '생리',
  meals: '식사',
  expenses: '지출',
};

export const SECTION_KEYS = Object.keys(SECTION_LABELS) as SectionKey[];

export interface Settings {
  themeId: string;
  fontId: string;
  sections: Record<SectionKey, boolean>;
  customWorkoutTypes: string[];
}

const KEY = 'hanna-daily:settings';

export function defaultSettings(): Settings {
  return {
    themeId: DEFAULT_THEME_ID,
    fontId: DEFAULT_FONT_ID,
    sections: Object.fromEntries(SECTION_KEYS.map((k) => [k, true])) as Record<SectionKey, boolean>,
    customWorkoutTypes: [],
  };
}

export function normalizeSettings(raw: Partial<Settings> | null | undefined): Settings {
  const base = defaultSettings();
  if (!raw || typeof raw !== 'object') return base;
  return {
    themeId: typeof raw.themeId === 'string' ? raw.themeId : base.themeId,
    fontId: typeof raw.fontId === 'string' ? raw.fontId : base.fontId,
    sections: { ...base.sections, ...(raw.sections ?? {}) },
    customWorkoutTypes: Array.isArray(raw.customWorkoutTypes)
      ? raw.customWorkoutTypes.filter((x) => typeof x === 'string')
      : [],
  };
}

export async function loadSettings(): Promise<Settings> {
  try {
    const json = await AsyncStorage.getItem(KEY);
    return normalizeSettings(json ? JSON.parse(json) : null);
  } catch {
    return defaultSettings();
  }
}

export async function saveSettings(s: Settings): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(s));
}
