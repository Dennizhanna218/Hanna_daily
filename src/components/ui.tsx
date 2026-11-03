import { Feather } from '@expo/vector-icons';
import { ComponentProps, ReactNode, useState } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { font } from '../fonts';
import { colors, radius, shadow, space } from '../theme';
import { ListItem, Score } from '../types';
import { formatTime, newId } from '../utils/date';

type Weight = keyof typeof font;
export type IconName = ComponentProps<typeof Feather>['name'];

/** 앱 전체에서 쓰는 글자. 글꼴(Pretendard)이 자동으로 적용됩니다. */
export function T({
  weight = 'regular',
  size = 15,
  color = colors.ink,
  style,
  ...rest
}: TextProps & { weight?: Weight; size?: number; color?: string }) {
  return <Text style={[font[weight], { fontSize: size, color, lineHeight: Math.round(size * 1.45) }, style]} {...rest} />;
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({
  title,
  icon,
  color = colors.ink,
  right,
}: {
  title: string;
  icon?: IconName;
  color?: string;
  right?: ReactNode;
}) {
  return (
    <View style={styles.sectionTitle}>
      {icon ? <Feather name={icon} size={16} color={color} /> : null}
      <T weight="semibold" size={16} style={{ flex: 1 }}>
        {title}
      </T>
      {right}
    </View>
  );
}

export const inputText: TextStyle = { ...font.regular, fontSize: 16, color: colors.ink };

export function Field({ style, multiline, ...rest }: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.muted}
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
      style={[styles.field, inputText, multiline && { minHeight: 120, paddingTop: 12 }, style]}
      {...rest}
    />
  );
}

export function ScorePicker({
  label,
  faces,
  names,
  value,
  onChange,
}: {
  label: string;
  faces: string[];
  names: string[];
  value: Score | null;
  onChange: (v: Score | null) => void;
}) {
  return (
    <View style={{ gap: 10 }}>
      <T weight="medium" size={14} color={colors.ink2}>
        {label}
      </T>
      <View style={styles.scoreRow}>
        {faces.map((face, i) => {
          const score = (i + 1) as Score;
          const selected = value === score;
          return (
            <Pressable
              key={score}
              accessibilityRole="button"
              accessibilityLabel={`${label} ${names[i]}`}
              accessibilityState={{ selected }}
              onPress={() => onChange(selected ? null : score)}
              style={[styles.scoreBtn, selected && styles.scoreBtnOn]}
            >
              <Text style={[styles.scoreFace, value !== null && !selected && { opacity: 0.35 }]}>{face}</Text>
              <T size={11} weight={selected ? 'semibold' : 'regular'} color={selected ? colors.ink : colors.muted}>
                {names[i]}
              </T>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** 한 줄씩 적고 엔터를 누르면 목록에 추가되는 입력칸 */
export function QuickList({
  title,
  color,
  placeholder,
  items,
  showTime,
  onChange,
}: {
  title?: string;
  color: string;
  placeholder: string;
  items: ListItem[];
  showTime?: boolean;
  onChange: (items: ListItem[]) => void;
}) {
  const [text, setText] = useState('');

  const add = () => {
    const t = text.trim();
    if (!t) return;
    onChange([...items, { id: newId(), text: t, createdAt: new Date().toISOString() }]);
    setText('');
  };

  return (
    <View style={{ gap: 6 }}>
      {title ? (
        <View style={styles.listTitle}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          <T weight="semibold" size={14}>
            {title}
          </T>
          {items.length > 0 ? (
            <T size={13} color={colors.muted}>
              {items.length}
            </T>
          ) : null}
        </View>
      ) : null}

      {items.map((it) => (
        <View key={it.id} style={styles.listRow}>
          <View style={[styles.bullet, { backgroundColor: color }]} />
          <T size={15} style={{ flex: 1 }}>
            {it.text}
          </T>
          {showTime ? (
            <T size={12} color={colors.muted}>
              {formatTime(it.createdAt)}
            </T>
          ) : null}
          <Pressable
            accessibilityLabel={`${it.text} 삭제`}
            hitSlop={10}
            onPress={() => onChange(items.filter((x) => x.id !== it.id))}
          >
            <Feather name="x" size={15} color={colors.muted} />
          </Pressable>
        </View>
      ))}

      <View style={styles.addRow}>
        <Feather name="plus" size={16} color={colors.muted} />
        <TextInput
          value={text}
          onChangeText={setText}
          onSubmitEditing={add}
          submitBehavior="submit"
          returnKeyType="done"
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          style={[inputText, styles.addInput]}
        />
        {text.trim() ? (
          <Pressable accessibilityLabel="추가" onPress={add} style={[styles.addBtn, { backgroundColor: color }]}>
            <Feather name="arrow-up" size={14} color="#fff" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function Button({
  title,
  onPress,
  icon,
  kind = 'primary',
}: {
  title: string;
  onPress: () => void;
  icon?: IconName;
  kind?: 'primary' | 'secondary';
}) {
  const primary = kind === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: primary ? colors.ink : colors.fill },
        pressed && { opacity: 0.75 },
      ]}
    >
      {icon ? <Feather name={icon} size={16} color={primary ? '#fff' : colors.ink} /> : null}
      <T weight="semibold" size={15} color={primary ? '#fff' : colors.ink}>
        {title}
      </T>
    </Pressable>
  );
}

export function IconButton({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.iconBtn, (pressed || disabled) && { opacity: disabled ? 0.3 : 0.6 }]}
    >
      <Feather name={icon} size={20} color={colors.ink} />
    </Pressable>
  );
}

export const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 20, gap: 16, ...shadow },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  field: {
    backgroundColor: colors.fill,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  scoreRow: { flexDirection: 'row', gap: 6 },
  scoreBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.fill,
  },
  scoreBtnOn: { backgroundColor: colors.accentSoft },
  scoreFace: { fontSize: 24 },
  listTitle: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4, paddingLeft: 2 },
  bullet: { width: 4, height: 4, borderRadius: 2, opacity: 0.8 },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.fill,
    borderRadius: radius.sm,
    paddingLeft: 12,
    paddingRight: 6,
    minHeight: 44,
  },
  addInput: { flex: 1, minWidth: 0, paddingVertical: 10 },
  addBtn: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  btn: {
    flexDirection: 'row',
    gap: 8,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    ...shadow,
  },
});

export { space };
