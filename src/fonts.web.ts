// 웹용 글꼴 설정. Pretendard는 public/index.html 에서 불러오는
// public/fonts/pretendard/pretendard.css 로 필요한 글자 조각만 내려받습니다.
// (네이티브 버전은 fonts.ts)

import { Feather } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { TextStyle } from 'react-native';

const family =
  'Pretendard, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif';

export const font: Record<'regular' | 'medium' | 'semibold' | 'bold', TextStyle> = {
  regular: { fontFamily: family, fontWeight: '400' },
  medium: { fontFamily: family, fontWeight: '500' },
  semibold: { fontFamily: family, fontWeight: '600' },
  bold: { fontFamily: family, fontWeight: '700' },
};

export function useAppFonts(): boolean {
  const [loaded, error] = useFonts(Feather.font);
  return loaded || !!error;
}
