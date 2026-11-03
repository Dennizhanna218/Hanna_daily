import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { IconName, T } from './src/components/ui';
import EntryScreen from './src/screens/EntryScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { SettingsProvider, useSettings } from './src/settings/SettingsContext';
import { todayKey } from './src/utils/date';

type Tab = 'entry' | 'history' | 'settings';

const TABS: { key: Tab; label: string; icon: IconName }[] = [
  { key: 'entry', label: '오늘', icon: 'edit-3' },
  { key: 'history', label: '기록', icon: 'book-open' },
  { key: 'settings', label: '설정', icon: 'settings' },
];

export default function App() {
  return (
    <SafeAreaProvider>
      <SettingsProvider fallback={<View style={{ flex: 1 }} />}>
        <Main />
      </SettingsProvider>
    </SafeAreaProvider>
  );
}

function Main() {
  const { c } = useSettings();
  const [tab, setTab] = useState<Tab>('entry');
  const [date, setDate] = useState(todayKey());

  return (
    <SafeAreaView style={[s.root, { backgroundColor: c.bg }]} edges={['top', 'left', 'right']}>
      <StatusBar style={c.dark ? 'light' : 'dark'} />
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
      <SafeAreaView
        edges={['bottom']}
        style={[s.tabBar, { backgroundColor: c.surface, borderTopColor: c.line }]}
      >
        {TABS.map((t) => {
          const active = tab === t.key;
          const color = active ? c.accent : c.muted;
          return (
            <Pressable
              key={t.key}
              accessibilityRole="tab"
              accessibilityLabel={t.label}
              accessibilityState={{ selected: active }}
              onPress={() => {
                // '오늘' 탭을 한 번 더 누르면 오늘 날짜로 돌아옵니다.
                if (t.key === 'entry' && tab === 'entry') setDate(todayKey());
                setTab(t.key);
              }}
              style={s.tab}
            >
              <Feather name={t.icon} size={21} color={color} />
              <T size={11} weight={active ? 'semibold' : 'medium'} color={color}>
                {t.label}
              </T>
            </Pressable>
          );
        })}
      </SafeAreaView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  tabBar: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth },
  tab: { flex: 1, alignItems: 'center', paddingTop: 10, paddingBottom: 8, gap: 3 },
});
