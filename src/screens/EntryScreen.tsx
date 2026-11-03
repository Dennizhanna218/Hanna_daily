import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Card, Field, ScorePicker, styles as ui } from '../components/ui';
import { getEntry, saveEntry } from '../storage/entries';
import { colors, space } from '../theme';
import { DailyEntry, totalExpense } from '../types';
import { addDays, formatKoreanDate, formatWon, newId, todayKey } from '../utils/date';

const MOOD_FACES = ['😞', '😕', '😐', '🙂', '😄'];
const ENERGY_FACES = ['🪫', '😮‍💨', '🙂', '💪', '⚡'];

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

  const isToday = date === todayKey();

  return (
    <View style={{ flex: 1 }}>
      <View style={s.header}>
        <Pressable accessibilityLabel="이전 날" onPress={() => onChangeDate(addDays(date, -1))} style={s.arrow}>
          <Text style={s.arrowText}>‹</Text>
        </Pressable>
        <View style={{ alignItems: 'center' }}>
          <Text style={s.date}>{formatKoreanDate(date)}</Text>
          <Text style={s.status}>
            {isToday ? '오늘 · ' : ''}
            {status === 'saving' ? '저장 중…' : status === 'saved' ? '저장됨 ✓' : '자동 저장돼요'}
          </Text>
        </View>
        <Pressable
          accessibilityLabel="다음 날"
          disabled={isToday}
          onPress={() => onChangeDate(addDays(date, 1))}
          style={[s.arrow, isToday && { opacity: 0.25 }]}
        >
          <Text style={s.arrowText}>›</Text>
        </Pressable>
      </View>

      {!entry ? (
        <Text style={s.loading}>불러오는 중…</Text>
      ) : (
        <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
          <Card title="오늘의 컨디션">
            <ScorePicker label="기분" faces={MOOD_FACES} value={entry.mood} onChange={(mood) => update({ mood })} />
            <ScorePicker
              label="에너지"
              faces={ENERGY_FACES}
              value={entry.energy}
              onChange={(energy) => update({ energy })}
            />
          </Card>

          <Card title="오늘의 일기" hint="오늘 있었던 일을 자유롭게 적어 보세요.">
            <Field
              multiline
              placeholder="퇴근길에 떠오르는 오늘 하루…"
              value={entry.diary}
              onChangeText={(diary) => update({ diary })}
              style={{ minHeight: 140 }}
            />
          </Card>

          <Card title="감사 · 회고">
            <Field
              label="감사한 일"
              multiline
              placeholder="작은 것도 좋아요"
              value={entry.gratitude}
              onChangeText={(gratitude) => update({ gratitude })}
            />
            <Field
              label="잘한 점"
              multiline
              value={entry.wentWell}
              onChangeText={(wentWell) => update({ wentWell })}
            />
            <Field
              label="아쉬운 점"
              multiline
              value={entry.toImprove}
              onChangeText={(toImprove) => update({ toImprove })}
            />
            <Field
              label="내일 할 일"
              multiline
              value={entry.tomorrow}
              onChangeText={(tomorrow) => update({ tomorrow })}
            />
          </Card>

          <Card title="식사">
            {(
              [
                ['breakfast', '아침'],
                ['lunch', '점심'],
                ['dinner', '저녁'],
                ['snack', '간식'],
              ] as const
            ).map(([key, label]) => (
              <View key={key} style={s.mealRow}>
                <Text style={[ui.label, { width: 40 }]}>{label}</Text>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Field
                    placeholder="무엇을 먹었나요?"
                    value={entry.meals[key]}
                    onChangeText={(v) => update({ meals: { ...entry.meals, [key]: v } })}
                  />
                </View>
              </View>
            ))}
          </Card>

          <ExpenseCard entry={entry} update={update} />
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

function ExpenseCard({ entry, update }: { entry: DailyEntry; update: (p: Partial<DailyEntry>) => void }) {
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');

  const add = () => {
    const n = Number(amount.replace(/[^0-9]/g, ''));
    if (!item.trim() || !n) return;
    update({ expenses: [...entry.expenses, { id: newId(), item: item.trim(), amount: n }] });
    setItem('');
    setAmount('');
  };

  return (
    <Card title="지출" hint={`오늘 합계 ${formatWon(totalExpense(entry))}`}>
      {entry.expenses.map((x) => (
        <View key={x.id} style={s.expenseRow}>
          <Text style={s.expenseItem} numberOfLines={1}>
            {x.item}
          </Text>
          <Text style={s.expenseAmount}>{formatWon(x.amount)}</Text>
          <Pressable
            accessibilityLabel={`${x.item} 삭제`}
            onPress={() => update({ expenses: entry.expenses.filter((e) => e.id !== x.id) })}
            hitSlop={8}
          >
            <Text style={s.remove}>✕</Text>
          </Pressable>
        </View>
      ))}
      <View style={s.addRow}>
        <View style={{ flex: 1.4, minWidth: 0 }}>
          <TextInput
            style={[ui.input, { width: '100%' }]}
            placeholder="어디에 썼나요?"
            placeholderTextColor={colors.subtext}
            value={item}
            onChangeText={setItem}
            onSubmitEditing={add}
          />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <TextInput
            style={[ui.input, { width: '100%' }]}
            placeholder="금액"
            placeholderTextColor={colors.subtext}
            keyboardType="number-pad"
            value={amount}
            onChangeText={setAmount}
            onSubmitEditing={add}
          />
        </View>
      </View>
      <Button title="지출 추가" kind="secondary" onPress={add} />
    </Card>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bg,
  },
  arrow: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  arrowText: { fontSize: 32, color: colors.text, lineHeight: 36 },
  date: { fontSize: 18, fontWeight: '700', color: colors.text },
  status: { fontSize: 12, color: colors.subtext, marginTop: 2 },
  loading: { textAlign: 'center', marginTop: 40, color: colors.subtext },
  body: { padding: space, gap: space, maxWidth: 640, width: '100%', alignSelf: 'center' },
  mealRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  expenseItem: { flex: 1, fontSize: 15, color: colors.text },
  expenseAmount: { fontSize: 15, fontWeight: '600', color: colors.text },
  remove: { fontSize: 16, color: colors.subtext, paddingHorizontal: 4 },
  addRow: { flexDirection: 'row', gap: 8 },
});
