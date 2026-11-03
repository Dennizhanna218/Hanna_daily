// 웹: 테마에 맞춰 페이지 배경색과 브라우저 상단 색(theme-color)을 바꿉니다.
import { ThemeColors } from '../settings/themes';

export function applyChrome(c: ThemeColors): void {
  if (typeof document === 'undefined') return;
  document.documentElement.style.backgroundColor = c.bg;
  document.body.style.backgroundColor = c.bg;
  document.documentElement.style.colorScheme = c.dark ? 'dark' : 'light';
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }
  meta.content = c.bg;
}
