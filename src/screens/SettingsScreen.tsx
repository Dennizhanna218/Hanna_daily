import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Field, SectionTitle, T } from '../components/ui';
import { createBackup, restoreBackup } from '../storage/entries';
import { canPickFile, pickBackupFile, saveBackupFile } from '../storage/backupFile';
import { colors, space } from '../theme';
import { todayKey } from '../utils/date';

export default function SettingsScreen() {
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [pasted, setPasted] = useState('');

  const exportBackup = async () => {
    try {
      const backup = await createBackup();
      await saveBackupFile(`hanna-daily-${todayKey()}.json`, JSON.stringify(backup, null, 2));
      setMessage({ text: `${backup.entries.length}일치 기록을 백업했어요.` });
    } catch {
      setMessage({ text: '백업하지 못했어요. 다시 시도해 주세요.', error: true });
    }
  };

  const importText = async (text: string) => {
    try {
      const n = await restoreBackup(text);
      setMessage({ text: `${n}일치 기록을 불러왔어요.` });
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
    <ScrollView contentContainerStyle={s.body}>
      <T size={26} weight="bold" style={{ paddingHorizontal: 4, paddingTop: 12, letterSpacing: -0.5 }}>
        설정
      </T>

      <Card>
        <SectionTitle title="백업" icon="download" />
        <T size={14} color={colors.ink2} style={{ marginTop: -6 }}>
          {Platform.OS === 'web'
            ? '기록은 이 기기(브라우저)에만 저장돼요. 브라우저 데이터를 지우거나 기기를 바꾸면 사라질 수 있으니 가끔 백업해 두세요.'
            : '기록은 이 기기에만 저장돼요. 앱을 지우거나 기기를 바꾸기 전에 백업해 두세요.'}
        </T>
        <View style={{ gap: 8 }}>
          <Button title="백업 파일 저장하기" icon="download" onPress={exportBackup} />
          {canPickFile ? (
            <Button title="백업 파일 불러오기" icon="upload" kind="secondary" onPress={importFile} />
          ) : null}
        </View>
        {message ? (
          <T size={14} weight="semibold" color={message.error ? colors.danger : colors.accent}>
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
          <T size={14} color={colors.ink2}>
            Hanna Daily · 매일 퇴근길 일상 기록
          </T>
          {Platform.OS === 'web' ? (
            <T size={14} color={colors.ink2}>
              휴대폰 브라우저 메뉴에서 '홈 화면에 추가'를 누르면 앱처럼 쓸 수 있어요.
            </T>
          ) : null}
        </View>
      </Card>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  body: { padding: space, paddingBottom: 48, gap: 14, maxWidth: 640, width: '100%', alignSelf: 'center' },
});
