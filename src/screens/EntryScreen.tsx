import { Feather } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, TextInputInstance, View } from 'react-native';
import PeriodCard from '../components/PeriodCard';
import { Card, Field, IconButton, QuickList, ScorePicker, SectionTitle, T, useInputText } from '../components/ui';
import WorkoutCard from '../components/WorkoutCard';
import { periodStats } from '../health';
import { LIST_META, REFLECTION_KEYS } from '../lists';
import { useSettings, useStyles } from '../settings/SettingsContext';
import { ThemeColors } from '../settings/themes';
import { getEntry, listEntries, saveEntry } from '../storage/entries';
import { radius, space } from '../theme';
import { DailyEntry, ListItem, ListKey, totalExpense } from '../types';
import { addDays, formatKoreanDateLong, formatWon, newId, todayKey } from '../utils/date';
import { useOnBackground } from '../utils/useOnBackground';

export const MOOD_FACES = ['😞', '😕', '😐', '🙂', '😄'];
const MOOD_NAMES = ['별로', '그저', '보통', '좋음', '최고'];
const ENERGY_FACES = ['🪫', '😮‍💨', '🙂', '💪', '⚡'];
const ENERGY_NAMES = ['방전', '지침', '보통', '쌩쌩', '넘침'];

interface Props {
  date: string;
  onChangeDate: (date: string) => void;
}

export default function EntryScreen({ date, onChangeDate }: Props) {
  const { c, settings } = useSettings();
  const show = settings.sections;
  const st = useStyles(makeStyles);
  const [entry, setEntry] = useState<DailyEntry | null>(null);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [periodDays, setPeriodDays] = useState<Set<string>>(new Set());
  const entryRef = useRef<DailyEntry | null>(null);
  // 저장이 적은 순서대로 이뤄지도록 한 줄로 세웁니다.
  const saveChain = useRef<Promise<void>>(Promise.resolve());

  // 생리 주기 계산용: 생리한 날짜들을 한 번 불러옵니다.
  useEffect(() => {
    listEntries().then((all) => setPeriodDays(new Set(all.filter((e) => e.period.active).map((e) => e.date))));
  }, []);

  // 날짜가 바뀌면 이전 날짜 내용을 먼저 저장하고 새 날짜를 불러옵니다.
  useEffect(() => {
    let alive = true;
    entryRef.current = null;
    setEntry(null);
    setStatus('idle');
    getEntry(date).then((e) => {
      if (!alive) return;
      entryRef.current = e;
      setEntry(e);
    });
    return () => {
      alive = false;
      // 다른 날짜로 넘어갈 때, 방금 날짜의 생리 기록을 주기 계산에 반영
      const prev = entryRef.current;
      if (prev) {
        setPeriodDays((s) => {
          const n = new Set(s);
          if (prev.period.active) n.add(prev.date);
          else n.delete(prev.date);
          return n;
        });
      }
    };
  }, [date]);

  // 입력할 때마다 바로 저장합니다. (앱을 바로 닫아도 사라지지 않도록)
  const update = (patch: Partial<DailyEntry>) => {
    const prev = entryRef.current;
    if (!prev) return;
    const next = { ...prev, ...patch, updatedAt: new Date().toISOString() };
    entryRef.current = next;
    setEntry(next);
    setStatus('saving');
    saveChain.current = saveChain.current
      .then(() => saveEntry(next))
      .then(
        () => setStatus('saved'),
        () => setStatus('idle'),
      );
  };

  const setList = (key: ListKey) => (items: ListItem[]) => {
    const prev = entryRef.current;
    if (prev) update({ lists: { ...prev.lists, [key]: items } });
  };

  const stats = useMemo(() => {
    const days = new Set(periodDays);
    if (entry) {
      if (entry.period.active) days.add(entry.date);
      else days.delete(entry.date);
    }
    return periodStats([...days], date);
  }, [periodDays, entry?.period.active, entry?.date, date]);

  const isToday = date === todayKey();

  return (
    <ScrollView contentContainerStyle={st.body} keyboardShouldPersistTaps="handled">
      <View style={st.header}>
        <View style={{ flex: 1, gap: 2 }}>
          <T size={13} weight="semibold" color={isToday ? c.accent : c.muted}>
            {isToday ? '오늘' : date.slice(0, 4) + '년'}
          </T>
          <T size={26} weight="bold" style={{ letterSpacing: -0.5 }}>
            {formatKoreanDateLong(date)}
          </T>
          <T size={12} color={c.muted}>
            {status === 'saving' ? '저장 중…' : status === 'saved' ? '저장됨' : '적는 대로 자동 저장돼요'}
          </T>
        </View>
        <View style={st.nav}>
          <IconButton icon="chevron-left" label="이전 날" onPress={() => onChangeDate(addDays(date, -1))} />
          <IconButton
            icon="chevron-right"
            label="다음 날"
            disabled={isToday}
            onPress={() => onChangeDate(addDays(date, 1))}
          />
        </View>
      </View>

      {!entry ? (
        <T color={c.muted} style={{ textAlign: 'center', marginTop: 40 }}>
          불러오는 중…
        </T>
      ) : (
        <>
          <Card>
            <SectionTitle title="오늘의 컨디션" icon="activity" />
            <ScorePicker
              label="기분"
              faces={MOOD_FACES}
              names={MOOD_NAMES}
              value={entry.mood}
              onChange={(mood) => update({ mood })}
            />
            <ScorePicker
              label="에너지"
              faces={ENERGY_FACES}
              names={ENERGY_NAMES}
              value={entry.energy}
              onChange={(energy) => update({ energy })}
            />
          </Card>

          {show.moments ? (
            <Card>
              <SectionTitle title={LIST_META.moments.title} icon="sun" color={LIST_META.moments.color} />
              <QuickList
                color={LIST_META.moments.color}
                placeholder={LIST_META.moments.placeholder}
                items={entry.lists.moments}
                showTime
                onChange={setList('moments')}
              />
            </Card>
          ) : null}

          {show.diary ? (
            <Card>
              <SectionTitle title="오늘의 일기" icon="edit-3" />
              <Field
                multiline
                placeholder="퇴근길에 떠오르는 오늘 하루를 자유롭게 적어 보세요"
                value={entry.diary}
                onChangeText={(diary) => update({ diary })}
                style={{ minHeight: 150, lineHeight: 24 }}
              />
            </Card>
          ) : null}

          {show.reflection ? (
            <Card style={{ gap: 22 }}>
              <SectionTitle title="돌아보기" icon="refresh-ccw" />
              {REFLECTION_KEYS.map((key) => (
                <QuickList
                  key={key}
                  title={LIST_META[key].title}
                  color={LIST_META[key].color}
                  placeholder={LIST_META[key].placeholder}
                  items={entry.lists[key]}
                  showTime={LIST_META[key].showTime}
                  onChange={setList(key)}
                />
              ))}
            </Card>
          ) : null}

          {show.workout ? <WorkoutCard workouts={entry.workouts} onChange={(workouts) => update({ workouts })} /> : null}

          {show.period ? (
            <PeriodCard period={entry.period} stats={stats} onChange={(period) => update({ period })} />
          ) : null}

          {show.meals ? (
            <Card>
              <SectionTitle title="식사" icon="coffee" />
              <View style={st.mealGrid}>
                {(
                  [
                    ['breakfast', '아침'],
                    ['lunch', '점심'],
                    ['dinner', '저녁'],
                    ['snack', '간식'],
                  ] as const
                ).map(([key, label]) => (
                  <View key={key} style={st.mealCell}>
                    <T size={12} weight="medium" color={c.muted}>
                      {label}
                    </T>
                    <Field
                      placeholder="-"
                      value={entry.meals[key]}
                      onChangeText={(v) => update({ meals: { ...entry.meals, [key]: v } })}
                      style={{ width: '100%' }}
                    />
                  </View>
                ))}
              </View>
            </Card>
          ) : null}

          {show.expenses ? <ExpenseCard entry={entry} update={update} /> : null}
        </>
      )}
    </ScrollView>
  );
}

function ExpenseCard({ entry, update }: { entry: DailyEntry; update: (p: Partial<DailyEntry>) => void }) {
  const { c } = useSettings();
  const st = useStyles(makeStyles);
  const text = useInputText();
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const amountRef = useRef<TextInputInstance>(null);

  const add = () => {
    const n = Number(amount.replace(/[^0-9]/g, ''));
    if (!item.trim() || !n) return;
    update({ expenses: [...entry.expenses, { id: newId(), item: item.trim(), amount: n }] });
    setItem('');
    setAmount('');
  };

  // 항목과 금액을 다 적고 앱을 닫으면 자동으로 추가합니다.
  useOnBackground(add);

  return (
    <Card>
      <SectionTitle
        title="지출"
        icon="credit-card"
        right={
          <T weight="bold" size={16}>
            {formatWon(totalExpense(entry))}
          </T>
        }
      />
      {entry.expenses.length > 0 ? (
        <View>
          {entry.expenses.map((x) => (
            <View key={x.id} style={st.expenseRow}>
              <T size={15} style={{ flex: 1 }} numberOfLines={1}>
                {x.item}
              </T>
              <T size={15} weight="medium">
                {formatWon(x.amount)}
              </T>
              <Pressable
                accessibilityLabel={`${x.item} 삭제`}
                hitSlop={10}
                onPress={() => update({ expenses: entry.expenses.filter((e) => e.id !== x.id) })}
              >
                <Feather name="x" size={15} color={c.muted} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
      <View style={st.addRow}>
        <TextInput
          style={[text, st.addInput, { flex: 1.5 }]}
          placeholder="어디에 썼나요?"
          placeholderTextColor={c.muted}
          value={item}
          onChangeText={setItem}
          returnKeyType="next"
          onSubmitEditing={() => amountRef.current?.focus()}
        />
        <View style={st.divider} />
        <TextInput
          ref={amountRef}
          style={[text, st.addInput, { flex: 1, textAlign: 'right' }]}
          placeholder="금액"
          placeholderTextColor={c.muted}
          keyboardType="number-pad"
          value={amount}
          onChangeText={setAmount}
          onSubmitEditing={add}
        />
        <Pressable
          accessibilityLabel="지출 추가"
          onPress={add}
          style={[st.addBtn, !(item.trim() && amount.trim()) && { opacity: 0.3 }]}
        >
          <Feather name="plus" size={16} color={c.onAccent} />
        </Pressable>
      </View>
    </Card>
  );
}

function makeStyles(c: ThemeColors) {
  return StyleSheet.create({
    body: { padding: space, paddingBottom: 48, gap: 14, maxWidth: 640, width: '100%', alignSelf: 'center' },
    header: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 4, paddingTop: 12, paddingBottom: 8 },
    nav: { flexDirection: 'row', gap: 8, paddingBottom: 18 },
    mealGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    mealCell: { width: '48%', flexGrow: 1, gap: 6, minWidth: 0 },
    expenseRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.line,
    },
    addRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.fill,
      borderRadius: radius.sm,
      paddingLeft: 14,
      paddingRight: 6,
      minHeight: 46,
      gap: 8,
    },
    addInput: { minWidth: 0, paddingVertical: 10 },
    divider: { width: 1, height: 18, backgroundColor: c.line },
    addBtn: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: c.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
