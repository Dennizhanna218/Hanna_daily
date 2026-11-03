// 글씨체 선택지. 실제로 글꼴을 불러오는 코드는 src/fonts.ts(앱) / src/fonts.web.ts(웹)에 있어요.

export interface FontOption {
  id: string;
  name: string;
  desc: string;
  /** 손글씨 글꼴은 작아 보여서 글자 크기를 조금 키웁니다. */
  scale: number;
  /** 웹에서 쓰는 글꼴 이름 */
  webFamily: string;
  /** 웹에서 글꼴을 불러올 주소 (Pretendard는 앱에 들어 있어서 없음) */
  webCss?: string;
}

const g = (family: string) => `https://fonts.googleapis.com/css2?family=${family}&display=swap`;

export const FONT_OPTIONS: FontOption[] = [
  { id: 'pretendard', name: '프리텐다드', desc: '깔끔하고 단정한', scale: 1, webFamily: 'Pretendard' },
  { id: 'gowunDodum', name: '고운돋움', desc: '부드럽고 다정한', scale: 1, webFamily: 'Gowun Dodum', webCss: g('Gowun+Dodum') },
  { id: 'gowunBatang', name: '고운바탕', desc: '일기장 같은 명조', scale: 1, webFamily: 'Gowun Batang', webCss: g('Gowun+Batang:wght@400;700') },
  { id: 'jua', name: '주아', desc: '동글동글 귀여운', scale: 1, webFamily: 'Jua', webCss: g('Jua') },
  { id: 'gaegu', name: '개구', desc: '장난스러운 손글씨', scale: 1.12, webFamily: 'Gaegu', webCss: g('Gaegu:wght@400;700') },
  { id: 'nanumPen', name: '나눔손글씨 펜', desc: '펜으로 쓴 손글씨', scale: 1.3, webFamily: 'Nanum Pen Script', webCss: g('Nanum+Pen+Script') },
];

export const DEFAULT_FONT_ID = 'pretendard';

export function getFontOption(id: string): FontOption {
  return FONT_OPTIONS.find((f) => f.id === id) ?? FONT_OPTIONS[0];
}
