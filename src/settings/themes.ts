// 색감 테마. 새 테마를 추가하려면 THEMES 목록에 하나 더 넣으면 됩니다.

export interface ThemeColors {
  bg: string; // 화면 배경
  surface: string; // 카드 배경
  ink: string; // 기본 글자
  ink2: string; // 보조 글자
  muted: string; // 흐린 글자·아이콘
  line: string; // 구분선
  fill: string; // 입력칸·버튼 배경
  accent: string; // 강조색
  accentSoft: string; // 연한 강조색 (선택된 항목 배경)
  onAccent: string; // 강조색 위 글자
  danger: string;
  dark: boolean; // 어두운 테마 여부
}

export interface Theme {
  id: string;
  name: string;
  group: 'soft' | 'vivid';
  colors: ThemeColors;
}

const light = { surface: '#FFFFFF', danger: '#D14B3B', dark: false };

export const THEMES: Theme[] = [
  // 파스텔·차분
  {
    id: 'peach',
    name: '피치',
    group: 'soft',
    colors: { ...light, bg: '#FFF4EE', ink: '#2A1F1C', ink2: '#6B5852', muted: '#B39A90', line: '#F6E4DB', fill: '#FFEDE4', accent: '#FF7A59', accentSoft: '#FFE1D6', onAccent: '#FFFFFF' },
  },
  {
    id: 'sand',
    name: '샌드',
    group: 'soft',
    colors: { ...light, bg: '#F6F5F2', ink: '#1D1C1A', ink2: '#57534E', muted: '#A29D96', line: '#ECE9E4', fill: '#F3F1ED', accent: '#E8684A', accentSoft: '#FCEDE8', onAccent: '#FFFFFF' },
  },
  {
    id: 'lavender',
    name: '라벤더',
    group: 'soft',
    colors: { ...light, bg: '#F5F3FF', ink: '#1F1B33', ink2: '#58527A', muted: '#A29CC0', line: '#E6E2FA', fill: '#EFECFE', accent: '#7C5CFF', accentSoft: '#E7E1FF', onAccent: '#FFFFFF' },
  },
  {
    id: 'mint',
    name: '민트',
    group: 'soft',
    colors: { ...light, bg: '#F0FAF6', ink: '#14261F', ink2: '#4A6359', muted: '#8EAFA2', line: '#DCEFE6', fill: '#E5F5EE', accent: '#12B886', accentSoft: '#D3F2E6', onAccent: '#FFFFFF' },
  },
  {
    id: 'sunshine',
    name: '선샤인',
    group: 'soft',
    colors: { ...light, bg: '#FFFAEB', ink: '#2B2410', ink2: '#6B5F3D', muted: '#B5A57A', line: '#F7EBC4', fill: '#FFF3CC', accent: '#F59F00', accentSoft: '#FFEBB0', onAccent: '#2B2410' },
  },
  {
    id: 'night',
    name: '나이트',
    group: 'soft',
    colors: { bg: '#141416', surface: '#1F1F23', ink: '#F2F1EF', ink2: '#C4C2C8', muted: '#7F7D86', line: '#2E2E34', fill: '#2A2A30', accent: '#FF8A65', accentSoft: '#3A2A25', onAccent: '#141416', danger: '#FF6B5B', dark: true },
  },
  // 원색
  {
    id: 'red',
    name: '레드',
    group: 'vivid',
    colors: { ...light, bg: '#FFF5F5', ink: '#2A1414', ink2: '#6E4646', muted: '#B89292', line: '#FBE1E1', fill: '#FFECEC', accent: '#E5262B', accentSoft: '#FFD9D9', onAccent: '#FFFFFF' },
  },
  {
    id: 'pink',
    name: '핑크',
    group: 'vivid',
    colors: { ...light, bg: '#FFF3F8', ink: '#2B1420', ink2: '#6E4659', muted: '#B98FA3', line: '#FBDDEA', fill: '#FFE4EF', accent: '#FF2D87', accentSoft: '#FFCCE1', onAccent: '#FFFFFF' },
  },
  {
    id: 'orange',
    name: '오렌지',
    group: 'vivid',
    colors: { ...light, bg: '#FFF7F0', ink: '#2B1C10', ink2: '#6E5440', muted: '#B89C84', line: '#FBE6D3', fill: '#FFEEDF', accent: '#FF6A00', accentSoft: '#FFDFC4', onAccent: '#FFFFFF' },
  },
  {
    id: 'yellow',
    name: '옐로',
    group: 'vivid',
    colors: { ...light, bg: '#FFFCEB', ink: '#262108', ink2: '#625A2E', muted: '#ADA172', line: '#F8EDB8', fill: '#FFF5C7', accent: '#FFC700', accentSoft: '#FFEB99', onAccent: '#262108' },
  },
  {
    id: 'green',
    name: '그린',
    group: 'vivid',
    colors: { ...light, bg: '#F2FBF5', ink: '#0F2416', ink2: '#3F5E49', muted: '#88AA92', line: '#D7EFDF', fill: '#E2F5E8', accent: '#00A33E', accentSoft: '#C8EDD4', onAccent: '#FFFFFF' },
  },
  {
    id: 'blue',
    name: '블루',
    group: 'vivid',
    colors: { ...light, bg: '#F3F7FF', ink: '#0F1A33', ink2: '#45526E', muted: '#8E9BBA', line: '#DCE6FB', fill: '#E5EDFF', accent: '#0057FF', accentSoft: '#CCDCFF', onAccent: '#FFFFFF' },
  },
  {
    id: 'purple',
    name: '퍼플',
    group: 'vivid',
    colors: { ...light, bg: '#F8F3FF', ink: '#1D1033', ink2: '#57466E', muted: '#A08FBA', line: '#E9DEFB', fill: '#EEE5FF', accent: '#7B2FF7', accentSoft: '#DDCCFF', onAccent: '#FFFFFF' },
  },
];

export const DEFAULT_THEME_ID = 'peach';

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES.find((t) => t.id === DEFAULT_THEME_ID)!;
}
