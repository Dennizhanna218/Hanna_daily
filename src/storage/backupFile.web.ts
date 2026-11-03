// 웹 전용: 백업 파일을 내려받고, 파일을 골라 불러옵니다.
// 같은 이름의 backupFile.ts(네이티브용)와 짝을 이룹니다.
// Expo는 웹에서는 .web.ts 파일을, 앱에서는 .ts 파일을 자동으로 고릅니다.

export const canPickFile = true;

export async function saveBackupFile(fileName: string, text: string): Promise<void> {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function pickBackupFile(): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      file.text().then(resolve, () => resolve(null));
    };
    input.click();
  });
}
