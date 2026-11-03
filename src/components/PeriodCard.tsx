import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { FLOW_OPTIONS, PeriodStats, SYMPTOM_GROUPS } from '../health';
import { useSettings, useStyles } from '../settings/SettingsContext';
import { ThemeColors } from '../settings/themes';
import { radius } from '../theme';
import { PeriodLog } from '../types';
import { formatKoreanDate } from '../utils/date';
import { Card, Chip, Field, SectionTitle, T, Toggle } from './ui';

const PERIOD_COLOR = '#E5484D';

export default function PeriodCard({
  period,
  stats,
  onChange,
}: {
  period: PeriodLog;
  stats: PeriodStats;
  onChange: (p: PeriodLog) => void;
}) {
  const { c } = useSettings();
  const st = useStyles(makeStyles);
  const [open, setOpen] = useState(false);

  const toggleSymptom = (s: string) =>
    onChange({
      ...period,
      symptoms: period.symptoms.includes(s) ? period.symptoms.filter((x) => x !== s) : [...period.symptoms, s],
    });

  return (
    <Card>
      <SectionTitle title="생리" icon="droplet" color={PERIOD_COLOR} />

      <View style={st.toggleRow}>
        <View style={{ flex: 1 }}>
          <T size={15} weight="medium">
            오늘 생리 중이에요
          </T>
          {stats.dayOfPeriod ? (
            <T size={13} color={PERIOD_COLOR}>
              {stats.dayOfPeriod}일째
            </T>
          ) : null}
        </View>
        <Toggle
          label="오늘 생리 중"
          value={period.active}
          onChange={(active) => onChange({ ...period, active, flow: active ? period.flow : null })}
        />
      </View>

      {period.active ? (
        <View style={{ gap: 8 }}>
          <T size={13} weight="medium" color={c.muted}>
            양
          </T>
          <View style={st.wrap}>
            {FLOW_OPTIONS.map((o) => (
              <Chip
                key={o.key}
                label={o.label}
                selected={period.flow === o.key}
                onPress={() => onChange({ ...period, flow: period.flow === o.key ? null : o.key })}
              />
            ))}
          </View>
        </View>
      ) : null}

      <View style={{ gap: 8 }}>
        <Pressable accessibilityRole="button" onPress={() => setOpen(!open)} style={st.symptomHeader}>
          <T size={13} weight="medium" color={c.muted} style={{ flex: 1 }}>
            증상 {period.symptoms.length ? `· ${period.symptoms.length}개` : '(생리 전 PMS도 기록할 수 있어요)'}
          </T>
          <T size={13} weight="medium" color={c.accent}>
            {open ? '접기' : '증상 고르기'}
          </T>
          <Feather name={open ? 'chevron-up' : 'chevron-down'} size={15} color={c.accent} />
        </Pressable>

        {!open && period.symptoms.length > 0 ? (
          <View style={st.wrap}>
            {period.symptoms.map((s) => (
              <Chip key={s} label={s} selected onPress={() => toggleSymptom(s)} />
            ))}
          </View>
        ) : null}

        {open
          ? SYMPTOM_GROUPS.map((g) => (
              <View key={g.title} style={{ gap: 6, marginTop: 4 }}>
                <T size={12} weight="semibold" color={c.ink2}>
                  {g.title}
                </T>
                <View style={st.wrap}>
                  {g.items.map((s) => (
                    <Chip key={s} label={s} selected={period.symptoms.includes(s)} onPress={() => toggleSymptom(s)} />
                  ))}
                </View>
              </View>
            ))
          : null}
      </View>

      {period.active || period.symptoms.length > 0 || period.note ? (
        <Field
          placeholder="메모 (예: 진통제 1알, 일찍 잠)"
          value={period.note}
          onChangeText={(note) => onChange({ ...period, note })}
        />
      ) : null}

      {stats.lastStart ? (
        <View style={st.stats}>
          <Stat label="최근 시작" value={formatKoreanDate(stats.lastStart).replace(/ \(.\)/, '')} />
          <Stat label="평균 주기" value={stats.avgCycle ? `${stats.avgCycle}일` : '—'} />
          <Stat
            label={stats.avgCycle ? '다음 예정' : '다음 예정 (28일 기준)'}
            value={
              stats.nextStart
                ? `${formatKoreanDate(stats.nextStart).replace(/ \(.\)/, '')}${
                    stats.dDay !== null && stats.dDay >= 0 ? ` · D-${stats.dDay}` : ''
                  }`
                : '—'
            }
          />
        </View>
      ) : (
        <T size={12} color={c.muted}>
          생리한 날을 기록하면 주기와 다음 예정일을 알려 드려요.
        </T>
      )}
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const { c } = useSettings();
  return (
    <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
      <T size={11} color={c.muted} numberOfLines={1}>
        {label}
      </T>
      <T size={13} weight="semibold" numberOfLines={1}>
        {value}
      </T>
    </View>
  );
}

function makeStyles(c: ThemeColors) {
  return StyleSheet.create({
    toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    symptomHeader: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 2 },
    stats: {
      flexDirection: 'row',
      gap: 10,
      backgroundColor: c.fill,
      borderRadius: radius.md,
      paddingVertical: 12,
      paddingHorizontal: 14,
    },
  });
}
