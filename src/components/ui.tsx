import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { Score } from '../types';
import { colors, radius, space } from '../theme';

export function Card({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <View style={{ gap: 10 }}>{children}</View>
    </View>
  );
}

export function Field({ label, multiline, style, ...rest }: TextInputProps & { label?: string }) {
  return (
    <View style={{ gap: 4 }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.subtext}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[styles.input, multiline && styles.multiline, style]}
        {...rest}
      />
    </View>
  );
}

export function ScorePicker({
  label,
  faces,
  value,
  onChange,
}: {
  label: string;
  faces: string[];
  value: Score | null;
  onChange: (v: Score | null) => void;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.scoreRow}>
        {faces.map((face, i) => {
          const score = (i + 1) as Score;
          const selected = value === score;
          return (
            <Pressable
              key={score}
              accessibilityRole="button"
              accessibilityLabel={`${label} ${score}점`}
              accessibilityState={{ selected }}
              onPress={() => onChange(selected ? null : score)}
              style={[styles.scoreBtn, selected && styles.scoreBtnOn]}
            >
              <Text style={styles.scoreFace}>{face}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function Button({
  title,
  onPress,
  kind = 'primary',
}: {
  title: string;
  onPress: () => void;
  kind?: 'primary' | 'secondary' | 'danger';
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        kind === 'primary' && { backgroundColor: colors.accent },
        kind === 'secondary' && { backgroundColor: colors.accentSoft },
        kind === 'danger' && { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.danger },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Text
        style={[
          styles.btnText,
          kind === 'primary' && { color: '#fff' },
          kind === 'danger' && { color: colors.danger },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius,
    padding: space,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  hint: { fontSize: 13, color: colors.subtext, marginTop: -6 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    backgroundColor: '#FFFCF9',
  },
  multiline: { minHeight: 96 },
  scoreRow: { flexDirection: 'row', gap: 8 },
  scoreBtn: {
    flex: 1,
    aspectRatio: 1,
    maxHeight: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFCF9',
  },
  scoreBtnOn: { borderColor: colors.accent, backgroundColor: colors.accentSoft, borderWidth: 2 },
  scoreFace: { fontSize: 26 },
  btn: { borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center' },
  btnText: { fontSize: 16, fontWeight: '600', color: colors.text },
});
