// 웹용 글꼴 설정 (네이티브 버전은 fonts.ts).
// Pretendard는 public/index.html 에서 불러오고(필요한 글자 조각만),
// 다른 글씨체는 고를 때 Google Fonts에서 불러옵니다.

import { Feather } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { TextStyle } from 'react-native';
import { FONT_OPTIONS, getFontOption } from './settings/fontOptions';

export type Weight = 'regular' | 'medium' | 'semibold' | 'bold';

const FALLBACK = 'Pretendard, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif';

function ensureCss(href: string | undefined) {
  if (!href || typeof document === 'undefined') return;
  if (document.querySelector(`link[data-font="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.dataset.font = href;
  document.head.appendChild(link);
}

export function fontStyles(id: string): Record<Weight, TextStyle> {
  const o = getFontOption(id);
  const family = o.id === 'pretendard' ? FALLBACK : `"${o.webFamily}", ${FALLBACK}`;
  return {
    regular: { fontFamily: family, fontWeight: '400' },
    medium: { fontFamily: family, fontWeight: '500' },
    semibold: { fontFamily: family, fontWeight: '600' },
    bold: { fontFamily: family, fontWeight: '700' },
  };
}

/** 고른 글씨체(와 아이콘 글꼴)가 준비되면 true. 웹에서는 글꼴이 늦게 와도 바로 보여 줍니다. */
export function useFontLoader(id: string): boolean {
  const [iconsLoaded, error] = useFonts(Feather.font);
  useEffect(() => {
    ensureCss(getFontOption(id).webCss);
  }, [id]);
  return iconsLoaded || !!error;
}

/** 설정 화면에서 모든 글씨체를 미리 보여 주기 위해 불러옵니다. */
export function usePreviewFonts(): void {
  useEffect(() => {
    FONT_OPTIONS.forEach((o) => ensureCss(o.webCss));
  }, []);
}
