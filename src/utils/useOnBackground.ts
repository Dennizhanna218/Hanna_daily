// 앱이 화면에서 사라질 때(홈으로 나가기, 다른 앱으로 전환, 창 닫기) 실행할 일을 등록합니다.
// AppState는 웹(브라우저 탭 숨김)과 네이티브 앱 모두에서 동작해요.
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

export function useOnBackground(callback: () => void): void {
  const ref = useRef(callback);
  ref.current = callback;
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') ref.current();
    });
    return () => sub.remove();
  }, []);
}
