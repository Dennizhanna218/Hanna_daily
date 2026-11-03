// 네이티브 앱용 글꼴 설정 (웹 버전은 fonts.web.ts).
// 안드로이드는 굵기(fontWeight)만으로 글꼴 파일을 고르지 못해서
// 굵기마다 다른 글꼴 이름을 씁니다.

import { Feather } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { TextStyle } from 'react-native';

export const font: Record<'regular' | 'medium' | 'semibold' | 'bold', TextStyle> = {
  regular: { fontFamily: 'Pretendard-Regular' },
  medium: { fontFamily: 'Pretendard-Medium' },
  semibold: { fontFamily: 'Pretendard-SemiBold' },
  bold: { fontFamily: 'Pretendard-Bold' },
};

export function useAppFonts(): boolean {
  const [loaded, error] = useFonts({
    ...Feather.font,
    'Pretendard-Regular': require('../assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-Medium': require('../assets/fonts/Pretendard-Medium.otf'),
    'Pretendard-SemiBold': require('../assets/fonts/Pretendard-SemiBold.otf'),
    'Pretendard-Bold': require('../assets/fonts/Pretendard-Bold.otf'),
  });
  return loaded || !!error;
}
