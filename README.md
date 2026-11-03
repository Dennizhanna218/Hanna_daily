# Hanna Daily

매일 퇴근길에 하루를 기록하는 앱이에요.

- **기록 항목:** 기분·에너지, ✨ 기분 좋은 순간(적은 시간도 함께 저장), 자유 일기, 돌아보기(감사한 일 / 하고 싶은 것 / 후회되는 것 / 개선하고 싶은 것 / 내일 할 일), 식사, 지출
- **운동:** 종류(직접 추가 가능)·시간·메모를 기록하고, 이번 달 운동한 날을 보여 줘요.
- **생리:** 생리 여부·양·증상(PMS 포함, 36가지)·메모를 기록하면 최근 시작일·평균 주기·다음 예정일을 계산해 줘요.
- **꾸미기:** 설정 탭에서 색감 13가지(파스텔·원색), 글씨체 6가지, '오늘' 화면에 보일 항목을 고를 수 있어요.
- **한 줄 기록:** 순간과 돌아보기 항목은 한 줄 적고 엔터를 누르면 바로 추가돼요. 엔터를 안 눌러도 다른 곳을 누르거나 앱을 닫으면 자동으로 추가돼요.
- **하고 싶은 것 모아보기:** 기록 탭의 '하고 싶은 것'에서 지금까지 적은 것을 한눈에 보고, 해낸 것은 체크할 수 있어요.
- **글꼴:** [Pretendard](https://github.com/orioncactus/pretendard), 고운돋움·고운바탕·주아·개구·나눔손글씨 펜 (모두 SIL OFL 1.1). 웹에서 Pretendard 외 글씨체를 고르면 Google Fonts에서 글꼴 파일을 받아 와요(기록 내용은 보내지 않아요).
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
src/lists.ts                 한 줄 목록(좋은 순간·돌아보기)의 이름·색
src/health.ts                운동 종류, 생리 증상 목록, 생리 주기 계산
src/settings/                색감 테마(themes.ts), 글씨체(fontOptions.ts), 설정 공유(SettingsContext)
src/storage/settings.ts      설정 저장
src/platform/chrome*.ts      테마에 맞춘 브라우저 배경색 (.web.ts = 웹)
src/fonts*.ts                글꼴 설정 (.web.ts = 웹, .ts = 네이티브 앱)
src/storage/entries.ts       저장·불러오기·백업 (저장 방식을 바꿀 땐 이 파일만 수정)
src/storage/backupFile*.ts   백업 파일 저장/선택 (.web.ts = 웹, .ts = 네이티브 앱)
src/screens/                 화면들
src/components/ui.tsx        공통 UI 부품
public/                      웹 전용 파일 (홈 화면 아이콘, manifest, 웹 글꼴)
assets/fonts/                네이티브 앱용 글꼴 파일
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
