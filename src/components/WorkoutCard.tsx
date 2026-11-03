import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { MINUTE_PRESETS, WORKOUT_TYPES, workoutEmoji } from '../health';
import { useSettings, useStyles } from '../settings/SettingsContext';
import { ThemeColors } from '../settings/themes';
import { radius } from '../theme';
import { Workout } from '../types';
import { newId } from '../utils/date';
import { Button, Card, Chip, SectionTitle, T, useInputText } from './ui';

export function formatMinutes(m: number): string {
  if (m < 60) return `${m}분`;
  const h = Math.floor(m / 60);
  return m % 60 ? `${h}시간 ${m % 60}분` : `${h}시간`;
}

export default function WorkoutCard({
  workouts,
  onChange,
}: {
  workouts: Workout[];
  onChange: (w: Workout[]) => void;
}) {
  const { c, settings, updateSettings } = useSettings();
  const st = useStyles(makeStyles);
  const text = useInputText();
  const [type, setType] = useState<string | null>(null);
  const [minutes, setMinutes] = useState<number | null>(null);
  const [customMinutes, setCustomMinutes] = useState('');
  const [note, setNote] = useState('');
  const [newType, setNewType] = useState<string | null>(null); // 직접 추가 입력 중

  const types = [...WORKOUT_TYPES.map((t) => t.name), ...settings.customWorkoutTypes];
  const total = workouts.reduce((sum, w) => sum + (w.minutes ?? 0), 0);

  const addCustomType = () => {
    const t = (newType ?? '').trim();
    setNewType(null);
    if (!t) return;
    if (!types.includes(t)) updateSettings({ customWorkoutTypes: [...settings.customWorkoutTypes, t] });
    setType(t);
  };

  const add = () => {
    if (!type) return;
    const m = customMinutes.trim() ? Number(customMinutes.replace(/[^0-9]/g, '')) || null : minutes;
    onChange([...workouts, { id: newId(), type, minutes: m, note: note.trim() }]);
    setType(null);
    setMinutes(null);
    setCustomMinutes('');
    setNote('');
  };

  return (
    <Card>
      <SectionTitle
        title="운동"
        icon="zap"
        right={
          total > 0 ? (
            <T weight="bold" size={16}>
              {formatMinutes(total)}
            </T>
          ) : null
        }
      />

      {workouts.length > 0 ? (
        <View>
          {workouts.map((w) => (
            <View key={w.id} style={st.row}>
              <T size={20}>{workoutEmoji(w.type)}</T>
              <View style={{ flex: 1, minWidth: 0 }}>
                <T size={15} weight="medium">
                  {w.type}
                  {w.minutes ? ` · ${formatMinutes(w.minutes)}` : ''}
                </T>
                {w.note ? (
                  <T size={13} color={c.ink2} numberOfLines={1}>
                    {w.note}
                  </T>
                ) : null}
              </View>
              <Pressable
                accessibilityLabel={`${w.type} 삭제`}
                hitSlop={10}
                onPress={() => onChange(workouts.filter((x) => x.id !== w.id))}
              >
                <Feather name="x" size={15} color={c.muted} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      <View style={{ gap: 10 }}>
        <T size={13} weight="medium" color={c.muted}>
          {workouts.length ? '운동 더 추가하기' : '어떤 운동을 했나요?'}
        </T>
        <View style={st.wrap}>
          {types.map((t) => (
            <Chip
              key={t}
              label={`${workoutEmoji(t)} ${t}`}
              selected={type === t}
              onPress={() => setType(type === t ? null : t)}
            />
          ))}
          {newType === null ? (
            <Chip label="직접 추가" icon="plus" onPress={() => setNewType('')} />
          ) : (
            <View style={st.newType}>
              <TextInput
                autoFocus
                value={newType}
                onChangeText={setNewType}
                onSubmitEditing={addCustomType}
                onBlur={addCustomType}
                placeholder="운동 이름"
                placeholderTextColor={c.muted}
                style={[text, { fontSize: 14, minWidth: 0, flex: 1, paddingVertical: 6 }]}
              />
            </View>
          )}
        </View>

        {type ? (
          <View style={{ gap: 10 }}>
            <View style={st.wrap}>
              {MINUTE_PRESETS.map((m) => (
                <Chip
                  key={m}
                  label={formatMinutes(m)}
                  selected={!customMinutes && minutes === m}
                  onPress={() => {
                    setCustomMinutes('');
                    setMinutes(minutes === m ? null : m);
                  }}
                />
              ))}
              <View style={[st.newType, { width: 92 }]}>
                <TextInput
                  value={customMinutes}
                  onChangeText={setCustomMinutes}
                  keyboardType="number-pad"
                  placeholder="직접(분)"
                  placeholderTextColor={c.muted}
                  style={[text, { fontSize: 14, minWidth: 0, flex: 1, paddingVertical: 6 }]}
                />
              </View>
            </View>
            <View style={st.noteRow}>
              <TextInput
                value={note}
                onChangeText={setNote}
                onSubmitEditing={add}
                placeholder="메모 (예: 5km, 하체 위주)"
                placeholderTextColor={c.muted}
                style={[text, { flex: 1, minWidth: 0, paddingVertical: 10 }]}
              />
            </View>
            <Button title={`${type} 기록하기`} icon="check" onPress={add} />
          </View>
        ) : null}
      </View>
    </Card>
  );
}

function makeStyles(c: ThemeColors) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.line,
    },
    wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    newType: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.fill,
      borderRadius: 999,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: c.accent,
      minWidth: 110,
    },
    noteRow: { backgroundColor: c.fill, borderRadius: radius.sm, paddingHorizontal: 14 },
  });
}
