import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { listEntries } from '../storage/entries';
import { colors, radius, space } from '../theme';
import { DailyEntry, totalExpense } from '../types';
import { formatKoreanDate, formatWon, todayKey } from '../utils/date';

const MOOD_FACES = ['😞', '😕', '😐', '🙂', '😄'];

export default function HistoryScreen({ onOpen }: { onOpen: (date: string) => void }) {
  const [entries, setEntries] = useState<DailyEntry[] | null>(null);

  const load = useCallback(() => {
    listEntries().then(setEntries);
  }, []);
  useEffect(load, [load]);

  if (!entries) return <Text style={s.empty}>불러오는 중…</Text>;

  const monthTotal = (() => {
    const prefix = todayKey().slice(0, 7);
    return entries.filter((e) => e.date.startsWith(prefix)).reduce((sum, e) => sum + totalExpense(e), 0);
  })();

  return (
    <FlatList
      data={entries}
      keyExtractor={(e) => e.date}
      contentContainerStyle={s.list}
      ListHeaderComponent={
        <View style={s.summary}>
          <Text style={s.summaryText}>지금까지 {entries.length}일 기록했어요</Text>
          <Text style={s.summarySub}>이번 달 지출 {formatWon(monthTotal)}</Text>
        </View>
      }
      ListEmptyComponent={<Text style={s.empty}>아직 기록이 없어요. '오늘' 탭에서 첫 기록을 남겨 보세요.</Text>}
      renderItem={({ item }) => {
        const preview = item.diary.trim() || item.gratitude.trim() || item.wentWell.trim();
        const spent = totalExpense(item);
        return (
          <Pressable
            accessibilityRole="button"
            onPress={() => onOpen(item.date)}
            style={({ pressed }) => [s.item, pressed && { opacity: 0.7 }]}
          >
            <View style={s.itemTop}>
              <Text style={s.itemDate}>{formatKoreanDate(item.date)}</Text>
              <Text style={s.itemMood}>{item.mood ? MOOD_FACES[item.mood - 1] : ''}</Text>
            </View>
            {preview ? (
              <Text style={s.preview} numberOfLines={2}>
                {preview}
              </Text>
            ) : null}
            {spent > 0 ? <Text style={s.spent}>지출 {formatWon(spent)}</Text> : null}
          </Pressable>
        );
      }}
    />
  );
}

const s = StyleSheet.create({
  list: { padding: space, gap: 10, maxWidth: 640, width: '100%', alignSelf: 'center' },
  summary: { paddingVertical: 8, marginBottom: 4 },
  summaryText: { fontSize: 18, fontWeight: '700', color: colors.text },
  summarySub: { fontSize: 14, color: colors.subtext, marginTop: 2 },
  empty: { textAlign: 'center', color: colors.subtext, marginTop: 40, paddingHorizontal: 24, lineHeight: 22 },
  item: {
    backgroundColor: colors.card,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 6,
  },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemDate: { fontSize: 16, fontWeight: '700', color: colors.text },
  itemMood: { fontSize: 20 },
  preview: { fontSize: 14, color: colors.subtext, lineHeight: 20 },
  spent: { fontSize: 13, color: colors.accent, fontWeight: '600' },
});
