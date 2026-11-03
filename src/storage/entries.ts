// 기록 저장소. 앱의 다른 코드는 이 파일의 함수만 사용합니다.
// AsyncStorage는 웹에서는 브라우저 저장소(localStorage), 네이티브 앱에서는
// 기기 저장소를 쓰기 때문에 같은 코드가 양쪽에서 동작합니다.
// 나중에 SQLite나 클라우드 동기화로 바꾸고 싶으면 이 파일만 고치면 됩니다.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyEntry, emptyEntry, isEntryEmpty } from '../types';

const PREFIX = 'hanna-daily:entry:';
const keyFor = (date: string) => PREFIX + date;

export const BACKUP_FORMAT = 'hanna-daily-backup';
export const BACKUP_VERSION = 1;

export interface Backup {
  format: typeof BACKUP_FORMAT;
  version: number;
  exportedAt: string;
  entries: DailyEntry[];
}

// 예전 버전에서 저장한 데이터에 새 항목이 빠져 있어도 안전하게 채워 줍니다.
function normalize(raw: Partial<DailyEntry> & { date: string }): DailyEntry {
  const base = emptyEntry(raw.date);
  return {
    ...base,
    ...raw,
    meals: { ...base.meals, ...(raw.meals ?? {}) },
    expenses: Array.isArray(raw.expenses) ? raw.expenses : [],
  };
}

export async function getEntry(date: string): Promise<DailyEntry> {
  const json = await AsyncStorage.getItem(keyFor(date));
  return json ? normalize(JSON.parse(json)) : emptyEntry(date);
}

export async function saveEntry(entry: DailyEntry): Promise<void> {
  if (isEntryEmpty(entry)) {
    await AsyncStorage.removeItem(keyFor(entry.date));
    return;
  }
  await AsyncStorage.setItem(keyFor(entry.date), JSON.stringify(entry));
}

export async function deleteEntry(date: string): Promise<void> {
  await AsyncStorage.removeItem(keyFor(date));
}

/** 저장된 모든 기록을 최신 날짜 순으로 돌려줍니다. */
export async function listEntries(): Promise<DailyEntry[]> {
  const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(PREFIX));
  const pairs = await AsyncStorage.multiGet(keys);
  return pairs
    .filter(([, v]) => v)
    .map(([, v]) => normalize(JSON.parse(v as string)))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function createBackup(): Promise<Backup> {
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    entries: await listEntries(),
  };
}

/** 백업 파일 내용을 불러옵니다. 같은 날짜가 있으면 더 최근에 수정된 쪽을 남깁니다. */
export async function restoreBackup(text: string): Promise<number> {
  const data = JSON.parse(text) as Partial<Backup>;
  if (data.format !== BACKUP_FORMAT || !Array.isArray(data.entries)) {
    throw new Error('Hanna Daily 백업 파일이 아니에요.');
  }
  let count = 0;
  for (const raw of data.entries) {
    if (!raw || typeof raw.date !== 'string') continue;
    const incoming = normalize(raw);
    const existing = await AsyncStorage.getItem(keyFor(incoming.date));
    if (existing) {
      const current = normalize(JSON.parse(existing));
      if (current.updatedAt > incoming.updatedAt) continue;
    }
    await AsyncStorage.setItem(keyFor(incoming.date), JSON.stringify(incoming));
    count++;
  }
  return count;
}
