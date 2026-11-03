// 네이티브 앱용: 지금은 공유 시트로 백업 내용을 내보냅니다.
// 네이티브 앱으로 전환할 때 expo-file-system / expo-document-picker 로
// 실제 파일 저장·선택을 넣으면 됩니다. (웹 버전은 backupFile.web.ts)

import { Share } from 'react-native';

export const canPickFile = false;

export async function saveBackupFile(fileName: string, text: string): Promise<void> {
  await Share.share({ title: fileName, message: text });
}

export async function pickBackupFile(): Promise<string | null> {
  return null;
}
