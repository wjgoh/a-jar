import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { DAYS, Day, MorningTag, NightTag, SPLIT } from '../data/maya';
import { fmtDur, fmtRange, fmtT, toMin } from '../lib/time';
import { C, jarColor } from '../lib/theme';
import { G, LeafGlyph } from './icons';
import { P } from './P';
import { TimeWheel } from './TimeWheel';
import type { JarStore } from '../state/useJar';

function Shell({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={st.backdrop} onPress={onClose}>
        <Pressable style={st.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={st.grab} />
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function FixSheet({ s }: { s: JarStore }) {
  if (s.sheet !== 'fix') return null;
  return (
    <Shell onClose={() => s.setSheet('none')}>
      <Text style={st.title}>Fix my day</Text>
      <Text style={st.reason}>{s.fix.reason}</Text>
      {/* before → after: the whole pitch in two bars */}
      <View style={st.ba}>
        <View style={st.baRow}>
          <Text style={st.baLabel}>Tue today</Text>
          <View style={st.baTrack}>
            <View
              style={[st.baFill, { width: `${(s.fix.before / 115) * 100}%`, backgroundColor: jarColor(s.fix.before) }]}
            />
          </View>
          <Text style={[st.baPct, { color: jarColor(s.fix.before) }]}>{s.fix.before}%</Text>
        </View>
        <View style={st.baRow}>
          <Text style={st.baLabel}>After fix</Text>
          <View style={st.baTrack}>
            <View
              style={[st.baFill, { width: `${(s.fix.after / 115) * 100}%`, backgroundColor: jarColor(s.fix.after) }]}
            />
          </View>
          <Text style={[st.baPct, { color: jarColor(s.fix.after) }]}>{s.fix.after}%</Text>
        </View>
      </View>
      {s.fix.moves.map((m) => (
        <View key={m.from} style={st.moveRow}>
          <G ch="→" size={14} color={C.green} />
          <Text style={st.moveTx}>
            {m.from} → {m.to}
          </Text>
        </View>
      ))}
      <View style={st.moveRow}>
        <LeafGlyph size={14} />
        <Text style={st.moveTx}>Keep {s.fix.keep[0]}</Text>
      </View>
      <P onPress={s.acceptFix} style={st.primary}>
        <Text style={st.primaryTx}>
          Accept — {s.fix.before}% → {s.fix.after}%
        </Text>
      </P>
      <P onPress={() => s.setSheet('none')} style={st.secondary}>
        <Text style={st.secondaryTx}>Dismiss</Text>
      </P>
    </Shell>
  );
}

export function SplitSheet({ s }: { s: JarStore }) {
  if (s.sheet !== 'split') return null;
  return (
    <Shell onClose={() => s.setSheet('none')}>
      <Text style={st.title}>Split the essay</Text>
      <Text style={st.reason}>2000 words is the Tue spike. Spread it across green days.</Text>
      {SPLIT.map((p) => (
        <View key={p.label} style={st.moveRow}>
          <G ch="◐" size={14} color={C.sub} />
          <Text style={st.moveTx}>
            {p.label} · {p.day} {p.time}
          </Text>
        </View>
      ))}
      <P onPress={s.acceptSplit} style={st.primary}>
        <Text style={st.primaryTx}>Spread it</Text>
      </P>
      <P onPress={() => s.setSheet('none')} style={st.secondary}>
        <Text style={st.secondaryTx}>Keep as one block</Text>
      </P>
    </Shell>
  );
}

export function MoveSheet({ s }: { s: JarStore }) {
  const b = s.detail;
  if (s.sheet !== 'move' || !b) return null;
  return (
    <Shell onClose={s.closeDetail}>
      <MoveForm key={`${b.id}-${b.day}-${b.time}`} s={s} />
    </Shell>
  );
}

function MoveForm({ s }: { s: JarStore }) {
  const b = s.detail!;
  const [day, setDay] = useState<Day>(b.day);
  const startMin = toMin(b.time);
  const h24 = Math.floor(startMin / 60) % 24;
  const [hour, setHour] = useState(h24 % 12 === 0 ? 12 : h24 % 12);
  const [minute, setMinute] = useState(startMin % 60);
  const [suffix, setSuffix] = useState<'am' | 'pm'>(h24 < 12 ? 'am' : 'pm');
  const hh = suffix === 'am' ? hour % 12 : (hour % 12) + 12;
  const time = `${hh}:${minute.toString().padStart(2, '0')}`;
  return (
    <>
      <Text style={st.title}>Move {b.label}</Text>
      <Text style={st.reason}>
        Now {fmtRange(b.time, b.durationMin)} {b.day} · {fmtDur(b.durationMin)} long.
      </Text>
      <View style={st.chips}>
        {DAYS.map((d) => (
          <P key={d} onPress={() => setDay(d)} style={[st.chip, d !== day && st.chipGhost]}>
            <Text style={[st.chipTx, d !== day && { color: C.ink }]}>{d}</Text>
          </P>
        ))}
      </View>
      <TimeWheel
        hour={hour}
        minute={minute}
        suffix={suffix}
        onHour={setHour}
        onMinute={setMinute}
        onSuffix={setSuffix}
      />
      <Text style={st.preview}>
        → {day} {fmtRange(time, b.durationMin)}
      </Text>
      <P
        onPress={() => {
          s.moveBlock(b.id, day, time);
          s.closeDetail();
        }}
        style={st.primary}
      >
        <Text style={st.primaryTx}>
          Move → {day} {fmtT(toMin(time))}
        </Text>
      </P>
      <P onPress={s.closeDetail} style={st.secondary}>
        <Text style={st.secondaryTx}>Keep where it is</Text>
      </P>
    </>
  );
}

const MORNING: MorningTag[] = ['light', 'okay', 'heavy', 'fried'];
const MORNING_WHY = ['exam', 'work', 'no sleep', 'social', 'errands', 'health'];
const NIGHT: NightTag[] = ['drained', 'meh', 'good', 'great'];
const NIGHT_WHY = ['too much', 'bad combo', 'no break', 'hobby helped', 'rested'];

export function LoggerSheet({ s }: { s: JarStore }) {
  const part = s.sheet === 'morning' ? 'morning' : s.sheet === 'night' ? 'night' : null;
  if (!part) return null;
  const tags = part === 'morning' ? MORNING : NIGHT;
  const whys = part === 'morning' ? MORNING_WHY : NIGHT_WHY;
  return (
    <Shell onClose={() => s.setSheet('none')}>
      <Text style={st.title}>{part === 'morning' ? '○ Morning check' : '● Night check'}</Text>
      <Text style={st.reason}>How is Tue feeling? Taps only fill the dot.</Text>
      <View style={st.chips}>
        {tags.map((tag) => (
          <P key={tag} onPress={() => s.setDot(part, tag)} style={st.chip}>
            <Text style={st.chipTx}>{tag}</Text>
          </P>
        ))}
      </View>
      <Text style={st.whyLabel}>why</Text>
      <View style={st.chips}>
        {whys.map((w) => (
          <P key={w} onPress={() => s.setSheet('none')} style={[st.chip, st.chipSoft]}>
            <Text style={st.chipTx}>{w}</Text>
          </P>
        ))}
      </View>
    </Shell>
  );
}

const st = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end', alignItems: 'center' },
  sheet: { backgroundColor: C.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 12, paddingBottom: 40, width: '100%', maxWidth: 430 },
  grab: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.line, alignSelf: 'center', marginBottom: 4 },
  title: { fontSize: 20, fontWeight: '800', color: C.ink },
  reason: { fontSize: 14, color: C.sub, lineHeight: 20 },
  ba: { gap: 8, backgroundColor: '#F4F4F5', borderRadius: 16, padding: 14 },
  baRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  baLabel: { fontSize: 12, fontWeight: '700', color: C.sub, width: 64 },
  baTrack: { flex: 1, height: 10, borderRadius: 5, backgroundColor: '#E4E4E7', overflow: 'hidden' },
  baFill: { height: 10, borderRadius: 5 },
  baPct: { fontSize: 14, fontWeight: '800', width: 44, textAlign: 'right', fontVariant: ['tabular-nums'] },
  moveRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F4F4F5', borderRadius: 12, padding: 12 },
  moveTx: { fontSize: 13, fontWeight: '600', color: C.ink },
  primary: { minHeight: 56, borderRadius: 16, backgroundColor: C.dark, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  primaryTx: { fontSize: 15, fontWeight: '800', color: '#fff' },
  secondary: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  secondaryTx: { fontSize: 14, fontWeight: '700', color: C.sub },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minHeight: 44, paddingHorizontal: 16, justifyContent: 'center', borderRadius: 999, backgroundColor: C.dark },
  chipGhost: { backgroundColor: '#fff', borderWidth: 1, borderColor: C.line },
  preview: { fontSize: 14, fontWeight: '700', color: C.green },
  chipSoft: { backgroundColor: '#3F3F46' },
  chipTx: { fontSize: 13, fontWeight: '700', color: '#fff' },
  whyLabel: { fontSize: 12, color: C.sub, marginTop: 4 },
});
