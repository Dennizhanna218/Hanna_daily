import { Feather } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, SectionList, StyleSheet, View } from 'react-native';
import { T } from '../components/ui';
import { formatMinutes } from '../components/WorkoutCard';
import { LIST_META } from '../lists';
import { useSettings, useStyles } from '../settings/SettingsContext';
import { ThemeColors } from '../settings/themes';
import { listEntries, updateListItem } from '../storage/entries';
import { radius, shadow, space } from '../theme';
import { DailyEntry, ListItem, totalExpense, totalWorkoutMinutes } from '../types';
import { formatKoreanDate, formatWon, fromDateKey, todayKey, weekdayOf } from '../utils/date';
import { MOOD_FACES } from './EntryScreen';

export default function HistoryScreen({ onOpen }: { onOpen: (date: string) => void }) {
  const { c } = useSettings();
  const st = useStyles(makeStyles);
  const [entries, setEntries] = useState<DailyEntry[] | null>(null);
  const [mode, setMode] = useState<'days' | 'wish'>('days');

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

  const header = (
    <View style={{ gap: 16, marginBottom: 4 }}>
      <T size={26} weight="bold" style={{ paddingHorizontal: 4, paddingTop: 12, letterSpacing: -0.5 }}>
        기록
      </T>
      <Segment
        value={mode}
        onChange={setMode}
        options={[
          { key: 'days', label: '날짜별' },
          { key: 'wish', label: '하고 싶은 것' },
        ]}
      />
    </View>
  );

  if (mode === 'wish') {
    return (
      <WishView
        header={header}
        entries={entries}
        onToggle={async (date, item) => {
          const done = !item.done;
          const patch = { done, doneAt: done ? new Date().toISOString() : undefined };
          await updateListItem(date, 'wantToDo', item.id, patch);
          setEntries((prev) =>
            (prev ?? []).map((e) =>
              e.date !== date
                ? e
                : {
                    ...e,
                    lists: {
                      ...e.lists,
                      wantToDo: e.lists.wantToDo.map((it) => (it.id === item.id ? { ...it, ...patch } : it)),
                    },
                  },
            ),
          );
        }}
        onOpen={onOpen}
      />
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(e) => e.date}
      contentContainerStyle={st.body}
      stickySectionHeadersEnabled={false}
      ListHeaderComponent={
        <View style={{ gap: 16, marginBottom: 4 }}>
          {header}
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

function Segment<K extends string>({
  value,
  onChange,
  options,
}: {
  value: K;
  onChange: (k: K) => void;
  options: { key: K; label: string }[];
}) {
  const { c } = useSettings();
  const st = useStyles(makeStyles);
  return (
    <View style={st.segment} accessibilityRole="tablist">
      {options.map((o) => {
        const on = o.key === value;
        return (
          <Pressable
            key={o.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.key)}
            style={[st.segmentItem, on && st.segmentItemOn]}
          >
            <T size={14} weight={on ? 'semibold' : 'medium'} color={on ? c.ink : c.muted}>
              {o.label}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}

/** 지금까지 적은 '하고 싶은 것'을 한곳에 모아 보고, 해낸 것은 체크합니다. */
function WishView({
  header,
  entries,
  onToggle,
  onOpen,
}: {
  header: React.ReactNode;
  entries: DailyEntry[];
  onToggle: (date: string, item: ListItem) => void;
  onOpen: (date: string) => void;
}) {
  const { c } = useSettings();
  const st = useStyles(makeStyles);
  const color = LIST_META.wantToDo.color;
  const all = entries.flatMap((e) => e.lists.wantToDo.map((item) => ({ date: e.date, item })));
  const todo = all.filter((x) => !x.item.done).sort((a, b) => b.item.createdAt.localeCompare(a.item.createdAt));
  const done = all
    .filter((x) => x.item.done)
    .sort((a, b) => (b.item.doneAt ?? '').localeCompare(a.item.doneAt ?? ''));

  const row = ({ date, item }: { date: string; item: ListItem }, i: number, arr: unknown[]) => (
    <View key={date + item.id} style={[st.wishRow, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: !!item.done }}
        accessibilityLabel={`${item.text} ${item.done ? '해낸 것 취소' : '해냈어요'}`}
        hitSlop={8}
        onPress={() => onToggle(date, item)}
        style={[st.check, { borderColor: color }, item.done && { backgroundColor: color }]}
      >
        {item.done ? <Feather name="check" size={14} color="#fff" /> : null}
      </Pressable>
      <Pressable style={{ flex: 1, minWidth: 0, gap: 2 }} onPress={() => onOpen(date)}>
        <T
          size={15}
          color={item.done ? c.muted : c.ink}
          style={item.done ? { textDecorationLine: 'line-through' } : undefined}
        >
          {item.text}
        </T>
        <T size={12} color={c.muted}>
          {formatKoreanDate(date)}에 적음
        </T>
      </Pressable>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={st.body}>
      {header}
      <View style={st.wishSummary}>
        <Feather name="star" size={14} color={color} />
        <T size={14} color={c.ink2}>
          하고 싶은 것 {all.length}개 중 <T size={14} weight="bold">{done.length}개</T>를 해냈어요
        </T>
      </View>
      {all.length === 0 ? (
        <View style={st.empty}>
          <Feather name="star" size={28} color={c.muted} />
          <T color={c.muted} style={{ textAlign: 'center' }}>
            아직 적은 '하고 싶은 것'이 없어요.{'\n'}'오늘' 탭의 돌아보기에서 적어 보세요.
          </T>
        </View>
      ) : null}
      {todo.length > 0 ? <View style={st.wishCard}>{todo.map(row)}</View> : null}
      {done.length > 0 ? (
        <>
          <T size={13} weight="semibold" color={c.muted} style={st.monthHeader}>
            해낸 것 {done.length}
          </T>
          <View style={st.wishCard}>{done.map(row)}</View>
        </>
      ) : null}
    </ScrollView>
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
    segment: { flexDirection: 'row', backgroundColor: c.fill, borderRadius: 12, padding: 4 },
    segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 9 },
    segmentItemOn: { backgroundColor: c.surface, ...shadow(c) },
    wishSummary: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4, marginTop: 4 },
    wishCard: { backgroundColor: c.surface, borderRadius: radius.lg, paddingHorizontal: 16, paddingVertical: 4, ...shadow(c) },
    wishRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.line,
    },
    check: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  });
}
