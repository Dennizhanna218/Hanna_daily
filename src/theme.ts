import { Platform, ViewStyle } from 'react-native';

export const colors = {
  bg: '#F6F5F2',
  surface: '#FFFFFF',
  ink: '#1D1C1A',
  ink2: '#57534E',
  muted: '#A29D96',
  line: '#ECE9E4',
  fill: '#F3F1ED',
  accent: '#E8684A',
  accentSoft: '#FCEDE8',
  danger: '#D14B3B',
};

export const radius = { sm: 10, md: 14, lg: 20 };
export const space = 16;

/** 카드에 쓰는 아주 옅은 그림자 */
export const shadow: ViewStyle = Platform.select<ViewStyle>({
  web: { boxShadow: '0 1px 2px rgba(29,28,26,0.04), 0 4px 16px rgba(29,28,26,0.04)' } as ViewStyle,
  default: {
    shadowColor: '#1D1C1A',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
});
