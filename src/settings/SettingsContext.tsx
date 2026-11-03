// 앱 어디서나 현재 설정(색감·글씨체 등)을 쓸 수 있게 해 주는 곳.
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { TextStyle } from 'react-native';
import { fontStyles, useFontLoader, Weight } from '../fonts';
import { applyChrome } from '../platform/chrome';
import { requestPersistentStorage } from '../platform/persist';
import { defaultSettings, loadSettings, saveSettings, Settings } from '../storage/settings';
import { getFontOption } from './fontOptions';
import { getTheme, ThemeColors } from './themes';

interface Ctx {
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  c: ThemeColors;
  f: Record<Weight, TextStyle>;
  scale: number;
}

const SettingsCtx = createContext<Ctx | null>(null);

export function SettingsProvider({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    loadSettings().then(setSettings);
    requestPersistentStorage();
  }, []);

  const fontId = settings?.fontId ?? defaultSettings().fontId;
  const fontsReady = useFontLoader(fontId);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...(prev ?? defaultSettings()), ...patch };
      void saveSettings(next);
      return next;
    });
  }, []);

  const value = useMemo<Ctx | null>(() => {
    if (!settings) return null;
    return {
      settings,
      updateSettings,
      c: getTheme(settings.themeId).colors,
      f: fontStyles(settings.fontId),
      scale: getFontOption(settings.fontId).scale,
    };
  }, [settings, updateSettings]);

  useEffect(() => {
    if (value) applyChrome(value.c);
  }, [value?.c]);

  if (!value || !fontsReady) return <>{fallback}</>;
  return <SettingsCtx.Provider value={value}>{children}</SettingsCtx.Provider>;
}

export function useSettings(): Ctx {
  const ctx = useContext(SettingsCtx);
  if (!ctx) throw new Error('SettingsProvider 안에서만 쓸 수 있어요');
  return ctx;
}

/** 현재 테마 색으로 스타일을 만들고, 테마가 바뀔 때만 다시 만듭니다. */
export function useStyles<S>(make: (c: ThemeColors) => S): S {
  const { c } = useSettings();
  return useMemo(() => make(c), [c, make]);
}
