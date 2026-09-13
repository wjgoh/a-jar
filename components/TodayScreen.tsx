import { StyleSheet, Text, View } from 'react-native';
import { DAYS } from '../data/maya';
import { C } from '../lib/theme';
import { fmtRange, toMin } from '../lib/time';
import type { JarStore } from '../state/useJar';
import { G, JarGlyph } from './icons';
import JarCard from './JarCard';
import { P } from './P';

export default function TodayScreen({ s }: { s: JarStore }) {
  const tueBlocks = s.blocks.filter((b) => b.day === 'Tue').sort((a, b) => toMin(a.time) - toMin(b.time));
  return (
    <View style={t.wrap}>
      {/* header */}
      <View style={t.header}>
        <View style={t.brand}>
          <View style={t.logo}>
            <JarGlyph size={18} />
          </View>
          <View>
            <Text style={t.title}>A Jar</Text>
            <Text style={t.sub}>Maya · exam week + shifts</Text>
          </View>
        </View>
        <P onPress={s.reset} style={t.reset} hitSlop={8}>
          <G ch="↻" size={13} color={C.sub} />
          <Text style={t.resetTx}>reset</Text>
        </P>
      </View>

      {/* urgent banner */}
      {!s.bannerDismissed && !s.fixed && (
        <View style={t.banner}>
          <View style={t.bolt}>
            <G ch="ϟ" size={16} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={t.bannerTx}>Urgent: cover Tue shift</Text>
            <Text style={t.bannerSub}>Tue just got heavier. One fix ready.</Text>
          </View>
          <P onPress={() => s.setSheet('fix')} style={t.fixBtn}>
            <Text style={t.fixBtnTx}>Fix</Text>
          </P>
          <P onPress={() => s.setBannerDismissed(true)} style={t.dismiss} hitSlop={8}>
            <Text style={t.dismissTx}>✕</Text>
          </P>
        </View>
      )}

      {/* hero jar */}
      <JarCard
        value={s.jar.value}
        state={s.jar.state}
        heaviest={s.jar.heaviest}
        why={s.jar.why}
        fixed={s.fixed}
        open={s.breakdownOpen}
        onToggle={() => s.setBreakdownOpen(!s.breakdownOpen)}
      />

      {/* Tue collision preview */}
      <View style={t.card}>
        <View style={t.cardHead}>
          <Text style={t.cardTitle}>Today · Tue</Text>
          <P onPress={() => s.setTab('week')}>
            <Text style={t.link}>Open week →</Text>
          </P>
        </View>
        {tueBlocks.map((b) => (
          <View key={b.id} style={t.miniRow}>
            <View
              style={[
                t.dot,
                { backgroundColor: b.kind === 'locked' ? '#A1A1AA' : b.kind === 'refill' ? C.green : C.ink },
              ]}
            />
            <Text style={t.miniTx}>
              {fmtRange(b.time, b.durationMin)} · {b.label}
            </Text>
          </View>
        ))}
      </View>

      {/* dots preview */}
      <P onPress={() => s.setTab('dots')} style={t.card}>
        <View style={t.cardHead}>
          <Text style={t.cardTitle}>Proof</Text>
          <Text style={t.link}>Dots →</Text>
        </View>
        <View style={t.dotsRow}>
          {s.week.map((d, i) => (
            <View
              key={i}
              style={[
                t.pdot,
                {
                  backgroundColor:
                    d.night === 'drained'
                      ? C.red
                      : d.night === 'meh'
                        ? C.orange
                        : d.night
                          ? C.green
                          : 'transparent',
                  borderColor: d.morning ? C.orange : '#D4D4D8',
                },
              ]}
            />
          ))}
        </View>
        <Text style={t.dotsCap}>{DAYS[1]} {s.week[1].morning ?? '—'} morning{s.week[1].night ? ` · ${s.week[1].night} night` : ''}</Text>
      </P>

      {/* primary CTA */}
      {!s.fixed && (
        <P onPress={() => s.setSheet('fix')} style={t.cta}>
          <JarGlyph size={18} color="#fff" fill={0.55} />
          <View>
            <Text style={t.ctaTx}>Fix my day</Text>
            <Text style={t.ctaSub}>1 suggestion · keeps drawing</Text>
          </View>
        </P>
      )}
    </View>
  );
}

const t = StyleSheet.create({
  wrap: { gap: 16, paddingBottom: 96 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 40, height: 40, borderRadius: 14, backgroundColor: C.dark, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '800', color: C.ink },
  sub: { fontSize: 12, color: C.sub },
  reset: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: '#fff',
  },
  resetTx: { fontSize: 12, fontWeight: '600', color: C.sub },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.dark,
    borderRadius: 20,
    padding: 16,
  },
  bolt: { width: 32, height: 32, borderRadius: 11, backgroundColor: C.red, alignItems: 'center', justifyContent: 'center' },
  bannerTx: { fontSize: 14, fontWeight: '800', color: '#fff' },
  bannerSub: { fontSize: 12, color: '#D4D4D8' },
  fixBtn: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 16, borderRadius: 12, backgroundColor: '#fff' },
  fixBtnTx: { fontSize: 13, fontWeight: '800', color: C.ink },
  dismiss: { minHeight: 44, minWidth: 32, alignItems: 'center', justifyContent: 'center' },
  dismissTx: { fontSize: 13, fontWeight: '700', color: '#71717A' },
  card: { backgroundColor: C.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: C.line, gap: 8 },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '800', color: C.ink },
  link: { fontSize: 13, fontWeight: '700', color: C.sub },
  miniRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  miniTx: { fontSize: 13, color: C.ink },
  dotsRow: { flexDirection: 'row', gap: 8 },
  pdot: { width: 24, height: 24, borderRadius: 12, borderWidth: 2 },
  dotsCap: { fontSize: 12, color: C.sub },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 64,
    borderRadius: 20,
    backgroundColor: C.dark,
  },
  ctaTx: { fontSize: 17, fontWeight: '800', color: '#fff' },
  ctaSub: { fontSize: 12, fontWeight: '600', color: '#D4D4D8' },
});
