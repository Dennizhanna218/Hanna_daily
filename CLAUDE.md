# CLAUDE.md

## 언어 설정

- 사용자와의 모든 대화는 한국어로 진행합니다.
- 사용자는 비개발자입니다. 설명은 쉽고 친절하게, 전문 용어는 풀어서 해 주세요.

## 프로젝트

매일 퇴근길 일상 기록 앱. Expo(React Native) + TypeScript로 만들고, 지금은 웹앱(PWA)으로 GitHub Pages에 배포합니다.
나중에 네이티브 앱으로 전환할 예정이라 아래 원칙을 지킵니다.

- 화면은 React Native 컴포넌트만 씁니다. DOM/브라우저 API가 꼭 필요하면 `*.web.ts`와 `*.ts`(네이티브)로 나눕니다.
- 저장은 `src/storage/entries.ts`를 통해서만 합니다. 데이터 형식을 바꾸면 `normalize()`로 예전 데이터와 호환되게 하고, 백업 형식(`BACKUP_VERSION`)도 함께 관리합니다.
- 기록은 기기에만 저장합니다(서버 없음).
- 색은 직접 쓰지 말고 `useSettings().c`(테마 색)를, 글자는 `<T>` 컴포넌트를 씁니다. 그래야 색감·글씨체 설정이 적용됩니다. 기본 색감은 피치예요.
- 패키지는 `npx expo install`로 추가합니다. 이 클라우드 환경에서는 Expo API가 막혀 있어서 `EXPO_OFFLINE=1`을 붙여야 합니다.
- 작업을 마치기 전에 `npm run typecheck`와 `npm run build:web`을 실행합니다.

자세한 구조는 `README.md`, Expo 일반 규칙은 `AGENTS.md`, 다음에 만들 기능은 `docs/ROADMAP.md`를 참고하세요.
