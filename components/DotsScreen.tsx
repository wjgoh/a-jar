import { StyleSheet, Text, View } from 'react-native';
import { DAYS, DOTS_CAPTION, DOTS_RECEIPT, DotDay } from '../data/maya';
import { C } from '../lib/theme';
import type { JarStore } from '../state/useJar';
import { P } from './P';

function nightFill(night: DotDay['night']): string {
  if (night === 'drained') return C.red;
  if (night === 'meh') return C.orange;
  if (night === 'good' || night === 'great') return C.green;
  return 'transparent';
}

function Dot({ d, size = 32 }: { d: DotDay; size?: number }) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor: d.morning ? C.orange : '#D4D4D8',
          backgroundColor: nightFill(d.night),
        },
      ]}
    />
  );
}

export default function DotsScreen({ s }: { s: JarStore }) {
  return (
    <View style={d.wrap}>
      <Text style={d.title}>Dots</Text>
      <Text style={d.sub}>Proof grid, not streak. Skip = hollow, never shame.</Text>

      {/* live week */}
      <View style={d.card}>
        <Text style={d.cardTitle}>This week</Text>
        {/* legend — the encoding is the whole point, spell it out */}
        <View style={d.legend}>
          <View style={d.legItem}>
            <View style={d.legRing} />
            <Text style={d.legTx}>morning</Text>
          </View>
          <View style={d.legItem}>
            <View style={d.legFill} />
            <Text style={d.legTx}>night</Text>
          </View>
          <View style={d.legItem}>
            <View style={d.legHollow} />
            <Text style={d.legTx}>skipped</Text>
          </View>
        </View>
        <View style={d.weekRow}>
          {s.week.map((dot, i) => (
            <View key={i} style={d.dayCol}>
              <Dot d={dot} />
              <Text style={d.dayTx}>{DAYS[i]}</Text>
            </View>
          ))}
        </View>
        <View style={d.logRow}>
          <P onPress={() => s.setSheet('morning')} style={d.logBtn}>
            <Text style={d.logTx}>○ Log morning</Text>
          </P>
          <P onPress={() => s.setSheet('night')} style={[d.logBtn, d.logDark]}>
            <Text style={[d.logTx, { color: '#fff' }]}>● Log night</Text>
          </P>
        </View>
      </View>

      {/* history */}
      <View style={d.card}>
        <Text style={d.cardTitle}>Last 2 weeks</Text>
        <View style={d.grid}>
          {s.history.map((dot, i) => (
            <Dot key={i} d={dot} size={28} />
          ))}
        </View>
        <Text style={d.caption}>{DOTS_CAPTION}</Text>
        <Text style={d.receipt}>{DOTS_RECEIPT}</Text>
      </View>
      <View style={{ height: 96 }} />
    </View>
  );
}

const d = StyleSheet.create({
  wrap: { gap: 16, paddingBottom: 16 },
  card: { backgroundColor: C.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: C.line, gap: 12 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: C.ink },
  legend: { flexDirection: 'row', gap: 16 },
  legItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legTx: { fontSize: 12, fontWeight: '600', color: C.sub },
  legRing: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: C.orange },
  legFill: { width: 14, height: 14, borderRadius: 7, backgroundColor: C.green },
  legHollow: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#D4D4D8' },
  title: { fontSize: 24, fontWeight: '800', color: C.ink },
  sub: { fontSize: 13, color: C.sub, marginTop: -12 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCol: { alignItems: 'center', gap: 4 },
  dayTx: { fontSize: 10, fontWeight: '700', color: C.sub, letterSpacing: 0.5, textTransform: 'uppercase' },
  logRow: { flexDirection: 'row', gap: 8 },
  logBtn: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: '#fff',
  },
  logDark: { backgroundColor: C.dark, borderColor: C.dark },
  logTx: { fontSize: 14, fontWeight: '700', color: C.ink },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  caption: { fontSize: 13, color: C.ink, fontWeight: '600' },
  receipt: { fontSize: 12, color: C.sub },
});
