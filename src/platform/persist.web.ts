// 웹: 브라우저에 "이 사이트 데이터는 함부로 지우지 말아 주세요"라고 요청합니다.
// (저장 공간이 부족할 때 브라우저가 기록을 자동으로 지우는 일을 줄여 줘요)
export function requestPersistentStorage(): void {
  try {
    void navigator.storage?.persist?.();
  } catch {
    // 지원하지 않는 브라우저는 그냥 넘어가요.
  }
}
