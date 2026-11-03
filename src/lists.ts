// 한 줄 목록들의 이름·안내 문구·색. 항목을 추가하거나 이름을 바꿀 땐 여기만 고치면 됩니다.
import { ListKey } from './types';

export interface ListMeta {
  title: string;
  placeholder: string;
  color: string;
  showTime?: boolean;
}

export const LIST_META: Record<ListKey, ListMeta> = {
  moments: { title: '기분 좋은 순간', placeholder: '오늘 웃었던 순간은?', color: '#F2A93B', showTime: true },
  gratitude: { title: '감사한 일', placeholder: '작은 것도 좋아요', color: '#E8684A' },
  wantToDo: { title: '하고 싶은 것', placeholder: '해 보고 싶은 일', color: '#4C7BF3' },
  regrets: { title: '후회되는 것', placeholder: '아쉬웠던 일', color: '#8E7CC3' },
  improve: { title: '개선하고 싶은 것', placeholder: '다음엔 이렇게 해 볼래요', color: '#2BA67A' },
  tomorrow: { title: '내일 할 일', placeholder: '내일 꼭 할 일', color: '#57534E' },
};

/** '돌아보기' 카드에 들어가는 목록 순서 */
export const REFLECTION_KEYS: ListKey[] = ['gratitude', 'wantToDo', 'regrets', 'improve', 'tomorrow'];
