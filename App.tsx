import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import EntryScreen from './src/screens/EntryScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { colors } from './src/theme';
import { todayKey } from './src/utils/date';

type Tab = 'entry' | 'history' | 'settings';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'entry', label: '오늘', icon: '✏️' },
  { key: 'history', label: '기록', icon: '📖' },
  { key: 'settings', label: '설정', icon: '⚙️' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('entry');
  const [date, setDate] = useState(todayKey());

  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.root} edges={['top', 'left', 'right']}>
        <StatusBar style="dark" />
        <View style={{ flex: 1 }}>
          {tab === 'entry' && <EntryScreen date={date} onChangeDate={setDate} />}
          {tab === 'history' && (
            <HistoryScreen
              onOpen={(d) => {
                setDate(d);
                setTab('entry');
              }}
            />
          )}
          {tab === 'settings' && <SettingsScreen />}
        </View>
        <SafeAreaView edges={['bottom']} style={s.tabBar}>
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <Pressable
                key={t.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                onPress={() => {
                  if (t.key === 'entry' && tab === 'entry') setDate(todayKey());
                  setTab(t.key);
                }}
                style={s.tab}
              >
                <Text style={[s.tabIcon, !active && { opacity: 0.45 }]}>{t.icon}</Text>
                <Text style={[s.tabLabel, active && s.tabLabelOn]}>{t.label}</Text>
              </Pressable>
            );
          })}
        </SafeAreaView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 8, gap: 2 },
  tabIcon: { fontSize: 20 },
  tabLabel: { fontSize: 12, color: colors.subtext },
  tabLabelOn: { color: colors.accent, fontWeight: '700' },
});
