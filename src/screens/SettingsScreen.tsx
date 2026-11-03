import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Field, SectionTitle, T, Toggle } from '../components/ui';
import { fontStyles, usePreviewFonts } from '../fonts';
import { FONT_OPTIONS } from '../settings/fontOptions';
import { useSettings, useStyles } from '../settings/SettingsContext';
import { Theme, ThemeColors, THEMES } from '../settings/themes';
import { createBackup, restoreBackup } from '../storage/entries';
import { canPickFile, pickBackupFile, saveBackupFile } from '../storage/backupFile';
import { SECTION_KEYS, SECTION_LABELS } from '../storage/settings';
import { radius, space } from '../theme';
import { todayKey } from '../utils/date';

export default function SettingsScreen() {
  usePreviewFonts();
  const { c, settings, updateSettings } = useSettings();
  const st = useStyles(makeStyles);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [pasted, setPasted] = useState('');

  const exportBackup = async () => {
    try {
      const backup = await createBackup(settings);
      await saveBackupFile(`hanna-daily-${todayKey()}.json`, JSON.stringify(backup, null, 2));
      setMessage({ text: `${backup.entries.length}일치 기록을 백업했어요.` });
    } catch {
      setMessage({ text: '백업하지 못했어요. 다시 시도해 주세요.', error: true });
    }
  };

  const importText = async (text: string) => {
    try {
      const { count, settings: restored } = await restoreBackup(text);
      if (restored) updateSettings(restored);
      setMessage({ text: `${count}일치 기록을 불러왔어요.` });
      setPasted('');
    } catch (e) {
      setMessage({ text: e instanceof Error ? e.message : '불러오지 못했어요.', error: true });
    }
  };

  const importFile = async () => {
    const text = await pickBackupFile();
    if (text) await importText(text);
  };

  return (
    <ScrollView contentContainerStyle={st.body}>
      <T size={26} weight="bold" style={{ paddingHorizontal: 4, paddingTop: 12, letterSpacing: -0.5 }}>
        설정
      </T>

      <Card>
        <SectionTitle title="색감" icon="droplet" color={c.accent} />
        <ThemeGroup title="파스텔 · 차분" themes={THEMES.filter((t) => t.group === 'soft')} />
        <ThemeGroup title="원색" themes={THEMES.filter((t) => t.group === 'vivid')} />
      </Card>

      <Card style={{ gap: 10 }}>
        <SectionTitle title="글씨체" icon="type" />
        {FONT_OPTIONS.map((o) => {
          const selected = settings.fontId === o.id;
          const f = fontStyles(o.id);
          return (
            <Pressable
              key={o.id}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`글씨체 ${o.name}`}
              onPress={() => updateSettings({ fontId: o.id })}
              style={[st.fontRow, selected && st.fontRowOn]}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[f.bold, { fontSize: Math.round(17 * o.scale), color: c.ink }]}>{o.name}</Text>
                <Text style={[f.regular, { fontSize: Math.round(14 * o.scale), color: c.ink2 }]}>
                  오늘 하루도 수고했어요 · {o.desc}
                </Text>
              </View>
              {selected ? <Feather name="check-circle" size={20} color={c.accent} /> : null}
            </Pressable>
          );
        })}
      </Card>

      <Card style={{ gap: 4 }}>
        <SectionTitle title="'오늘' 화면에 보일 항목" icon="list" />
        <T size={13} color={c.muted} style={{ marginBottom: 6 }}>
          끈 항목은 화면에서만 숨겨지고, 적어 둔 기록은 그대로 남아 있어요.
        </T>
        {SECTION_KEYS.map((k) => (
          <View key={k} style={st.toggleRow}>
            <T size={15} style={{ flex: 1 }}>
              {SECTION_LABELS[k]}
            </T>
            <Toggle
              label={SECTION_LABELS[k]}
              value={settings.sections[k]}
              onChange={(v) => updateSettings({ sections: { ...settings.sections, [k]: v } })}
            />
          </View>
        ))}
      </Card>

      {settings.customWorkoutTypes.length > 0 ? (
        <Card style={{ gap: 10 }}>
          <SectionTitle title="직접 추가한 운동" icon="zap" />
          <View style={st.wrap}>
            {settings.customWorkoutTypes.map((t) => (
              <Pressable
                key={t}
                accessibilityLabel={`${t} 삭제`}
                onPress={() =>
                  updateSettings({ customWorkoutTypes: settings.customWorkoutTypes.filter((x) => x !== t) })
                }
                style={st.removable}
              >
                <T size={14}>{t}</T>
                <Feather name="x" size={13} color={c.muted} />
              </Pressable>
            ))}
          </View>
        </Card>
      ) : null}

      <Card>
        <SectionTitle title="백업" icon="download" />
        <T size={14} color={c.ink2} style={{ marginTop: -6 }}>
          {Platform.OS === 'web'
            ? '기록은 이 기기(브라우저)에만 저장돼요. 브라우저 데이터를 지우거나 기기를 바꾸면 사라질 수 있으니 가끔 백업해 두세요. 설정도 함께 백업돼요.'
            : '기록은 이 기기에만 저장돼요. 앱을 지우거나 기기를 바꾸기 전에 백업해 두세요. 설정도 함께 백업돼요.'}
        </T>
        <View style={{ gap: 8 }}>
          <Button title="백업 파일 저장하기" icon="download" onPress={exportBackup} />
          {canPickFile ? (
            <Button title="백업 파일 불러오기" icon="upload" kind="secondary" onPress={importFile} />
          ) : null}
        </View>
        {message ? (
          <T size={14} weight="semibold" color={message.error ? c.danger : c.accent}>
            {message.text}
          </T>
        ) : null}
      </Card>

      {!canPickFile ? (
        <Card>
          <SectionTitle title="백업 내용 붙여넣기" icon="clipboard" />
          <Field multiline value={pasted} onChangeText={setPasted} placeholder='{"format":"hanna-daily-backup", …}' />
          <Button title="불러오기" kind="secondary" onPress={() => importText(pasted)} />
        </Card>
      ) : null}

      <Card>
        <SectionTitle title="앱 정보" icon="info" />
        <View style={{ gap: 4, marginTop: -6 }}>
          <T size={14} color={c.ink2}>
            Hanna Daily · 매일 퇴근길 일상 기록
          </T>
          {Platform.OS === 'web' ? (
            <T size={14} color={c.ink2}>
              휴대폰 브라우저 메뉴에서 '홈 화면에 추가'를 누르면 앱처럼 쓸 수 있어요.
            </T>
          ) : null}
        </View>
      </Card>
    </ScrollView>
  );
}

function ThemeGroup({ title, themes }: { title: string; themes: Theme[] }) {
  const { c, settings, updateSettings } = useSettings();
  const st = useStyles(makeStyles);
  return (
    <View style={{ gap: 8 }}>
      <T size={13} weight="medium" color={c.muted}>
        {title}
      </T>
      <View style={st.themeGrid}>
        {themes.map((t) => {
          const selected = settings.themeId === t.id;
          return (
            <Pressable
              key={t.id}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`색감 ${t.name}`}
              onPress={() => updateSettings({ themeId: t.id })}
              style={st.themeItem}
            >
              <View
                style={[
                  st.swatch,
                  { backgroundColor: t.colors.bg, borderColor: selected ? c.ink : c.line },
                  selected && { borderWidth: 2 },
                ]}
              >
                <View style={[st.swatchDot, { backgroundColor: t.colors.accent }]}>
                  {selected ? <Feather name="check" size={14} color={t.colors.onAccent} /> : null}
                </View>
              </View>
              <T size={12} weight={selected ? 'semibold' : 'regular'} color={selected ? c.ink : c.ink2}>
                {t.name}
              </T>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function makeStyles(c: ThemeColors) {
  return StyleSheet.create({
    body: { padding: space, paddingBottom: 48, gap: 14, maxWidth: 640, width: '100%', alignSelf: 'center' },
    themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
    themeItem: { width: 64, alignItems: 'center', gap: 6, paddingVertical: 4 },
    swatch: {
      width: 48,
      height: 48,
      borderRadius: 24,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    swatchDot: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
    fontRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      borderRadius: radius.md,
      backgroundColor: c.fill,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    fontRowOn: { borderColor: c.accent, backgroundColor: c.accentSoft },
    toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
    wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    removable: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: c.fill,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 7,
    },
  });
}
