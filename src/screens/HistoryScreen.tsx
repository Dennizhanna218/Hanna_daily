import { Feather } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, View } from 'react-native';
import { T } from '../components/ui';
import { formatMinutes } from '../components/WorkoutCard';
import { LIST_META } from '../lists';
import { useSettings, useStyles } from '../settings/SettingsContext';
import { ThemeColors } from '../settings/themes';
import { listEntries } from '../storage/entries';
import { radius, shadow, space } from '../theme';
import { DailyEntry, totalExpense, totalWorkoutMinutes } from '../types';
import { formatWon, fromDateKey, todayKey, weekdayOf } from '../utils/date';
import { MOOD_FACES } from './EntryScreen';

export default function HistoryScreen({ onOpen }: { onOpen: (date: string) => void }) {
  const { c } = useSettings();
  const st = useStyles(makeStyles);
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
      <T color={c.muted} style={{ textAlign: 'center', marginTop: 40 }}>
        불러오는 중…
      </T>
    );
  }

  const thisMonth = entries.filter((e) => e.date.startsWith(todayKey().slice(0, 7)));
  const monthSpent = thisMonth.reduce((n, e) => n + totalExpense(e), 0);
  const workoutDays = thisMonth.filter((e) => e.workouts.length > 0).length;
  const momentCount = entries.reduce((n, e) => n + e.lists.moments.length, 0);

  return (
    <SectionList
      sections={sections}
      keyExtractor={(e) => e.date}
      contentContainerStyle={st.body}
      stickySectionHeadersEnabled={false}
      ListHeaderComponent={
        <View style={{ gap: 16, marginBottom: 4 }}>
          <T size={26} weight="bold" style={{ paddingHorizontal: 4, paddingTop: 12, letterSpacing: -0.5 }}>
            기록
          </T>
          <View style={st.stats}>
            <Stat label="기록한 날" value={`${entries.length}일`} icon="calendar" />
            <Stat label="좋은 순간" value={`${momentCount}개`} icon="sun" />
            <Stat label="이번 달 운동" value={`${workoutDays}일`} icon="zap" />
            <Stat label="이번 달 지출" value={formatWon(monthSpent)} icon="credit-card" />
          </View>
        </View>
      }
      renderSectionHeader={({ section }) => (
        <T size={13} weight="semibold" color={c.muted} style={st.monthHeader}>
          {section.title}
        </T>
      )}
      ListEmptyComponent={
        <View style={st.empty}>
          <Feather name="book-open" size={28} color={c.muted} />
          <T color={c.muted} style={{ textAlign: 'center' }}>
            아직 기록이 없어요.{'\n'}'오늘' 탭에서 첫 기록을 남겨 보세요.
          </T>
        </View>
      }
      renderItem={({ item }) => <Row entry={item} onPress={() => onOpen(item.date)} />}
    />
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: 'calendar' | 'sun' | 'zap' | 'credit-card' }) {
  const { c } = useSettings();
  const st = useStyles(makeStyles);
  return (
    <View style={st.stat}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
        <Feather name={icon} size={12} color={c.accent} />
        <T size={12} color={c.muted}>
          {label}
        </T>
      </View>
      <T size={17} weight="bold" numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </T>
    </View>
  );
}

function Row({ entry, onPress }: { entry: DailyEntry; onPress: () => void }) {
  const { c } = useSettings();
  const st = useStyles(makeStyles);
  const firstMoment = entry.lists.moments[0]?.text;
  const preview = entry.diary.trim().split('\n')[0];
  const spent = totalExpense(entry);
  const minutes = totalWorkoutMinutes(entry);
  const isToday = entry.date === todayKey();

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [st.row, pressed && { opacity: 0.7 }]}>
      <View style={st.dateCol}>
        <T size={22} weight="bold" color={isToday ? c.accent : c.ink}>
          {fromDateKey(entry.date).getDate()}
        </T>
        <T size={12} color={c.muted}>
          {weekdayOf(entry.date)}
        </T>
      </View>
      <View style={{ flex: 1, gap: 4, minWidth: 0 }}>
        {firstMoment ? (
          <View style={st.momentLine}>
            <Feather name="sun" size={13} color={LIST_META.moments.color} />
            <T size={15} weight="medium" numberOfLines={1} style={{ flex: 1 }}>
              {firstMoment}
            </T>
          </View>
        ) : null}
        {preview ? (
          <T size={14} color={c.ink2} numberOfLines={firstMoment ? 1 : 2}>
            {preview}
          </T>
        ) : null}
        {!firstMoment && !preview ? (
          <T size={14} color={c.muted}>
            메모 없음
          </T>
        ) : null}
        <View style={st.chips}>
          {entry.period.active ? <Tag text="🩸 생리" /> : null}
          {entry.workouts.length > 0 ? <Tag text={`🏃 ${minutes ? formatMinutes(minutes) : '운동'}`} /> : null}
          {entry.lists.moments.length > 1 ? <Tag text={`좋은 순간 ${entry.lists.moments.length}`} /> : null}
          {spent > 0 ? <Tag text={formatWon(spent)} /> : null}
        </View>
      </View>
      {entry.mood ? <T size={24}>{MOOD_FACES[entry.mood - 1]}</T> : null}
    </Pressable>
  );
}

function Tag({ text }: { text: string }) {
  const { c } = useSettings();
  const st = useStyles(makeStyles);
  return (
    <View style={st.tag}>
      <T size={12} color={c.ink2}>
        {text}
      </T>
    </View>
  );
}

function makeStyles(c: ThemeColors) {
  return StyleSheet.create({
    body: { padding: space, paddingBottom: 48, gap: 10, maxWidth: 640, width: '100%', alignSelf: 'center' },
    stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    stat: {
      width: '48%',
      flexGrow: 1,
      minWidth: 0,
      backgroundColor: c.surface,
      borderRadius: radius.md,
      paddingVertical: 12,
      paddingHorizontal: 14,
      gap: 4,
      ...shadow(c),
    },
    monthHeader: { paddingHorizontal: 4, marginTop: 12, marginBottom: 2 },
    empty: { alignItems: 'center', gap: 12, marginTop: 48 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      backgroundColor: c.surface,
      borderRadius: radius.lg,
      padding: 16,
      ...shadow(c),
    },
    dateCol: { width: 36, alignItems: 'center' },
    momentLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    chips: { flexDirection: 'row', gap: 6, marginTop: 2, flexWrap: 'wrap' },
    tag: { backgroundColor: c.fill, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  });
}
