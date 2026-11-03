import { Feather } from '@expo/vector-icons';
import { ComponentProps, ReactNode, useState } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TextInputProps,
  TextProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { Weight } from '../fonts';
import { useSettings, useStyles } from '../settings/SettingsContext';
import { ThemeColors } from '../settings/themes';
import { radius, shadow } from '../theme';
import { ListItem, Score } from '../types';
import { formatTime, newId } from '../utils/date';

export type IconName = ComponentProps<typeof Feather>['name'];

/** 앱 전체에서 쓰는 글자. 고른 글씨체와 색이 자동으로 적용됩니다. */
export function T({
  weight = 'regular',
  size = 15,
  color,
  style,
  ...rest
}: TextProps & { weight?: Weight; size?: number; color?: string }) {
  const { c, f, scale } = useSettings();
  const s = Math.round(size * scale);
  return <Text style={[f[weight], { fontSize: s, color: color ?? c.ink, lineHeight: Math.round(s * 1.45) }, style]} {...rest} />;
}

/** 입력칸 글자 스타일 */
export function useInputText(): TextStyle {
  const { c, f, scale } = useSettings();
  return { ...f.regular, fontSize: Math.round(16 * scale), color: c.ink };
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const st = useStyles(makeStyles);
  return <View style={[st.card, style]}>{children}</View>;
}

export function SectionTitle({
  title,
  icon,
  color,
  right,
}: {
  title: string;
  icon?: IconName;
  color?: string;
  right?: ReactNode;
}) {
  const { c } = useSettings();
  return (
    <View style={base.sectionTitle}>
      {icon ? <Feather name={icon} size={16} color={color ?? c.ink} /> : null}
      <T weight="semibold" size={16} style={{ flex: 1 }}>
        {title}
      </T>
      {right}
    </View>
  );
}

export function Field({ style, multiline, ...rest }: TextInputProps) {
  const { c } = useSettings();
  const st = useStyles(makeStyles);
  const text = useInputText();
  return (
    <TextInput
      placeholderTextColor={c.muted}
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
      style={[st.field, text, multiline && { minHeight: 120, paddingTop: 12 }, style]}
      {...rest}
    />
  );
}

/** 탭해서 고르는 작은 알약 모양 버튼 */
export function Chip({
  label,
  selected,
  onPress,
  icon,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
}) {
  const { c } = useSettings();
  const st = useStyles(makeStyles);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={({ pressed }) => [st.chip, selected && st.chipOn, pressed && { opacity: 0.7 }]}
    >
      {icon ? <Feather name={icon} size={13} color={selected ? c.onAccent : c.ink2} /> : null}
      <T size={14} weight={selected ? 'semibold' : 'regular'} color={selected ? c.onAccent : c.ink2}>
        {label}
      </T>
    </Pressable>
  );
}

export function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  const { c } = useSettings();
  return (
    <Switch
      accessibilityLabel={label}
      value={value}
      onValueChange={onChange}
      trackColor={{ false: c.line, true: c.accent }}
      thumbColor="#FFFFFF"
      {...({ activeThumbColor: '#FFFFFF' } as object)}
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
  const { c } = useSettings();
  const st = useStyles(makeStyles);
  return (
    <View style={{ gap: 10 }}>
      <T weight="medium" size={14} color={c.ink2}>
        {label}
      </T>
      <View style={base.scoreRow}>
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
              style={[st.scoreBtn, selected && st.scoreBtnOn]}
            >
              <Text style={[base.scoreFace, value !== null && !selected && { opacity: 0.35 }]}>{face}</Text>
              <T size={11} weight={selected ? 'semibold' : 'regular'} color={selected ? c.ink : c.muted}>
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
  const { c } = useSettings();
  const st = useStyles(makeStyles);
  const text = useInputText();
  const [value, setValue] = useState('');

  const add = () => {
    const t = value.trim();
    if (!t) return;
    onChange([...items, { id: newId(), text: t, createdAt: new Date().toISOString() }]);
    setValue('');
  };

  return (
    <View style={{ gap: 6 }}>
      {title ? (
        <View style={base.listTitle}>
          <View style={[base.dot, { backgroundColor: color }]} />
          <T weight="semibold" size={14}>
            {title}
          </T>
          {items.length > 0 ? (
            <T size={13} color={c.muted}>
              {items.length}
            </T>
          ) : null}
        </View>
      ) : null}

      {items.map((it) => (
        <View key={it.id} style={base.listRow}>
          <View style={[base.bullet, { backgroundColor: color }]} />
          <T size={15} style={{ flex: 1 }}>
            {it.text}
          </T>
          {showTime ? (
            <T size={12} color={c.muted}>
              {formatTime(it.createdAt)}
            </T>
          ) : null}
          <Pressable
            accessibilityLabel={`${it.text} 삭제`}
            hitSlop={10}
            onPress={() => onChange(items.filter((x) => x.id !== it.id))}
          >
            <Feather name="x" size={15} color={c.muted} />
          </Pressable>
        </View>
      ))}

      <View style={st.addRow}>
        <Feather name="plus" size={16} color={c.muted} />
        <TextInput
          value={value}
          onChangeText={setValue}
          onSubmitEditing={add}
          submitBehavior="submit"
          returnKeyType="done"
          placeholder={placeholder}
          placeholderTextColor={c.muted}
          style={[text, base.addInput]}
        />
        {value.trim() ? (
          <Pressable accessibilityLabel="추가" onPress={add} style={[base.addBtn, { backgroundColor: color }]}>
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
  disabled,
}: {
  title: string;
  onPress: () => void;
  icon?: IconName;
  kind?: 'primary' | 'secondary';
  disabled?: boolean;
}) {
  const { c } = useSettings();
  const primary = kind === 'primary';
  const fg = primary ? c.onAccent : c.ink;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        base.btn,
        { backgroundColor: primary ? c.accent : c.fill },
        (pressed || disabled) && { opacity: disabled ? 0.4 : 0.75 },
      ]}
    >
      {icon ? <Feather name={icon} size={16} color={fg} /> : null}
      <T weight="semibold" size={15} color={fg}>
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
  const { c } = useSettings();
  const st = useStyles(makeStyles);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [st.iconBtn, (pressed || disabled) && { opacity: disabled ? 0.3 : 0.6 }]}
    >
      <Feather name={icon} size={20} color={c.ink} />
    </Pressable>
  );
}

// 색과 관계없는 스타일
const base = StyleSheet.create({
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scoreRow: { flexDirection: 'row', gap: 6 },
  scoreFace: { fontSize: 24 },
  listTitle: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4, paddingLeft: 2 },
  bullet: { width: 4, height: 4, borderRadius: 2, opacity: 0.8 },
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
});

// 테마 색을 쓰는 스타일
function makeStyles(c: ThemeColors) {
  return StyleSheet.create({
    card: { backgroundColor: c.surface, borderRadius: radius.lg, padding: 20, gap: 16, ...shadow(c) },
    field: { backgroundColor: c.fill, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12 },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 999,
      backgroundColor: c.fill,
    },
    chipOn: { backgroundColor: c.accent },
    scoreBtn: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 10, borderRadius: radius.md, backgroundColor: c.fill },
    scoreBtnOn: { backgroundColor: c.accentSoft },
    addRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: c.fill,
      borderRadius: radius.sm,
      paddingLeft: 12,
      paddingRight: 6,
      minHeight: 44,
    },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.surface,
      ...shadow(c),
    },
  });
}
