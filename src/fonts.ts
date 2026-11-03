// 네이티브 앱용 글꼴 설정 (웹 버전은 fonts.web.ts).
// 안드로이드는 굵기(fontWeight)만으로 글꼴 파일을 고르지 못해서
// 굵기마다 다른 글꼴 이름을 씁니다.

import { Feather } from '@expo/vector-icons';
import * as Font from 'expo-font';
import { useEffect, useState } from 'react';
import { TextStyle } from 'react-native';
import { DEFAULT_FONT_ID, FONT_OPTIONS } from './settings/fontOptions';

export type Weight = 'regular' | 'medium' | 'semibold' | 'bold';

// 글꼴별 [보통, 굵게] 파일. 굵은 파일이 없는 글꼴은 같은 파일을 씁니다.
const FILES: Record<string, { regular: [string, number]; bold: [string, number]; medium?: [string, number]; semibold?: [string, number] }> = {
  pretendard: {
    regular: ['Pretendard-Regular', require('../assets/fonts/Pretendard-Regular.otf')],
    medium: ['Pretendard-Medium', require('../assets/fonts/Pretendard-Medium.otf')],
    semibold: ['Pretendard-SemiBold', require('../assets/fonts/Pretendard-SemiBold.otf')],
    bold: ['Pretendard-Bold', require('../assets/fonts/Pretendard-Bold.otf')],
  },
  gowunDodum: {
    regular: ['GowunDodum', require('@expo-google-fonts/gowun-dodum/400Regular/GowunDodum_400Regular.ttf')],
    bold: ['GowunDodum', require('@expo-google-fonts/gowun-dodum/400Regular/GowunDodum_400Regular.ttf')],
  },
  gowunBatang: {
    regular: ['GowunBatang', require('@expo-google-fonts/gowun-batang/400Regular/GowunBatang_400Regular.ttf')],
    bold: ['GowunBatang-Bold', require('@expo-google-fonts/gowun-batang/700Bold/GowunBatang_700Bold.ttf')],
  },
  jua: {
    regular: ['Jua', require('@expo-google-fonts/jua/400Regular/Jua_400Regular.ttf')],
    bold: ['Jua', require('@expo-google-fonts/jua/400Regular/Jua_400Regular.ttf')],
  },
  gaegu: {
    regular: ['Gaegu', require('@expo-google-fonts/gaegu/400Regular/Gaegu_400Regular.ttf')],
    bold: ['Gaegu-Bold', require('@expo-google-fonts/gaegu/700Bold/Gaegu_700Bold.ttf')],
  },
  nanumPen: {
    regular: ['NanumPenScript', require('@expo-google-fonts/nanum-pen-script/400Regular/NanumPenScript_400Regular.ttf')],
    bold: ['NanumPenScript', require('@expo-google-fonts/nanum-pen-script/400Regular/NanumPenScript_400Regular.ttf')],
  },
};

function filesFor(id: string) {
  const f = FILES[id] ?? FILES[DEFAULT_FONT_ID];
  return {
    regular: f.regular,
    medium: f.medium ?? f.regular,
    semibold: f.semibold ?? f.bold,
    bold: f.bold,
  };
}

export function fontStyles(id: string): Record<Weight, TextStyle> {
  const f = filesFor(id);
  return {
    regular: { fontFamily: f.regular[0] },
    medium: { fontFamily: f.medium[0] },
    semibold: { fontFamily: f.semibold[0] },
    bold: { fontFamily: f.bold[0] },
  };
}

function loadFont(id: string): Promise<void> {
  const f = filesFor(id);
  const map: Record<string, number> = {};
  for (const [name, file] of Object.values(f)) map[name] = file;
  return Font.loadAsync(map);
}

/** 고른 글씨체(와 아이콘 글꼴)가 준비되면 true */
export function useFontLoader(id: string): boolean {
  const [ready, setReady] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    Promise.all([Font.loadAsync(Feather.font), loadFont(id)])
      .catch(() => undefined)
      .then(() => alive && setReady(id));
    return () => {
      alive = false;
    };
  }, [id]);
  return ready !== null;
}

/** 설정 화면에서 모든 글씨체를 미리 보여 주기 위해 불러옵니다. */
export function usePreviewFonts(): void {
  useEffect(() => {
    FONT_OPTIONS.forEach((o) => void loadFont(o.id).catch(() => undefined));
  }, []);
}
