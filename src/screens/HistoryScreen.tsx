import { Feather } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, View } from 'react-native';
import { T } from '../components/ui';
import { LIST_META } from '../lists';
import { listEntries } from '../storage/entries';
import { colors, radius, shadow, space } from '../theme';
import { DailyEntry, totalExpense } from '../types';
import { formatWon, fromDateKey, todayKey, weekdayOf } from '../utils/date';
import { MOOD_FACES } from './EntryScreen';

export default function HistoryScreen({ onOpen }: { onOpen: (date: string) => void }) {
  const [entries, setEntries] = useState<DailyEntry[] | null>(null);

  useEffect(() => {
    listEntries().then(setEntries);
  }, []);

  const sections = useMemo(() => {
    const map = new Map<string, DailyEntry[]>();
    for (const e of entries ?? []) {
      const k = e.date.slice(0, 7);
      map.set(k, [...(map.get(k) ?? []), e]);
    }
    return [...map.entries()].map(([k, data]) => {
      const [y, m] = k.split('-');
      return { title: `${y}년 ${Number(m)}월`, data };
    });
  }, [entries]);

  if (!entries) {
    return (
      <T color={colors.muted} style={{ textAlign: 'center', marginTop: 40 }}>
        불러오는 중…
      </T>
    );
  }

  const thisMonth = todayKey().slice(0, 7);
  const monthSpent = entries.filter((e) => e.date.startsWith(thisMonth)).reduce((n, e) => n + totalExpense(e), 0);
  const momentCount = entries.reduce((n, e) => n + e.lists.moments.length, 0);

  return (
    <SectionList
      sections={sections}
      keyExtractor={(e) => e.date}
      contentContainerStyle={s.body}
      stickySectionHeadersEnabled={false}
      ListHeaderComponent={
        <View style={{ gap: 16, marginBottom: 4 }}>
          <T size={26} weight="bold" style={{ paddingHorizontal: 4, paddingTop: 12, letterSpacing: -0.5 }}>
            기록
          </T>
          <View style={s.stats}>
            <Stat label="기록한 날" value={`${entries.length}일`} />
            <Stat label="좋은 순간" value={`${momentCount}개`} />
            <Stat label="이번 달 지출" value={formatWon(monthSpent)} />
          </View>
        </View>
      }
      renderSectionHeader={({ section }) => (
        <T size={13} weight="semibold" color={colors.muted} style={s.monthHeader}>
          {section.title}
        </T>
      )}
      ListEmptyComponent={
        <View style={s.empty}>
          <Feather name="book-open" size={28} color={colors.muted} />
          <T color={colors.muted} style={{ textAlign: 'center' }}>
            아직 기록이 없어요.{'\n'}'오늘' 탭에서 첫 기록을 남겨 보세요.
          </T>
        </View>
      }
      renderItem={({ item }) => <Row entry={item} onPress={() => onOpen(item.date)} />}
    />
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.stat}>
      <T size={12} color={colors.muted}>
        {label}
      </T>
      <T size={16} weight="bold" numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </T>
    </View>
  );
}

function Row({ entry, onPress }: { entry: DailyEntry; onPress: () => void }) {
  const firstMoment = entry.lists.moments[0]?.text;
  const preview = entry.diary.trim().split('\n')[0];
  const spent = totalExpense(entry);
  const day = fromDateKey(entry.date).getDate();
  const isToday = entry.date === todayKey();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [s.row, pressed && { opacity: 0.7 }]}
    >
      <View style={s.dateCol}>
        <T size={22} weight="bold" color={isToday ? colors.accent : colors.ink}>
          {day}
        </T>
        <T size={12} color={colors.muted}>
          {weekdayOf(entry.date)}
        </T>
      </View>
      <View style={{ flex: 1, gap: 4, minWidth: 0 }}>
        {firstMoment ? (
          <View style={s.momentLine}>
            <Feather name="sun" size={13} color={LIST_META.moments.color} />
            <T size={15} weight="medium" numberOfLines={1} style={{ flex: 1 }}>
              {firstMoment}
            </T>
          </View>
        ) : null}
        {preview ? (
          <T size={14} color={colors.ink2} numberOfLines={firstMoment ? 1 : 2}>
            {preview}
          </T>
        ) : null}
        {!firstMoment && !preview ? (
          <T size={14} color={colors.muted}>
            메모 없음
          </T>
        ) : null}
        <View style={s.chips}>
          {entry.lists.moments.length > 1 ? <Chip text={`좋은 순간 ${entry.lists.moments.length}`} /> : null}
          {spent > 0 ? <Chip text={formatWon(spent)} /> : null}
        </View>
      </View>
      {entry.mood ? <T size={24}>{MOOD_FACES[entry.mood - 1]}</T> : null}
    </Pressable>
  );
}

function Chip({ text }: { text: string }) {
  return (
    <View style={s.chip}>
      <T size={12} color={colors.ink2}>
        {text}
      </T>
    </View>
  );
}

const s = StyleSheet.create({
  body: { padding: space, paddingBottom: 48, gap: 10, maxWidth: 640, width: '100%', alignSelf: 'center' },
  stats: { flexDirection: 'row', gap: 8 },
  stat: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 2,
    ...shadow,
  },
  monthHeader: { paddingHorizontal: 4, marginTop: 12, marginBottom: 2 },
  empty: { alignItems: 'center', gap: 12, marginTop: 48 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    ...shadow,
  },
  dateCol: { width: 36, alignItems: 'center' },
  momentLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chips: { flexDirection: 'row', gap: 6, marginTop: 2, flexWrap: 'wrap' },
  chip: { backgroundColor: colors.fill, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
});
