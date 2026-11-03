// 색과 관계없는 공통 디자인 값. 색은 src/settings/themes.ts 에 있어요.
import { Platform, ViewStyle } from 'react-native';
import { ThemeColors } from './settings/themes';

export const radius = { sm: 10, md: 14, lg: 20 };
export const space = 16;

/** 카드에 쓰는 아주 옅은 그림자 (어두운 테마에서는 그림자 없이) */
export function shadow(c: ThemeColors): ViewStyle {
  if (c.dark) return {};
  return Platform.select<ViewStyle>({
    web: { boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.045)' } as ViewStyle,
    default: {
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 1,
    },
  });
}
