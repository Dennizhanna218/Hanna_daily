# Hanna Daily

매일 퇴근길에 하루를 기록하는 앱이에요.

- **기록 항목:** 기분·에너지, 자유 일기, 감사·회고(감사한 일 / 잘한 점 / 아쉬운 점 / 내일 할 일), 식사, 지출
- **저장:** 기록은 휴대폰(브라우저) 안에만 저장돼요. 서버로 보내지 않아요.
- **백업:** 설정 탭에서 백업 파일로 저장하고, 다시 불러올 수 있어요.

## 휴대폰에서 쓰는 법

1. 휴대폰 브라우저로 앱 주소(https://dennizhanna218.github.io/Hanna_daily/)를 열어요.
2. 홈 화면에 추가해요.
   - **아이폰(Safari):** 아래쪽 공유 버튼 → '홈 화면에 추가'
   - **안드로이드(Chrome):** 오른쪽 위 ⋮ 메뉴 → '홈 화면에 추가' 또는 '앱 설치'
3. 홈 화면의 아이콘을 누르면 앱처럼 열려요.

> 기록은 기기에만 있어서 브라우저 데이터를 지우면 사라질 수 있어요. 가끔 설정 탭에서 백업해 두세요.

## 구조 (개발 참고)

[Expo](https://expo.dev)(React Native)로 만들었어요. 지금은 웹앱으로 배포하지만, 같은 코드로 iOS·Android 앱을 만들 수 있어요.

```
App.tsx                      앱 뼈대와 아래쪽 탭(오늘 / 기록 / 설정)
src/types.ts                 하루 기록 데이터 구조
src/storage/entries.ts       저장·불러오기·백업 (저장 방식을 바꿀 땐 이 파일만 수정)
src/storage/backupFile*.ts   백업 파일 저장/선택 (.web.ts = 웹, .ts = 네이티브 앱)
src/screens/                 화면들
src/components/ui.tsx        공통 UI 부품
public/                      웹 전용 파일 (홈 화면 아이콘, manifest)
```

### 명령어

```bash
npm install          # 처음 한 번
npm run web          # 내 컴퓨터에서 웹으로 실행
npm start            # Expo Go 앱으로 휴대폰에서 실행 (QR 코드)
npm run typecheck    # 타입 검사
npm run build:web    # 웹 배포용 빌드 (dist/)
```

### 배포

`main` 브랜치에 변경이 올라가면 GitHub Actions(`.github/workflows/deploy-web.yml`)가 자동으로 빌드해서 GitHub Pages에 올려요.
처음 한 번은 저장소 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 바꿔야 해요.

### 나중에 네이티브 앱으로 전환할 때

1. `npx eas-cli@latest build`로 iOS·Android 앱을 만들어요. (`app.json`에 앱 ID `com.hanna.daily`가 들어 있어요. 스토어에 올리기 전에 원하는 ID로 바꾸세요.)
2. `src/storage/backupFile.ts`에 `expo-file-system`/`expo-document-picker`로 실제 파일 저장·선택을 넣어요.
3. 웹앱에서 백업한 파일을 앱에서 불러오면 기록이 그대로 옮겨져요.
4. 알림이 필요해지면 `expo-notifications`를 추가해요.
