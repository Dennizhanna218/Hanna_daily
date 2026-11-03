import { Feather } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, TextInputInstance, View } from 'react-native';
import { Card, Field, IconButton, inputText, QuickList, ScorePicker, SectionTitle, T } from '../components/ui';
import { LIST_META, REFLECTION_KEYS } from '../lists';
import { getEntry, saveEntry } from '../storage/entries';
import { colors, radius, space } from '../theme';
import { DailyEntry, ListItem, ListKey, totalExpense } from '../types';
import { addDays, formatKoreanDateLong, formatWon, newId, todayKey } from '../utils/date';

export const MOOD_FACES = ['😞', '😕', '😐', '🙂', '😄'];
const MOOD_NAMES = ['별로', '그저', '보통', '좋음', '최고'];
const ENERGY_FACES = ['🪫', '😮‍💨', '🙂', '💪', '⚡'];
const ENERGY_NAMES = ['방전', '지침', '보통', '쌩쌩', '넘침'];

interface Props {
  date: string;
  onChangeDate: (date: string) => void;
}

export default function EntryScreen({ date, onChangeDate }: Props) {
  const [entry, setEntry] = useState<DailyEntry | null>(null);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const entryRef = useRef<DailyEntry | null>(null);
  const pending = useRef<DailyEntry | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = async () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const toSave = pending.current;
    pending.current = null;
    if (toSave) {
      await saveEntry(toSave);
      setStatus('saved');
    }
  };

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
      void flush();
    };
  }, [date]);

  // 입력할 때마다 0.6초 뒤 자동 저장
  const update = (patch: Partial<DailyEntry>) => {
    const prev = entryRef.current;
    if (!prev) return;
    const next = { ...prev, ...patch, updatedAt: new Date().toISOString() };
    entryRef.current = next;
    setEntry(next);
    pending.current = next;
    setStatus('saving');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void flush(), 600);
  };

  const setList = (key: ListKey) => (items: ListItem[]) => {
    const prev = entryRef.current;
    if (prev) update({ lists: { ...prev.lists, [key]: items } });
  };

  const isToday = date === todayKey();

  return (
    <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
      <View style={s.header}>
        <View style={{ flex: 1, gap: 2 }}>
          <T size={13} weight="medium" color={isToday ? colors.accent : colors.muted}>
            {isToday ? '오늘' : date.slice(0, 4) + '년'}
          </T>
          <T size={26} weight="bold" style={{ letterSpacing: -0.5 }}>
            {formatKoreanDateLong(date)}
          </T>
          <T size={12} color={colors.muted}>
            {status === 'saving' ? '저장 중…' : status === 'saved' ? '저장됨' : '적는 대로 자동 저장돼요'}
          </T>
        </View>
        <View style={s.nav}>
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
        <T color={colors.muted} style={{ textAlign: 'center', marginTop: 40 }}>
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

          <Card>
            <SectionTitle title="식사" icon="coffee" />
            <View style={s.mealGrid}>
              {(
                [
                  ['breakfast', '아침'],
                  ['lunch', '점심'],
                  ['dinner', '저녁'],
                  ['snack', '간식'],
                ] as const
              ).map(([key, label]) => (
                <View key={key} style={s.mealCell}>
                  <T size={12} weight="medium" color={colors.muted}>
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

          <ExpenseCard entry={entry} update={update} />
        </>
      )}
    </ScrollView>
  );
}

function ExpenseCard({ entry, update }: { entry: DailyEntry; update: (p: Partial<DailyEntry>) => void }) {
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

  const total = totalExpense(entry);

  return (
    <Card>
      <SectionTitle
        title="지출"
        icon="credit-card"
        right={
          <T weight="bold" size={16}>
            {formatWon(total)}
          </T>
        }
      />
      {entry.expenses.length > 0 ? (
        <View>
          {entry.expenses.map((x) => (
            <View key={x.id} style={s.expenseRow}>
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
                <Feather name="x" size={15} color={colors.muted} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
      <View style={s.addRow}>
        <TextInput
          style={[inputText, s.addInput, { flex: 1.5 }]}
          placeholder="어디에 썼나요?"
          placeholderTextColor={colors.muted}
          value={item}
          onChangeText={setItem}
          returnKeyType="next"
          onSubmitEditing={() => amountRef.current?.focus()}
        />
        <View style={s.divider} />
        <TextInput
          ref={amountRef}
          style={[inputText, s.addInput, { flex: 1, textAlign: 'right' }]}
          placeholder="금액"
          placeholderTextColor={colors.muted}
          keyboardType="number-pad"
          value={amount}
          onChangeText={setAmount}
          onSubmitEditing={add}
        />
        <Pressable
          accessibilityLabel="지출 추가"
          onPress={add}
          style={[s.addBtn, !(item.trim() && amount.trim()) && { opacity: 0.3 }]}
        >
          <Feather name="plus" size={16} color="#fff" />
        </Pressable>
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
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
    borderBottomColor: colors.line,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.fill,
    borderRadius: radius.sm,
    paddingLeft: 14,
    paddingRight: 6,
    minHeight: 46,
    gap: 8,
  },
  addInput: { minWidth: 0, paddingVertical: 10 },
  divider: { width: 1, height: 18, backgroundColor: colors.line },
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
